/**
 * The tutor's day as a ruler (23 Nov 2026): today's sessions placed by the
 * hour, where "now" falls, and the hour marks. Kept apart so it can be tested.
 */

export interface RulerSession {
  id: number;
  start_time: string;
  end_time: string;
  status: string;
}

export interface RulerBlock<S extends RulerSession> {
  session: S;
  /** Where it starts and how wide it is, in % of the ruler */
  start: number;
  width: number;
  past: boolean;
  live: boolean;
  /** Row on the ruler: sessions that overlap go one under the other */
  lane: number;
}

export interface RulerDay<S extends RulerSession> {
  from: number;
  to: number;
  marks: { hour: number; at: number }[];
  blocks: RulerBlock<S>[];
  /** % of the ruler, or null when now is outside it */
  now: number | null;
  lanes: number;
}

const HOUR = 60 * 60 * 1000;
/** The ruler shows at least this many hours, so a short day isn't stretched */
const MIN_SPAN = 6;

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** Today's sessions (not cancelled), an hour of room either side */
export const buildRulerDay = <S extends RulerSession>(
  sessions: S[],
  now: Date = new Date(),
): RulerDay<S> | null => {
  const todays = sessions
    .filter(
      (s) => s.status !== 'cancelled' && sameDay(new Date(s.start_time), now),
    )
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
  if (todays.length === 0) return null;

  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const hourOf = (iso: string) =>
    (new Date(iso).getTime() - midnight.getTime()) / HOUR;

  // Starts at "now" when that is earlier, so the wait until the first
  // session shows; an hour of room before the first session otherwise
  const nowHourOfDay = (now.getTime() - midnight.getTime()) / HOUR;
  let from = Math.max(
    0,
    Math.min(
      Math.floor(hourOf(todays[0].start_time)) - 1,
      Math.floor(nowHourOfDay),
    ),
  );
  let to = Math.min(
    24,
    Math.ceil(Math.max(...todays.map((s) => hourOf(s.end_time)))) + 1,
  );
  if (to - from < MIN_SPAN) {
    const grow = MIN_SPAN - (to - from);
    from = Math.max(0, from - Math.ceil(grow / 2));
    to = Math.min(24, from + MIN_SPAN);
  }
  const span = to - from;
  const at = (hour: number) => ((hour - from) / span) * 100;

  const marks = [];
  for (let hour = from % 2 ? from + 1 : from; hour <= to; hour += 2) {
    marks.push({ hour, at: at(hour) });
  }

  // Each session takes the first row free at its start
  const laneEnds: number[] = [];
  const lanes = todays.map((session) => {
    const start = hourOf(session.start_time);
    let lane = laneEnds.findIndex((end) => end <= start);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = hourOf(session.end_time);
    return lane;
  });

  const nowHour = nowHourOfDay;
  return {
    lanes: laneEnds.length,
    from,
    to,
    marks,
    now: nowHour >= from && nowHour <= to ? at(nowHour) : null,
    blocks: todays.map((session, index) => {
      const start = hourOf(session.start_time);
      const end = hourOf(session.end_time);
      const live = session.status === 'open';
      return {
        session,
        start: at(start),
        width: ((end - start) / span) * 100,
        live,
        lane: lanes[index],
        past:
          !live &&
          (session.status === 'completed' ||
            session.status === 'missed' ||
            new Date(session.end_time).getTime() <= now.getTime()),
      };
    }),
  };
};
