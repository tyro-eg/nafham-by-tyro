import { useQuery } from '@tanstack/react-query';
import { get } from '../assets/utils/api';
import { queryKeys } from '../lib/queryKeys';
import { GradeSubject } from '../assets/types';

/**
 * Fetch list of grade subjects (courses)
 * Used for filtering sessions by course name
 */
export function useGradeSubjects() {
  return useQuery({
    queryKey: queryKeys.gradeSubjects.all,
    queryFn: async () => {
      const response = await get(`/grade_subjects`);
      return {
        data: (response.data.data || response.data) as GradeSubject[],
      };
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - courses don't change often
  });
}
