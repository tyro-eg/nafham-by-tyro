import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { get, patch, post } from '../assets/utils/api';
import { queryKeys } from '../lib/queryKeys';
import type { Assignment } from './useAssignments';

/**
 * The AI Teaching Assistant, for tutors: per student and course, a learner
 * insight, lesson plans with slides, homework ideas, and a coaching report
 * for the tutor. Everything is built by the backend from recorded lessons.
 * Hooks stay silent; components surface errors.
 */
export type ReadyStatus = 'none' | 'ready' | 'stale';
export type PlanStatus = 'none' | 'draft' | 'accepted';

export interface CoachPerson {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  avatar?: string | null;
}

export interface CoachCourse {
  id: number;
  full_course_name: string;
}

export interface CoachSessionRef {
  id: number;
  slug?: string;
  start_time: string;
  end_time: string;
  status?: string;
}

export interface CoachStudentRow {
  student: CoachPerson;
  grade_subject: CoachCourse;
  lessons_recorded: number;
  last_lesson_at: string | null;
  insight_status: ReadyStatus;
  plan_status: PlanStatus;
  homework_status: ReadyStatus;
  next_session: CoachSessionRef | null;
}

export interface DeliveryFeedback {
  tutor_speaker: string | null;
  talk_ratio_tutor: number | null;
  checks_for_understanding: number | null;
  longest_monologue_minutes: number | null;
  strengths: string[];
  suggestions: string[];
}

export interface SessionNote {
  id: number;
  session_id: number;
  summary: string | null;
  covered: string[];
  struggles: string[];
  next_steps: string[];
  delivery: DeliveryFeedback;
  language: string | null;
  source: 'ai' | 'tutor';
  edited_at: string | null;
  created_at: string;
  session: CoachSessionRef;
  ai_run: { id: number; model: string; created_at: string } | null;
}

export interface InsightEvidence {
  kind: 'note' | 'assignment';
  id: number;
  quote: string;
}

export interface LearnerInsight {
  id: number;
  student_id: number;
  grade_subject_id: number;
  summary: string | null;
  strengths: string[];
  weaknesses: string[];
  focus_next: string[];
  evidence: InsightEvidence[];
  language: string | null;
  lessons_count: number;
  assignments_count: number;
  stale: boolean;
  /** A rebuild is on its way: the backend queued one when this stale insight was read */
  refreshing: boolean;
  generated_at: string | null;
  status: ReadyStatus;
  recent_notes: SessionNote[];
}

export interface AgendaItem {
  minutes: number;
  title: string;
  detail: string;
}

export interface Slide {
  title: string;
  bullets: string[];
  notes: string | null;
}

export interface LessonPlanSummary {
  id: number;
  student_id: number;
  grade_subject_id: number;
  session_id: number | null;
  status: 'draft' | 'accepted';
  title: string | null;
  language: string | null;
  generated_at: string | null;
  accepted_at: string | null;
  edited_at: string | null;
  created_at: string;
}

export interface LessonPlan extends LessonPlanSummary {
  objectives: string[];
  agenda: AgendaItem[];
  checks: string[];
  materials: string[];
  homework_suggestion: string | null;
  notes_for_tutor: string | null;
  slides: Slide[];
  /** Slides are written on the first present or download, not with the plan */
  slides_ready: boolean;
  total_minutes: number;
  pptx_stale: boolean;
  pptx_url: string | null;
  session: CoachSessionRef | null;
}

export interface LessonPlansResponse {
  latest: LessonPlan | null;
  history: LessonPlanSummary[];
}

export interface SuggestedRubricCriterion {
  name: string;
  description: string | null;
  max_points: number;
}

export interface HomeworkIdea {
  key: string;
  title: string;
  instructions: string;
  rubric: SuggestedRubricCriterion[];
  due_in_days: number;
  why: string;
}

export interface HomeworkSuggestion {
  id: number;
  student_id: number;
  grade_subject_id: number;
  suggestions: HomeworkIdea[];
  assigned: Record<string, number>;
  stale: boolean;
  generated_at: string | null;
  status: ReadyStatus;
  assignments: { id: number; slug: string; title: string; status: string }[];
}

