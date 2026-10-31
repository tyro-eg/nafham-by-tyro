import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { get, post } from '../assets/utils/api';
import { queryKeys, SessionFilters } from '../lib/queryKeys';
import { SessionType, ApiError } from '../assets/types';
import { snackActions } from '../assets/utils/toaster';

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

/**
 * Private session booking data
 */
export interface PrivateSessionData {
  tutor_id: number;
  start_time: string;
  grade_subject_id: number;
  package_id: number;
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

/**
 * Cancel a session
 */
export function useCancelSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: number) => {
      await get(`/sessions/${sessionId}/cancel`);
    },
    onSuccess: () => {
      // Invalidate all session queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.sessions.all,
      });
      // Also invalidate calendar since sessions affect availability
      queryClient.invalidateQueries({
        queryKey: queryKeys.calendar.all,
      });
      snackActions.success('Session cancelled successfully');
    },
    onError: (error: ApiError) => {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Failed to cancel session';
      snackActions.error(errorMessage);
    },
  });
}

/**
 * End a session
 */
export function useEndSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: number) => {
      await get(`/sessions/${sessionId}/end`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.sessions.all,
      });
      snackActions.success('Session ended successfully');
    },
    onError: (error: ApiError) => {
      const errorMessage =
        error.response?.data?.error || error.message || 'Failed to end session';
      snackActions.error(errorMessage);
    },
  });
}

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

/**
 * Book a private session
 */
export function useBookPrivateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionData: PrivateSessionData) => {
      await post(`/sessions/private`, { private_session: sessionData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.sessions.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.calendar.all,
      });
      snackActions.success('Private session booked successfully');
    },
    onError: (error: ApiError) => {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Failed to book private session';
      snackActions.error(errorMessage);
    },
  });
}
