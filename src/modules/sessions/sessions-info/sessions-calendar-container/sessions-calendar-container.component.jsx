// import React, { useState, useEffect } from 'react';
// import FullCalendar from '@fullcalendar/react';
// import dayGridPlugin from '@fullcalendar/daygrid';
// import timeGridPlugin from '@fullcalendar/timegrid';
// import interactionPlugin from '@fullcalendar/interaction';
// import arLocale from '@fullcalendar/core/locales/ar-kw';
// import getDay from 'date-fns/getDay';
// import { useTranslation } from 'react-i18next';
// import { connect } from 'react-redux';
// import { createStructuredSelector } from 'reselect';
// import PropTypes from 'prop-types';
// import addDays from 'date-fns/addDays';
// import { Dialog } from '@material-ui/core';
// import { makeStyles } from '@material-ui/core/styles';
// import {
//   selectError,
//   selectTimeSlots,
// } from '../../../../redux/calendar/calendar.selectors';
// import { getSlotsStart } from '../../../../redux/calendar/calendar.actions';
// import { selectCurrentUser } from '../../../../redux/user/user.selectors.ts';
// import SessionViewCalendarModal from '../../../../components/modals/session-view-calendar-modal/session-view-calendar-modal.component';
// import SESSIONS from '../sessions-list/sessions-data';

// import './sessions-calendar-container.styles.scss';
// const useStyles = makeStyles(() => ({
//   paperFullWidth: {
//     width: '100%',
//     margin: 0,
//   },
// }));
// const SessionsCalendarContainer = ({
//   slots,
//   getSlotsStartProp,
//   currentUser,
// }) => {
//   const classes = useStyles();
//   const [currentEvents, handleEvents] = useState([]);
//   const [openViewCalendarModal, setOpenViewCalendarModal] = useState(false);
//   const { t, i18n } = useTranslation();
//   const today = new Date();
//   const calendarRef = React.createRef();
//   useEffect(() => {
//     getSlotsStartProp({
//       userId: currentUser.id,
//       from: today.toISOString(),
//       to: addDays(today, 30).toISOString(),
//     });
//   }, [getSlotsStartProp]);

//   useEffect(() => {
//     handleEvents(slots);
//   }, [slots]);

//   const handleDateChange = (type) => {
//     const calendarApi = calendarRef.current.getApi();
//     if (type === 'next') {
//       calendarApi.next();
//     } else if (type === 'prev') {
//       calendarApi.prev();
//     }
//     const { currentRange } = calendarApi.getCurrentData().dateProfile;
//     getSlotsStartProp({
//       userId: currentUser.id,
//       from: currentRange.start.toISOString(),
//       to: currentRange.end.toISOString(),
//     });
//   };

//   const handleCloseViewCalendarModal = () => {
//     setOpenViewCalendarModal(false);
//   };

//   return (
//     <div className="session-calendar">
//       <FullCalendar
//         ref={calendarRef}
//         plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
//         customButtons={{
//           next: {
//             text: 'next',
//             click: () => handleDateChange('next'),
//           },
//           prev: {
//             text: 'prev',
//             click: () => handleDateChange('prev'),
//           },
//         }}
//         headerToolbar={{
//           left: 'prev,next today',
//           center: 'title',
//           right: 'dayGridMonth,timeGridWeek,timeGridDay',
//         }}
//         firstDay={getDay(new Date())}
//         initialView="dayGridMonth"
//         eventColor="#357cd6"
//         allDaySlot={false}
//         slotLabelInterval="00:30"
//         slotLabelFormat={{
//           hour: '2-digit',
//           minute: '2-digit',
//           omitZeroMinute: false,
//           meridiem: 'long',
//         }}
//         dayHeaderFormat={{
//           weekday: 'short',
//           month: 'short',
//           day: 'numeric',
//           omitCommas: true,
//         }}
//         buttonText={{
//           today: t('CALENDAR.BUTTONS.TODAY'),
//           month: t('CALENDAR.BUTTONS.MONTH'),
//           week: t('CALENDAR.BUTTONS.WEEK'),
//           day: t('CALENDAR.BUTTONS.DAY'),
//         }}
//         direction={i18n.dir()}
//         validRange={{ start: new Date() }}
//         events={currentEvents}
//         eventContent={renderEventContent}
//         locale={i18n.language === 'ar' ? arLocale : undefined}
//       />
//       {openViewCalendarModal && (
//         <Dialog
//           maxWidth="md"
//           fullWidth
//           onClose={handleCloseViewCalendarModal}
//           aria-labelledby="view-calendar-dialog"
//           open={openViewCalendarModal}
//           classes={classes}
//         >
//           <SessionViewCalendarModal
//             sessions={SESSIONS}
//             handleClose={handleCloseViewCalendarModal}
//           />
//         </Dialog>
//       )}
//     </div>
//   );
// };

// SessionsCalendarContainer.propTypes = {
//   slots: PropTypes.array,
//   getSlotsStartProp: PropTypes.func.isRequired,
//   currentUser: PropTypes.object,
// };

// const mapStateToProps = createStructuredSelector({
//   slots: selectTimeSlots,
//   error: selectError,
//   currentUser: selectCurrentUser,
// });

// const mapDispatchToProps = (dispatch) => ({
//   getSlotsStartProp: (params) => dispatch(getSlotsStart(params)),
// });

// export default connect(
//   mapStateToProps,
//   mapDispatchToProps,
// )(SessionsCalendarContainer);

// const renderEventContent = (eventInfo) => (
//   <div>
//     <i>{eventInfo.event.title}</i>
//   </div>
// );

const SessionsCalendarContainer = () => {
  return <div>SessionsCalendarContainer</div>;
};

export default SessionsCalendarContainer;
