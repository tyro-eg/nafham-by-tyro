import { useMemo } from 'react';
import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { get, post } from '../assets/utils/api';
import { queryKeys, SessionFilters } from '../lib/queryKeys';
import { SessionType } from '../assets/types';

/**
 * Trial session booking data (POST /sessions/trial). The backend decides the
 * length; the student picks the start of an open slot and may leave a
 * parent's phone number.
 */
export interface TrialSessionData {
  tutor_id: number;
  start_time: string;
  grade_subject_id: number;
  guardian_phone?: string;
  /** The exam board the student sits, when the course's tutors declare boards */
  exam_board_id?: number;
}

/** How often session lists re-read the server while the tab is visible */
export const LIVE_REFRESH_MS = 30_000;

/**
 * Fetch paginated sessions
 */
export function useSessions(
  pageNumber: number = 1,
  pageSize: number = 10,
  filters?: SessionFilters,
) {
  return useQuery({
    queryKey: queryKeys.sessions.list({ pageNumber, pageSize, ...filters }),
    queryFn: async () => {
      const params: Record<string, any> = {
        per_page: pageSize,
        page: pageNumber,
      };

      // Add filters if provided
      if (filters?.status && filters.status !== 'all') {
        params.status = filters.status;
      }
      if (filters?.tutor_id) {
        params.tutor_id = filters.tutor_id;
      }
      if (filters?.grade_subject_id) {
        params.grade_subject_id = filters.grade_subject_id;
      }

      const response = await get(`/sessions`, { params });
      return {
        data: (response.data.data || response.data) as SessionType[],
        pagination: response.headers,
      };
    },
    // Sessions open, close and get their meeting link on the server's clock
    refetchInterval: LIVE_REFRESH_MS,
    refetchIntervalInBackground: false,
  });
}

/**
 * Infinite scroll sessions with filters
 *
 * @param pageSize - Number of items per page
 * @param filters - Optional filters (status, tutor_id)
 */
export function useInfiniteSessions(
  pageSize: number = 10,
  filters?: SessionFilters,
) {
  return useInfiniteQuery({
    queryKey: queryKeys.sessions.infinite(filters),
    queryFn: async ({ pageParam = 1 }) => {
      const params: Record<string, any> = {
        per_page: pageSize,
        page: pageParam,
      };

      // Add filters if provided
      if (filters?.status && filters.status !== 'all') {
        params.status = filters.status;
      }
      if (filters?.tutor_id) {
        params.tutor_id = filters.tutor_id;
      }
      if (filters?.grade_subject_id) {
        params.grade_subject_id = filters.grade_subject_id;
      }

      const response = await get(`/sessions`, { params });
      return {
        data: (response.data.data || response.data) as SessionType[],
        pagination: response.headers,
        currentPage: pageParam,
      };
    },
    getNextPageParam: (lastPage) => {
      const currentPage = Number(lastPage.pagination['current-page']);
      const totalPages = Number(lastPage.pagination['total-pages']);

      // If current page is less than total pages, fetch next page
      const hasMore = currentPage < totalPages;
      return hasMore ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    refetchInterval: LIVE_REFRESH_MS,
    refetchIntervalInBackground: false,
  });
}

// Families cannot cancel, move or end sessions, nor book paid ones: they
// send a session request (useSessionRequests) and the back office does it.
// The old calls here (/sessions/:id/cancel, /sessions/:id/end and
// /sessions/private) had no server action behind them (removed 19 Nov 2026).

/**
 * Book a free trial. Students book these themselves; the caller shows the
 * backend's reasons when the booking is refused (bookingErrorMessage).
 */
export function useBookTrialSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionData: TrialSessionData) => {
      const response = await post(`/sessions/trial`, {
        trial_session: sessionData,
      });
      return response.data.data as SessionType;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
      // The slot is now reserved, and the tutor's free trial is claimed
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.instructors.all });
    },
  });
}

/**
 * The reasons a booking was refused, as the backend states them
 */
export const bookingErrorMessage = (
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
/** The server hands out at most 100 rows a page */
const ALL_PAGE_SIZE = 100;
/** Safety stop: 50 pages is 5,000 sessions */
const ALL_MAX_PAGES = 50;

/**
 * Every session of the viewer, all pages. Totals (completed, hours per week,
 * each student's sessions, a month's pay) used to be worked out from the first
 * 100 only: a tutor with 600 completed sessions read "0 completed".
 * Re-read every few minutes; the live first page comes from `useSessionHistory`.
 */
export function useAllSessions(enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.sessions.all, 'all-pages'] as const,
    enabled,
    queryFn: async () => {
      const rows: SessionType[] = [];
      for (let page = 1; page <= ALL_MAX_PAGES; page += 1) {
        const response = await get(`/sessions`, {
          params: { per_page: ALL_PAGE_SIZE, page },
        });
        rows.push(...((response.data.data || response.data) as SessionType[]));
        const totalPages = Number(response.headers?.['total-pages']) || 1;
        if (page >= totalPages) break;
      }
      return rows;
    },
    staleTime: 3 * 60 * 1000,
    refetchInterval: 3 * 60 * 1000,
    refetchIntervalInBackground: false,
  });
}

/**
 * All sessions for totals, with the first page kept live (every 30 s) so the
 * schedule, countdowns and Join buttons stay fresh. Same shape as
 * `useSessions`: `{ data: { data: SessionType[] }, isLoading }`.
 */
export function useSessionHistory() {
  const live = useSessions(1, ALL_PAGE_SIZE);
  const all = useAllSessions();
  const data = useMemo(() => {
    if (!live.data && !all.data) return undefined;
    const byId = new Map<number, SessionType>();
    (all.data ?? []).forEach((s) => byId.set(s.id, s));
    (live.data?.data ?? []).forEach((s) => byId.set(s.id, s));
    return { data: [...byId.values()] };
  }, [live.data, all.data]);
  return {
    data,
    isLoading: live.isLoading,
    /** True until every page has arrived (totals may still grow) */
    isFetchingAll: all.isLoading,
    isError: live.isError,
  };
}
