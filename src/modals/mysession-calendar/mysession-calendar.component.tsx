import { FC, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import arLocale from '@fullcalendar/core/locales/ar-kw';
import { addDays, getDay } from 'date-fns';
import { useTranslation } from 'react-i18next';
import WarningIcon from '@mui/icons-material/Warning';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import './mysession-calendar.styles.scss';
import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import { parseTimeSlotsIntoCalendarEvents } from '../../assets/utils/event.utils';
import { useRtlClass } from '../../assets/utils/utils';
import { EventClickArg } from '@fullcalendar/core';
import { useInstructors } from '../../hooks/useInstructors';
import { useBookPrivateSession } from '../../hooks/useSessions';
import {
  DEFAULT_SUBJECT_ID,
  DEFAULT_PACKAGE_ID,
} from '../../constants/defaults';

interface MySessionCalendarProps {
  rescheduleFlag?: boolean;
  handleClose: () => void;
  unscheduledHours: number;
}

const MySessionCalendar: FC<MySessionCalendarProps> = ({
  rescheduleFlag = false,
  unscheduledHours,
  handleClose,
}) => {
  const bookPrivateSessionMutation = useBookPrivateSession();
  const [currentEvents, setCurrentEvents] = useState<any[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<any[]>([]);
  const [warningSlot, setWarningSlot] = useState(false);
  const { t, i18n } = useTranslation();
  const rtlClass = useRtlClass();
  const calendarRef = useRef<FullCalendar | null>(null);
  const validDate = addDays(new Date(), 1);
  const { data: instructorsData } = useInstructors(1, 1);
  const instructors = instructorsData?.data || [];
  const currentUser = useAppSelector(selectCurrentUser);

  useEffect(() => {
    if (
      instructors &&
      instructors.length > 0 &&
      instructors[0].time_slots &&
      instructors[0].time_slots.length > 0
    ) {
      // Ensure we pass an array
      const timeSlots = Array.isArray(instructors[0].time_slots)
        ? instructors[0].time_slots
        : [];
      setCurrentEvents(parseTimeSlotsIntoCalendarEvents(timeSlots));
    }
  }, [instructors]);

  const calculateTimeZone = useMemo(() => {
    const timeZoneArr = new Date().toTimeString().substring(9, 17).split('+');
    return `${timeZoneArr[0]} +${`${timeZoneArr[1].slice(0, 2)}:${timeZoneArr[1].slice(2)}`}`;
  }, []);

  const handleEventClick = useCallback((event: EventClickArg) => {
    if (event.event.extendedProps.status === 'reserved') {
      setWarningSlot(true);
      setTimeout(() => setWarningSlot(false), 5000);
      return;
    }
    setWarningSlot(false);
    setSelectedEvents((prevEvents) => {
      const isSelected = prevEvents.some((e) => e.id === event.event.id);
      if (isSelected) {
        event.event.setProp('title', '');
        return prevEvents.filter((e) => e.id !== event.event.id);
      }
      event.event.setProp('title', 'Booked');
      return [...prevEvents, event.event];
    });
  }, []);

  const renderEventContent = useCallback(
    (eventInfo: any) => (
      <Box>
        <Typography variant="caption">{eventInfo.event.title}</Typography>
      </Box>
    ),
    [],
  );

  const groupBy = (arr: any[], property: string) =>
    arr.reduce((acc, cur) => {
      acc[cur[property]] = [...(acc[cur[property]] || []), cur];
      return acc;
    }, {});

  const separateEvents = () => {
    if (selectedEvents.length === 0) return [];

    const eventsClone = [...selectedEvents];
    eventsClone.sort((a, b) => (a.startStr < b.startStr ? -1 : 1));
    eventsClone[0].level = 0;
    let level = 0;
    for (let i = 1; i < eventsClone.length; i += 1) {
      if (
        eventsClone[i] &&
        eventsClone[i].startStr &&
        eventsClone[i - 1] &&
        eventsClone[i - 1].endStr
      ) {
        if (eventsClone[i].startStr === eventsClone[i - 1].endStr) {
          eventsClone[i].level = level;
        } else {
          level += 1;
          eventsClone[i].level = level;
        }
      }
    }
    let groupedEvents = groupBy(eventsClone, 'level');
    groupedEvents = Object.keys(groupedEvents).map((key) => groupedEvents[key]);
    return groupedEvents;
  };

  const scheduleNow = () => {
    if (!instructors[0] || !currentUser) return;

    const eventsChunks = separateEvents();
    eventsChunks.forEach((chunk: any) => {
      const slotsIds: number[] = [];
      chunk.forEach((event: any) => {
        if (event.id) {
          slotsIds.push(+event.id);
        }
      });
      const privateObj = {
        start_time: chunk[0].startStr,
        end_date: chunk[chunk.length - 1].endStr,
        tutor_id: +instructors[0].id,
        student_id: +currentUser.id,
        grade_subject_id: DEFAULT_SUBJECT_ID,
        package_id: DEFAULT_PACKAGE_ID,
        time_slots: slotsIds,
      };
      bookPrivateSessionMutation.mutate(privateObj, {
        onSuccess: () => {
          handleClose();
        },
      });
    });
  };

  const rescheduleNow = () => {
    // Implementation logic for rescheduling
  };

  return (
    <div className="mySession-calendar">
      <h1 className="calendar__header">
        {!rescheduleFlag
          ? t('CALENDAR.MYSESSION.HEADER.SCHEDULE')
          : t('CALENDAR.MYSESSION.HEADER.RESCHEDULE')}
      </h1>

      {warningSlot && (
        <div className="calendar__warning">
          <div className="calendar__warning--title">
            <div className="mark">
              <WarningIcon />
            </div>
            <div className="title">
              <h4>{t('CALENDAR.WIZARD.MESSAGES.WARNING.TITLE')}!</h4>
            </div>
          </div>
          <div className="calendar__warning--body">
            <p>{t('CALENDAR.WIZARD.MESSAGES.WARNING.BODY1')}</p>
          </div>
        </div>
      )}

      <div className={`calendar__unscheduled-hours ${rtlClass}`}>
        <p>
          {t('CALENDAR.MYSESSION.MESSAGES.UNSCHEDULEDHOURS1')}{' '}
          <span
            className={`u-color-primary ${
              unscheduledHours === 0 ? 'u-color-danger' : ''
            }`}
          >
            {unscheduledHours}
          </span>{' '}
          {t('CALENDAR.MYSESSION.MESSAGES.UNSCHEDULEDHOURS2')}
        </p>
      </div>

      <div className="calendar-container">
        <div className="calendar-container-main">
          <div className="calendar">
            <div className={`calendar__legend ${rtlClass}`}>
              <div className={`calendar__legend--available ${rtlClass}`}>
                <div className={`color ${rtlClass}`}></div>
                <div className="title">
                  {t('CALENDAR.MYSESSION.LEGEND.AVAILABLE')}
                </div>
              </div>
              <div className={`calendar__legend--not__available ${rtlClass}`}>
                <div className={`color ${rtlClass}`}></div>
                <div className="title">
                  {t('CALENDAR.MYSESSION.LEGEND.NOT_AVAILABLE')}
                </div>
              </div>
              <div className={`calendar__legend--booked ${rtlClass}`}>
                <div className={`color ${rtlClass}`}></div>
                <div className="title">
                  {t('CALENDAR.MYSESSION.LEGEND.RESERVED')}
                </div>
              </div>
              <div className={`calendar__legend--busy ${rtlClass}`}>
                <div className={`color ${rtlClass}`}></div>
                <div className="title">
                  {t('CALENDAR.MYSESSION.LEGEND.BUSY')}
                </div>
              </div>
            </div>
            <div className="calendar__timezone">
              <p>{t('CALENDAR.MYSESSION.HEADER.TIMEZONE1')}</p>
              <p>
                {t('CALENDAR.MYSESSION.HEADER.TIMEZONE2')}{' '}
                <span className="u-color-primary">({calculateTimeZone})</span>
              </p>
            </div>
          </div>

          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'timeGridWeek,timeGridDay',
            }}
            firstDay={getDay(new Date())}
            initialView="timeGridWeek"
            eventColor="#3ac5f1"
            allDaySlot={false}
            slotLabelInterval="00:30"
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: 'narrow',
            }}
            dayHeaderFormat={{
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            }}
            buttonText={{
              today: t('CALENDAR.BUTTONS.TODAY'),
              month: t('CALENDAR.BUTTONS.MONTH'),
              week: t('CALENDAR.BUTTONS.WEEK'),
              day: t('CALENDAR.BUTTONS.DAY'),
            }}
            direction={i18n.dir()}
            validRange={{ start: validDate }}
            events={currentEvents}
            eventContent={renderEventContent}
            eventClick={handleEventClick}
            locale={i18n.language === 'ar' ? arLocale : undefined}
          />
        </div>
      </div>

      <div className="mySession-calendar__actions-container">
        <Button
          className="mySession-calendar__actions-container-action"
          variant="contained"
          color="error"
          onClick={handleClose}
        >
          {t('CALENDAR.MYSESSION.ACTIONS.CLOSE')}
        </Button>
        {!rescheduleFlag && (
          <Button
            disabled={selectedEvents.length < 1}
            className="mySession-calendar__actions-container-action"
            variant="contained"
            color="primary"
            onClick={scheduleNow}
          >
            {t('CALENDAR.MYSESSION.ACTIONS.SCHEDULE')}
          </Button>
        )}
        {rescheduleFlag && (
          <Button
            disabled={selectedEvents.length < 1}
            className="mySession-calendar__actions-container-action"
            variant="contained"
            color="primary"
            onClick={rescheduleNow}
          >
            {t('CALENDAR.MYSESSION.ACTIONS.RESCHEDULE')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default MySessionCalendar;
