import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import arLocale from '@fullcalendar/core/locales/ar-kw';
import { getDay, addDays } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { rtlClass } from '../../../assets/utils/utils';
import { Instructor } from '../../../assets/types';
import { getSlots } from '../../../redux/calendar/calendar.actions';
import { useAppDispatch, useAppSelector } from '../../../redux/store';

import './stepper-calendar.styles.scss';
import { selectTimeSlots } from '../../../redux/calendar/calendar.selectors';

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
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const validDate = addDays(today, 1);
  const dispatch = useAppDispatch();

  const slots = useAppSelector(selectTimeSlots);

  useEffect(() => {
    dispatch(
      getSlots({
        userId: +instructor.id,
        params: {
          from: today.toISOString(),
          to: addDays(today, 7).toISOString(),
        },
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instructor]);

  useEffect(() => {
    setCurrentEvents(slots || []);
  }, [slots]);

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
      if (instructor?.id) {
        dispatch(
          getSlots({
            userId: +instructor.id,
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
    <div className="stepper-calendar">
      <div className="stepper-calendar__container">
        <div className="calendar">
          <div className={`calendar__legend ${rtlClass()}`}>
            <div className={`calendar__legend--available ${rtlClass()}`}>
              <div className={`color ${rtlClass()}`}></div>
              <div className="title">
                {t('CALENDAR.MYSESSION.LEGEND.AVAILABLE')}
              </div>
            </div>

            <div className={`calendar__legend--not__available ${rtlClass()}`}>
              <div className={`color ${rtlClass()}`}></div>
              <div className="title">
                {t('CALENDAR.MYSESSION.LEGEND.NOT_AVAILABLE')}
              </div>
            </div>

            <div className={`calendar__legend--booked ${rtlClass()}`}>
              <div className={`color ${rtlClass()}`}></div>
              <div className="title">
                {t('CALENDAR.MYSESSION.LEGEND.RESERVED')}
              </div>
            </div>

            <div className={`calendar__legend--busy ${rtlClass()}`}>
              <div className={`color ${rtlClass()}`}></div>
              <div className="title">{t('CALENDAR.MYSESSION.LEGEND.BUSY')}</div>
            </div>
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
            next: { text: 'next', click: () => handleDateChange('next') },
            prev: { text: 'prev', click: () => handleDateChange('prev') },
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
            month: {
              text: i18n.language === 'ar' ? 'شهر' : 'month',
              click: () => {
                calendarRef.current?.getApi().changeView('dayGridMonth');
                handleDateChange();
              },
            },
          }}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'day,week,month',
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
