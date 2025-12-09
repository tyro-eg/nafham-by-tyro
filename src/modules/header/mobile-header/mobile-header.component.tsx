import { FC, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, IconButton } from '@mui/material';
import { Menu } from '@mui/icons-material';
// TODO: Uncomment when backend is ready
// import { Info } from '@mui/icons-material';

import { useAppSelector } from '../../../redux/store';
import { selectCurrentUser } from '../../../redux/user/user.selectors';
import { useSignOut } from '../../../hooks/useAuth';
import LanguageSelector from '../../../component/i18next/LanguageSelector';
import logo from '../../../assets/images/logo.png';
import { HeaderProps } from '../main-header/main-header.component';

import './mobile-header.styles.scss';

const MobileHeader: FC<HeaderProps> = ({ openFreeTrail }) => {
  // TODO: Uncomment when backend is ready
  // const MobileHeader: FC<HeaderProps> = ({ openFreeTrail, openEmailConfirm }) => {
  const { t } = useTranslation();
  const signOutMutation = useSignOut();

  const currentUser = useAppSelector(selectCurrentUser);
  const [mobileHeader, toggleMobileHeader] = useState(false);

  const handleLogOut = async () => {
    if (currentUser) {
      await signOutMutation.mutateAsync();
      // Navigate is handled in the useSignOut hook
    }
  };

  const closeMobileHeader = () => {
    toggleMobileHeader(false);
  };

  return (
    <>
      <div
        onClick={closeMobileHeader}
        className={`app-header-mobile__overlay ${mobileHeader ? 'active' : ''}`}
      ></div>
      <div className={`app-header-mobile ${mobileHeader ? 'active' : ''}`}>
        {/* TODO: Uncomment when backend is ready */}
        {/* {currentUser && !currentUser.email_confirmed && (
          <div className="header__banner">
            <Info />
            <span className="header__banner-text">
              {t('HEADER.BANNER_UNCONFIRMED.TEXT1')} {currentUser.email}{' '}
              {t('HEADER.BANNER_UNCONFIRMED.TEXT2')}{' '}
              <button
                className="header__banner-action"
                type="button"
                onClick={openEmailConfirm}
              >
                {t('HEADER.BANNER_UNCONFIRMED.ACTION')}
              </button>
            </span>
          </div>
        )} */}
        <div className="app-header-mobile__top">
          <Link to="/" onClick={closeMobileHeader}>
            <img src={logo} alt="tyro logo" />
          </Link>
          <IconButton onClick={() => toggleMobileHeader(!mobileHeader)}>
            <Menu className="menu-icon" />
          </IconButton>
        </div>
        <div
          className={`app-header-mobile__body ${mobileHeader ? 'active' : ''}`}
        >
          {currentUser && (
            <div>
              <div className="app-header__user">
                <div className="app-header__user-center">
                  <div className="name">
                    {currentUser?.first_name + ' ' + currentUser?.last_name}
                  </div>
                </div>
              </div>
            </div>
          )}

          <LanguageSelector />

          {!currentUser && (
            <div className="app-header-mobile__body-links">
              <Link className="link" to="/login" onClick={closeMobileHeader}>
                {t('HEADER.TOP.LOGIN')}
              </Link>
              <Link className="link" to="/register" onClick={closeMobileHeader}>
                {t('HEADER.TOP.REGISTER')}
              </Link>
            </div>
          )}

          {!currentUser && (
            <div className="app-header-mobile__body-free-trail">
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  openFreeTrail();
                  closeMobileHeader();
                }}
              >
                {t('HEADER.TOP.FREE_TRIAL')}
              </Button>
            </div>
          )}

          {currentUser && currentUser.type === 'Tutor' && (
            <div className="app-header-mobile__body-profile">
              <Link
                to={`/profile/${currentUser.id}`}
                className="item"
                onClick={closeMobileHeader}
              >
                {t('HEADER.USER.PROFILE')}
              </Link>

              <Link
                to="/account_settings"
                className="item"
                onClick={closeMobileHeader}
              >
                {t('HEADER.USER.SETTINGS')}
              </Link>
            </div>
          )}

          <NavLink
            className={({ isActive }) =>
              isActive ? 'menu-item active' : 'menu-item'
            }
            to="/"
            onClick={closeMobileHeader}
          >
            {t('NAVIGATION.HOME')}
          </NavLink>
          {currentUser && (
            <>
              <NavLink
                className={({ isActive }) =>
                  isActive ? 'menu-item active' : 'menu-item'
                }
                to="/home"
                onClick={closeMobileHeader}
              >
                {t('NAVIGATION.FIND_INSTRUCTOR')}
              </NavLink>

              <NavLink
                className={({ isActive }) =>
                  isActive ? 'menu-item active' : 'menu-item'
                }
                to="/my_sessions"
                onClick={closeMobileHeader}
              >
                {t('NAVIGATION.SESSIONS')}
              </NavLink>
            </>
          )}

          {currentUser && (
            <div className="app-header-mobile__body-logout">
              <Button
                onClick={() => {
                  handleLogOut();
                  closeMobileHeader();
                }}
                variant="contained"
                color="primary"
              >
                {t('HEADER.USER.LOGOUT')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileHeader;
