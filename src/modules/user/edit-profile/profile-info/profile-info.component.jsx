// import React, { useEffect, useState } from 'react';
// import PropTypes from 'prop-types';
// import { Button, IconButton, Dialog } from '@material-ui/core';
// import { Edit } from '@material-ui/icons';
// import { Rating } from '@material-ui/lab';
// import { makeStyles } from '@material-ui/core/styles';
// import { useTranslation } from 'react-i18next';
// import objstr from 'obj-str';

// import ReadMore from '../../../../components/read-more/read-more.component';
// import EditProfileVideoModal from '../../../../components/modals/edit-profile-video/edit-profile-video.modal';
// import EditProfileImageModal from '../../../../components/modals/edit-profile-image/edit-profile-image.modal';
// import { getYoutubeId } from '../edit-profile.utils';
// import { rtlClass } from '../../../../assets/utils/utils';
// import thumbnailPlaceholder from '../../../../assets/images/video-edit-placeholder_16@2x.png';
// import { ReactComponent as ProfileImgPlaceholder } from '../../../../assets/images/img-placeholder_23@2x.svg';

// import './profile-info.styles.scss';
// const useStyles = makeStyles(() => ({
//   paperFullWidth: {
//     width: '100%',
//   },
//   paper: {
//     margin: 0,
//     borderRadius: '16px',
//   },
// }));
// const ProfileInfo = ({ data, editMode, getProfileInfo }) => {
//   const classes = useStyles();
//   const { t } = useTranslation();
//   const [videoUrl, setVideoUrl] = useState(null);
//   const [youtubeThumbnail, setYoutubeThumbnail] =
//     useState(thumbnailPlaceholder);
//   const [about, setAbout] = useState('');
//   const [openImageViewModal, setOpenImageViewModal] = useState(false);
//   const [openVideoEditModal, setOpenVideoEditModal] = useState(false);
//   const [openImageEditModal, setOpenImageEditModal] = useState(false);
//   const [croppedImg, setCroppedImg] = useState();
//   const [profileUpdateData, setProfileUpdateData] = useState({});
//   useEffect(() => {
//     if (data) {
//       if (data.video) {
//         setVideoUrl(`https://www.youtube.com/embed/${data.video}`);
//         setYoutubeThumbnail(
//           `https://img.youtube.com/vi/${data.video}/hqdefault.jpg`,
//         );
//       }
//       if (data.about) {
//         setAbout(data.about);
//       }
//     }
//   }, [data]);

//   useEffect(() => {
//     if (profileUpdateData && Object.keys(profileUpdateData).length > 0) {
//       getProfileInfo(profileUpdateData);
//     }
//   }, [profileUpdateData]);
//   const showProfileVideoEditModal = () => setOpenVideoEditModal(true);
//   const handleCloseVideoEditModal = () => setOpenVideoEditModal(false);
//   const profileImgEditModal = () => setOpenImageEditModal(true);
//   const handleCloseImageEditModal = () => setOpenImageEditModal(false);
//   const profileImgViewerModal = () => setOpenImageViewModal(true);
//   const handleCloseImageViewModal = () => setOpenImageViewModal(false);
//   const handleInputChange = (event) => {
//     setAbout(event.target.value);
//   };
//   const handleInputBlur = (event) => {
//     setProfileInfo(event.target.value, 'about');
//   };

