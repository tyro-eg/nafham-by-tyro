import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { get, patch, post } from '../assets/utils/api';
import { queryKeys } from '../lib/queryKeys';
import type { Package } from '../assets/types';
import type { ChangeHeaders } from './useSessionChanges';

/**
 * Pausing a package: the family pauses lessons for one to four weeks; the
 * lessons inside the window are cancelled with their hours back, the usual
 * weekly times are held from the resume date and booked again then
 * (PackageFreeze, Freezes::*). Hooks stay silent; components surface errors.
 */
export const FREEZE_REASONS = [
  'travel',
  'exams',
  'illness',
  'financial',
  'other',
] as const;
export type FreezeReason = (typeof FREEZE_REASONS)[number];

export type FreezeStatus = 'scheduled' | 'active' | 'ended' | 'cancelled';

/** One weekly time, as SlotHold.pattern stores it (UTC) */
export interface WeeklyEntry {
  wday: number;
  minute_of_day: number;
  duration_minutes: number;
}

/** A pause as the family and the tutor see it (PackageFreezeBlueprint) */
export interface PackageFreeze {
  id: number;
  slug: string;
  status: FreezeStatus;
  starts_on: string;
  ends_on: string;
  resumes_on: string;
  days: number;
  reason?: FreezeReason | null;
  note?: string | null;
  cancelled_session_ids: number[];
  held_times: WeeklyEntry[];
  rebooked_session_ids: number[];
  unbooked_count: number;
  ended_at?: string | null;
  created_at: string;
  can_end: boolean;
  can_cancel: boolean;
  package: Package;
}

/** The limits of a pause and what these dates would cancel (GET freeze_options) */
export interface FreezeOptions {
  earliest_start: string;
  min_days: number;
  max_days: number;
  reasons: FreezeReason[];
  weekly_pattern: WeeklyEntry[];
  current_freeze: PackageFreeze | null;
  lessons: { id: number; start_time: string; end_time: string }[];
}

const invalidate = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.packages.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.freezes.all });
};

export function useFreezeOptions(
  packageId: number | undefined,
  range: { starts_on?: string; ends_on?: string },
  enabled = true,
  headers?: ChangeHeaders,
) {
  return useQuery({
    queryKey: queryKeys.packages.freezeOptions(packageId ?? 0, range),
    queryFn: async () => {
      const response = await get(`/packages/${packageId}/freeze_options`, {
        params: range,
        config: headers ? { headers } : {},
      });
      return response.data.data as FreezeOptions;
    },
    enabled: enabled && !!packageId,
  });
}

/** POST /packages/:id/freezes */
export function useCreateFreeze() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      packageId: number;
      starts_on: string;
      ends_on: string;
      reason: FreezeReason;
      note?: string;
      headers?: ChangeHeaders;
    }) => {
      const response = await post(
        `/packages/${input.packageId}/freezes`,
        {
          starts_on: input.starts_on,
          ends_on: input.ends_on,
          reason: input.reason,
          note: input.note?.trim() || undefined,
        },
        input.headers ? { headers: input.headers } : {},
      );
      return response.data.data as PackageFreeze;
    },
    onSuccess: () => invalidate(queryClient),
  });
}

/** The pauses on the viewer's packages (both sides) */
export function useFreezes(enabled = true) {
  return useQuery({
    queryKey: queryKeys.freezes.list(),
    queryFn: async () => {
      const response = await get('/freezes', { params: { per_page: 50 } });
      return (response.data.data || []) as PackageFreeze[];
    },
    enabled,
  });
}

/** PATCH /freezes/:id/end: back to lessons now */
export function useEndFreeze() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (freezeId: number) => {
      const response = await patch(`/freezes/${freezeId}/end`, {});
      return response.data.data as PackageFreeze;
    },
    onSuccess: () => invalidate(queryClient),
  });
}

/** PATCH /freezes/:id/cancel: a pause that has not started is called off */
export function useCancelFreeze() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (freezeId: number) => {
      const response = await patch(`/freezes/${freezeId}/cancel`, {});
      return response.data.data as PackageFreeze;
    },
    onSuccess: () => invalidate(queryClient),
  });
}
