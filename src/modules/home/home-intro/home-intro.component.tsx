import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import { ArrowForward, PlayCircleOutline } from '@mui/icons-material';

import { useRtlClass } from '../../../assets/utils/utils';

import board from '../../../assets/images/newLanding/hero-tutor.webp';
import student1 from '../../../assets/images/newLanding/hero-student1.webp';
import student2 from '../../../assets/images/newLanding/hero-student2.webp';
import student4 from '../../../assets/images/newLanding/hero-student4.webp';

import './home-intro.styles.scss';

interface HomeIntroProps {
  openFreeTrail: () => void;
}

const STUDENTS = [student1, student2, student4];

/**
 * The hero, centred: pill, headline, two calls to action, and below them
 * the product itself, a live session window with real faces, tilted back
 * and fading into the page.
 */
const HomeIntro: FC<HomeIntroProps> = ({ openFreeTrail }) => {
  const { t } = useTranslation();
  const rtlClass = useRtlClass();

  return (
    <section className={`hero ${rtlClass}`}>
      <div className="ds-container hero__inner">
        <p className="hero__pill">
          <span className="hero__faces" aria-hidden="true">
            {STUDENTS.map((face, index) => (
              <img key={index} src={face} alt="" />
            ))}
          </span>
          {t('LANDING.HERO.PILL')}
        </p>

        <h1 className="hero__title">
          {t('LANDING.HERO.TITLE_1')}{' '}
          <span className="hero__title-accent">
            {t('LANDING.HERO.TITLE_2')}
          </span>
        </h1>
        <p className="hero__lead">{t('LANDING.BLOCK1.DESCRIPTION')}</p>

        <div className="hero__actions">
          <Button
            className="home-cta"
            size="large"
            endIcon={<ArrowForward />}
            onClick={openFreeTrail}
          >
            {t('LANDING.BLOCK1.ACTION')}
          </Button>
          <Button
            className="hero__secondary"
            size="large"
            href="#how-it-works"
            startIcon={<PlayCircleOutline />}
          >
            {t('LANDING.BLOCK8.TITLE')}
          </Button>
        </div>

        <div className="hero__stage" aria-hidden="true">
          <div className="window">
            <div className="window__bar">
              <span className="window__dots">
                <span />
                <span />
                <span />
              </span>
              <span className="window__title">
                {t('LANDING.HERO.MOCK_TITLE')}
              </span>
              <span className="window__timer">24:10</span>
            </div>
            <div className="window__body">
              <div className="window__tile window__tile--main">
                <img src={board} alt="" />
                <span className="window__name">
                  {t('LANDING.HERO.MOCK_TUTOR')}
                </span>
              </div>
              <aside className="window__side">
                <strong>{t('LANDING.HERO.CHAT_TITLE')}</strong>
                <span className="window__msg">{t('LANDING.HERO.CHAT_1')}</span>
                <span className="window__msg window__msg--me">
                  {t('LANDING.HERO.CHAT_2')}
                </span>
                <span className="window__msg">{t('LANDING.HERO.CHAT_3')}</span>
                <strong className="window__package">
                  {t('LANDING.HERO.CHIP_PROGRESS')}
                </strong>
                <span className="window__bar-track">
                  <span className="window__bar-used" />
                  <span className="window__bar-booked" />
                </span>
              </aside>
              {STUDENTS.map((face, index) => (
                <div key={index} className="window__tile">
                  <img src={face} alt="" />
                </div>
              ))}
            </div>
          </div>
          <div className="hero__fade" />
        </div>
      </div>
    </section>
  );
};

export default HomeIntro;
