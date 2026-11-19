/**
 * Small rules behind the family home (19 Nov 2026), kept apart so they can
 * be tested: the greeting, and which packages a child's card shows.
 */

/** Packages at or under this many hours left are "low" (renew soon) */
export const LOW_HOURS = 2;

/** How many packages with hours left a card shows before "Show all" */
export const PACKAGES_SHOWN = 5;

export type Greeting = 'GREET_MORNING' | 'GREET_AFTERNOON' | 'GREET_EVENING';

/** Morning until noon, afternoon until 5 pm, evening after (local time) */
export const greetingKey = (hour: number): Greeting =>
  hour < 12 ? 'GREET_MORNING' : hour < 17 ? 'GREET_AFTERNOON' : 'GREET_EVENING';

type WithHoursLeft = { id: number; hours_left: number };

export interface PackageSplit<P> {
  /** Packages with hours left, most hours first */
  withHours: P[];
  /** The ones the card shows before "Show all" */
  shown: P[];
  /** How many more have hours left beyond `shown` */
  moreLeft: number;
  /** Packages with nothing left */
  usedUp: P[];
  /** Packages with a little left (renew soon) */
  low: P[];
}

/**
 * The card shows the packages that still have hours, most first, and keeps
 * the used-up ones behind "Show all" (a family had 17 of them, each with its
 * own Renew button, on 19 Nov 2026).
 */
export const splitPackages = <P extends WithHoursLeft>(
  packages: P[],
  shown: number = PACKAGES_SHOWN,
): PackageSplit<P> => {
  const withHours = packages
    .filter((pkg) => pkg.hours_left > 0)
    .sort((a, b) => b.hours_left - a.hours_left || a.id - b.id);
  return {
    withHours,
    shown: withHours.slice(0, shown),
    moreLeft: Math.max(0, withHours.length - shown),
    usedUp: packages.filter((pkg) => !(pkg.hours_left > 0)),
    low: withHours.filter((pkg) => pkg.hours_left <= LOW_HOURS),
  };
};

/** Hours as people read them: 16.5, 0.25, 12 (never 16.499999) */
export const hoursText = (hours: number): string =>
  String(Math.round((Number(hours) || 0) * 100) / 100);
