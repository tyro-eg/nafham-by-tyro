import type { Package, TrialsSummary } from '../assets/types';

/**
 * The hours meter (23 Nov 2026: "completed hours and remaining of sessions
 * and trials"): what the server counts for each package (Packages::Hours),
 * read as done, missed, booked and still free to book.
 */

export interface MeterLine {
  id: number;
  course: string;
  tutor: string;
  student: string;
  studentId: number;
  done: number;
  missed: number;
  booked: number;
  free: number;
  /** done + missed + booked + free: what this package covers now */
  total: number;
  /** booked + free: hours still ahead */
  left: number;
  low: boolean;
}

export interface MeterTotals {
  done: number;
  missed: number;
  booked: number;
  free: number;
}

/** "Left in all" turns red at this many hours or fewer. */
export const LOW_HOURS = 2;

const round = (n: number) => Math.round(n * 100) / 100;
const clean = (n: number | undefined) => Math.max(0, Number(n) || 0);

/** One meter line for a package; null when it has nothing to show. */
export function meterLine(pkg: Package, course: string): MeterLine | null {
  const h = pkg.hours;
  if (!h) return null;
  const missed = clean(h.missed);
  const done = Math.max(0, clean(h.used) - missed);
  const booked = clean(h.scheduled);
  const free = clean(h.unscheduled);
  const total = round(done + missed + booked + free);
  if (!total) return null;
  const left = round(booked + free);
  return {
    id: pkg.id,
    course,
    tutor: [pkg.tutor?.first_name, pkg.tutor?.last_name]
      .filter(Boolean)
      .join(' '),
    student: [pkg.student?.first_name, pkg.student?.last_name]
      .filter(Boolean)
      .join(' '),
    studentId: pkg.student?.id,
    done: round(done),
    missed: round(missed),
    booked: round(booked),
    free: round(free),
    total,
    left,
    low: left <= LOW_HOURS,
  };
}

/** Lines with hours still ahead first (fewest left first), then finished ones. */
export function orderLines(lines: MeterLine[]): MeterLine[] {
  return lines.slice().sort((a, b) => {
    const aOpen = a.left > 0 ? 0 : 1;
    const bOpen = b.left > 0 ? 0 : 1;
    return aOpen - bOpen || a.left - b.left || a.course.localeCompare(b.course);
  });
}

export function totalsOf(lines: MeterLine[]): MeterTotals {
  return lines.reduce(
    (t, l) => ({
      done: round(t.done + l.done),
      missed: round(t.missed + l.missed),
      booked: round(t.booked + l.booked),
      free: round(t.free + l.free),
    }),
    { done: 0, missed: 0, booked: 0, free: 0 },
  );
}

/** Width of each part of a meter, in % of the line's total. */
export function widths(
  line: Pick<MeterLine, 'done' | 'missed' | 'booked' | 'free' | 'total'>,
) {
  const pct = (n: number) => (line.total ? (n / line.total) * 100 : 0);
  return {
    done: pct(line.done),
    missed: pct(line.missed),
    booked: pct(line.booked),
    free: pct(line.free),
  };
}

/** The trial dots for one student: 'done' | 'booked' | 'gone' (cancelled or missed) | 'left'. */
export function trialDots(
  row: TrialsSummary['students'][number],
  max: number,
): Array<'done' | 'booked' | 'gone' | 'left'> {
  const dots: Array<'done' | 'booked' | 'gone' | 'left'> = [];
  const push = (kind: 'done' | 'booked' | 'gone' | 'left', n: number) => {
    for (let i = 0; i < n && dots.length < max; i++) dots.push(kind);
  };
  push('done', row.done);
  push('booked', row.booked);
  push('gone', row.missed + row.cancelled);
  push('left', row.left);
  while (dots.length < max) dots.push('left');
  return dots;
}

/** "6", "1.5", for the meter's numbers. */
export const hoursText = (n: number) =>
  Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, '');