//   const setProfileInfo = (updatedData, type) => {
//     switch (type) {
//       case 'about':
//         setProfileUpdateData((prevState) => ({
//           ...prevState,
//           about: updatedData,
//         }));
//         break;
//       case 'video':
//         profileUpdateData.video = getYoutubeId(updatedData);
//         setProfileUpdateData((prevState) => ({
//           ...prevState,
//           video: updatedData,
//         }));
//         setVideoUrl(`https://www.youtube.com/embed/${profileUpdateData.video}`);
//         setYoutubeThumbnail(
//           `https://img.youtube.com/vi/${profileUpdateData.video}/hqdefault.jpg`,
//         );
//         break;
//       case 'img':
//         profileUpdateData.img = updatedData;
//         setProfileUpdateData((prevState) => ({
//           ...prevState,
//           img: updatedData,
//         }));
//         setCroppedImg(updatedData);
//         break;
//       default:
//         break;
//     }
//   };
//   return (
//     <section className={`profile-info ${rtlClass()}`}>
//       {data && (
//         <>
//           <div className="profile-info__container container">
//             <div className="profile-info__instructor">
//               <div className="profile-info__instructor-card">
//                 <div
//                   className={objstr({
//                     'profile-info__instructor-img': true,
//                     online: data.online,
//                     editMode: data.profile_picture_medium && editMode,
//                   })}
//                 >
//                   {!editMode && (
//                     <Button
//                       className="profile-img-btn"
//                       onClick={profileImgViewerModal}
//                     >
//                       <img
//                         className="clickable-img"
//                         src={croppedImg || data.profile_picture_medium}
//                         alt="profile test"
//                       />
//                     </Button>
//                   )}
//                   {editMode && data.profile_picture_medium && (
//                     <>
//                       <img
//                         src={croppedImg || data.profile_picture_medium}
//                         alt="profile"
//                       />
//                       <IconButton
//                         className="edit-icon"
//                         aria-hidden="true"
//                         aria-label="edit-image"
//                         onClick={profileImgEditModal}
//                       >
//                         <Edit />
//                       </IconButton>
//                     </>
//                   )}
//                   {editMode &&
//                     ((data.profile_picture_medium &&
//                       data.profile_picture_medium.length === 0) ||
//                       !data.profile_picture_medium) && (
//                       <Button onClick={profileImgEditModal}>
//                         <ProfileImgPlaceholder className="editMode placeholder" />
//                       </Button>
//                     )}
//                 </div>

//                 <div className="profile-info__instructor-info">
//                   <div className="profile-info__instructor-name">
//                     {data.full_name}
//                   </div>
//                   <div className="profile-info__instructor-stars">
//                     <Rating
//                       name="profile-info-review"
//                       value={+Number(data.average_rating).toPrecision(2)}
//                       precision={0.1}
//                       readOnly
//                     />
//                     <span className="review-numbers">
//                       {+Number(data.average_rating).toPrecision(2)} (5.0)
//                     </span>
//                   </div>
//                 </div>
//               </div>
//               <div className="profile-info__about">
//                 {!!editMode && (
//                   <textarea
//                     className="cellInput profile-p"
//                     name="profile about"
//                     rows="5"
//                     cols="40"
//                     onChange={handleInputChange}
//                     onBlur={handleInputBlur}
//                     value={about}
//                   />
//                 )}
//                 {!editMode && (
//                   <ReadMore text={about || ''} maxLength={394}></ReadMore>
//                 )}
//               </div>
//             </div>
//             <div className="profile-info__video-banner">
//               {!!videoUrl && !videoUrl.includes('error') && !editMode && (
//                 <iframe
//                   title="profile-video"
//                   src={videoUrl}
//                   frameBorder="0"
//                   allow="autoplay; encrypted-media"
//                   allowFullScreen
//                 ></iframe>
//               )}
//               {!!editMode && (
//                 <div
//                   style={{ backgroundImage: `url(${youtubeThumbnail})` }}
//                   className={`profile-info__video-banner--editMode u-center-text ${
//                     videoUrl ? 'editMode' : ''
//                   }`}
//                 >
//                   <div className="text-wrapper">
//                     {!videoUrl && (
//                       <h4>{t('PROFILE.EDITPROFILE.VIDEO.EDITTEXT.TITLE')}</h4>
//                     )}
//                     <p className={videoUrl ? 'editMode' : ''}>
//                       {t('PROFILE.EDITPROFILE.VIDEO.EDITTEXT.BODY')}.
//                     </p>
//                     <Button
//                       className="u-full-width"
//                       variant="contained"
//                       color="primary"
//                       onClick={showProfileVideoEditModal}
//                     >
//                       {t('PROFILE.EDITPROFILE.VIDEO.EDITTEXT.BUTTON')}
//                     </Button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//           <div className="profile-info__statistics">
//             <div className="profile-info__statistics-card">
//               <p className="profile-info__statistics-card__name">
//                 {t('PROFILE.EDITPROFILE.STATISTICS.RATE')}
//               </p>
//               <p className="profile-info__statistics-card__value">
//                 {data.rate} {t('GENEREL.EGP_PER_HOUR')}
//               </p>
//             </div>
//             <div className="profile-info__statistics-card">
//               <p className="profile-info__statistics-card__name">
//                 {t('PROFILE.EDITPROFILE.STATISTICS.REVIEWS')}
//               </p>
//               <p className="profile-info__statistics-card__value">
//                 {data.number_of_reviews}
//               </p>
//             </div>
//             <div className="profile-info__statistics-card">
//               <p className="profile-info__statistics-card__name">
//                 {t('PROFILE.EDITPROFILE.STATISTICS.ACTIVE_HOURS')}
//               </p>
//               <p className="profile-info__statistics-card__value">
//                 36 {t('GENEREL.HOURS')}
//               </p>
//             </div>
//             <div className="profile-info__statistics-card">
//               <p className="profile-info__statistics-card__name">
//                 {t('PROFILE.EDITPROFILE.STATISTICS.NUMBER_OF_STUDENTS')}
//               </p>
//               <p className="profile-info__statistics-card__value">
//                 {data.number_of_students}
//               </p>
//             </div>
//           </div>
//         </>
//       )}

