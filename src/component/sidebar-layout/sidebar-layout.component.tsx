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
  PeopleAltRounded,
  PersonSearchRounded,
  SettingsRounded,
} from '@mui/icons-material';

import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import { useSignOut } from '../../hooks/useAuth';
import { useRtlClass } from '../../assets/utils/utils';
import LanguageSelector from '../i18next/LanguageSelector';
import logo from '../../assets/images/logo.png';

import './sidebar-layout.styles.scss';

interface SidebarLayoutProps {
  children: ReactNode;
}

/**
 * App shell for signed-in users (students and tutors): the left sidebar
 * (right in Arabic) replaces the site header and holds the logo, the
 * role's navigation, the language switch and the account/logout block.
 * On small screens a slim top bar with a menu button slides the same
 * sidebar in as a drawer. Visitors get children unchanged.
 */
const SidebarLayout: FC<SidebarLayoutProps> = ({ children }) => {
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

  if (!currentUser) return <>{children}</>;

  const isTutor = currentUser.type === 'Tutor';

  const tutorItems = [
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

  const studentItems = [
    {
      to: '/dashboard',
      icon: <DashboardRounded />,
      label: t('NAVIGATION.DASHBOARD'),
    },
    {
      to: '/my_instructors',
      icon: <PeopleAltRounded />,
      label: t('NAVIGATION.MY_INSTRUCTORS'),
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
  ];

  const items = isTutor ? tutorItems : studentItems;
  const accountLink = isTutor ? `/profile/${currentUser.id}` : '/dashboard';
  const roleLabel = isTutor ? t('TUTOR_DASHBOARD.ROLE') : t('DASHBOARD.ROLE');

  const initials = `${currentUser.first_name?.[0] || ''}${
    currentUser.last_name?.[0] || ''
  }`.toUpperCase();

  const logout = (
    <Tooltip title={t('HEADER.USER.LOGOUT')}>
      <IconButton
        className="side-layout__logout"
        onClick={() => signOutMutation.mutate()}
        aria-label={t('HEADER.USER.LOGOUT')}
      >
        <LogoutRounded />
      </IconButton>
    </Tooltip>
  );

  return (
    <div
      className={`side-layout ${rtlClass}${
        drawerOpen ? ' side-layout--open' : ''
      }`}
    >
      {/* Small screens: top bar that opens the sidebar as a drawer */}
      <header className="side-layout__topbar">
        <IconButton
          className="side-layout__menu"
          onClick={() => setDrawerOpen(true)}
          aria-label={t('NAVIGATION.OPEN_MENU')}
          aria-expanded={drawerOpen}
          aria-controls="app-sidebar"
        >
          <MenuRounded />
        </IconButton>
        <Link to="/dashboard" className="side-layout__logo">
          <img src={logo} alt="Nafham by Tyro" />
        </Link>
        <Avatar
          src={currentUser.avatar}
          alt={currentUser.first_name}
          className="side-layout__topbar-avatar"
        >
          {initials}
        </Avatar>
      </header>

      <div
        className="side-layout__overlay"
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      <aside className="side-layout__sidebar" id="app-sidebar">
        <div className="side-layout__brand">
          <Link to="/dashboard" className="side-layout__logo">
            <img src={logo} alt="Nafham by Tyro" />
          </Link>
          <IconButton
            className="side-layout__close"
            onClick={() => setDrawerOpen(false)}
            aria-label={t('NAVIGATION.CLOSE_MENU')}
          >
            <CloseRounded />
          </IconButton>
        </div>

        <nav className="side-layout__nav" aria-label={t('NAVIGATION.MENU')}>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setDrawerOpen(false)}
              className={({ isActive }) =>
                `side-layout__link${
                  isActive ? ' side-layout__link--active' : ''
                }`
              }
            >
              <span className="side-layout__icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="side-layout__label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="side-layout__footer">
          {!isTutor && (
            <NavLink
              to="/home"
              onClick={() => setDrawerOpen(false)}
              className={({ isActive }) =>
                `side-layout__browse${
                  isActive ? ' side-layout__browse--active' : ''
                }`
              }
            >
              <PersonSearchRounded aria-hidden="true" />
              {t('NAVIGATION.BROWSE_INSTRUCTORS')}
            </NavLink>
          )}
          <div className="side-layout__language">
            <LanguageSelector />
          </div>
          <div className="side-layout__account">
            <Link to={accountLink} className="side-layout__account-link">
              <Avatar
                src={currentUser.avatar}
                alt={currentUser.first_name}
                className="side-layout__avatar"
              >
                {initials}
              </Avatar>
              <span className="side-layout__who">
                <span className="side-layout__name">
                  {currentUser.first_name} {currentUser.last_name}
                </span>
                <span className="side-layout__role">{roleLabel}</span>
              </span>
            </Link>
            {logout}
          </div>
        </div>
      </aside>

      <main className="side-layout__main">{children}</main>
    </div>
  );
};

export default SidebarLayout;
