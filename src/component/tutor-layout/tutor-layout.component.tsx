import { FC, ReactNode, useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Avatar, IconButton, Tooltip } from '@mui/material';
import {
  AccountCircleRounded,
  CloseRounded,
  DashboardRounded,
  EventNoteRounded,
  GroupsRounded,
  Inventory2Rounded,
  LogoutRounded,
  MenuRounded,
  PaymentsRounded,
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
 * account/logout block. On small screens a slim top bar with a menu button
 * slides the same sidebar in as a drawer.
 */
const TutorLayout: FC<TutorLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const rtlClass = useRtlClass();
  const currentUser = useAppSelector(selectCurrentUser);
  const signOutMutation = useSignOut();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close the phone drawer whenever the page changes
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Close the drawer with Escape
  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

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
      to: '/my_salary',
      icon: <PaymentsRounded />,
      label: t('NAVIGATION.MY_SALARY'),
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
    <div
      className={`tutor-layout ${rtlClass}${
        drawerOpen ? ' tutor-layout--open' : ''
      }`}
    >
      {/* Small screens: top bar that opens the sidebar as a drawer */}
      <header className="tutor-layout__topbar">
        <IconButton
          className="tutor-layout__menu"
          onClick={() => setDrawerOpen(true)}
          aria-label={t('TUTOR_DASHBOARD.OPEN_MENU')}
          aria-expanded={drawerOpen}
          aria-controls="tutor-sidebar"
        >
          <MenuRounded />
        </IconButton>
        <Link to="/dashboard" className="tutor-layout__logo">
          <img src={logo} alt="Nafham by Tyro" />
        </Link>
        <Avatar
          src={currentUser.avatar}
          alt={currentUser.first_name}
          className="tutor-layout__topbar-avatar"
        >
          {initials}
        </Avatar>
      </header>

      <div
        className="tutor-layout__overlay"
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      <aside className="tutor-layout__sidebar" id="tutor-sidebar">
        <div className="tutor-layout__brand">
          <Link to="/dashboard" className="tutor-layout__logo">
            <img src={logo} alt="Nafham by Tyro" />
          </Link>
          <IconButton
            className="tutor-layout__close"
            onClick={() => setDrawerOpen(false)}
            aria-label={t('TUTOR_DASHBOARD.CLOSE_MENU')}
          >
            <CloseRounded />
          </IconButton>
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
