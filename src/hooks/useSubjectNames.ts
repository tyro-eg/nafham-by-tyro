import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { get } from '../assets/utils/api';
import i18n from '../component/i18next/i18n';
import { setSubjectNames } from '../lib/subject-names';

/**
 * Loads the subjects' Arabic names once (23 Nov 2026). Pages read them
 * through courseLabel/subjectName; when they arrive while Arabic is on, the
 * language is set again so what is already on screen reads in Arabic.
 */
export function useSubjectNames() {
  const query = useQuery({
    queryKey: ['subjects', 'names'],
    queryFn: async () =>
      ((await get('/subjects/names')).data?.data ?? {}) as Record<
        string,
        string
      >,
    staleTime: Infinity,
    retry: 1,
  });

  useEffect(() => {
    if (!query.data) return;
    setSubjectNames(query.data);
    if (i18n.language === 'ar') i18n.changeLanguage('ar');
  }, [query.data]);
}