//       {openVideoEditModal && (
//         <Dialog
//           maxWidth="sm"
//           fullWidth
//           onClose={handleCloseVideoEditModal}
//           aria-labelledby="profile-video-edit-dialog"
//           open={openVideoEditModal}
//           classes={classes}
//         >
//           <EditProfileVideoModal
//             onClose={handleCloseVideoEditModal}
//             dataUrl={videoUrl}
//             onSetProfileInfo={setProfileInfo}
//           />
//         </Dialog>
//       )}
//       {openImageViewModal && (
//         <Dialog
//           maxWidth="sm"
//           fullWidth
//           onClose={handleCloseImageViewModal}
//           aria-labelledby="profile-image-viewer-dialog"
//           open={openImageViewModal}
//           classes={classes}
//         >
//           <div className="profile-info__img-viewer-modal">
//             <div className="profile-info__img-edit-modal-placeholder">
//               <img
//                 src={croppedImg || data.profile_picture_medium}
//                 alt="modal-profile"
//               />
//             </div>

//             <div className="profile-info__img-edit-modal-container">
//               <Button
//                 onClick={handleCloseImageViewModal}
//                 variant="outlined"
//                 color="secondary"
//               >
//                 {t('MODALS.ACTIONS.CANCEL')}
//               </Button>
//             </div>
//           </div>
//         </Dialog>
//       )}
//       {openImageEditModal && (
//         <Dialog
//           maxWidth="sm"
//           fullWidth
//           onClose={handleCloseImageEditModal}
//           aria-labelledby="profile-image-Edit-dialog"
//           open={openImageEditModal}
//           classes={classes}
//         >
//           <EditProfileImageModal
//             onClose={handleCloseImageEditModal}
//             imageUrl={croppedImg || data.profile_picture_medium}
//             onSetProfileInfo={setProfileInfo}
//           />
//         </Dialog>
//       )}
//     </section>
//   );
// };

// ProfileInfo.propTypes = {
//   data: PropTypes.object,
//   editMode: PropTypes.bool,
//   getProfileInfo: PropTypes.func,
// };

// export default ProfileInfo;

const ProfileInfo = () => {
  return <div>ProfileInfo</div>;
};

export default ProfileInfo;
