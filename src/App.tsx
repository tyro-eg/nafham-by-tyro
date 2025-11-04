import React, { useEffect } from 'react';

import { useAppSelector } from './redux/store';
import { selectCurrentUser } from './redux/user/user.selectors';
import { setSentryUser } from './lib/sentry';
import { trackUser } from './lib/analytics';
import MaterialTheme from './component/material-theme/material-theme.component';
import NotistackProvider from './component/app/NotistackProvider';
import AnalyticsTracker from './component/app/AnalyticsTracker';
import Layout from './component/app/Layout';
import RoutesComponent from './component/app/Routes';

import './assets/styles/main.scss';
import './App.scss';

/**
 * Main App Component
 *
 * Component hierarchy:
 * 1. MaterialTheme - MUI theme provider with RTL support
 * 2. NotistackProvider - Snackbar notifications
 * 3. AnalyticsTracker - Automatic page view tracking
 * 4. Layout - Header, Footer, and page structure
 * 5. RoutesComponent - Application routing
 *
 * State Management:
 * - Redux: User authentication state (persisted)
 * - TanStack Query: All server data (sessions, instructors, calendar)
 *
 * Side Effects:
 * - Updates Sentry user context when currentUser changes
 * - Updates Google Analytics user ID when currentUser changes
 */
const App: React.FC = () => {
  const currentUser = useAppSelector(selectCurrentUser);

  // Update Sentry user context and GA user ID when user logs in/out
  useEffect(() => {
    setSentryUser(currentUser);

    if (currentUser) {
      trackUser(String(currentUser.id), {
        user_type: currentUser.type,
        email: currentUser.email,
      });
    }
  }, [currentUser]);

  return (
    <MaterialTheme>
      <NotistackProvider>
        <AnalyticsTracker />
        <Layout>
          <RoutesComponent currentUser={currentUser} />
        </Layout>
      </NotistackProvider>
    </MaterialTheme>
  );
};

export default App;
