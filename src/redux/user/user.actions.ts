import { createAsyncThunk } from '@reduxjs/toolkit';
import { post, patch, remove, jsonGet } from '../../assets/utils/api';
import { snackActions } from '../../assets/utils/toaster';
import { showSpinner, hideSpinner } from '../../assets/utils/utils';
import Instructors from './instructors.data';
import { Instructor } from '../../assets/types';

interface SignInPayload {
  email: string;
  password: string;
}

interface UpdateUserInfoPayload {
  id: number;
  type: string;
  userData: any;
}

interface GetInstructorByIdPayload {
  id: number;
}

interface GetInstructorsPayload {
  pageNumber: number;
  pageSize: number;
}

const getErrorMessage = (error: any): string =>
  error.response?.data?.error || error.message || 'Unknown error';

const saveUserDataToLocalStorage = (userData: any, headers: any) => {
  const {
    'access-token': accessToken,
    'refresh-token': refreshToken,
    'expire-at': expireAt,
  } = headers;

  localStorage.setItem('tyro.token', accessToken);
  localStorage.setItem('tyro.refreshToken', refreshToken);
  localStorage.setItem('tyro.expireAt', expireAt);
  localStorage.setItem('tyro.id', userData.id);
};

export const signInWithEmail = createAsyncThunk(
  'user/signInWithEmail',
  async ({ payload }: { payload: SignInPayload }, { rejectWithValue }) => {
    try {
      showSpinner();
      const {
        data: { data: userData },
        headers,
      } = await post('/users/sign_in', payload);
      if (!userData || !userData.id) {
        hideSpinner();
        return;
      }
      saveUserDataToLocalStorage(userData, headers);
      hideSpinner();
      return userData;
    } catch (error) {
      snackActions.error(getErrorMessage(error));
      hideSpinner();
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const signUp = createAsyncThunk(
  '/users/signUp',
  async (payload: any, { rejectWithValue }) => {
    try {
      showSpinner();
      const {
        data: { data: userData },
        headers,
      } = await post('/users/sign_up', payload);
      if (!userData || !userData.id) {
        hideSpinner();
        return;
      }
      saveUserDataToLocalStorage(userData, headers);
      hideSpinner();
      return userData;
    } catch (error) {
      snackActions.error(getErrorMessage(error));
      hideSpinner();
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const signOut = createAsyncThunk(
  'user/signOut',
  async (isInstructor: boolean, { rejectWithValue }) => {
    try {
      showSpinner();
      await remove(isInstructor ? '/tutors/sign_out' : '/users/sign_out');
      localStorage.clear();
      hideSpinner();
    } catch (error) {
      snackActions.error(getErrorMessage(error));
      hideSpinner();
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const changePassword = createAsyncThunk(
  'user/changePassword',
  async (payload: any, { rejectWithValue }) => {
    try {
      showSpinner();
      await patch(`/${payload.type}/passwords`, payload.userData);
      hideSpinner();
    } catch (error) {
      snackActions.error(getErrorMessage(error));
      hideSpinner();
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const getInstructors = createAsyncThunk(
  'user/getInstructors',
  async (_payload: GetInstructorsPayload, { rejectWithValue }) => {
    try {
      showSpinner();
      const response = new Promise<{ data: Instructor[] }>((resolve) => {
        setTimeout(() => {
          resolve({ data: Instructors });
        }, 1000);
      });
      hideSpinner();
      const result = await response;
      return result.data;
    } catch (error) {
      snackActions.error(getErrorMessage(error));
      hideSpinner();
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const getInstructorById = createAsyncThunk<
  any,
  GetInstructorByIdPayload
>('user/getInstructorById', async ({ id }, { rejectWithValue }) => {
  try {
    showSpinner();
    // const response = await jsonGet(`/tutor/${id}`, {
    //   params: { include: 'fields,packages' },
    // });
    const response = new Promise<{ data: Instructor }>((resolve) => {
      setTimeout(() => {
        resolve({
          data: Instructors.find((instructor) => instructor.id === id)!,
        });
      }, 1000);
    });
    hideSpinner();
    const result = await response;
    return result.data;
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    snackActions.error(errorMessage);
    hideSpinner();
    return rejectWithValue(errorMessage);
  }
});

export const updateUserInfo = createAsyncThunk<void, UpdateUserInfoPayload>(
  'user/updateUserInfo',
  async ({ id, type, userData }, { rejectWithValue }) => {
    try {
      showSpinner();
      await patch(`/${type === 'users' ? 'user' : 'tutor'}`, userData);
      hideSpinner();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      snackActions.error(errorMessage);
      hideSpinner();
      return rejectWithValue(errorMessage);
    }
  },
);
