import type { Package, SessionType } from '../../assets/types';

const HOUR_MS = 60 * 60 * 1000;
const WEEK_MS = 7 * 24 * HOUR_MS;

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
  session.status === 'open' ||
  (session.status === 'scheduled' && new Date(session.end_time) > now);

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

const startOfWeek = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // Monday as the first day of the week
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return d;
};

/** Completed learning hours per week for the last `weeks` weeks. */
export const weeklyHours = (
  sessions: SessionType[],
  now: Date,
  weeks = 8,
): WeekBucket[] => {
  const thisWeek = startOfWeek(now);
  const buckets: WeekBucket[] = Array.from({ length: weeks }, (_, i) => ({
    start: new Date(thisWeek.getTime() - (weeks - 1 - i) * WEEK_MS),
    hours: 0,
  }));
  const first = buckets[0].start.getTime();

  sessions
    .filter((s) => s.status === 'completed')
    .forEach((s) => {
      const t = new Date(s.start_time).getTime();
      if (t < first) return;
      const index = Math.floor((t - first) / WEEK_MS);
      if (index >= 0 && index < weeks) buckets[index].hours += sessionHours(s);
    });

  return buckets;
};

export interface SubjectShare {
  name: string;
  hours: number;
  share: number;
}

/** Completed hours per subject, largest first. */
export const subjectBreakdown = (
  sessions: SessionType[],
  limit = 4,
): SubjectShare[] => {
  const totals = new Map<string, number>();
  sessions
    .filter((s) => s.status === 'completed')
    .forEach((s) => {
      const name = subjectName(s.grade_subject?.full_course_name);
      if (!name) return;
      totals.set(name, (totals.get(name) || 0) + sessionHours(s));
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
  sessions: SessionType[],
  packages: Package[],
  now: Date,
): StudentInsights => {
  const completedSessions = sessions.filter((s) => s.status === 'completed');
  const completed = completedSessions.length;
  const missed = sessions.filter((s) => s.status === 'missed').length;
  const canceled = sessions.filter((s) => s.status === 'canceled').length;
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    hoursLearned: completedSessions.reduce(
      (acc, s) => acc + sessionHours(s),
      0,
    ),
    completed,
    missed,
    canceled,
    attendanceRate:
      completed + missed > 0 ? completed / (completed + missed) : null,
    hoursRemaining: packages.reduce(
      (acc, p) => acc + (Number(p.remaining_hours) || 0),
      0,
    ),
    hoursPurchased: packages.reduce(
      (acc, p) => acc + (Number(p.original_hours) || 0),
      0,
    ),
    activePackages: packages.filter((p) => Number(p.remaining_hours) > 0)
      .length,
    hoursThisMonth: completedSessions
      .filter((s) => new Date(s.start_time) >= monthStart)
      .reduce((acc, s) => acc + sessionHours(s), 0),
  };
};

/** Round to at most one decimal, dropping a trailing ".0". */
export const formatHours = (hours: number): string =>
  String(Math.round(hours * 10) / 10);
