import { describe, expect, it } from 'vitest';
import type { CellState } from './availability.utils';
import {
  dayHours,
  dayRuns,
  pendingRanges,
  rangeHours,
} from './availability-blocks';

const day: CellState[] = [
  'empty',
  'available',
  'reserved',
  'reserved',
  'removing',
  'available',
  'empty',
  'adding',
  'adding',
];

describe('dayRuns', () => {
  it('draws one open block around what is booked or being closed', () => {
    const runs = dayRuns(day);
    expect(runs.filter((r) => r.kind === 'open')).toEqual([
      { kind: 'open', start: 1, length: 5 },
    ]);
    expect(runs.filter((r) => r.kind === 'reserved')).toEqual([
      { kind: 'reserved', start: 2, length: 2 },
    ]);
    expect(runs.filter((r) => r.kind === 'removing')).toEqual([
      { kind: 'removing', start: 4, length: 1 },
    ]);
    expect(runs.filter((r) => r.kind === 'adding')).toEqual([
      { kind: 'adding', start: 7, length: 2 },
    ]);
  });
});

describe('dayHours', () => {
  it('counts open hours now and after saving', () => {
    expect(dayHours(day)).toEqual({ now: 2.5, after: 3 });
  });
});

describe('pendingRanges', () => {
  it('joins touching half-hours into ranges', () => {
    const at = (h: number, m = 0) => new Date(2026, 10, 26, h, m).toISOString();
    const pending = new Map<string, 'add' | 'remove'>([
      [at(11, 30), 'remove'],
      [at(12), 'remove'],
      [at(12, 30), 'remove'],
      [at(15), 'add'],
      [at(17), 'add'],
    ]);
    const { add, remove } = pendingRanges(pending);
    expect(remove).toHaveLength(1);
    expect(rangeHours(remove)).toBe(1.5);
    expect(remove[0].end.getHours()).toBe(13);
    expect(add).toHaveLength(2);
    expect(rangeHours(add)).toBe(1);
  });
});
