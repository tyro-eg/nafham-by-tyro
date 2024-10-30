import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import rootReducer from './root-reducer';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'], // Only persist the user reducer
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'], // Avoid non-serializable errors
      },
    }),
  devTools: process.env.NODE_ENV !== 'production', // Enable Redux DevTools only in development
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const persistor = persistStore(store);
export default store;
