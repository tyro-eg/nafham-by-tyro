import { FC, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppBar, Button, Popover } from '@mui/material';
import {
  ExpandMore,
  Logout,
  MailOutline,
  PersonOutline,
  PhoneOutlined,
  SettingsOutlined,
} from '@mui/icons-material';
// TODO: Uncomment when backend is ready
// import { Info } from '@mui/icons-material';

import { useAppSelector } from '../../../redux/store';
import { selectCurrentUser } from '../../../redux/user/user.selectors';
import { useSignOut } from '../../../hooks/useAuth';
import LanguageSelector from '../../../component/i18next/LanguageSelector';
import logo from '../../../assets/images/logo.png';
import Profile from '../../../assets/images/videoSession/people/profile.png';

import './main-header.styles.scss';

export interface HeaderProps {
  openFreeTrail: () => void;
  // TODO: Uncomment when backend is ready
  // openEmailConfirm?: () => void;
}

const MainHeader: FC<HeaderProps> = ({ openFreeTrail }) => {
  // TODO: Uncomment when backend is ready
  // const MainHeader: FC<HeaderProps> = ({ openFreeTrail, openEmailConfirm }) => {
  const { t } = useTranslation();
  const signOutMutation = useSignOut();

  const currentUser = useAppSelector(selectCurrentUser);

  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const isProfilePopoverOpen = Boolean(profileAnchorEl);

  const handleLogOut = async () => {
    await signOutMutation.mutateAsync();
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'menu-item active' : 'menu-item';

  const fullName = `${currentUser?.first_name ?? ''} ${
    currentUser?.last_name ?? ''
  }`.trim();

  return (
    <AppBar position="fixed" className="app-header">
      {/* TODO: Uncomment when backend is ready */}
      {/* {!!currentUser &&
        !!currentUser?.email &&
        !currentUser?.email_confirmed && (
          <div className="header__banner">
            <Info />
            <span className="header__banner-text">
              {t('HEADER.BANNER_UNCONFIRMED.TEXT1')} {currentUser?.email}{' '}
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
      <div className="app-header__strip">
        <div className="app-header__inner">
          <div className="contact-menu">
            <a className="item" href="tel:+971507105394">
              <PhoneOutlined className="item__icon" />
              <span>(+971) 50 710 5394</span>
            </a>
            <a className="item" href="mailto:learn@nafhambytyro.com">
              <MailOutline className="item__icon" />
              <span>learn@nafhambytyro.com</span>
            </a>
          </div>
          {!currentUser && (
            <Link className="app-header__strip-link" to="/register">
              {t('HEADER.TOP.REGISTER')}
            </Link>
          )}
        </div>
      </div>

      <div className="app-header__bar">
        <div className="app-header__inner">
          <Link to="/" className="app-header__logo">
            <img src={logo} alt="tyro logo" loading="lazy" />
          </Link>

          <nav className="app-header__nav">
            {currentUser ? (
              <NavLink className={navClass} to="/dashboard">
                {t('NAVIGATION.DASHBOARD')}
              </NavLink>
            ) : (
              <NavLink className={navClass} to="/">
                {t('NAVIGATION.HOME')}
              </NavLink>
            )}
            {/* Tutors navigate their area from the dashboard sidebar */}
            {currentUser?.type === 'Student' && (
              <>
                <NavLink className={navClass} to="/home">
                  {t('NAVIGATION.INSTRUCTORS')}
                </NavLink>
                <NavLink className={navClass} to="/my_instructors">
                  {t('NAVIGATION.MY_INSTRUCTORS')}
                </NavLink>
                <NavLink className={navClass} to="/my_sessions">
                  {t('NAVIGATION.SESSIONS')}
                </NavLink>
                <NavLink className={navClass} to="/my_packages">
                  {t('NAVIGATION.PACKAGES')}
                </NavLink>
              </>
            )}
          </nav>

          <div className="app-header__actions">
            <LanguageSelector />

            {!currentUser && (
              <>
                <Button
                  component={Link}
                  to="/login"
                  color="inherit"
                  className="app-header__login"
                >
                  {t('HEADER.TOP.LOGIN')}
                </Button>
                <Button
                  onClick={openFreeTrail}
                  variant="contained"
                  color="primary"
                  className="app-header__cta"
                >
                  {t('HEADER.TOP.FREE_TRIAL')}
                </Button>
              </>
            )}

            {!!currentUser && (
              <>
                <Button
                  onClick={(e) => setProfileAnchorEl(e.currentTarget)}
                  className="app-header__user"
                  color="inherit"
                  endIcon={<ExpandMore />}
                  aria-haspopup="true"
                  aria-expanded={isProfilePopoverOpen}
                >
                  <img
                    className="app-header__avatar"
                    src={currentUser?.avatar || Profile}
                    alt="profile"
                    loading="lazy"
                  />
                  <span className="app-header__user-name">{fullName}</span>
                </Button>
                <Popover
                  open={isProfilePopoverOpen}
                  anchorEl={profileAnchorEl}
                  onClose={() => setProfileAnchorEl(null)}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  slotProps={{ paper: { className: 'profile-popover-paper' } }}
                >
                  <div className="profile-popover">
                    <div className="profile-popover__head">
                      <img
                        className="profile-popover__avatar"
                        src={currentUser?.avatar || Profile}
                        alt="profile"
                        loading="lazy"
                      />
                      <div className="profile-popover__meta">
                        <div className="name">{fullName}</div>
                        <span className="email">{currentUser?.email}</span>
                      </div>
                    </div>

                    {currentUser?.type === 'Tutor' && (
                      <div className="profile-popover__links">
                        <Link
                          onClick={() => setProfileAnchorEl(null)}
                          to={`/profile/${currentUser?.id}`}
                          className="item"
                        >
                          <PersonOutline className="item__icon" />
                          {t('HEADER.USER.PROFILE')}
                        </Link>

                        <Link
                          onClick={() => setProfileAnchorEl(null)}
                          to="/account_settings"
                          className="item"
                        >
                          <SettingsOutlined className="item__icon" />
                          {t('HEADER.USER.SETTINGS')}
                        </Link>
                      </div>
                    )}

                    <div className="profile-popover__footer">
                      <Button
                        onClick={() => {
                          handleLogOut();
                          setProfileAnchorEl(null);
                        }}
                        variant="outlined"
                        fullWidth
                        startIcon={<Logout />}
                        className="logout-button"
                      >
                        {t('HEADER.USER.LOGOUT')}
                      </Button>
                    </div>
                  </div>
                </Popover>
              </>
            )}
          </div>
        </div>
      </div>
    </AppBar>
  );
};

export default MainHeader;
