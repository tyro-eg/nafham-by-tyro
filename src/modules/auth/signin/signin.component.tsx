import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FormatQuote, Star } from '@mui/icons-material';

import Login from '../../../component/login/login.component';
import logo from '../../../assets/images/logo.png';
import tutor from '../../../assets/images/newLanding/instructor1-cutout.webp';

import './signin.styles.scss';

/**
 * Sign in: a brand panel with a tutor and one parent's words beside a
 * plain form. On phones the panel collapses to a short banner.
 */
const SignIn: FC = () => {
  const { t } = useTranslation();

  return (
    <div className="signin">
      <aside className="signin__panel" aria-hidden="true">
        <Link to="/" className="signin__logo">
          <img src={logo} alt="" />
        </Link>
        <div className="signin__panel-copy">
          <p className="signin__eyebrow">{t('LOGIN.PANEL.EYEBROW')}</p>
          <h2 className="signin__headline">{t('LOGIN.PANEL.TITLE')}</h2>
          <p className="signin__sub">{t('LOGIN.PANEL.SUBTITLE')}</p>
        </div>
        <figure className="signin__quote">
          <FormatQuote className="signin__quote-mark" />
          <blockquote>{t('LOGIN.PANEL.QUOTE')}</blockquote>
          <figcaption>
            <span className="signin__stars">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} />
              ))}
            </span>
            {t('LOGIN.PANEL.QUOTE_BY')}
          </figcaption>
        </figure>
        <div className="signin__tutor">
          <span className="signin__ring" />
          <img src={tutor} alt="" />
        </div>
      </aside>

      <main className="signin__form">
        <div className="signin__form-inner">
          <Login />
        </div>
      </main>
    </div>
  );
};

export default SignIn;
