import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Star,
  VerifiedRounded,
  SupportAgentOutlined,
  ChatBubbleOutlineRounded,
} from '@mui/icons-material';

import './why-us.styles.scss';

/**
 * Why families stay: four reasons laid out as a bento grid, each with a
 * small illustration built from the product's own UI (no stock imagery).
 */
const HomeWhyUs: FC = () => {
  const { t } = useTranslation();
  const days = t('LANDING.WHY.SCHEDULE.DAYS').split(',');

  return (
    <section className="landing__why-us">
      <div className="ds-container">
        <div className="home-heading">
          <p className="ds-eyebrow">{t('LANDING.BLOCK7.TITLE')}</p>
          <h2 className="section-title">
            {t('LANDING.BLOCK7.DESCRIPTION.PART1')}
            <span className="accent">
              {t('LANDING.BLOCK7.DESCRIPTION.PART2')}
            </span>
          </h2>
        </div>

        <div className="bento">
          {/* Tutors */}
          <article className="bento__card bento__card--tutors">
            <div className="bento__text">
              <h3 className="bento__title">
                {t('LANDING.BLOCK7.ITEM1.TITLE')}
              </h3>
              <p className="bento__description">
                {t('LANDING.BLOCK7.ITEM1.DESCRIPTION')}
              </p>
            </div>
            <div className="bento__visual tutor-card" aria-hidden="true">
              <span className="tutor-card__avatar">
                {t('LANDING.WHY.TUTOR_CARD.INITIALS')}
              </span>
              <span className="tutor-card__body">
                <span className="tutor-card__name">
                  {t('LANDING.WHY.TUTOR_CARD.NAME')}
                  <VerifiedRounded className="tutor-card__verified" />
                </span>
                <span className="tutor-card__subject">
                  {t('LANDING.WHY.TUTOR_CARD.SUBJECT')}
                </span>
                <span className="tutor-card__rating">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} />
                  ))}
                  <span>4.9 · {t('LANDING.WHY.TUTOR_CARD.SESSIONS')}</span>
                </span>
              </span>
              <span className="tutor-card__badge">
                {t('LANDING.WHY.TUTOR_CARD.VERIFIED')}
              </span>
            </div>
          </article>

          {/* Scheduling */}
          <article className="bento__card bento__card--schedule">
            <div className="bento__text">
              <h3 className="bento__title">
                {t('LANDING.BLOCK7.ITEM2.TITLE')}
              </h3>
              <p className="bento__description">
                {t('LANDING.BLOCK7.ITEM2.DESCRIPTION')}
              </p>
            </div>
            <div className="bento__visual week" aria-hidden="true">
              {days.map((day, index) => (
                <span
                  key={day}
                  className={`week__day ${index === 2 ? 'week__day--picked' : ''}`}
                >
                  <span className="week__name">{day}</span>
                  <span className="week__slot" />
                  <span className="week__slot" />
                </span>
              ))}
            </div>
          </article>

          {/* Support */}
          <article className="bento__card bento__card--support">
            <div className="bento__text">
              <h3 className="bento__title">
                {t('LANDING.BLOCK7.ITEM3.TITLE')}
              </h3>
              <p className="bento__description">
                {t('LANDING.BLOCK7.ITEM3.DESCRIPTION')}
              </p>
            </div>
            <div className="bento__visual chat" aria-hidden="true">
              <span className="chat__bubble chat__bubble--in">
                <ChatBubbleOutlineRounded />
                {t('LANDING.WHY.SUPPORT.QUESTION')}
              </span>
              <span className="chat__bubble chat__bubble--out">
                <SupportAgentOutlined />
                {t('LANDING.WHY.SUPPORT.ANSWER')}
              </span>
            </div>
          </article>

          {/* Progress */}
          <article className="bento__card bento__card--progress">
            <div className="bento__text">
              <h3 className="bento__title">{t('LANDING.WHY.ITEM4.TITLE')}</h3>
              <p className="bento__description">
                {t('LANDING.WHY.ITEM4.DESCRIPTION')}
              </p>
            </div>
            <div className="bento__visual hours" aria-hidden="true">
              <span className="hours__bar">
                <span className="hours__used" />
                <span className="hours__booked" />
              </span>
              <span className="hours__legend">
                <span className="hours__key hours__key--used">
                  {t('LANDING.WHY.PROGRESS.USED')}
                </span>
                <span className="hours__key hours__key--booked">
                  {t('LANDING.WHY.PROGRESS.SCHEDULED')}
                </span>
                <span className="hours__key hours__key--free">
                  {t('LANDING.WHY.PROGRESS.FREE')}
                </span>
              </span>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

export default HomeWhyUs;
