import React from 'react';

import { useAppSelector } from './redux/store';
import { selectCurrentUser } from './redux/user/user.selectors';
import MaterialTheme from './component/material-theme/material-theme.component';
import NotistackProvider from './component/app/NotistackProvider';
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
 * 3. Layout - Header, Footer, and page structure
 * 4. RoutesComponent - Application routing
 *
 * State Management:
 * - Redux: User authentication state (persisted)
 * - TanStack Query: All server data (sessions, instructors, calendar)
 */
const App: React.FC = () => {
  const currentUser = useAppSelector(selectCurrentUser);

  return (
    <MaterialTheme>
      <NotistackProvider>
        <Layout>
          <RoutesComponent currentUser={currentUser} />
        </Layout>
      </NotistackProvider>
    </MaterialTheme>
  );
};

export default App;
