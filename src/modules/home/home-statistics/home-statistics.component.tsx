import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { useRtlClass } from '../../../assets/utils/utils';

import statistics from '../../../assets/images/newLanding/statistics.webp';

import './home-statistics.styles.scss';

const HomeStatistics: FC = () => {
  const { t } = useTranslation();
  const rtlClass = useRtlClass();

  return (
    <div className="landing__statistics">
      <div className="container">
        <div className="statistics-container">
          <div className="statistics-card">
            <h5 className={`title parallelogram ${rtlClass}`}>
              {t('LANDING.BLOCK4.ITEM1.TITLE')}
            </h5>
            <p className="description">
              {t('LANDING.BLOCK4.ITEM1.DESCRIPTION')}
            </p>
          </div>
          <div className="statistics-card">
            <h5 className={`title parallelogram gold ${rtlClass}`}>
              {t('LANDING.BLOCK4.ITEM2.TITLE')}
            </h5>
            <p className="description">
              {t('LANDING.BLOCK4.ITEM2.DESCRIPTION')}
            </p>
          </div>
          <div className="statistics-card">
            <h5 className={`title parallelogram ${rtlClass}`}>
              {t('LANDING.BLOCK4.ITEM3.TITLE')}
            </h5>
            <p className="description">
              {t('LANDING.BLOCK4.ITEM3.DESCRIPTION')}
            </p>
          </div>
        </div>

        <div className="statistics-image">
          <img className="image" src={statistics} alt="statistics" />
        </div>
      </div>
    </div>
  );
};

export default HomeStatistics;
