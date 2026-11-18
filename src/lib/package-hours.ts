/**
 * "Hours left" means the same everywhere, as in the Admin: the hours the
 * family still owns on a package, booked sessions included. The stored
 * `remaining_hours` is only the part still free to book (it drops when a
 * session is booked), so on its own it read "0 of 15 left" on a package
 * with 12 hours booked.
 *
 *   hoursLeft(pkg)   bought less moved out and taught (= booked + free)
 *   hoursBooked(pkg) booked sessions not closed yet
 *   hoursFree(pkg)   free to book (what Request sessions can still use)
 */
type WithHours = {
  remaining_hours?: number | string | null;
  hours?: {
    bought?: number | null;
    moved_out?: number | null;
    used?: number | null;
    scheduled?: number | null;
    unscheduled?: number | null;
  } | null;
  /** Some answers (renewal options) carry the booked hours on their own */
  scheduled_hours?: number | null;
};

const num = (value: unknown): number => Number(value) || 0;

export const hoursFree = (pkg: WithHours): number =>
  Math.max(0, num(pkg.hours?.unscheduled ?? pkg.remaining_hours));

export const hoursBooked = (pkg: WithHours): number =>
  Math.max(0, num(pkg.hours?.scheduled ?? pkg.scheduled_hours));

/** The server's own rule (Families::Overview, the Admin's "left"): bought,
 * less hours a tutor change moved away, less what was taught or missed */
export const hoursLeft = (pkg: WithHours): number => {
  const h = pkg.hours;
  const left =
    h && h.bought != null
      ? num(h.bought) - num(h.moved_out) - num(h.used)
      : hoursFree(pkg) + hoursBooked(pkg);
  return Math.max(0, Math.round(left * 100) / 100);
};
