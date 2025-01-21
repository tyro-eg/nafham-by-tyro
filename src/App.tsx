import React from 'react';
import { selectCurrentUser } from './redux/user/user.selectors';
import MaterialTheme from './component/material-theme/material-theme.component';
import NotistackProvider from './component/app/NotistackProvider';
import Layout from './component/app/Layout';
import RoutesComponent from './component/app/Routes';
import { useAppSelector } from './redux/store';

import './assets/styles/main.scss';
import './App.scss';

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