export interface CoachingMetrics {
  lessons: number;
  avg_talk_ratio: number | null;
  avg_checks: number | null;
  avg_longest_monologue: number | null;
  trend: {
    talk_ratio: number | null;
    checks: number | null;
    longest_monologue: number | null;
  };
}

export interface CoachingReport {
  id: number;
  period_start: string;
  period_end: string;
  metrics: CoachingMetrics;
  summary: string | null;
  strengths: { point: string; evidence: string }[];
  improve: { point: string; evidence: string; technique: string }[];
  techniques: string[];
  language: string | null;
  generated_at: string | null;
}

export interface CoachingReportSummary {
  id: number;
  period_start: string;
  period_end: string;
  summary: string | null;
  language: string | null;
  generated_at: string | null;
}

export interface CoachMeResponse {
  latest: CoachingReport | null;
  history: CoachingReportSummary[];
  lessons_with_notes: number;
}

export interface LessonPlanPayload {
  title?: string;
  objectives?: string[];
  agenda?: AgendaItem[];
  checks?: string[];
  materials?: string[];
  homework_suggestion?: string;
  notes_for_tutor?: string;
  slides?: Slide[];
  accept?: boolean;
}

export interface SessionNotePayload {
  summary?: string;
  covered?: string[];
  struggles?: string[];
  next_steps?: string[];
}

interface PairParams {
  studentId: number | undefined;
  courseId: number | undefined;
}

/** How often a tab polls while the backend is generating, and for how long */
export const GENERATING_POLL_MS = 5_000;
export const GENERATING_TIMEOUT_MS = 2 * 60 * 1000;

const isNotFound = (error: unknown) =>
  (error as { response?: { status?: number } })?.response?.status === 404;

/** `errors[]` from the API, else `error`, else the fallback; 429 has its own text */
export const coachErrorMessage = (
  error: unknown,
  fallback: string,
  throttled?: string,
): string => {
  const response = (
    error as {
      response?: {
        status?: number;
        data?: { errors?: string[]; error?: string };
      };
    }
  )?.response;
  if (response?.status === 429 && throttled) return throttled;
  const errors = response?.data?.errors;
  if (Array.isArray(errors) && errors.length) return errors.join(', ');
  return response?.data?.error || fallback;
};

/** Everyone the tutor teaches, one row per student and course */
export function useCoachStudents() {
  return useQuery({
    queryKey: queryKeys.coach.students(),
    queryFn: async () => {
      const response = await get('/coach/students');
      return response.data.data as CoachStudentRow[];
    },
    staleTime: 30 * 1000,
  });
}

/**
 * The learner insight for one pair, with the recent lesson notes.
 * Resolves to null while there is none yet (the API answers 404).
 */
export function useLearnerInsight(
  { studentId, courseId }: PairParams,
  refetchInterval: number | false = false,
) {
  return useQuery({
    queryKey: queryKeys.coach.insight(studentId ?? 0, courseId ?? 0),
    queryFn: async () => {
      try {
        const response = await get(`/coach/students/${studentId}/insights`, {
          params: { grade_subject_id: courseId },
        });
        return response.data.data as LearnerInsight;
      } catch (error) {
        if (isNotFound(error)) return null;
        throw error;
      }
    },
    enabled: !!studentId && !!courseId,
    staleTime: 30 * 1000,
    refetchInterval,
  });
}

export function useRefreshInsight() {
  return useMutation({
    mutationFn: async ({ studentId, courseId }: PairParams) => {
      const response = await post(`/coach/students/${studentId}/insights`, {
        grade_subject_id: courseId,
      });
      return response.data;
    },
  });
}

export function useUpdateSessionNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      ...note
    }: SessionNotePayload & { sessionId: number }) => {
      const response = await patch(`/coach/sessions/${sessionId}/note`, {
        note,
      });
      return response.data.data as SessionNote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.coach.insights() });
    },
  });
}

