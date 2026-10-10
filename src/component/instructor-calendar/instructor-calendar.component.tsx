import React, { useEffect, useMemo, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import arLocale from '../../assets/utils/calendar-locale';
import { useTranslation } from 'react-i18next';

import './instructor-calendar.component.scss';
import { addDays, getDay } from 'date-fns';
import { EventContentArg, EventInput } from '@fullcalendar/core';
import { useSlots } from '../../hooks/useCalendar';

// Stable fallback so effects depending on `slots` don't re-run every render
const NO_SLOTS: EventInput[] = [];

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
  const { data: slots = NO_SLOTS } = useSlots(
    instructorId,
    dateRange.from,
    dateRange.to,
    !!instructorId,
  );

  // The mini calendar only shows ~2 hours, so bring the earliest upcoming
  // slot of the fetched range into view (presentational only). Falls back
  // to the current hour when there is no upcoming slot.
  const scrollTime = useMemo(() => {
    const now = Date.now();
    const rangeEnd = new Date(dateRange.to).getTime();
    const starts = slots
      .map((slot) => (slot.start ? new Date(slot.start as string) : null))
      .filter(
        (d): d is Date =>
          !!d &&
          !Number.isNaN(d.getTime()) &&
          d.getTime() >= now &&
          d.getTime() < rangeEnd,
      )
      .sort((a, b) => a.getTime() - b.getTime());
    const target = starts[0] || new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(target.getHours())}:${pad(target.getMinutes())}:00`;
  }, [slots, dateRange.to]);

  // Apply it once the slots arrive, and again after a language switch
  // (locale/direction changes re-render the calendar and reset its scroll).
  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (!api) return;
    const timer = window.setTimeout(() => api.scrollToTime(scrollTime), 50);
    return () => window.clearTimeout(timer);
  }, [scrollTime, i18n.language]);

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
          scrollTime={scrollTime}
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
