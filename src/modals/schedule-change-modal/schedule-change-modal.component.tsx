import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Button,
  CircularProgress,
  IconButton,
  TextField,
} from '@mui/material';
import { Close, EventRepeatRounded } from '@mui/icons-material';

import {
  MAX_WEEKLY_ENTRIES,
  useProposeScheduleChange,
  useWeeklyOpenings,
  weeklyEntryLabel,
  weeklyHoursOf,
  type WeeklyOpening,
} from '../../hooks/useScheduleChanges';
import type { WeeklyEntry } from '../../hooks/useFreezes';
import { changeErrorMessage } from '../../hooks/useSessionChanges';
import { addDays, localTimeZone, today } from '../../modules/trial/trial.types';
import type { Package } from '../../assets/types';

import './schedule-change-modal.styles.scss';

interface ScheduleChangeModalProps {
  packageData: Package;
  handleClose: () => void;
}

const DURATIONS = [30, 60, 90, 120];
const NOTE_LENGTH = 500;
/** The first day the new times can apply (ScheduleChangeRequest::MIN_LEAD) */
const MIN_LEAD_DAYS = 2;

const sameEntry = (a: WeeklyEntry, b: WeeklyEntry) =>
  a.wday === b.wday &&
  a.minute_of_day === b.minute_of_day &&
  a.duration_minutes === b.duration_minutes;

/**
 * Propose new weekly times for a package: the lesson length, the weekly
 * times the tutor is open for every week, up to three of them, the first
 * day they apply, a note. The other side approves and the future lessons
 * move; the hours a week stay the same.
 */
