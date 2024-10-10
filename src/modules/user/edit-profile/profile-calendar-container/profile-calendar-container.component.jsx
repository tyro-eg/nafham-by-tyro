// import React, { useState, useEffect } from 'react';
// import { useHistory, useParams } from 'react-router-dom';
// import FullCalendar from '@fullcalendar/react';
// import dayGridPlugin from '@fullcalendar/daygrid';
// import timeGridPlugin from '@fullcalendar/timegrid';
// import interactionPlugin from '@fullcalendar/interaction';
// import arLocale from '@fullcalendar/core/locales/ar-kw';
// import getDay from 'date-fns/getDay';
// import { useTranslation } from 'react-i18next';
// import { Button, Dialog } from '@material-ui/core';
// import { makeStyles } from '@material-ui/core/styles';
// import { connect } from 'react-redux';
// import { createStructuredSelector } from 'reselect';
// import PropTypes from 'prop-types';
// import addDays from 'date-fns/addDays';
// import {
//   selectCreateSlotsStatus,
//   selectDeleteSlotsStatus,
//   selectError,
//   selectTimeSlots,
// } from '../../../../redux/calendar/calendar.selectors';
// import { selectCurrentUser } from '../../../../redux/user/user.selectors.ts';
// import {
//   createSlotsStart,
//   getSlotsStart,
//   deleteSlotsStart,
// } from '../../../../redux/calendar/calendar.actions';

// import ProfileModal from '../../../../components/modals/profile-modal/profile-modal.component';

// import { rtlClass } from '../../../../assets/utils/utils';

// import './profile-calendar-container.styles.scss';
// const useStyles = makeStyles(() => ({
//   paperFullWidth: {
//     width: '100%',
//   },
//   paper: {
//     margin: 0,
//     borderRadius: '16px',
//   },
// }));
// const ProfileCalendar = ({
//   slots,
//   getSlotsStartProp,
//   createSlotsStartProp,
//   deleteSlotsStartProp,
//   showEditMode,
//   editModeFlag,
//   toggleEditMode,
//   updateSlots,
//   getProfileInfo,
//   currentUser,
//   instructorId,
//   // error,
//   createSlotsStatus,
//   deleteSlotsStatus,
// }) => {
//   const classes = useStyles();
//   const history = useHistory();
//   const { id } = useParams();
//   const { t, i18n } = useTranslation();
//   const calendarRef = React.createRef();
//   const [currentEvents, setCurrentEvents] = useState([]);
//   const [addedEvents, setAddedEvents] = useState([]);
//   const [deletedEvents, setDeletedEvents] = useState([]);
//   const [userSlots, setUserSlots] = useState([]);
//   const [openProfileModal, setOpenProfileModal] = useState(false);
//   const today = new Date();
//   const validDate = addDays(new Date(), 1);
//   useEffect(() => {
//     getSlotsStartProp({
//       userId: id,
//       from: today.toISOString(),
//       to: addDays(today, 7).toISOString(),
//     });
//   }, [getSlotsStartProp]);

//   useEffect(() => {
//     setCurrentEvents(slots);
//     setUserSlots(slots);
//   }, [slots]);

//   useEffect(() => {
//     getProfileInfo({ slots: userSlots });
//   }, [userSlots]);

//   useEffect(() => {
//     handleSaveChanges();
//   }, [updateSlots]);

//   useEffect(() => {
//     if (
//       calendarRef.current &&
//       (createSlotsStatus.success || deleteSlotsStatus.success)
//     ) {
//       const calendarApi = calendarRef.current.getApi();
//       const { currentRange } = calendarApi.getCurrentData().dateProfile;
//       getSlotsStartProp({
//         userId: id,
//         from: currentRange.start.toISOString(),
//         to: currentRange.end.toISOString(),
//       });
//     }
//   }, [createSlotsStatus, deleteSlotsStatus]);

//   const handleSaveChanges = () => {
//     if (calendarRef.current) {
//       const calendarApi = calendarRef.current.getApi();
//       if (addedEvents && addedEvents.length > 0) {
//         calendarApi.removeAllEvents();
//         createSlotsStartProp({ userId: id, slots: addedEvents });
//         setAddedEvents([]);
//       }
//       if (deletedEvents && deletedEvents.length > 0) {
//         const ids = [];
//         deletedEvents.forEach((event) => {
//           if (event.id) ids.push(event.id);
//         });
//         deleteSlotsStartProp({ userId: id, ids });
//         setDeletedEvents([]);
//       }
//     }
//   };

//   const handleDateSelect = (selectInfo) => {
//     if (!showEditMode) return;
//     const title = 'event';
//     const calApi = selectInfo.view.calendar;

//     calApi.unselect(); // clear date selection

//     if (title) {
//       calApi.addEvent({
//         start: selectInfo.startStr,
//         end: selectInfo.endStr,
//       });
//     }
//   };

