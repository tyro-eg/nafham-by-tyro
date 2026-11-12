/**
 * The weekly times a payer gives when buying a course: which days, which
 * part of the day, how many lessons a week, in which time zone, plus a
 * note. The backend ranks tutors by how many open slots fall inside it and
 * hands it to support with the schedule request (Purchases::Schedule).
 * The windows mirror the trial wizard's TIME_WINDOWS.
 */
export const SCHEDULE_DAYS = [
  'sat',
  'sun',
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
] as const;
export type ScheduleDay = (typeof SCHEDULE_DAYS)[number];

export const SCHEDULE_WINDOWS = ['morning', 'afternoon', 'evening'] as const;
export type ScheduleWindow = (typeof SCHEDULE_WINDOWS)[number];

export const WINDOW_HOURS: Record<
  ScheduleWindow,
  { start: number; end: number }
> = {
  morning: { start: 6, end: 12 },
  afternoon: { start: 12, end: 17 },
  evening: { start: 17, end: 23 },
};

export const LESSONS_PER_WEEK = [1, 2, 3] as const;

export interface WeeklySchedule {
  days: ScheduleDay[];
  windows: ScheduleWindow[];
  lessons_per_week?: number;
  time_zone: string;
  note?: string;
}

/** The browser's IANA timezone, which the backend reads the windows in */
export const localTimeZone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Cairo';

export const emptySchedule = (): WeeklySchedule => ({
  days: [],
  windows: [],
  time_zone: localTimeZone(),
});

/** Nothing chosen: fine with a named tutor, not for a match */
export const scheduleIsEmpty = (schedule: WeeklySchedule) =>
  schedule.days.length === 0 && schedule.windows.length === 0;

/** The day's name in the UI language, from a fixed week (Sunday first) */
export const dayName = (day: ScheduleDay, locale: string, long = false) => {
  // 2026-11-01 is a Sunday
  const base = new Date(
    2026,
    10,
    1 + ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].indexOf(day),
  );
  return base.toLocaleDateString(locale, { weekday: long ? 'long' : 'short' });
};

/** "Sun, Tue · evening · 2 lessons a week", for the rail and the basket */
export const scheduleSummary = (
  schedule: WeeklySchedule,
  locale: string,
  labels: {
    window: (w: ScheduleWindow) => string;
    lessons: (n: number) => string;
  },
) => {
  const parts: string[] = [];
  if (schedule.days.length) {
    parts.push(schedule.days.map((day) => dayName(day, locale)).join(', '));
  }
  if (schedule.windows.length) {
    parts.push(schedule.windows.map(labels.window).join(' / '));
  }
  if (schedule.lessons_per_week)
    parts.push(labels.lessons(schedule.lessons_per_week));
  return parts.join(' · ');
};
