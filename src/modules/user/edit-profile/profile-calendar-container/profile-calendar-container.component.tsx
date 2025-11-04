import { FC, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import arLocale from '@fullcalendar/core/locales/ar-kw';
import { addDays, getDay } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Button, Dialog } from '@mui/material';
import { DateSelectArg, EventAddArg } from '@fullcalendar/core';

import { RootState, useAppSelector } from '../../../../redux/store';
import { selectCurrentUser } from '../../../../redux/user/user.selectors';
import {
  useSlots,
  useCreateSlots,
  useDeleteSlots,
} from '../../../../hooks/useCalendar';
import { useRtlClass } from '../../../../assets/utils/utils';
import { UserInfoType } from '..';
import ProfileModal from '../../../../modals/profile-modal/profile-modal.component';

import './profile-calendar-container.styles.scss';

interface ProfileCalendarProps {
  showEditMode: boolean;
  editModeFlag: boolean;
  toggleEditMode: () => void;
  updateSlots: number;
  getProfileInfo: (updatedData: Partial<UserInfoType>) => void;
  instructorId: string;
}

const ProfileCalendar: FC<ProfileCalendarProps> = ({
  showEditMode,
  editModeFlag,
  toggleEditMode,
  updateSlots,
  getProfileInfo,
  instructorId,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const rtlClass = useRtlClass();

  const calendarRef = useRef<FullCalendar | null>(null);
  const hasScrolledToInitialEvent = useRef(false);

  const currentUser = useAppSelector((state: RootState) =>
    selectCurrentUser(state),
  );

  const today = new Date(new Date().setHours(0, 0, 0, 0));

  /**
   * Calculate the next half-hour slot from current time
   * This ensures the entire current slot is disabled, not just up to the current minute
   * Examples:
   * - 15:03 -> 15:30
   * - 15:45 -> 16:00
   * - 23:45 -> next day 00:00
   */
  const getNextHalfHourSlot = () => {
    const now = new Date();
    const minutes = now.getMinutes();
    const hours = now.getHours();

    // Round up to next 30-minute interval
    if (minutes < 30) {
      // If before :30, set to :30 of current hour
      now.setMinutes(30, 0, 0);
    } else {
      // If after :30, set to :00 of next hour
      now.setHours(hours + 1, 0, 0, 0);
    }

    return now;
  };

  /**
   * Get the valid range start (today's date + next half-hour slot time)
   * This ensures the calendar can't navigate or select before this moment
   */
  const getValidRangeStart = () => {
    const nextSlot = getNextHalfHourSlot();
    return nextSlot.toISOString();
  };

  // Memoize date range to prevent infinite re-renders
  const [dateRange, setDateRange] = useState(() => ({
    from: today.toISOString(),
    to: addDays(today, 7).toISOString(),
  }));

  // Fetch slots using TanStack Query
  const { data: slots = [] } = useSlots(
    +instructorId,
    dateRange.from,
    dateRange.to,
    !!instructorId,
  );

  // Mutations for create and delete
  const createSlotsMutation = useCreateSlots();
  const deleteSlotsMutation = useDeleteSlots();

  const [currentEvents, setCurrentEvents] = useState<any[]>([]);
  const [addedEvents, setAddedEvents] = useState<
    { start_time: string; end_time: string }[]
  >([]);
  const [deletedEvents, setDeletedEvents] = useState<
    { id: string; start_time: string; end_time: string }[]
  >([]);
  const [userSlots, setUserSlots] = useState<any[]>([]);
  const [openProfileModal, setOpenProfileModal] = useState(false);

  useEffect(() => {
    setCurrentEvents(slots || []);
    setUserSlots(slots || []);
  }, [slots]);

  useEffect(() => {
    getProfileInfo({ slots: userSlots });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSlots]);

  useEffect(() => {
    handleSaveChanges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateSlots]);

  /**
   * Scroll to the earliest user event when events are loaded
   * This runs once after the initial events are fetched
   * Finds the earliest TIME across all visible days (not earliest date-time)
   */
  useEffect(() => {
    if (
      currentEvents.length > 0 &&
      calendarRef.current &&
      !hasScrolledToInitialEvent.current
    ) {
      const calendarApi = calendarRef.current.getApi();

      // Filter out past events (only include today and future events)
      const now = new Date();
      const todayStart = new Date(now.setHours(0, 0, 0, 0));

      const futureEvents = currentEvents.filter((event: any) => {
        if (!event.start) return false;
        const eventDate = new Date(event.start);
        return eventDate >= todayStart;
      });

      // Extract all times (HH:mm) from future events
      const times = futureEvents.map((event: any) => {
        const eventDate = new Date(event.start);
        return eventDate.toTimeString().slice(0, 5); // "HH:mm"
      });

      // Find the earliest TIME (not earliest date-time)
      // Sort times as strings in HH:mm format (e.g., "03:00" < "19:00")
      const earliestTime = times.sort((a, b) => a.localeCompare(b))[0];

      if (earliestTime) {
        // Use setTimeout to ensure calendar is fully rendered
        setTimeout(() => {
          if (calendarRef.current) {
            calendarApi.scrollToTime(earliestTime);
            hasScrolledToInitialEvent.current = true;
          }
        }, 300);
      }
    }
  }, [currentEvents]);

  const handleSaveChanges = async () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      if (addedEvents.length > 0) {
        calendarApi.removeAllEvents();
        await createSlotsMutation.mutateAsync(addedEvents);
        setAddedEvents([]);
      }
      if (deletedEvents.length > 0) {
        const ids = deletedEvents.map((event) => +event.id);
        await deleteSlotsMutation.mutateAsync(ids);
        setDeletedEvents([]);
      }
    }
  };

  /**
   * Prevent selection of past time slots (including current slot)
   * Returns false for slots before the next half-hour slot
   */
  const handleSelectAllow = (selectInfo: any) => {
    return selectInfo.start >= getNextHalfHourSlot();
  };

  /**
   * Add CSS classes to events based on whether they're in the past
   */
  const handleEventClassNames = (arg: any) => {
    const eventStart = new Date(arg.event.start);
    // Add past class to events before next half-hour slot
    if (eventStart < getNextHalfHourSlot()) {
      return ['fc-event-past'];
    }
    return [];
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    if (!showEditMode) return;

    const { start, end, view } = selectInfo;
    const calendarApi = view.calendar;

    const durationInMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

    const isSingleDay = start.getDate() === end.getDate();
    const isValidDuration = durationInMinutes <= 30;

    if (!isSingleDay || !isValidDuration) {
      calendarApi.unselect();
      return;
    }
    const title = 'event';

    calendarApi.unselect();

    if (title) {
      calendarApi.addEvent({
        start: selectInfo.startStr,
        end: selectInfo.endStr,
      });
    }
  };

  const handleEventClick = ({ event }: any) => {
    // Block interaction with reserved slots
    if (event.extendedProps.status === 'reserved') return;

    // Block interaction with past events (before next half-hour slot)
    const eventStart = new Date(event.start);
    if (eventStart < getNextHalfHourSlot()) return;
    if (!currentUser) {
      navigate('/login');
    } else if (Number(currentUser.id) !== Number(id)) {
      triggerOpenProfileModal();
    }
    if (!showEditMode) return;

    setAddedEvents((prev) =>
      prev.filter(
        (ele) =>
          ele.start_time !== event.startStr && ele.end_time !== event.endStr,
      ),
    );

    setUserSlots((prev) =>
      prev.filter((ele) =>
        event.id
          ? String(ele.id) !== String(event.id)
          : ele.from !== event.startStr && ele.to !== event.endStr,
      ),
    );

    if (event.id) {
      setDeletedEvents((prev) => [
        ...prev,
        { id: event.id, start_time: event.startStr, end_time: event.endStr },
      ]);
    }
    event.remove();
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
      if (currentUser?.id) {
        setDateRange({
          from: start.toISOString(),
          to: end.toISOString(),
        });
      }
    }
  };

  const calculateTimeZone = () => {
    const timeZoneArr = new Date().toTimeString().substring(9, 17).split('+');
    return `${timeZoneArr[0]} +${timeZoneArr[1].slice(0, 2)}:${timeZoneArr[1].slice(2)}`;
  };

  const handleEventAdd = (args: EventAddArg) => {
    if (!showEditMode) return;
    const { event } = args;
    setAddedEvents((prev) => [
      ...prev,
      { start_time: event.startStr, end_time: event.endStr },
    ]);
    setUserSlots((prev) => [
      ...prev,
      { from: event.startStr, to: event.endStr },
    ]);
  };

  const handleCloseProfileModal = () => setOpenProfileModal(false);
  const triggerOpenProfileModal = () => setOpenProfileModal(true);

  return (
    <div className="profile-calendar">
      <div className="profile-calendar__container">
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
          validRange={{
            start: getValidRangeStart(), // Prevent navigation and selection before next half-hour slot
          }}
          selectAllow={handleSelectAllow}
          scrollTimeReset={false}
          selectable={!!showEditMode}
          selectMirror={!!showEditMode}
          eventClassNames={handleEventClassNames}
          events={currentEvents}
          select={handleDateSelect}
          eventContent={renderEventContent}
          eventClick={handleEventClick}
          eventAdd={handleEventAdd}
          locale={i18n.language === 'ar' ? arLocale : undefined}
        />
        {showEditMode && (
          <div className={`calendar__hover ${editModeFlag ? 'hide' : ''}`}>
            <Button
              color="primary"
              variant="contained"
              onClick={toggleEditMode}
              className="calendar__hover--btn"
            >
              {t('CALENDAR.PROFILE.EDITPROFILE.EDITPROFILELABEL')}
            </Button>
          </div>
        )}
      </div>
      {openProfileModal && (
        <Dialog
          maxWidth="sm"
          fullWidth
          onClose={handleCloseProfileModal}
          open={openProfileModal}
        >
          <ProfileModal instructorId={instructorId} />
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

export default ProfileCalendar;
