import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  emptyDraft,
  firstDay,
  freshWhen,
  loadDraft,
  markAutoSend,
  openWindows,
  saveDraft,
  takeAutoSend,
  today,
  todayOver,
  tomorrow,
  wantedFirst,
} from './trial.types';
import { blockedStorage, memoryStorage } from '../../test/memory-storage';

/** Pins the clock to a local time today */
const at = (hours: number, minutes = 0) => {
  const now = new Date();
  now.setHours(hours, minutes, 0, 0);
  vi.useFakeTimers();
  vi.setSystemTime(now);
};

afterEach(() => {
  vi.useRealTimers();
});

describe('openWindows', () => {
  it('offers every window in the early morning', () => {
    at(5, 30);
    expect(openWindows('today', today())).toEqual([
      'any',
      'morning',
      'afternoon',
      'evening',
    ]);
  });

  it('drops the windows that have ended today', () => {
    at(13, 0);
    expect(openWindows('today', today())).toEqual([
      'any',
      'afternoon',
      'evening',
    ]);
  });

  it('keeps a window that is still running', () => {
    at(11, 59);
    expect(openWindows('today', today())).toContain('morning');
  });

  it('treats a picked date of today like today', () => {
    at(18, 0);
    expect(openWindows('date', today())).toEqual(['any', 'evening']);
  });

  it('offers every window on other days', () => {
    at(22, 0);
    expect(openWindows('tomorrow', tomorrow())).toHaveLength(4);
    expect(openWindows('flexible', tomorrow())).toHaveLength(4);
  });
});

describe('todayOver and firstDay', () => {
  it('keeps today until the last window ends', () => {
    at(22, 59);
    expect(todayOver()).toBe(false);
    expect(firstDay()).toBe(today());
  });

  it('moves to tomorrow once the last window has ended', () => {
    at(23, 0);
    expect(todayOver()).toBe(true);
    expect(firstDay()).toBe(tomorrow());
  });
});

describe('freshWhen', () => {
  it('resets an ended window to any time', () => {
    at(14, 0);
    expect(
      freshWhen({ day: 'today', date: today(), window: 'morning' }),
    ).toMatchObject({ day: 'today', window: 'any' });
  });

  it('keeps a window that is still open', () => {
    at(14, 0);
    expect(
      freshWhen({ day: 'today', date: today(), window: 'evening' }).window,
    ).toBe('evening');
  });

  it('moves today to tomorrow late at night', () => {
    at(23, 30);
    expect(
      freshWhen({ day: 'today', date: today(), window: 'morning' }),
    ).toMatchObject({ day: 'tomorrow', date: tomorrow(), window: 'morning' });
  });
});

describe('the saved trial draft', () => {
  const DAY = 24 * 60 * 60 * 1000;
  afterEach(() => vi.unstubAllGlobals());

  it('comes back in a new tab for a week, then starts again', () => {
    vi.stubGlobal('localStorage', memoryStorage());
    saveDraft({ ...emptyDraft(), courseId: 10, note: 'Algebra' }, 0);
    expect(loadDraft(6 * DAY)).toMatchObject({ courseId: 10, note: 'Algebra' });
    expect(loadDraft(8 * DAY).courseId).toBeUndefined();
  });

  it('starts empty without storage', () => {
    vi.stubGlobal('localStorage', blockedStorage());
    expect(() => saveDraft(emptyDraft())).not.toThrow();
    expect(loadDraft().courseId).toBeUndefined();
  });
});

describe('booking right after signing up', () => {
  const MINUTE = 60 * 1000;
  afterEach(() => vi.unstubAllGlobals());

  it('sends once, within a quarter of an hour of asking', () => {
    vi.stubGlobal('sessionStorage', memoryStorage());
    markAutoSend(0);
    expect(takeAutoSend(5 * MINUTE)).toBe(true);
    // Asked once: a reload does not book a second trial
    expect(takeAutoSend(5 * MINUTE)).toBe(false);
  });

  it('does nothing when they never asked, or came back much later', () => {
    vi.stubGlobal('sessionStorage', memoryStorage());
    expect(takeAutoSend(0)).toBe(false);
    markAutoSend(0);
    expect(takeAutoSend(20 * MINUTE)).toBe(false);
  });

  it('leaves the button to them when storage is blocked', () => {
    vi.stubGlobal('sessionStorage', blockedStorage());
    expect(() => markAutoSend(0)).not.toThrow();
    expect(takeAutoSend(0)).toBe(false);
  });
});

describe('wantedFirst', () => {
  const tutors = [{ id: 1 }, { id: 2 }, { id: 3 }];

  it('puts the tutor from the profile first and keeps the rest in order', () => {
    expect(wantedFirst(tutors, 3)).toEqual([{ id: 3 }, { id: 1 }, { id: 2 }]);
  });

  it('changes nothing when that tutor is not free, or none was asked for', () => {
    expect(wantedFirst(tutors, 9)).toBe(tutors);
    expect(wantedFirst(tutors, undefined)).toBe(tutors);
    expect(wantedFirst(undefined, 3)).toBeUndefined();
  });
});
