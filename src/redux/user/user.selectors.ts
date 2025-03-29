import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store'; // Import RootState

const selectUser = (state: RootState) => state.user;

export const selectCurrentUser = createSelector(
  [selectUser],
  (user) => user?.currentUser,
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

export const selectInstructors = createSelector(
  [selectUser],
  (user) => user?.instructors,
);

export const selectInstructor = createSelector(
  [selectUser],
  (user) => user?.instructor,
);

export const selectInstructorsPagination = createSelector(
  [selectUser],
  (user) => user?.instructorsPagination,
);

export const selectInstructorsLoading = createSelector(
  [selectUser],
  (user) => user?.loading?.getInstructorsLoading,
);

export const selectInstructorsError = createSelector(
  [selectUser],
  (user) => user?.errors.getInstructorsError,
);

export const selectInstructorByIdError = createSelector(
  [selectUser],
  (user) => user?.errors.getInstructorByIdError,
);

export const selectUpdateUserInfoError = createSelector(
  [selectUser],
  (user) => user?.errors.updateUserInfoError,
);

export const selectUpdateTutorInfoError = createSelector(
  [selectUser],
  (user) => user?.errors.updateTutorInfoError,
);
