// import React from 'react';
// import { useTranslation } from 'react-i18next';
// import { Button } from '@material-ui/core';
// import PropTypes from 'prop-types';

// import { rtlClass } from '../../../assets/utils/utils';

// import main from '../../../assets/images/landing/main.png';
// import dubai from '../../../assets/images/landing/Group 4.webp';
// import bbc from '../../../assets/images/landing/Group 5.webp';
// import wamda from '../../../assets/images/landing/Group 6.webp';
// import cairoScene from '../../../assets/images/landing/Group 3.webp';

// import './home-intro.styles.scss';

// const HomeIntro = ({ openFreeTrail }) => {
//   const { t } = useTranslation();
//   return (
//     <div className="landing__image-container">
//       <div className="img-container container">
//         <div className={`col-2-of-4 col-2-of-3-md col-1-of-1-sm ${rtlClass()}`}>
//           <div className="header-left">
//             <p className="header-left-header">
//               {t('LANDING.BLOCK1.TITLE1')}{' '}
//               <span>{t('LANDING.BLOCK1.TITLEGREEN')}</span>{' '}
//               {t('LANDING.BLOCK1.TITLE2')}
//             </p>
//             <p className="header-left-text">
//               {t('LANDING.BLOCK1.DESCRIPTION')}
//             </p>
//             <Button
//               size="large"
//               className="header-button"
//               variant="contained"
//               color="primary"
//               onClick={openFreeTrail}
//             >
//               {t('LANDING.BLOCK1.ACTION')}
//             </Button>
//             <p className={`feature-text ${rtlClass()}`}>
//               {t('LANDING.BLOCK1.FEATURED')}
//             </p>
//             <div className="logos-container">
//               <div className="feature-logo">
//                 <Button
//                   onClick={() =>
//                     window.open(
//                       'https://thestartupscene.me/INVESTMENTS/9-Egyptian-Flat6Labs-Startups-Embark-on-Gulf-Tour-with-StartEgypt?fbclid=IwAR1IUlBDZEUKyaijN5THAORx6KPGaxxvpawJ0jegM3q9y_UFj22TrzA996s',
//                       '_blank',
//                     )
//                   }
//                 >
//                   <img
//                     className="img-responsive"
//                     src={cairoScene}
//                     alt="cairo scene"
//                   />
//                 </Button>
//               </div>
//               <div className="feature-logo">
//                 <Button
//                   onClick={() =>
//                     window.open(
//                       'https://www.wamda.com/2017/09/egyptian-startup-plans-regulating-private-tutoring',
//                       '_blank',
//                     )
//                   }
//                 >
//                   <img className="img-responsive" src={wamda} alt="wamda" />
//                 </Button>
//               </div>
//               <div className="feature-logo">
//                 <Button
//                   onClick={() =>
//                     window.open(
//                       'http://bbc.com/news/business-36461191',
//                       '_blank',
//                     )
//                   }
//                 >
//                   <img className="img-responsive" src={bbc} alt="BBC" />
//                 </Button>
//               </div>
//               <div className="feature-logo">
//                 <Button
//                   onClick={() =>
//                     window.open('https://youtu.be/8d6lTKv6r1c', '_blank')
//                   }
//                 >
//                   <img className="img-responsive" src={dubai} alt="Dubai" />
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//         <div className={`col-2-of-4 col-1-of-1-md ${rtlClass()}`}>
//           <img src={main} className="macbook-image" alt="macbook" />
//         </div>
//       </div>
//     </div>
//   );
// };

// HomeIntro.propTypes = {
//   openFreeTrail: PropTypes.func.isRequired,
// };

// export default HomeIntro;

const HomeIntro = () => {
  return <div>HomeIntro</div>;
};

export default HomeIntro;
