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
const LIVE_PAGE_SIZE = 100;

/** Totals the server adds up for the home pages and My Students */
export interface SessionSummary {
  totals: {
    completed: number;
    missed: number;
    cancelled: number;
    /** Real length of every completed session, in hours */
    hours_completed: number;
    hours_this_month: number;
  };
  /** Completed hours for the last 8 weeks, Monday first, this week last */
  weeks: { start: string; hours: number }[];
  /** Completed hours by course, most first */
  subjects: { course: string; hours: number }[];
  /** A tutor's students only */
  students?: SummaryStudent[];
}

export interface SummaryStudent {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  /** Full course names ("IGCSE - G10 - Math") */
  courses: string[];
  completed: number;
  hours: number;
  next_session_at: string | null;
  last_session_at: string | null;
  /** Full course name of the last completed session */
  last_course: string | null;
}

const browserZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
};

/**
 * The viewer's totals in one small answer (GET /sessions/summary). These used
 * to be added up here from every session, 100 a page: slow for a tutor with
 * thousands, half-counted while loading, and cut at 5,000.
 */
export function useSessionSummary(enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.sessions.all, 'summary'] as const,
    enabled,
    queryFn: async () => {
      const response = await get(`/sessions/summary`, {
        params: { zone: browserZone() },
      });
      return response.data as SessionSummary;
    },
    staleTime: 3 * 60 * 1000,
    refetchInterval: 3 * 60 * 1000,
    refetchIntervalInBackground: false,
  });
}

/**
 * The first 100 sessions, nearest first, kept live (every 30 s) so the
 * schedule, countdowns and Join buttons stay fresh. Totals come from
 * `useSessionSummary`. Same shape as `useSessions`.
 */
export function useSessionHistory() {
  return useSessions(1, LIVE_PAGE_SIZE);
}
