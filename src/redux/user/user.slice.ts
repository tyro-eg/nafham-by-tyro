import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { CurrentUser } from '../../assets/types';

/**
 * User State Interface
 *
 * Represents the user slice of the Redux store.
 * Contains only client-side user authentication state.
 */
interface UserState {
  currentUser: CurrentUser | null;
}

/**
 * Initial User State
 *
 * Starts with no authenticated user.
 * State is hydrated from localStorage via Redux Persist.
 */
const initialState: UserState = {
  currentUser: null,
};

/**
 * User Slice
 *
 * Manages current authenticated user state.
 *
 * Purpose:
 * - Store authenticated user information
 * - Persist user session across page reloads
 * - Provide access to user data throughout the app
 *
 * Note: This is the ONLY Redux slice after migration to TanStack Query.
 * All other data is managed by TanStack Query for better server state handling.
 */
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    /**
     * Set Current User
     *
     * Called after successful login or when user data is fetched.
     *
     * @param state - Current user state
     * @param action - Action containing user data
     *
     * @example
     * dispatch(setCurrentUser({
     *   id: 1,
     *   email: 'user@example.com',
     *   first_name: 'John',
     *   // ... other user fields
     * }));
     */
    setCurrentUser: (state, action: PayloadAction<CurrentUser>) => {
      state.currentUser = action.payload;
    },

    /**
     * Clear Current User
     *
     * Called on logout or session expiration.
     * Removes user data from state (persisted state is also cleared).
     *
     * @param state - Current user state
     *
     * @example
     * dispatch(clearCurrentUser());
     */
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
  },
});

export const { setCurrentUser, clearCurrentUser } = userSlice.actions;
export default userSlice.reducer;
