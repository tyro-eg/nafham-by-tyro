import { useQuery } from '@tanstack/react-query';
import { get } from '../assets/utils/api';
import type { FreeTrial, GradeSubject, Instructor } from '../assets/types';

/**
 * The free-trial wizard reads two public endpoints, so a visitor can plan
 * their trial before creating an account: the courses open for trials and
 * the tutors who can give one in the student's dates and time window.
 */

export interface TrialSlot {
  id: number;
  start_time: string;
  end_time: string;
}

export interface TrialTutor {
  id: number;
  first_name: string;
  last_name: string;
  avatar?: string | null;
  bio?: string | null;
  video_url?: string | null;
  recommended: boolean;
  /** Ops' rating of the tutor for this course, 1 to 5, null when unrated */
  ops_rating: number | null;
  /** Open slots a whole trial can start on, soonest first */
  slots: TrialSlot[];
}

export interface TrialSearch {
  grade_subject_id: number;
  from: string;
  to: string;
  start_hour: number;
  end_hour: number;
  time_zone: string;
}

export const trialKeys = {
  all: ['trial'] as const,
  courses: () => [...trialKeys.all, 'courses'] as const,
  tutors: (search: TrialSearch | null) =>
    [...trialKeys.all, 'tutors', search] as const,
  eligibility: (gradeSubjectId?: number) =>
    [...trialKeys.all, 'eligibility', gradeSubjectId] as const,
};

/** Courses at least one active tutor teaches, with curriculum, stage, subject and variants */
export function useTrialCourses() {
  return useQuery({
    queryKey: trialKeys.courses(),
    queryFn: async () => {
      const response = await get('/public/courses');
      return (response.data.data || []) as GradeSubject[];
    },
    staleTime: 30 * 60 * 1000,
  });
}

/** Tutors for the course with the slots a trial can start on, best first */
export function useTrialTutors(search: TrialSearch | null) {
  return useQuery({
    queryKey: trialKeys.tutors(search),
    queryFn: async () => {
      const response = await get('/public/trial_tutors', {
        params: search ?? {},
      });
      return (response.data.data || []) as TrialTutor[];
    },
    enabled: !!search,
    staleTime: 60 * 1000,
  });
}

/**
 * For a signed-in student: which tutors still offer them a free trial
 * (one trial per tutor, none with a tutor they already learn with).
 */
export function useTrialEligibility(
  gradeSubjectId: number | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: trialKeys.eligibility(gradeSubjectId),
    queryFn: async () => {
      const response = await get('/tutors', {
        params: { grade_subject_id: gradeSubjectId, per_page: 100, page: 1 },
      });
      const map: Record<number, FreeTrial | undefined> = {};
      ((response.data.data || []) as Instructor[]).forEach((tutor) => {
        map[tutor.id] = tutor.free_trial;
      });
      return map;
    },
    enabled: enabled && !!gradeSubjectId,
    staleTime: 60 * 1000,
  });
}
