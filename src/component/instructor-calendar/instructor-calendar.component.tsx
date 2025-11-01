import React, { useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import arLocale from '@fullcalendar/core/locales/ar-kw';
import { useTranslation } from 'react-i18next';

import './instructor-calendar.component.scss';
import { addDays, getDay } from 'date-fns';
import { EventContentArg } from '@fullcalendar/core';
import { useSlots } from '../../hooks/useCalendar';

const InstructorCalendar: React.FC<{ instructorId: number }> = ({
  instructorId,
}) => {
  const { t, i18n } = useTranslation();
  const calendarRef = useRef<FullCalendar>(null);
  const today = new Date(new Date().setHours(0, 0, 0, 0));

  const [dateRange, setDateRange] = useState(() => ({
    from: today.toISOString(),
    to: addDays(today, 1).toISOString(),
  }));

  // Fetch slots using TanStack Query
  const { data: slots = [] } = useSlots(
    instructorId,
    dateRange.from,
    dateRange.to,
    !!instructorId,
  );

  const handleDateChange = (direction?: 'next' | 'prev') => {
    const calendarApi = calendarRef.current?.getApi();
    const view = calendarApi?.view;
    if (calendarApi) {
      if (direction) {
        direction === 'next' ? calendarApi.next() : calendarApi.prev();
      }

      const { start, end } =
        view?.activeStart && view?.activeEnd
          ? { start: view.activeStart, end: view.activeEnd }
          : { start: new Date(), end: addDays(new Date(), 7) };

      if (instructorId) {
        setDateRange({
          from: start.toISOString(),
          to: end.toISOString(),
        });
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
            today: {
              text: i18n.language === 'ar' ? 'اليوم' : 'today',
              click: () => {
                calendarRef.current?.getApi().today();
                handleDateChange();
              },
            },
            day: {
              text: i18n.language === 'ar' ? 'يوم' : 'day',
              click: () => {
                calendarRef.current?.getApi().changeView('timeGridDay');
                handleDateChange();
              },
            },
            week: {
              text: i18n.language === 'ar' ? 'أسبوع' : 'week',
              click: () => {
                calendarRef.current?.getApi().changeView('timeGridWeek');
                handleDateChange();
              },
            },
          }}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'day,week',
          }}
          firstDay={getDay(new Date())}
          initialView="timeGridDay"
          eventColor="#3ac5f1"
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
          events={slots}
          eventContent={renderEventContent}
          locale={i18n.language === 'ar' ? arLocale : undefined}
        />
      </div>
    </div>
  );
};

export default InstructorCalendar;
