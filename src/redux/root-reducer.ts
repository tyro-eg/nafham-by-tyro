import { combineReducers } from '@reduxjs/toolkit';
import userReducer from './user/user.slice'; // Convert userReducer to Redux Toolkit slice

const rootReducer = combineReducers({
  user: userReducer,
});

export default rootReducer;
