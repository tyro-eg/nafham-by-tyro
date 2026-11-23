import {
  FC,
  MouseEvent,
  PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, MenuItem, Divider, ListSubheader } from '@mui/material';
import {
  ExpandMoreRounded,
  LockClockRounded,
  LockRounded,
} from '@mui/icons-material';

import type { SessionType } from '../../assets/types';
import { subjectName } from '../dashboard/dashboard.utils';
import { dayHours, dayRuns, type Run } from './availability-blocks';
import {
  formatSlotTime,
  isLocked,
  slotDate,
  slotKey,
  type CellState,
  type DayPreset,
  type PaintMode,
} from './availability.utils';

export type DayAction = DayPreset | 'clear' | 'copy_to_week';

export interface CellInfo {
  state: CellState;
  /** A saved slot exists here (used to tint past cells that were open) */
  hadSlot: boolean;
  /** Held cells: the student it is kept for and until when (ISO) */
  heldFor?: string | null;
  heldUntil?: string | null;
}

interface AvailabilityGridProps {
  days: Date[];
  rows: number[];
  cellInfo: (key: string) => CellInfo;
  paintModeFor: (key: string) => PaintMode | null;
  onPaint: (key: string, mode: PaintMode) => void;
  onToggle: (key: string) => void;
  onDayAction: (dayIndex: number, action: DayAction) => void;
  /** Whole day is in the past: no quick-fill menu */
  dayLocked: (dayIndex: number) => boolean;
  today: Date;
  /** The tutor's sessions this week, to name what is booked */
  sessions?: SessionType[];
}

const DAY_ACTIONS: DayAction[] = [
  'morning',
  'afternoon',
  'evening',
  'all_day',
  'clear',
  'copy_to_week',
];

/**
 * Weekly grid of 30-minute cells. Mouse users drag to paint, touch and
 * keyboard users tap one cell at a time. Day headers open quick-fill presets.
 */
