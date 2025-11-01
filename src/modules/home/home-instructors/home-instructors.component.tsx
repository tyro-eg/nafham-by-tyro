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
    <div className="landing__best-instructors">
      <div className="container">
        <div className="best-instructors-container">
          <p className="best-instructors-header">{t('LANDING.BLOCK3.TITLE')}</p>
          <p className="best-instructors-description">
            <span>{t('LANDING.BLOCK3.DESCRIPTION.PART1')}</span>
            <span className={`parallelogram ${rtlClass}`}>
              {t('LANDING.BLOCK3.DESCRIPTION.PART2')}
            </span>
          </p>
        </div>

        <div className="instructors-images">
          {instructors.map((instructor, index) => (
            <img
              className="image"
              key={index}
              src={instructor.image}
              alt={instructor.alt}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeInstructors;
