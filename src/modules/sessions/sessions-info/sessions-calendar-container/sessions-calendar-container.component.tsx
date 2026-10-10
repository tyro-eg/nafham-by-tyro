import React, { useRef, useMemo, useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import arLocale from '../../../../assets/utils/calendar-locale';
import { useTranslation } from 'react-i18next';
import { Popover } from '@mui/material';
import type { EventClickArg } from '@fullcalendar/core';
import { useInfiniteSessions } from '../../../../hooks/useSessions';
import type { EventInput } from '@fullcalendar/core';
import { SessionType } from '../../../../assets/types';
import SessionCalendarDetailsModal from '../../../../modals/session-calendar-details-modal/session-calendar-details-modal.component';

import './sessions-calendar-container.styles.scss';

interface SessionsCalendarContainerProps {
  filters?: {
    status?: string;
    tutor_id?: number;
  };
  /** Adds a Month/Week switcher (used by the Calendar page) */
  enableWeekView?: boolean;
  /** Only show sessions with these statuses (client-side) */
  onlyStatuses?: string[];
}

/**
 * Get background color for a session based on its status
 * Handles both 'canceled' and 'cancelled' spellings
 */
const getStatusColor = (status: string): string => {
  const normalizedStatus = status.toLowerCase();
  if (normalizedStatus === 'completed') return '#4caf50'; // green
  // Same meaning as the list view badges: missed = danger, canceled = neutral
  if (normalizedStatus === 'canceled' || normalizedStatus === 'cancelled')
    return '#9aa8b8'; // gray ($gray-400)
  if (normalizedStatus === 'missed') return '#dc3545'; // red ($danger-500)
  if (normalizedStatus === 'open' || normalizedStatus === 'scheduled')
    return '#ff9800'; // orange
  return '#3ac5f1'; // default blue
};

const SessionsCalendarContainer: React.FC<SessionsCalendarContainerProps> = ({
  filters,
  enableWeekView = false,
  onlyStatuses,
}) => {
  const { t, i18n } = useTranslation();
  const calendarRef = useRef<FullCalendar>(null);
  const [selectedSession, setSelectedSession] = useState<SessionType | null>(
    null,
  );
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  // Fetch ALL sessions using infinite query
  const {
    data: infiniteData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteSessions(100, filters);

  // Fetch all pages on mount
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten all pages into a single array
  const sessions = useMemo(() => {
    if (!infiniteData?.pages) return [];
    return infiniteData.pages.flatMap((page) => page.data);
  }, [infiniteData]);

  // Translated status labels (raw API values are lower-case English)
  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      open: t('MYSESSIONS.FILTERS.OPEN'),
      scheduled: t('MYSESSIONS.FILTERS.SCHEDULED'),
      completed: t('MYSESSIONS.FILTERS.COMPLETED'),
      cancelled: t('MYSESSIONS.FILTERS.CANCELLED'),
      canceled: t('MYSESSIONS.FILTERS.CANCELLED'),
      missed: t('MYSESSIONS.FILTERS.MISSED'),
    };
    return statusMap[status?.toLowerCase()] || status;
  };

  // Transform sessions to FullCalendar events
  const calendarEvents: EventInput[] = useMemo(() => {
    const visible = onlyStatuses
      ? sessions.filter((s) => onlyStatuses.includes(s.status))
      : sessions;
    return visible.map((session) => {
      // Determine session color based on status
      const status = session.status as string;
      const backgroundColor = getStatusColor(status);

      // Get session title
      const tutorName = session.tutor
        ? `${session.tutor.first_name} ${session.tutor.last_name}`
        : 'N/A';
      const studentName = session.student
        ? `${session.student.first_name} ${session.student.last_name}`
        : 'N/A';

      return {
        id: session.id.toString(),
        title: `${tutorName} - ${studentName}`,
        start: session.start_time,
        end: session.end_time,
        backgroundColor,
        borderColor: backgroundColor,
        textColor: '#ffffff',
        classNames: [
          `session-calendar-event`,
          `session-status-${session.status}`,
        ],
        extendedProps: {
          status: session.status,
          statusLabel: getStatusLabel(session.status as string),
          statusTitle: t('SESSION_CALENDAR_MODAL.STATUS'),
          tutor: tutorName,
          student: studentName,
          gradeSubject: session.grade_subject?.full_course_name || 'N/A',
          backgroundColor, // Store for CSS fallback
          sessionLink: session.session_link,
          sessionId: session.id, // For finding session in array
        },
      };
    });
  }, [sessions, t, onlyStatuses]);

  /**
   * Handle event click - open popover with session details
   */
  const handleEventClick = (clickInfo: EventClickArg) => {
    const sessionId = parseInt(clickInfo.event.id, 10);
    const session = sessions.find((s) => s.id === sessionId);

    if (session) {
      setSelectedSession(session);
      // Use the click event's target as anchor for positioning
      setAnchorEl(clickInfo.jsEvent.target as HTMLElement);
    }
  };

  /**
   * Handle popover close
   */
  const handleClosePopover = () => {
    setAnchorEl(null);
    setSelectedSession(null);
  };

  const isPopoverOpen = Boolean(anchorEl);

  return (
    <div className="session-calendar">
      {(isLoading || isFetchingNextPage) && sessions.length === 0 ? (
        <div className="session-calendar__loading">
          <p>{t('MYSESSIONS.LOADING_SESSIONS')}</p>
        </div>
      ) : (
        <FullCalendar
          ref={calendarRef}
          plugins={
            enableWeekView ? [dayGridPlugin, timeGridPlugin] : [dayGridPlugin]
          }
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: enableWeekView ? 'dayGridMonth,timeGridWeek' : '',
          }}
          scrollTime="08:00:00"
          allDaySlot={false}
          initialView="dayGridMonth"
          dayHeaderFormat={{
            weekday: 'short',
          }}
          buttonText={{
            today: t('CALENDAR.BUTTONS.TODAY'),
            month: t('CALENDAR.BUTTONS.MONTH'),
            week: t('CALENDAR.BUTTONS.WEEK'),
          }}
          direction={i18n.dir()}
          locale={i18n.language === 'ar' ? arLocale : undefined}
          events={calendarEvents}
          eventContent={renderEventContent}
          eventClick={handleEventClick}
          editable={false}
          selectable={false}
          selectMirror={false}
          height="auto"
        />
      )}

      {/* Session Details Popover */}
      {selectedSession && (
        <Popover
          open={isPopoverOpen}
          anchorEl={anchorEl}
          onClose={handleClosePopover}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: i18n.dir() === 'rtl' ? 'right' : 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: i18n.dir() === 'rtl' ? 'right' : 'left',
          }}
          slotProps={{
            paper: {
              sx: {
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                marginTop: '0.8rem',
                marginLeft: i18n.dir() === 'rtl' ? '0' : '0.8rem',
                marginRight: i18n.dir() === 'rtl' ? '0.8rem' : '0',
              },
            },
          }}
          disableRestoreFocus
        >
          <SessionCalendarDetailsModal
            session={selectedSession}
            handleClose={handleClosePopover}
          />
        </Popover>
      )}
    </div>
  );
};

interface EventInfo {
  event: {
    start: Date;
    title: string;
    extendedProps: {
      status: string;
      statusLabel?: string;
      statusTitle?: string;
      tutor: string;
      student: string;
      gradeSubject: string;
      backgroundColor?: string;
    };
  };
}

/**
 * Render custom content for calendar events
 */
const renderEventContent = (eventInfo: EventInfo) => {
  const { event } = eventInfo;
  const {
    status,
    statusLabel,
    statusTitle,
    tutor,
    student,
    gradeSubject,
    backgroundColor,
  } = event.extendedProps;
  const label = statusLabel || status;

  // Use stored backgroundColor or calculate from status
  const bgColor = backgroundColor || getStatusColor(status);

  return (
    <div
      className="session-event"
      style={{
        backgroundColor: bgColor,
        color: '#ffffff',
      }}
      title={`${tutor} - ${student}\n${gradeSubject}\n${statusTitle || 'Status'}: ${label}`}
    >
      <div className="session-event__time" dir="auto">
        {event.start.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
      <div className="session-event__title" dir="auto">
        {event.title}
      </div>
      <div className="session-event__status">{label}</div>
    </div>
  );
};

export default SessionsCalendarContainer;
