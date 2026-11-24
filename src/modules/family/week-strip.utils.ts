/**
 * The parent's "this week" timetable (23 Nov 2026): today and the next six
 * days, each child's sessions in their own colour, and where "now" falls
 * today. Kept apart from the page so the rules can be tested.
 */

export const WEEK_DAYS = 7;

export interface WeekSession {
  id: number;
  start_time: string;
  end_time: string;
  status: string;
  course_name: string;
  tutor_name: string;
}

export interface WeekChild<S extends WeekSession = WeekSession> {
  id: number;
  first_name: string;
  week?: S[];
}

export interface WeekEntry<S extends WeekSession, C extends WeekChild<S>> {
  session: S;
  child: C;
  color: string;
  /** Over, or closed as completed or missed */
  done: boolean;
  /** Happening now (the session is open) */
  live: boolean;
}

export interface WeekDay<S extends WeekSession, C extends WeekChild<S>> {
  date: Date;
  today: boolean;
  entries: WeekEntry<S, C>[];
  /** Today only: how many entries come before the "now" line */
  nowAfter: number | null;
}

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** Today and the next six days, in the browser's own time zone */
export const buildWeek = <S extends WeekSession, C extends WeekChild<S>>(
  children: C[],
  colorOf: (index: number) => string,
  now: Date = new Date(),
): WeekDay<S, C>[] => {
  const first = startOfDay(now);
  const days: WeekDay<S, C>[] = Array.from({ length: WEEK_DAYS }, (_, i) => ({
    date: new Date(first.getFullYear(), first.getMonth(), first.getDate() + i),
    today: i === 0,
    entries: [],
    nowAfter: null,
  }));
  const end = days[WEEK_DAYS - 1].date.getTime() + 24 * 60 * 60 * 1000;

  children.forEach((child, index) => {
    (child.week ?? []).forEach((session) => {
      const start = new Date(session.start_time);
      if (start.getTime() < first.getTime() || start.getTime() >= end) return;
      const day = days.find(
        (d) => d.date.getTime() === startOfDay(start).getTime(),
      );
      if (!day) return;
      const live = session.status === 'open';
      day.entries.push({
        session,
        child,
        color: colorOf(index),
        live,
        done:
          !live &&
          (session.status === 'completed' ||
            session.status === 'missed' ||
            new Date(session.end_time).getTime() <= now.getTime()),
      });
    });
  });

  days.forEach((day) =>
    day.entries.sort((a, b) =>
      a.session.start_time.localeCompare(b.session.start_time),
    ),
  );
  const today = days[0];
  today.nowAfter = today.entries.filter(
    (e) => new Date(e.session.start_time).getTime() <= now.getTime(),
  ).length;
  return days;
};

/** How many sessions the week holds that have not happened yet */
export const sessionsAhead = (days: WeekDay<WeekSession, WeekChild>[]) =>
  days.reduce((sum, day) => sum + day.entries.filter((e) => !e.done).length, 0);

export const FUEL_BLOCKS = 12;

/**
 * A package's hours as a fuel bar: twelve blocks for the whole package, the
 * filled ones for what is left. Anything left shows at least a sliver, so
 * "0.5 of 36 hours" never looks empty.
 */
export const fuelBlocks = (left: number, total: number): number[] => {
  const share = total > 0 ? Math.min(1, Math.max(0, left / total)) : 0;
  let filled = share * FUEL_BLOCKS;
  if (left > 0 && filled < 0.25) filled = 0.25;
  return Array.from({ length: FUEL_BLOCKS }, (_, i) =>
    Math.min(1, Math.max(0, filled - i)),
  );
};
