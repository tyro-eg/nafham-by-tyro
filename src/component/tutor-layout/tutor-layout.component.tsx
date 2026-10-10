import { FC, ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Avatar, IconButton, Tooltip } from '@mui/material';
import {
  AccountCircleRounded,
  DashboardRounded,
  EventNoteRounded,
  GroupsRounded,
  Inventory2Rounded,
  LogoutRounded,
  SettingsRounded,
} from '@mui/icons-material';

import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import { useSignOut } from '../../hooks/useAuth';
import { useRtlClass } from '../../assets/utils/utils';
import LanguageSelector from '../i18next/LanguageSelector';
import logo from '../../assets/images/logo.png';

import './tutor-layout.styles.scss';

interface TutorLayoutProps {
  children: ReactNode;
}

/**
 * App shell for tutors: the left sidebar (right in Arabic) replaces the
 * site header and holds the logo, navigation, language switch and the
 * account/logout block. On small screens it becomes a sticky top bar with
 * a scrollable tab row.
 */
const TutorLayout: FC<TutorLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const rtlClass = useRtlClass();
  const currentUser = useAppSelector(selectCurrentUser);
  const signOutMutation = useSignOut();

  if (currentUser?.type !== 'Tutor') return <>{children}</>;

  const items = [
    {
      to: '/dashboard',
      icon: <DashboardRounded />,
      label: t('NAVIGATION.DASHBOARD'),
    },
    {
      to: '/my_students',
      icon: <GroupsRounded />,
      label: t('NAVIGATION.MY_STUDENTS'),
    },
    {
      to: '/my_sessions',
      icon: <EventNoteRounded />,
      label: t('NAVIGATION.SESSIONS'),
    },
    {
      to: '/my_packages',
      icon: <Inventory2Rounded />,
      label: t('NAVIGATION.PACKAGES'),
    },
    {
      to: `/profile/${currentUser.id}`,
      icon: <AccountCircleRounded />,
      label: t('HEADER.USER.PROFILE'),
    },
    {
      to: '/account_settings',
      icon: <SettingsRounded />,
      label: t('HEADER.USER.SETTINGS'),
    },
  ];

  const initials = `${currentUser.first_name?.[0] || ''}${
    currentUser.last_name?.[0] || ''
  }`.toUpperCase();

  const logout = (
    <Tooltip title={t('HEADER.USER.LOGOUT')}>
      <IconButton
        className="tutor-layout__logout"
        onClick={() => signOutMutation.mutate()}
        aria-label={t('HEADER.USER.LOGOUT')}
      >
        <LogoutRounded />
      </IconButton>
    </Tooltip>
  );

  return (
    <div className={`tutor-layout ${rtlClass}`}>
      <aside className="tutor-layout__sidebar">
        <div className="tutor-layout__brand">
          <Link to="/dashboard" className="tutor-layout__logo">
            <img src={logo} alt="Nafham by Tyro" />
          </Link>
          {/* Compact controls, shown on small screens only */}
          <div className="tutor-layout__compact">
            <LanguageSelector />
            {logout}
          </div>
        </div>

        <nav
          className="tutor-layout__nav"
          aria-label={t('TUTOR_DASHBOARD.NAV')}
        >
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `tutor-layout__link${
                  isActive ? ' tutor-layout__link--active' : ''
                }`
              }
            >
              <span className="tutor-layout__icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="tutor-layout__label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="tutor-layout__footer">
          <div className="tutor-layout__language">
            <LanguageSelector />
          </div>
          <div className="tutor-layout__account">
            <Link
              to={`/profile/${currentUser.id}`}
              className="tutor-layout__account-link"
            >
              <Avatar
                src={currentUser.avatar}
                alt={currentUser.first_name}
                className="tutor-layout__avatar"
              >
                {initials}
              </Avatar>
              <span className="tutor-layout__who">
                <span className="tutor-layout__name">
                  {currentUser.first_name} {currentUser.last_name}
                </span>
                <span className="tutor-layout__role">
                  {t('TUTOR_DASHBOARD.ROLE')}
                </span>
              </span>
            </Link>
            {logout}
          </div>
        </div>
      </aside>

      <main className="tutor-layout__main">{children}</main>
    </div>
  );
};

export default TutorLayout;
