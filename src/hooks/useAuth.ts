import { useMutation, useQueryClient } from '@tanstack/react-query';
import { post, patch, remove, get } from '../assets/utils/api';
import { snackActions } from '../assets/utils/toaster';
import { showSpinner, hideSpinner } from '../assets/utils/utils';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../redux/store';
import { setCurrentUser, clearCurrentUser } from '../redux/user/user.slice';
import { CurrentUser, ApiError, AuthHeaders } from '../assets/types';

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

/**
 * Save user authentication data to local storage
 */
const saveUserDataToLocalStorage = (
  userData: CurrentUser,
  headers: AuthHeaders,
) => {
  const {
    'access-token': accessToken,
    'refresh-token': refreshToken,
    'expire-at': expireAt,
  } = headers;

  if (accessToken) localStorage.setItem('tyro.token', accessToken);
  if (refreshToken) localStorage.setItem('tyro.refreshToken', refreshToken);
  if (expireAt) localStorage.setItem('tyro.expireAt', expireAt);
  localStorage.setItem('tyro.id', String(userData.id));
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
