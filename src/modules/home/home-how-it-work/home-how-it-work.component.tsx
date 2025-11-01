import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import chat from '../../../assets/images/newLanding/chat.svg?url';
import clock from '../../../assets/images/newLanding/clock.svg?url';
import shareup from '../../../assets/images/newLanding/shareup.svg?url';

import './home-how-it-work.styles.scss';

const HomeHowItWork: FC = () => {
  const { t } = useTranslation();

  return (
    <div className="landing__how-it-works">
      <div className="container">
        <h2 className="title bow-underline">{t('LANDING.BLOCK8.TITLE')}</h2>
        <p className="description">{t('LANDING.BLOCK8.DESCRIPTION')}</p>

        <div className="how-it-works">
          <div className="how-it-works__card">
            <img className="icon" src={chat} alt="card-img-1" />
            <h4 className="title">{t('LANDING.BLOCK8.ITEM1.TITLE')}</h4>
            <p className="description">
              {t('LANDING.BLOCK8.ITEM1.DESCRIPTION')}
            </p>
          </div>
          <div className="how-it-works__card middle">
            <img className="icon" src={clock} alt="card-img-2" />
            <h4 className="title">{t('LANDING.BLOCK8.ITEM2.TITLE')}</h4>
            <p className="description">
              {t('LANDING.BLOCK8.ITEM2.DESCRIPTION')}
            </p>
          </div>
          <div className="how-it-works__card">
            <img className="icon" src={shareup} alt="card-img-3" />
            <h4 className="title">{t('LANDING.BLOCK8.ITEM3.TITLE')}</h4>
            <p className="description">
              {t('LANDING.BLOCK8.ITEM3.DESCRIPTION')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeHowItWork;
