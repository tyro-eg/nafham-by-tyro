import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';

import { rtlClass } from '../../../assets/utils/utils';
import startLearning from '../../../assets/images/newLanding/start-learning.webp';

import './home-ready-for-learning.styles.scss';

interface HomeReadyForLearningProps {
  openFreeTrail: () => void;
}
const HomeReadyForLearning: React.FC<HomeReadyForLearningProps> = ({
  openFreeTrail,
}) => {
  const { t } = useTranslation();

  return (
    <div className="landing__start-learning">
      <div className="container">
        <div className={`col-2-of-4 col-1-of-1-md col-1-of-1-sm ${rtlClass()}`}>
          <div className="learning-content">
            <p className="learning-content__title">
              <span className={`parallelogram gold ${rtlClass()}`}>
                {t('LANDING.BLOCK6.TITLE.PART1')}
              </span>
              {t('LANDING.BLOCK6.TITLE.PART2')}
            </p>
            <p className="learning-content__description">
              {t('LANDING.BLOCK6.DESCRIPTION')}
            </p>
            <Button
              className={`custom-button learning-content__button ${rtlClass()}`}
              onClick={openFreeTrail}
            >
              {t('LANDING.BLOCK6.ACTION')}
            </Button>
          </div>
        </div>
        <div className="image-container col-2-of-4 col-1-of-1-md  col-1-of-1-sm">
          <img
            className={`image ${rtlClass()}`}
            src={startLearning}
            alt="start-learning"
          />
        </div>
      </div>
    </div>
  );
};

export default HomeReadyForLearning;
