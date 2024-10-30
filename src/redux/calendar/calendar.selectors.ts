import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

const selectCalendar = (state: RootState) => state.calendar;

export const selectTimeSlots = createSelector(
  [selectCalendar],
  (calendar) => calendar.timeSlots,
);

export const selectSlotsError = createSelector(
  [selectCalendar],
  (calendar) => calendar.error,
);

export const selectCreateSlotsStatus = createSelector(
  [selectCalendar],
  (calendar) => calendar.createSlotsStatus,
);

export const selectDeleteSlotsStatus = createSelector(
  [selectCalendar],
  (calendar) => calendar.deleteSlotsStatus,
);
