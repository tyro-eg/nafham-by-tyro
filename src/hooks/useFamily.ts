import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { get, patch, post, remove } from '../assets/utils/api';
import {
  getActiveChildId,
  onActiveChildChange,
  setActiveChildId,
} from '../lib/family-child';

/**
 * The family account: the parent's children with where each stands, the
 * family's settings, consent, logins, top-up requests and lesson notes.
 * Hooks stay silent; components surface errors.
 */
export interface FamilySession {
  id: number;
  slug: string;
  start_time: string;
  end_time: string;
  course_name: string;
  tutor_name: string;
}

export interface FamilyPackage {
  id: number;
  slug: string;
  course_name: string;
  tutor_name: string;
  original_hours: number;
  remaining_hours: number;
  recording_enabled: boolean;
  recording_consented_at: string | null;
}

export interface FamilyChild {
  id: number;
  first_name: string;
  last_name: string;
  login_enabled: boolean;
  email: string | null;
  login_invited_at: string | null;
  active: boolean;
  next_session: FamilySession | null;
  hours_left: number;
  homework_due: number;
  latest_note_at: string | null;
  lessons_completed: number;
  packages: FamilyPackage[];
}

export interface Family {
  id: number;
  name: string;
  country_code: string | null;
  phone_number: string | null;
  email: string | null;
  terms: { version: string; accepted: boolean; accepted_at: string | null };
  children: FamilyChild[];
}

export interface FamilyNote {
  id: number;
  summary: string | null;
  covered: string[];
  struggles: string[];
  next_steps: string[];
  language: string | null;
  created_at: string;
  child: { id: number; first_name: string };
  session: {
    id: number;
    slug: string;
    start_time: string;
    course_name: string;
  };
}

const familyKeys = {
  all: ['family'] as const,
  overview: () => [...familyKeys.all, 'overview'] as const,
  notes: (childId?: number) =>
    [...familyKeys.all, 'notes', childId ?? 'all'] as const,
};

export function useFamily(enabled = true) {
  return useQuery({
    queryKey: familyKeys.overview(),
    queryFn: async () => (await get('/family')).data.data as Family,
    enabled,
    staleTime: 30 * 1000,
  });
}

export function useFamilyNotes(childId?: number) {
  return useQuery({
    queryKey: familyKeys.notes(childId),
    queryFn: async () => {
      const response = await get('/family/notes', {
        params: childId ? { child_id: childId } : {},
      });
      return response.data.data as FamilyNote[];
    },
    staleTime: 60 * 1000,
  });
}

const refreshFamily =
  (queryClient: ReturnType<typeof useQueryClient>) => () => {
    queryClient.invalidateQueries({ queryKey: familyKeys.all });
  };

export function useUpdateFamily() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (family: {
      name?: string;
      phone_number?: string;
      country_code?: string;
    }) => (await patch('/family', { family })).data.data as Family,
    onSuccess: refreshFamily(queryClient),
  });
}

export function useAcceptTerms() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      (await post('/family/terms', {})).data.data as Family,
    onSuccess: refreshFamily(queryClient),
  });
}

export function useAddChild() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (child: { first_name: string; last_name: string }) =>
      (await post('/family/children', { child })).data.data as FamilyChild,
    onSuccess: refreshFamily(queryClient),
  });
}

export function useInviteChildLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      childId,
      email,
    }: {
      childId: number;
      email: string;
    }) =>
      (await post(`/family/children/${childId}/login`, { email })).data
        .data as FamilyChild,
    onSuccess: refreshFamily(queryClient),
  });
}

export function useRemoveChildLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (childId: number) =>
      (await remove(`/family/children/${childId}/login`)).data
        .data as FamilyChild,
    onSuccess: refreshFamily(queryClient),
  });
}

export function useChildConsent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      childId,
      packageId,
      consent,
    }: {
      childId: number;
      packageId: number;
      consent: boolean;
    }) =>
      (
        await patch(
          `/family/children/${childId}/packages/${packageId}/consent`,
          { consent },
        )
      ).data.data as Family,
    onSuccess: refreshFamily(queryClient),
  });
}

export function useRequestTopUp() {
  return useMutation({
    mutationFn: async ({
      childId,
      packageId,
      hours,
      note,
    }: {
      childId: number;
      packageId?: number;
      hours: number;
      note?: string;
    }) =>
      (
        await post(`/family/children/${childId}/top_ups`, {
          package_id: packageId,
          hours_requested: hours,
          note,
        })
      ).data.data,
  });
}

/**
 * The child the parent is looking at. Switching clears every cached query,
 * since each student page is now about someone else.
 */
export function useActiveChild(children: FamilyChild[] | undefined) {
  const queryClient = useQueryClient();
  const [childId, setChildId] = useState<number | null>(getActiveChildId());

  useEffect(
    () => onActiveChildChange(() => setChildId(getActiveChildId())),
    [],
  );

  // A single child is picked without asking; a stale pick is replaced
  useEffect(() => {
    if (!children?.length) return;
    const valid = children.some((child) => child.id === childId);
    if (!valid) setActiveChildId(children[0].id);
  }, [children, childId]);

  const choose = useCallback(
    (id: number) => {
      if (id === getActiveChildId()) return;
      setActiveChildId(id);
      queryClient.removeQueries({
        predicate: (q) => q.queryKey[0] !== 'family',
      });
    },
    [queryClient],
  );

  const child = children?.find((c) => c.id === childId) ?? null;
  return { childId, child, choose };
}

/** `errors[]` from the API, else `error`, else the fallback */
export const familyErrorMessage = (
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

/** The session counts of the chosen child: what a student's own /me carries */
export interface ChildStats {
  id: number;
  upcoming_sessions_count: number;
  unscheduled_hours: number;
  previous_sessions_count: number;
  completed_sessions_count?: number;
  cancelled_sessions_count?: number;
}

/**
 * For a parent, the chosen child's session counts, refetched when the pick
 * changes. Disabled for students and tutors, whose counts come with /me.
 */
export function useChildStats(enabled: boolean) {
  const [childId, setChildId] = useState<number | null>(getActiveChildId());
  useEffect(
    () => onActiveChildChange(() => setChildId(getActiveChildId())),
    [],
  );
  return useQuery<ChildStats>({
    queryKey: ['me', 'child', childId],
    queryFn: async () => (await get('/me/child')).data,
    enabled: enabled && childId !== null,
  });
}