//   const handleEventClick = ({ event }) => {
//     if (event.extendedProps.status === 'reserved') return;
//     if (!currentUser || (!!currentUser && !currentUser.id)) {
//       history.push('/login');
//     } else if (!!currentUser && Number(currentUser.id) !== Number(id)) {
//       triggerOpenProfileModal();
//     }
//     if (!showEditMode) return;
//     // event.setExtendedProp('status', 'booked')
//     // event.setProp('color', '#9CA5AF')
//     // event.setProp('title', 'Booked')
//     // console.log('>>>>>>', event.extendedProps.status)
//     setAddedEvents((prev) =>
//       prev.filter(
//         (ele) => ele.from !== event.startStr && ele.to !== event.endStr,
//       ),
//     );
//     setUserSlots((prev) =>
//       prev.filter((ele) =>
//         event.id
//           ? String(ele.id) !== String(event.id)
//           : ele.from !== event.startStr && ele.to !== event.endStr,
//       ),
//     );
//     if (event.id) {
//       setDeletedEvents((prev) => [
//         ...prev,
//         { id: event.id, from: event.startStr, to: event.endStr },
//       ]);
//     }
//     event.remove();
//   };

//   const handleEventAdd = ({ event }) => {
//     if (!showEditMode) return;
//     const eventObj = {};
//     if (event) {
//       eventObj.from = event.startStr ? event.startStr : undefined;
//       eventObj.to = event.endStr ? event.endStr : undefined;
//     }
//     deletedEvents.forEach((delEvent) => {
//       if (
//         delEvent.id &&
//         delEvent.from === event.startStr &&
//         delEvent.to === event.endStr
//       ) {
//         event.setProp('id', delEvent.id);
//       }
//     });
//     // events.map((event) => {
//     //   const eventObj = {}
//     //   if (event) {
//     //     //   eventObj.id = event.id ? event.id : undefined
//     //     //   eventObj.title = event.title ? event.title : undefined
//     //     eventObj.from = event.startStr ? event.startStr : undefined
//     //     eventObj.to = event.endStr ? event.endStr : undefined
//     //     // eventObj.color = event.backgroundColor
//     //     //   ? event.backgroundColor
//     //     //   : undefined
//     //     // eventObj.status =
//     //     //   event.extendedProps && event.extendedProps.status
//     //     //     ? event.extendedProps.status
//     //     //     : undefined
//     //   }
//     //   return eventObj
//     // })
//     setDeletedEvents((prev) =>
//       prev.filter(
//         (ele) => ele.from !== event.startStr && ele.to !== event.endStr,
//       ),
//     );
//     const addedEvent = slots.find((eve) => Number(eve.id) === Number(event.id));
//     if (!addedEvent) {
//       setAddedEvents((prev) => [...prev, eventObj]);
//     }
//     setUserSlots((prev) => [...prev, eventObj]);
//   };

//   const handleDateChange = (type) => {
//     const calendarApi = calendarRef.current.getApi();
//     if (type === 'next') {
//       calendarApi.next();
//     } else if (type === 'prev') {
//       calendarApi.prev();
//     }
//     const { currentRange } = calendarApi.getCurrentData().dateProfile;
//     getSlotsStartProp({
//       userId: id,
//       from: currentRange.start.toISOString(),
//       to: currentRange.end.toISOString(),
//     });
//   };

//   const handleEventsSet = (events) => {
//     if (!showEditMode) return;
//     if (!deletedEvents || (deletedEvents && deletedEvents.length < 1)) return;
//     events.forEach((event) => {
//       const deletedEvent = deletedEvents.find((x) => x === event.id);
//       if (deletedEvent) event.remove();
//     });
//   };

//   const calculateTimeZone = () => {
//     const timeZoneArr = new Date().toTimeString().substring(9, 17).split('+');
//     return `${timeZoneArr[0]} +${`${timeZoneArr[1].slice(
//       0,
//       2,
//     )}:${timeZoneArr[1].slice(2)}`}`;
//   };

//   const handleCloseProfileModal = () => {
//     setOpenProfileModal(false);
//   };

//   const triggerOpenProfileModal = () => {
//     setOpenProfileModal(true);
//   };

//   return (
//     <div className="profile-calendar">
//       <div className="profile-calendar__container">
//         <div className="calendar">
//           <div className={`calendar__legend ${rtlClass()}`}>
//             <div className={`calendar__legend--available ${rtlClass()}`}>
//               <div className={`color ${rtlClass()}`}></div>
//               <div className="title">
//                 {t('CALENDAR.MYSESSION.LEGEND.AVAILABLE')}
//               </div>
//             </div>

//             <div className={`calendar__legend--not__available ${rtlClass()}`}>
//               <div className={`color ${rtlClass()}`}></div>
//               <div className="title">
//                 {t('CALENDAR.MYSESSION.LEGEND.NOT_AVAILABLE')}
//               </div>
//             </div>

//             <div className={`calendar__legend--booked ${rtlClass()}`}>
//               <div className={`color ${rtlClass()}`}></div>
//               <div className="title">
//                 {t('CALENDAR.MYSESSION.LEGEND.RESERVED')}
//               </div>
//             </div>

