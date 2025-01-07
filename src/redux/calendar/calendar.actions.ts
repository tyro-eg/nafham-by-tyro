import { createAsyncThunk } from '@reduxjs/toolkit';
import { post, remove, apiGet } from '../../assets/utils/api';
import { snackActions } from '../../assets/utils/toaster';
import { showSpinner, hideSpinner } from '../../assets/utils/utils';
import { parseTimeSlotsIntoCalendarEvents } from '../../assets/utils/event.utils';

export type SlotType = {
  id: number;
  created_at: string;
  end_time: string;
  start_time: string;
  status: string;
  tutor: {
    id: number;
    created_at: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    type: string;
    updated_at: string;
  };
  updated_at: string;
};

const getErrorMessage = (error: any): string =>
  error.response?.data?.message || error.message || 'Unknown error';

export const createSlots = createAsyncThunk(
  'calendar/createSlots',
  async ({ slots }: { slots: any }, { rejectWithValue }) => {
    try {
      showSpinner();
      await post(`/availabilities`, { availabilities: slots });
      hideSpinner();
      return;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      snackActions.error(errorMessage);
      hideSpinner();
      return rejectWithValue(errorMessage);
    }
  },
);

export const getSlots = createAsyncThunk(
  'calendar/getSlots',
  async (
    { userId, params }: { userId: number; params: any },
    { rejectWithValue },
  ) => {
    try {
      showSpinner();
      const res = await apiGet(`/tutors/${userId}/time_slots`, params);
      const slots = parseTimeSlotsIntoCalendarEvents(res.data);
      hideSpinner();
      return slots;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      snackActions.error(errorMessage);
      hideSpinner();
      return rejectWithValue(errorMessage);
    }
  },
);

export const getAvailability = createAsyncThunk(
  'calendar/getAvailability',
  async (
    { params }: { params: { a: string; end_time: string } },
    { rejectWithValue },
  ) => {
    try {
      showSpinner();
      const res = await apiGet(`/availabilities`, params);
      const slots = parseTimeSlotsIntoCalendarEvents(res.data);
      hideSpinner();
      return slots;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      snackActions.error(errorMessage);
      hideSpinner();
      return rejectWithValue(errorMessage);
    }
  },
);

export const deleteSlots = createAsyncThunk(
  'calendar/deleteSlots',
  async ({ ids }: { ids: number[] }, { rejectWithValue }) => {
    try {
      showSpinner();
      await remove(`/availabilities`, {
        data: { ids },
      });
      hideSpinner();
      return;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      snackActions.error(errorMessage);
      hideSpinner();
      return rejectWithValue(errorMessage);
    }
  },
);
