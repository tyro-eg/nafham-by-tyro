import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import cnbc from '../../../assets/images/newLanding/cnbc.webp';
import wamda from '../../../assets/images/newLanding/wamda.webp';
import bbc from '../../../assets/images/newLanding/bbc.webp';
import dubai from '../../../assets/images/newLanding/dubai.webp';

import './home-features.styles.scss';

type Feature = {
  image: string;
  alt: string;
  url: string;
};

const HomeFeatures: FC = () => {
  const { t } = useTranslation();

  const features: Feature[] = [
    {
      image: cnbc,
      alt: 'cnbc',
      url: 'https://thestartupscene.me/INVESTMENTS/9-Egyptian-Flat6Labs-Startups-Embark-on-Gulf-Tour-with-StartEgypt?fbclid=IwAR1IUlBDZEUKyaijN5THAORx6KPGaxxvpawJ0jegM3q9y_UFj22TrzA996s',
    },
    {
      image: wamda,
      alt: 'wamda',
      url: 'https://www.wamda.com/2017/09/egyptian-startup-plans-regulating-private-tutoring',
    },
    {
      image: bbc,
      alt: 'BBC',
      url: 'http://bbc.com/news/business-36461191',
    },
    {
      image: dubai,
      alt: 'Dubai',
      url: 'https://youtu.be/8d6lTKv6r1c',
    },
  ];

  return (
    <section className="landing__features">
      <div className="ds-container">
        <p className="features-title">{t('LANDING.PRESS')}</p>
        <div className="features-images">
          {features.map(({ image, alt, url }, index) => (
            <a
              key={alt + index}
              className="feature-logo"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={alt}
            >
              <img className="image" src={image} alt={alt} loading="lazy" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeFeatures;
