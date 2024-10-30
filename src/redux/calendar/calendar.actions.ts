import { createAsyncThunk } from '@reduxjs/toolkit';
import { post, remove, apiGet } from '../../assets/utils/api';
import { snackActions } from '../../assets/utils/toaster';
import { showSpinner, hideSpinner } from '../../assets/utils/utils';
import { parseTimeSlotsIntoCalendarEvents } from '../../assets/utils/event.utils';

const getErrorMessage = (error: any): string =>
  error.response?.data?.message || error.message || 'Unknown error';

export const createSlots = createAsyncThunk(
  'calendar/createSlots',
  async (
    { userId, slots }: { userId: number; slots: any },
    { rejectWithValue },
  ) => {
    try {
      showSpinner();
      await post(`/tutors/${userId}/time_slots`, { time_slots: slots });
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

export const deleteSlots = createAsyncThunk(
  'calendar/deleteSlots',
  async (
    { userId, ids }: { userId: number; ids: number[] },
    { rejectWithValue },
  ) => {
    try {
      showSpinner();
      await remove(`/tutors/${userId}/time_slots/bulk_destroy`, {
        data: { time_slots: { ids } },
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
