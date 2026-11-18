import type { Package, SessionType } from '../../assets/types';
import type { SessionSummary } from '../../hooks/useSessions';
import { hoursLeft } from '../../lib/package-hours';

const HOUR_MS = 60 * 60 * 1000;

export const sessionHours = (session: SessionType): number => {
  const ms =
    new Date(session.end_time).getTime() -
    new Date(session.start_time).getTime();
  return Number.isFinite(ms) && ms > 0 ? ms / HOUR_MS : 0;
};

/** "IGCSE - Grade 10 - Mathematics" -> "Mathematics" */
export const subjectName = (fullCourseName?: string): string => {
  if (!fullCourseName) return '';
  const parts = fullCourseName.split(' - ');
  return parts[parts.length - 1].trim();
};

export const isUpcoming = (session: SessionType, now: Date): boolean =>
  (session.status === 'open' || session.status === 'scheduled') &&
  !session.awaiting_confirmation &&
  new Date(session.end_time) > now;

export const upcomingSessions = (
  sessions: SessionType[],
  now: Date,
): SessionType[] =>
  sessions
    .filter((s) => isUpcoming(s, now))
    .sort(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
    );

export interface WeekBucket {
  /** Monday of the week (local time) */
  start: Date;
  hours: number;
}

/** "2026-11-16" as local midnight (not UTC) */
const localDay = (iso: string): Date => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

/** Completed hours per week for the last 8 weeks, from the server's summary */
export const weeklyHours = (summary?: SessionSummary): WeekBucket[] =>
  (summary?.weeks || []).map((w) => ({ start: localDay(w.start), hours: w.hours }));

export interface SubjectShare {
  name: string;
  hours: number;
  share: number;
}

/** Completed hours per subject, largest first. */
export const subjectBreakdown = (
  summary: SessionSummary | undefined,
  limit = 4,
): SubjectShare[] => {
  // Several courses can share a subject name (IGCSE and IB Physics): one row
  const totals = new Map<string, number>();
  (summary?.subjects || []).forEach(({ course, hours }) => {
    const name = subjectName(course);
    if (name) totals.set(name, (totals.get(name) || 0) + hours);
  });
  const all = [...totals.entries()].sort((a, b) => b[1] - a[1]);
  const sum = all.reduce((acc, [, h]) => acc + h, 0) || 1;
  return all
    .slice(0, limit)
    .map(([name, hours]) => ({ name, hours, share: hours / sum }));
};

export interface StudentInsights {
  hoursLearned: number;
  completed: number;
  missed: number;
  canceled: number;
  /** completed / (completed + missed); null when there is no history */
  attendanceRate: number | null;
  hoursRemaining: number;
  hoursPurchased: number;
  activePackages: number;
  hoursThisMonth: number;
}

export const studentInsights = (
  summary: SessionSummary | undefined,
  packages: Package[],
): StudentInsights => {
  const totals = summary?.totals;
  const completed = totals?.completed || 0;
  const missed = totals?.missed || 0;
  return {
    hoursLearned: totals?.hours_completed || 0,
    completed,
    missed,
    canceled: totals?.cancelled || 0,
    attendanceRate:
      completed + missed > 0 ? completed / (completed + missed) : null,
    hoursRemaining: packages.reduce((acc, p) => acc + hoursLeft(p), 0),
    hoursPurchased: packages.reduce(
      (acc, p) => acc + (Number(p.original_hours) || 0),
      0,
    ),
    activePackages: packages.filter((p) => hoursLeft(p) > 0).length,
    hoursThisMonth: totals?.hours_this_month || 0,
  };
};

/**
 * Hours as the Admin shows them: halves and quarters exact (0.75, not 0.8),
 * at most two decimals, no trailing zeros.
 */
export const formatHours = (hours: number): string =>
  String(Math.round((Number(hours) || 0) * 100) / 100);
