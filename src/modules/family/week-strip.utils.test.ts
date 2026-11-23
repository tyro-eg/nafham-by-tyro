import { describe, expect, it } from 'vitest';
import { buildWeek, fuelBlocks, sessionsAhead } from './week-strip.utils';

const at = (day: number, hour: number) =>
  new Date(2026, 10, day, hour, 0, 0).toISOString();
const session = (
  id: number,
  day: number,
  hour: number,
  status = 'scheduled',
) => ({
  id,
  start_time: at(day, hour),
  end_time: at(day, hour + 1),
  status,
  course_name: 'Math',
  tutor_name: 'Ms. Nour',
});
const color = (i: number) => ['blue', 'coral'][i];
const now = new Date(2026, 10, 23, 18, 30);

describe('buildWeek', () => {
  const children = [
    {
      id: 1,
      first_name: 'Aly',
      week: [
        session(1, 22, 17, 'completed'), // yesterday: left out
        session(2, 23, 20),
        session(3, 23, 16, 'completed'),
        session(4, 25, 17),
        session(5, 30, 17), // the 8th day: left out
      ],
    },
    {
      id: 2,
      first_name: 'Laila',
      week: [session(6, 23, 18, 'open'), session(7, 26, 16)],
    },
  ];
  const days = buildWeek(children, color, now);

  it('holds today and the next six days', () => {
    expect(days).toHaveLength(7);
    expect(days[0].today).toBe(true);
    expect(days[0].date.getDate()).toBe(23);
    expect(days[6].date.getDate()).toBe(29);
  });

  it('puts each session on its day, soonest first, in its child colour', () => {
    expect(days[0].entries.map((e) => e.session.id)).toEqual([3, 6, 2]);
    expect(days[2].entries.map((e) => e.color)).toEqual(['blue']);
    expect(days[3].entries.map((e) => e.child.first_name)).toEqual(['Laila']);
    expect(
      days.flatMap((d) => d.entries).map((e) => e.session.id),
    ).not.toContain(1);
    expect(
      days.flatMap((d) => d.entries).map((e) => e.session.id),
    ).not.toContain(5);
  });

  it('marks done and live, and puts "now" after what has started', () => {
    const [done, live, later] = days[0].entries;
    expect(done.done).toBe(true);
    expect(live.live).toBe(true);
    expect(live.done).toBe(false);
    expect(later.done).toBe(false);
    expect(days[0].nowAfter).toBe(2);
    expect(days[1].nowAfter).toBeNull();
  });

  it('counts the sessions still ahead', () => {
    expect(sessionsAhead(days)).toBe(4);
  });
});

describe('fuelBlocks', () => {
  it('fills the share that is left', () => {
    expect(fuelBlocks(12, 24).filter((b) => b === 1)).toHaveLength(6);
    expect(fuelBlocks(24, 24).every((b) => b === 1)).toBe(true);
  });

  it('never looks empty while something is left', () => {
    expect(fuelBlocks(0.5, 36)[0]).toBeGreaterThan(0);
    expect(fuelBlocks(0, 36).every((b) => b === 0)).toBe(true);
  });
});
