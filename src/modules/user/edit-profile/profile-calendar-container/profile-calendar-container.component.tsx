import { FC, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import arLocale from '@fullcalendar/core/locales/ar-kw';
import { addDays, getDay } from 'date-fns';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Box,
} from '@mui/material';
import { DateSelectArg, EventAddArg } from '@fullcalendar/core';

import { RootState, useAppSelector } from '../../../../redux/store';
import { selectCurrentUser } from '../../../../redux/user/user.selectors';
import {
  useSlots,
  useCreateSlots,
  useDeleteSlots,
} from '../../../../hooks/useCalendar';
import { useRtlClass } from '../../../../assets/utils/utils';
import { get } from '../../../../assets/utils/api';
import { snackActions } from '../../../../assets/utils/toaster';
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
  const [openDuplicateDialog, setOpenDuplicateDialog] = useState(false);
  const [numberOfWeeksToDuplicate, setNumberOfWeeksToDuplicate] = useState(1);
  const [isDuplicating, setIsDuplicating] = useState(false);

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

  /**
   * Get slots from the currently viewed week using FullCalendar API
   * This includes both saved and unsaved slots (displayed on calendar)
   * Filters out reserved/booked slots (only user-added availability)
   */
  const getCurrentViewedWeekSlots = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return [];

    const viewStart = calendarApi.view.activeStart;
    const viewEnd = calendarApi.view.activeEnd;

    // Get all events from the calendar API (includes unsaved slots)
    const allCalendarEvents = calendarApi.getEvents();

    // Filter slots that fall within the viewed week and are not reserved
    return allCalendarEvents.filter((event) => {
      if (!event.start || event.extendedProps?.status === 'reserved')
        return false;

      const eventStart = event.start;
      return eventStart >= viewStart && eventStart < viewEnd;
    });
  };

  /**
   * Open duplicate dialog
   * Shows a warning if no slots are available in the viewed week
   */
  const handleOpenDuplicateDialog = () => {
    const availableSlots = getCurrentViewedWeekSlots();
    if (availableSlots.length === 0) {
      snackActions.warning(
        t(
          'CALENDAR.DUPLICATE.NO_SLOTS_TOOLTIP',
          'No available slots in this week to duplicate',
        ),
      );
      return;
    }
    setOpenDuplicateDialog(true);
    setNumberOfWeeksToDuplicate(1);
  };

  /**
   * Close duplicate dialog
   */
  const handleCloseDuplicateDialog = () => {
    setOpenDuplicateDialog(false);
    setNumberOfWeeksToDuplicate(1);
  };

  /**
   * Fetch slots for a specific date range
   * Uses the same API endpoint as useSlots hook
   */
  const fetchSlotsForRange = async (
    from: string,
    to: string,
  ): Promise<any[]> => {
    try {
      const response = await get(`/tutors/${instructorId}/availabilities`, {
        params: {
          'by_date_range[start_time]': from,
          'by_date_range[end_time]': to,
        },
      });
      // Ensure we have an array from the response
      const timeSlots = response.data.data || response.data || [];
      return Array.isArray(timeSlots) ? timeSlots : [];
    } catch (error) {
      console.error('Error fetching slots:', error);
      return [];
    }
  };

  /**
   * Check if two slots have the same start and end time
   * Handles different slot formats: { start_time, end_time } or { start, end } or { from, to }
   */
  const slotsMatch = (
    slot1: { start_time: string; end_time: string },
    slot2: any,
  ): boolean => {
    const start1 = new Date(slot1.start_time).getTime();
    const end1 = new Date(slot1.end_time).getTime();

    // Handle different slot formats from API and calendar events
    let start2: number;
    let end2: number;

    if ('start_time' in slot2) {
      // API format: { start_time, end_time }
      start2 = new Date(slot2.start_time).getTime();
      end2 = new Date(slot2.end_time).getTime();
    } else if ('start' in slot2) {
      // Calendar event format: { start, end }
      start2 = new Date(slot2.start).getTime();
      end2 = new Date(slot2.end).getTime();
    } else if ('from' in slot2) {
      // Alternative format: { from, to }
      start2 = new Date(slot2.from).getTime();
      end2 = new Date(slot2.to).getTime();
    } else {
      return false;
    }

    return start1 === start2 && end1 === end2;
  };

  /**
   * Duplicate the currently viewed week's slots to next N weeks
   * Step 0: Saves any unsaved slots in current week first
   * Step 1: Fetches target weeks' slots to avoid conflicts
   * Step 2: Creates non-conflicting duplicated slots
   */
  const handleDuplicateWeek = async () => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return;

    setIsDuplicating(true);

    try {
      // Step 0: Save any unsaved changes in current week first
      // This ensures consistency - if we're duplicating slots, they should be saved
      if (addedEvents.length > 0) {
        await createSlotsMutation.mutateAsync(addedEvents);
        setAddedEvents([]);
      }
      if (deletedEvents.length > 0) {
        const ids = deletedEvents.map((event) => +event.id);
        await deleteSlotsMutation.mutateAsync(ids);
        setDeletedEvents([]);
      }

      // Get fresh slot data after saving
      const viewedWeekSlots = getCurrentViewedWeekSlots();
      const viewStart = calendarApi.view.activeStart;
      const viewEnd = calendarApi.view.activeEnd;

      // Step 1: Fetch existing slots for all target weeks
      const targetWeeksSlots: any[] = [];
      for (
        let weekOffset = 1;
        weekOffset <= numberOfWeeksToDuplicate;
        weekOffset++
      ) {
        const weekStart = addDays(viewStart, weekOffset * 7);
        const weekEnd = addDays(viewEnd, weekOffset * 7);

        const slotsInWeek = await fetchSlotsForRange(
          weekStart.toISOString(),
          weekEnd.toISOString(),
        );
        targetWeeksSlots.push(...slotsInWeek);
      }

      // Step 2: Generate duplicated slots and check for conflicts
      const duplicatedSlots: { start_time: string; end_time: string }[] = [];
      let skippedCount = 0;

      for (
        let weekOffset = 1;
        weekOffset <= numberOfWeeksToDuplicate;
        weekOffset++
      ) {
        viewedWeekSlots.forEach((slot) => {
          // Skip slots without valid start/end dates
          if (!slot.start || !slot.end) return;

          const originalStart = new Date(slot.start);
          const originalEnd = new Date(slot.end);

          // Add weekOffset * 7 days to each slot
          const newStart = addDays(originalStart, weekOffset * 7);
          const newEnd = addDays(originalEnd, weekOffset * 7);

          const newSlot = {
            start_time: newStart.toISOString(),
            end_time: newEnd.toISOString(),
          };

          // Check if this slot already exists in target weeks
          const conflictExists = targetWeeksSlots.some((existingSlot) =>
            slotsMatch(newSlot, existingSlot),
          );

          if (conflictExists) {
            skippedCount++;
          } else {
            duplicatedSlots.push(newSlot);
          }
        });
      }

      // Step 3: Handle results
      if (duplicatedSlots.length === 0) {
        // All slots already exist
        snackActions.warning(
          t(
            'CALENDAR.DUPLICATE.ALL_EXIST',
            'All slots already exist in the target weeks. No new slots created.',
          ),
        );
        handleCloseDuplicateDialog();
        return;
      }

      // Step 4: Create non-conflicting slots
      await createSlotsMutation.mutateAsync(duplicatedSlots);

      // Step 5: Show appropriate feedback
      if (skippedCount > 0) {
        snackActions.info(
          t('CALENDAR.DUPLICATE.PARTIAL_SUCCESS', {
            defaultValue:
              'Created {{created}} slot(s), skipped {{skipped}} slot(s) that already existed',
            created: duplicatedSlots.length,
            skipped: skippedCount,
          }),
        );
      }

      handleCloseDuplicateDialog();
    } catch (error) {
      // Error handling is done in the mutation's onError
      console.error('Error duplicating week:', error);
    } finally {
      setIsDuplicating(false);
    }
  };

  /**
   * Check if duplicate button should be disabled
   * Disabled when the viewed week has no user-added slots
   */
  const isDuplicateDisabled = () => {
    return getCurrentViewedWeekSlots().length === 0;
  };

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
            duplicateWeek: {
              text: i18n.language === 'ar' ? 'تكرار الأسبوع' : 'Duplicate Week',
              click: handleOpenDuplicateDialog,
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
            right: showEditMode
              ? 'duplicateWeek day,week,month'
              : 'day,week,month',
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

      {/* Duplicate Week Dialog */}
      <Dialog
        maxWidth="sm"
        fullWidth
        onClose={handleCloseDuplicateDialog}
        open={openDuplicateDialog}
        className={rtlClass}
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ fontSize: '1.75rem', fontWeight: 600, pb: 1 }}>
          {t('CALENDAR.DUPLICATE.TITLE', 'Duplicate This Week')}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography
            variant="body1"
            sx={{
              fontSize: '1.4rem',
              lineHeight: 1.6,
              marginBottom: '1.2rem',
            }}
          >
            {t(
              'CALENDAR.DUPLICATE.DESCRIPTION',
              'This will copy all available slots from the currently viewed week to the next selected weeks.',
            )}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontSize: '1.4rem',
              lineHeight: 1.6,
              marginBottom: '1.2rem',
            }}
          >
            {t(
              'CALENDAR.DUPLICATE.CURRENT_WEEK_INFO_BEFORE',
              'Current week has',
            )}{' '}
            <Box component="span" sx={{ fontWeight: 700 }}>
              {getCurrentViewedWeekSlots().length}
            </Box>{' '}
            {t(
              'CALENDAR.DUPLICATE.CURRENT_WEEK_INFO_AFTER',
              'available slot(s)',
            )}
          </Typography>

          <FormControl
            fullWidth
            sx={{ marginTop: '1.2rem', marginBottom: '1.2rem' }}
          >
            <InputLabel
              id="duplicate-weeks-label"
              sx={{ fontSize: '1.4rem', lineHeight: 1.6 }}
            >
              {t('CALENDAR.DUPLICATE.SELECT_WEEKS', 'Duplicate to')}
            </InputLabel>
            <Select
              labelId="duplicate-weeks-label"
              value={numberOfWeeksToDuplicate}
              label={t('CALENDAR.DUPLICATE.SELECT_WEEKS', 'Duplicate to')}
              onChange={(e) =>
                setNumberOfWeeksToDuplicate(Number(e.target.value))
              }
              sx={{
                height: '44px',
                fontSize: '1.4rem',
                '& .MuiSelect-select': {
                  paddingTop: '10px',
                  paddingBottom: '10px',
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    '& .MuiMenuItem-root': {
                      fontSize: '1.4rem',
                      minHeight: '44px',
                    },
                  },
                },
              }}
            >
              <MenuItem value={1}>
                {t('CALENDAR.DUPLICATE.WEEKS_1', '1 week ahead')}
              </MenuItem>
              <MenuItem value={2}>
                {t('CALENDAR.DUPLICATE.WEEKS_2', '2 weeks ahead')}
              </MenuItem>
              <MenuItem value={3}>
                {t('CALENDAR.DUPLICATE.WEEKS_3', '3 weeks ahead')}
              </MenuItem>
              <MenuItem value={4}>
                {t('CALENDAR.DUPLICATE.WEEKS_4', '4 weeks ahead')}
              </MenuItem>
            </Select>
          </FormControl>

          <Typography
            variant="body1"
            sx={{
              fontSize: '1.4rem',
              lineHeight: 1.6,
              marginBottom: '1.2rem',
            }}
          >
            {t('CALENDAR.DUPLICATE.PREVIEW_BEFORE', 'This will create')}{' '}
            <Box component="span" sx={{ fontWeight: 700 }}>
              {getCurrentViewedWeekSlots().length * numberOfWeeksToDuplicate}
            </Box>{' '}
            {t('CALENDAR.DUPLICATE.PREVIEW_MIDDLE', 'new slot(s) across')}{' '}
            <Box component="span" sx={{ fontWeight: 700 }}>
              {numberOfWeeksToDuplicate}
            </Box>{' '}
            {t('CALENDAR.DUPLICATE.PREVIEW_AFTER', 'week(s)')}
          </Typography>

          <Typography
            sx={{
              fontSize: '1.4rem',
              fontWeight: 500,
              lineHeight: 1.6,
              color: '#ed6c02',
              marginBottom: '0',
            }}
          >
            {t(
              'CALENDAR.DUPLICATE.NOTE',
              'Note: Reserved slots will be skipped automatically',
            )}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
          <Button
            onClick={handleCloseDuplicateDialog}
            disabled={isDuplicating}
            color="inherit"
            sx={{
              fontSize: '1.4rem',
              fontWeight: 500,
              textTransform: 'none',
              minHeight: '48px',
              px: 3,
            }}
          >
            {t('MODALS.ACTIONS.CANCEL', 'Cancel')}
          </Button>
          <Button
            onClick={handleDuplicateWeek}
            variant="contained"
            color="primary"
            disabled={isDuplicating || isDuplicateDisabled()}
            startIcon={
              isDuplicating ? <CircularProgress size={20} /> : undefined
            }
            sx={{
              fontSize: '1.4rem',
              fontWeight: 500,
              textTransform: 'none',
              minHeight: '48px',
              px: 3,
            }}
          >
            {isDuplicating
              ? t('CALENDAR.DUPLICATE.DUPLICATING', 'Duplicating...')
              : t('CALENDAR.DUPLICATE.BUTTON', 'Duplicate Slots')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const renderEventContent = (eventInfo: any) => (
  <div>
    <i>{eventInfo.event.title}</i>
  </div>
);

export default ProfileCalendar;
