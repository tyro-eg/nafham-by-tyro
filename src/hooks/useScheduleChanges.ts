import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { get, patch, post } from '../assets/utils/api';
import { queryKeys } from '../lib/queryKeys';
import type { Package } from '../assets/types';
import type { WeeklyEntry } from './useFreezes';
import type { ProposerRole, RequestBox, RequestTab } from './useSessionChanges';

/**
 * Changing a package's weekly times by proposal: one side picks new weekly
 * times from the tutor's recurring openings, the other approves, and the
 * future lessons are rebooked on the new pattern (ScheduleChangeRequest,
 * ScheduleChanges::*). Hooks stay silent; components surface errors.
 */
export const MAX_WEEKLY_ENTRIES = 3;

/** A weekly time the tutor is open for (GET /tutors/:id/weekly_openings) */
export interface WeeklyOpening extends WeeklyEntry {
  open_weeks: number;
  published_weeks: number;
  held_for_student: boolean;
}

export type ScheduleChangeStatus =
  | 'pending'
  | 'approved'
  | 'declined'
  | 'expired'
  | 'withdrawn';

export interface ScheduleChangeRequest {
  id: number;
  slug: string;
  status: ScheduleChangeStatus;
  proposer_role: ProposerRole;
  pattern: WeeklyEntry[];
  previous_pattern: WeeklyEntry[];
  effective_from: string;
  time_zone?: string | null;
  note?: string | null;
  decline_reason?: string | null;
  expires_at: string;
  responded_at?: string | null;
  booked_session_ids: number[];
  cancelled_session_ids: number[];
  conflicts_count: number;
  created_at: string;
  answerable: boolean;
  proposed_by: { id: number; first_name: string; type: string };
  mine: boolean;
  can_answer: boolean;
  can_withdraw: boolean;
  package: Package;
}

const invalidate = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.packages.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.scheduleChanges.all });
};

export function useWeeklyOpenings(
  tutorId: number | undefined,
  durationMinutes: number,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.tutors.weeklyOpenings(tutorId ?? 0, durationMinutes),
    queryFn: async () => {
      const response = await get(`/tutors/${tutorId}/weekly_openings`, {
        params: { duration_minutes: durationMinutes },
      });
      return (response.data.data || []) as WeeklyOpening[];
    },
    enabled: enabled && !!tutorId && durationMinutes > 0,
    staleTime: 60 * 1000,
  });
}

/** POST /packages/:id/schedule_change_requests */
export function useProposeScheduleChange() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      packageId: number;
      pattern: WeeklyEntry[];
      effective_from: string;
      time_zone: string;
      note?: string;
    }) => {
      const response = await post(
        `/packages/${input.packageId}/schedule_change_requests`,
        {
          pattern: input.pattern,
          effective_from: input.effective_from,
          time_zone: input.time_zone,
          note: input.note?.trim() || undefined,
        },
      );
      return response.data.data as ScheduleChangeRequest;
    },
    onSuccess: () => invalidate(queryClient),
  });
}

export function useScheduleChangeRequests(
  box: RequestBox,
  tab: RequestTab,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.scheduleChanges.list(box, tab),
    queryFn: async () => {
      const response = await get('/schedule_change_requests', {
        params: { box, status: tab, per_page: 50 },
      });
      return (response.data.data || []) as ScheduleChangeRequest[];
    },
    enabled,
    refetchInterval: 60 * 1000,
    refetchIntervalInBackground: false,
  });
}

/** Approve the new weekly times (the lessons move), or decline them */
export function useAnswerScheduleChange() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      requestId: number;
      answer: 'approve' | 'decline';
      reason?: string;
    }) => {
      const response =
        input.answer === 'approve'
          ? await patch(
              `/schedule_change_requests/${input.requestId}/approve`,
              {},
            )
          : await patch(
              `/schedule_change_requests/${input.requestId}/decline`,
              { reason: input.reason?.trim() || undefined },
            );
      return response.data.data as ScheduleChangeRequest;
    },
    onSuccess: () => invalidate(queryClient),
  });
}

export function useWithdrawScheduleChange() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: number) => {
      const response = await patch(
        `/schedule_change_requests/${requestId}/withdraw`,
        {},
      );
      return response.data.data as ScheduleChangeRequest;
    },
    onSuccess: () => invalidate(queryClient),
  });
}

/** The weekday names of a fixed week, Sunday first, in the UI language */
const WEEK_BASE = Date.UTC(2026, 10, 1); // a Sunday at midnight UTC, as the entries are stored

/** "Mon 7:00 PM" for a weekly entry, shown in the viewer's own time zone */
export const weeklyEntryLabel = (
  entry: WeeklyEntry,
  locale: string,
  long = false,
) => {
  const date = new Date(
    WEEK_BASE + entry.wday * 86_400_000 + entry.minute_of_day * 60_000,
  );
  const day = date.toLocaleDateString(locale, {
    weekday: long ? 'long' : 'short',
  });
  const time = date.toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${day} ${time}`;
};

/** "Mon 7:00 PM & Wed 7:00 PM (60 min)" */
export const weeklyPatternLabel = (
  pattern: WeeklyEntry[],
  locale: string,
  minutesLabel: (minutes: number) => string,
) => {
  if (!pattern.length) return '';
  const times = pattern.map((entry) => weeklyEntryLabel(entry, locale));
  const lengths = Array.from(new Set(pattern.map((e) => e.duration_minutes)));
  const suffix = lengths.length === 1 ? ` (${minutesLabel(lengths[0])})` : '';
  return `${times.join(' · ')}${suffix}`;
};

/** Weekly hours of a pattern, as the backend counts them (each lesson rounded up) */
export const weeklyHoursOf = (pattern: WeeklyEntry[]) =>
  pattern.reduce((sum, e) => sum + Math.ceil(e.duration_minutes / 60), 0);
