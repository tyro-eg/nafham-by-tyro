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
const Handoff = lazy(
  () => import('../../modules/auth/handoff/handoff.component'),
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
const Sessions = lazy(() => import('../../modules/sessions/index.component'));
const Messages = lazy(() => import('../../modules/messages/index.component'));
const Homework = lazy(() => import('../../modules/homework/index.component'));
const HomeworkDetail = lazy(
  () => import('../../modules/homework/homework-detail/index.component'),
);
const Packages = lazy(() => import('../../modules/packages/index.component'));
const Assistant = lazy(() => import('../../modules/assistant/index.component'));
const Terms = lazy(() => import('../../modules/terms/index.component'));
const DeleteAccount = lazy(
  () => import('../../modules/delete-account/index.component'),
);
const TrialPage = lazy(() => import('../../modules/trial/index.component'));
const TrialRequests = lazy(
  () => import('../../modules/trial-requests/index.component'),
);
const RequestsPage = lazy(
  () => import('../../modules/requests/index.component'),
);
const BuyPage = lazy(() => import('../../modules/buy/index.component'));
const FamilyHome = lazy(() => import('../../modules/family/index.component'));
const FamilySettings = lazy(
  () => import('../../modules/family/family-settings.component'),
);
const FamilyNotes = lazy(
  () => import('../../modules/family/family-notes.component'),
);
const PaymentsHistory = lazy(
  () => import('../../modules/payments/history.component'),
);
const PaymentReturn = lazy(
  () => import('../../modules/payments/return.component'),
);
const NotFound404 = lazy(() => import('../../modules/404/index.component'));

interface RoutesProps {
  currentUser: CurrentUser | null;
}

const RoutesComponent: React.FC<RoutesProps> = ({ currentUser }) => {
  const isParent = currentUser?.type === 'Parent';
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route
          path="/"
          element={
            currentUser ? (
              <Navigate to={getHomePath(currentUser)} replace />
            ) : (
              <Home />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            isParent ? (
              <Navigate to="/family" replace />
            ) : (
              <GuardedRoute
                element={
                  currentUser?.type === 'Tutor' ? (
                    <TutorDashboard />
                  ) : (
                    <Dashboard />
                  )
                }
                auth={!!currentUser}
              />
            )
          }
        />
        {/* The parent's pages */}
        <Route
          path="/family"
          element={<GuardedRoute element={<FamilyHome />} auth={isParent} />}
        />
        <Route
          path="/family/settings"
          element={
            <GuardedRoute element={<FamilySettings />} auth={isParent} />
          }
        />
        <Route
          path="/family/notes"
          element={<GuardedRoute element={<FamilyNotes />} auth={isParent} />}
        />
        {/* Online renewals: receipts, and where Nomod sends the payer back */}
        <Route
          path="/payments"
          element={
            <GuardedRoute
              element={<PaymentsHistory />}
              auth={isParent || currentUser?.type === 'Student'}
            />
          }
        />
        <Route path="/payments/:slug/return" element={<PaymentReturn />} />
        <Route
          path="/login"
          element={
            currentUser ? (
              <Navigate to={getHomePath(currentUser)} />
            ) : (
              <SignIn />
            )
          }
        />
        <Route
          path="/register"
          element={
            currentUser ? (
              <Navigate to={getHomePath(currentUser)} />
            ) : (
              <Register />
            )
          }
        />
        <Route
          path="/registered"
          element={
            <GuardedRoute element={<Registered />} auth={!!currentUser} />
          }
        />
        <Route path="/impersonate" element={<Impersonate />} />
        {/* The mobile app's way into the website, signed in, to pay */}
        <Route path="/handoff" element={<Handoff />} />
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
        {/* A tutor's free-trial requests; their emails and chat notices link here */}
        <Route
          path="/trial_requests"
          element={
            <GuardedRoute
              element={<TrialRequests />}
              auth={!!currentUser && currentUser.type === 'Tutor'}
            />
          }
        />
        <Route
          path="/my_sessions"
          element={<GuardedRoute element={<Sessions />} auth={!!currentUser} />}
        />
        {/* Proposals to move a lesson or change weekly times; emails and chat notices link here */}
        <Route
          path="/requests"
          element={
            <GuardedRoute element={<RequestsPage />} auth={!!currentUser} />
          }
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
        {/* The buy wizard: a parent, or an adult student, buys a course */}
        <Route
          path="/buy"
          element={
            <GuardedRoute
              element={<BuyPage />}
              auth={isParent || currentUser?.type === 'Student'}
            />
          }
        />
        <Route path="/terms" element={<Terms />} />
        {/* Linked from the App Store and Google Play listings */}
        <Route path="/delete-account" element={<DeleteAccount />} />
        <Route path="*" element={<NotFound404 />} />
      </Routes>
    </Suspense>
  );
};

export default RoutesComponent;
