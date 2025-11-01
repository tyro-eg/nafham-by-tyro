import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IconButton } from '@mui/material';
import { Facebook, Instagram, Shop, Twitter } from '@mui/icons-material';

import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import { useRtlClass } from '../../assets/utils/utils';
import logo from '../../assets/images/logo.png';

import './footer.styles.scss';

const Footer = () => {
  const { t } = useTranslation();
  const rtlClass = useRtlClass();
  const currentUser = useAppSelector(selectCurrentUser);

  return (
    <div className="app-footer">
      <div className="app-footer__container container">
        <Link to="/" className="logo">
          <img src={logo} alt="tyro logo" />
        </Link>
        <div className={`footer-navbar ${rtlClass}`}>
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
          <NavLink
            className={({ isActive }) =>
              isActive ? 'menu-item active' : 'menu-item'
            }
            to="/terms"
          >
            {t('NAVIGATION.TERMS')}
          </NavLink>
        </div>
        <div className="app-footer__bottom">
          <p className="app-footer__rights">
            {`© ${new Date().getFullYear()} Nafham. All rights reserved.`}
          </p>
          <div className="app-footer__icons">
            <IconButton
              onClick={() =>
                window.open(
                  'https://play.google.com/store/apps/details?id=com.nafham.education&hl=en&gl=US',
                  '_blank',
                )
              }
            >
              <Shop />
            </IconButton>
            <IconButton
              onClick={() =>
                window.open(
                  'https://www.facebook.com/NafhamEducation',
                  '_blank',
                )
              }
            >
              <Facebook />
            </IconButton>
            <IconButton
              onClick={() =>
                window.open('https://twitter.com/NafhamEducation', '_blank')
              }
            >
              <Twitter />
            </IconButton>
            <IconButton
              onClick={() =>
                window.open('https://www.instagram.com/nafhambytyro/', '_blank')
              }
            >
              <Instagram />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
