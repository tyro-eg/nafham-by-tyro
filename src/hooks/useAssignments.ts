import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { get, patch, post, remove } from '../assets/utils/api';
import { queryKeys, type AssignmentFilters } from '../lib/queryKeys';

/**
 * Homework: a tutor assigns work to one of their students, the student
 * submits an answer (text and/or files) and the tutor reviews it against
 * an optional rubric. Hooks stay silent; components surface errors.
 */
export type AssignmentStatus = 'assigned' | 'submitted' | 'reviewed';
export type ReviewStatus = 'draft' | 'released';

export interface AttachmentFile {
  id: number;
  filename: string;
  url: string;
  content_type: string;
  byte_size: number;
}

export interface RubricCriterion {
  name: string;
  description: string | null;
  max_points: number;
}

export interface Rubric {
  id: number;
  title: string;
  criteria: RubricCriterion[];
  shared: boolean;
  created_at: string;
}

/** The rubric as embedded in an assignment (no `shared` flag) */
export interface AssignmentRubric {
  id: number;
  title: string;
  criteria: RubricCriterion[];
}

export interface AssignmentTutor {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  active: boolean;
  type: 'Tutor';
}

export interface AssignmentStudent {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  country_code: string;
  nationality: string;
  active: boolean;
  type: 'Student';
}

export interface AssignmentSubmission {
  id: number;
  body: string | null;
  submitted_at: string;
  files: AttachmentFile[];
}

export interface CriterionMark {
  name: string;
  max_points: number;
  points: number;
}

export interface AssignmentReview {
  id: number;
  criterion_marks: CriterionMark[];
  total_points: number;
  max_points: number;
  feedback: string | null;
  status: ReviewStatus;
  released_at: string | null;
}

export interface Assignment {
  id: number;
  slug: string;
  title: string;
  instructions: string | null;
  due_at: string;
  status: AssignmentStatus;
  opened_at: string | null;
  created_at: string;
  updated_at: string;
  tutor: AssignmentTutor;
  student: AssignmentStudent;
  grade_subject: { id: number; full_course_name: string };
  rubric: AssignmentRubric | null;
  attachments: AttachmentFile[];
  submission: AssignmentSubmission | null;
  /** A student only ever receives a released review; a tutor also sees drafts */
  review: AssignmentReview | null;
}

/** Fields of a new or edited assignment (sent as multipart FormData) */
export interface AssignmentPayload {
  title: string;
  instructions?: string;
  /** ISO 8601 */
  due_at: string;
  student_id: number;
  grade_subject_id: number;
  rubric_id?: number | null;
  attachments?: File[];
}

export interface SubmissionPayload {
  body?: string;
  files?: File[];
}

export interface ReviewPayload {
  criterion_marks: CriterionMark[];
  feedback?: string;
  /** false saves a draft the student cannot see; true marks it reviewed */
  release: boolean;
}

export interface RubricPayload {
  title: string;
  criteria: { name: string; description?: string; max_points: number }[];
}

interface AssignmentsResponse {
  data: Assignment[];
}

interface RubricsResponse {
  data: Rubric[];
}

// Enough to list every assignment without paging through the API
const PAGE_SIZE = 100;

/** Rails nested keys: assignment[title], assignment[attachments][] ... */
const assignmentFormData = (payload: AssignmentPayload): FormData => {
  const form = new FormData();
  form.append('assignment[title]', payload.title);
  form.append('assignment[instructions]', payload.instructions ?? '');
  form.append('assignment[due_at]', payload.due_at);
  form.append('assignment[student_id]', String(payload.student_id));
  form.append('assignment[grade_subject_id]', String(payload.grade_subject_id));
  if (payload.rubric_id) {
    form.append('assignment[rubric_id]', String(payload.rubric_id));
  }
  payload.attachments?.forEach((file) =>
    form.append('assignment[attachments][]', file, file.name),
  );
  return form;
};

