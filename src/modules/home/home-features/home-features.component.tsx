// import React from 'react';
// import { useTranslation } from 'react-i18next';
// import { Button } from '@material-ui/core';
// import PropTypes from 'prop-types';

// import { rtlClass } from '../../../assets/utils/utils';

// import feature1 from '../../../assets/images/landing/feature_1.png';
// import feature2 from '../../../assets/images/landing/feature_2.png';
// import feature3 from '../../../assets/images/landing/feature_3.png';
// import feature4 from '../../../assets/images/landing/feature_4.png';

// import './home-features.styles.scss';

// const HomeFeatures = ({ openFreeTrail }) => {
//   const { t } = useTranslation();
//   return (
//     <div className="landing__features">
//       <div className="container">
//         <div className="row">
//           <div className={`col-2-of-4 col-1-of-1-sm ${rtlClass()}`}>
//             <h2>{t('LANDING.BLOCK3.ITEM1.TITLE')}</h2>
//             <p>{t('LANDING.BLOCK3.ITEM1.DESCRIPTION')}</p>
//             <Button
//               size="large"
//               className="feature-button"
//               variant="contained"
//               color="primary"
//               onClick={openFreeTrail}
//             >
//               {t('LANDING.BLOCK3.ITEM1.BUTTON')}
//             </Button>
//           </div>
//           <div className="col-2-of-4 col-1-of-1-sm">
//             <img src={feature1} alt="feature_1" />
//           </div>
//         </div>

//         <div className="row">
//           <div className={`col-2-of-4 col-1-of-1-sm ${rtlClass()}`}>
//             <img src={feature2} alt="feature_2" />
//           </div>
//           <div className="col-2-of-4 col-1-of-1-sm">
//             <h2>{t('LANDING.BLOCK3.ITEM2.TITLE')}</h2>
//             <p>{t('LANDING.BLOCK3.ITEM2.DESCRIPTION')}</p>
//           </div>
//         </div>

//         <div className="row">
//           <div className={`col-2-of-4 col-1-of-1-sm ${rtlClass()}`}>
//             <h2>{t('LANDING.BLOCK3.ITEM3.TITLE')}</h2>
//             <p>{t('LANDING.BLOCK3.ITEM3.DESCRIPTION')}</p>
//           </div>
//           <div className="col-2-of-4 col-1-of-1-sm">
//             <img src={feature3} alt="feature_3" />
//           </div>
//         </div>

//         <div className="row">
//           <div className={`col-2-of-4 col-1-of-1-sm ${rtlClass()}`}>
//             <img src={feature4} alt="feature_4" />
//           </div>
//           <div className="col-2-of-4 col-1-of-1-sm">
//             <h2>{t('LANDING.BLOCK3.ITEM4.TITLE')}</h2>
//             <p>{t('LANDING.BLOCK3.ITEM4.DESCRIPTION')}</p>
//             <Button
//               size="large"
//               className="feature-button"
//               variant="contained"
//               color="primary"
//               onClick={openFreeTrail}
//             >
//               {t('LANDING.BLOCK3.ITEM4.BUTTON')}
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// HomeFeatures.propTypes = {
//   openFreeTrail: PropTypes.func.isRequired,
// };

// export default HomeFeatures;

const HomeFeatures = () => {
  return <div>HomeFeatures</div>;
};

export default HomeFeatures;
