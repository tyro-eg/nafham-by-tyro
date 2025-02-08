import { createAsyncThunk } from '@reduxjs/toolkit';
import { post, apiGet } from '../../assets/utils/api';
import { snackActions } from '../../assets/utils/toaster';
import { showSpinner, hideSpinner } from '../../assets/utils/utils';

export type SessionType = {
  id: number;
  created_at: string;
  end_time: string;
  grade_subject: {
    id: number;
    created_at: string;
    full_course_name: string;
    updated_at: string;
  };
  session_type: 'regular' | 'trial' | 'group';
  start_time: string;
  status: 'open' | 'scheduled' | 'completed' | 'missed' | 'canceled';
  student: {
    id: number;
    created_at: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    type: 'Student' | 'Tutor';
    updated_at: string;
    image: string;
  };
  tutor: {
    id: number;
    created_at: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    type: 'Tutor' | 'Student';
    updated_at: string;
    image: string;
    rating: number;
    reviews: number;
  };
  updated_at: string;
};

interface GetSessionsPayload {
  pageSize: number;
  pageNumber: number;
}

interface CancelSessionPayload {
  sessionId: number;
}

interface EndSessionPayload {
  sessionId: number;
}

interface BookingSessionPayload {
  sessionData: any;
}

const getErrorMessage = (error: any): string =>
  error.response?.data?.message || error.message || 'Unknown error';

export const getSessions = createAsyncThunk<any, GetSessionsPayload>(
  'session/getSessions',
  async ({ pageSize, pageNumber }, { rejectWithValue }) => {
    try {
      showSpinner();
      const response = await apiGet(`/sessions`, {
        per_page: pageSize,
        page: pageNumber,
      });
      hideSpinner();
      return response;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      snackActions.error(errorMessage);
      hideSpinner();
      return rejectWithValue(errorMessage);
    }
  },
);

export const cancelSession = createAsyncThunk<void, CancelSessionPayload>(
  'session/cancelSession',
  async ({ sessionId }, { rejectWithValue }) => {
    try {
      showSpinner();
      await apiGet(`/sessions/${sessionId}/cancel`);
      hideSpinner();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      snackActions.error(errorMessage);
      hideSpinner();
      return rejectWithValue(errorMessage);
    }
  },
);

export const endSession = createAsyncThunk<void, EndSessionPayload>(
  'session/endSession',
  async ({ sessionId }, { rejectWithValue }) => {
    try {
      showSpinner();
      await apiGet(`/sessions/${sessionId}/end`);
      hideSpinner();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      snackActions.error(errorMessage);
      hideSpinner();
      return rejectWithValue(errorMessage);
    }
  },
);

export const bookingTrialSession = createAsyncThunk<
  void,
  BookingSessionPayload
>(
  'session/bookingTrialSession',
  async ({ sessionData }, { rejectWithValue }) => {
    try {
      showSpinner();
      await post(`/sessions/trial`, { trial_session: sessionData });
      hideSpinner();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      snackActions.error(errorMessage);
      hideSpinner();
      return rejectWithValue(errorMessage);
    }
  },
);

export const bookingPrivateSession = createAsyncThunk<
  void,
  BookingSessionPayload
>(
  'session/bookingPrivateSession',
  async ({ sessionData }, { rejectWithValue }) => {
    try {
      showSpinner();
      await post(`/sessions/private`, { private_session: sessionData });
      hideSpinner();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      snackActions.error(errorMessage);
      hideSpinner();
      return rejectWithValue(errorMessage);
    }
  },
);
