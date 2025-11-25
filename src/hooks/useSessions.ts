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
 * Trial session booking data
 */
export interface TrialSessionData {
  tutor_id: number;
  start_time: string;
  grade_subject_id: number;
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

/**
 * Fetch paginated sessions
 */
export function useSessions(pageNumber: number = 1, pageSize: number = 10) {
  return useQuery({
    queryKey: queryKeys.sessions.list({ pageNumber, pageSize }),
    queryFn: async () => {
      const response = await get(`/sessions`, {
        params: {
          per_page: pageSize,
          page: pageNumber,
        },
      });
      return {
        data: (response.data.data || response.data) as SessionType[],
        pagination: response.headers,
      };
    },
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
 * Book a trial session
 */
export function useBookTrialSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionData: TrialSessionData) => {
      await post(`/sessions/trial`, { trial_session: sessionData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.sessions.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.calendar.all,
      });
      snackActions.success('Trial session booked successfully');
    },
    onError: (error: ApiError) => {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Failed to book trial session';
      snackActions.error(errorMessage);
    },
  });
}

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
