import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

import { getHomePath } from '../../assets/utils/home-path';
import { clearReturnTo, peekReturnTo } from '../../lib/return-to';

/**
 * Where someone goes once they are signed in and still on /login or
 * /register: the page that sent them to sign in (GuardedRoute remembered
 * it), or else their home page.
 */
const AfterAuth: React.FC<{ user: { type?: string } }> = ({ user }) => {
  const target = peekReturnTo() ?? getHomePath(user);

  useEffect(() => {
    clearReturnTo();
  }, []);

  return <Navigate to={target} replace />;
};

export default AfterAuth;
