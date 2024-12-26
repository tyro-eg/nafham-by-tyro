import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppBar, Button, Container, Toolbar, Avatar } from '@mui/material';
import { Popover as TinyPopover } from 'react-tiny-popover';
import { ExpandMore, Info } from '@mui/icons-material';
import { useSelector } from 'react-redux';

import { selectCurrentUser } from '../../../redux/user/user.selectors';
import LanguageSelector from '../../../component/i18next/LanguageSelector';
import logo from '../../../assets/images/logo.png';
import { getNameInitials, rtlClass } from '../../../assets/utils/utils';

import './main-header.styles.scss';
import { signOut } from '../../../redux/user/user.actions';
import { useAppDispatch } from '../../../redux/store';

export interface HeaderProps {
  openFreeTrail: () => void;
  openEmailConfirm?: () => void;
}

const Popover = TinyPopover as React.FC<any>;

const MainHeader: React.FC<HeaderProps> = ({
  openFreeTrail,
  openEmailConfirm,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const currentUser = useSelector(selectCurrentUser);

  // const [country, setCountry] = useState('en');
  // const handleChange = (event: any) => {
  //   setCountry(event?.target?.value);
  // };

  const [isProfilePopoverOpen, setProfilePopoverOpen] = useState(false);

  const handleLogOut = async () => {
    await dispatch(signOut());
    navigate('/');
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
            <div className={`app-header__top ${rtlClass()}`}>
              <div className="contact-menu">
                <a className="item" href="tel:+201067636419">
                  (+20) 106 7636 419
                </a>
                |
                <a className="item" href="mailto:learn@tyro-app.com">
                  learn@tyro-app.com
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
                {/* <div className="app-header__top-links--lang">
                  <FormControl>
                    <Select
                      sx={{
                        margin: (theme) => theme.spacing(1),
                        minWidth: 120,
                      }}
                      id="demo-simple-select"
                      value={country}
                      onChange={handleChange}
                    >
                      <MenuItem value="en">Global</MenuItem>
                      <MenuItem value="eg">مصر</MenuItem>
                      <MenuItem value="sa">السعودية</MenuItem>
                    </Select>
                  </FormControl>
                </div> */}
              </div>
            </div>

            <div className={`app-header__bottom ${rtlClass()}`}>
              <Link to="/">
                <img src={logo} alt="tyro logo" />
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
                <Popover
                  isOpen={isProfilePopoverOpen}
                  positions={['bottom']}
                  onClickOutside={() => setProfilePopoverOpen(false)}
                  content={
                    <div className="profile-popover">
                      <div className="title">
                        <div className="name">{currentUser?.full_name}</div>
                        <span>{currentUser?.email}</span>
                      </div>

                      {currentUser?.type === 'Tutor' && (
                        <Link
                          onClick={() => setProfilePopoverOpen(false)}
                          to={`/profile/${currentUser?.id}`}
                          className="item"
                        >
                          {t('HEADER.USER.PROFILE')}
                        </Link>
                      )}

                      <Link
                        onClick={() => setProfilePopoverOpen(false)}
                        to="/account_settings"
                        className="item"
                      >
                        {t('HEADER.USER.SETTINGS')}
                      </Link>

                      <Button
                        onClick={() => {
                          handleLogOut();
                          setProfilePopoverOpen(false);
                        }}
                        variant="contained"
                        color="primary"
                      >
                        {t('HEADER.USER.LOGOUT')}
                      </Button>
                    </div>
                  }
                >
                  <Button
                    onClick={() => setProfilePopoverOpen(!isProfilePopoverOpen)}
                    className="app-header__user"
                    endIcon={<ExpandMore />}
                  >
                    {currentUser?.img ? (
                      <img src={currentUser?.img} alt="profile" />
                    ) : (
                      <Avatar>
                        {getNameInitials(
                          currentUser?.first_name + ' ' + currentUser.last_name,
                        )}
                      </Avatar>
                    )}
                    <div className="app-header__user-center">
                      <div className="name">
                        {currentUser?.first_name + ' ' + currentUser.last_name}
                      </div>
                    </div>
                  </Button>
                </Popover>
              )}
            </div>
          </div>
        </Container>
      </Toolbar>
    </AppBar>
  );
};

export default MainHeader;
