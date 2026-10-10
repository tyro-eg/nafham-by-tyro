import { FC, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, IconButton } from '@mui/material';
import {
  Close,
  Logout,
  MailOutline,
  Menu,
  PhoneOutlined,
} from '@mui/icons-material';
// TODO: Uncomment when backend is ready
// import { Info } from '@mui/icons-material';

import { useAppSelector } from '../../../redux/store';
import { selectCurrentUser } from '../../../redux/user/user.selectors';
import { useSignOut } from '../../../hooks/useAuth';
import LanguageSelector from '../../../component/i18next/LanguageSelector';
import logo from '../../../assets/images/logo.png';
import Profile from '../../../assets/images/videoSession/people/profile.png';
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

  const navClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'menu-item active' : 'menu-item';

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
          <Link
            to="/"
            onClick={closeMobileHeader}
            className="app-header-mobile__logo"
          >
            <img src={logo} alt="tyro logo" />
          </Link>
          <div className="app-header-mobile__top-actions">
            {!currentUser && !mobileHeader && (
              <Button
                variant="contained"
                color="primary"
                size="small"
                className="app-header-mobile__cta"
                onClick={openFreeTrail}
              >
                {t('HEADER.TOP.FREE_TRIAL')}
              </Button>
            )}
            <IconButton
              className="app-header-mobile__toggle"
              aria-label="menu"
              aria-expanded={mobileHeader}
              onClick={() => toggleMobileHeader(!mobileHeader)}
            >
              {mobileHeader ? (
                <Close className="menu-icon" />
              ) : (
                <Menu className="menu-icon" />
              )}
            </IconButton>
          </div>
        </div>
        <div
          className={`app-header-mobile__body ${mobileHeader ? 'active' : ''}`}
        >
          {currentUser && (
            <div className="app-header__user">
              <img
                className="app-header__user-avatar"
                src={currentUser?.avatar || Profile}
                alt="profile"
              />
              <div className="app-header__user-center">
                <div className="name">
                  {currentUser?.first_name + ' ' + currentUser?.last_name}
                </div>
                {currentUser?.email && (
                  <span className="email">{currentUser.email}</span>
                )}
              </div>
            </div>
          )}

          <nav className="app-header-mobile__nav">
            {currentUser ? (
              <NavLink
                className={navClass}
                to="/dashboard"
                onClick={closeMobileHeader}
              >
                {t('NAVIGATION.DASHBOARD')}
              </NavLink>
            ) : (
              <NavLink className={navClass} to="/" onClick={closeMobileHeader}>
                {t('NAVIGATION.HOME')}
              </NavLink>
            )}
            {currentUser?.type === 'Student' && (
              <>
                <NavLink
                  className={navClass}
                  to="/home"
                  onClick={closeMobileHeader}
                >
                  {t('NAVIGATION.INSTRUCTORS')}
                </NavLink>
                <NavLink
                  className={navClass}
                  to="/my_instructors"
                  onClick={closeMobileHeader}
                >
                  {t('NAVIGATION.MY_INSTRUCTORS')}
                </NavLink>
                <NavLink
                  className={navClass}
                  to="/my_sessions"
                  onClick={closeMobileHeader}
                >
                  {t('NAVIGATION.SESSIONS')}
                </NavLink>
                <NavLink
                  className={navClass}
                  to="/my_packages"
                  onClick={closeMobileHeader}
                >
                  {t('NAVIGATION.PACKAGES')}
                </NavLink>
              </>
            )}
            {currentUser?.type === 'Tutor' && (
              <>
                <NavLink
                  className={navClass}
                  to="/my_students"
                  onClick={closeMobileHeader}
                >
                  {t('NAVIGATION.MY_STUDENTS')}
                </NavLink>
                <NavLink
                  className={navClass}
                  to="/my_sessions"
                  onClick={closeMobileHeader}
                >
                  {t('NAVIGATION.SESSIONS')}
                </NavLink>
                <NavLink
                  className={navClass}
                  to="/my_packages"
                  onClick={closeMobileHeader}
                >
                  {t('NAVIGATION.PACKAGES')}
                </NavLink>
              </>
            )}
          </nav>

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

          <div className="app-header-mobile__body-lang">
            <LanguageSelector />
          </div>

          {!currentUser && (
            <div className="app-header-mobile__body-links">
              <Button
                component={Link}
                to="/login"
                variant="outlined"
                fullWidth
                onClick={closeMobileHeader}
              >
                {t('HEADER.TOP.LOGIN')}
              </Button>
              <Button
                component={Link}
                to="/register"
                variant="outlined"
                fullWidth
                onClick={closeMobileHeader}
              >
                {t('HEADER.TOP.REGISTER')}
              </Button>
            </div>
          )}

          {!currentUser && (
            <div className="app-header-mobile__body-free-trail">
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                onClick={() => {
                  openFreeTrail();
                  closeMobileHeader();
                }}
              >
                {t('HEADER.TOP.FREE_TRIAL')}
              </Button>
            </div>
          )}

          {currentUser && (
            <div className="app-header-mobile__body-logout">
              <Button
                onClick={() => {
                  handleLogOut();
                  closeMobileHeader();
                }}
                variant="outlined"
                fullWidth
                startIcon={<Logout />}
              >
                {t('HEADER.USER.LOGOUT')}
              </Button>
            </div>
          )}

          <div className="app-header-mobile__contact">
            <a className="item" href="tel:+971507105394">
              <PhoneOutlined className="item__icon" />
              <span>(+971) 50 710 5394</span>
            </a>
            <a className="item" href="mailto:learn@nafhambytyro.com">
              <MailOutline className="item__icon" />
              <span>learn@nafhambytyro.com</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileHeader;
