import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, remove } from '../assets/utils/api';
import { queryKeys } from '../lib/queryKeys';
import { parseTimeSlotsIntoCalendarEvents } from '../assets/utils/event.utils';
import { snackActions } from '../assets/utils/toaster';

export interface AvailabilitySlot {
  start_time: string;
  end_time: string;
  status?: 'available' | 'reserved';
}

/**
 * Fetch slots for a specific tutor within a date range
 */
export function useSlots(
  userId: number,
  from: string,
  to: string,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: queryKeys.calendar.userSlots({ userId, from, to }),
    queryFn: async () => {
      const res = await get(`/tutors/${userId}/availabilities`, {
        params: {
          'by_date_range[start_time]': from,
          'by_date_range[end_time]': to,
        },
      });
      // Ensure we have an array from the response
      const timeSlots = res.data.data || res.data || [];
      const slotsArray = Array.isArray(timeSlots) ? timeSlots : [];
      return parseTimeSlotsIntoCalendarEvents(slotsArray);
    },
    enabled: enabled && !!userId && !!from && !!to,
  });
}

/**
 * Fetch general availability
 */
export function useAvailability(params: { a: string; end_time: string }) {
  return useQuery({
    queryKey: queryKeys.calendar.availability(params),
    queryFn: async () => {
      const res = await get(`/availabilities`, { params });
      // Ensure we have an array from the response
      const timeSlots = res.data.data || res.data || [];
      const slotsArray = Array.isArray(timeSlots) ? timeSlots : [];
      return parseTimeSlotsIntoCalendarEvents(slotsArray);
    },
    enabled: !!params.a && !!params.end_time,
  });
}

/**
 * Create availability slots
 */
export function useCreateSlots() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slots: AvailabilitySlot[]) => {
      await post(`/availabilities`, { availabilities: slots });
    },
    onSuccess: () => {
      // Invalidate all calendar queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.calendar.all,
      });
      snackActions.success('Availability slots created successfully');
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Failed to create availability slots';
      snackActions.error(errorMessage);
    },
  });
}

/**
 * Delete availability slots
 */
export function useDeleteSlots() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      await remove(`/availabilities`, {
        data: { ids },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.calendar.all,
      });
      snackActions.success('Availability slots deleted successfully');
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Failed to delete availability slots';
      snackActions.error(errorMessage);
    },
  });
}
