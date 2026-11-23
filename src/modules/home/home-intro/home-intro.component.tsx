import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import { ArrowForward, PlayCircleOutline } from '@mui/icons-material';

import { useRtlClass } from '../../../assets/utils/utils';
import HomeWeekDemo from './home-week-demo.component';

import './home-intro.styles.scss';

interface HomeIntroProps {
  openFreeTrail: () => void;
}

/**
 * The hero (23 Nov 2026): the headline and one plain sentence on one side,
 * and on the other a sample family's week in the navy timetable parents get
 * on their home page, so "fits your child's week" is shown, not just said.
 * The press strip (CNBC, Wamda, BBC, Dubai) and the rest follow as before.
 */
const HomeIntro: FC<HomeIntroProps> = ({ openFreeTrail }) => {
  const { t } = useTranslation();
  const rtlClass = useRtlClass();

  return (
    <section className={`hero ${rtlClass}`}>
      <div className="ds-container hero__inner">
        <div className="hero__copy">
          <p className="hero__eyebrow">
            <b>{t('LANDING.HERO.EYEBROW_SYLLABI')}</b>
          </p>
          <h1 className="hero__title">
            {t('LANDING.HERO.TITLE_1')}{' '}
            <span className="hero__title-accent">
              {t('LANDING.HERO.TITLE_2')}
            </span>
          </h1>
          <p className="hero__lead">{t('LANDING.HERO.LEAD')}</p>
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
        </div>
        <HomeWeekDemo />
      </div>
    </section>
  );
};

export default HomeIntro;
