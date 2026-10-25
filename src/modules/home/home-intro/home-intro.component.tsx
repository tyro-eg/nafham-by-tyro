import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import {
  ArrowForward,
  PlayCircleOutline,
  Star,
  VerifiedRounded,
  EventAvailableOutlined,
} from '@mui/icons-material';

import { useRtlClass } from '../../../assets/utils/utils';

import tutor from '../../../assets/images/newLanding/instructor3-cutout.webp';
import student1 from '../../../assets/images/newLanding/hero-student1.webp';
import student2 from '../../../assets/images/newLanding/hero-student2.webp';
import student4 from '../../../assets/images/newLanding/hero-student4.webp';

import './home-intro.styles.scss';

interface HomeIntroProps {
  openFreeTrail: () => void;
}

const STUDENTS = [student1, student2, student4];

/**
 * The hero: a headline that fits in two lines, two calls to action, and a
 * tutor standing on a colour block with the proof around her (rating,
 * next session, package hours).
 */
const HomeIntro: FC<HomeIntroProps> = ({ openFreeTrail }) => {
  const { t } = useTranslation();
  const rtlClass = useRtlClass();

  return (
    <section className={`hero ${rtlClass}`}>
      <div className="ds-container hero__inner">
        <div className="hero__content">
          <p className="hero__pill">
            <span className="hero__pill-avatars" aria-hidden="true">
              {STUDENTS.map((student, index) => (
                <img key={index} src={student} alt="" />
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
              <VerifiedRounded className="hero__proof-icon" />
              <span>{t('LANDING.HERO.PROOF_TUTORS')}</span>
            </li>
            <li>
              <EventAvailableOutlined className="hero__proof-icon" />
              <span>{t('LANDING.HERO.PROOF_FLEX')}</span>
            </li>
          </ul>
        </div>

        <div className="hero__visual" aria-hidden="true">
          <div className="hero__block">
            <span className="hero__ring hero__ring--1" />
            <span className="hero__ring hero__ring--2" />
            <img className="hero__tutor" src={tutor} alt="" />
          </div>

          <div className="hero__card hero__card--rating">
            <span className="hero__stars">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} />
              ))}
            </span>
            <strong>{t('LANDING.BLOCK4.ITEM3.TITLE')}</strong>
            <span className="hero__card-label">
              {t('LANDING.HERO.PROOF_RATING')}
            </span>
          </div>

          <div className="hero__card hero__card--next">
            <span className="hero__card-label">
              {t('LANDING.HERO.NEXT_LABEL')}
            </span>
            <strong>{t('LANDING.HERO.CHIP_COURSE')}</strong>
            <span className="hero__card-meta">
              <span className="hero__live-dot" />
              {t('LANDING.HERO.CHIP_COURSE_LABEL')}
            </span>
          </div>

          <div className="hero__card hero__card--hours">
            <span className="hero__card-label">
              {t('LANDING.HERO.CHIP_PROGRESS')}
            </span>
            <span className="hero__progress">
              <span className="hero__progress-used" />
              <span className="hero__progress-booked" />
            </span>
            <span className="hero__card-meta">
              {t('LANDING.HERO.HOURS_META')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeIntro;
