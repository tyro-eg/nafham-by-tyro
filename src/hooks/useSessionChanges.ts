import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { get, patch, post } from '../assets/utils/api';
import { queryKeys } from '../lib/queryKeys';
import type { SessionType } from '../assets/types';

/**
 * Cancelling a lesson and moving one by proposal: the family or the tutor
 * cancels with a reason (hours always go back), or proposes up to three
 * new times from the tutor's open slots that the other side accepts. The
 * backend keeps the rules (SessionPolicy, Sessions::Cancel, Reschedules::*);
 * these hooks stay silent and components surface errors.
 */
export const STUDENT_CANCEL_REASONS = [
  'sick',
  'schedule_conflict',
  'travel',
  'exam',
  'other',
] as const;
export const TUTOR_CANCEL_REASONS = [
  'sick',
  'emergency',
  'schedule_conflict',
  'connectivity',
  'other',
] as const;
export type CancelReason =
  | (typeof STUDENT_CANCEL_REASONS)[number]
  | (typeof TUTOR_CANCEL_REASONS)[number];

/** At most this many times in one proposal (RescheduleRequest::MAX_OPTIONS) */
export const MAX_MOVE_OPTIONS = 3;

/** A window the lesson could move to (GET /sessions/:id/move_options) */
export interface MoveOption {
  start_time: string;
  end_time: string;
  /** Kept for this student by a slot hold */
  held_for_you: boolean;
}

export interface TimeWindow {
  start_time: string;
  end_time: string;
}

export type RescheduleRequestStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'expired'
  | 'withdrawn';
export type ProposerRole = 'student' | 'tutor';
export type RequestBox = 'inbox' | 'sent';
export type RequestTab = 'pending' | 'answered';

/** A proposal to move a lesson, as either side sees it (RescheduleRequestBlueprint) */
export interface RescheduleRequest {
  id: number;
  slug: string;
  status: RescheduleRequestStatus;
  proposer_role: ProposerRole;
  options: TimeWindow[];
  original_start_time: string;
  original_end_time: string;
  chosen_start_time?: string | null;
  chosen_end_time?: string | null;
  note?: string | null;
  decline_reason?: string | null;
  expires_at: string;
  responded_at?: string | null;
  created_at: string;
  answerable: boolean;
  proposed_by: { id: number; first_name: string; type: string };
  /** The viewer's side proposed it */
  mine: boolean;
  can_answer: boolean;
  can_withdraw: boolean;
  session: SessionType;
}

/** The backend's refusal, as a sentence; `fallback` otherwise */
export const changeErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  const data = (error as { response?: { data?: unknown } })?.response?.data;
  if (data && typeof data === 'object') {
    const errors = (data as { errors?: unknown }).errors;
    if (Array.isArray(errors) && errors.length) return errors.join(' ');
    const message = (data as { error?: unknown }).error;
    if (typeof message === 'string') return message;
  }
  return fallback;
};

/** The times still open after a refused acceptance (code option_taken) */
export const remainingOptions = (error: unknown): TimeWindow[] | null => {
  const data = (error as { response?: { data?: unknown } })?.response?.data as
    | { code?: string; details?: { options?: TimeWindow[] } }
    | undefined;
  if (data?.code === 'option_taken') return data.details?.options ?? [];
  return null;
};

const invalidateSessions = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.packages.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.rescheduleRequests.all });
};

/** PATCH /sessions/:id/cancel: the family or the tutor cancels a scheduled lesson */
export function useCancelSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      sessionId: number;
      reason: CancelReason;
      note?: string;
    }) => {
      const response = await patch(`/sessions/${input.sessionId}/cancel`, {
        reason: input.reason,
        note: input.note?.trim() || undefined,
      });
      return response.data.data as SessionType;
    },
    onSuccess: () => invalidateSessions(queryClient),
  });
}

/** The times a lesson could move to, soonest first */
export function useMoveOptions(sessionId: number | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.sessions.moveOptions(sessionId ?? 0),
    queryFn: async () => {
      const response = await get(`/sessions/${sessionId}/move_options`);
      return (response.data.data || []) as MoveOption[];
    },
    enabled: enabled && !!sessionId,
    staleTime: 30 * 1000,
  });
}

/** POST /sessions/:id/reschedule_requests: propose up to three new times */
export function useProposeMove() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      sessionId: number;
      options: TimeWindow[];
      note?: string;
    }) => {
      const response = await post(
        `/sessions/${input.sessionId}/reschedule_requests`,
        { options: input.options, note: input.note?.trim() || undefined },
      );
      return response.data.data as RescheduleRequest;
    },
    onSuccess: () => invalidateSessions(queryClient),
  });
}

/** The proposals to answer (inbox) or the ones this side made (sent) */
export function useRescheduleRequests(
  box: RequestBox,
  tab: RequestTab,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.rescheduleRequests.list(box, tab),
    queryFn: async () => {
      const response = await get('/reschedule_requests', {
        params: { box, status: tab, per_page: 50 },
      });
      return (response.data.data || []) as RescheduleRequest[];
    },
    enabled,
    refetchInterval: 60 * 1000,
    refetchIntervalInBackground: false,
  });
}

/** Accept one of the proposed times, or decline the proposal */
export function useAnswerMove() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      input:
        | { requestId: number; answer: 'accept'; startTime: string }
        | { requestId: number; answer: 'decline'; reason?: string },
    ) => {
      const response =
        input.answer === 'accept'
          ? await patch(`/reschedule_requests/${input.requestId}/accept`, {
              start_time: input.startTime,
            })
          : await patch(`/reschedule_requests/${input.requestId}/decline`, {
              reason: input.reason?.trim() || undefined,
            });
      return response.data.data as RescheduleRequest;
    },
    onSuccess: () => invalidateSessions(queryClient),
    // A taken time leaves the proposal open on the rest: re-read it
    onError: () => invalidateSessions(queryClient),
  });
}

/** The proposer takes the proposal back */
export function useWithdrawMove() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: number) => {
      const response = await patch(
        `/reschedule_requests/${requestId}/withdraw`,
        {},
      );
      return response.data.data as RescheduleRequest;
    },
    onSuccess: () => invalidateSessions(queryClient),
  });
}
