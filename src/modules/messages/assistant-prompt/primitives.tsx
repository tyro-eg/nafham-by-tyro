import { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, CircularProgress, TextField } from '@mui/material';
import { ArrowBackRounded, CheckCircleRounded } from '@mui/icons-material';

import type { PromptParams } from '../../../hooks/useChatPrompt';
import type { ChatConversationActions } from '../../../hooks/useChatAction';
import type { ChangeHeaders } from '../../../hooks/useSessionChanges';
import { addDays } from '../../trial/trial.types';

/**
 * The pieces every assistant flow is built from: a question, the chips
 * that answer it, the folded answer that reopens a step, the optional
 * note and the submit row. Pure presentation; the flows hold the state.
 */

export const NOTE_LENGTH = 500;
export const DURATIONS = [30, 60, 90, 120];
export const WEEKS = [1, 2, 3, 4];
/** The first day new weekly times can apply (ScheduleChangeRequest::MIN_LEAD) */
export const MIN_LEAD_DAYS = 2;
/** How long the done line stays before the bubble goes */
export const DONE_MS = 1800;

export const Question: FC<{ children: ReactNode }> = ({ children }) => (
  <p className="assistant-prompt__question">{children}</p>
);

interface ChipProps {
  selected?: boolean;
  disabled?: boolean;
  danger?: boolean;
  onClick: () => void;
  children: ReactNode;
  title?: string;
}

export const Chip: FC<ChipProps> = ({
  selected,
  disabled,
  danger,
  onClick,
  children,
  title,
}) => (
  <button
    type="button"
    className={`assistant-prompt__chip${selected ? ' is-selected' : ''}${danger ? ' is-danger' : ''}`}
    aria-pressed={selected}
    disabled={disabled}
    title={title}
    onClick={onClick}
  >
    {children}
  </button>
);

export const Chips: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="assistant-prompt__chips">{children}</div>
);

/** An answered step, folded into a pill that reopens it (unless there was no choice) */
export const Answer: FC<{
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}> = ({ onClick, disabled, children }) => (
  <button
    type="button"
    className="assistant-prompt__answer"
    disabled={disabled}
    onClick={onClick}
  >
    <CheckCircleRounded aria-hidden="true" />
    {children}
  </button>
);

interface NoteFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const NoteField: FC<NoteFieldProps> = ({ value, onChange }) => {
  const { t } = useTranslation();
  return (
    <TextField
      className="assistant-prompt__note"
      size="small"
      fullWidth
      multiline
      minRows={1}
      maxRows={3}
      placeholder={t('SESSION_CHANGES.CHAT.PROMPT.NOTE')}
      value={value}
      onChange={(event) => onChange(event.target.value.slice(0, NOTE_LENGTH))}
      inputProps={{ maxLength: NOTE_LENGTH, dir: 'auto' }}
    />
  );
};

interface SubmitRowProps {
  label: string;
  onSubmit: () => void;
  pending: boolean;
  disabled?: boolean;
  danger?: boolean;
  onBack?: () => void;
}

export const SubmitRow: FC<SubmitRowProps> = ({
  label,
  onSubmit,
  pending,
  disabled,
  danger,
  onBack,
}) => {
  const { t } = useTranslation();
  return (
    <div className="assistant-prompt__submit">
      <Button
        size="small"
        variant="contained"
        color={danger ? 'error' : 'primary'}
        disabled={disabled || pending}
        startIcon={
          pending ? <CircularProgress size={16} color="inherit" /> : undefined
        }
        onClick={onSubmit}
      >
        {label}
      </Button>
      {onBack && (
        <Button
          size="small"
          variant="text"
          disabled={pending}
          startIcon={
            <ArrowBackRounded className="assistant-prompt__back-icon" />
          }
          onClick={onBack}
        >
          {t('SESSION_CHANGES.CHAT.PROMPT.BACK')}
        </Button>
      )}
    </div>
  );
};

/** The first allowed day and the six after it, as "Wed 11 Nov" chips */
export const dayChips = (first: string) =>
  Array.from({ length: 7 }, (_, index) => addDays(first, index));

export interface FlowProps {
  data: ChatConversationActions;
  params: PromptParams;
  locale: string;
  /** A parent acting for the child names the child on every call */
  headers?: ChangeHeaders;
  onDone: (message: string) => void;
  /** The server refused: what the chat offers may have changed, re-read it */
  onRefused: () => void;
}
