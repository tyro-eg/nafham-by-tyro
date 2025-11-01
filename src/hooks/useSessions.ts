import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { get, post } from '../assets/utils/api';
import { queryKeys } from '../lib/queryKeys';
import { SessionType } from '../assets/types';
import { snackActions } from '../assets/utils/toaster';

export interface TrialSessionData {
  tutor_id: number;
  start_time: string;
  grade_subject_id: number;
}

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
 * Infinite scroll sessions
 */
export function useInfiniteSessions(pageSize: number = 10) {
  return useInfiniteQuery({
    queryKey: queryKeys.sessions.infinite(),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await get(`/sessions`, {
        params: {
          per_page: pageSize,
          page: pageParam,
        },
      });
      return {
        data: (response.data.data || response.data) as SessionType[],
        pagination: response.headers,
        nextPage: pageParam + 1,
      };
    },
    getNextPageParam: (lastPage) => {
      const totalCount = Number(lastPage.pagination['total-count']);
      const currentCount = lastPage.data.length;
      const hasMore = currentCount < totalCount;
      return hasMore ? lastPage.nextPage : undefined;
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
    onError: (error: any) => {
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
    onError: (error: any) => {
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
    onError: (error: any) => {
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
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Failed to book private session';
      snackActions.error(errorMessage);
    },
  });
}
