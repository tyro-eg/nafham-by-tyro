import React, { useEffect, useState } from 'react';
import { Alert, Button, TextField } from '@mui/material';
import { LinkRounded, LinkOffRounded } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { SessionType } from '../../../../../assets/types';
import {
  changeErrorMessage,
  useReportLinkProblem,
  useSetMeetingLink,
} from '../../../../../hooks/useSessionChanges';

/**
 * The tutor adds or replaces the lesson's own meeting link (Google Meet,
 * Zoom, Teams) from 30 minutes before until the end; a notice says when
 * Zoom could not make a room. The backend decides who may do what
 * (can_set_meeting_link, needs_meeting_link).
 */
export const TutorMeetingLink: React.FC<{ session: SessionType }> = ({
  session,
}) => {
  const { t } = useTranslation();
  const setLink = useSetMeetingLink();
  const [open, setOpen] = useState(!!session.needs_meeting_link);
  const [link, setLinkValue] = useState(session.meeting_link ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLinkValue(session.meeting_link ?? '');
  }, [session.meeting_link]);
  useEffect(() => {
    if (session.needs_meeting_link) setOpen(true);
  }, [session.needs_meeting_link]);

  if (!session.can_set_meeting_link) return null;

  const save = async () => {
    setError(null);
    setSaved(false);
    try {
      await setLink.mutateAsync({ sessionId: session.id, link });
      setSaved(true);
    } catch (err) {
      setError(changeErrorMessage(err, t('MEETING_LINK.ERROR')));
    }
  };

  return (
    <div className="sessions-card__meeting-link">
      {session.needs_meeting_link && (
        <Alert severity="warning" className="sessions-card__meeting-link-alert">
          {t('MEETING_LINK.NO_ROOM')}
        </Alert>
      )}
      {!open ? (
        <Button
          variant="text"
          color="secondary"
          size="small"
          startIcon={<LinkRounded />}
          onClick={() => setOpen(true)}
        >
          {session.meeting_link
            ? t('MEETING_LINK.REPLACE')
            : t('MEETING_LINK.ADD')}
        </Button>
      ) : (
        <form
          className="sessions-card__meeting-link-form"
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          <TextField
            size="small"
            fullWidth
            type="url"
            label={t('MEETING_LINK.LABEL')}
            placeholder="https://meet.google.com/..."
            value={link}
            onChange={(event) => {
              setLinkValue(event.target.value);
              setSaved(false);
            }}
            helperText={error ?? t('MEETING_LINK.HELP')}
            error={!!error}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!link.trim() || setLink.isPending}
          >
            {session.meeting_link
              ? t('MEETING_LINK.SAVE_REPLACE')
              : t('MEETING_LINK.SAVE')}
          </Button>
        </form>
      )}
      {saved && (
        <p className="sessions-card__hint" role="status">
          {t('MEETING_LINK.SAVED')}
        </p>
      )}
    </div>
  );
};

/**
 * The student says the lesson link isn't working: the tutor is asked in the
 * lesson chat to replace it, and support steps in 5 minutes later if not.
 */
export const ReportLinkProblem: React.FC<{ session: SessionType }> = ({
  session,
}) => {
  const { t } = useTranslation();
  const report = useReportLinkProblem();
  const [error, setError] = useState<string | null>(null);
  const reportedAt = session.link_problem_reported_at
    ? new Date(session.link_problem_reported_at).getTime()
    : 0;
  // The backend repeats nothing within 5 minutes of a report
  const recentlyReported = Date.now() - reportedAt < 5 * 60 * 1000;

  if (!session.can_report_link_problem) return null;

  const send = async () => {
    setError(null);
    try {
      await report.mutateAsync(session.id);
    } catch (err) {
      setError(changeErrorMessage(err, t('MEETING_LINK.REPORT_ERROR')));
    }
  };

  return (
    <div className="sessions-card__meeting-link">
      {recentlyReported ? (
        <p className="sessions-card__hint" role="status">
          {t('MEETING_LINK.REPORTED')}
        </p>
      ) : (
        <Button
          variant="text"
          color="inherit"
          size="small"
          startIcon={<LinkOffRounded />}
          onClick={() => void send()}
          disabled={report.isPending}
        >
          {t('MEETING_LINK.REPORT')}
        </Button>
      )}
      {error && <p className="sessions-card__hint">{error}</p>}
    </div>
  );
};
