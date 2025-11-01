import { useMutation, useQueryClient } from '@tanstack/react-query';
import { post, patch, remove } from '../assets/utils/api';
import { snackActions } from '../assets/utils/toaster';
import { showSpinner, hideSpinner } from '../assets/utils/utils';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../redux/store';
import { setCurrentUser, clearCurrentUser } from '../redux/user/user.slice';

interface SignInPayload {
  email: string;
  password: string;
}

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

interface ChangePasswordPayload {
  type: string;
  userData: {
    old_password: string;
    password: string;
    password_confirmation: string;
  };
}

const saveUserDataToLocalStorage = (userData: any, headers: any) => {
  const {
    'access-token': accessToken,
    'refresh-token': refreshToken,
    'expire-at': expireAt,
  } = headers;

  localStorage.setItem('tyro.token', accessToken);
  localStorage.setItem('tyro.refreshToken', refreshToken);
  localStorage.setItem('tyro.expireAt', expireAt);
  localStorage.setItem('tyro.id', userData.id);
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
          data: { data: userData },
          headers,
        } = await post('/users/sign_in', payload);

        if (!userData || !userData.id) {
          throw new Error('Invalid user data received');
        }

        saveUserDataToLocalStorage(userData, headers);
        return userData;
      } finally {
        hideSpinner();
      }
    },
    onSuccess: (userData) => {
      dispatch(setCurrentUser(userData));
      snackActions.success('Signed in successfully');
    },
    onError: (error: any) => {
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
          data: { data: userData },
          headers,
        } = await post('/users/sign_up', payload);

        if (!userData || !userData.id) {
          throw new Error('Invalid user data received');
        }

        saveUserDataToLocalStorage(userData, headers);
        return userData;
      } finally {
        hideSpinner();
      }
    },
    onSuccess: (userData) => {
      dispatch(setCurrentUser(userData));
      snackActions.success('Account created successfully');
    },
    onError: (error: any) => {
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
    onError: (error: any) => {
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
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Password change failed';
      snackActions.error(errorMessage);
    },
  });
}
