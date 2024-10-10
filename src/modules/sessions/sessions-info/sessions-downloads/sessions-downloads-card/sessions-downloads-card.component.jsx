// import React, { useEffect, useState } from 'react';
// import { useTranslation } from 'react-i18next';
// import { Button, Dialog } from '@material-ui/core';
// import { makeStyles } from '@material-ui/core/styles';
// import { createStructuredSelector } from 'reselect';
// import { connect } from 'react-redux';
// import PropTypes from 'prop-types';
// import { differenceInMinutes, parseISO, format } from 'date-fns';
// import arSA from 'date-fns/locale/ar-SA';
// import enUS from 'date-fns/locale/en-US';
// import {
//   CalendarToday,
//   Group,
//   Person,
//   Schedule,
//   TimerTwoTone,
//   GetApp,
// } from '@material-ui/icons';
// import { Rating } from '@material-ui/lab';

// import { selectCurrentUser } from '../../../../../redux/user/user.selectors.ts';
// import { rtlClass } from '../../../../../assets/utils/utils';
// import noDownload from '../../../../../assets/images/no-download.png';

// import './sessions-downloads-card.styles.scss';

// const useStyles = makeStyles(() => ({
//   paperFullWidth: {
//     width: '100%',
//   },
//   paper: {
//     margin: 0,
//     borderRadius: '16px',
//   },
// }));

// const SessionsDownloadsCard = ({ session, currentUser }) => {
//   const archives = [1, 2, 3];
//   const classes = useStyles();
//   const locales = { ar: arSA, en: enUS };
//   const { t, i18n } = useTranslation();
//   const [isInstructor, setIsInstructor] = useState();
//   const [sessionName, setSessionName] = useState();
//   const [sessionDuration, setSessionDuration] = useState();
//   const [openDownloadModal, setOpenDownloadModal] = useState(false);

//   useEffect(() => {
//     setIsInstructor(session?.tutor?.data?.id === Number(currentUser.id));
//     getSessionInfo();
//   }, []);

//   useEffect(() => {
//     getSessionInfo();
//   }, [i18n.language]);

//   const handleCloseDownloadModal = () => {
//     setOpenDownloadModal(false);
//   };

//   const getSessionInfo = () => {
//     setSessionDuration(
//       differenceInMinutes(
//         parseISO(session.end_date),
//         parseISO(session.start_date),
//       ),
//     );
//     if (session.type === 'TrialSession') {
//       setSessionName(t('MYSESSIONS.FILTERS.FREETRIALSESSION'));
//     } else if (session.type === 'PrivateSession') {
//       setSessionName(t('MYSESSIONS.FILTERS.1TO1SESSION'));
//     } else {
//       setSessionName(t('MYSESSIONS.FILTERS.GROUPSESSION'));
//     }
//   };

//   const isInstructorAndNotGroup = () =>
//     isInstructor && session.type !== 'GroupSession';

//   const notInstructorOrIsGroup = () =>
//     !isInstructor || session.type === 'GroupSession';

//   const myDateFormatter = (dateStr) => {
//     const locale = locales[i18n.language];
//     return format(parseISO(dateStr), 'EEEE LLL d, y', { locale });
//   };

//   const myTimeFormatter = (dateStr) => {
//     const locale = locales[i18n.language];
//     return format(parseISO(dateStr), 'h:mm aa', { locale });
//   };

//   const gotoInstructorProfile = () => {};

