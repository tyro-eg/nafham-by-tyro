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

import tutor from '../../../assets/images/newLanding/hero-tutor.webp';
import student1 from '../../../assets/images/newLanding/hero-student1.webp';
import student2 from '../../../assets/images/newLanding/hero-student2.webp';
import student3 from '../../../assets/images/newLanding/hero-student3.webp';
import student4 from '../../../assets/images/newLanding/hero-student4.webp';

import './home-intro.styles.scss';

interface HomeIntroProps {
  openFreeTrail: () => void;
}

const PILL_FACES = [student1, student2, student4];

/**
 * The hero: a headline that fits in two lines, two calls to action, and a
 * grid of real faces: the tutor at her board, two students, a rating tile
 * and a package-hours tile.
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
          <div className="collage">
            <figure className="collage__tile collage__tile--main">
              <img src={tutor} alt="" />
              <figcaption className="collage__caption">
                <span className="hero__live-dot" />
                {t('LANDING.HERO.CHIP_COURSE')}
              </figcaption>
            </figure>

            <figure className="collage__tile collage__tile--a">
              <img src={student1} alt="" />
            </figure>

            <div className="collage__tile collage__tile--rating">
              <span className="hero__stars">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} />
                ))}
              </span>
              <strong>{t('LANDING.BLOCK4.ITEM3.TITLE')}</strong>
              <span>{t('LANDING.HERO.PROOF_RATING')}</span>
            </div>

            <figure className="collage__tile collage__tile--b">
              <img src={student3} alt="" />
            </figure>

            <div className="collage__tile collage__tile--hours">
              <span className="collage__label">
                {t('LANDING.HERO.CHIP_PROGRESS')}
              </span>
              <span className="hero__progress">
                <span className="hero__progress-used" />
                <span className="hero__progress-booked" />
              </span>
              <span className="collage__meta">
                {t('LANDING.HERO.HOURS_META')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeIntro;
