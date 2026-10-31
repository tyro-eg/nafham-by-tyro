import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import GuardedRoute from '../guarded-route/guarded-route.component';
import Loader from './Loader';
import { CurrentUser } from '../../assets/types';
import { getHomePath } from '../../assets/utils/home-path';

const Home = lazy(() => import('../../modules/home/index'));
const CalendarPage = lazy(
  () => import('../../modules/calendar/index.component'),
);
const AvailabilityPage = lazy(
  () => import('../../modules/availability/index.component'),
);
const MySalary = lazy(() => import('../../modules/my-salary/index.component'));
const MyStudents = lazy(
  () => import('../../modules/my-students/index.component'),
);
const TutorDashboard = lazy(
  () => import('../../modules/dashboard/tutor-dashboard.component'),
);
const Dashboard = lazy(() => import('../../modules/dashboard/index.component'));
const SignIn = lazy(() => import('../../modules/auth/signin/signin.component'));
const Register = lazy(
  () => import('../../modules/auth/register/register.component'),
);
const Registered = lazy(
  () => import('../../modules/auth/registered/registered.component'),
);
const Impersonate = lazy(
  () => import('../../modules/auth/impersonate/impersonate.component'),
);
const AccountSettings = lazy(
  () => import('../../modules/user/account-settings/index'),
);
const EditProfile = lazy(() => import('../../modules/user/edit-profile'));
const PrivateSessions = lazy(
  () => import('../../modules/private-sessions/index.component'),
);
const MyInstructors = lazy(
  () => import('../../modules/my-instructors/index.component'),
);
// const CoursesList = lazy(
//   () => import('../../modules/courses/courses-list/courses-list.component'),
// );
// const CourseDetails = lazy(
//   () => import('../../modules/courses/course-details/index.component'),
// );
const Sessions = lazy(() => import('../../modules/sessions/index.component'));
const Messages = lazy(() => import('../../modules/messages/index.component'));
const Homework = lazy(() => import('../../modules/homework/index.component'));
const HomeworkDetail = lazy(
  () => import('../../modules/homework/homework-detail/index.component'),
);
const Packages = lazy(() => import('../../modules/packages/index.component'));
const Assistant = lazy(() => import('../../modules/assistant/index.component'));
const Checkout = lazy(() => import('../../modules/checkout/index.component'));
const Terms = lazy(() => import('../../modules/terms/index.component'));
const TrialPage = lazy(() => import('../../modules/trial/index.component'));
const NotFound404 = lazy(() => import('../../modules/404/index.component'));

interface RoutesProps {
  currentUser: CurrentUser | null;
}

const RoutesComponent: React.FC<RoutesProps> = ({ currentUser }) => (
  <Suspense fallback={<Loader />}>
    <Routes>
      <Route
        path="/"
        element={currentUser ? <Navigate to="/dashboard" replace /> : <Home />}
      />
      <Route
        path="/dashboard"
        element={
          <GuardedRoute
            element={
              currentUser?.type === 'Tutor' ? <TutorDashboard /> : <Dashboard />
            }
            auth={!!currentUser}
          />
        }
      />
      <Route
        path="/login"
        element={
          currentUser ? <Navigate to={getHomePath(currentUser)} /> : <SignIn />
        }
      />
      <Route
        path="/register"
        element={currentUser ? <Navigate to="/registered" /> : <Register />}
      />
      <Route
        path="/registered"
        element={<GuardedRoute element={<Registered />} auth={!!currentUser} />}
      />
      <Route path="/impersonate" element={<Impersonate />} />
      <Route
        path="/account_settings"
        element={
          <GuardedRoute
            element={<AccountSettings />}
            auth={!!currentUser && currentUser.type === 'Tutor'}
          />
        }
      />
      <Route
        path="/home"
        element={
          <GuardedRoute element={<PrivateSessions />} auth={!!currentUser} />
        }
      />
      <Route
        path="/my_instructors"
        element={
          currentUser?.type === 'Tutor' ? (
            <Navigate to="/my_students" replace />
          ) : (
            <GuardedRoute element={<MyInstructors />} auth={!!currentUser} />
          )
        }
      />
      <Route
        path="/calendar"
        element={
          <GuardedRoute element={<CalendarPage />} auth={!!currentUser} />
        }
      />
      <Route
        path="/availability"
        element={
          <GuardedRoute
            element={<AvailabilityPage />}
            auth={!!currentUser && currentUser.type === 'Tutor'}
          />
        }
      />
      <Route
        path="/my_salary"
        element={
          <GuardedRoute
            element={<MySalary />}
            auth={!!currentUser && currentUser.type === 'Tutor'}
          />
        }
      />
      <Route
        path="/my_students"
        element={
          <GuardedRoute
            element={<MyStudents />}
            auth={!!currentUser && currentUser.type === 'Tutor'}
          />
        }
      />
      <Route
        path="/assistant"
        element={
          <GuardedRoute
            element={<Assistant />}
            auth={!!currentUser && currentUser.type === 'Tutor'}
          />
        }
      />
      {/* <Route path="/courses" element={<CoursesList />} />
      <Route path="/course/:courseId" element={<CourseDetails />} /> */}
      <Route
        path="/my_sessions"
        element={<GuardedRoute element={<Sessions />} auth={!!currentUser} />}
      />
      <Route
        path="/my_packages"
        element={<GuardedRoute element={<Packages />} auth={!!currentUser} />}
      />
      <Route
        path="/messages"
        element={<GuardedRoute element={<Messages />} auth={!!currentUser} />}
      />
      <Route
        path="/messages/:channelId"
        element={<GuardedRoute element={<Messages />} auth={!!currentUser} />}
      />
      <Route
        path="/homework"
        element={<GuardedRoute element={<Homework />} auth={!!currentUser} />}
      />
      <Route
        path="/homework/:slug"
        element={
          <GuardedRoute element={<HomeworkDetail />} auth={!!currentUser} />
        }
      />
      <Route
        path="/profile/:id"
        element={
          <GuardedRoute element={<EditProfile />} auth={!!currentUser} />
        }
      />
      {/* The free-trial wizard: visitors register at the last step */}
      <Route path="/trial" element={<TrialPage />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="*" element={<NotFound404 />} />
    </Routes>
  </Suspense>
);

export default RoutesComponent;
