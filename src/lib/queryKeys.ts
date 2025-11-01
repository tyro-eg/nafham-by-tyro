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
    list: (params?: PaginationParams) =>
      [...queryKeys.sessions.lists(), params] as const,
    infinite: () => [...queryKeys.sessions.all, 'infinite'] as const,
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
} as const;
