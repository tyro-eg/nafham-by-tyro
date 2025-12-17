import React, { useRef, useMemo, useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import arLocale from '@fullcalendar/core/locales/ar-kw';
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
}

/**
 * Get background color for a session based on its status
 * Handles both 'canceled' and 'cancelled' spellings
 */
const getStatusColor = (status: string): string => {
  const normalizedStatus = status.toLowerCase();
  if (normalizedStatus === 'completed') return '#4caf50'; // green
  if (normalizedStatus === 'canceled' || normalizedStatus === 'cancelled')
    return '#f44336'; // red
  if (normalizedStatus === 'missed') return '#9e9e9e'; // gray
  if (normalizedStatus === 'open' || normalizedStatus === 'scheduled')
    return '#ff9800'; // orange
  return '#3ac5f1'; // default blue
};

const SessionsCalendarContainer: React.FC<SessionsCalendarContainerProps> = ({
  filters,
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

  // Transform sessions to FullCalendar events
  const calendarEvents: EventInput[] = useMemo(() => {
    return sessions.map((session) => {
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
          tutor: tutorName,
          student: studentName,
          gradeSubject: session.grade_subject?.full_course_name || 'N/A',
          backgroundColor, // Store for CSS fallback
          sessionLink: session.session_link,
          sessionId: session.id, // For finding session in array
        },
      };
    });
  }, [sessions, t]);

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
          plugins={[dayGridPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: '',
          }}
          initialView="dayGridMonth"
          dayHeaderFormat={{
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            omitCommas: true,
          }}
          buttonText={{
            today: t('CALENDAR.BUTTONS.TODAY'),
            month: t('CALENDAR.BUTTONS.MONTH'),
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
  const { status, tutor, student, gradeSubject, backgroundColor } =
    event.extendedProps;

  // Use stored backgroundColor or calculate from status
  const bgColor = backgroundColor || getStatusColor(status);

  return (
    <div
      className="session-event"
      style={{
        backgroundColor: bgColor,
        color: '#ffffff',
      }}
      title={`${tutor} - ${student}\n${gradeSubject}\nStatus: ${status}`}
    >
      <div className="session-event__time">
        {event.start.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
      <div className="session-event__title">{event.title}</div>
      <div className="session-event__status">{status}</div>
    </div>
  );
};

export default SessionsCalendarContainer;
