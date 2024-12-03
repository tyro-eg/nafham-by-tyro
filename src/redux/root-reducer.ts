import { combineReducers } from '@reduxjs/toolkit';
import userReducer from './user/user.slice';
import calendarReducer from './calendar/calendar.slice';
import SessionReducer from './session/session.slice';

const rootReducer = combineReducers({
  user: userReducer,
  calendar: calendarReducer,
  session: SessionReducer,
});

export default rootReducer;
