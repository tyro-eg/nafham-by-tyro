import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Chip, TextField } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';

import {
  MAX_DAYS,
  TIME_WINDOWS,
  addDays,
  localTimeZone,
  tomorrow,
  type TimeWindow,
} from '../trial.types';

interface WhenStepProps {
  from: string;
  to: string;
  window: TimeWindow;
  onChange: (patch: {
    from?: string;
    to?: string;
    window?: TimeWindow;
  }) => void;
  onBack: () => void;
  onNext: () => void;
}

const WINDOWS = Object.keys(TIME_WINDOWS) as TimeWindow[];

/** The dates and the time of day the student can make */
const WhenStep: FC<WhenStepProps> = ({
  from,
  to,
  window,
  onChange,
  onBack,
  onNext,
}) => {
  const { t } = useTranslation();
  const earliest = tomorrow();
  const latest = addDays(earliest, MAX_DAYS);
  const valid = from >= earliest && to > from && to <= latest;

  return (
    <div className="trial__step">
      <h2 className="trial__step-title">{t('TRIAL.WHEN.TITLE')}</h2>
      <div className="trial__fields trial__fields--row">
        <TextField
          size="small"
          type="date"
          label={t('TRIAL.WHEN.FROM')}
          value={from}
          onChange={(event) => onChange({ from: event.target.value })}
          inputProps={{ min: earliest, max: latest }}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <TextField
          size="small"
          type="date"
          label={t('TRIAL.WHEN.TO')}
          value={to}
          onChange={(event) => onChange({ to: event.target.value })}
          inputProps={{ min: from, max: latest }}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
      </div>
      <p className="trial__label">{t('TRIAL.WHEN.WINDOW')}</p>
      <div className="trial__chips">
        {WINDOWS.map((key) => (
          <Chip
            key={key}
            label={t(`TRIAL.WHEN.${key.toUpperCase()}`)}
            color={key === window ? 'primary' : 'default'}
            variant={key === window ? 'filled' : 'outlined'}
            onClick={() => onChange({ window: key })}
          />
        ))}
      </div>
      <p className="trial__hint">
        {t('TRIAL.WHEN.TIMEZONE', { tz: localTimeZone() })}
      </p>
      <div className="trial__actions">
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={onBack}>
          {t('TRIAL.ACTIONS.BACK')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          endIcon={<ArrowForward />}
          disabled={!valid}
          onClick={onNext}
        >
          {t('TRIAL.ACTIONS.NEXT')}
        </Button>
      </div>
    </div>
  );
};

export default WhenStep;
