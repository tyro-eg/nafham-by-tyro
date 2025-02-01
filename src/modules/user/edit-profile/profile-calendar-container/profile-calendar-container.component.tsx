import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import arLocale from '@fullcalendar/core/locales/ar-kw';

import { useTranslation } from 'react-i18next';
import { Button, Dialog } from '@mui/material';

import {
  RootState,
  useAppDispatch,
  useAppSelector,
} from '../../../../redux/store';
import {
  selectCreateSlotsStatus,
  selectDeleteSlotsStatus,
  selectTimeSlots,
} from '../../../../redux/calendar/calendar.selectors';
import { selectCurrentUser } from '../../../../redux/user/user.selectors';

import { rtlClass } from '../../../../assets/utils/utils';

import './profile-calendar-container.styles.scss';
import {
  createSlots,
  deleteSlots,
  getSlots,
} from '../../../../redux/calendar/calendar.actions';
import { addDays, getDay } from 'date-fns';
import ProfileModal from '../../../../modals/profile-modal/profile-modal.component';
import { DateSelectArg, EventAddArg } from '@fullcalendar/core';
import { UserInfoType } from '..';

interface ProfileCalendarProps {
  showEditMode: boolean;
  editModeFlag: boolean;
  toggleEditMode: () => void;
  updateSlots: number;
  getProfileInfo: (updatedData: Partial<UserInfoType>) => void;
  instructorId: string;
}

const ProfileCalendar: React.FC<ProfileCalendarProps> = ({
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
  const dispatch = useAppDispatch();

  const calendarRef = useRef<FullCalendar | null>(null);

  const slots = useAppSelector(selectTimeSlots);
  const currentUser = useAppSelector((state: RootState) =>
    selectCurrentUser(state),
  );
  const createSlotsStatus = useAppSelector((state: RootState) =>
    selectCreateSlotsStatus(state),
  );
  const deleteSlotsStatus = useAppSelector((state: RootState) =>
    selectDeleteSlotsStatus(state),
  );

  const [currentEvents, setCurrentEvents] = useState<any[]>([]);
  const [addedEvents, setAddedEvents] = useState<
    { start_time: string; end_time: string }[]
  >([]);
  const [deletedEvents, setDeletedEvents] = useState<
    { id: string; start_time: string; end_time: string }[]
  >([]);
  const [userSlots, setUserSlots] = useState<any[]>([]);
  const [openProfileModal, setOpenProfileModal] = useState(false);

  const today = new Date();
  const validDate = addDays(today, 1);

  useEffect(() => {
    dispatch(
      getSlots({
        userId: +instructorId,
        params: {
          start_time: today.toISOString(),
          end_time: addDays(today, 7).toISOString(),
        },
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

  useEffect(() => {
    if (
      calendarRef.current &&
      (createSlotsStatus.success || deleteSlotsStatus.success)
    ) {
      const calendarApi = calendarRef.current?.getApi();
      const view = calendarApi?.view;

      const { start, end } =
        view?.activeStart && view?.activeEnd
          ? { start: view.activeStart, end: view.activeEnd }
          : { start: new Date(), end: addDays(new Date(), 7) };
      dispatch(
        getSlots({
          userId: +instructorId,
          params: {
            start_time: start.toISOString(),
            end_time: end.toISOString(),
          },
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createSlotsStatus, deleteSlotsStatus, id]);

  const handleSaveChanges = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      if (addedEvents.length > 0) {
        calendarApi.removeAllEvents();
        dispatch(createSlots({ slots: addedEvents }));
        setAddedEvents([]);
      }
      if (deletedEvents.length > 0) {
        const ids = deletedEvents.map((event) => +event.id);
        dispatch(deleteSlots({ ids }));
        setDeletedEvents([]);
      }
    }
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
    if (event.extendedProps.status === 'reserved') return;
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
            userId: +instructorId,
            params: {
              start_time: start.toISOString(),
              end_time: end.toISOString(),
            },
          }),
        );
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
      <div className="profile-calendar">
        <div className="profile-calendar__container">
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
                <div className="title">
                  {t('CALENDAR.MYSESSION.LEGEND.BUSY')}
                </div>
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
              right: 'timeGridWeek,timeGridDay,dayGridMonth',
            }}
            firstDay={getDay(new Date())}
            initialView="timeGridWeek"
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
            validRange={{ start: validDate }}
            // businessHours={[
            //   {
            //     startTime: '08:00',
            //     daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
            //   },
            // ]}
            selectable={!!showEditMode}
            selectMirror={!!showEditMode}
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
    </div>
  );
};

const renderEventContent = (eventInfo: any) => (
  <div>
    <i>{eventInfo.event.title}</i>
  </div>
);

export default ProfileCalendar;
