import { createSlice } from '@reduxjs/toolkit';
import {
  signInWithEmail,
  signOut,
  signUp,
  changePassword,
} from './user.actions';

interface UserState {
  currentUser: any;
  instructors: any | null;
  instructor: any | null;
  errors: {
    signInError: string | null;
    signOutError: string | null;
    signUpError: string | null;
    changePasswordError: string | null;
  };
}

const initialState: UserState = {
  currentUser: null,
  instructors: null,
  instructor: null,
  errors: {
    signInError: null,
    signOutError: null,
    signUpError: null,
    changePasswordError: null,
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Sign In
    builder.addCase(signInWithEmail.fulfilled, (state, action) => {
      state.currentUser = action.payload;
      state.errors.signInError = null;
    });
    builder.addCase(signInWithEmail.rejected, (state, action) => {
      if (!state.errors) {
        state.errors = {
          signInError: null,
          signOutError: null,
          signUpError: null,
          changePasswordError: null,
        };
      }

      state.errors.signInError =
        (action?.payload as string) || 'Sign in failed';
    });

    // Sign Up
    builder.addCase(signUp.fulfilled, (state, action) => {
      state.currentUser = action.payload;
      state.errors.signUpError = null;
    });
    builder.addCase(signUp.rejected, (state, action) => {
      if (!state.errors) {
        state.errors = {
          signInError: null,
          signOutError: null,
          signUpError: null,
          changePasswordError: null,
        };
      }
      state.errors.signUpError = (action.payload as string) || 'Sign up failed';
    });

    // Sign Out
    builder.addCase(signOut.fulfilled, (state) => {
      state.currentUser = null;
      state.errors.signOutError = null;
    });
    builder.addCase(signOut.rejected, (state, action) => {
      state.errors.signOutError =
        (action.payload as string) || 'Sign out failed';
    });

    // Change Password
    builder.addCase(changePassword.rejected, (state, action) => {
      state.errors.changePasswordError =
        (action.payload as string) || 'Change password failed';
    });
  },
});

export default userSlice.reducer;
