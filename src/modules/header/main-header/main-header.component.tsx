import { FC, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppBar, Button, Container, Toolbar, Popover } from '@mui/material';
import { ExpandMore, Info } from '@mui/icons-material';

import { useAppSelector } from '../../../redux/store';
import { selectCurrentUser } from '../../../redux/user/user.selectors';
import { useSignOut } from '../../../hooks/useAuth';
import { useRtlClass } from '../../../assets/utils/utils';
import LanguageSelector from '../../../component/i18next/LanguageSelector';
import logo from '../../../assets/images/logo.png';
import Profile from '../../../assets/images/videoSession/people/profile.png';

import './main-header.styles.scss';

export interface HeaderProps {
  openFreeTrail: () => void;
  openEmailConfirm?: () => void;
}

const MainHeader: FC<HeaderProps> = ({ openFreeTrail, openEmailConfirm }) => {
  const { t } = useTranslation();
  const signOutMutation = useSignOut();
  const rtlClass = useRtlClass();

  const currentUser = useAppSelector(selectCurrentUser);

  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const isProfilePopoverOpen = Boolean(profileAnchorEl);

  const handleLogOut = async () => {
    await signOutMutation.mutateAsync();
  };

  return (
    <AppBar sx={{ backgroundColor: '#fffffff7' }} position="fixed">
      {!!currentUser &&
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
        )}
      <Toolbar>
        <Container maxWidth="lg">
          <div className="container header-container">
            <div className={`app-header__top ${rtlClass}`}>
              <div className="contact-menu">
                <a className="item" href="tel:+971507105394">
                  (+971) 50 710 5394
                </a>
                |
                <a className="item" href="mailto:learn@nafhambytyro.com">
                  learn@nafhambytyro.com
                </a>
              </div>
              <div className="app-header__top-links">
                {!currentUser && (
                  <>
                    <Link className="link" to="/login">
                      {t('HEADER.TOP.LOGIN')}
                    </Link>
                    <Link className="link" to="/register">
                      {t('HEADER.TOP.REGISTER')}
                    </Link>
                  </>
                )}
                <div>
                  <LanguageSelector />
                </div>
              </div>
            </div>

            <div className={`app-header__bottom ${rtlClass}`}>
              <Link to="/">
                <img src={logo} alt="tyro logo" loading="lazy" />
              </Link>
              <div className="links">
                <div>
                  <NavLink
                    className={({ isActive }) =>
                      isActive ? 'menu-item active' : 'menu-item'
                    }
                    to="/"
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
                      >
                        {t('NAVIGATION.FIND_INSTRUCTOR')}
                      </NavLink>

                      <NavLink
                        className={({ isActive }) =>
                          isActive ? 'menu-item active' : 'menu-item'
                        }
                        to="/my_sessions"
                      >
                        {t('NAVIGATION.SESSIONS')}
                      </NavLink>
                    </>
                  )}
                </div>
              </div>

              {!currentUser && (
                <Button
                  onClick={openFreeTrail}
                  variant="contained"
                  color="primary"
                >
                  {t('HEADER.TOP.FREE_TRIAL')}
                </Button>
              )}

              {!!currentUser && (
                <>
                  <Button
                    onClick={(e) => setProfileAnchorEl(e.currentTarget)}
                    className="app-header__user"
                    endIcon={<ExpandMore />}
                  >
                    {currentUser?.avatar ? (
                      <img
                        src={currentUser?.avatar}
                        alt="profile"
                        loading="lazy"
                      />
                    ) : (
                      <img src={Profile} alt="profile" loading="lazy" />
                    )}
                    <div className="app-header__user-center">
                      <div className="name">
                        {currentUser?.first_name + ' ' + currentUser.last_name}
                      </div>
                    </div>
                  </Button>
                  <Popover
                    elevation={0}
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
                  >
                    <div className="profile-popover">
                      <div className="title">
                        <div className="name">
                          {currentUser?.first_name +
                            ' ' +
                            currentUser?.last_name}
                        </div>
                        <span>{currentUser?.email}</span>
                      </div>

                      {currentUser?.type === 'Tutor' && (
                        <>
                          <Link
                            onClick={() => setProfileAnchorEl(null)}
                            to={`/profile/${currentUser?.id}`}
                            className="item"
                          >
                            {t('HEADER.USER.PROFILE')}
                          </Link>

                          <Link
                            onClick={() => setProfileAnchorEl(null)}
                            to="/account_settings"
                            className="item"
                          >
                            {t('HEADER.USER.SETTINGS')}
                          </Link>
                        </>
                      )}

                      <Button
                        onClick={() => {
                          handleLogOut();
                          setProfileAnchorEl(null);
                        }}
                        variant="contained"
                        color="primary"
                      >
                        {t('HEADER.USER.LOGOUT')}
                      </Button>
                    </div>
                  </Popover>
                </>
              )}
            </div>
          </div>
        </Container>
      </Toolbar>
    </AppBar>
  );
};

export default MainHeader;
