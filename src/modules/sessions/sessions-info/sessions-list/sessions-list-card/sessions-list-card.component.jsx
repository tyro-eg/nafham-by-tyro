// import React, { useState, useEffect } from 'react';
// import { Button, Dialog } from '@material-ui/core';
// import { makeStyles } from '@material-ui/core/styles';
// import {
//   TimerTwoTone,
//   CheckCircle,
//   Cancel,
//   Group,
//   Person,
//   Schedule,
//   CalendarToday,
//   Timer,
// } from '@material-ui/icons';
// import { useTranslation } from 'react-i18next';
// import { useHistory } from 'react-router-dom';
// import PropTypes from 'prop-types';
// import { connect } from 'react-redux';
// import { createStructuredSelector } from 'reselect';
// import {
//   differenceInDays,
//   differenceInHours,
//   differenceInMinutes,
//   parseISO,
//   format,
// } from 'date-fns';
// import arSA from 'date-fns/locale/ar-SA';
// import enUS from 'date-fns/locale/en-US';
// import { Rating } from '@material-ui/lab';

// import { selectCurrentUser } from '../../../../../redux/user/user.selectors.ts';
// import { rtlClass } from '../../../../../assets/utils/utils';
// import { setFirebaseChatId } from '../../../../session-video/chat/chat.firebase.utils';
// import CancelSessionModal from '../../../../../components/modals/cancel-session-modal/cancel-session-modal.component';

// import './sessions-list-card.styles.scss';
// const useStyles = makeStyles(() => ({
//   paperFullWidth: {
//     width: '100%',
//   },
// }));
// const SessionListCard = ({ session, currentUser }) => {
//   const classes = useStyles();
//   const locales = { ar: arSA, en: enUS };
//   const { t, i18n } = useTranslation();
//   const history = useHistory();
//   const [isThisAnInstructor, setThisAnInstructor] = useState();
//   const [sessionName, setSessionName] = useState();
//   const [sessionDuration, setSessionDuration] = useState();
//   const [twelveHoursValidation, setTwelveHoursValidation] = useState();
//   const [openCancelSessionModal, setOpenCancelSessionModal] = useState(false);
//   const [closeModalType, setCloseModalType] = useState('cancel');

//   useEffect(() => {
//     setThisAnInstructor(session?.tutor?.data?.id === Number(currentUser.id));
//     getSessionInfo();
//     setTwelveHoursValidation(
//       differenceInHours(parseISO(session.start_date), new Date()),
//     );
//   }, []);
//   useEffect(() => {
//     getSessionInfo();
//     getRelativeSessionDate();
//   }, [i18n.language]);

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

//   const getRelativeSessionDate = () => {
//     const daysDiff = differenceInDays(parseISO(session.start_date), new Date());

//     if (daysDiff === 0) {
//       const hoursDiff = differenceInHours(
//         parseISO(session.start_date),
//         new Date(),
//       );

//       if (hoursDiff === 0) {
//         const minutesDiff = differenceInMinutes(
//           parseISO(session.start_date),
//           new Date(),
//         );

//         return `${minutesDiff} ${i18n.language === 'en' ? 'Minutes' : 'دقائق'}`;
//       }
//       return `${hoursDiff} ${i18n.language === 'en' ? 'Hours' : 'ساعات'}`;
//     }
//     return `${daysDiff} ${i18n.language === 'en' ? 'Days' : 'أيام'}`;
//   };

//   const gotoInstructorProfile = () => {};

//   const triggerOpenRescheduleModal = () => {};

//   const openCancelModal = (type) => {
//     setCloseModalType(type);
//     setOpenCancelSessionModal(true);
//   };

//   const handleCloseCancelSessionModal = () => {
//     setOpenCancelSessionModal(false);
//   };

//   const goToSession = () => {
//     setFirebaseChatId(session.firebase_key);
//     history.push(`/session-network-test/${session.id}`);
//   };

//   const isInstructorAndNotGroup = () =>
//     isThisAnInstructor && session.type !== 'GroupSession';

//   const notInstructorOrIsGroup = () =>
//     !isThisAnInstructor || session.type === 'GroupSession';

//   const myDateFormatter = (dateStr) => {
//     const locale = locales[i18n.language];
//     return format(parseISO(dateStr), 'EEEE LLL d, y', { locale });
//   };

//   const myTimeFormatter = (dateStr) => {
//     const locale = locales[i18n.language];
//     return format(parseISO(dateStr), 'h:mm aa', { locale });
//   };

