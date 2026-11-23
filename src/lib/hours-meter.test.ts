import { describe, expect, it } from 'vitest';
import type { Package } from '../assets/types';
import {
  hoursText,
  meterLine,
  orderLines,
  totalsOf,
  trialDots,
  widths,
} from './hours-meter';

const pkg = (
  id: number,
  hours: Partial<NonNullable<Package['hours']>> | undefined,
) =>
  ({
    id,
    tutor: { first_name: 'Karim', last_name: 'Adel' },
    student: { id: 9, first_name: 'Yara', last_name: 'Z' },
    hours: hours && {
      bought: 12,
      moved_out: 0,
      used: 0,
      scheduled: 0,
      unscheduled: 0,
      consistent: true,
      ...hours,
    },
  }) as unknown as Package;

describe('hours meter', () => {
  it('reads a package as done, missed, booked and free', () => {
    const line = meterLine(
      pkg(1, { used: 7, missed: 1, scheduled: 2, unscheduled: 3 }),
      'Maths',
    );
    expect(line).toMatchObject({
      course: 'Maths',
      tutor: 'Karim Adel',
      student: 'Yara Z',
      studentId: 9,
      done: 6,
      missed: 1,
      booked: 2,
      free: 3,
      total: 12,
      left: 5,
      low: false,
    });
    const w = widths(line!);
    expect(w.done).toBeCloseTo(50);
    expect(w.free).toBeCloseTo(25);
  });

  it('marks 2 hours or less as low, and skips packages with nothing to show', () => {
    expect(
      meterLine(pkg(1, { used: 10, scheduled: 1, unscheduled: 1 }), 'P')!.low,
    ).toBe(true);
    expect(meterLine(pkg(1, { used: 0 }), 'P')).toBeNull();
    // Used up is not "low": nothing is left to run out of
    expect(meterLine(pkg(1, { used: 8 }), 'P')).toMatchObject({
      low: false,
      usedUp: true,
    });
    expect(meterLine(pkg(1, undefined), 'P')).toBeNull();
    // An older server without `missed`: all used hours read as done
    expect(meterLine(pkg(1, { used: 4, unscheduled: 4 }), 'P')).toMatchObject({
      done: 4,
      missed: 0,
    });
  });

  it('puts courses with hours ahead first, fewest left first, then totals them', () => {
    const lines = [
      meterLine(pkg(1, { used: 8 }), 'Finished')!,
      meterLine(pkg(2, { used: 2, unscheduled: 6 }), 'Plenty')!,
      meterLine(pkg(3, { used: 6, missed: 1, unscheduled: 1.5 }), 'Low')!,
    ];
    expect(orderLines(lines).map((l) => l.course)).toEqual([
      'Low',
      'Plenty',
      'Finished',
    ]);
    expect(totalsOf(lines)).toEqual({
      done: 15,
      missed: 1,
      booked: 0,
      free: 7.5,
    });
  });

  it('draws the trial dots: done, booked, used up, left', () => {
    const row = {
      student_id: 9,
      name: 'Yara',
      done: 1,
      missed: 0,
      booked: 1,
      cancelled: 1,
      used: 3,
      left: 0,
    };
    expect(trialDots(row, 3)).toEqual(['done', 'booked', 'gone']);
    expect(
      trialDots({ ...row, booked: 0, cancelled: 0, used: 1, left: 2 }, 3),
    ).toEqual(['done', 'left', 'left']);
    expect([hoursText(6), hoursText(1.5), hoursText(2.25)]).toEqual([
      '6',
      '1.5',
      '2.3',
    ]);
  });
});
