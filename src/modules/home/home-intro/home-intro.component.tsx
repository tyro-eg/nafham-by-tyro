import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import { ArrowForward, Star } from '@mui/icons-material';

import { useRtlClass } from '../../../assets/utils/utils';

import main from '../../../assets/images/newLanding/macbook.webp';
import cnbc from '../../../assets/images/newLanding/cnbc.webp';
import bbc from '../../../assets/images/newLanding/bbc.webp';
import wamda from '../../../assets/images/newLanding/wamda.webp';

import './home-intro.styles.scss';

interface HomeIntroProps {
  openFreeTrail: () => void;
}

const pressLogos = [
  { image: cnbc, alt: 'CNBC' },
  { image: bbc, alt: 'BBC' },
  { image: wamda, alt: 'Wamda' },
];

const HomeIntro: FC<HomeIntroProps> = ({ openFreeTrail }) => {
  const { t } = useTranslation();
  const rtlClass = useRtlClass();

  return (
    <section className={`home-hero ${rtlClass}`}>
      <div className="ds-container home-hero__inner">
        <div className="home-hero__content">
          <p className="home-hero__eyebrow">{t('LANDING.BLOCK1.SUBTITLE')}</p>
          <h1 className="home-hero__title">{t('LANDING.BLOCK1.TITLE')}</h1>
          <p className="home-hero__description">
            {t('LANDING.BLOCK1.DESCRIPTION')}
          </p>

          <div className="home-hero__actions">
            <Button
              className="custom-button home-hero__cta"
              size="large"
              endIcon={<ArrowForward className="home-hero__cta-icon" />}
              onClick={openFreeTrail}
            >
              {t('LANDING.BLOCK1.ACTION')}
            </Button>
            <Button
              className="home-hero__secondary"
              size="large"
              href="#how-it-works"
            >
              {t('LANDING.BLOCK8.TITLE')}
            </Button>
          </div>

          <div className="home-hero__trust">
            <div className="home-hero__rating">
              <span className="home-hero__stars" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} />
                ))}
              </span>
              <span className="home-hero__rating-value">
                {t('LANDING.BLOCK4.ITEM3.TITLE')}
              </span>
            </div>
            <span className="home-hero__trust-divider" aria-hidden="true" />
            <div className="home-hero__press">
              <span className="home-hero__press-label">
                {t('LANDING.BLOCK1.FEATURED.PART1')}{' '}
                {t('LANDING.BLOCK1.FEATURED.PART2')}
              </span>
              <span className="home-hero__press-logos">
                {pressLogos.map(({ image, alt }) => (
                  <img key={alt} src={image} alt={alt} loading="lazy" />
                ))}
              </span>
            </div>
          </div>
        </div>

        <div className="home-hero__media">
          <img className="macbook-image" src={main} alt="macbook" />
        </div>
      </div>
    </section>
  );
};

export default HomeIntro;
