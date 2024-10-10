// import React from 'react';
// import PropTypes from 'prop-types';
// import { useTranslation } from 'react-i18next';
// import { useHistory } from 'react-router-dom';
// import { Button } from '@material-ui/core';
// import { CheckCircle } from '@material-ui/icons';

// import './profile-package.styles.scss';
// const ProfilePackage = ({ packageData, instructorId }) => {
//   const { t } = useTranslation();
//   const history = useHistory();
//   const navigateToCheckout = () => {
//     history.push(`/checkout?id=${instructorId}&course=false`);
//   };
//   return (
//     <>
//       {packageData && packageData.type !== 'TrialPackage' && (
//         <div
//           className={`profile-package ${
//             packageData.package_type === 'monthly' ? 'popular' : ''
//           }`}
//         >
//           {packageData.package_type === 'monthly' && (
//             <p className="profile-package__badge">
//               {t('PROFILE.PACKAGES.MOST_POPULAR')}
//             </p>
//           )}
//           <p className="profile-package__rate">
//             ${13 - Number(packageData.id)}{' '}
//             <span className="profile-package__rate-perHour">
//               {t('PROFILE.PACKAGES.PER_HOUR')}
//             </span>
//           </p>
//           <div className="profile-package__minutes">
//             {packageData.hours}{' '}
//             {packageData.hours > 1
//               ? t('PROFILE.PACKAGES.HOURS')
//               : t('PROFILE.PACKAGES.HOUR')}
//           </div>
//           <div className="profile-package__save">
//             <CheckCircle color="primary" />
//             <span className="profile-package__save-title">
//               {t('PROFILE.PACKAGES.SAVE')}
//             </span>
//             20%
//           </div>
//           <Button
//             className="profile-package__action"
//             variant="contained"
//             color="primary"
//             onClick={navigateToCheckout}
//           >
//             {t('PROFILE.PACKAGES.BOOK_NOW')}
//           </Button>
//         </div>
//       )}
//     </>
//   );
// };

// ProfilePackage.propTypes = {
//   packageData: PropTypes.object,
//   instructorId: PropTypes.string,
// };

// export default ProfilePackage;

const ProfilePackage = () => {
  return <div>ProfilePackage</div>;
};

export default ProfilePackage;
