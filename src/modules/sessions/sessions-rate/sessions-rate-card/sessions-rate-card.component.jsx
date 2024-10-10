// import React, { useState, useEffect } from 'react';
// import { useTranslation } from 'react-i18next';
// import PropTypes from 'prop-types';
// import { connect } from 'react-redux';
// import { createStructuredSelector } from 'reselect';
// import Rating from '@material-ui/lab/Rating';
// import { Button, Dialog } from '@material-ui/core';
// import { makeStyles } from '@material-ui/core/styles';
// import { parseISO, format, differenceInMinutes } from 'date-fns';
// import arSA from 'date-fns/locale/ar-SA';
// import enUS from 'date-fns/locale/en-US';
// import {
//   CalendarToday,
//   Group,
//   Person,
//   Schedule,
//   TimerTwoTone,
// } from '@material-ui/icons';

// import { selectCurrentUser } from '../../../../redux/user/user.selectors.ts';
// import SessionsStudentRate from './sessions-student-rate/sessions-student-rate.component';
// import SessionsInstructorRate from './sessions-instructor-rate/sessions-instructor-rate.component';
// import { rtlClass } from '../../../../assets/utils/utils';

// import './sessions-rate-card.styles.scss';

// const useStyles = makeStyles(() => ({
//   paperFullWidth: {
//     width: '100%',
//   },
//   paper: {
//     margin: 0,
//     borderRadius: '16px',
//   },
// }));

// const SessionsRateCard = ({ session, currentUser }) => {
//   const classes = useStyles();
//   const locales = { ar: arSA, en: enUS };
//   const { t, i18n } = useTranslation();
//   const [isInstructor, setIsInstructor] = useState();
//   const [instructorModalData, setInstructorModalData] = useState({});
//   const [sessionName, setSessionName] = useState();
//   const [openStudentModal, setOpenStudentModal] = useState(false);
//   const [openInstructorModal, setOpenInstructorModal] = useState(false);
//   const [sessionDuration, setSessionDuration] = useState();

//   useEffect(() => {
//     setIsInstructor(session?.tutor?.data?.id === Number(currentUser.id));
//     getSessionInfo();
//   }, []);

//   useEffect(() => {
//     getSessionInfo();
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

//   const openFeedbackModal = () => {
//     if (isInstructor) {
//       let studentsArr = [];
//       let groupFlag;

//       // In case a group session
//       if (session.type === 'GroupSession') {
//         studentsArr = session?.course?.data?.course_students;
//         groupFlag = true;
//       } else {
//         studentsArr = [
//           {
//             student_full_name: session?.student?.data?.name,
//             id: session?.student?.data?.id,
//           },
//         ];
//         groupFlag = false;
//       }

//       setInstructorModalData({
//         sessionId: session.id,
//         startTime: session.start_date,
//         endTime: session.end_date,
//         students: studentsArr,
//         isSessionTrial: session.type === 'TrialSession',
//         // isProgressReport: true,
//         isSessoinGroup: groupFlag,
//       });

//       setOpenInstructorModal(true);
//     } else {
//       setOpenStudentModal(true);
//     }
//   };

//   const handleCloseStudentModal = () => {
//     setOpenStudentModal(false);
//   };

//   const handleCloseInstructorModal = () => {
//     setOpenInstructorModal(false);
//   };

//   return (
//     <div className="session-rate">
//       <div className="session-rate__content">
//         <div className="session-rate__content-top">
//           <div className="session-rate__img-container">
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
//                 className="card-img session-rate__instructor-img"
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
//           <div className={`session-rate__actions ${rtlClass()}`}>
//             <Button
//               color="primary"
//               variant="contained"
//               className="last_button"
//               onClick={() => openFeedbackModal(session.id)}
//             >
//               {isInstructor
//                 ? t('MYSESSIONS.RATE.GIVEFEEDBACK')
//                 : t('MYSESSIONS.RATE.RATE')}
//             </Button>
//           </div>
//         </div>
//         <div className="session-rate__content-middle">
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
//       {openStudentModal && (
//         <Dialog
//           maxWidth="sm"
//           fullWidth
//           onClose={handleCloseStudentModal}
//           aria-labelledby="student-dialog"
//           open={openStudentModal}
//           classes={classes}
//         >
//           <SessionsStudentRate onClose={handleCloseStudentModal} />
//         </Dialog>
//       )}
//       {openInstructorModal && (
//         <Dialog
//           maxWidth="sm"
//           fullWidth
//           onClose={handleCloseInstructorModal}
//           aria-labelledby="instructor-dialog"
//           open={openInstructorModal}
//           classes={classes}
//           scroll="body"
//         >
//           <SessionsInstructorRate
//             instructorData={instructorModalData}
//             onClose={handleCloseInstructorModal}
//           />
//         </Dialog>
//       )}
//     </div>
//   );
// };

// SessionsRateCard.propTypes = {
//   currentUser: PropTypes.object,
//   session: PropTypes.object.isRequired,
// };

// const mapStateToProps = createStructuredSelector({
//   currentUser: selectCurrentUser,
// });

// export default connect(mapStateToProps)(SessionsRateCard);

const SessionsRateCard = () => {
  return <div>SessionsRateCard</div>;
};

export default SessionsRateCard;
