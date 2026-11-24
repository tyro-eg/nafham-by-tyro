import { describe, expect, it } from 'vitest';
import { sessionPhase } from './session-state';
import type { SessionType } from '../../assets/types';

const now = new Date('2026-11-19T12:00:00Z');
const hours = (h: number) =>
  new Date(now.getTime() + h * 3_600_000).toISOString();
const session = (status: string, startInHours: number, extra = {}) =>
  ({
    status,
    start_time: hours(startInHours),
    end_time: hours(startInHours + 1),
    ...extra,
  }) as unknown as SessionType;

describe('sessionPhase: only the server says missed', () => {
  it('a booked session nobody closed is awaiting, however long ago it ended', () => {
    expect(sessionPhase(session('scheduled', -2), now)).toBe('awaiting');
    // 6 days ago: it used to read "Session Missed" after 72 h
    expect(sessionPhase(session('scheduled', -6 * 24), now)).toBe('awaiting');
  });

  it('an open meeting that ended is awaiting, not missed', () => {
    expect(sessionPhase(session('open', -5 * 24), now)).toBe('awaiting');
    expect(sessionPhase(session('open', -0.5), now)).toBe('live');
  });

  it('missed, completed and cancelled come from the server status', () => {
    expect(sessionPhase(session('missed', -6 * 24), now)).toBe('missed');
    expect(sessionPhase(session('completed', -2), now)).toBe('completed');
    expect(sessionPhase(session('cancelled', 5), now)).toBe('cancelled');
  });

  it('sessions still to come are upcoming or starting soon', () => {
    expect(sessionPhase(session('scheduled', 5), now)).toBe('upcoming');
    expect(sessionPhase(session('scheduled', 0.1), now)).toBe('starting_soon');
  });
});
