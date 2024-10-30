import { combineReducers } from '@reduxjs/toolkit';
import userReducer from './user/user.slice';
import calendarReducer from './calendar/calendar.slice';

const rootReducer = combineReducers({
  user: userReducer,
  calendar: calendarReducer,
});

export default rootReducer;
