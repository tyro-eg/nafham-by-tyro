import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import './home-fields.styles.scss';

interface Curriculum {
  mark: string;
  label: string;
  tone: 'sky' | 'navy' | 'gold' | 'mint' | 'rose' | 'slate';
}

const CURRICULA: Curriculum[] = [
  { mark: 'IG', label: 'IGCSE', tone: 'sky' },
  { mark: 'IB', label: 'IB Diploma', tone: 'navy' },
  { mark: 'SAT', label: 'SAT', tone: 'gold' },
  { mark: 'US', label: 'American System', tone: 'rose' },
  { mark: 'UK', label: 'British System', tone: 'slate' },
  { mark: 'AE', label: 'UAE National', tone: 'mint' },
  { mark: 'AL', label: 'A Level', tone: 'sky' },
  { mark: 'EG', label: 'Egyptian National', tone: 'navy' },
];

/** The curricula as a slow strip: the list is doubled so the loop is seamless */
const HomeFields: FC = () => {
  const { t } = useTranslation();
  const strip = [...CURRICULA, ...CURRICULA];

  return (
    <section className="landing__curricula">
      <div className="ds-container">
        <div className="home-heading">
          <p className="ds-eyebrow">{t('LANDING.BLOCK2.TITLE')}</p>
          <h2 className="section-title">{t('LANDING.CURRICULA.TITLE')}</h2>
          <p className="section-subtitle">{t('LANDING.CURRICULA.SUBTITLE')}</p>
        </div>
      </div>

      <div className="marquee" aria-label={t('LANDING.CURRICULA.TITLE')}>
        <ul className="marquee__track">
          {strip.map((curriculum, index) => (
            <li
              key={`${curriculum.label}-${index}`}
              className="marquee__pill"
              aria-hidden={index >= CURRICULA.length}
            >
              <span
                className={`marquee__mark marquee__mark--${curriculum.tone}`}
              >
                {curriculum.mark}
              </span>
              {curriculum.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default HomeFields;
