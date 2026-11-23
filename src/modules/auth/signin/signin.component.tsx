import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  CheckRounded,
  EventRepeatRounded,
  PeopleAltRounded,
} from '@mui/icons-material';

import Login from '../../../component/login/login.component';
import LanguageSelector from '../../../component/i18next/LanguageSelector';
import logo from '../../../assets/images/logo.png';

import './signin.styles.scss';

/**
 * Sign in: a calm navy brand panel (no photo, no quotes) beside a plain
 * form. The site header is left out here; the form side carries the
 * language switch. On phones the panel shrinks to the logo and the title.
 * (19 Nov 2026: the old photo looked blurry and the quote was not a real
 * review.)
 */
const SignIn: FC = () => {
  const { t } = useTranslation();

  const facts = [
    { icon: <PeopleAltRounded />, text: t('LOGIN.PANEL.FACT_TUTORS') },
    { icon: <CheckRounded />, text: t('LOGIN.PANEL.FACT_NOTES') },
    { icon: <EventRepeatRounded />, text: t('LOGIN.PANEL.FACT_CHANGES') },
  ];

  return (
    <div className="signin">
      <aside className="signin__panel">
        <span className="signin__ring signin__ring--a" aria-hidden="true" />
        <span className="signin__ring signin__ring--b" aria-hidden="true" />
        <span className="signin__ring signin__ring--c" aria-hidden="true" />
        <Link to="/" className="signin__logo" aria-label="Nafham">
          <img src={logo} alt="" />
        </Link>
        <div className="signin__panel-copy">
          <h2 className="signin__headline">
            {t('LOGIN.PANEL.TITLE_START')} <em>{t('LOGIN.PANEL.TITLE_END')}</em>
          </h2>
          <p className="signin__sub">{t('LOGIN.PANEL.SUBTITLE')}</p>
          <ul className="signin__facts">
            {facts.map((fact) => (
              <li key={fact.text}>
                <span className="signin__fact-icon" aria-hidden="true">
                  {fact.icon}
                </span>
                {fact.text}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="signin__form">
        <div className="signin__top">
          <LanguageSelector />
        </div>
        <div className="signin__form-inner">
          <Login />
        </div>
      </main>
    </div>
  );
};

export default SignIn;
