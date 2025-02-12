import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import arLocale from '@fullcalendar/core/locales/ar-kw';
import { getDay, addDays } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { parseTimeSlotsIntoCalendarEvents } from '../../../assets/utils/event.utils';
import { rtlClass } from '../../../assets/utils/utils';
import { Instructor } from '../../../assets/types';
import { getSlots } from '../../../redux/calendar/calendar.actions';
import { useAppDispatch } from '../../../redux/store';

interface StepperCalendarProps {
  instructor: Instructor;
  onSelectSlot: (event: any | null) => void;
  showAlreadyBooked: () => void;
  hideAlreadyBooked: () => void;
}

const StepperCalendar: React.FC<StepperCalendarProps> = ({
  instructor,
  onSelectSlot,
  showAlreadyBooked,
  hideAlreadyBooked,
}) => {
  const [currentEvents, setCurrentEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const { t, i18n } = useTranslation();
  const calendarRef = useRef<FullCalendar>(null);
  const validDate = addDays(new Date(), 1);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (instructor?.time_slots?.length) {
      setCurrentEvents(parseTimeSlotsIntoCalendarEvents(instructor.time_slots));
    }
  }, [instructor]);

  const calculateTimeZone = () => {
    const timeZoneArr = new Date().toTimeString().substring(9, 17).split('+');
    return `${timeZoneArr[0]} +${`${timeZoneArr[1].slice(0, 2)}:${timeZoneArr[1].slice(2)}`}`;
  };

  const handleEventClick = ({ event }: { event: any }) => {
    if (event.extendedProps.status === 'reserved') {
      showAlreadyBooked();
      return;
    }
    hideAlreadyBooked();
    if (selectedEvent?.id === event.id) {
      event.setProp('title', '');
      setSelectedEvent(null);
      onSelectSlot(null);
    } else {
      selectedEvent?.setProp('title', '');
      event.setProp('title', 'Booked');
      setSelectedEvent(event);
      onSelectSlot(event);
    }
  };

  const handleDateChange = () => {
    const calendarApi = calendarRef.current?.getApi();
    const view = calendarApi?.view;
    if (calendarApi) {
      const { start, end } =
        view?.activeStart && view?.activeEnd
          ? { start: view.activeStart, end: view.activeEnd }
          : { start: new Date(), end: addDays(new Date(), 7) };

      if (instructor.id) {
        dispatch(
          getSlots({
            userId: instructor.id,
            params: {
              from: start.toISOString(),
              to: end.toISOString(),
            },
          }),
        );
      }
    }
  };

  const renderEventContent = (eventInfo: any) => (
    <div>
      <i>{eventInfo.event.title}</i>
    </div>
  );

  return (
    <div className="calendar-container">
      <div className="calendar-container-main">
        <div className="calendar">
          <div className={`calendar__legend ${rtlClass()}`}>
            {['AVAILABLE', 'NOT_AVAILABLE', 'RESERVED', 'BUSY'].map((key) => (
              <div
                key={key}
                className={`calendar__legend--${key.toLowerCase()} ${rtlClass()}`}
              >
                <div className={`color ${rtlClass()}`} />
                <div className="title">
                  {t(`CALENDAR.MYSESSION.LEGEND.${key}`)}
                </div>
              </div>
            ))}
          </div>

          <div className="calendar__timezone">
            <p>{t('CALENDAR.MYSESSION.HEADER.TIMEZONE1')}</p>
            <p>
              {t('CALENDAR.MYSESSION.HEADER.TIMEZONE2')}{' '}
              <span className="u-color-primary">({calculateTimeZone()})</span>
            </p>
          </div>
        </div>

        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          customButtons={{
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
            right: 'week,day',
          }}
          firstDay={getDay(new Date())}
          initialView="timeGridWeek"
          eventColor="#3ac5f1"
          allDaySlot={false}
          slotLabelInterval="00:30"
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: true,
          }}
          dayHeaderFormat={{ weekday: 'short', month: 'short', day: 'numeric' }}
          buttonText={{
            today: t('CALENDAR.BUTTONS.TODAY'),
            month: t('CALENDAR.BUTTONS.MONTH'),
            week: t('CALENDAR.BUTTONS.WEEK'),
            day: t('CALENDAR.BUTTONS.DAY'),
          }}
          direction={i18n.dir()}
          validRange={{ start: validDate }}
          selectMirror
          events={currentEvents}
          eventContent={renderEventContent}
          eventClick={handleEventClick}
          locale={i18n.language === 'ar' ? arLocale : undefined}
        />
      </div>
    </div>
  );
};

export default StepperCalendar;
