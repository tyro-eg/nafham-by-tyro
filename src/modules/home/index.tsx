import { FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { useRtlClass } from '../../assets/utils/utils';

import HomeIntro from './home-intro/home-intro.component';
import HomeFeatures from './home-features/home-features.component';
import HomeStatistics from './home-statistics/home-statistics.component';
import HomeFields from './home-fields/home-fields.component';
import HomeHowItWork from './home-how-it-work/home-how-it-work.component';
import HomeWhyUs from './why-us/why-us.component';
import HomeInstructors from './home-instructors/home-instructors.component';
import HomeTestimonial from './home-testimonial/home-testimonial.component';
import HomeReadyForLearning from './home-ready-for-learning/home-ready-for-learning.component';

import './index.scss';

/**
 * The marketing landing page: a light, editorial layout. Every section
 * reads top-down (hero, proof, curricula, how it works, why us, tutors,
 * testimonials, call to action) and shares the heading styles in index.scss.
 * Every "free trial" call to action leads into the booking wizard.
 */
const Home: FC = () => {
  const rtlClass = useRtlClass();
  const navigate = useNavigate();
  const openFreeTrial = () => navigate('/trial');

  return (
    <div className={`home ${rtlClass}`}>
      <HomeIntro openFreeTrail={openFreeTrial} />
      <HomeFeatures />
      <HomeStatistics />
      <HomeFields />
      <HomeHowItWork />
      <HomeWhyUs />
      <HomeInstructors />
      <HomeTestimonial />
      <HomeReadyForLearning openFreeTrail={openFreeTrial} />
    </div>
  );
};

export default Home;
