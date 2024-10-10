// import React, { useState } from 'react';
// import { useTranslation } from 'react-i18next';
// import PropTypes from 'prop-types';
// import Rating from '@material-ui/lab/Rating';
// import { Button, Dialog } from '@material-ui/core';
// import { Add } from '@material-ui/icons';
// import { makeStyles } from '@material-ui/core/styles';
// import MySessionCalendar from '../../../../components/modals/mysession-calendar/mysession-calendar.component';

// import './sessions-schedule-card.styles.scss';
// const useStyles = makeStyles(() => ({
//   paperFullWidth: {
//     width: '100%',
//   },
// }));
// const SessionsScheduleCard = ({ data }) => {
//   const classes = useStyles();
//   const { t } = useTranslation();
//   const [openScheduleSessionModal, setOpenScheduleSessionModal] =
//     useState(false);
//   const gotoInstructorProfile = () => {};
//   const triggerOpenScheduleModal = () => {
//     setOpenScheduleSessionModal(true);
//   };

//   const handleCloseScheduleSessionModal = () => {
//     setOpenScheduleSessionModal(false);
//   };

//   return (
//     <div className="schedule-card">
//       <Button
//         className="schedule-card__img-container"
//         onClick={gotoInstructorProfile}
//       >
//         <img
//           src={data.user_image}
//           alt="Schedule card img"
//           className="schedule-card__img"
//         />
//       </Button>
//       <div className="schedule-card__container">
//         <div className="schedule-card__info">
//           <div className="instructor-info">
//             <h3 className="name">{data.user_name}</h3>
//             <div className="review">
//               <div className="review-stars">
//                 <Rating
//                   name="sessions schedule card rating"
//                   value={Math.round(data.instructor_rating)}
//                   readOnly
//                 />
//               </div>
//             </div>
//           </div>
//           <Button
//             className="last_button"
//             color="primary"
//             variant="contained"
//             onClick={triggerOpenScheduleModal}
//             startIcon={<Add />}
//           >
//             {t('MYSESSIONS.SCHEDULE.CARD.SCHEDULE')}
//           </Button>
//         </div>
//         <div className="unscheduled">
//           <p>{t('MYSESSIONS.SCHEDULE.CARD.UNSCHEDULED')}</p>
//           <p className="hours">{data.total_minutes / 60}</p>
//         </div>
//       </div>
//       {openScheduleSessionModal && (
//         <Dialog
//           maxWidth="md"
//           fullWidth
//           onClose={handleCloseScheduleSessionModal}
//           aria-labelledby="schedule-session-dialog"
//           open={openScheduleSessionModal}
//           classes={classes}
//         >
//           <MySessionCalendar
//             unscheduledHours={data.total_minutes / 60}
//             handleClose={handleCloseScheduleSessionModal}
//           />
//         </Dialog>
//       )}
//     </div>
//   );
// };
// SessionsScheduleCard.propTypes = {
//   data: PropTypes.object.isRequired,
// };

// export default SessionsScheduleCard;

const SessionsScheduleCard = () => {
  return <div>SessionsScheduleCard</div>;
};

export default SessionsScheduleCard;
