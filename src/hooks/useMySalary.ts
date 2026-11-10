import { useQuery } from '@tanstack/react-query';
import { get } from '../assets/utils/api';
import { queryKeys } from '../lib/queryKeys';
import type { MySalaryResponse } from '../modules/my-salary/my-salary.utils';

/**
 * The signed-in tutor's earnings for one Cairo calendar month (GET /my_salary),
 * worked out by the backend with the same calculation as the admin's salaries page.
 *
 * @param month - "YYYY-MM"
 */
export const useMySalary = (month: string) =>
  useQuery({
    queryKey: queryKeys.mySalary.month(month),
    queryFn: async () => {
      const response = await get('/my_salary', { params: { month } });
      return (response.data as { data: MySalaryResponse }).data;
    },
    staleTime: 60 * 1000,
  });
