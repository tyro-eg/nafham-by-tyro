import { QueryClient, QueryCache } from '@tanstack/react-query';
import { snackActions } from '../assets/utils/toaster';

/**
 * Global TanStack Query client configuration
 *
 * Provides centralized settings for:
 * - Data caching and stale time
 * - Retry logic for failed requests
 * - Error handling for queries and mutations
 * - Refetch behavior
 *
 * @see README.md for detailed configuration documentation
 */
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any) => {
      // Global error handler for queries
      if (error?.response?.status === 401) {
        // Auth errors are handled by axios interceptors (token refresh)
        // Don't log here - if refresh fails, axios interceptor will redirect to login
        return;
      } else if (error?.response?.status !== 404) {
        // Don't show errors for 404s (might be intentional)
        const errorMessage =
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.message ||
          'An error occurred';
        console.error('Query error:', errorMessage);
      }
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - cache cleanup delay (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Allow 401 to retry ONCE so axios interceptor can refresh token
        if (error?.response?.status === 401) {
          return failureCount < 1;
        }
        // Don't retry on other client errors (403, 404)
        if (
          error?.response?.status &&
          [403, 404].includes(error.response.status)
        ) {
          return false;
        }
        // Retry server errors up to 2 times
        return failureCount < 2;
      },
      refetchOnWindowFocus: false, // Don't refetch when tab regains focus
      refetchOnReconnect: true, // Do refetch when internet reconnects
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Allow 401 to retry ONCE so axios interceptor can refresh token
        if (error?.response?.status === 401) {
          return failureCount < 1;
        }
        // Never retry other mutations (might cause duplicate actions)
        return false;
      },
      /**
       * Global fallback error handler for mutations
       * Note: Individual mutations can override this by providing their own onError
       * If a mutation has onError, this global handler will NOT be called for it
       */
      onError: (error: any) => {
        // Don't show error for 401 - axios interceptor handles it
        if (error?.response?.status === 401) {
          return;
        }
        const errorMessage =
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.message ||
          'An error occurred';
        snackActions.error(errorMessage);
      },
    },
  },
});
