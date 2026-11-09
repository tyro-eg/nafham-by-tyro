import { describe, expect, it } from 'vitest';
import {
  applyPaint,
  cellState,
  gridRows,
  nextEditableSlot,
  paintModeFor,
  pendingCounts,
  slotDate,
  togglePending,
  weekStartFor,
  weekSummary,
  type Pending,
  type SavedSlot,
} from './availability.utils';

const saved = (status: SavedSlot['status'] = 'available'): SavedSlot => ({
  id: 1,
  key: '2026-10-19T08:00:00.000Z',
  status,
});

const held = (): SavedSlot => ({
  ...saved('reserved'),
  held: true,
  heldFor: 'Ali',
  heldUntil: '2026-11-01T21:59:00.000Z',
});

describe('nextEditableSlot', () => {
  it('rounds up to the next half hour', () => {
    expect(nextEditableSlot(new Date(2026, 9, 19, 15, 3)).getMinutes()).toBe(
      30,
    );
    const next = nextEditableSlot(new Date(2026, 9, 19, 15, 45));
    expect(next.getHours()).toBe(16);
    expect(next.getMinutes()).toBe(0);
  });
});

describe('grid helpers', () => {
  it('starts the week on Sunday', () => {
    expect(weekStartFor(new Date(2026, 9, 21)).getDay()).toBe(0);
  });

  it('hides night hours unless asked', () => {
    expect(gridRows(false)[0]).toBe(6 * 60);
    expect(gridRows(true)[0]).toBe(0);
    expect(gridRows(true)).toHaveLength(48);
  });

  it('builds a slot at local wall-clock time', () => {
    const slot = slotDate(new Date(2026, 9, 19), 9 * 60 + 30);
    expect(slot.getHours()).toBe(9);
    expect(slot.getMinutes()).toBe(30);
  });
});

describe('cellState', () => {
  it('reports the combined saved and pending state', () => {
    expect(cellState(undefined, undefined, true)).toBe('past');
    expect(cellState(saved('reserved'), 'remove', false)).toBe('reserved');
    expect(cellState(undefined, 'add', false)).toBe('adding');
    expect(cellState(saved(), 'remove', false)).toBe('removing');
    expect(cellState(saved(), undefined, false)).toBe('available');
    expect(cellState(undefined, undefined, false)).toBe('empty');
  });

  it('paints the opposite of what the first cell shows', () => {
    expect(paintModeFor('empty')).toBe('add');
    expect(paintModeFor('available')).toBe('remove');
    expect(paintModeFor('reserved')).toBeNull();
    expect(paintModeFor('past')).toBeNull();
  });
});

describe('applyPaint', () => {
  const key = saved().key;

  it('adds an empty cell and forgets it when removed again', () => {
    let pending: Pending = new Map();
    pending = applyPaint(pending, key, undefined, false, 'add');
    expect(pending.get(key)).toBe('add');
    pending = applyPaint(pending, key, undefined, false, 'remove');
    expect(pending.has(key)).toBe(false);
  });

  it('marks a saved slot for removal and restores it when added back', () => {
    let pending: Pending = new Map();
    pending = applyPaint(pending, key, saved(), false, 'remove');
    expect(pending.get(key)).toBe('remove');
    pending = applyPaint(pending, key, saved(), false, 'add');
    expect(pending.has(key)).toBe(false);
  });

  it('never touches reserved or past cells', () => {
    const pending: Pending = new Map();
    expect(applyPaint(pending, key, saved('reserved'), false, 'remove')).toBe(
      pending,
    );
    expect(applyPaint(pending, key, undefined, true, 'add')).toBe(pending);
  });

  it('returns the same map when nothing changes', () => {
    const pending: Pending = new Map([[key, 'add']]);
    expect(applyPaint(pending, key, undefined, false, 'add')).toBe(pending);
  });

  it('toggles based on the current state', () => {
    let pending: Pending = new Map();
    pending = togglePending(pending, key, undefined, false);
    expect(pending.get(key)).toBe('add');
    pending = togglePending(pending, key, undefined, false);
    expect(pending.size).toBe(0);
    expect(
      pendingCounts(
        new Map([
          ['a', 'add'],
          ['b', 'remove'],
        ]),
      ),
    ).toEqual({
      add: 1,
      remove: 1,
    });
  });
});

describe('held slots', () => {
  it('shows a slot kept for a renewing student as held, and locks it', () => {
    expect(cellState(held(), undefined, false)).toBe('held');
    expect(cellState(held(), 'remove', false)).toBe('held');
    expect(cellState(held(), undefined, true)).toBe('past');
    expect(paintModeFor('held')).toBeNull();
  });

  it('never paints over a held slot', () => {
    const pending: Pending = new Map();
    const slot = held();
    expect(applyPaint(pending, slot.key, slot, false, 'remove')).toBe(pending);
    expect(togglePending(pending, slot.key, slot, false)).toBe(pending);
  });

  it('counts held time apart from bookings', () => {
    const week = weekStartFor(new Date(2026, 9, 19));
    const map = new Map<string, SavedSlot>([
      ['a', { ...saved(), id: 1, key: new Date(2026, 9, 19, 9).toISOString() }],
      [
        'b',
        {
          ...saved('reserved'),
          id: 2,
          key: new Date(2026, 9, 19, 10).toISOString(),
        },
      ],
      ['c', { ...held(), id: 3, key: new Date(2026, 9, 19, 11).toISOString() }],
    ]);
    expect(weekSummary(map, week)).toEqual({ open: 1, booked: 1, held: 1 });
  });
});
