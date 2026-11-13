import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { post, patch, remove, get } from '../assets/utils/api';
import { selectCurrentUser } from '../redux/user/user.selectors';
import { snackActions } from '../assets/utils/toaster';
import { showSpinner, hideSpinner } from '../assets/utils/utils';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { setCurrentUser, clearCurrentUser } from '../redux/user/user.slice';
import { CurrentUser, ApiError, AuthHeaders } from '../assets/types';
import { setActiveChildId } from '../lib/family-child';
import { markFromApp, safeNextPath } from '../lib/from-app';
import { AUTH_KEYS, clearAuthStorage, saveTokens } from '../lib/auth-storage';

/**
 * Sign in payload
 */
interface SignInPayload {
  email: string;
  password: string;
}

/**
 * Sign up payload
 */
interface SignUpPayload {
  email: string;
  password: string;
  password_confirmation: string;
  phone_number: string;
  first_name?: string;
  last_name?: string;
  type?: string;
  country_code?: string;
  nationality?: string;
  /** Parent sign-up: the first child, a profile without a login */
  child?: { first_name: string; last_name: string };
}

/**
 * Change password payload
 */
interface ChangePasswordPayload {
  type: string;
  userData: {
    old_password: string;
    password: string;
    password_confirmation: string;
  };
}

/** The session's tokens from a sign-in, sign-up or handoff response */
const tokensFrom = (headers: AuthHeaders) => ({
  accessToken: headers['access-token'],
  refreshToken: headers['refresh-token'],
  expireAt: headers['expire-at'],
});

/**
 * Save user authentication data to local storage
 */
const saveUserDataToLocalStorage = (
  userData: CurrentUser,
  headers: AuthHeaders,
) => {
  saveTokens(tokensFrom(headers));
  localStorage.setItem(AUTH_KEYS.ID, String(userData.id));
};

/**
 * Sign in with email and password
 */
export function useSignIn() {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async (payload: SignInPayload) => {
      showSpinner();
      try {
        const {
          data: { data: signInUserData },
          headers,
        } = await post('/users/sign_in', payload);

        if (!signInUserData || !signInUserData.id) {
          throw new Error('Invalid user data received');
        }

        // Save initial auth data to localStorage
        saveUserDataToLocalStorage(signInUserData, headers as AuthHeaders);

        // Fetch complete user data from /me endpoint
        const { data: userData, headers: meHeaders } = await get('/me');

        if (!userData || !userData.id) {
          throw new Error('Invalid user data received from /me');
        }

        // Update localStorage with complete user data and any updated headers
        saveUserDataToLocalStorage(userData, meHeaders as AuthHeaders);

        return userData;
      } finally {
        hideSpinner();
      }
    },
    onSuccess: (userData) => {
      dispatch(setCurrentUser(userData));
      snackActions.success('Signed in successfully');
    },
    onError: (error: ApiError) => {
      const errorMessage =
        error.response?.data?.error || error.message || 'Sign in failed';
      snackActions.error(errorMessage);
    },
  });
}

/**
 * Sign up new user
 */
export function useSignUp() {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async (payload: SignUpPayload) => {
      showSpinner();
      try {
        const {
          data: { data: signUpUserData },
          headers,
        } = await post('/users/sign_up', payload);

        if (!signUpUserData || !signUpUserData.id) {
          throw new Error('Invalid user data received');
        }

        // Save initial auth data to localStorage
        saveUserDataToLocalStorage(signUpUserData, headers as AuthHeaders);

        // Fetch complete user data from /me endpoint
        const { data: userData, headers: meHeaders } = await get('/me');

        if (!userData || !userData.id) {
          throw new Error('Invalid user data received from /me');
        }

        // Update localStorage with complete user data and any updated headers
        saveUserDataToLocalStorage(userData, meHeaders as AuthHeaders);

        return userData;
      } finally {
        hideSpinner();
      }
    },
    onSuccess: (userData) => {
      dispatch(setCurrentUser(userData));
      snackActions.success('Account created successfully');
    },
    onError: (error: ApiError) => {
      const errorMessage =
        error.response?.data?.error || error.message || 'Sign up failed';
      snackActions.error(errorMessage);
    },
  });
}

/**
 * Sign out current user
 */
