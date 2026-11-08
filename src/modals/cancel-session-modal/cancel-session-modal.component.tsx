import { FC, useState } from 'react';
import { Alert, Button, TextField } from '@mui/material';
import { Warning } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import './cancel-session-modal.styles.scss';
import {
  STUDENT_CANCEL_REASONS,
  TUTOR_CANCEL_REASONS,
  changeErrorMessage,
  useCancelSession,
  type CancelReason,
} from '../../hooks/useSessionChanges';
import type { SessionType } from '../../assets/types';

interface CancelSessionModalProps {
  session: SessionType;
  /** The viewer is the lesson's tutor (their reasons differ from the family's) */
  isInstructor: boolean;
  handleClose: () => void;
}

const NOTE_LENGTH = 500;

/**
 * The family or the tutor cancels a scheduled lesson: a reason from their
 * list, an optional note. The hours go back to the package and the other
 * side is told in the chat and by email.
 */
const CancelSessionModal: FC<CancelSessionModalProps> = ({
  session,
  isInstructor,
  handleClose,
}) => {
  const { t } = useTranslation();
  const cancel = useCancelSession();
  const reasons = isInstructor ? TUTOR_CANCEL_REASONS : STUDENT_CANCEL_REASONS;
  const [reason, setReason] = useState<CancelReason | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!reason) return;
    setError(null);
    try {
      await cancel.mutateAsync({ sessionId: session.id, reason, note });
      handleClose();
    } catch (err) {
      setError(changeErrorMessage(err, t('SESSION_CHANGES.CANCEL.ERROR')));
    }
  };

  return (
    <div className="cancelCalendarModal">
      <div className="cancelCalendarModal__head">
        <div className="cancelCalendarModal__head-icon">
          <Warning fontSize="inherit" />
        </div>
        <div className="cancelCalendarModal__head-text">
          <h4 className="cancelCalendarModal__title">
            {t('MYSESSIONS.MAIN.CANCELMODAL.TITLE')}
          </h4>
          <p className="cancelCalendarModal__body">
            {t(
              session.session_type === 'trial'
                ? 'SESSION_CHANGES.CANCEL.TEXT_TRIAL'
                : 'SESSION_CHANGES.CANCEL.TEXT',
            )}
          </p>
        </div>
      </div>

      <div className="cancelCalendarModal__reasons" role="radiogroup">
        <p className="cancelCalendarModal__label">
          {t('SESSION_CHANGES.CANCEL.WHY')}
        </p>
        <div className="cancelCalendarModal__chips">
          {reasons.map((key) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={reason === key}
              className={`cancelCalendarModal__chip${reason === key ? ' is-selected' : ''}`}
              onClick={() => setReason(key)}
            >
              {t(`SESSION_CHANGES.REASONS.${key.toUpperCase()}`)}
            </button>
          ))}
        </div>
      </div>

      <TextField
        className="cancelCalendarModal__note"
        size="small"
        fullWidth
        multiline
        minRows={2}
        label={t('SESSION_CHANGES.CANCEL.NOTE')}
        value={note}
        onChange={(event) => setNote(event.target.value.slice(0, NOTE_LENGTH))}
        inputProps={{ maxLength: NOTE_LENGTH, dir: 'auto' }}
      />

      {error && (
        <Alert severity="error" className="cancelCalendarModal__error">
          {error}
        </Alert>
      )}

      <div className="cancelCalendarModal__actions-container">
        <Button
          className="cancelCalendarModal__actions-container-action"
          variant="outlined"
          onClick={handleClose}
          disabled={cancel.isPending}
        >
          {t('SESSION_CHANGES.CANCEL.KEEP')}
        </Button>
        <Button
          className="cancelCalendarModal__actions-container-action"
          variant="contained"
          color="error"
          onClick={submit}
          disabled={!reason || cancel.isPending}
        >
          {t('SESSION_CHANGES.CANCEL.CONFIRM')}
        </Button>
      </div>
    </div>
  );
};

export default CancelSessionModal;
