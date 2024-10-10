import React from 'react';
import { selectCurrentUser } from './redux/user/user.selectors';
import MaterialTheme from './component/material-theme/material-theme.component';
import NotistackProvider from './component/app/NotistackProvider';
import Layout from './component/app/Layout';
import RoutesComponent from './component/app/Routes';
import i18n from './component/i18next/i18n';
import { useAppSelector } from './redux/store';

import './assets/styles/main.scss';
import './App.scss';

const App: React.FC = () => {
  const currentUser = useAppSelector(selectCurrentUser);

  // Set the document direction based on i18n language direction
  document.getElementById('direction')!.dir = i18n.dir();

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
