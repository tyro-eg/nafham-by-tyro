import { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, CircularProgress, TextField } from '@mui/material';
import { AutoAwesomeRounded, RefreshRounded } from '@mui/icons-material';

import { linesToList, listToLines } from './assistant.utils';

interface PanelProps {
  title: string;
  chip?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** A white card with a heading row: title, optional chip, meta and actions */
export const Panel: FC<PanelProps> = ({
  title,
  chip,
  meta,
  actions,
  children,
  className,
}) => (
  <section className={`as-panel ${className ?? ''}`}>
    <div className="as-panel__head">
      <h3 className="as-panel__title">{title}</h3>
      {chip}
      {meta && <span className="as-panel__meta">{meta}</span>}
      {actions && <div className="as-panel__actions">{actions}</div>}
    </div>
    {children}
  </section>
);

export const AiChip: FC<{ label?: string }> = ({ label }) => {
  const { t } = useTranslation();
  return (
    <span className="as-chip as-chip--lilac">
      <AutoAwesomeRounded fontSize="inherit" />
      {label ?? t('ASSISTANT.COMMON.AI_DRAFT')}
    </span>
  );
};

export const StaleChip: FC = () => {
  const { t } = useTranslation();
  return (
    <span className="as-chip as-chip--sun">{t('ASSISTANT.COMMON.STALE')}</span>
  );
};

interface RefreshButtonProps {
  onClick: () => void;
  busy: boolean;
  label?: string;
  disabled?: boolean;
}

/** "Refresh" with a spinner while the backend is generating */
export const RefreshButton: FC<RefreshButtonProps> = ({
  onClick,
  busy,
  label,
  disabled,
}) => {
  const { t } = useTranslation();
  return (
    <Button
      size="small"
      variant="outlined"
      startIcon={
        busy ? (
          <CircularProgress size={16} color="inherit" />
        ) : (
          <RefreshRounded />
        )
      }
      onClick={onClick}
      disabled={busy || disabled}
    >
      {busy
        ? t('ASSISTANT.COMMON.GENERATING')
        : (label ?? t('ASSISTANT.COMMON.REFRESH'))}
    </Button>
  );
};

interface BulletsProps {
  items: string[];
  tone?: 'mint' | 'coral' | 'sky' | 'sun' | 'lilac';
  empty?: string;
}

export const Bullets: FC<BulletsProps> = ({ items, tone, empty }) => {
  if (!items.length) {
    return empty ? <p className="as-muted">{empty}</p> : null;
  }
  return (
    <ul className={`as-bullets${tone ? ` as-bullets--${tone}` : ''}`}>
      {items.map((item, index) => (
        <li key={`${index}-${item}`} dir="auto">
          {item}
        </li>
      ))}
    </ul>
  );
};

interface ListFieldProps {
  label: string;
  value: string[];
  onChange: (items: string[]) => void;
  minRows?: number;
  hint?: string;
}

/** A multiline field where each line is one list item */
export const ListField: FC<ListFieldProps> = ({
  label,
  value,
  onChange,
  minRows = 3,
  hint,
}) => {
  const { t } = useTranslation();
  return (
    <TextField
      multiline
      minRows={minRows}
      fullWidth
      label={label}
      helperText={hint ?? t('ASSISTANT.COMMON.ONE_PER_LINE')}
      defaultValue={listToLines(value)}
      onBlur={(e) => onChange(linesToList(e.target.value))}
      inputProps={{ dir: 'auto' }}
    />
  );
};

interface EmptyProps {
  title: string;
  text: string;
  action?: ReactNode;
}

export const EmptyTab: FC<EmptyProps> = ({ title, text, action }) => (
  <div className="as-panel as-panel--empty">
    <AutoAwesomeRounded className="as-empty__icon" />
    <h3 className="as-empty__title">{title}</h3>
    <p className="as-empty__text">{text}</p>
    {action}
  </div>
);
