import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store'; // Assumes RootState is defined

const selectSession = (state: RootState) => state.session;

export const selectSessions = createSelector(
  [selectSession],
  (session) => session.sessions,
);

export const selectSessionsPagination = createSelector(
  [selectSession],
  (session) => session.sessionsPagination,
);

export const selectSessionsError = createSelector(
  [selectSession],
  (session) => session.error,
);

export const selectCancelSessionError = createSelector(
  [selectSession],
  (session) => session.cancelSessionError,
);

export const selectEndSessionError = createSelector(
  [selectSession],
  (session) => session.endSessionError,
);

export const selectBookingTrialStatus = createSelector(
  [selectSession],
  (session) => session.bookingTrialStatus,
);

export const selectBookingPrivateStatus = createSelector(
  [selectSession],
  (session) => session.bookingPrivateStatus,
);
