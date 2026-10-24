import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IconButton } from '@mui/material';
import {
  Facebook,
  Instagram,
  MailOutline,
  PhoneOutlined,
  Shop,
  Twitter,
} from '@mui/icons-material';

import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import { useRtlClass } from '../../assets/utils/utils';
import logo from '../../assets/images/logo.png';

import './footer.styles.scss';

const Footer = () => {
  const { t } = useTranslation();
  const rtlClass = useRtlClass();
  const currentUser = useAppSelector(selectCurrentUser);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'menu-item active' : 'menu-item';

  return (
    <footer className="app-footer">
      <div className="app-footer__container">
        <div className="app-footer__top">
          <div className="app-footer__brand">
            <Link to="/" className="logo">
              <img src={logo} alt="tyro logo" />
            </Link>
            <p className="app-footer__tagline">{t('LANDING.BLOCK1.TITLE')}</p>
          </div>

          <nav className={`footer-navbar ${rtlClass}`}>
            {!currentUser && (
              <NavLink className={navClass} to="/">
                {t('NAVIGATION.HOME')}
              </NavLink>
            )}
            {currentUser?.type === 'Student' && (
              <>
                <NavLink className={navClass} to="/dashboard">
                  {t('NAVIGATION.DASHBOARD')}
                </NavLink>
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
            {currentUser?.type === 'Tutor' && (
              <>
                <NavLink className={navClass} to="/dashboard">
                  {t('NAVIGATION.DASHBOARD')}
                </NavLink>
                <NavLink className={navClass} to="/my_students">
                  {t('NAVIGATION.MY_STUDENTS')}
                </NavLink>
                <NavLink className={navClass} to="/my_sessions">
                  {t('NAVIGATION.SESSIONS')}
                </NavLink>
                <NavLink className={navClass} to="/my_packages">
                  {t('NAVIGATION.PACKAGES')}
                </NavLink>
              </>
            )}
            <NavLink className={navClass} to="/terms">
              {t('NAVIGATION.TERMS')}
            </NavLink>
          </nav>

          <div className="app-footer__contact">
            <p className="app-footer__heading">{t('HEADER.TOP.CONTACT_US')}</p>
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

        <div className="app-footer__bottom">
          <p className="app-footer__rights">
            {`© ${new Date().getFullYear()} Nafham. All rights reserved.`}
          </p>
          <div className="app-footer__icons">
            <IconButton
              aria-label="Google Play"
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
              aria-label="Facebook"
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
              aria-label="Twitter"
              onClick={() =>
                window.open('https://twitter.com/NafhamEducation', '_blank')
              }
            >
              <Twitter />
            </IconButton>
            <IconButton
              aria-label="Instagram"
              onClick={() =>
                window.open('https://www.instagram.com/nafhambytyro/', '_blank')
              }
            >
              <Instagram />
            </IconButton>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
