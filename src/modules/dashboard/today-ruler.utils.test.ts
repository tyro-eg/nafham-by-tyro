import { describe, expect, it } from 'vitest';
import { buildRulerDay } from './today-ruler.utils';

const at = (day: number, hour: number) =>
  new Date(2026, 10, day, Math.floor(hour), (hour % 1) * 60).toISOString();
const s = (
  id: number,
  day: number,
  start: number,
  end: number,
  status = 'scheduled',
) => ({
  id,
  start_time: at(day, start),
  end_time: at(day, end),
  status,
});
const now = new Date(2026, 10, 23, 17, 0);

describe('buildRulerDay', () => {
  it('is empty when nothing is on today', () => {
    expect(buildRulerDay([s(1, 24, 16, 17)], now)).toBeNull();
    expect(buildRulerDay([s(1, 23, 16, 17, 'cancelled')], now)).toBeNull();
  });

  it("spans today's sessions with an hour either side", () => {
    const day = buildRulerDay(
      [s(2, 23, 19, 20), s(1, 23, 14, 15), s(3, 24, 9, 10)],
      now,
    )!;
    expect(day.from).toBe(13);
    expect(day.to).toBe(21);
    expect(day.blocks.map((b) => b.session.id)).toEqual([1, 2]);
    expect(day.blocks[0].start).toBeCloseTo(12.5);
    expect(day.blocks[0].width).toBeCloseTo(12.5);
    expect(day.now).toBeCloseTo(50);
    expect(day.marks.map((m) => m.hour)).toEqual([14, 16, 18, 20]);
  });

  it('marks past and live, and keeps a short day at least six hours wide', () => {
    const day = buildRulerDay(
      [s(1, 23, 16, 17, 'completed'), s(2, 23, 17, 18, 'open')],
      now,
    )!;
    expect(day.to - day.from).toBe(6);
    expect(day.blocks[0].past).toBe(true);
    expect(day.blocks[1].live).toBe(true);
    expect(day.blocks[1].past).toBe(false);
  });

  it('puts overlapping sessions on separate rows', () => {
    const day = buildRulerDay(
      [s(1, 23, 14, 15), s(2, 23, 14, 15), s(3, 23, 15, 16)],
      now,
    )!;
    expect(day.blocks.map((b) => b.lane)).toEqual([0, 1, 0]);
    expect(day.lanes).toBe(2);
  });

  it('starts at now when that comes before the first session', () => {
    const early = new Date(2026, 10, 23, 11, 30);
    const day = buildRulerDay([s(1, 23, 14, 15), s(2, 23, 18, 19)], early)!;
    expect(day.from).toBe(11);
    expect(day.now).toBeGreaterThan(0);
  });
});
