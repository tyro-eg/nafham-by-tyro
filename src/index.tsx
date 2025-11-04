import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import App from './App';
import store, { persistor } from './redux/store';
import { queryClient } from './lib/queryClient';
import { initSentry } from './lib/sentry';
import { initAnalytics } from './lib/analytics';
import ErrorBoundary from './component/error-boundary/error-boundary.component';
import reportWebVitals from './reportWebVitals';

import './index.css';

// Initialize Sentry for error tracking
initSentry();

// Initialize Google Analytics
initAnalytics();

/**
 * Application Entry Point
 *
 * Provider hierarchy (from outer to inner):
 * 1. React.StrictMode - Development mode checks
 * 2. ErrorBoundary - Catch and report JavaScript errors to Sentry
 * 3. QueryClientProvider - TanStack Query for server state
 * 4. Provider - Redux for client-side persisted state
 * 5. BrowserRouter - React Router for navigation
 * 6. PersistGate - Delays render until Redux state is rehydrated
 * 7. App - Main application component
 */
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <BrowserRouter>
            <PersistGate loading={null} persistor={persistor}>
              <App />
            </PersistGate>
          </BrowserRouter>
        </Provider>
        {/* TanStack Query DevTools - only visible in development */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);

// Measure performance (optional)
// Pass a function to log results (e.g., reportWebVitals(console.log))
// or send to an analytics endpoint
reportWebVitals();
