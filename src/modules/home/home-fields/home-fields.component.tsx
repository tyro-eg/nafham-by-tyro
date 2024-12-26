import React from 'react';
import { useTranslation } from 'react-i18next';

import uae from '../../../assets/images/newLanding/uae.webp';
import igcse from '../../../assets/images/newLanding/igcse.webp';
import sat from '../../../assets/images/newLanding/sat.webp';
import IB from '../../../assets/images/newLanding/ib.webp';

import './home-fields.styles.scss';

interface FieldCard {
  image: string | undefined;
  alt: string;
  label: string;
}

const HomeFields: React.FC = () => {
  const { t } = useTranslation();

  const fields: FieldCard[] = [
    { image: uae, alt: 'united-arab-emirates', label: 'UAE NATIONAL' },
    { image: igcse, alt: 'igcse', label: 'IGCSE' },
    { image: sat, alt: 'sat', label: 'SAT' },
    { image: IB, alt: 'IB', label: 'IB' },
    { image: undefined, alt: 'American System', label: 'American System' },
    { image: undefined, alt: 'British System', label: 'British System' },
  ];

  return (
    <div className="landing__learning-fields">
      <div className="container">
        <div className="learning-fields-container">
          <p className="learning-fields-header">{t('LANDING.BLOCK2.TITLE')}</p>
          <p className="learning-fields-description">
            <span className="parallelogram">
              {t('LANDING.BLOCK2.DESCRIPTION.PART1')}
            </span>
            <span>{t('LANDING.BLOCK2.DESCRIPTION.PART2')}</span>
            <span className="parallelogram">
              {t('LANDING.BLOCK2.DESCRIPTION.PART3')}
            </span>
          </p>
        </div>

        <div className="fields-images">
          {fields.map((field, index) => (
            <div key={index} className="fields-images__card">
              <h5 className="title">{field.label}</h5>
              {field.image && (
                <img className="image" src={field.image} alt={field.alt} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeFields;
