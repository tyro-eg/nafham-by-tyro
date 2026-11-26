import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import {
  clearReturnTo,
  justSignedOut,
  rememberReturnTo,
} from '../../lib/return-to';

interface GuardedRouteProps {
  element: React.ReactElement;
  auth: boolean;
  /**
   * For a page new visitors come to (the free trial): a signed-out visitor
   * is asked to create an account rather than to log in. They can still
   * switch to logging in from there, and come back here either way.
   */
  signUpFirst?: boolean;
}

/**
 * A page for signed-in people (or one kind of them). A signed-out visitor
 * is sent to log in and comes back to this very address afterwards, query
 * string included, so a buy link from an email still works. Someone signed
 * in without access to the page goes to their own home page.
 */
const GuardedRoute: React.FC<GuardedRouteProps> = ({
  element,
  auth,
  signUpFirst = false,
}) => {
  const location = useLocation();
  const signedIn = !!useAppSelector(selectCurrentUser);

  // They arrived: a remembered destination has done its job
  useEffect(() => {
    if (auth) clearReturnTo();
  }, [auth]);

  if (auth) return element;
  // Someone who has just signed out goes to the landing page, not to a
  // login screen that would bring the next person straight back here
  if (signedIn || justSignedOut()) return <Navigate to="/" replace />;

  rememberReturnTo(`${location.pathname}${location.search}`);
  return <Navigate to={signUpFirst ? '/register' : '/login'} replace />;
};

export default GuardedRoute;
