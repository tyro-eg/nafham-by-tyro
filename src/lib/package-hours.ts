/**
 * "Hours left" means the same on every page, as in the server
 * (Families::Overview) and the Admin: the hours the family still owns on a
 * package = booked (not taken yet) + free to book.
 *
 * It used to be "bought less taught" here, which ignores hours added, charged
 * for late changes or refunded outside a sale, and old sessions that were
 * never imported: one package read 177 h left on My Packages and 0 on the
 * family page, and one child 425 h on the dashboard and 16.5 h for the
 * parent (19 Nov 2026).
 *
 *   hoursLeft(pkg)   booked + free to book
 *   hoursBooked(pkg) booked sessions not closed yet
 *   hoursFree(pkg)   free to book (what Request sessions can still use)
 *   hoursBought(pkg) what the ring and "x of y" compare against
 */
type WithHours = {
  remaining_hours?: number | string | null;
  original_hours?: number | string | null;
  hours?: {
    bought?: number | null;
    moved_out?: number | null;
    used?: number | null;
    scheduled?: number | null;
    unscheduled?: number | null;
    charged?: number | null;
    refunded?: number | null;
  } | null;
  /** Some answers (renewal options) carry the booked hours on their own */
  scheduled_hours?: number | null;
};

const num = (value: unknown): number => Number(value) || 0;
const round = (value: number): number => Math.round(value * 100) / 100;

export const hoursFree = (pkg: WithHours): number =>
  Math.max(0, num(pkg.hours?.unscheduled ?? pkg.remaining_hours));

export const hoursBooked = (pkg: WithHours): number =>
  Math.max(0, num(pkg.hours?.scheduled ?? pkg.scheduled_hours));

export const hoursLeft = (pkg: WithHours): number =>
  round(hoursFree(pkg) + hoursBooked(pkg));

/** Hours bought on the package (top-ups included), for "x of y" and rings */
export const hoursBought = (pkg: WithHours): number =>
  Math.max(0, num(pkg.hours?.bought ?? pkg.original_hours));

/** How full the ring is: hours left out of hours bought, 0 to 1 */
export const hoursLeftShare = (pkg: WithHours): number => {
  const bought = hoursBought(pkg);
  return bought > 0 ? Math.min(1, hoursLeft(pkg) / bought) : 0;
};

/**
 * Everything the hours went to, for the used / booked / free bar (the
 * Admin's bar): late-change charges and refunds count too, so the three
 * colours add up even when hours were added or taken outside a sale.
 */
export const hoursAccounted = (pkg: WithHours): number => {
  const h = pkg.hours;
  return round(
    num(h?.used) +
      hoursBooked(pkg) +
      hoursFree(pkg) +
      num(h?.charged) +
      num(h?.refunded),
  );
};
