import React from 'react';
import { useTranslation } from 'react-i18next';

import rafiki from '../../../assets/images/newLanding/rafiki.svg';
import notes from '../../../assets/images/newLanding/notes.svg';
import programming from '../../../assets/images/newLanding/programming.svg';

import './why-us.styles.scss';
import { rtlClass } from '../../../assets/utils/utils';

const HomeWhyUs: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="landing__why-us">
      <div className="container">
        <div className="why-us-container">
          <p className="why-us-header">{t('LANDING.BLOCK7.TITLE')}</p>
          <p className="why-us-description">
            <span>{t('LANDING.BLOCK7.DESCRIPTION.PART1')}</span>
            <span className={`parallelogram ${rtlClass()}`}>
              {t('LANDING.BLOCK7.DESCRIPTION.PART2')}
            </span>
          </p>
        </div>

        <div className="strong-points">
          <div className="strong-points__card green">
            <img className="image" src={rafiki} alt="SVG" />
            <h5 className="title">{t('LANDING.BLOCK7.ITEM1.TITLE')}</h5>
            <p className="description">
              {t('LANDING.BLOCK7.ITEM1.DESCRIPTION')}
            </p>
          </div>

          <div className="strong-points__card primary">
            <img className="image" src={notes} alt="SVG" />
            <h5 className="title">{t('LANDING.BLOCK7.ITEM2.TITLE')}</h5>
            <p className="description">
              {t('LANDING.BLOCK7.ITEM2.DESCRIPTION')}
            </p>
          </div>

          <div className="strong-points__card gold">
            <img className="image" src={programming} alt="SVG" />
            <h5 className="title">{t('LANDING.BLOCK7.ITEM3.TITLE')}</h5>
            <p className="description">
              {t('LANDING.BLOCK7.ITEM3.DESCRIPTION')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeWhyUs;
