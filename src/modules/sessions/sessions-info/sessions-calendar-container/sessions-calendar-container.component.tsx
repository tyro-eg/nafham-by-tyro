import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import arLocale from '@fullcalendar/core/locales/ar-kw';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import { selectTimeSlots } from '../../../../redux/calendar/calendar.selectors';
import { selectCurrentUser } from '../../../../redux/user/user.selectors';
import SESSIONS from '../sessions-list/sessions-data';
import './sessions-calendar-container.styles.scss';
import { useAppDispatch, useAppSelector } from '../../../../redux/store';
import { getSlots } from '../../../../redux/calendar/calendar.actions';
import { addDays, getDay } from 'date-fns';
import SessionViewCalendarModal from '../../../../modals/session-view-calendar-modal/session-view-calendar-modal.component';

interface SessionsCalendarContainerProps {}

const SessionsCalendarContainer: React.FC<
  SessionsCalendarContainerProps
> = () => {
  const [currentEvents, setCurrentEvents] = useState<any[]>([]);
  const [openViewCalendarModal, setOpenViewCalendarModal] = useState(false);
  const { t, i18n } = useTranslation();
  const today = new Date();
  const calendarRef = useRef<FullCalendar>(null);

  const dispatch = useAppDispatch();
  const slots = useAppSelector(selectTimeSlots);
  const currentUser = useAppSelector(selectCurrentUser);

  useEffect(() => {
    dispatch(
      getSlots({
        userId: currentUser.id,
        params: {
          from: today.toISOString(),
          to: addDays(today, 30).toISOString(),
        },
      }),
    );
  }, [dispatch, currentUser.id]);

  useEffect(() => {
    setCurrentEvents(slots!);
  }, [slots]);

  const handleDateChange = (direction: 'next' | 'prev') => {
    const calendarApi = calendarRef.current?.getApi();
    const view = calendarApi?.view;
    if (calendarApi) {
      direction === 'next' ? calendarApi.next() : calendarApi.prev();

      const { start, end } =
        view?.activeStart && view?.activeEnd
          ? { start: view.activeStart, end: view.activeEnd }
          : { start: new Date(), end: addDays(new Date(), 7) };
      if (currentUser?.id) {
        dispatch(
          getSlots({
            userId: currentUser.id,
            params: {
              from: start.toISOString(),
              to: end.toISOString(),
            },
          }),
        );
      }
    }
  };

  const handleCloseViewCalendarModal = () => {
    setOpenViewCalendarModal(false);
  };

  return (
    <div className="session-calendar">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        customButtons={{
          next: { text: 'next', click: () => handleDateChange('next') },
          prev: { text: 'prev', click: () => handleDateChange('prev') },
        }}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        firstDay={getDay(new Date())}
        initialView="dayGridMonth"
        eventColor="#357cd6"
        allDaySlot={false}
        slotLabelInterval="00:30"
        slotLabelFormat={{
          hour: '2-digit',
          minute: '2-digit',
          omitZeroMinute: false,
          meridiem: true,
        }}
        dayHeaderFormat={{
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          omitCommas: true,
        }}
        buttonText={{
          today: t('CALENDAR.BUTTONS.TODAY'),
          month: t('CALENDAR.BUTTONS.MONTH'),
          week: t('CALENDAR.BUTTONS.WEEK'),
          day: t('CALENDAR.BUTTONS.DAY'),
        }}
        direction={i18n.dir()}
        validRange={{ start: new Date() }}
        events={currentEvents}
        eventContent={renderEventContent}
        locale={i18n.language === 'ar' ? arLocale : undefined}
      />
      {openViewCalendarModal && (
        <Dialog
          maxWidth="md"
          fullWidth
          onClose={handleCloseViewCalendarModal}
          aria-labelledby="view-calendar-dialog"
          open={openViewCalendarModal}
          sx={{ '& .MuiDialog-paper': { width: '100%', margin: 0 } }}
        >
          <SessionViewCalendarModal
            sessions={SESSIONS}
            handleClose={handleCloseViewCalendarModal}
          />
        </Dialog>
      )}
    </div>
  );
};

const renderEventContent = (eventInfo: any) => (
  <div>
    <i>{eventInfo.event.title}</i>
  </div>
);

export default SessionsCalendarContainer;
