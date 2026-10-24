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
import { ExpandMoreRounded, LockRounded } from '@mui/icons-material';

import {
  formatSlotTime,
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
        <div className="av-grid__corner" aria-hidden="true" />
        {days.map((day, dayIndex) => {
          const locked = dayLocked(dayIndex);
          return (
            <button
              key={day.toISOString()}
              type="button"
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
              className={`av-time${onHour ? ' av-time--hour' : ''}`}
              aria-hidden="true"
            >
              {onHour && formatSlotTime(slotDate(today, minutes), language)}
            </div>,
            ...days.map((_, dayIndex) => {
              const cell = cells[dayIndex][rowIndex];
              const info = cellInfo(cell.key);
              const label = `${longFormat.format(cell.date)} ${formatSlotTime(
                cell.date,
                language,
              )}: ${t(`AVAILABILITY.STATE.${info.state.toUpperCase()}`)}`;
              const disabled =
                info.state === 'past' || info.state === 'reserved';
              return (
                <button
                  key={cell.key}
                  type="button"
                  data-key={cell.key}
                  className={`av-cell av-cell--${info.state}${
                    onHour ? ' av-cell--hour' : ''
                  }${info.state === 'past' && info.hadSlot ? ' av-cell--past-open' : ''}`}
                  aria-label={label}
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
                </button>
              );
            }),
          ];
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
