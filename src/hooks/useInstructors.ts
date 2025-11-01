import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, patch } from '../assets/utils/api';
import { queryKeys } from '../lib/queryKeys';
import { Instructor } from '../assets/types';
import { snackActions } from '../assets/utils/toaster';
import { useAppDispatch } from '../redux/store';
import { setCurrentUser } from '../redux/user/user.slice';

/**
 * Fetch paginated list of instructors
 */
export function useInstructors(pageNumber: number = 1, pageSize: number = 10) {
  return useQuery({
    queryKey: queryKeys.instructors.list({ pageNumber, pageSize }),
    queryFn: async () => {
      const response = await get(`/tutors`, {
        params: {
          per_page: pageSize,
          page: pageNumber,
        },
      });
      return {
        data: response.data.data as Instructor[],
        pagination: response.headers,
      };
    },
  });
}

/**
 * Fetch single instructor by ID with relationships
 */
export function useInstructor(id: number | string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.instructors.detail(Number(id)),
    queryFn: async () => {
      const response = await get(`/tutors/${id}`, {
        params: {
          include: 'fields,packages',
        },
      });
      return response.data.data as Instructor;
    },
    enabled: enabled && !!id,
  });
}

/**
 * Update tutor profile information
 */
export function useUpdateTutorProfile() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async ({
      id,
      userData,
    }: {
      id: number;
      userData: {
        tutor: {
          first_name?: string;
          last_name?: string;
          phone_number?: string;
          email?: string;
          video_url?: string;
          bio?: string;
          avatar?: any;
        };
      };
    }) => {
      const { tutor } = userData;
      const { avatar, ...info } = tutor;

      const formData = new FormData();

      Object.entries(info).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(`tutor[${key}]`, value as string);
        }
      });

      if (avatar instanceof File) {
        formData.append('tutor[avatar]', avatar);
      }

      const response = await patch(`/tutors/${id}`, formData, {
        headers: {},
      });

      return response?.data?.data || {};
    },
    onSuccess: (data, variables) => {
      // Update Redux state with new user data
      if (data) {
        dispatch(setCurrentUser(data));
      }

      // Invalidate and refetch instructor details
      queryClient.invalidateQueries({
        queryKey: queryKeys.instructors.detail(variables.id),
      });
      // Also invalidate instructor list
      queryClient.invalidateQueries({
        queryKey: queryKeys.instructors.lists(),
      });
      snackActions.success('Profile updated successfully');
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Failed to update profile';
      snackActions.error(errorMessage);
    },
  });
}

/**
 * Update user information (generic)
 */
export function useUpdateUserInfo() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async ({
      type,
      userData,
    }: {
      id: number; // Used in onSuccess via variables.id
      type: string;
      userData: any;
    }) => {
      const endpoint = type === 'users' ? 'user' : 'tutor';
      const response = await patch(`/${endpoint}`, userData);
      return response?.data?.data || {};
    },
    onSuccess: (data, variables) => {
      // Update Redux state with new user data
      if (data) {
        dispatch(setCurrentUser(data));
      }

      // Invalidate TanStack Query caches
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.profile(),
      });
      if (variables.type === 'Tutor') {
        queryClient.invalidateQueries({
          queryKey: queryKeys.instructors.detail(variables.id),
        });
      }
      snackActions.success('Information updated successfully');
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Failed to update information';
      snackActions.error(errorMessage);
    },
  });
}
