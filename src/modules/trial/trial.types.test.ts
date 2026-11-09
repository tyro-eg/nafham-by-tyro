import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  firstDay,
  freshWhen,
  openWindows,
  today,
  todayOver,
  tomorrow,
} from './trial.types';

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
