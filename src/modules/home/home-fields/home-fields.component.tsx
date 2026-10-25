import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import igcse from '../../../assets/images/newLanding/igcse.webp';
import ib from '../../../assets/images/newLanding/ib.webp';
import sat from '../../../assets/images/newLanding/sat.webp';
import uae from '../../../assets/images/landing/united-arab-emirates-round.png';
import egypt from '../../../assets/images/landing/egypt-round.png';
import saudi from '../../../assets/images/landing/saudi-arabia-round.png';

import './home-fields.styles.scss';

interface Curriculum {
  image?: string;
  flag?: 'us' | 'uk';
  label: string;
}

const CURRICULA: Curriculum[] = [
  { image: igcse, label: 'IGCSE' },
  { image: ib, label: 'IB Diploma' },
  { image: sat, label: 'SAT' },
  { flag: 'us', label: 'American System' },
  { flag: 'uk', label: 'British System' },
  { image: uae, label: 'UAE National' },
  { image: egypt, label: 'Egyptian National' },
  { image: saudi, label: 'Saudi National' },
];

/** The two flags we have no file for, drawn inline */
const Flag: FC<{ kind: 'us' | 'uk'; id: string }> = ({ kind, id }) =>
  kind === 'us' ? (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <clipPath id={id}>
        <circle cx="20" cy="20" r="20" />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        <rect width="40" height="40" fill="#fff" />
        {[0, 2, 4, 6, 8, 10, 12].map((i) => (
          <rect
            key={i}
            y={i * (40 / 13)}
            width="40"
            height={40 / 13}
            fill="#b22234"
          />
        ))}
        <rect width="18" height="21.5" fill="#3c3b6e" />
      </g>
    </svg>
  ) : (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <clipPath id={id}>
        <circle cx="20" cy="20" r="20" />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        <rect width="40" height="40" fill="#012169" />
        <path d="M0 0 L40 40 M40 0 L0 40" stroke="#fff" strokeWidth="7" />
        <path d="M0 0 L40 40 M40 0 L0 40" stroke="#c8102e" strokeWidth="2.5" />
        <path d="M20 0 V40 M0 20 H40" stroke="#fff" strokeWidth="11" />
        <path d="M20 0 V40 M0 20 H40" stroke="#c8102e" strokeWidth="6" />
      </g>
    </svg>
  );

/** The curricula as a slow strip: the list is doubled so the loop is seamless */
const HomeFields: FC = () => {
  const { t } = useTranslation();
  const strip = [...CURRICULA, ...CURRICULA];

  return (
    <section className="landing__curricula">
      <div className="ds-container">
        <div className="home-heading">
          <p className="ds-eyebrow">{t('LANDING.BLOCK2.TITLE')}</p>
          <h2 className="section-title">{t('LANDING.CURRICULA.TITLE')}</h2>
          <p className="section-subtitle">{t('LANDING.CURRICULA.SUBTITLE')}</p>
        </div>
      </div>

      <div className="marquee" aria-label={t('LANDING.CURRICULA.TITLE')}>
        <ul className="marquee__track">
          {strip.map((curriculum, index) => (
            <li
              key={`${curriculum.label}-${index}`}
              className="marquee__pill"
              aria-hidden={index >= CURRICULA.length}
            >
              <span className="marquee__logo">
                {curriculum.image ? (
                  <img src={curriculum.image} alt="" loading="lazy" />
                ) : (
                  curriculum.flag && (
                    <Flag
                      kind={curriculum.flag}
                      id={`flag-${curriculum.flag}-${index}`}
                    />
                  )
                )}
              </span>
              {curriculum.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default HomeFields;
