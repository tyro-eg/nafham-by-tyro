import { createSlice } from '@reduxjs/toolkit';
import {
  createSlots,
  deleteSlots,
  getAvailability,
  getSlots,
} from './calendar.actions';

interface CalendarState {
  timeSlots: any[] | null;
  error: string | null;
  createSlotsStatus: { success: boolean | null; failure: string | null };
  deleteSlotsStatus: { success: boolean | null; failure: string | null };
}

const initialState: CalendarState = {
  timeSlots: null,
  error: null,
  createSlotsStatus: { success: null, failure: null },
  deleteSlotsStatus: { success: null, failure: null },
};

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    resetCreateSlotsStatus(state) {
      state.createSlotsStatus = { success: null, failure: null };
    },
    resetDeleteSlotsStatus(state) {
      state.deleteSlotsStatus = { success: null, failure: null };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSlots.fulfilled, (state, action) => {
        state.timeSlots = action.payload;
        state.error = null;
      })
      .addCase(getSlots.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(getAvailability.fulfilled, (state, action) => {
        state.timeSlots = action.payload;
        state.error = null;
      })
      .addCase(getAvailability.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(createSlots.fulfilled, (state) => {
        state.createSlotsStatus.success = true;
        state.createSlotsStatus.failure = null;
      })
      .addCase(createSlots.rejected, (state, action) => {
        state.createSlotsStatus.success = null;
        state.createSlotsStatus.failure = action.payload as string;
      })
      .addCase(deleteSlots.fulfilled, (state) => {
        state.deleteSlotsStatus.success = true;
        state.deleteSlotsStatus.failure = null;
      })
      .addCase(deleteSlots.rejected, (state, action) => {
        state.deleteSlotsStatus.success = null;
        state.deleteSlotsStatus.failure = action.payload as string;
      });
  },
});

export const { resetCreateSlotsStatus, resetDeleteSlotsStatus } =
  calendarSlice.actions;
export default calendarSlice.reducer;