//             <div className={`calendar__legend--busy ${rtlClass()}`}>
//               <div className={`color ${rtlClass()}`}></div>
//               <div className="title">{t('CALENDAR.MYSESSION.LEGEND.BUSY')}</div>
//             </div>
//           </div>
//           <div className="calendar__timezone">
//             <p>{t('CALENDAR.MYSESSION.HEADER.TIMEZONE1')}</p>
//             <p>
//               {t('CALENDAR.MYSESSION.HEADER.TIMEZONE2')}{' '}
//               <span className="u-color-primary">({calculateTimeZone()})</span>
//             </p>
//           </div>
//         </div>

//         <FullCalendar
//           ref={calendarRef}
//           plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
//           customButtons={{
//             next: {
//               text: 'next',
//               click: () => handleDateChange('next'),
//             },
//             prev: {
//               text: 'prev',
//               click: () => handleDateChange('prev'),
//             },
//           }}
//           headerToolbar={{
//             left: 'prev,next today',
//             center: 'title',
//             right: 'timeGridWeek,timeGridDay,dayGridMonth',
//           }}
//           firstDay={getDay(new Date())}
//           initialView="timeGridWeek"
//           eventColor="#357cd6"
//           allDaySlot={false}
//           slotLabelInterval="00:30"
//           slotLabelFormat={{
//             hour: '2-digit',
//             minute: '2-digit',
//             omitZeroMinute: false,
//             meridiem: 'long',
//           }}
//           dayHeaderFormat={{
//             weekday: 'short',
//             month: 'short',
//             day: 'numeric',
//             omitCommas: true,
//           }}
//           buttonText={{
//             today: t('CALENDAR.BUTTONS.TODAY'),
//             month: t('CALENDAR.BUTTONS.MONTH'),
//             week: t('CALENDAR.BUTTONS.WEEK'),
//             day: t('CALENDAR.BUTTONS.DAY'),
//           }}
//           direction={i18n.dir()}
//           validRange={{ start: validDate }}
//           // businessHours={[
//           //   {
//           //     startTime: '08:00',
//           //     daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
//           //   },
//           // ]}
//           selectable={!!showEditMode}
//           selectMirror={!!showEditMode}
//           events={currentEvents} // alternatively, use the `events` setting to fetch from a feed
//           select={handleDateSelect}
//           eventContent={renderEventContent} // custom render function
//           eventClick={handleEventClick}
//           eventAdd={handleEventAdd}
//           eventsSet={handleEventsSet} // called after events are initialized/added/changed/removed
//           /* you can update a remote database when these fire:
//             eventRemove={handleEventRemove}
//             eventChange={function(){}}
//           */
//           locale={i18n.language === 'ar' ? arLocale : undefined}
//         />
//         {showEditMode && (
//           <div className={`calendar__hover ${editModeFlag ? 'hide' : ''}`}>
//             <Button
//               color="primary"
//               variant="contained"
//               onClick={toggleEditMode}
//               className="calendar__hover--btn"
//             >
//               {t('CALENDAR.PROFILE.EDITPROFILE.EDITPROFILELABEL')}
//             </Button>
//           </div>
//         )}
//       </div>
//       {openProfileModal && (
//         <Dialog
//           maxWidth="sm"
//           fullWidth
//           onClose={handleCloseProfileModal}
//           aria-labelledby="Profile-dialog"
//           open={openProfileModal}
//           classes={classes}
//         >
//           <ProfileModal instructorId={instructorId} />
//         </Dialog>
//       )}
//     </div>
//   );
// };

// ProfileCalendar.propTypes = {
//   slots: PropTypes.array,
//   getSlotsStartProp: PropTypes.func.isRequired,
//   createSlotsStartProp: PropTypes.func.isRequired,
//   deleteSlotsStartProp: PropTypes.func.isRequired,
//   showEditMode: PropTypes.bool,
//   editModeFlag: PropTypes.bool,
//   toggleEditMode: PropTypes.func,
//   updateSlots: PropTypes.number,
//   getProfileInfo: PropTypes.func,
//   currentUser: PropTypes.object,
//   instructorId: PropTypes.string.isRequired,
//   // error: PropTypes.string,
//   createSlotsStatus: PropTypes.object,
//   deleteSlotsStatus: PropTypes.object,
// };

// const mapStateToProps = createStructuredSelector({
//   slots: selectTimeSlots,
//   currentUser: selectCurrentUser,
//   error: selectError,
//   createSlotsStatus: selectCreateSlotsStatus,
//   deleteSlotsStatus: selectDeleteSlotsStatus,
// });

// const mapDispatchToProps = (dispatch) => ({
//   getSlotsStartProp: (params) => dispatch(getSlotsStart(params)),
//   createSlotsStartProp: (params) => dispatch(createSlotsStart(params)),
//   deleteSlotsStartProp: (params) => dispatch(deleteSlotsStart(params)),
// });

// export default connect(mapStateToProps, mapDispatchToProps)(ProfileCalendar);

// const renderEventContent = (eventInfo) => (
//   <div>
//     <i>{eventInfo.event.title}</i>
//   </div>
// );

const ProfileCalendar = () => {
  return <div>ProfileCalendar</div>;
};

export default ProfileCalendar;
