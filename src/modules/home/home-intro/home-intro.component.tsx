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

// Stock footage of a tutor and student at a whiteboard. Drop the file at
// public/videos/hero-session.mp4 (H.264, muted, 10 to 15 s, under 3 MB);
// until it exists the whiteboard still is shown instead.
const SESSION_VIDEO = '/videos/hero-session.mp4';

const PILL_FACES = [student1, student2, student4];

interface HomeIntroProps {
  openFreeTrail: () => void;
}

/**
 * The hero, centred: pill, headline, two calls to action, and below them
 * the product itself, a one-to-one session window (tutor on stage, the
 * student picture-in-picture, the chat beside), tilted back and fading
 * into the page.
 */
const HomeIntro: FC<HomeIntroProps> = ({ openFreeTrail }) => {
  const { t } = useTranslation();
  const rtlClass = useRtlClass();

  return (
    <section className={`hero ${rtlClass}`}>
      <div className="ds-container hero__inner">
        <p className="hero__pill">
          <span className="hero__faces" aria-hidden="true">
            {PILL_FACES.map((face, index) => (
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
                <video
                  className="window__video"
                  src={SESSION_VIDEO}
                  poster={board}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
                <span className="window__name">
                  {t('LANDING.HERO.MOCK_TUTOR')}
                </span>
                <div className="window__pip">
                  <img src={student1} alt="" />
                  <span>{t('LANDING.HERO.MOCK_STUDENT')}</span>
                </div>
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
            </div>
          </div>
          <div className="hero__fade" />
        </div>
      </div>
    </section>
  );
};

export default HomeIntro;