const submissionFormData = (payload: SubmissionPayload): FormData => {
  const form = new FormData();
  form.append('submission[body]', payload.body ?? '');
  payload.files?.forEach((file) =>
    form.append('submission[files][]', file, file.name),
  );
  return form;
};

/**
 * The current user's assignments: a tutor gets the ones they set, a student
 * gets their own. Open ones come first by due date, then reviewed ones
 * newest first.
 *
 * @param filters - Optional status / student / course filters
 */
export function useAssignments(filters: AssignmentFilters = {}) {
  return useQuery({
    queryKey: queryKeys.assignments.list(filters),
    queryFn: async () => {
      const response = await get('/assignments', {
        params: { ...filters, per_page: PAGE_SIZE, page: 1 },
      });
      return response.data as AssignmentsResponse;
    },
    staleTime: 60 * 1000,
  });
}

/**
 * One assignment by slug. For a student the server stamps `opened_at`.
 *
 * @param slug - The assignment slug, e.g. "HW-12345678"
 */
export function useAssignment(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.assignments.detail(slug ?? ''),
    queryFn: async () => {
      const response = await get(`/assignments/${slug}`);
      return response.data.data as Assignment;
    },
    enabled: !!slug,
    staleTime: 30 * 1000,
  });
}

/**
 * Tutor: assign homework to a student (multipart, attachments optional)
 */
export function useCreateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AssignmentPayload) => {
      const response = await post('/assignments', assignmentFormData(payload));
      return response.data.data as Assignment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all });
    },
  });
}

/**
 * Tutor: edit an assignment's fields (same payload as creation)
 */
export function useUpdateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      slug,
      ...payload
    }: AssignmentPayload & { slug: string }) => {
      const response = await patch(
        `/assignments/${slug}`,
        assignmentFormData(payload),
      );
      return response.data.data as Assignment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all });
    },
  });
}

/**
 * Tutor: delete an assignment; only allowed while nothing was submitted
 */
export function useDeleteAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slug: string) => {
      await remove(`/assignments/${slug}`);
      return slug;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all });
    },
  });
}

/**
 * Student: create or replace the submission while the assignment is not
 * yet reviewed. Returns the full assignment.
 */
export function useSubmitAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      slug,
      ...payload
    }: SubmissionPayload & { slug: string }) => {
      const response = await post(
        `/assignments/${slug}/submission`,
        submissionFormData(payload),
      );
      return response.data.data as Assignment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all });
    },
  });
}

/**
 * Tutor: save a draft review (release=false) or release it to the student
 * (release=true). Returns the full assignment.
 */
export function useReviewAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      slug,
      ...review
    }: ReviewPayload & { slug: string }) => {
      const response = await patch(`/assignments/${slug}/review`, { review });
      return response.data.data as Assignment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all });
    },
  });
}

/**
 * Tutor: the tutor's own rubrics plus the shared ones
 */
export function useRubrics(enabled = true) {
  return useQuery({
    queryKey: queryKeys.rubrics.list(),
    queryFn: async () => {
      const response = await get('/rubrics');
      return response.data as RubricsResponse;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Tutor: create a rubric to grade assignments against
 */
export function useCreateRubric() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rubric: RubricPayload) => {
      const response = await post('/rubrics', { rubric });
      return response.data.data as Rubric;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rubrics.all });
    },
  });
}

/**
 * Pull a readable message out of an API error response
 */
export const assignmentErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  const data = (error as { response?: { data?: unknown } })?.response?.data;
  if (data && typeof data === 'object') {
    const errors = (data as { errors?: unknown }).errors;
    if (Array.isArray(errors) && errors.length) return errors.join(', ');
    const message = (data as { error?: unknown }).error;
    if (typeof message === 'string') return message;
  }
  return fallback;
};

/** Open and past due, with nothing handed in yet */
export const isOverdue = (assignment: Assignment, now = new Date()) =>
  assignment.status === 'assigned' && new Date(assignment.due_at) < now;
