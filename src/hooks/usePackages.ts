import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { get } from '../assets/utils/api';
import { queryKeys } from '../lib/queryKeys';
import type { Package } from '../assets/types';

interface PackagesResponse {
  data: Package[];
}

/**
 * Fetch packages with pagination
 *
 * Retrieves packages (student-instructor session packages) from the backend.
 * Used to display unscheduled sessions that need to be scheduled.
 *
 * @param pageNumber - Page number to fetch (default: 1)
 * @param pageSize - Number of items per page (default: 20)
 * @returns Query result with packages data
 *
 * @example
 * const { data: packages, isLoading } = usePackages(1, 20);
 */
export const usePackages = (pageNumber: number = 1, pageSize: number = 20) => {
  return useQuery({
    queryKey: queryKeys.packages.list({ pageNumber, pageSize }),
    queryFn: async () => {
      const response = await get('/packages', {
        params: {
          per_page: pageSize,
          page: pageNumber,
        },
      });
      return response.data as PackagesResponse;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Infinite scroll packages with pagination
 *
 * Fetches packages with infinite scroll support for the packages list page.
 *
 * @param pageSize - Number of items per page (default: 10)
 * @returns Infinite query result with packages data
 *
 * @example
 * const { data, fetchNextPage, hasNextPage } = useInfinitePackages(10);
 */
export function useInfinitePackages(pageSize: number = 10) {
  return useInfiniteQuery({
    queryKey: queryKeys.packages.infinite({ pageSize }),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await get('/packages', {
        params: {
          per_page: pageSize,
          page: pageParam,
        },
      });
      return {
        data: (response.data.data || response.data) as Package[],
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
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
