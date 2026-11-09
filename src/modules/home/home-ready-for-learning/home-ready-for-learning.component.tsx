import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';

import { useRtlClass } from '../../../assets/utils/utils';

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
    <section className="landing__closing">
      <div className="ds-container">
        <div className={`closing ${rtlClass}`}>
          <p className="closing__eyebrow">{t('LANDING.CLOSING.EYEBROW')}</p>
          <h2 className="closing__title">
            {t('LANDING.BLOCK6.TITLE.PART1')}
            {t('LANDING.BLOCK6.TITLE.PART2')}
          </h2>
          <p className="closing__lead">{t('LANDING.BLOCK6.DESCRIPTION')}</p>
          <Button
            className="home-cta home-cta--gold closing__button"
            size="large"
            endIcon={<ArrowForward />}
            onClick={openFreeTrail}
          >
            {t('LANDING.BLOCK6.ACTION')}
          </Button>
          <p className="closing__note">{t('LANDING.CLOSING.NOTE')}</p>
        </div>
      </div>
    </section>
  );
};

export default HomeReadyForLearning;
