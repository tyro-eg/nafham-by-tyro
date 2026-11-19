import { describe, expect, it } from 'vitest';
import { greetingKey, hoursText, splitPackages } from './family-home.utils';

const pkg = (id: number, hours_left: number) => ({ id, hours_left });

describe('family home rules', () => {
  it('greets by the time of day', () => {
    expect(greetingKey(0)).toBe('GREET_MORNING');
    expect(greetingKey(11)).toBe('GREET_MORNING');
    expect(greetingKey(12)).toBe('GREET_AFTERNOON');
    expect(greetingKey(16)).toBe('GREET_AFTERNOON');
    expect(greetingKey(17)).toBe('GREET_EVENING');
    expect(greetingKey(23)).toBe('GREET_EVENING');
  });

  it('shows packages with hours left first, most hours first', () => {
    // Hani's family on the catch-up copy: 7 with hours (16.5 h), 17 used up
    const left = [12, 1, 0.5, 1, 1, 0.5, 0.5];
    const packages = [
      ...left.map((h, i) => pkg(i + 1, h)),
      ...Array.from({ length: 17 }, (_, i) => pkg(100 + i, 0)),
    ];
    const split = splitPackages(packages);
    expect(split.withHours.map((p) => p.hours_left)).toEqual([
      12, 1, 1, 1, 0.5, 0.5, 0.5,
    ]);
    expect(split.shown).toHaveLength(5);
    expect(split.moreLeft).toBe(2);
    expect(split.usedUp).toHaveLength(17);
    // 2 h or less is low: every one but the 12 h package
    expect(split.low).toHaveLength(6);
    expect(split.withHours.reduce((sum, p) => sum + p.hours_left, 0)).toBe(
      16.5,
    );
  });

  it('keeps the order steady when hours are equal', () => {
    const split = splitPackages([pkg(9, 1), pkg(3, 1), pkg(5, 1)]);
    expect(split.withHours.map((p) => p.id)).toEqual([3, 5, 9]);
  });

  it('handles no packages and all used up', () => {
    expect(splitPackages([]).shown).toEqual([]);
    const done = splitPackages([pkg(1, 0), pkg(2, 0)]);
    expect(done.withHours).toEqual([]);
    expect(done.usedUp).toHaveLength(2);
    expect(done.moreLeft).toBe(0);
  });

  it('writes hours without float noise', () => {
    expect(hoursText(0.1 + 0.2)).toBe('0.3');
    expect(hoursText(16.5)).toBe('16.5');
    expect(hoursText(12)).toBe('12');
  });
});
