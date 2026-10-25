import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PersonSearchOutlined,
  CalendarMonthOutlined,
  VideocamOutlined,
} from '@mui/icons-material';

import './home-how-it-work.styles.scss';

const HomeHowItWork: FC = () => {
  const { t } = useTranslation();

  const steps = [
    {
      Icon: PersonSearchOutlined,
      title: t('LANDING.BLOCK8.ITEM1.TITLE'),
      description: t('LANDING.BLOCK8.ITEM1.DESCRIPTION'),
    },
    {
      Icon: CalendarMonthOutlined,
      title: t('LANDING.BLOCK8.ITEM2.TITLE'),
      description: t('LANDING.BLOCK8.ITEM2.DESCRIPTION'),
    },
    {
      Icon: VideocamOutlined,
      title: t('LANDING.BLOCK8.ITEM3.TITLE'),
      description: t('LANDING.BLOCK8.ITEM3.DESCRIPTION'),
    },
  ];

  return (
    <section className="landing__how-it-works" id="how-it-works">
      <div className="ds-container">
        <div className="home-heading">
          <p className="ds-eyebrow">{t('LANDING.BLOCK8.TITLE')}</p>
          <h2 className="section-title">{t('LANDING.STEPS.TITLE')}</h2>
          <p className="section-subtitle">{t('LANDING.BLOCK8.DESCRIPTION')}</p>
        </div>

        <ol className="steps">
          {steps.map(({ Icon, title, description }, index) => (
            <li key={title} className="steps__item">
              <span className="steps__number">0{index + 1}</span>
              <span className="steps__marker">
                <Icon className="steps__icon" aria-hidden="true" />
              </span>
              <h3 className="steps__title">{title}</h3>
              <p className="steps__description">{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default HomeHowItWork;
