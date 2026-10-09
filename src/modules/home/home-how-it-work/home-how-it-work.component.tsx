import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import chat from '../../../assets/images/newLanding/chat.svg?url';
import clock from '../../../assets/images/newLanding/clock.svg?url';
import shareup from '../../../assets/images/newLanding/shareup.svg?url';

import './home-how-it-work.styles.scss';

const HomeHowItWork: FC = () => {
  const { t } = useTranslation();

  const steps = [
    {
      icon: chat,
      alt: 'card-img-1',
      title: t('LANDING.BLOCK8.ITEM1.TITLE'),
      description: t('LANDING.BLOCK8.ITEM1.DESCRIPTION'),
    },
    {
      icon: clock,
      alt: 'card-img-2',
      title: t('LANDING.BLOCK8.ITEM2.TITLE'),
      description: t('LANDING.BLOCK8.ITEM2.DESCRIPTION'),
    },
    {
      icon: shareup,
      alt: 'card-img-3',
      title: t('LANDING.BLOCK8.ITEM3.TITLE'),
      description: t('LANDING.BLOCK8.ITEM3.DESCRIPTION'),
    },
  ];

  return (
    <section className="landing__how-it-works" id="how-it-works">
      <div className="ds-container">
        <div className="home-heading">
          <h2 className="section-title">{t('LANDING.BLOCK8.TITLE')}</h2>
          <p className="section-subtitle">{t('LANDING.BLOCK8.DESCRIPTION')}</p>
        </div>

        <ol className="how-it-works">
          {steps.map((step, index) => (
            <li key={step.alt} className="how-it-works__card">
              <div className="how-it-works__card-head">
                <span className="how-it-works__icon">
                  <img className="icon" src={step.icon} alt={step.alt} />
                </span>
                <span className="how-it-works__step" aria-hidden="true">
                  {index + 1}
                </span>
              </div>
              <h3 className="title">{step.title}</h3>
              <p className="description">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default HomeHowItWork;
