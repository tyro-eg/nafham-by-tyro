import { createSlice } from '@reduxjs/toolkit';
import {
  getSessions,
  cancelSession,
  endSession,
  bookingTrialSession,
  bookingPrivateSession,
  SessionType,
} from './session.actions';

interface SessionState {
  sessions: SessionType[] | null;
  sessionsPagination: any | null;
  error: string | null;
  cancelSessionError: string | null;
  endSessionError: string | null;
  bookingTrialStatus: { success: boolean | null; failure: string | null };
  bookingPrivateStatus: { success: boolean | null; failure: string | null };
}

const initialState: SessionState = {
  sessions: null,
  sessionsPagination: null,
  error: null,
  cancelSessionError: null,
  endSessionError: null,
  bookingTrialStatus: { success: null, failure: null },
  bookingPrivateStatus: { success: null, failure: null },
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    resetBookingTrialStatus(state) {
      state.bookingTrialStatus = { success: null, failure: null };
    },
    resetBookingPrivateStatus(state) {
      state.bookingPrivateStatus = { success: null, failure: null };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSessions.fulfilled, (state, action) => {
        state.sessions = action.payload.data;
        state.sessionsPagination = action.payload.headers;
        state.error = null;
      })
      .addCase(getSessions.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(cancelSession.fulfilled, (state) => {
        state.cancelSessionError = null;
      })
      .addCase(cancelSession.rejected, (state, action) => {
        state.cancelSessionError = action.payload as string;
      })
      .addCase(endSession.fulfilled, (state) => {
        state.endSessionError = null;
      })
      .addCase(endSession.rejected, (state, action) => {
        state.endSessionError = action.payload as string;
      })
      .addCase(bookingTrialSession.fulfilled, (state) => {
        state.bookingTrialStatus = { success: true, failure: null };
      })
      .addCase(bookingTrialSession.rejected, (state, action) => {
        state.bookingTrialStatus = {
          success: null,
          failure: action.payload as string,
        };
      })
      .addCase(bookingPrivateSession.fulfilled, (state) => {
        state.bookingPrivateStatus = { success: true, failure: null };
      })
      .addCase(bookingPrivateSession.rejected, (state, action) => {
        state.bookingPrivateStatus = {
          success: null,
          failure: action.payload as string,
        };
      });
  },
});

export const { resetBookingTrialStatus, resetBookingPrivateStatus } =
  sessionSlice.actions;
export default sessionSlice.reducer;
