import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store'; // Import RootState

const selectUser = (state: RootState) => state.user;

export const selectCurrentUser = createSelector(
  [selectUser],
  (user) => user?.currentUser,
);

export const selectInstructors = createSelector(
  [selectUser],
  (user) => user?.instructors,
);

export const selectSignInError = createSelector([selectUser], (user) => {
  return user?.errors.signInError;
});

export const selectSignUpError = createSelector(
  [selectUser],
  (user) => user?.errors.signUpError,
);

export const selectChangePasswordError = createSelector(
  [selectUser],
  (user) => user?.errors.changePasswordError,
);