//   return (
//     <div className="session-download">
//       <div className="session-download__content">
//         <div className="session-download__content-top">
//           <div className="session-download__img-container">
//             {isInstructorAndNotGroup() && (
//               <div className="card-img">
//                 <img
//                   src={
//                     session.student &&
//                     session.student.data &&
//                     session.student.data.image
//                       ? session.student.data.image
//                       : ''
//                   }
//                   alt="student"
//                 />
//               </div>
//             )}
//             {notInstructorOrIsGroup() && (
//               <Button
//                 className="card-img session-download__instructor-img"
//                 onClick={gotoInstructorProfile}
//               >
//                 <img
//                   src={
//                     session.tutor &&
//                     session.tutor.data &&
//                     session.tutor.data.image
//                       ? session.tutor.data.image
//                       : ''
//                   }
//                   alt="instructor"
//                 />
//               </Button>
//             )}
//             <div className="user-info">
//               {isInstructorAndNotGroup() && (
//                 <p className="name">
//                   {session.student &&
//                   session.student.data &&
//                   session.student.data.full_name
//                     ? session.student.data.full_name
//                     : ''}
//                 </p>
//               )}
//               {notInstructorOrIsGroup() && (
//                 <p className="name">
//                   {session.tutor &&
//                   session.tutor.data &&
//                   session.tutor.data.full_name
//                     ? session.tutor.data.full_name
//                     : ''}
//                 </p>
//               )}
//               {session.type !== 'GroupSession' && (
//                 <div className="review">
//                   <div className="review-stars">
//                     <Rating
//                       name="instructor rating"
//                       value={
//                         +Number(
//                           session.tutor &&
//                             session.tutor.data &&
//                             session.tutor.data.rating
//                             ? session.tutor.data.rating
//                             : 0,
//                         ).toPrecision(2)
//                       }
//                       precision={0.1}
//                       readOnly
//                     />
//                     <span className="review-numbers">
//                       {session.tutor &&
//                       session.tutor.data &&
//                       session.tutor.data.rating
//                         ? +Number(session.tutor.data.rating).toPrecision(2)
//                         : 0}{' '}
//                       (5.0)
//                     </span>
//                   </div>
//                 </div>
//               )}
//               {session.type === 'GroupSession' && (
//                 <p className="u-color-body u-font-size-12">
//                   {session.course &&
//                   session.course.data &&
//                   session.course.data.course_name
//                     ? session.course.data.course_name
//                     : ''}
//                 </p>
//               )}
//             </div>
//           </div>
//           <div className={`session-download__actions ${rtlClass()}`}>
//             <Button
//               className="sessions-card__download-button"
//               color="primary"
//               variant="contained"
//               onClick={() => setOpenDownloadModal(true)}
//             >
//               {t('MYSESSIONS.MAIN.CARD.DOWNLOAD')}
//             </Button>
//           </div>
//         </div>
//         <div className="session-download__content-middle">
//           <div className={`prop-card ${rtlClass()}`}>
//             <p className="title">{t('MYSESSIONS.MAIN.CARD.TYPE')}</p>
//             <p className="value">
//               {session.course &&
//               session.course.data &&
//               session.course.data.course_id ? (
//                 <Group className={rtlClass()} />
//               ) : (
//                 <Person className={rtlClass()} />
//               )}
//               {sessionName}
//             </p>
//           </div>
//           <div className={`prop-card ${rtlClass()}`}>
//             <p className="title">{t('MYSESSIONS.MAIN.CARD.DURATION')}</p>
//             <p className="value">
//               <TimerTwoTone className={rtlClass()} />
//               {sessionDuration}-{t('MYSESSIONS.MAIN.CARD.MINUTE')}
//             </p>
//           </div>
//           <div className={`prop-card ${rtlClass()}`}>
//             <p className="title">{t('MYSESSIONS.MAIN.CARD.TIME')}</p>
//             <p className="value">
//               <Schedule className={rtlClass()} />
//               {session.start_date ? myTimeFormatter(session.start_date) : ''}
//             </p>
//           </div>
//           <div className={`prop-card ${rtlClass()}`}>
//             <p className="title">{t('MYSESSIONS.MAIN.CARD.SUBJECT')}</p>
//             <p className="value field">
//               {session.field && session.field.data && session.field.data.name
//                 ? session.field.data.name
//                 : ''}
//             </p>
//           </div>
//           <div className={`prop-card ${rtlClass()}`}>
//             <p className="title">{t('MYSESSIONS.MAIN.CARD.DATE')}</p>
//             <p className="value">
//               <CalendarToday className={rtlClass()} />
//               {session.start_date ? myDateFormatter(session.start_date) : ''}
//             </p>
//           </div>
//         </div>
//       </div>
//       {openDownloadModal && (
//         <Dialog
//           maxWidth="sm"
//           fullWidth
//           onClose={handleCloseDownloadModal}
//           aria-labelledby="download-dialog"
//           open={openDownloadModal}
//           classes={classes}
//         >
//           {openDownloadModal ? (
//             <div className="sessionDownloadModal">
//               <div className="sessionDownloadModal__head">
//                 <h4 className="u-color-title u-font-size-18">
//                   {t('MYSESSIONS.MAIN.DOWNLOADMODAL.TITLE')}
//                 </h4>
//                 <GetApp color="primary" fontSize="large" />
//               </div>
//               {archives.map((archive, i) => (
//                 <div key={archive} className="sessionDownloadModal__body">
//                   <p>
//                     {t('MYSESSIONS.MAIN.DOWNLOADMODAL.VIDEO_NAME')} {i + 1}
//                   </p>
//                   {/* <a className="download-link" href="{environment.ARCHIVE_DOWNLOAD_URL + environment.OPENTOK_KEY}/{archive.id}/archive.mp4" target="_blank">{t('MYSESSIONS.MAIN.DOWNLOADMODAL.DOWNLOAD_BTN)'}</a> */}
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="sessionDownloadModal__no-links">
//               <h4 className="u-center-text u-font-size-16 title">
//                 {t('MYSESSIONS.MAIN.DOWNLOADMODAL.NO_DOWNLOAD_LINKS')}
//               </h4>
//               <img className="no-image" src={noDownload} alt="no-download" />
//             </div>
//           )}
//         </Dialog>
//       )}
//     </div>
//   );
// };

// SessionsDownloadsCard.propTypes = {
//   currentUser: PropTypes.object,
//   session: PropTypes.object.isRequired,
// };

// const mapStateToProps = createStructuredSelector({
//   currentUser: selectCurrentUser,
// });

// export default connect(mapStateToProps)(SessionsDownloadsCard);

const SessionsDownloadsCard = () => {
  return <div>SessionsDownloadsCard</div>;
};

export default SessionsDownloadsCard;
