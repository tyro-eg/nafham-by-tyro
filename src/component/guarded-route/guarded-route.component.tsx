import React from 'react';
import { Navigate } from 'react-router-dom';

interface GuardedRouteProps {
  element: React.ReactElement;
  auth: boolean;
}

const GuardedRoute: React.FC<GuardedRouteProps> = ({ element, auth }) => {
  return auth ? element : <Navigate to="/" />;
};

export default GuardedRoute;
