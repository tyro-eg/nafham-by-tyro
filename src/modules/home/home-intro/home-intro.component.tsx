import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import { rtlClass } from '../../../assets/utils/utils';

import main from '../../../assets/images/newLanding/macbook.webp';

import './home-intro.styles.scss';

interface HomeIntroProps {
  openFreeTrail: () => void;
}

const HomeIntro: React.FC<HomeIntroProps> = ({ openFreeTrail }) => {
  const { t } = useTranslation();

  return (
    <div className="landing__image-container">
      <div className="container">
        <div className={`col-2-of-4 col-1-of-1-md col-1-of-1-sm ${rtlClass()}`}>
          <div className="landing-header">
            <p className="landing-header__subtitle">
              {t('LANDING.BLOCK1.SUBTITLE')}
            </p>
            <p className="landing-header__title">{t('LANDING.BLOCK1.TITLE')}</p>
            <p className="landing-header__description">
              {t('LANDING.BLOCK1.DESCRIPTION')}
            </p>
            <Button
              className={`custom-button landing-header__button ${rtlClass()}`}
              onClick={openFreeTrail}
            >
              {t('LANDING.BLOCK1.ACTION')}
            </Button>
          </div>
        </div>
        <div className="mac-container col-1-of-4 col-1-of-1-md">
          <img className="macbook-image" src={main} alt="macbook" />
        </div>
      </div>
    </div>
  );
};

export default HomeIntro;