/** The latest plan in full plus the previous ones, for one pair */
export function useLessonPlans(
  { studentId, courseId }: PairParams,
  refetchInterval: number | false = false,
) {
  return useQuery({
    queryKey: queryKeys.coach.plans(studentId ?? 0, courseId ?? 0),
    queryFn: async () => {
      const response = await get(`/coach/students/${studentId}/lesson_plans`, {
        params: { grade_subject_id: courseId },
      });
      return response.data.data as LessonPlansResponse;
    },
    enabled: !!studentId && !!courseId,
    staleTime: 30 * 1000,
    refetchInterval,
  });
}

export function useLessonPlan(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.coach.plan(id ?? 0),
    queryFn: async () => {
      const response = await get(`/coach/lesson_plans/${id}`);
      return response.data.data as LessonPlan;
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useGenerateLessonPlan() {
  return useMutation({
    mutationFn: async ({
      studentId,
      courseId,
      sessionId,
    }: PairParams & { sessionId?: number }) => {
      const response = await post(`/coach/students/${studentId}/lesson_plans`, {
        grade_subject_id: courseId,
        session_id: sessionId,
      });
      return response.data;
    },
  });
}

export function useUpdateLessonPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...plan }: LessonPlanPayload & { id: number }) => {
      const response = await patch(`/coach/lesson_plans/${id}`, {
        lesson_plan: plan,
      });
      return response.data.data as LessonPlan;
    },
    onSuccess: (plan) => {
      queryClient.setQueryData(queryKeys.coach.plan(plan.id), plan);
      queryClient.invalidateQueries({ queryKey: queryKeys.coach.allPlans() });
      queryClient.invalidateQueries({ queryKey: queryKeys.coach.students() });
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
    },
  });
}

/** Builds (or reuses) the PowerPoint and returns the plan with its `pptx_url` */
export function useExportLessonPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await post(`/coach/lesson_plans/${id}/export`, {});
      return response.data.data as LessonPlan;
    },
    onSuccess: (plan) => {
      queryClient.setQueryData(queryKeys.coach.plan(plan.id), plan);
      queryClient.invalidateQueries({ queryKey: queryKeys.coach.allPlans() });
    },
  });
}

/** Homework ideas for one pair; null while there are none yet */
export function useHomeworkSuggestions(
  { studentId, courseId }: PairParams,
  refetchInterval: number | false = false,
) {
  return useQuery({
    queryKey: queryKeys.coach.homework(studentId ?? 0, courseId ?? 0),
    queryFn: async () => {
      try {
        const response = await get(
          `/coach/students/${studentId}/homework_suggestions`,
          { params: { grade_subject_id: courseId } },
        );
        return response.data.data as HomeworkSuggestion;
      } catch (error) {
        if (isNotFound(error)) return null;
        throw error;
      }
    },
    enabled: !!studentId && !!courseId,
    staleTime: 30 * 1000,
    refetchInterval,
  });
}

export function useRefreshHomework() {
  return useMutation({
    mutationFn: async ({ studentId, courseId }: PairParams) => {
      const response = await post(
        `/coach/students/${studentId}/homework_suggestions`,
        { grade_subject_id: courseId },
      );
      return response.data;
    },
  });
}

export function useAssignSuggestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      key,
      dueAt,
      rubricId,
    }: {
      id: number;
      key: string;
      dueAt: string;
      rubricId?: number;
    }) => {
      const response = await post(`/coach/homework_suggestions/${id}/assign`, {
        key,
        due_at: dueAt,
        rubric_id: rubricId,
      });
      return response.data.data as Assignment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.coach.allHomework(),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all });
    },
  });
}

/** The tutor's own coaching report, its history and how many lessons feed it */
export function useCoachMe(refetchInterval: number | false = false) {
  return useQuery({
    queryKey: queryKeys.coach.me(),
    queryFn: async () => {
      const response = await get('/coach/me');
      return response.data.data as CoachMeResponse;
    },
    staleTime: 60 * 1000,
    refetchInterval,
  });
}

export function useRefreshCoachMe() {
  return useMutation({
    mutationFn: async () => {
      const response = await post('/coach/me/refresh', {});
      return response.data;
    },
  });
}
