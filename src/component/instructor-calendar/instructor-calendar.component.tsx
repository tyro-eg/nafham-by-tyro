import React, { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import arLocale from '@fullcalendar/core/locales/ar-kw';
import { useTranslation } from 'react-i18next';

import { selectCurrentUser } from '../../redux/user/user.selectors';
import './instructor-calendar.component.scss';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { addDays, getDay } from 'date-fns';
import { EventContentArg } from '@fullcalendar/core';
import {
  // selectSlotsError,
  selectTimeSlots,
} from '../../redux/calendar/calendar.selectors';
import { getSlots } from '../../redux/calendar/calendar.actions';

const InstructorCalendar: React.FC<{ instructorId: number }> = ({
  instructorId,
}) => {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const slots = useAppSelector(selectTimeSlots);
  const currentUser = useAppSelector(selectCurrentUser);
  // const error = useAppSelector(selectSlotsError);

  const [currentEvents, setCurrentEvents] = useState(slots || []);
  const calendarRef = useRef<FullCalendar>(null);
  const today = new Date();

  useEffect(() => {
    if (instructorId) {
      dispatch(
        getSlots({
          userId: instructorId,
          params: {
            start_time: today.toISOString(),
            end_time: addDays(today, 7).toISOString(),
          },
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instructorId]);

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

  const renderEventContent = (eventInfo: EventContentArg) => (
    <div>
      <i>{eventInfo.event.title}</i>
    </div>
  );

  return (
    <div className="instructor-calendar">
      <div className="instructor-calendar__container">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          customButtons={{
            next: {
              text: 'next',
              click: () => handleDateChange('next'),
            },
            prev: {
              text: 'prev',
              click: () => handleDateChange('prev'),
            },
          }}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridWeek,timeGridDay',
          }}
          firstDay={getDay(new Date())}
          initialView="timeGridDay"
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
            month: 'numeric',
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
          selectMirror
          events={currentEvents}
          eventContent={renderEventContent}
          locale={i18n.language === 'ar' ? arLocale : undefined}
        />
      </div>
    </div>
  );
};

export default InstructorCalendar;