//   return (
//     <div className="sessions-card">
//       <div className="sessions-card__content">
//         <div className="sessions-card__content-top">
//           <div className="sessions-card__img-container">
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
//                 className="card-img sessions-card__instructor-img"
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
//           <div className={`sessions-card__actions ${rtlClass()}`}>
//             {(session.state === 'scheduled' ||
//               session.state === 'rescheduled') &&
//               twelveHoursValidation >= 12 && (
//                 <div>
//                   {session.type !== 'GroupSession' && (
//                     <div>
//                       {!isThisAnInstructor && (
//                         <Button
//                           className="sessions-card__actions-button"
//                           color="primary"
//                           variant="contained"
//                           onClick={triggerOpenRescheduleModal}
//                         >
//                           {t('MYSESSIONS.MAIN.CARD.RESCHEDULE')}
//                         </Button>
//                       )}
//                       <Button
//                         className="sessions-card__actions-button"
//                         variant="text"
//                         onClick={() => openCancelModal('cancel')}
//                       >
//                         {t('MYSESSIONS.MAIN.CARD.CANCEL')}
//                       </Button>
//                     </div>
//                   )}
//                   {session.type === 'GroupSession' && isThisAnInstructor && (
//                     <div>
//                       <Button
//                         className="sessions-card__actions-button"
//                         color="primary"
//                         variant="contained"
//                         onClick={triggerOpenRescheduleModal}
//                       >
//                         {t('MYSESSIONS.MAIN.CARD.RESCHEDULE')}
//                       </Button>
//                       <Button
//                         className="sessions-card__actions-button"
//                         variant="outlined"
//                         onClick={() => openCancelModal('cancel')}
//                       >
//                         {t('MYSESSIONS.MAIN.CARD.CANCEL')}
//                       </Button>
//                     </div>
//                   )}
//                 </div>
//               )}

//             {session.state === 'open' && (
//               <div className="sessions-card__status-wrapper">
//                 {isThisAnInstructor && (
//                   <Button
//                     className="sessions-card__status-wrapper-button endSession"
//                     color="secondary"
//                     variant="contained"
//                     onClick={() => openCancelModal('end')}
//                   >
//                     {t('MYSESSIONS.MAIN.CARD.END')}
//                   </Button>
//                 )}
//                 <Button
//                   className="sessions-card__status-wrapper-button"
//                   color="primary"
//                   variant="contained"
//                   onClick={goToSession}
//                 >
//                   {t('MYSESSIONS.MAIN.CARD.GOTO')}
//                 </Button>
//               </div>
//             )}
//           </div>
//         </div>
//         <div className="sessions-card__content-middle">
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
//       <div className="sessions-card__status u-center-text">
//         <div>
//           {session.state === 'scheduled' && (
//             <div className="sessions-card__status-wrapper">
//               <Timer
//                 className="u-color-primary u-font-size-18"
//                 aria-hidden="true"
//               ></Timer>
//               <p className="u-color-title">
//                 {t('MYSESSIONS.MAIN.CARD.WILLGOLIVE')} :{' '}
//                 <span>{getRelativeSessionDate()}</span>
//               </p>
//             </div>
//           )}

//           {session.state === 'completed' && (
//             <div className="sessions-card__status-wrapper">
//               <CheckCircle
//                 className="u-color-primary u-font-size-18"
//                 aria-hidden="true"
//               ></CheckCircle>
//               <p className="u-color-title">
//                 {t('MYSESSIONS.MAIN.CARD.COMPLETED')}
//               </p>
//             </div>
//           )}

//           {session.state === 'missed' && (
//             <div className="sessions-card__status-wrapper">
//               <Cancel
//                 className="u-color-danger u-font-size-18"
//                 aria-hidden="true"
//               ></Cancel>
//               <p className="u-color-title">
//                 {t('MYSESSIONS.MAIN.CARD.MISSED')}
//               </p>
//             </div>
//           )}

//           {session.state === 'canceled' && (
//             <div className="sessions-card__status-wrapper">
//               <Cancel
//                 className="u-color-danger u-font-size-18"
//                 aria-hidden="true"
//               ></Cancel>
//               <p className="u-color-title">
//                 {t('MYSESSIONS.MAIN.CARD.CANCELLED')}
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//       {openCancelSessionModal && (
//         <Dialog
//           maxWidth="xs"
//           fullWidth
//           onClose={handleCloseCancelSessionModal}
//           aria-labelledby="cancel-session-dialog"
//           open={openCancelSessionModal}
//           classes={classes}
//         >
//           <CancelSessionModal
//             type={closeModalType}
//             sessionId={+session.id}
//             handleClose={handleCloseCancelSessionModal}
//           />
//         </Dialog>
//       )}
//     </div>
//   );
// };

// SessionListCard.propTypes = {
//   currentUser: PropTypes.object,
//   session: PropTypes.object.isRequired,
// };

// const mapStateToProps = createStructuredSelector({
//   currentUser: selectCurrentUser,
// });

// export default connect(mapStateToProps)(SessionListCard);

const SessionListCard = () => {
  return <div>SessionListCard</div>;
};

export default SessionListCard;
