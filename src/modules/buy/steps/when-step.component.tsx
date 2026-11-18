import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, TextField } from '@mui/material';
import {
  ArrowBackRounded,
  ArrowForwardRounded,
  NightsStayRounded,
  WbSunnyRounded,
  WbTwilightRounded,
} from '@mui/icons-material';

import {
  LESSONS_PER_WEEK,
  SCHEDULE_DAYS,
  SCHEDULE_WINDOWS,
  WINDOW_HOURS,
  dayName,
  scheduleIsEmpty,
  type ScheduleDay,
  type ScheduleWindow,
  type WeeklySchedule,
} from '../../../lib/weekly-schedule';

interface WhenStepProps {
  schedule: WeeklySchedule;
  onChange: (schedule: WeeklySchedule) => void;
  onBack: () => void;
  onNext: () => void;
}

const WINDOW_ICONS: Record<ScheduleWindow, JSX.Element> = {
  morning: <WbTwilightRounded />,
  afternoon: <WbSunnyRounded />,
  evening: <NightsStayRounded />,
};

const hours = (start: number, end: number) =>
  `${String(start).padStart(2, '0')}:00 – ${String(end).padStart(2, '0')}:00`;

const toggle = <T,>(list: T[], item: T): T[] =>
  list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

/**
 * The weekly times: days, parts of the day, lessons a week, a note. They
 * rank the tutors by free slots, go to support with the booking request,
 * and are what ops match a tutor against when the parent lets Nafham choose.
 */
const WhenStep: FC<WhenStepProps> = ({
  schedule,
  onChange,
  onBack,
  onNext,
}) => {
  const { t, i18n } = useTranslation();
  const locale = `${i18n.language}-u-nu-latn`;
  const empty = scheduleIsEmpty(schedule);

  const chip = (
    key: string,
    selected: boolean,
    label: string,
    onClick: () => void,
    extra?: JSX.Element,
  ) => (
    <button
      key={key}
      type="button"
      className={`trial-choice__item ${selected ? 'is-selected' : ''}`}
      aria-pressed={selected}
      onClick={onClick}
    >
      {extra && <span className="trial-choice__icon">{extra}</span>}
      <span className="trial-choice__text">
        <span className="trial-choice__name">{label}</span>
      </span>
    </button>
  );

  return (
    <div className="trial__step">
      <h2 className="trial__step-title">{t('BUY.WHEN.TITLE')}</h2>
      <p className="trial__hint">{t('BUY.WHEN.TEXT')}</p>

      <div className="trial-choice">
        <p className="trial-choice__label">{t('BUY.WHEN.DAYS')}</p>
        <div className="trial-choice__list trial-choice__list--chips buy-days">
          {SCHEDULE_DAYS.map((day: ScheduleDay) =>
            chip(day, schedule.days.includes(day), dayName(day, locale), () =>
              onChange({ ...schedule, days: toggle(schedule.days, day) }),
            ),
          )}
        </div>
      </div>

      <div className="trial-choice">
        <p className="trial-choice__label">{t('BUY.WHEN.WINDOWS')}</p>
        <div className="trial-choice__list trial-choice__list--tiles">
          {SCHEDULE_WINDOWS.map((window: ScheduleWindow) => {
            const selected = schedule.windows.includes(window);
            return (
              <button
                key={window}
                type="button"
                className={`trial-choice__item ${selected ? 'is-selected' : ''}`}
                aria-pressed={selected}
                onClick={() =>
                  onChange({
                    ...schedule,
                    windows: toggle(schedule.windows, window),
                  })
                }
              >
                <span className="trial-choice__icon">
                  {WINDOW_ICONS[window]}
                </span>
                <span className="trial-choice__text">
                  <span className="trial-choice__name">
                    {t(`BUY.WHEN.${window.toUpperCase()}`)}
                  </span>
                  <span className="trial-choice__hint">
                    {hours(
                      WINDOW_HOURS[window].start,
                      WINDOW_HOURS[window].end,
                    )}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="trial-choice">
        <p className="trial-choice__label">{t('BUY.WHEN.LESSONS')}</p>
        <div className="trial-choice__list trial-choice__list--chips">
          {LESSONS_PER_WEEK.map((count) =>
            chip(
              String(count),
              schedule.lessons_per_week === count,
              t('BUY.WHEN.LESSONS_COUNT', { count }),
              () =>
                onChange({
                  ...schedule,
                  lessons_per_week:
                    schedule.lessons_per_week === count ? undefined : count,
                }),
            ),
          )}
        </div>
      </div>

      <TextField
        label={t('BUY.WHEN.NOTE')}
        helperText={t('BUY.WHEN.NOTE_HINT')}
        value={schedule.note ?? ''}
        onChange={(event) =>
          onChange({ ...schedule, note: event.target.value.slice(0, 500) })
        }
        multiline
        minRows={2}
        fullWidth
      />

      <p className="trial__hint">
        {t('BUY.WHEN.TIMEZONE', { tz: schedule.time_zone })}
        {empty && ` ${t('BUY.WHEN.MATCH_HINT')}`}
      </p>

      <div className="trial__actions">
        <Button
          className="trial__back"
          variant="outlined"
          startIcon={<ArrowBackRounded />}
          onClick={onBack}
        >
          {t('BUY.ACTIONS.BACK')}
        </Button>
        <Button
          className="trial__cta"
          variant="contained"
          endIcon={<ArrowForwardRounded />}
          onClick={onNext}
        >
          {empty ? t('BUY.ACTIONS.SKIP') : t('BUY.ACTIONS.NEXT')}
        </Button>
      </div>
    </div>
  );
};

export default WhenStep;
