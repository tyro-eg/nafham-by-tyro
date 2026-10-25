import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import './home-fields.styles.scss';

interface Curriculum {
  mark: string;
  label: string;
  tone: 'sky' | 'navy' | 'gold' | 'mint' | 'rose' | 'slate';
}

// The mark is a short typographic monogram; the tone only tints the tile
const CURRICULA: Curriculum[] = [
  { mark: 'IG', label: 'IGCSE', tone: 'sky' },
  { mark: 'IB', label: 'IB', tone: 'navy' },
  { mark: 'SAT', label: 'SAT', tone: 'gold' },
  { mark: 'US', label: 'American System', tone: 'rose' },
  { mark: 'UK', label: 'British System', tone: 'slate' },
  { mark: 'AE', label: 'UAE National', tone: 'mint' },
];

const HomeFields: FC = () => {
  const { t } = useTranslation();

  return (
    <section className="landing__curricula">
      <div className="ds-container">
        <div className="home-heading">
          <p className="ds-eyebrow">{t('LANDING.BLOCK2.TITLE')}</p>
          <h2 className="section-title">{t('LANDING.CURRICULA.TITLE')}</h2>
          <p className="section-subtitle">{t('LANDING.CURRICULA.SUBTITLE')}</p>
        </div>

        <ul className="curricula">
          {CURRICULA.map((curriculum) => (
            <li key={curriculum.label} className="curricula__item">
              <span
                className={`curricula__mark curricula__mark--${curriculum.tone}`}
              >
                {curriculum.mark}
              </span>
              <span className="curricula__label">{curriculum.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default HomeFields;
