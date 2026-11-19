import { describe, expect, it } from 'vitest';
import {
  hoursAccounted,
  hoursBooked,
  hoursBought,
  hoursFree,
  hoursLeft,
  hoursLeftShare,
} from './package-hours';

const hours = (over: Record<string, number> = {}) => ({
  bought: 24,
  moved_out: 0,
  used: 0,
  scheduled: 0,
  unscheduled: 0,
  charged: 0,
  refunded: 0,
  ...over,
});

describe('package hours: one rule on every page', () => {
  it('hours left = booked + free to book, like the server and the Admin', () => {
    // Chemistry with Saeed on the catch-up copy: 59 used of 24 bought
    // (hours added outside a sale), 2 booked, 10 free
    const pkg = {
      original_hours: 24,
      remaining_hours: 10,
      hours: hours({ used: 59, scheduled: 2, unscheduled: 10 }),
    };
    expect(hoursLeft(pkg)).toBe(12);
    expect(hoursBooked(pkg)).toBe(2);
    expect(hoursFree(pkg)).toBe(10);
  });

  it('ignores bought − used when old sessions were never imported', () => {
    // Physics 199 h: only 22 h of sessions imported, nothing left to book.
    // The old rule said 177 h left; the family page (server) says 0.
    const pkg = {
      original_hours: 199,
      remaining_hours: 0,
      hours: hours({ bought: 199, used: 22 }),
    };
    expect(hoursLeft(pkg)).toBe(0);
    expect(hoursLeftShare(pkg)).toBe(0);
  });

  it('works from the balance alone when the answer has no hours block', () => {
    expect(hoursLeft({ remaining_hours: '3.5', scheduled_hours: 1 })).toBe(4.5);
    expect(hoursLeft({ remaining_hours: null })).toBe(0);
  });

  it('never goes below zero and keeps quarter hours exact', () => {
    const pkg = { hours: hours({ unscheduled: -1, scheduled: 0.25 }) };
    expect(hoursLeft(pkg)).toBe(0.25);
    expect(
      hoursLeft({ hours: hours({ unscheduled: 0.1, scheduled: 0.2 }) }),
    ).toBe(0.3);
  });

  it('ring: left out of bought, capped at full', () => {
    expect(hoursBought({ original_hours: 24 })).toBe(24);
    expect(hoursLeftShare({ hours: hours({ unscheduled: 6 }) })).toBe(0.25);
    // More left than bought (hours granted) still draws a full ring, not more
    expect(hoursLeftShare({ hours: hours({ unscheduled: 30 }) })).toBe(1);
    expect(
      hoursLeftShare({ hours: hours({ bought: 0, unscheduled: 3 }) }),
    ).toBe(0);
  });

  it('bar: used + booked + free + charged + refunded add up', () => {
    const pkg = {
      hours: hours({
        used: 10,
        scheduled: 2,
        unscheduled: 8,
        charged: 1,
        refunded: 3,
      }),
    };
    expect(hoursAccounted(pkg)).toBe(24);
  });
});
