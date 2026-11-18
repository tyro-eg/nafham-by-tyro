import {
  addDays,
  addMinutes,
  setHours,
  setMinutes,
  startOfWeek,
} from 'date-fns';

/**
 * Pure helpers for the instructor availability editor.
 *
 * The backend stores availability as independent 30-minute slots. The editor
 * shows them on a weekly grid and keeps a map of pending changes (adds and
 * removes, keyed by the slot's ISO start time) until the instructor saves.
 */

export const SLOT_MINUTES = 30;
export const SLOTS_PER_DAY = (24 * 60) / SLOT_MINUTES;
/** Weeks start on Sunday, like the rest of the app and the backend */
export const WEEK_STARTS_ON = 0;
/** Rows shown by default (night hours can be revealed) */
export const DAY_WINDOW = { start: 6 * 60, end: 24 * 60 };

export type SlotStatus = 'available' | 'reserved';
export type PendingChange = 'add' | 'remove';
export type PaintMode = 'add' | 'remove';

export interface SavedSlot {
  id: number;
  /** ISO start time, also the slot's key */
  key: string;
  status: SlotStatus;
  /** Kept for one of the instructor's students while they renew */
  held?: boolean;
  heldUntil?: string | null;
  heldFor?: string | null;
}

export type CellState =
  | 'past'
  | 'reserved'
  | 'held'
  | 'available'
  | 'empty'
  | 'adding'
  | 'removing';

export type Pending = Map<string, PendingChange>;
export type SavedMap = Map<string, SavedSlot>;

export const slotKey = (date: Date): string => date.toISOString();

export const slotEnd = (date: Date): Date => addMinutes(date, SLOT_MINUTES);

export const weekStartFor = (date: Date): Date =>
  startOfWeek(date, { weekStartsOn: WEEK_STARTS_ON });

export const weekDays = (weekStart: Date): Date[] =>
  Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

/** Local wall-clock time for a slot on a given day */
export const slotDate = (day: Date, minutesFromMidnight: number): Date =>
  setMinutes(
    setHours(day, Math.floor(minutesFromMidnight / 60)),
    minutesFromMidnight % 60,
  );

/** Minutes-from-midnight for each row of the grid */
export const gridRows = (showNight: boolean): number[] => {
  const start = showNight ? 0 : DAY_WINDOW.start;
  const rows: number[] = [];
  for (let m = start; m < DAY_WINDOW.end; m += SLOT_MINUTES) rows.push(m);
  return rows;
};

/**
 * The first slot an instructor may still edit: the next half-hour boundary.
 * 15:03 -> 15:30, 15:45 -> 16:00
 */
export const nextEditableSlot = (now: Date = new Date()): Date => {
  const next = new Date(now);
  next.setSeconds(0, 0);
  if (next.getMinutes() < 30) next.setMinutes(30);
  else next.setHours(next.getHours() + 1, 0);
  return next;
};

/** What a cell looks like once saved data and pending changes are combined */
export const cellState = (
  saved: SavedSlot | undefined,
  pending: PendingChange | undefined,
  isPast: boolean,
): CellState => {
  if (isPast) return 'past';
  if (saved?.status === 'reserved') return saved.held ? 'held' : 'reserved';
  if (pending === 'add') return 'adding';
  if (pending === 'remove') return 'removing';
  return saved ? 'available' : 'empty';
};

/** Whether the instructor is (or will be, after saving) open in this cell */
export const isOpen = (state: CellState): boolean =>
  state === 'available' ||
  state === 'adding' ||
  state === 'reserved' ||
  state === 'held';

/** Booked and held cells can't be changed from the editor */
export const isLocked = (state: CellState): boolean =>
  state === 'past' || state === 'reserved' || state === 'held';

/** The paint mode a drag should use when it starts on a cell */
export const paintModeFor = (state: CellState): PaintMode | null => {
  if (isLocked(state)) return null;
  return isOpen(state) ? 'remove' : 'add';
};

/**
 * Apply one paint stroke to a cell. Returns a new map only when something
 * changed so callers can skip re-renders.
 */
export const applyPaint = (
  pending: Pending,
  key: string,
  saved: SavedSlot | undefined,
  isPast: boolean,
  mode: PaintMode,
): Pending => {
  if (isPast || saved?.status === 'reserved') return pending;

  const current = pending.get(key);
  const next = new Map(pending);

  if (mode === 'add') {
    if (saved) {
      if (current !== 'remove') return pending;
      next.delete(key); // keep the saved slot after all
    } else {
      if (current === 'add') return pending;
      next.set(key, 'add');
    }
  } else if (saved) {
    if (current === 'remove') return pending;
    next.set(key, 'remove');
  } else {
    if (current !== 'add') return pending;
    next.delete(key); // never saved, just forget it
  }

  return next;
};

export const togglePending = (
  pending: Pending,
  key: string,
  saved: SavedSlot | undefined,
  isPast: boolean,
): Pending => {
  const mode = paintModeFor(cellState(saved, pending.get(key), isPast));
  return mode ? applyPaint(pending, key, saved, isPast, mode) : pending;
};

export interface PendingCounts {
  add: number;
  remove: number;
}

export const pendingCounts = (pending: Pending): PendingCounts => {
  let add = 0;
  let remove = 0;
  pending.forEach((change) => {
    if (change === 'add') add += 1;
    else remove += 1;
  });
  return { add, remove };
};

/** Quick-fill presets a day header offers (minutes from midnight) */
export type DayPreset = 'morning' | 'afternoon' | 'evening' | 'all_day';

export const DAY_PRESETS: Record<DayPreset, { start: number; end: number }> = {
  morning: { start: 9 * 60, end: 12 * 60 },
  afternoon: { start: 12 * 60, end: 17 * 60 },
  evening: { start: 17 * 60, end: 22 * 60 },
  all_day: { start: 9 * 60, end: 22 * 60 },
};

export const hoursFromSlots = (slots: number): number => slots / 2;

/** "9:30 AM" / "٩:٣٠ ص" in the current language */
export const formatSlotTime = (date: Date, language: string): string =>
  new Intl.DateTimeFormat(language, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);

/** Count saved slots inside a week: open, booked, and held for a renewing student */
export const weekSummary = (
  saved: SavedMap,
  weekStart: Date,
): { open: number; booked: number; held: number } => {
  const start = weekStart.getTime();
  const end = addDays(weekStart, 7).getTime();
  let open = 0;
  let booked = 0;
  let held = 0;
  saved.forEach((slot) => {
    const time = new Date(slot.key).getTime();
    if (time < start || time >= end) return;
    if (slot.status === 'reserved' && slot.held) held += 1;
    else if (slot.status === 'reserved') booked += 1;
    else open += 1;
  });
  return { open, booked, held };
};