export function useSignOut() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      showSpinner();
      try {
        // Try to call the sign out endpoint, but don't fail if it errors
        try {
          await remove('/users/sign_out');
        } catch (signOutError) {
          console.warn(
            'Sign out API call failed, but continuing with local cleanup:',
            signOutError,
          );
        }

        // Always clear local storage regardless of API call result
        localStorage.clear();
      } finally {
        hideSpinner();
      }
    },
    onSuccess: () => {
      dispatch(clearCurrentUser());
      queryClient.clear(); // Clear all cached queries
      navigate('/home');
      snackActions.success('Signed out successfully');
    },
    onError: (error: ApiError) => {
      const errorMessage =
        error.response?.data?.error || error.message || 'Sign out failed';
      snackActions.error(errorMessage);
    },
  });
}

/**
 * Change password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: ChangePasswordPayload) => {
      showSpinner();
      try {
        await patch(`/${payload.type}/passwords`, payload.userData);
      } finally {
        hideSpinner();
      }
    },
    onSuccess: () => {
      snackActions.success('Password changed successfully');
    },
    onError: (error: ApiError) => {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Password change failed';
      snackActions.error(errorMessage);
    },
  });
}

/**
 * Impersonate user
 *
 * Used by admin to log in as another user using a token.
 * Clears existing user data and replaces with impersonated user.
 */
export function useImpersonate() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { token: string }) => {
      showSpinner();
      try {
        // Clear existing user data
        localStorage.clear();
        dispatch(clearCurrentUser());
        queryClient.clear();

        // Set temporary token for /me request
        localStorage.setItem('tyro.token', payload.token);

        // Fetch user data with the new token
        const { data: userData, headers } = await get('/me');

        if (!userData || !userData.id) {
          throw new Error('Invalid user data received');
        }

        // Save new user data (token is already set above)
        saveUserDataToLocalStorage(userData, headers as AuthHeaders);
        return userData;
      } catch (error) {
        // Clear token on error
        localStorage.clear();
        throw error;
      } finally {
        hideSpinner();
      }
    },
    onSuccess: (userData) => {
      dispatch(setCurrentUser(userData));
      snackActions.success('Impersonation successful');
      // A full load, so nothing of the admin's previous state survives and
      // the route that started the exchange is gone for good
      window.location.replace('/dashboard');
    },
    onError: (error: ApiError) => {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Impersonation failed. Invalid or expired token.';
      snackActions.error(errorMessage);
    },
  });
}

/**
 * Mobile app handoff
 *
 * The app opens /handoff#code=… in a browser; the single-use code is traded
 * for a normal session (tokens in the headers, as at sign-in) and the page
 * the app asked for. The tab is marked as the app's, so checkouts say
 * `client: 'mobile'` and the return page hands back to the app.
 */
export function useHandoff() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { code: string }) => {
      // Whoever was signed in on this browser before is not who the app sent
      clearAuthStorage();
      setActiveChildId(null);
      dispatch(clearCurrentUser());
      queryClient.clear();

      const {
        data: { data: handoff },
        headers,
      } = await post('/web_handoffs/redeem', payload);
      const tokens = tokensFrom(headers as AuthHeaders);
      if (!tokens.accessToken) throw new Error('No session received');
      // The refresh token too, so the session outlives the first access token
      saveTokens(tokens);

      const { data: userData, headers: meHeaders } = await get('/me');
      if (!userData || !userData.id) {
        throw new Error('Invalid user data received from /me');
      }
      saveUserDataToLocalStorage(userData, meHeaders as AuthHeaders);

      return {
        userData: userData as CurrentUser,
        next: safeNextPath(handoff?.next),
      };
    },
    onSuccess: ({ userData, next }) => {
      dispatch(setCurrentUser(userData));
      markFromApp();
      // A full load, so the page starts clean as the new user
      window.location.replace(next);
    },
    // The page shows its own message
    onError: () => clearAuthStorage(),
  });
}

/**
 * The signed-in user is kept in local storage, so its counters (upcoming,
 * completed and cancelled sessions, hours left) would otherwise stay as they
 * were at sign-in. Fetches /me once per page load while a session exists.
 */
export function useRefreshCurrentUser() {
  const dispatch = useAppDispatch();
  const signedIn = !!useAppSelector(selectCurrentUser);

  useEffect(() => {
    if (!signedIn || !localStorage.getItem('tyro.token')) return;
    get('/me')
      .then(({ data }) => {
        if (data?.id) dispatch(setCurrentUser(data));
      })
      .catch(() => {
        // an expired session is handled by the API client; nothing to do here
      });
  }, [signedIn, dispatch]);
}
