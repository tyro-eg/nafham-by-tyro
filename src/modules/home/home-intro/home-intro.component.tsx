import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import {
  ArrowForward,
  PlayCircleOutline,
  Star,
  VerifiedOutlined,
  EventAvailableOutlined,
} from '@mui/icons-material';

import { useRtlClass } from '../../../assets/utils/utils';

import tutor from '../../../assets/images/newLanding/hero-tutor.webp';
import student1 from '../../../assets/images/newLanding/hero-student1.webp';
import student2 from '../../../assets/images/newLanding/hero-student2.webp';
import student3 from '../../../assets/images/newLanding/hero-student3.webp';
import student4 from '../../../assets/images/newLanding/hero-student4.webp';

import './home-intro.styles.scss';

interface HomeIntroProps {
  openFreeTrail: () => void;
}

// Three of the many: the faces behind the "students" pill
const PILL_AVATARS = [
  { initials: 'AY', tone: 'sky' },
  { initials: 'MK', tone: 'gold' },
  { initials: 'LN', tone: 'navy' },
];

const STUDENTS = [student1, student2, student3, student4];

const HomeIntro: FC<HomeIntroProps> = ({ openFreeTrail }) => {
  const { t } = useTranslation();
  const rtlClass = useRtlClass();

  return (
    <section className={`hero ${rtlClass}`}>
      <div className="ds-container hero__inner">
        <div className="hero__content">
          <p className="hero__pill">
            <span className="hero__pill-avatars" aria-hidden="true">
              {PILL_AVATARS.map((avatar) => (
                <span
                  key={avatar.initials}
                  className={`hero__pill-avatar hero__pill-avatar--${avatar.tone}`}
                >
                  {avatar.initials}
                </span>
              ))}
            </span>
            {t('LANDING.HERO.PILL')}
          </p>

          <h1 className="hero__title">
            {t('LANDING.HERO.TITLE_1')}{' '}
            <span className="accent">{t('LANDING.HERO.TITLE_2')}</span>
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
              className="hero__link"
              size="large"
              href="#how-it-works"
              startIcon={<PlayCircleOutline />}
            >
              {t('LANDING.BLOCK8.TITLE')}
            </Button>
          </div>

          <ul className="hero__proof">
            <li>
              <Star className="hero__proof-icon hero__proof-icon--gold" />
              <span>
                <strong>{t('LANDING.BLOCK4.ITEM3.TITLE')}</strong>{' '}
                {t('LANDING.HERO.PROOF_RATING')}
              </span>
            </li>
            <li>
              <VerifiedOutlined className="hero__proof-icon" />
              <span>{t('LANDING.HERO.PROOF_TUTORS')}</span>
            </li>
            <li>
              <EventAvailableOutlined className="hero__proof-icon" />
              <span>{t('LANDING.HERO.PROOF_FLEX')}</span>
            </li>
          </ul>
        </div>

        <div className="hero__stage" aria-hidden="true">
          <div className="hero__glow" />
          {/* A live session as the app shows it: tutor on stage, students aside */}
          <div className="mock">
            <div className="mock__bar">
              <span className="mock__dots">
                <span />
                <span />
                <span />
              </span>
              <span className="mock__title">
                {t('LANDING.HERO.MOCK_TITLE')}
              </span>
              <span className="mock__timer">24:10</span>
            </div>
            <div className="mock__body">
              <div className="mock__main">
                <img src={tutor} alt="" />
                <span className="mock__name">
                  {t('LANDING.HERO.MOCK_TUTOR')}
                </span>
              </div>
              <div className="mock__side">
                {STUDENTS.map((student, index) => (
                  <span key={index} className="mock__tile">
                    <img src={student} alt="" />
                  </span>
                ))}
              </div>
            </div>
            <div className="mock__controls">
              <span />
              <span />
              <span />
              <span className="mock__controls-end" />
            </div>
          </div>
          <div className="hero__chip hero__chip--live">
            <span className="hero__live-dot" />
            {t('LANDING.HERO.CHIP_LIVE')}
          </div>
          <div className="hero__chip hero__chip--course">
            <span className="hero__chip-label">
              {t('LANDING.HERO.CHIP_COURSE_LABEL')}
            </span>
            <strong>{t('LANDING.HERO.CHIP_COURSE')}</strong>
          </div>
          <div className="hero__chip hero__chip--progress">
            <span className="hero__chip-label">
              {t('LANDING.HERO.CHIP_PROGRESS')}
            </span>
            <span className="hero__progress">
              <span className="hero__progress-used" />
              <span className="hero__progress-booked" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeIntro;
