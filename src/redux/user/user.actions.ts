import { createAsyncThunk } from '@reduxjs/toolkit';
import { post, patch, remove } from '../../assets/utils/api';
import { snackActions } from '../../assets/utils/toaster';
import { showSpinner, hideSpinner } from '../../assets/utils/utils';
import Instructors from './instructors.data';
import { Instructor } from '../../assets/types';

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
  async ({ payload }: { payload: any }, { rejectWithValue }) => {
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
  async (_payload: any, { rejectWithValue }) => {
    try {
      console.log(11111111);

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
