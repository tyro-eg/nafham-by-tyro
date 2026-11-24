import {
  SLOT_MINUTES,
  type CellState,
  type Pending,
} from './availability.utils';

/**
 * The new look of the availability grid (23 Nov 2026): the half-hour cells
 * stay for tapping and dragging, and these runs are drawn over them as
 * blocks. Kept apart so the rules can be tested.
 */

export type RunKind = 'open' | 'adding' | 'removing' | 'reserved' | 'held';

export interface Run {
  kind: RunKind;
  /** First row of the run and how many rows it covers */
  start: number;
  length: number;
}

/** Open now, before saving: what the soft open blocks show */
const OPEN_SAVED: CellState[] = ['available', 'reserved', 'held', 'removing'];
/** Open after saving: what the day's hours become */
const OPEN_AFTER: CellState[] = ['available', 'reserved', 'held', 'adding'];

const runsOf = (
  states: CellState[],
  kind: RunKind,
  match: (state: CellState) => boolean,
): Run[] => {
  const runs: Run[] = [];
  let start = -1;
  states.forEach((state, row) => {
    if (match(state)) {
      if (start < 0) start = row;
    } else if (start >= 0) {
      runs.push({ kind, start, length: row - start });
      start = -1;
    }
  });
  if (start >= 0) runs.push({ kind, start, length: states.length - start });
  return runs;
};

/** One day's blocks: open time, and inside it what is booked, kept or changing */
export const dayRuns = (states: CellState[]): Run[] => [
  ...runsOf(states, 'open', (s) => OPEN_SAVED.includes(s)),
  ...runsOf(states, 'reserved', (s) => s === 'reserved'),
  ...runsOf(states, 'held', (s) => s === 'held'),
  ...runsOf(states, 'adding', (s) => s === 'adding'),
  ...runsOf(states, 'removing', (s) => s === 'removing'),
];

/** Hours a day is open now, and after saving the changes */
export const dayHours = (states: CellState[]) => {
  const hours = (list: CellState[]) =>
    (states.filter((s) => list.includes(s)).length * SLOT_MINUTES) / 60;
  return { now: hours(OPEN_SAVED), after: hours(OPEN_AFTER) };
};

export interface ChangeRange {
  start: Date;
  end: Date;
}

/** Pending changes as time ranges, one per run of touching half-hours */
export const pendingRanges = (
  pending: Pending,
): { add: ChangeRange[]; remove: ChangeRange[] } => {
  const ranges = (change: 'add' | 'remove') => {
    const starts = [...pending.entries()]
      .filter(([, c]) => c === change)
      .map(([key]) => new Date(key).getTime())
      .sort((a, b) => a - b);
    const out: ChangeRange[] = [];
    starts.forEach((time) => {
      const last = out[out.length - 1];
      if (last && last.end.getTime() === time) {
        last.end = new Date(time + SLOT_MINUTES * 60 * 1000);
      } else {
        out.push({
          start: new Date(time),
          end: new Date(time + SLOT_MINUTES * 60 * 1000),
        });
      }
    });
    return out;
  };
  return { add: ranges('add'), remove: ranges('remove') };
};

/** Total hours in a list of ranges */
export const rangeHours = (ranges: ChangeRange[]) =>
  ranges.reduce((sum, r) => sum + (r.end.getTime() - r.start.getTime()), 0) /
  3_600_000;
