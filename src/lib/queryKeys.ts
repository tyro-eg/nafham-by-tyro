/**
 * Centralized query keys for TanStack Query
 * Using factory pattern for type-safe, predictable query keys
 */

// Type definitions for query filters
export interface UserFilters {
  role?: string;
  status?: string;
  search?: string;
}

export interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
}

export interface SessionFilters {
  status?: string;
  tutor_id?: number;
  grade_subject_id?: number;
  pageNumber?: number;
  pageSize?: number;
}

export interface CalendarParams {
  userId: number;
  from: string;
  to: string;
}

export interface AvailabilityParams {
  instructorId?: number;
  from?: string;
  to?: string;
  status?: string;
  a?: string; // Query parameter used in availability endpoint
  end_time?: string;
  [key: string]: any; // Allow additional dynamic params
}

export interface AssignmentFilters {
  status?: string;
  student_id?: number;
  grade_subject_id?: number;
}

export const queryKeys = {
  // User/Instructor keys
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters?: UserFilters) =>
      [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.users.details(), id] as const,
    profile: () => [...queryKeys.users.all, 'profile'] as const,
  },

  // Instructor-specific keys
  instructors: {
    all: ['instructors'] as const,
    lists: () => [...queryKeys.instructors.all, 'list'] as const,
    list: (params?: PaginationParams) =>
      [...queryKeys.instructors.lists(), params] as const,
    details: () => [...queryKeys.instructors.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.instructors.details(), id] as const,
  },

  // Session keys
  sessions: {
    all: ['sessions'] as const,
    lists: () => [...queryKeys.sessions.all, 'list'] as const,
    list: (params?: PaginationParams | SessionFilters) =>
      [...queryKeys.sessions.lists(), params] as const,
    infinite: (filters?: SessionFilters) =>
      [...queryKeys.sessions.all, 'infinite', filters] as const,
    details: () => [...queryKeys.sessions.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.sessions.details(), id] as const,
  },

  // Calendar/Availability keys
  calendar: {
    all: ['calendar'] as const,
    slots: () => [...queryKeys.calendar.all, 'slots'] as const,
    userSlots: (params: CalendarParams) =>
      [...queryKeys.calendar.slots(), params] as const,
    availabilities: () =>
      [...queryKeys.calendar.all, 'availabilities'] as const,
    availability: (params: AvailabilityParams) =>
      [...queryKeys.calendar.availabilities(), params] as const,
  },

  // Package keys
  packages: {
    all: ['packages'] as const,
    lists: () => [...queryKeys.packages.all, 'list'] as const,
    list: (params?: PaginationParams) =>
      [...queryKeys.packages.lists(), params] as const,
    infinite: (params?: PaginationParams) =>
      [...queryKeys.packages.all, 'infinite', params] as const,
    details: () => [...queryKeys.packages.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.packages.details(), id] as const,
  },

  // Grade Subject keys
  gradeSubjects: {
    all: ['grade_subjects'] as const,
  },

  // Session request keys (students asking support to schedule sessions)
  sessionRequests: {
    all: ['session_requests'] as const,
    list: (status?: string) =>
      [...queryKeys.sessionRequests.all, 'list', status] as const,
  },

  // Homework assignment keys (tutor assigns, student submits, tutor reviews)
  assignments: {
    all: ['assignments'] as const,
    lists: () => [...queryKeys.assignments.all, 'list'] as const,
    list: (filters?: AssignmentFilters) =>
      [...queryKeys.assignments.lists(), filters] as const,
    details: () => [...queryKeys.assignments.all, 'detail'] as const,
    detail: (slug: string) =>
      [...queryKeys.assignments.details(), slug] as const,
  },

  // Rubric keys (the tutor's own rubrics plus shared ones)
  rubrics: {
    all: ['rubrics'] as const,
    list: () => [...queryKeys.rubrics.all, 'list'] as const,
  },

  // AI Teaching Assistant keys (tutor only), per student and course
  coach: {
    all: ['coach'] as const,
    students: () => [...queryKeys.coach.all, 'students'] as const,
    insights: () => [...queryKeys.coach.all, 'insight'] as const,
    insight: (studentId: number, courseId: number) =>
      [...queryKeys.coach.insights(), studentId, courseId] as const,
    allPlans: () => [...queryKeys.coach.all, 'plans'] as const,
    plans: (studentId: number, courseId: number) =>
      [...queryKeys.coach.allPlans(), studentId, courseId] as const,
    plan: (id: number) => [...queryKeys.coach.all, 'plan', id] as const,
    allHomework: () => [...queryKeys.coach.all, 'homework'] as const,
    homework: (studentId: number, courseId: number) =>
      [...queryKeys.coach.allHomework(), studentId, courseId] as const,
    me: () => [...queryKeys.coach.all, 'me'] as const,
  },
} as const;