const ScheduleChangeModal: FC<ScheduleChangeModalProps> = ({
  packageData,
  handleClose,
}) => {
  const { t, i18n } = useTranslation();
  const locale = `${i18n.language}-u-nu-latn`;
  const propose = useProposeScheduleChange();
  const [duration, setDuration] = useState(60);
  const [picked, setPicked] = useState<WeeklyEntry[]>([]);
  const [effectiveFrom, setEffectiveFrom] = useState(
    addDays(today(), MIN_LEAD_DAYS),
  );
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const openings = useWeeklyOpenings(packageData.tutor.id, duration);

  const byDay = useMemo(() => {
    const map = new Map<number, WeeklyOpening[]>();
    (openings.data ?? [])
      .slice()
      .sort((a, b) => a.wday - b.wday || a.minute_of_day - b.minute_of_day)
      .forEach((item) =>
        map.set(item.wday, [...(map.get(item.wday) ?? []), item]),
      );
    return Array.from(map.entries());
  }, [openings.data]);

  const isPicked = (entry: WeeklyEntry) =>
    picked.some((p) => sameEntry(p, entry));
  const toggle = (entry: WeeklyEntry) => {
    setError(null);
    if (isPicked(entry)) setPicked(picked.filter((p) => !sameEntry(p, entry)));
    else if (picked.length < MAX_WEEKLY_ENTRIES) setPicked([...picked, entry]);
  };

  const changeDuration = (value: number) => {
    setDuration(value);
    setPicked([]);
  };

  const submit = async () => {
    setError(null);
    try {
      await propose.mutateAsync({
        packageId: packageData.id,
        pattern: picked,
        effective_from: effectiveFrom,
        time_zone: localTimeZone(),
        note,
      });
      handleClose();
    } catch (err) {
      setError(changeErrorMessage(err, t('SESSION_CHANGES.WEEKLY.ERROR')));
    }
  };

  const dayName = (wday: number) =>
    weeklyEntryLabel(
      { wday, minute_of_day: 0, duration_minutes: 30 },
      locale,
      true,
    ).split(' ')[0];

  return (
    <div className="weekly-modal">
      <header className="weekly-modal__header">
        <div className="weekly-modal__icon">
          <EventRepeatRounded />
        </div>
        <div className="weekly-modal__heading">
          <h4 className="weekly-modal__title">
            {t('SESSION_CHANGES.WEEKLY.TITLE')}
          </h4>
          <p className="weekly-modal__subtitle">
            {t('SESSION_CHANGES.WEEKLY.TEXT', {
              course: packageData.grade_subject.full_course_name,
              tz: localTimeZone(),
            })}
          </p>
        </div>
        <IconButton
          aria-label={t('SESSION_CHANGES.CLOSE')}
          className="weekly-modal__close"
          onClick={handleClose}
        >
          <Close />
        </IconButton>
      </header>

      <p className="weekly-modal__label">
        {t('SESSION_CHANGES.WEEKLY.LENGTH')}
      </p>
      <div className="weekly-modal__chips">
        {DURATIONS.map((value) => (
          <button
            key={value}
            type="button"
            className={`weekly-modal__chip${duration === value ? ' is-selected' : ''}`}
            aria-pressed={duration === value}
            onClick={() => changeDuration(value)}
          >
            {t('MYSESSIONS.MAIN.CARD.MINUTES_COUNT', { count: value })}
          </button>
        ))}
      </div>

      <p className="weekly-modal__label">
        {t('SESSION_CHANGES.WEEKLY.TIMES', {
          count: picked.length,
          max: MAX_WEEKLY_ENTRIES,
        })}
      </p>

      {openings.isLoading && (
        <div className="weekly-modal__loading">
          <CircularProgress size={28} />
        </div>
      )}
      {openings.isError && (
        <Alert severity="error">
          {t('SESSION_CHANGES.WEEKLY.ERROR_LOADING')}
        </Alert>
      )}
      {openings.data && openings.data.length === 0 && (
        <Alert severity="info">{t('SESSION_CHANGES.WEEKLY.NO_TIMES')}</Alert>
      )}

      {byDay.length > 0 && (
        <div className="weekly-modal__days">
          {byDay.map(([wday, list]) => (
            <div key={wday} className="weekly-modal__day">
              <span className="weekly-modal__day-name">{dayName(wday)}</span>
              <div className="weekly-modal__day-times">
                {list.map((item) => {
                  const selected = isPicked(item);
                  const full = !selected && picked.length >= MAX_WEEKLY_ENTRIES;
                  return (
                    <button
                      key={item.minute_of_day}
                      type="button"
                      className={`weekly-modal__time${selected ? ' is-selected' : ''}`}
                      aria-pressed={selected}
                      disabled={full}
                      aria-label={`${weeklyEntryLabel(item, locale)} · ${t(
                        'SESSION_CHANGES.WEEKLY.OPEN_WEEKS',
                        { open: item.open_weeks, total: item.published_weeks },
                      )}`}
                      title={t('SESSION_CHANGES.WEEKLY.OPEN_WEEKS', {
                        open: item.open_weeks,
                        total: item.published_weeks,
                      })}
                      onClick={() => toggle(item)}
                    >
                      {weeklyEntryLabel(item, locale)
                        .split(' ')
                        .slice(1)
                        .join(' ')}
                      {item.open_weeks < item.published_weeks && (
                        <span className="weekly-modal__weeks">
                          {item.open_weeks}/{item.published_weeks}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {picked.length > 0 && (
        <p className="weekly-modal__hours">
          {t('SESSION_CHANGES.WEEKLY.HOURS', { count: weeklyHoursOf(picked) })}
        </p>
      )}

      <TextField
        className="weekly-modal__from"
        size="small"
        type="date"
        label={t('SESSION_CHANGES.WEEKLY.FROM')}
        value={effectiveFrom}
        onChange={(event) => setEffectiveFrom(event.target.value)}
        inputProps={{ min: addDays(today(), MIN_LEAD_DAYS) }}
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        size="small"
        fullWidth
        multiline
        minRows={2}
        label={t('SESSION_CHANGES.WEEKLY.NOTE')}
        value={note}
        onChange={(event) => setNote(event.target.value.slice(0, NOTE_LENGTH))}
        inputProps={{ maxLength: NOTE_LENGTH, dir: 'auto' }}
      />

      {error && (
        <Alert severity="error" className="weekly-modal__error">
          {error}
        </Alert>
      )}

      <footer className="weekly-modal__footer">
        <Button
          variant="outlined"
          onClick={handleClose}
          disabled={propose.isPending}
        >
          {t('SESSION_CHANGES.CLOSE')}
        </Button>
        <Button
          variant="contained"
          onClick={submit}
          disabled={picked.length === 0 || !effectiveFrom || propose.isPending}
        >
          {t('SESSION_CHANGES.WEEKLY.SUBMIT')}
        </Button>
      </footer>
    </div>
  );
};

export default ScheduleChangeModal;
