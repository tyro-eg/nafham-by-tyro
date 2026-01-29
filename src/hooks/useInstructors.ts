import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { get, patch } from '../assets/utils/api';
import { queryKeys } from '../lib/queryKeys';
import { Instructor, ApiError } from '../assets/types';
import { snackActions } from '../assets/utils/toaster';
import { useAppDispatch } from '../redux/store';
import { setCurrentUser } from '../redux/user/user.slice';

/**
 * Tutor profile update data
 */
interface TutorProfileUpdateData {
  tutor: {
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    email?: string;
    video_url?: string;
    bio?: string;
    avatar?: File | string;
  };
}

/**
 * Generic user information update data
 * Can be for either user or tutor endpoints
 */
interface UserInfoUpdateData {
  [key: string]:
    | string
    | number
    | boolean
    | File
    | null
    | undefined
    | Record<string, unknown>;
}

/**
 * Instructor filters
 */
export interface InstructorFilters {
  grade_subject_id?: number;
}

/**
 * Fetch paginated list of instructors
 */
export function useInstructors(
  pageNumber: number = 1,
  pageSize: number = 10,
  filters?: InstructorFilters,
) {
  return useQuery({
    queryKey: queryKeys.instructors.list({ pageNumber, pageSize, ...filters }),
    queryFn: async () => {
      const params: Record<string, any> = {
        per_page: pageSize,
        page: pageNumber,
      };

      if (filters?.grade_subject_id) {
        params.grade_subject_id = filters.grade_subject_id;
      }

      const response = await get(`/tutors`, { params });
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
 * Fetch instructors with infinite scroll
 *
 * @param pageSize - Number of items per page
 * @param filters - Optional filters (grade_subject_id)
 */
export function useInfiniteInstructors(
  pageSize: number = 20,
  filters?: InstructorFilters,
) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.instructors.all, 'infinite', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const params: Record<string, any> = {
        per_page: pageSize,
        page: pageParam,
      };

      if (filters?.grade_subject_id) {
        params.grade_subject_id = filters.grade_subject_id;
      }

      const response = await get(`/tutors`, { params });
      return {
        data: response.data.data as Instructor[],
        pagination: response.headers,
        currentPage: pageParam,
      };
    },
    getNextPageParam: (lastPage) => {
      const currentPage = Number(lastPage.pagination['current-page']);
      const totalPages = Number(lastPage.pagination['total-pages']);

      // If current page is less than total pages, fetch next page
      const hasMore = currentPage < totalPages;
      return hasMore ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 10 * 60 * 1000, // 10 minutes - instructors don't change often
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
      userData: TutorProfileUpdateData;
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
    onError: (error: ApiError) => {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Failed to update profile';
      snackActions.error(errorMessage);
    },
  });
}

/**
 * Fetch user's instructors (instructors they've booked sessions with)
 * Endpoint: /me/instructors
 * @param filters - Optional filters (grade_subject_id)
 */
export function useMyInstructors(filters?: InstructorFilters) {
  return useQuery({
    queryKey: [...queryKeys.instructors.all, 'my-instructors', filters],
    queryFn: async () => {
      const params: Record<string, any> = {};
      if (filters?.grade_subject_id) {
        params.grade_subject_id = filters.grade_subject_id;
      }

      const response = await get(`/me/instructors`, { params });
      return {
        data: (response.data.data || response.data) as Instructor[],
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - user's instructors may change
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
      userData: UserInfoUpdateData;
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
    onError: (error: ApiError) => {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Failed to update information';
      snackActions.error(errorMessage);
    },
  });
}
