import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import { ArrowForward, PlayCircleOutline } from '@mui/icons-material';

import { useRtlClass } from '../../../assets/utils/utils';
import HomeWeekDemo from './home-week-demo.component';

import './home-intro.styles.scss';

interface HomeIntroProps {
  openFreeTrail: () => void;
}

type Visitor = 'parent' | 'student' | 'tutor';
const VISITORS: Visitor[] = ['parent', 'student', 'tutor'];

/**
 * The hero: the headline and one plain sentence on one side, and on the
 * other a sample family's week, so "fits your child's week" is shown, not
 * just said. The press strip (CNBC, Wamda, BBC, Dubai) and the rest follow
 * as before.
 *
 * 24 Nov 2026: it speaks to each kind of visitor. "I'm a parent" is the
 * page as it was; a student and a tutor get their own headline, sentence
 * and main button. White and baby blue, with soft round shapes and a wave.
 */
const HomeIntro: FC<HomeIntroProps> = ({ openFreeTrail }) => {
  const { t } = useTranslation();
  const rtlClass = useRtlClass();
  const navigate = useNavigate();
  const [visitor, setVisitor] = useState<Visitor>('parent');
  const forParent = visitor === 'parent';
  const key = `LANDING.HERO.VISITOR.${visitor.toUpperCase()}`;

  return (
    <section className={`hero ${rtlClass}`}>
      <span className="hero__blob hero__blob--a" aria-hidden="true" />
      <span className="hero__blob hero__blob--b" aria-hidden="true" />
      <span className="hero__blob hero__blob--c" aria-hidden="true" />
      <div className="ds-container hero__inner">
        <div className="hero__copy">
          <div
            className="hero__who"
            role="tablist"
            aria-label={t('LANDING.HERO.VISITOR.LABEL')}
          >
            {VISITORS.map((who) => (
              <button
                key={who}
                type="button"
                role="tab"
                aria-selected={visitor === who}
                className={`hero__who-tab${visitor === who ? ' is-on' : ''}`}
                onClick={() => setVisitor(who)}
              >
                {t(`LANDING.HERO.VISITOR.${who.toUpperCase()}.TAB`)}
              </button>
            ))}
          </div>
          <p className="hero__eyebrow">
            <b>{t('LANDING.HERO.EYEBROW_SYLLABI')}</b>
          </p>
          <h1 className="hero__title">
            {forParent ? t('LANDING.HERO.TITLE_1') : t(`${key}.TITLE_1`)}{' '}
            <span className="hero__title-accent">
              {forParent ? t('LANDING.HERO.TITLE_2') : t(`${key}.TITLE_2`)}
            </span>
          </h1>
          <p className="hero__lead">
            {forParent ? t('LANDING.HERO.LEAD') : t(`${key}.LEAD`)}
          </p>
          <div className="hero__actions">
            <Button
              className="home-cta"
              size="large"
              endIcon={<ArrowForward />}
              onClick={
                visitor === 'tutor'
                  ? () => navigate('/register')
                  : openFreeTrail
              }
            >
              {visitor === 'tutor'
                ? t('LANDING.HERO.VISITOR.TUTOR.ACTION')
                : t('LANDING.BLOCK1.ACTION')}
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
      <svg
        className="hero__wave"
        viewBox="0 0 1200 80"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 40 C 150 90, 300 0, 480 36 S 820 86, 1000 34 S 1150 20, 1200 44 V80 H0Z" />
      </svg>
    </section>
  );
};

export default HomeIntro;
