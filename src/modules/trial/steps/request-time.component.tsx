import { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuItem, TextField } from '@mui/material';

import {
  dayOf,
  daysBetween,
  formatDate,
  formatTime,
  localTimeZone,
  startTimesOn,
} from '../trial.types';

interface RequestTimeProps {
  /** The search's first and last local day, yyyy-mm-dd */
  from: string;
  to: string;
  /** Local hours a trial may start in */
  window: { start: number; end: number };
  /** The chosen start, ISO */
  value?: string;
  onChange: (startTime: string) => void;
}

/**
 * One start time for a request, in 30-minute steps in the family's zone:
 * a day of the search's range, then a time inside the time window. The
 * first possible time is picked straight away.
 */
const RequestTime: FC<RequestTimeProps> = ({
  from,
  to,
  window,
  value,
  onChange,
}) => {
  const { t, i18n } = useTranslation();
  const locale = `${i18n.language}-u-nu-latn`;

  // Only the days that still have a time far enough ahead
  const days = useMemo(
    () =>
      daysBetween(from, to)
        .map((day) => ({ day, times: startTimesOn(day, window) }))
        .filter((entry) => entry.times.length > 0),
    [from, to, window],
  );
  const [dayChoice, setDayChoice] = useState<string | undefined>(
    value ? dayOf(value) : undefined,
  );
  const entry =
    days.find((item) => item.day === dayChoice) ?? days[0] ?? undefined;
  const valid = !!value && !!entry?.times.includes(value);

  // Keep a valid choice: the first time of the day shown
  useEffect(() => {
    if (entry && !valid) onChange(entry.times[0]);
  }, [entry, valid, onChange]);

  if (!entry) {
    return <p className="trial__hint">{t('TRIAL.MATCH.NO_TIMES')}</p>;
  }

  return (
    <div className="trial-ask">
      <div className="trial-ask__fields">
        <TextField
          select
          size="small"
          label={t('TRIAL.MATCH.DAY')}
          value={entry.day}
          onChange={(event) => {
            const day = event.target.value;
            setDayChoice(day);
            const next = days.find((item) => item.day === day);
            if (next) onChange(next.times[0]);
          }}
        >
          {days.map((item) => (
            <MenuItem key={item.day} value={item.day}>
              {formatDate(item.day, locale)}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label={t('TRIAL.MATCH.TIME')}
          value={valid ? value : entry.times[0]}
          onChange={(event) => onChange(event.target.value)}
        >
          {entry.times.map((time) => (
            <MenuItem key={time} value={time}>
              {formatTime(time, locale)}
            </MenuItem>
          ))}
        </TextField>
      </div>
      <p className="trial-ask__zone">
        {t('TRIAL.WHEN.TIMEZONE', { tz: localTimeZone() })}
      </p>
    </div>
  );
};

export default RequestTime;
