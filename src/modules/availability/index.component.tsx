import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { addDays } from 'date-fns';
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Select,
  Skeleton,
  Switch,
  Tooltip,
} from '@mui/material';
import {
  ChevronLeftRounded,
  ChevronRightRounded,
  ContentCopyRounded,
  EventRepeatRounded,
  InfoOutlined,
  SaveRounded,
} from '@mui/icons-material';

import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import {
  fetchTutorAvailabilities,
  useSaveAvailability,
  useTutorAvailabilities,
  type RawAvailability,
} from '../../hooks/useCalendar';
import { useRtlClass } from '../../assets/utils/utils';
import { snackActions } from '../../assets/utils/toaster';
import AvailabilityGrid, {
  type DayAction,
} from './availability-grid.component';
import {
  DAY_PRESETS,
  SLOTS_PER_DAY,
  SLOT_MINUTES,
  applyPaint,
  cellState,
  gridRows,
  hoursFromSlots,
  isOpen,
  nextEditableSlot,
  paintModeFor,
  pendingCounts,
  slotDate,
  slotEnd,
  slotKey,
  togglePending,
  weekDays,
  weekStartFor,
  weekSummary,
  type PaintMode,
  type Pending,
  type SavedMap,
  type SavedSlot,
} from './availability.utils';

import './availability.styles.scss';

const toSaved = (record: RawAvailability): SavedSlot => ({
  id: record.id,
  key: new Date(record.start_time).toISOString(),
  status: record.status,
});

const errorText = (error: unknown, fallback: string): string => {
  const data = (error as { response?: { data?: unknown } })?.response?.data;
  if (data && typeof data === 'object') {
    const errors = (data as { errors?: unknown }).errors;
    if (Array.isArray(errors) && errors.length) return errors.join(' ');
    const message = (data as { error?: unknown }).error;
    if (typeof message === 'string') return message;
  }
  return fallback;
};

/**
 * Instructor availability editor: a weekly grid of 30-minute slots that can
 * be painted, filled per day with presets, copied from last week or repeated
 * for the coming weeks. Changes are kept locally until saved.
 */
