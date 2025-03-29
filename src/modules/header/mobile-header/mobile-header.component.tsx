import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, IconButton } from '@mui/material';
import { Menu, Info } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../redux/store'; // Adjust import based on your store setup
import LanguageSelector from '../../../component/i18next/LanguageSelector';
import { selectCurrentUser } from '../../../redux/user/user.selectors';
import { signOut } from '../../../redux/user/user.actions';
import logo from '../../../assets/images/logo.png';

import './mobile-header.styles.scss';
import { HeaderProps } from '../main-header/main-header.component';

const MobileHeader = ({ openFreeTrail, openEmailConfirm }: HeaderProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch(); // Using typed dispatch hook

  const currentUser = useAppSelector(selectCurrentUser); // Using typed selector hook
  const [mobileHeader, toggleMobileHeader] = useState(false);
  // const [country, setCountry] = useState('en');

  // const handleChange = (event: SelectChangeEvent<string>) => {
  //   setCountry(event.target.value as string);
  // };

  const handleLogOut = () => {
    if (currentUser) {
      dispatch(signOut()).unwrap();
      navigate('/');
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
        {currentUser && !currentUser.email_confirmed && (
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
        )}
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
          {/* <div>
            <FormControl>
              <Select
                sx={{
                  margin: (theme) => theme.spacing(1),
                  minWidth: 120,
                }}
                id="demo-simple-select"
                value={country}
                onChange={(event) => {
                  handleChange(event);
                  closeMobileHeader();
                }}
              >
                <MenuItem value="en">Global</MenuItem>
                <MenuItem value="eg">مصر</MenuItem>
                <MenuItem value="sa">السعودية</MenuItem>
              </Select>
            </FormControl>
          </div> */}
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
