import { useQuery } from '@tanstack/react-query';
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
