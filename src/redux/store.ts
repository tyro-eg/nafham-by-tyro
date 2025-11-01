import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import rootReducer from './root-reducer';

/**
 * Redux Persist Configuration
 *
 * Persists user state to localStorage for session persistence.
 * Only the 'user' slice is whitelisted to avoid storing unnecessary data.
 */
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'], // Only persist user state
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Redux Store Configuration
 *
 * Configured with:
 * - Redux Toolkit for simplified Redux setup
 * - Redux Persist for state persistence
 * - Serializable check ignoring persist actions
 * - DevTools enabled in development only
 */
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

/**
 * Type representing the entire Redux state tree
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * Type representing the Redux dispatch function
 */
export type AppDispatch = typeof store.dispatch;

/**
 * Typed version of useDispatch hook
 *
 * @returns Dispatch function with correct types
 * @example
 * const dispatch = useAppDispatch();
 * dispatch(setCurrentUser(user));
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Typed version of useSelector hook
 *
 * @example
 * const currentUser = useAppSelector(selectCurrentUser);
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Redux Persist persistor instance
 * Used to control persistence behavior
 */
export const persistor = persistStore(store);

export default store;