const AvailabilityPage: FC = () => {
  const { t, i18n } = useTranslation();
  const rtlClass = useRtlClass();
  const currentUser = useAppSelector(selectCurrentUser);
  const tutorId = currentUser?.id;

  const today = useMemo(() => new Date(), []);
  const [weekStart, setWeekStart] = useState(() => weekStartFor(today));
  const [showNight, setShowNight] = useState(false);
  const [pending, setPending] = useState<Pending>(new Map());
  const [saved, setSaved] = useState<SavedMap>(new Map());
  const [repeatWeeks, setRepeatWeeks] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const days = useMemo(() => weekDays(weekStart), [weekStart]);
  const rows = useMemo(() => gridRows(showNight), [showNight]);
  const allRows = useMemo(() => gridRows(true), []);
  const editableFrom = useMemo(() => nextEditableSlot(today), [today]);

  // Fetch a day either side so time zones never cut the week short
  const range = useMemo(
    () => ({
      from: addDays(weekStart, -1).toISOString(),
      to: addDays(weekStart, 8).toISOString(),
    }),
    [weekStart],
  );
  const { data: records, isLoading } = useTutorAvailabilities(
    tutorId,
    range.from,
    range.to,
  );
  const save = useSaveAvailability();

  // Merge fetched slots into the saved map (slots from other weeks stay known)
  useEffect(() => {
    if (!records) return;
    setSaved((prev) => {
      const next = new Map(prev);
      const start = addDays(weekStart, -1).getTime();
      const end = addDays(weekStart, 8).getTime();
      next.forEach((_slot, key) => {
        const time = new Date(key).getTime();
        if (time >= start && time < end) next.delete(key);
      });
      records.forEach((record) => {
        const slot = toSaved(record);
        next.set(slot.key, slot);
      });
      return next;
    });
  }, [records, weekStart]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (pending.size === 0) return undefined;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [pending.size]);

  const isPast = useCallback(
    (key: string) => new Date(key) < editableFrom,
    [editableFrom],
  );

  const cellInfo = useCallback(
    (key: string) => {
      const slot = saved.get(key);
      return {
        state: cellState(slot, pending.get(key), isPast(key)),
        hadSlot: !!slot,
      };
    },
    [saved, pending, isPast],
  );

  const modeFor = useCallback(
    (key: string) => paintModeFor(cellInfo(key).state),
    [cellInfo],
  );

  const paint = useCallback(
    (key: string, mode: PaintMode) =>
      setPending((prev) =>
        applyPaint(prev, key, saved.get(key), isPast(key), mode),
      ),
    [saved, isPast],
  );

  const toggle = useCallback(
    (key: string) =>
      setPending((prev) =>
        togglePending(prev, key, saved.get(key), isPast(key)),
      ),
    [saved, isPast],
  );

  /** Paint every slot of a day between two minutes-from-midnight bounds */
  const paintDayRange = (
    base: Pending,
    day: Date,
    start: number,
    end: number,
    mode: PaintMode,
  ) => {
    let next = base;
    for (let minutes = start; minutes < end; minutes += SLOT_MINUTES) {
      const key = slotKey(slotDate(day, minutes));
      next = applyPaint(next, key, saved.get(key), isPast(key), mode);
    }
    return next;
  };

  const handleDayAction = (dayIndex: number, action: DayAction) => {
    const day = days[dayIndex];
    setPending((prev) => {
      if (action === 'clear') {
        return paintDayRange(
          prev,
          day,
          0,
          SLOTS_PER_DAY * SLOT_MINUTES,
          'remove',
        );
      }
      if (action === 'copy_to_week') {
        // Make every other day of the week look like this one
        let next = prev;
        allRows.forEach((minutes) => {
          const sourceKey = slotKey(slotDate(day, minutes));
          const open = isOpen(
            cellState(saved.get(sourceKey), prev.get(sourceKey), false),
          );
          days.forEach((other, index) => {
            if (index === dayIndex) return;
            const key = slotKey(slotDate(other, minutes));
            next = applyPaint(
              next,
              key,
              saved.get(key),
              isPast(key),
              open ? 'add' : 'remove',
            );
          });
        });
        return next;
      }
      const preset = DAY_PRESETS[action];
      return paintDayRange(prev, day, preset.start, preset.end, 'add');
    });
  };

  /** Open everything last week was open at, where this week is still empty */
  const copyLastWeek = async () => {
    if (!tutorId) return;
    setBusy(true);
    try {
      const lastWeek = addDays(weekStart, -7);
      const previous = await fetchTutorAvailabilities(
        tutorId,
        addDays(lastWeek, -1).toISOString(),
        addDays(lastWeek, 8).toISOString(),
      );
      let added = 0;
      setPending((prev) => {
        let next = prev;
        previous.forEach((record) => {
          const source = new Date(record.start_time);
          if (source < lastWeek || source >= weekStart) return;
          const key = slotKey(addDays(source, 7));
          const before = next;
          next = applyPaint(next, key, saved.get(key), isPast(key), 'add');
          if (next !== before) added += 1;
        });
        return next;
      });
      // setPending runs synchronously here, so the count is ready
      if (added === 0) snackActions.info(t('AVAILABILITY.COPY_PREV_NONE'));
    } catch (error) {
      snackActions.error(errorText(error, t('AVAILABILITY.LOAD_FAILED')));
    } finally {
      setBusy(false);
    }
  };

  /** Create this week's open slots again for the next N weeks */
  const repeatWeek = async () => {
    if (!tutorId || !repeatWeeks) return;
    const weeks = repeatWeeks;
    setRepeatWeeks(null);
    setBusy(true);
    try {
      const weekEnd = addDays(weekStart, 7);
      const pattern: Date[] = [];
      saved.forEach((slot) => {
        const date = new Date(slot.key);
        if (date >= weekStart && date < weekEnd) pattern.push(date);
      });
      if (pattern.length === 0) {
        snackActions.warning(t('AVAILABILITY.REPEAT.NONE'));
        return;
      }

      const add: { start_time: string; end_time: string }[] = [];
      for (let week = 1; week <= weeks; week += 1) {
        const targetStart = addDays(weekStart, 7 * week);
        const existing = await fetchTutorAvailabilities(
          tutorId,
          addDays(targetStart, -1).toISOString(),
          addDays(targetStart, 8).toISOString(),
        );
        const taken = new Set(
          existing.map((record) => new Date(record.start_time).toISOString()),
        );
        pattern.forEach((date) => {
          const target = addDays(date, 7 * week);
          const key = slotKey(target);
          if (target < editableFrom || taken.has(key)) return;
          add.push({ start_time: key, end_time: slotKey(slotEnd(target)) });
        });
      }

      if (add.length === 0) {
        snackActions.info(t('AVAILABILITY.REPEAT.ALL_EXIST'));
        return;
      }
      await save.mutateAsync({ add, removeIds: [] });
      snackActions.success(
        t('AVAILABILITY.REPEAT.DONE', { count: add.length, weeks }),
      );
    } catch (error) {
      snackActions.error(errorText(error, t('AVAILABILITY.SAVE_FAILED')));
    } finally {
      setBusy(false);
    }
  };

  const handleSave = async () => {
    const add: { start_time: string; end_time: string }[] = [];
    const removeIds: number[] = [];
    pending.forEach((change, key) => {
      if (change === 'add') {
        add.push({
          start_time: key,
          end_time: slotKey(slotEnd(new Date(key))),
        });
      } else {
        const slot = saved.get(key);
        if (slot) removeIds.push(slot.id);
      }
    });
    try {
      await save.mutateAsync({ add, removeIds });
      setPending(new Map());
      snackActions.success(t('AVAILABILITY.SAVED'));
    } catch (error) {
      snackActions.error(errorText(error, t('AVAILABILITY.SAVE_FAILED')));
    }
  };

  const counts = pendingCounts(pending);
  const hasPending = pending.size > 0;
  const summary = weekSummary(saved, weekStart);
  const thisWeek = weekStartFor(today).getTime() === weekStart.getTime();
  const weekLabel = useMemo(() => {
    const format = new Intl.DateTimeFormat(i18n.language, {
      month: 'short',
      day: 'numeric',
    });
    return `${format.format(weekStart)} – ${format.format(addDays(weekStart, 6))}`;
  }, [weekStart, i18n.language]);
  const timeZone = useMemo(() => {
    const offset = -new Date().getTimezoneOffset() / 60;
    const sign = offset >= 0 ? '+' : '-';
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return `${zone}, GMT${sign}${Math.abs(offset)}`;
  }, []);
  const dayLocked = (dayIndex: number) =>
    slotDate(days[dayIndex], SLOTS_PER_DAY * SLOT_MINUTES - SLOT_MINUTES) <
    editableFrom;

  return (
    <div className={`availability-page ${rtlClass}`}>
      <div className="container av-container">
        <header className="av-header">
          <div>
            <h1 className="av-header__title">{t('AVAILABILITY.TITLE')}</h1>
            <p className="av-header__subtitle">{t('AVAILABILITY.SUBTITLE')}</p>
          </div>
          <p className="av-header__zone">
            <InfoOutlined fontSize="inherit" aria-hidden />
            {t('AVAILABILITY.TIMEZONE', { tz: timeZone })}
          </p>
        </header>

        <div className="av-toolbar">
          <div className="av-toolbar__week">
            <IconButton
              aria-label={t('AVAILABILITY.PREV_WEEK')}
              onClick={() => setWeekStart((w) => addDays(w, -7))}
              className="av-flip"
            >
              <ChevronLeftRounded />
            </IconButton>
            <span className="av-toolbar__label">{weekLabel}</span>
            <IconButton
              aria-label={t('AVAILABILITY.NEXT_WEEK')}
              onClick={() => setWeekStart((w) => addDays(w, 7))}
              className="av-flip"
            >
              <ChevronRightRounded />
            </IconButton>
            {!thisWeek && (
              <Button
                size="small"
                variant="text"
                onClick={() => setWeekStart(weekStartFor(today))}
              >
                {t('AVAILABILITY.THIS_WEEK')}
              </Button>
            )}
          </div>

          <div className="av-toolbar__actions">
            <Tooltip title={t('AVAILABILITY.COPY_PREV_HINT')}>
              <span>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ContentCopyRounded />}
                  disabled={busy || isLoading}
                  onClick={copyLastWeek}
                >
                  {t('AVAILABILITY.COPY_PREV_WEEK')}
                </Button>
              </span>
            </Tooltip>
            <Tooltip
              title={
                hasPending
                  ? t('AVAILABILITY.REPEAT.SAVE_FIRST')
                  : t('AVAILABILITY.REPEAT.HINT')
              }
            >
              <span>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<EventRepeatRounded />}
                  disabled={busy || isLoading || hasPending}
                  onClick={() => setRepeatWeeks(1)}
                >
                  {t('AVAILABILITY.REPEAT.BUTTON')}
                </Button>
              </span>
            </Tooltip>
            <FormControlLabel
              className="av-toolbar__night"
              control={
                <Switch
                  size="small"
                  checked={showNight}
                  onChange={(e) => setShowNight(e.target.checked)}
                />
              }
              label={t('AVAILABILITY.SHOW_NIGHT')}
            />
          </div>
        </div>

        <div className="av-summary">
          {isLoading ? (
            <Skeleton width={220} height={32} />
          ) : (
            <>
              <Chip
                className="av-summary__chip av-summary__chip--open"
                label={t('AVAILABILITY.STATS.OPEN', {
                  hours: hoursFromSlots(summary.open),
                })}
              />
              <Chip
                className="av-summary__chip av-summary__chip--booked"
                label={t('AVAILABILITY.STATS.BOOKED', {
                  hours: hoursFromSlots(summary.booked),
                })}
              />
            </>
          )}
          <ul className="av-legend" aria-label={t('AVAILABILITY.LEGEND.TITLE')}>
            {(['available', 'reserved', 'adding', 'removing'] as const).map(
              (state) => (
                <li key={state} className="av-legend__item">
                  <span className={`av-legend__swatch av-cell--${state}`} />
                  {t(`AVAILABILITY.STATE.${state.toUpperCase()}`)}
                </li>
              ),
            )}
          </ul>
        </div>

        <p className="av-hint">{t('AVAILABILITY.HINT')}</p>

        <AvailabilityGrid
          days={days}
          rows={rows}
          cellInfo={cellInfo}
          paintModeFor={modeFor}
          onPaint={paint}
          onToggle={toggle}
          onDayAction={handleDayAction}
          dayLocked={dayLocked}
          today={today}
        />

        {hasPending && (
          <div className="av-savebar" role="status">
            <span className="av-savebar__text">
              {t('AVAILABILITY.PENDING', { ...counts })}
            </span>
            <div className="av-savebar__actions">
              <Button
                variant="outlined"
                disabled={save.isPending}
                onClick={() => setPending(new Map())}
              >
                {t('AVAILABILITY.DISCARD')}
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveRounded />}
                disabled={save.isPending}
                onClick={handleSave}
              >
                {t('AVAILABILITY.SAVE')}
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog
        open={repeatWeeks !== null}
        onClose={() => setRepeatWeeks(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t('AVAILABILITY.REPEAT.TITLE')}</DialogTitle>
        <DialogContent>
          <p className="av-dialog__text">{t('AVAILABILITY.REPEAT.TEXT')}</p>
          <Select
            fullWidth
            size="small"
            value={repeatWeeks ?? 1}
            onChange={(e) => setRepeatWeeks(Number(e.target.value))}
          >
            {[1, 2, 3, 4].map((weeks) => (
              <MenuItem key={weeks} value={weeks}>
                {t('AVAILABILITY.REPEAT.WEEKS', { count: weeks })}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRepeatWeeks(null)}>
            {t('AVAILABILITY.DISCARD_DIALOG')}
          </Button>
          <Button variant="contained" onClick={repeatWeek} disabled={busy}>
            {t('AVAILABILITY.REPEAT.CONFIRM')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AvailabilityPage;
