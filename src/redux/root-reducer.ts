import { combineReducers } from '@reduxjs/toolkit';

import userReducer from './user/user.slice';

/**
 * Root Reducer
 *
 * Combines all feature slices into a single root reducer.
 *
 * Current slices:
 * - user: Manages current authenticated user state
 *
 * Note: After migration to TanStack Query, Redux is only used for
 * client-side state that needs to be persisted (e.g., currentUser).
 * All server state (sessions, instructors, calendar) is managed by
 * TanStack Query for better caching and synchronization.
 */
const rootReducer = combineReducers({
  user: userReducer,
});

export default rootReducer;
