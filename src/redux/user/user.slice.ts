import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  signInWithEmail,
  signOut,
  signUp,
  changePassword,
  getInstructors,
  getInstructorById,
  updateUserInfo,
  updateTutorInfo,
} from './user.actions';
import { CurrentUser, Instructor } from '../../assets/types';

interface UserState {
  currentUser: CurrentUser | null;
  instructors: Instructor[] | null;
  instructor: Instructor | null;
  instructorsPagination: any | null;
  errors: {
    signInError: string | null;
    signOutError: string | null;
    signUpError: string | null;
    changePasswordError: string | null;
    getInstructorsError: string | null;
    updateUserInfoError: string | null;
    updateTutorInfoError: string | null;
    getInstructorByIdError: string | null;
  };
  loading: {
    getInstructorsLoading: boolean;
  };
}

const initialState: UserState = {
  currentUser: null,
  instructors: null,
  instructor: null,
  instructorsPagination: null,
  errors: {
    signInError: null,
    signOutError: null,
    signUpError: null,
    changePasswordError: null,
    getInstructorsError: null,
    updateUserInfoError: null,
    updateTutorInfoError: null,
    getInstructorByIdError: null,
  },
  loading: {
    getInstructorsLoading: false,
  },
};

// Helper to safely handle payload errors
const setError = (
  state: UserState,
  key: keyof UserState['errors'],
  action: PayloadAction<unknown | string | undefined>,
) => {
  state.errors[key] =
    typeof action.payload === 'string'
      ? action.payload
      : `${key.replace('Error', '')} failed`;
};

// Helper to safely update loading state
const setLoading = (
  state: UserState,
  key: keyof UserState['loading'],
  isLoading: boolean,
) => {
  if (!state.loading) state.loading = {} as UserState['loading']; // Ensure loading is initialized
  state.loading[key] = isLoading;
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Sign In
    builder
      .addCase(signInWithEmail.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.errors.signInError = null;
      })
      .addCase(signInWithEmail.rejected, (state, action) => {
        setError(state, 'signInError', action);
      });

    // Sign Up
    builder
      .addCase(signUp.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.errors.signUpError = null;
      })
      .addCase(signUp.rejected, (state, action) => {
        setError(state, 'signUpError', action);
      });

    // Sign Out
    builder
      .addCase(signOut.fulfilled, (state) => {
        state.currentUser = null;
        state.errors.signOutError = null;
      })
      .addCase(signOut.rejected, (state, action) => {
        setError(state, 'signOutError', action);
      });

    // Change Password
    builder.addCase(changePassword.rejected, (state, action) => {
      setError(state, 'changePasswordError', action);
    });

    // Get Instructors
    builder
      .addCase(getInstructors.pending, (state) => {
        setLoading(state, 'getInstructorsLoading', true);
      })
      .addCase(getInstructors.fulfilled, (state, action) => {
        setLoading(state, 'getInstructorsLoading', false);
        state.instructors = action.payload.data;
        state.instructorsPagination = action.payload.headers;
      })
      .addCase(getInstructors.rejected, (state, action) => {
        setLoading(state, 'getInstructorsLoading', false);
        setError(state, 'getInstructorsError', action);
      })

      .addCase(getInstructorById.fulfilled, (state, action) => {
        state.instructor = action.payload;
      })
      .addCase(getInstructorById.rejected, (state, action) => {
        setError(state, 'getInstructorByIdError', action);
      })
      .addCase(updateUserInfo.fulfilled, (state) => {
        state.errors.updateUserInfoError = null;
      })
      .addCase(updateUserInfo.rejected, (state, action) => {
        setError(state, 'updateUserInfoError', action);
      })
      .addCase(updateTutorInfo.fulfilled, (state, action) => {
        state.currentUser = {
          ...state.currentUser,
          first_name: action.payload.first_name,
          last_name: action.payload.last_name,
          email: action.payload.email,
          phone_number: action.payload.phone_number,
        } as CurrentUser;
        state.errors.updateTutorInfoError = null;
      })
      .addCase(updateTutorInfo.rejected, (state, action) => {
        setError(state, 'updateTutorInfoError', action);
      });
  },
});

export default userSlice.reducer;
