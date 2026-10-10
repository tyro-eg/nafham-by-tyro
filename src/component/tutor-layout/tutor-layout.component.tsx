import { FC, ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Avatar } from '@mui/material';
import {
  AccountCircleRounded,
  DashboardRounded,
  EventNoteRounded,
  GroupsRounded,
  Inventory2Rounded,
  SettingsRounded,
} from '@mui/icons-material';

import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import { useRtlClass } from '../../assets/utils/utils';

import './tutor-layout.styles.scss';

interface TutorLayoutProps {
  children: ReactNode;
}

/**
 * Tutor area shell: a left sidebar (right in Arabic) linking the tutor's
 * pages, collapsing to a scrollable tab bar on small screens. Renders
 * children unchanged for anyone who isn't a tutor.
 */
const TutorLayout: FC<TutorLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const rtlClass = useRtlClass();
  const currentUser = useAppSelector(selectCurrentUser);

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

  return (
    <div className={`tutor-layout ${rtlClass}`}>
      <aside className="tutor-layout__sidebar">
        <div className="tutor-layout__profile">
          <Avatar
            src={currentUser.avatar}
            alt={currentUser.first_name}
            className="tutor-layout__avatar"
          >
            {`${currentUser.first_name?.[0] || ''}${
              currentUser.last_name?.[0] || ''
            }`.toUpperCase()}
          </Avatar>
          <div className="tutor-layout__who">
            <span className="tutor-layout__name">
              {currentUser.first_name} {currentUser.last_name}
            </span>
            <span className="tutor-layout__role">
              {t('TUTOR_DASHBOARD.ROLE')}
            </span>
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
                `tutor-layout__link${isActive ? ' tutor-layout__link--active' : ''}`
              }
            >
              <span className="tutor-layout__icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="tutor-layout__label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="tutor-layout__main">{children}</main>
    </div>
  );
};

export default TutorLayout;
