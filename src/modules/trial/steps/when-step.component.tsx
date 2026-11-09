import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, TextField } from '@mui/material';
import {
  AllInclusiveRounded,
  ArrowBackRounded,
  ArrowForwardRounded,
  DateRangeRounded,
  EventAvailableRounded,
  NightsStayRounded,
  TodayRounded,
  WbSunnyRounded,
  WbTwilightRounded,
  EditCalendarRounded,
} from '@mui/icons-material';

import {
  FLEXIBLE_DAYS,
  MAX_DAYS,
  TIME_WINDOWS,
  addDays,
  formatDate,
  localTimeZone,
  today,
  tomorrow,
  type DayChoice,
  type TimeWindow,
} from '../trial.types';
import ChoiceChips from './choice-chips.component';

interface WhenStepProps {
  day: DayChoice;
  date: string;
  window: TimeWindow;
  onChange: (patch: {
    day?: DayChoice;
    date?: string;
    window?: TimeWindow;
  }) => void;
  onBack: () => void;
  onNext: () => void;
}

const WINDOW_ICONS: Record<TimeWindow, JSX.Element> = {
  any: <AllInclusiveRounded />,
  morning: <WbTwilightRounded />,
  afternoon: <WbSunnyRounded />,
  evening: <NightsStayRounded />,
};

const hours = (start: number, end: number) =>
  `${String(start).padStart(2, '0')}:00 – ${String(end === 24 ? 0 : end).padStart(2, '0')}:00`;

/** The day (today, tomorrow, a date, or any day soon) and the time of day */
const WhenStep: FC<WhenStepProps> = ({
  day,
  date,
  window,
  onChange,
  onBack,
  onNext,
}) => {
  const { t, i18n } = useTranslation();
  const locale = `${i18n.language}-u-nu-latn`;
  const latest = addDays(today(), MAX_DAYS);
  const dateValid = day !== 'date' || (date >= today() && date <= latest);

  const days = [
    {
      id: 'today' as DayChoice,
      label: t('TRIAL.WHEN.TODAY'),
      icon: <TodayRounded />,
      hint: formatDate(today(), locale),
    },
    {
      id: 'tomorrow' as DayChoice,
      label: t('TRIAL.WHEN.TOMORROW'),
      icon: <EventAvailableRounded />,
      hint: formatDate(tomorrow(), locale),
    },
    {
      id: 'date' as DayChoice,
      label: t('TRIAL.WHEN.DATE'),
      icon: <EditCalendarRounded />,
      hint:
        day === 'date' ? formatDate(date, locale) : t('TRIAL.WHEN.DATE_HINT'),
    },
    {
      id: 'flexible' as DayChoice,
      label: t('TRIAL.WHEN.FLEXIBLE'),
      icon: <DateRangeRounded />,
      hint: t('TRIAL.WHEN.FLEXIBLE_HINT', { days: FLEXIBLE_DAYS }),
    },
  ];

  // The rail keeps "Morning (6–12)"; the tile shows the hours as its hint
  const windows = (Object.keys(TIME_WINDOWS) as TimeWindow[]).map((key) => ({
    id: key,
    label: t(`TRIAL.WHEN.${key.toUpperCase()}`).replace(/\s*\(.*\)\s*$/, ''),
    icon: WINDOW_ICONS[key],
    hint:
      key === 'any'
        ? t('TRIAL.WHEN.ANY_HINT')
        : hours(TIME_WINDOWS[key].start, TIME_WINDOWS[key].end),
  }));

  return (
    <div className="trial__step">
      <h2 className="trial__step-title">{t('TRIAL.WHEN.TITLE')}</h2>

      <ChoiceChips
        label={t('TRIAL.WHEN.DAY')}
        choices={days}
        value={day}
        variant="tiles"
        onPick={(id) => onChange({ day: id as DayChoice })}
      />
      {day === 'date' && (
        <div className="trial__dates">
          <TextField
            type="date"
            label={t('TRIAL.WHEN.DATE')}
            value={date}
            onChange={(event) => onChange({ date: event.target.value })}
            inputProps={{ min: today(), max: latest }}
            InputLabelProps={{ shrink: true }}
            autoFocus
            fullWidth
          />
        </div>
      )}

      <ChoiceChips
        label={t('TRIAL.WHEN.WINDOW')}
        choices={windows}
        value={window}
        variant="tiles"
        onPick={(id) => onChange({ window: id as TimeWindow })}
      />

      <p className="trial__hint">
        {t('TRIAL.WHEN.TIMEZONE', { tz: localTimeZone() })}
      </p>

      <div className="trial__actions">
        <Button
          className="trial__back"
          variant="outlined"
          startIcon={<ArrowBackRounded />}
          onClick={onBack}
        >
          {t('TRIAL.ACTIONS.BACK')}
        </Button>
        <Button
          className="trial__cta"
          variant="contained"
          endIcon={<ArrowForwardRounded />}
          disabled={!dateValid}
          onClick={onNext}
        >
          {t('TRIAL.ACTIONS.NEXT')}
        </Button>
      </div>
    </div>
  );
};

export default WhenStep;
