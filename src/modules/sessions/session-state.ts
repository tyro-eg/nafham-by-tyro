/**
 * One place that decides what a session is doing right now, so cards,
 * dashboards and notifications agree: upcoming, starting soon, live,
 * waiting for confirmation, or finished.
 */
import { useEffect, useRef, useState } from 'react';
import { SessionType } from '../../assets/types';
import { snackActions } from '../../assets/utils/toaster';

export type SessionPhase =
  | 'upcoming'
  | 'starting_soon'
  | 'live'
  | 'awaiting'
  | 'completed'
  | 'missed'
  | 'cancelled';

/** Tutors can open the meeting this long before the start (the host link window) */
export const TUTOR_EARLY_MINUTES = 15;
/** After this, a session nobody closed is treated as missed (the server does the same) */
export const AWAITING_HOURS = 72;

const minutesUntil = (iso: string, now: Date) =>
  (new Date(iso).getTime() - now.getTime()) / 60_000;

export const sessionPhase = (session: SessionType, now: Date): SessionPhase => {
  const status = session.status as string;
  if (status === 'canceled' || status === 'cancelled') return 'cancelled';
  if (status === 'completed') return 'completed';
  if (status === 'missed') return 'missed';

  const end = new Date(session.end_time);
  const over = end <= now;
  const stale = now.getTime() - end.getTime() > AWAITING_HOURS * 3_600_000;
  if (status === 'open') {
    if (!over && !session.awaiting_confirmation) return 'live';
    return stale ? 'missed' : 'awaiting';
  }
  // scheduled: the server decides missed/completed after the end, never the app
  if (over) return stale ? 'missed' : 'awaiting';
  return minutesUntil(session.start_time, now) <= TUTOR_EARLY_MINUTES
    ? 'starting_soon'
    : 'upcoming';
};

/**
 * Whether this viewer can open the meeting now. The tutor starts it as host
 * up to 15 minutes early; the student joins once the session is live.
 */
export const canJoin = (
  session: SessionType,
  now: Date,
  isInstructor: boolean,
): boolean => {
  if (!session.session_link) return false;
  const phase = sessionPhase(session, now);
  if (phase === 'live') return true;
  return isInstructor && phase === 'starting_soon';
};

/** The other person in the session, as seen by the current user */
export const counterpartName = (
  session: SessionType,
  currentUserId: number | undefined,
): string => {
  const person =
    session.tutor?.id === currentUserId ? session.student : session.tutor;
  return [person?.first_name, person?.last_name].filter(Boolean).join(' ');
};

/** Minutes since the session started (0 when it has not) */
export const minutesSinceStart = (session: SessionType, now: Date) =>
  Math.max(0, Math.floor(-minutesUntil(session.start_time, now)));

/** A clock that ticks every `intervalMs`, so countdowns move without a refresh */
export const useNow = (intervalMs = 30_000): Date => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);
  return now;
};

/**
 * Shows a toast the moment one of these sessions goes live (status flips to
 * open while polling), so nobody has to watch the list.
 */
export const useLiveSessionToast = (
  sessions: SessionType[] | undefined,
  message: (session: SessionType) => string,
) => {
  const known = useRef<Map<number, string>>(new Map());
  const primed = useRef(false);
  useEffect(() => {
    if (!sessions) return;
    const now = new Date();
    sessions.forEach((session) => {
      const previous = known.current.get(session.id);
      const phase = sessionPhase(session, now);
      if (
        primed.current &&
        previous &&
        previous !== 'live' &&
        phase === 'live'
      ) {
        snackActions.info(message(session), { autoHideDuration: 15_000 });
      }
      known.current.set(session.id, phase);
    });
    primed.current = true;
  }, [sessions, message]);
};
