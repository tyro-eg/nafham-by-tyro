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

interface ProfileCalendarProps {
  showEditMode: boolean;
  editModeFlag: boolean;
  toggleEditMode: () => void;
  updateSlots: number;
  getProfileInfo: (data: { slots: any[] }) => void;
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

  const slots = useAppSelector((state: RootState) => selectTimeSlots(state));
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
  const [addedEvents, setAddedEvents] = useState<any[]>([]);
  const [deletedEvents, setDeletedEvents] = useState<any[]>([]);
  const [userSlots, setUserSlots] = useState<any[]>([]);
  const [openProfileModal, setOpenProfileModal] = useState(false);

  const today = new Date();
  const validDate = addDays(today, 1);

  useEffect(() => {
    dispatch(
      getSlots({
        userId: currentUser.id,
        params: {
          from: today.toISOString(),
          to: addDays(today, 7).toISOString(),
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
          userId: +id!,
          params: {
            from: start.toISOString(),
            to: end.toISOString(),
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
        dispatch(createSlots({ userId: +id!, slots: addedEvents }));
        setAddedEvents([]);
      }
      if (deletedEvents.length > 0) {
        const ids = deletedEvents.map((event) => event.id);
        dispatch(deleteSlots({ userId: +id!, ids }));
        setDeletedEvents([]);
      }
    }
  };

  const handleDateSelect = (selectInfo: any) => {
    if (!showEditMode) return;
    const title = 'event';
    const calendarApi = selectInfo.view.calendar;

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
        (ele) => ele.from !== event.startStr && ele.to !== event.endStr,
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
        { id: event.id, from: event.startStr, to: event.endStr },
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

  const calculateTimeZone = () => {
    const timeZoneArr = new Date().toTimeString().substring(9, 17).split('+');
    return `${timeZoneArr[0]} +${timeZoneArr[1].slice(0, 2)}:${timeZoneArr[1].slice(2)}`;
  };

  const handleEventAdd = () => {};
  const handleEventsSet = () => {};

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
            events={currentEvents} // alternatively, use the `events` setting to fetch from a feed
            select={handleDateSelect}
            eventContent={renderEventContent} // custom render function
            eventClick={handleEventClick}
            eventAdd={handleEventAdd}
            eventsSet={handleEventsSet} // called after events are initialized/added/changed/removed
            /* you can update a remote database when these fire:
            eventRemove={handleEventRemove}
            eventChange={function(){}}
          */
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
