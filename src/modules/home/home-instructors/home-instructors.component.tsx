import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Star } from '@mui/icons-material';

import instructor1 from '../../../assets/images/newLanding/instructor1-cutout.webp';
import instructor2 from '../../../assets/images/newLanding/instructor2-cutout.webp';
import instructor3 from '../../../assets/images/newLanding/instructor3-cutout.webp';
import instructor4 from '../../../assets/images/newLanding/instructor4-cutout.webp';

import './home-instructors.styles.scss';

interface InstructorCard {
  image: string;
  name: string;
  subjectKey: string;
  tone: 'sky' | 'gold' | 'mint' | 'navy';
  rating: string;
}

const INSTRUCTORS: InstructorCard[] = [
  {
    image: instructor1,
    name: 'Alaa Attia',
    subjectKey: 'ENGLISH',
    tone: 'sky',
    rating: '4.9',
  },
  {
    image: instructor2,
    name: 'Caroline Metias',
    subjectKey: 'MATHS',
    tone: 'gold',
    rating: '4.8',
  },
  {
    image: instructor3,
    name: 'Doaa Nasser',
    subjectKey: 'FRENCH',
    tone: 'mint',
    rating: '5.0',
  },
  {
    image: instructor4,
    name: 'Omar Fadl',
    subjectKey: 'ARABIC',
    tone: 'navy',
    rating: '4.9',
  },
];

const HomeInstructors: FC = () => {
  const { t } = useTranslation();

  return (
    <section className="landing__best-instructors">
      <div className="ds-container">
        <div className="home-heading">
          <p className="ds-eyebrow">{t('LANDING.BLOCK3.TITLE')}</p>
          <h2 className="section-title">
            {t('LANDING.BLOCK3.DESCRIPTION.PART1')}
            <span className="accent">
              {t('LANDING.BLOCK3.DESCRIPTION.PART2')}
            </span>
          </h2>
        </div>

        <ul className="tutors">
          {INSTRUCTORS.map((tutor) => (
            <li
              key={tutor.name}
              className={`tutors__card tutors__card--${tutor.tone}`}
            >
              <span className="tutors__ring" aria-hidden="true" />
              <span className="tutors__subject">
                {t(`LANDING.TUTORS.${tutor.subjectKey}`)}
              </span>
              <img
                className="tutors__photo"
                src={tutor.image}
                alt={tutor.name}
                loading="lazy"
              />
              <span className="tutors__caption">
                <span className="tutors__name">{tutor.name}</span>
                <span className="tutors__rating">
                  <Star />
                  {tutor.rating}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default HomeInstructors;
