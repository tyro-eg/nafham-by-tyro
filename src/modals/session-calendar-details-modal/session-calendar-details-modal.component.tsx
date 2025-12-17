import { FC } from 'react';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Button, Typography, Box, IconButton } from '@mui/material';
import {
  Close,
  VideoCall,
  Person,
  School,
  AccessTime,
  Label,
} from '@mui/icons-material';

import { SessionType } from '../../assets/types';
import { useRtlClass } from '../../assets/utils/utils';

import './session-calendar-details-modal.styles.scss';

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

interface SessionCalendarDetailsModalProps {
  session: SessionType;
  handleClose: () => void;
}

/**
 * SessionCalendarDetailsModal Component
 *
 * Displays session details in a modal when clicking on a calendar event.
 * Shows session information including date/time, course, participants, and status.
 * Includes a "Join Meeting" button if a session link is available.
 *
 * @param session - The session data to display
 * @param handleClose - Callback to close the modal
 *
 * @example
 * <SessionCalendarDetailsModal
 *   session={sessionData}
 *   handleClose={() => setIsOpen(false)}
 * />
 */
const SessionCalendarDetailsModal: FC<SessionCalendarDetailsModalProps> = ({
  session,
  handleClose,
}) => {
  const { t } = useTranslation();
  const rtlClass = useRtlClass();

  // Format date and time
  const startDate = parseISO(session.start_time);
  const endDate = parseISO(session.end_time);
  const formattedDate = format(startDate, 'EEEE, MMMM d, yyyy');
  const formattedStartTime = format(startDate, 'h:mm a');
  const formattedEndTime = format(endDate, 'h:mm a');
  const timeRange = `${formattedStartTime} - ${formattedEndTime}`;

  // Get session participants
  const tutorName = session.tutor
    ? `${session.tutor.first_name} ${session.tutor.last_name}`
    : 'N/A';
  const studentName = session.student
    ? `${session.student.first_name} ${session.student.last_name}`
    : 'N/A';

  // Get course name
  const courseName =
    session.grade_subject?.full_course_name ||
    t('SESSION_CALENDAR_MODAL.NOT_AVAILABLE');

  // Get status color
  const statusColor = getStatusColor(session.status);

  // Check if session link exists
  const hasSessionLink =
    session.session_link && session.session_link.trim() !== '';

  // Handle join button click
  const handleJoinClick = () => {
    if (hasSessionLink) {
      window.open(session.session_link, '_blank', 'noopener,noreferrer');
    }
  };

  // Get status label
  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      open: t('MYSESSIONS.FILTERS.OPEN'),
      scheduled: t('MYSESSIONS.FILTERS.SCHEDULED'),
      completed: t('MYSESSIONS.FILTERS.COMPLETED'),
      cancelled: t('MYSESSIONS.FILTERS.CANCELLED'),
      canceled: t('MYSESSIONS.FILTERS.CANCELLED'),
      missed: t('MYSESSIONS.MAIN.CARD.MISSED'),
    };
    return statusMap[status.toLowerCase()] || status;
  };

  return (
    <div className={`session-calendar-details-modal ${rtlClass}`}>
      <div className="session-calendar-details-modal__header">
        <Typography
          variant="h6"
          className="session-calendar-details-modal__title"
        >
          {t('SESSION_CALENDAR_MODAL.TITLE')}
        </Typography>
        <IconButton
          className="session-calendar-details-modal__close-btn"
          onClick={handleClose}
          aria-label="Close"
          size="small"
        >
          <Close />
        </IconButton>
      </div>

      <div className="session-calendar-details-modal__content">
        {/* Date & Time */}
        <Box className="session-calendar-details-modal__field">
          <Box className="session-calendar-details-modal__field-label">
            <AccessTime className="session-calendar-details-modal__field-icon" />
            <Typography
              variant="body2"
              className="session-calendar-details-modal__label-text"
            >
              {t('SESSION_CALENDAR_MODAL.DATE_TIME')}
            </Typography>
          </Box>
          <Typography
            variant="body1"
            className="session-calendar-details-modal__field-value"
          >
            {formattedDate}
          </Typography>
          <Typography
            variant="body2"
            className="session-calendar-details-modal__field-value-secondary"
          >
            {timeRange}
          </Typography>
        </Box>

        {/* Course */}
        <Box className="session-calendar-details-modal__field">
          <Box className="session-calendar-details-modal__field-label">
            <School className="session-calendar-details-modal__field-icon" />
            <Typography
              variant="body2"
              className="session-calendar-details-modal__label-text"
            >
              {t('SESSION_CALENDAR_MODAL.COURSE')}
            </Typography>
          </Box>
          <Typography
            variant="body1"
            className="session-calendar-details-modal__field-value"
          >
            {courseName}
          </Typography>
        </Box>

        {/* Tutor */}
        <Box className="session-calendar-details-modal__field">
          <Box className="session-calendar-details-modal__field-label">
            <Person className="session-calendar-details-modal__field-icon" />
            <Typography
              variant="body2"
              className="session-calendar-details-modal__label-text"
            >
              {t('SESSION_CALENDAR_MODAL.TUTOR')}
            </Typography>
          </Box>
          <Typography
            variant="body1"
            className="session-calendar-details-modal__field-value"
          >
            {tutorName}
          </Typography>
        </Box>

        {/* Student */}
        <Box className="session-calendar-details-modal__field">
          <Box className="session-calendar-details-modal__field-label">
            <Person className="session-calendar-details-modal__field-icon" />
            <Typography
              variant="body2"
              className="session-calendar-details-modal__label-text"
            >
              {t('SESSION_CALENDAR_MODAL.STUDENT')}
            </Typography>
          </Box>
          <Typography
            variant="body1"
            className="session-calendar-details-modal__field-value"
          >
            {studentName}
          </Typography>
        </Box>

        {/* Status */}
        <Box className="session-calendar-details-modal__field">
          <Box className="session-calendar-details-modal__field-label">
            <Label className="session-calendar-details-modal__field-icon" />
            <Typography
              variant="body2"
              className="session-calendar-details-modal__label-text"
            >
              {t('SESSION_CALENDAR_MODAL.STATUS')}
            </Typography>
          </Box>
          <Typography
            variant="body1"
            className="session-calendar-details-modal__field-value"
            sx={{ color: statusColor }}
          >
            {getStatusLabel(session.status)}
          </Typography>
        </Box>

        {/* Meeting Location */}
        {hasSessionLink && (
          <Box className="session-calendar-details-modal__field">
            <Box className="session-calendar-details-modal__field-label">
              <VideoCall className="session-calendar-details-modal__field-icon" />
              <Typography
                variant="body2"
                className="session-calendar-details-modal__label-text"
              >
                {t('SESSION_CALENDAR_MODAL.MEETING_LOCATION')}
              </Typography>
            </Box>
            <Typography
              variant="body1"
              className="session-calendar-details-modal__field-value"
            >
              {t('SESSION_CALENDAR_MODAL.ONLINE_MEETING')}
            </Typography>
          </Box>
        )}
      </div>

      {/* Actions */}
      {hasSessionLink && (
        <Box className="session-calendar-details-modal__actions">
          <Button
            variant="contained"
            color="primary"
            startIcon={<VideoCall />}
            onClick={handleJoinClick}
            className="session-calendar-details-modal__join-btn"
            fullWidth
          >
            {t('SESSION_CALENDAR_MODAL.JOIN_BUTTON')}
          </Button>
        </Box>
      )}
    </div>
  );
};

export default SessionCalendarDetailsModal;
