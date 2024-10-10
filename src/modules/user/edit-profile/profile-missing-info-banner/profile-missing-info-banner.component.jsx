// import React, { useEffect, useState } from 'react';
// import PropTypes from 'prop-types';
// import { useTranslation } from 'react-i18next';
// import { HighlightOff } from '@material-ui/icons';

// import { calculateMissingProfileInformation } from '../edit-profile.utils';

// import './profile-missing-info-banner.styles.scss';
// const ProfileMissingInfoBanner = ({ data, slots, blockingMissingInfo }) => {
//   const { t } = useTranslation();
//   const [missingProfileItems, setMissingProfileItems] = useState([]);
//   useEffect(() => {
//     const missingItems = calculateMissingProfileInformation(data);
//     setMissingProfileItems(missingItems);
//     if (missingItems.length === 0) {
//       blockingMissingInfo(false);
//       return;
//     }

//     let flag = false;
//     missingItems.forEach((missingItem) => {
//       if (missingItem.bold) {
//         flag = true;
//       }
//     });
//     blockingMissingInfo(flag);
//   }, [data, slots]);
//   return (
//     <>
//       {missingProfileItems.length > 0 && (
//         <section className="profile-missing-info-banner">
//           <HighlightOff />
//           <h4>{t('PROFILE.EDITPROFILE.MISSING_INFORMATION.TITLE')}</h4>
//           <p> {t('PROFILE.EDITPROFILE.MISSING_INFORMATION.DESCRIPTION')} </p>
//           <ul>
//             {missingProfileItems.map((item) => (
//               <li key={item.text} className={item.bold ? 'bold' : ''}>
//                 {t(item.text)}
//               </li>
//             ))}
//           </ul>
//         </section>
//       )}
//     </>
//   );
// };

// ProfileMissingInfoBanner.propTypes = {
//   data: PropTypes.object,
//   slots: PropTypes.array,
//   blockingMissingInfo: PropTypes.func,
// };

// export default ProfileMissingInfoBanner;

const ProfileMissingInfoBanner = () => {
  return <div>ProfileMissingInfoBanner</div>;
};

export default ProfileMissingInfoBanner;
