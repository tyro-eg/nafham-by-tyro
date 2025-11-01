import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '../store';

/**
 * Base User Selector
 *
 * Selects the entire user slice from the Redux store.
 *
 * @param state - Root Redux state
 * @returns User slice state
 */
const selectUser = (state: RootState) => state.user;

/**
 * Select Current User
 *
 * Memoized selector that returns the current authenticated user.
 * Uses createSelector for memoization to prevent unnecessary re-renders.
 *
 * @returns Current user object or null if not authenticated
 *
 * @example
 * const currentUser = useAppSelector(selectCurrentUser);
 *
 * if (currentUser) {
 *   console.log(`Welcome, ${currentUser.first_name}!`);
 * }
 */
export const selectCurrentUser = createSelector(
  [selectUser],
  (user) => user?.currentUser,
);
