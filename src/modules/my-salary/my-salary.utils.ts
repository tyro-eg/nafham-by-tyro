import type { Package, SessionType } from '../../assets/types';
import { sessionHours } from '../dashboard/dashboard.utils';

export interface CourseParts {
  curriculum: string;
  stage: string;
  subject: string;
}

/** "IGCSE - Grade 10 - Mathematics" -> curriculum / stage / subject */
export const splitCourse = (fullCourseName?: string): CourseParts => {
  const parts = (fullCourseName || '').split(' - ').map((p) => p.trim());
  if (parts.length >= 3) {
    return {
      curriculum: parts[0],
      stage: parts.slice(1, -1).join(' - '),
      subject: parts[parts.length - 1],
    };
  }
  if (parts.length === 2) {
    return { curriculum: parts[0], stage: '', subject: parts[1] };
  }
  return { curriculum: '', stage: '', subject: parts[0] || '' };
};

export interface Rate {
  /** Hourly rate, or null when no package gives a rate for the course */
  perHour: number | null;
  currency: string;
}

/**
 * Hourly rate for a session: the package for the same student and course
 * first, then the newest package for the same course.
 */
export const rateFor = (session: SessionType, packages: Package[]): Rate => {
  const courseId = session.grade_subject?.id;
  const sameCourse = packages
    .filter((p) => p.grade_subject?.id === courseId && p.tutor_rate != null)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  const match =
    sameCourse.find((p) => p.student?.id === session.student?.id) ||
    sameCourse[0];
  if (!match) return { perHour: null, currency: '' };
  return {
    perHour: Number(match.tutor_rate),
    currency: match.tutor_rate_currency || 'EGP',
  };
};

export interface SalaryLine {
  session: SessionType;
  course: CourseParts;
  hours: number;
  rate: Rate;
  amount: number;
}

export interface SalaryGroup {
  key: string;
  course: CourseParts;
  sessions: number;
  hours: number;
  rate: Rate;
  amount: number;
}

export interface SalaryReport {
  lines: SalaryLine[];
  groups: SalaryGroup[];
  hours: number;
  sessions: number;
  /** Totals per currency (normally just one) */
  totals: Record<string, number>;
  unpricedSessions: number;
  /** Scheduled sessions later this month, valued at the same rates */
  upcomingTotals: Record<string, number>;
  upcomingSessions: number;
}

const addTo = (totals: Record<string, number>, currency: string, v: number) => {
  totals[currency] = (totals[currency] || 0) + v;
};

/**
 * Earnings for one calendar month. For the current month only sessions up
 * to `now` count (month to date); later scheduled sessions are reported
 * separately as upcoming.
 */
export const buildSalaryReport = (
  sessions: SessionType[],
  packages: Package[],
  month: Date,
  now: Date,
): SalaryReport => {
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 1);
  const inMonth = (s: SessionType) => {
    const t = new Date(s.start_time);
    return t >= start && t < end;
  };

  const lines: SalaryLine[] = sessions
    .filter((s) => s.status === 'completed' && inMonth(s))
    .filter((s) => new Date(s.start_time) <= now)
    .sort(
      (a, b) =>
        new Date(b.start_time).getTime() - new Date(a.start_time).getTime(),
    )
    .map((session) => {
      const hours = sessionHours(session);
      const rate = rateFor(session, packages);
      return {
        session,
        course: splitCourse(session.grade_subject?.full_course_name),
        hours,
        rate,
        amount: rate.perHour === null ? 0 : hours * rate.perHour,
      };
    });

  const groupMap = new Map<string, SalaryGroup>();
  const totals: Record<string, number> = {};
  lines.forEach((line) => {
    const key = `${line.session.grade_subject?.id}|${line.rate.perHour}|${line.rate.currency}`;
    const group = groupMap.get(key) || {
      key,
      course: line.course,
      sessions: 0,
      hours: 0,
      rate: line.rate,
      amount: 0,
    };
    group.sessions += 1;
    group.hours += line.hours;
    group.amount += line.amount;
    groupMap.set(key, group);
    if (line.rate.perHour !== null) {
      addTo(totals, line.rate.currency, line.amount);
    }
  });

  const upcomingTotals: Record<string, number> = {};
  const upcoming = sessions.filter(
    (s) =>
      inMonth(s) &&
      new Date(s.start_time) > now &&
      (s.status === 'scheduled' || s.status === 'open'),
  );
  upcoming.forEach((s) => {
    const rate = rateFor(s, packages);
    if (rate.perHour !== null) {
      addTo(upcomingTotals, rate.currency, sessionHours(s) * rate.perHour);
    }
  });

  return {
    lines,
    groups: [...groupMap.values()].sort((a, b) => b.amount - a.amount),
    hours: lines.reduce((acc, l) => acc + l.hours, 0),
    sessions: lines.length,
    totals,
    unpricedSessions: lines.filter((l) => l.rate.perHour === null).length,
    upcomingTotals,
    upcomingSessions: upcoming.length,
  };
};
