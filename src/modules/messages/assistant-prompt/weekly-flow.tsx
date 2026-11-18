import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, CircularProgress } from '@mui/material';

import { changeErrorMessage } from '../../../hooks/useSessionChanges';
import type { WeeklyEntry } from '../../../hooks/useFreezes';
import {
  MAX_WEEKLY_ENTRIES,
  useProposeScheduleChange,
  useWeeklyOpenings,
  weeklyEntryLabel,
  weeklyHoursOf,
  weeklyPatternLabel,
  type WeeklyOpening,
} from '../../../hooks/useScheduleChanges';
import {
  addDays,
  formatDate,
  localTimeZone,
  today,
} from '../../trial/trial.types';
import type { PackageFlowProps } from './pause-flow';
import {
  Answer,
  Chip,
  Chips,
  DURATIONS,
  MIN_LEAD_DAYS,
  NoteField,
  Question,
  SubmitRow,
  dayChips,
} from './primitives';

const sameEntry = (a: WeeklyEntry, b: WeeklyEntry) =>
  a.wday === b.wday &&
  a.minute_of_day === b.minute_of_day &&
  a.duration_minutes === b.duration_minutes;

/** Change the weekly times: lesson length, the times, from when */
const WeeklyFlow: FC<PackageFlowProps> = ({
  pkg,
  locale,
  headers,
  onDone,
  onRefused,
}) => {
  const { t } = useTranslation();
  const propose = useProposeScheduleChange();
  const [duration, setDuration] = useState(60);
  const [picked, setPicked] = useState<WeeklyEntry[]>([]);
  const [timesDone, setTimesDone] = useState(false);
  const [effectiveFrom, setEffectiveFrom] = useState<string | undefined>();
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const openings = useWeeklyOpenings(pkg.tutor?.id, duration, true, headers);
  const minutes = (count: number) =>
    t('MYSESSIONS.MAIN.CARD.MINUTES_COUNT', { count });

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
  const dayName = (wday: number) =>
    weeklyEntryLabel(
      { wday, minute_of_day: 0, duration_minutes: 30 },
      locale,
      true,
    ).split(' ')[0];
  const timeOnly = (entry: WeeklyEntry) =>
    weeklyEntryLabel(entry, locale).split(' ').slice(1).join(' ');

  const submit = async () => {
    if (!effectiveFrom || !picked.length || propose.isPending) return;
    setError(null);
    try {
      await propose.mutateAsync({
        packageId: pkg.id,
        pattern: picked,
        effective_from: effectiveFrom,
        time_zone: localTimeZone(),
        note,
        headers,
      });
      onDone(t('SESSION_CHANGES.CHAT.PROMPT.DONE_WEEKLY'));
    } catch (err) {
      setError(changeErrorMessage(err, t('SESSION_CHANGES.WEEKLY.ERROR')));
      onRefused();
    }
  };

  const earliest = addDays(today(), MIN_LEAD_DAYS);

  return (
    <>
      {timesDone && (
        <Answer onClick={() => setTimesDone(false)}>
          {weeklyPatternLabel(picked, locale, minutes)}
        </Answer>
      )}

      {!timesDone && (
        <>
          <Question>{t('SESSION_CHANGES.CHAT.PROMPT.LESSON_LENGTH')}</Question>
          <Chips>
            {DURATIONS.map((value) => (
              <Chip
                key={value}
                selected={duration === value}
                onClick={() => {
                  setDuration(value);
                  setPicked([]);
                }}
              >
                {minutes(value)}
              </Chip>
            ))}
          </Chips>
          <Question>
            {t('SESSION_CHANGES.CHAT.PROMPT.PICK_WEEKLY', {
              max: MAX_WEEKLY_ENTRIES,
            })}
          </Question>
          {!pkg.tutor && (
            <Alert severity="info">
              {t('SESSION_CHANGES.WEEKLY.NO_TIMES')}
            </Alert>
          )}
          {openings.isLoading && <CircularProgress size={22} />}
          {openings.isError && (
            <Alert severity="error">
              {t('SESSION_CHANGES.WEEKLY.ERROR_LOADING')}
            </Alert>
          )}
          {openings.data && openings.data.length === 0 && (
            <Alert severity="info">
              {t('SESSION_CHANGES.WEEKLY.NO_TIMES')}
            </Alert>
          )}
          {byDay.map(([wday, list]) => (
            <div key={wday} className="assistant-prompt__day">
              <span className="assistant-prompt__day-name">
                {dayName(wday)}
              </span>
              <Chips>
                {list.map((item) => {
                  const selected = isPicked(item);
                  return (
                    <Chip
                      key={item.minute_of_day}
                      selected={selected}
                      disabled={
                        !selected && picked.length >= MAX_WEEKLY_ENTRIES
                      }
                      onClick={() => toggle(item)}
                      title={t('SESSION_CHANGES.WEEKLY.OPEN_WEEKS', {
                        open: item.open_weeks,
                        total: item.published_weeks,
                      })}
                    >
                      {timeOnly(item)}
                    </Chip>
                  );
                })}
              </Chips>
            </div>
          ))}
          {picked.length > 0 && (
            <p className="assistant-prompt__preview">
              {t('SESSION_CHANGES.WEEKLY.HOURS', {
                count: weeklyHoursOf(picked),
              })}
            </p>
          )}
          <SubmitRow
            label={t('SESSION_CHANGES.CHAT.PROMPT.NEXT')}
            onSubmit={() => setTimesDone(true)}
            pending={false}
            disabled={picked.length === 0}
          />
        </>
      )}

      {timesDone && (
        <>
          <Question>{t('SESSION_CHANGES.CHAT.PROMPT.FROM_WHEN')}</Question>
          <Chips>
            {dayChips(earliest).map((day) => (
              <Chip
                key={day}
                selected={effectiveFrom === day}
                onClick={() => setEffectiveFrom(day)}
              >
                {formatDate(day, locale)}
              </Chip>
            ))}
          </Chips>
          <NoteField value={note} onChange={setNote} />
          {error && <Alert severity="error">{error}</Alert>}
          <SubmitRow
            label={t('SESSION_CHANGES.CHAT.PROMPT.SEND_WEEKLY')}
            onSubmit={submit}
            pending={propose.isPending}
            disabled={!effectiveFrom}
          />
        </>
      )}
    </>
  );
};

export default WeeklyFlow;
