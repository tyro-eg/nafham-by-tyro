import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { get, post } from '../assets/utils/api';
import { queryKeys } from '../lib/queryKeys';
import type { ApiError, GradeSubject, Package } from '../assets/types';

/**
 * Students and parents cannot schedule, cancel or move sessions themselves
 * (only book a free trial). They send a request and the back office does it
 * from the Admin; it closes by itself once done.
 */
export type SessionRequestKind = 'schedule' | 'more_hours' | 'trial' | 'change';
export type SessionRequestStatus = 'pending' | 'handled' | 'declined';

export interface SessionRequest {
  id: number;
  slug: string;
  kind: SessionRequestKind;
  status: SessionRequestStatus;
  hours_requested: number | null;
  preferred_times: string | null;
  note: string | null;
  handled_at: string | null;
  created_at: string;
  updated_at: string;
  tutor: { id: number; first_name: string; last_name: string } | null;
  grade_subject: GradeSubject | null;
  package: Package | null;
}

export interface SessionRequestPayload {
  kind: SessionRequestKind;
  tutor_id?: number | null;
  grade_subject_id?: number | null;
  package_id?: number | null;
  /** The session to cancel or move (kind "change") */
  session_id?: number | null;
  hours_requested?: number | null;
  preferred_times?: string;
  note?: string;
}

interface SessionRequestsResponse {
  data: SessionRequest[];
}

/**
 * The current student's session requests, newest first
 */
export function useSessionRequests(
  status?: SessionRequestStatus,
  enabled = true,
) {
  return useQuery({
    enabled,
    queryKey: queryKeys.sessionRequests.list(status),
    queryFn: async () => {
      const response = await get('/session_requests', {
        params: status ? { status } : {},
      });
      return response.data as SessionRequestsResponse;
    },
    staleTime: 60 * 1000,
  });
}

/**
 * Send a request to support to schedule sessions (or sell more hours)
 */
export function useCreateSessionRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SessionRequestPayload) => {
      const response = await post('/session_requests', {
        session_request: payload,
      });
      return response.data.data as SessionRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.sessionRequests.all,
      });
    },
    onError: (error: ApiError & { response?: { data?: unknown } }) => {
      // Surfaced by the modal; keep the error object intact for it
      console.error('Session request error:', error);
    },
  });
}

/**
 * Pull a readable message out of an API error response
 */
export const sessionRequestErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  const data = (error as { response?: { data?: unknown } })?.response?.data;
  if (data && typeof data === 'object') {
    const errors = (data as { errors?: unknown }).errors;
    if (Array.isArray(errors) && errors.length) return errors.join(', ');
    const message = (data as { error?: unknown }).error;
    if (typeof message === 'string') return message;
  }
  return fallback;
};
