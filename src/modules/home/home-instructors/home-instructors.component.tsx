import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { useRtlClass } from '../../../assets/utils/utils';

import instructor1 from '../../../assets/images/newLanding/instructor1.webp';
import instructor2 from '../../../assets/images/newLanding/instructor2.webp';
import instructor3 from '../../../assets/images/newLanding/instructor3.webp';
import instructor4 from '../../../assets/images/newLanding/instructor4.webp';

import './home-instructors.styles.scss';

interface InstructorCard {
  image: string;
  alt: string;
}

const HomeInstructors: FC = () => {
  const { t } = useTranslation();
  const rtlClass = useRtlClass();

  const instructors: InstructorCard[] = [
    { image: instructor1, alt: 'instructor1' },
    { image: instructor2, alt: 'instructor2' },
    { image: instructor3, alt: 'instructor3' },
    { image: instructor4, alt: 'instructor4' },
  ];

  return (
    <section className="landing__best-instructors">
      <div className="ds-container">
        <div className="home-heading">
          <p className="ds-eyebrow">{t('LANDING.BLOCK3.TITLE')}</p>
          <h2 className="section-title">
            <span>{t('LANDING.BLOCK3.DESCRIPTION.PART1')}</span>
            <span className={`parallelogram ${rtlClass}`}>
              {t('LANDING.BLOCK3.DESCRIPTION.PART2')}
            </span>
          </h2>
        </div>

        <div className="instructors-images">
          {instructors.map((instructor, index) => (
            <div className="instructors-images__card" key={index}>
              <img
                className="image"
                src={instructor.image}
                alt={instructor.alt}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeInstructors;
