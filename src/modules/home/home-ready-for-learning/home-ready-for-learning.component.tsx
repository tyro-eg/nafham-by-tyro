import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';

import { useRtlClass } from '../../../assets/utils/utils';

import startLearning from '../../../assets/images/newLanding/start-learning.webp';

import './home-ready-for-learning.styles.scss';

interface HomeReadyForLearningProps {
  openFreeTrail: () => void;
}

const HomeReadyForLearning: FC<HomeReadyForLearningProps> = ({
  openFreeTrail,
}) => {
  const { t } = useTranslation();
  const rtlClass = useRtlClass();

  return (
    <section className="landing__start-learning">
      <div className="ds-container">
        <div className={`start-learning-panel ${rtlClass}`}>
          <div className="learning-content">
            <h2 className="learning-content__title">
              <span className={`parallelogram gold ${rtlClass}`}>
                {t('LANDING.BLOCK6.TITLE.PART1')}
              </span>
              {t('LANDING.BLOCK6.TITLE.PART2')}
            </h2>
            <p className="learning-content__description">
              {t('LANDING.BLOCK6.DESCRIPTION')}
            </p>
            <Button
              className={`custom-button learning-content__button ${rtlClass}`}
              size="large"
              onClick={openFreeTrail}
            >
              {t('LANDING.BLOCK6.ACTION')}
            </Button>
          </div>
          <div className="image-container">
            <img
              className={`image ${rtlClass}`}
              src={startLearning}
              alt="start-learning"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeReadyForLearning;
