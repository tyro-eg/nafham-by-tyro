import { createAsyncThunk } from '@reduxjs/toolkit';
import { post, apiGet } from '../../assets/utils/api';
import { snackActions } from '../../assets/utils/toaster';
import { showSpinner, hideSpinner } from '../../assets/utils/utils';
import Sessions from '../../modules/sessions/sessions-info/sessions-list/sessions-data';

export type SessionType = {
  id: number;
  start_time?: string | null; // ISO date string
  end_time?: string | null; // ISO date string
  state: string | null;
  offline: boolean | null;
  external_link: string | null; // URL string or empty
  is_session_trial: boolean | null;
  type?: string | null;
  course: {
    data?: {
      course_id: number | null;
      course_name: string | null;
      course_description: string | null;
      course_instructor_name: string | null;
      course_students:
        | {
            id: number | null;
            student_full_name: string | null;
          }[]
        | null;
      course_image: string | null; // URL string
      course_instructor_fields:
        | {
            id: number | null;
            name: string | null;
            created_at: string | null; // ISO date string
            updated_at: string | null; // ISO date string
            parent_id: number | null;
            visible: boolean | null;
          }[]
        | null;
      course_type: string | null;
    };
  };
  should_record: boolean | null;
  mirokey: string | null; // URL string
  field?: {
    data: {
      name: string | null;
    };
  };
  student?: {
    data: {
      full_name: string | null;
      image: string | null; // URL string
      id: number | null;
    };
  };
  tutor?: {
    data: {
      full_name: string | null;
      image: string | null; // URL string
      id: number | null;
      rating: number | null;
      reviews: number | null;
    };
  };
  show_feedback: boolean | null;
  opentok_room_id: string | null;
  firebase_key: string | null;
};

interface GetSessionsPayload {
  pageSize: number;
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
  async ({ pageSize }, { rejectWithValue }) => {
    try {
      showSpinner();
      // const res = await apiGet('/sessions', {
      //     params: { include: 'field,student,tutor', page: 1, page_size: pageSize },
      // });
      const response = new Promise<{ data: SessionType[]; headers: any }>(
        (resolve) => {
          setTimeout(() => {
            resolve({
              data: Sessions,
              headers: { 'page-items': 10, 'total-pages': 5 },
            });
          }, 1000);
        },
      );
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
