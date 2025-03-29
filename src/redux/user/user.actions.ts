import { createAsyncThunk } from '@reduxjs/toolkit';
import { post, patch, remove, jsonGet, apiGet } from '../../assets/utils/api';
import { snackActions } from '../../assets/utils/toaster';
import { showSpinner, hideSpinner } from '../../assets/utils/utils';

interface SignInPayload {
  email: string;
  password: string;
}

interface UpdateTutorInfoPayload {
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
  async (_, { rejectWithValue }) => {
    try {
      showSpinner();
      await remove('/users/sign_out');
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
  async (
    { pageNumber, pageSize }: GetInstructorsPayload,
    { rejectWithValue },
  ) => {
    try {
      showSpinner();
      const response = await apiGet(`/tutors`, {
        per_page: pageSize,
        page: pageNumber,
      });
      hideSpinner();
      return response;
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
    const response = await jsonGet(`/tutors/${id}`, {
      params: { include: 'fields,packages' },
    });

    hideSpinner();
    return response.data;
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    snackActions.error(errorMessage);
    hideSpinner();
    return rejectWithValue(errorMessage);
  }
});

export const updateTutorInfo = createAsyncThunk<any, UpdateTutorInfoPayload>(
  'user/updateTutorInfo',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      showSpinner();
      const response = await patch(`/tutors/${id}`, userData);
      hideSpinner();
      return response?.data?.data || {};
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      snackActions.error(errorMessage);
      hideSpinner();
      return rejectWithValue(errorMessage);
    }
  },
);

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
