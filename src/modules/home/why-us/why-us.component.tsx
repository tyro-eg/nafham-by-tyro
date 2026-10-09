import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { useRtlClass } from '../../../assets/utils/utils';

import rafiki from '../../../assets/images/newLanding/rafiki.svg?url';
import notes from '../../../assets/images/newLanding/notes.svg?url';
import programming from '../../../assets/images/newLanding/programming.svg?url';

import './why-us.styles.scss';

const HomeWhyUs: FC = () => {
  const { t } = useTranslation();
  const rtlClass = useRtlClass();

  return (
    <section className="landing__why-us">
      <div className="ds-container">
        <div className="home-heading">
          <p className="ds-eyebrow">{t('LANDING.BLOCK7.TITLE')}</p>
          <h2 className="section-title">
            <span>{t('LANDING.BLOCK7.DESCRIPTION.PART1')}</span>
            <span className={`parallelogram ${rtlClass}`}>
              {t('LANDING.BLOCK7.DESCRIPTION.PART2')}
            </span>
          </h2>
        </div>

        <div className="strong-points">
          <div className="strong-points__card green">
            <div className="image-wrap">
              <img className="image" src={rafiki} alt="SVG" />
            </div>
            <h3 className="title">{t('LANDING.BLOCK7.ITEM1.TITLE')}</h3>
            <p className="description">
              {t('LANDING.BLOCK7.ITEM1.DESCRIPTION')}
            </p>
          </div>

          <div className="strong-points__card primary">
            <div className="image-wrap">
              <img className="image" src={notes} alt="SVG" />
            </div>
            <h3 className="title">{t('LANDING.BLOCK7.ITEM2.TITLE')}</h3>
            <p className="description">
              {t('LANDING.BLOCK7.ITEM2.DESCRIPTION')}
            </p>
          </div>

          <div className="strong-points__card gold">
            <div className="image-wrap">
              <img className="image" src={programming} alt="SVG" />
            </div>
            <h3 className="title">{t('LANDING.BLOCK7.ITEM3.TITLE')}</h3>
            <p className="description">
              {t('LANDING.BLOCK7.ITEM3.DESCRIPTION')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeWhyUs;
