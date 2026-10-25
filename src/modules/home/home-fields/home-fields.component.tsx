import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { SchoolOutlined } from '@mui/icons-material';

import uae from '../../../assets/images/newLanding/uae.webp';
import igcse from '../../../assets/images/newLanding/igcse.webp';
import sat from '../../../assets/images/newLanding/sat.webp';
import IB from '../../../assets/images/newLanding/ib.webp';

import './home-fields.styles.scss';

interface Curriculum {
  image?: string;
  label: string;
}

const CURRICULA: Curriculum[] = [
  { image: igcse, label: 'IGCSE' },
  { image: IB, label: 'IB' },
  { image: sat, label: 'SAT' },
  { label: 'American System' },
  { label: 'British System' },
  { image: uae, label: 'UAE National' },
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
              <span className="curricula__icon">
                {curriculum.image ? (
                  <img src={curriculum.image} alt="" loading="lazy" />
                ) : (
                  <SchoolOutlined aria-hidden="true" />
                )}
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