const AvailabilityGrid: FC<AvailabilityGridProps> = ({
  days,
  rows,
  cellInfo,
  paintModeFor,
  onPaint,
  onToggle,
  onDayAction,
  dayLocked,
  today,
  sessions = [],
}) => {
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  const painting = useRef<{
    mode: PaintMode;
    last: string;
    x: number;
    y: number;
  } | null>(null);
  const lastPointerType = useRef<string | null>(null);
  const [menu, setMenu] = useState<{
    anchor: HTMLElement;
    dayIndex: number;
  } | null>(null);

  /** Keys and dates for every cell, computed once per week */
  const cells = useMemo(
    () =>
      days.map((day) =>
        rows.map((minutes) => {
          const date = slotDate(day, minutes);
          return { key: slotKey(date), date, minutes };
        }),
      ),
    [days, rows],
  );

  const states = days.map((_, d) =>
    cells[d].map((cell) => cellInfo(cell.key).state),
  );
  const pct = (rowsOrMinutes: number) =>
    `${(rowsOrMinutes / rows.length) * 100}%`;
  const hoursText = (hours: number) =>
    Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
  const timeOf = (d: number, row: number) =>
    formatSlotTime(slotDate(days[d], rows[0] + row * 30), language);

  const weekdayFormat = useMemo(
    () => new Intl.DateTimeFormat(language, { weekday: 'short' }),
    [language],
  );
  const dayFormat = useMemo(
    () => new Intl.DateTimeFormat(language, { day: 'numeric' }),
    [language],
  );
  const longFormat = useMemo(
    () =>
      new Intl.DateTimeFormat(language, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      }),
    [language],
  );

  // A drag ends wherever the pointer is released
  useEffect(() => {
    const stop = () => {
      painting.current = null;
    };
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
  }, []);

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLButtonElement>,
    key: string,
  ) => {
    lastPointerType.current = event.pointerType;
    if (event.pointerType !== 'mouse' || event.button !== 0) return;

    const mode = paintModeFor(key);
    if (!mode) return;

    event.preventDefault();
    painting.current = { mode, last: key, x: event.clientX, y: event.clientY };
    onPaint(key, mode);
  };

  /** Paint the cell under a point, if it is a new one */
  const paintAt = (x: number, y: number) => {
    const stroke = painting.current;
    if (!stroke) return;
    const target = document
      .elementFromPoint(x, y)
      ?.closest<HTMLElement>('[data-key]');
    const key = target?.dataset.key;
    if (!key || key === stroke.last) return;
    stroke.last = key;
    onPaint(key, stroke.mode);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const stroke = painting.current;
    if (!stroke) return;

    // Fast drags skip cells between two move events: sample the path between
    const { clientX: x, clientY: y } = event;
    const distance = Math.hypot(x - stroke.x, y - stroke.y);
    const steps = Math.max(1, Math.ceil(distance / 8));
    for (let i = 1; i <= steps; i += 1) {
      paintAt(
        stroke.x + ((x - stroke.x) * i) / steps,
        stroke.y + ((y - stroke.y) * i) / steps,
      );
    }
    stroke.x = x;
    stroke.y = y;
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>, key: string) => {
    // Mouse clicks were already handled on pointer down (as a paint start)
    const viaMouse = lastPointerType.current === 'mouse' && event.detail > 0;
    lastPointerType.current = null;
    if (viaMouse) return;
    onToggle(key);
  };

  const isToday = (day: Date) =>
    day.getFullYear() === today.getFullYear() &&
    day.getMonth() === today.getMonth() &&
    day.getDate() === today.getDate();

  return (
    <div className="av-grid-wrap">
      <div
        className="av-grid"
        style={{ gridTemplateColumns: `6.4rem repeat(${days.length}, 1fr)` }}
        onPointerMove={handlePointerMove}
        role="grid"
        aria-label={t('AVAILABILITY.TITLE')}
      >
        {/* Header row */}
        <div
          className="av-grid__corner"
          style={{ gridRow: 1, gridColumn: 1 }}
          aria-hidden="true"
        />
        {days.map((day, dayIndex) => {
          const locked = dayLocked(dayIndex);
          return (
            <button
              key={day.toISOString()}
              type="button"
              style={{ gridRow: 1, gridColumn: dayIndex + 2 }}
              className={`av-day${isToday(day) ? ' av-day--today' : ''}${
                locked ? ' av-day--locked' : ''
              }`}
              disabled={locked}
              aria-label={`${longFormat.format(day)}: ${t(
                'AVAILABILITY.DAY_MENU.TITLE',
              )}`}
              onClick={(e) => setMenu({ anchor: e.currentTarget, dayIndex })}
            >
              <span className="av-day__weekday">
                {weekdayFormat.format(day)}
              </span>
              <span className="av-day__date">{dayFormat.format(day)}</span>
              <span
                className={`av-day__hours${(() => {
                  const h = dayHours(states[dayIndex]);
                  return locked || (h.now === 0 && h.after === 0)
                    ? ' av-day__hours--none'
                    : h.now !== h.after
                      ? ' av-day__hours--change'
                      : '';
                })()}`}
              >
                {(() => {
                  const h = dayHours(states[dayIndex]);
                  if (locked) return t('AVAILABILITY.DAY.PAST');
                  if (h.now !== h.after)
                    return t('AVAILABILITY.DAY.CHANGE', {
                      from: hoursText(h.now),
                      to: hoursText(h.after),
                    });
                  if (h.now === 0) return t('AVAILABILITY.DAY.CLOSED');
                  return t('AVAILABILITY.DAY.OPEN', {
                    hours: hoursText(h.now),
                  });
                })()}
              </span>
              {!locked && (
                <ExpandMoreRounded className="av-day__chevron" aria-hidden />
              )}
            </button>
          );
        })}

        {/* Body: one row of cells per 30 minutes */}
        {rows.map((minutes, rowIndex) => {
          const onHour = minutes % 60 === 0;
          return [
            <div
              key={`label-${minutes}`}
              style={{ gridRow: rowIndex + 2, gridColumn: 1 }}
              className={`av-time${onHour ? ' av-time--hour' : ''}`}
              aria-hidden="true"
            >
              {onHour && formatSlotTime(slotDate(today, minutes), language)}
            </div>,
            ...days.map((_, dayIndex) => {
              const cell = cells[dayIndex][rowIndex];
              const info = cellInfo(cell.key);
              const heldNote =
                info.state === 'held'
                  ? t('AVAILABILITY.HELD_NOTE', {
                      student: info.heldFor || t('AVAILABILITY.HELD_STUDENT'),
                      date: info.heldUntil
                        ? longFormat.format(new Date(info.heldUntil))
                        : '',
                    })
                  : null;
              const label = `${longFormat.format(cell.date)} ${formatSlotTime(
                cell.date,
                language,
              )}: ${heldNote ?? t(`AVAILABILITY.STATE.${info.state.toUpperCase()}`)}`;
              const disabled = isLocked(info.state);
              return (
                <button
                  key={cell.key}
                  type="button"
                  data-key={cell.key}
                  style={{ gridRow: rowIndex + 2, gridColumn: dayIndex + 2 }}
                  className={`av-cell av-cell--${info.state}${
                    onHour ? ' av-cell--hour' : ''
                  }${info.state === 'past' && info.hadSlot ? ' av-cell--past-open' : ''}`}
                  aria-label={label}
                  title={heldNote ?? undefined}
                  aria-pressed={
                    info.state === 'available' || info.state === 'adding'
                  }
                  aria-disabled={disabled}
                  tabIndex={disabled ? -1 : 0}
                  onPointerDown={(e) => handlePointerDown(e, cell.key)}
                  onClick={(e) => handleClick(e, cell.key)}
                >
                  {info.state === 'reserved' && (
                    <LockRounded className="av-cell__lock" aria-hidden />
                  )}
                  {info.state === 'held' && (
                    <LockClockRounded className="av-cell__lock" aria-hidden />
                  )}
                </button>
              );
            }),
          ];
        })}

        {/* What the cells add up to, drawn over them (taps go through) */}
        {days.map((day, d) => {
          const runs = dayRuns(states[d]);
          const covered = new Set<number>();
          const cards = sessions
            .filter((session) => {
              const start = new Date(session.start_time);
              return (
                session.status !== 'cancelled' &&
                start.getFullYear() === day.getFullYear() &&
                start.getMonth() === day.getMonth() &&
                start.getDate() === day.getDate()
              );
            })
            .map((session) => {
              const start = new Date(session.start_time);
              const end = new Date(session.end_time);
              const from =
                (start.getHours() * 60 + start.getMinutes() - rows[0]) / 30;
              const length = Math.max(
                1,
                (end.getTime() - start.getTime()) / (30 * 60 * 1000),
              );
              for (let r = Math.floor(from); r < from + length; r += 1)
                covered.add(r);
              return { session, from, length };
            })
            .filter((card) => card.from >= 0 && card.from < rows.length);
          const uncoveredBooked = runs.filter(
            (run) =>
              run.kind === 'reserved' &&
              !Array.from({ length: run.length }, (_, i) => run.start + i).some(
                (r) => covered.has(r),
              ),
          );
          const nowRow =
            isToday(day) &&
            (today.getHours() * 60 + today.getMinutes() - rows[0]) / 30;
          const place = (run: { start: number; length: number }) => ({
            top: pct(run.start),
            height: pct(run.length),
          });
          const runLabel = (run: Run) =>
            `${timeOf(d, run.start)} – ${timeOf(d, run.start + run.length)}`;
          return (
            <div
              key={`layer-${day.toISOString()}`}
              className="av-layer"
              style={{
                gridColumn: d + 2,
                gridRow: `2 / span ${rows.length}`,
              }}
              aria-hidden="true"
            >
              {runs
                .filter((run) => run.kind === 'open')
                .map((run) => (
                  <div
                    key={`open-${run.start}`}
                    className="av-block av-block--open"
                    style={place(run)}
                  >
                    {run.length >= 2 && (
                      <span className="av-block__label">{runLabel(run)}</span>
                    )}
                  </div>
                ))}
              {cards.map(({ session, from, length }) => (
                <div
                  key={`s-${session.id}`}
                  className={`av-card${
                    session.session_type === 'trial' ? ' av-card--trial' : ''
                  }`}
                  style={{ top: pct(from), height: pct(length) }}
                >
                  <b dir="auto">
                    {session.session_type === 'trial'
                      ? t('AVAILABILITY.BLOCK.TRIAL')
                      : subjectName(session.grade_subject?.full_course_name)}
                  </b>
                  <span dir="auto">
                    {session.student?.first_name}
                    {length >= 2 &&
                      ` · ${formatSlotTime(new Date(session.start_time), language)}`}
                  </span>
                </div>
              ))}
              {uncoveredBooked.map((run) => (
                <div
                  key={`r-${run.start}`}
                  className="av-card"
                  style={place(run)}
                >
                  <b>{t('AVAILABILITY.BLOCK.BOOKED')}</b>
                </div>
              ))}
              {runs
                .filter((run) => run.kind === 'held')
                .map((run) => (
                  <div
                    key={`h-${run.start}`}
                    className="av-card av-card--held"
                    style={place(run)}
                  >
                    <span>
                      {t('AVAILABILITY.BLOCK.KEPT', {
                        student:
                          cellInfo(cells[d][run.start].key).heldFor ||
                          t('AVAILABILITY.HELD_STUDENT'),
                      })}
                    </span>
                  </div>
                ))}
              {runs
                .filter(
                  (run) => run.kind === 'adding' || run.kind === 'removing',
                )
                .map((run) => (
                  <div
                    key={`${run.kind}-${run.start}`}
                    className={`av-block av-block--${run.kind}`}
                    style={place(run)}
                  >
                    <span className="av-block__tag">
                      {t(
                        run.kind === 'adding'
                          ? 'AVAILABILITY.BLOCK.OPENING'
                          : 'AVAILABILITY.BLOCK.CLOSING',
                        { hours: hoursText(run.length / 2) },
                      )}
                    </span>
                  </div>
                ))}
              {nowRow !== false && nowRow >= 0 && nowRow <= rows.length && (
                <span className="av-now" style={{ top: pct(nowRow) }} />
              )}
            </div>
          );
        })}
      </div>

      <Menu
        open={!!menu}
        anchorEl={menu?.anchor}
        onClose={() => setMenu(null)}
        className="av-day-menu"
      >
        <ListSubheader className="av-day-menu__title">
          {menu && longFormat.format(days[menu.dayIndex])}
        </ListSubheader>
        {DAY_ACTIONS.map((action, index) => [
          action === 'clear' && <Divider key="divider" />,
          <MenuItem
            key={action}
            onClick={() => {
              if (menu) onDayAction(menu.dayIndex, action);
              setMenu(null);
            }}
            className={index >= 4 ? 'av-day-menu__secondary' : ''}
          >
            {t(`AVAILABILITY.DAY_MENU.${action.toUpperCase()}`)}
          </MenuItem>,
        ])}
      </Menu>
    </div>
  );
};

export default AvailabilityGrid;
