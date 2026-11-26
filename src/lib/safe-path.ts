/**
 * Page and request addresses as they may be reported outside (analytics,
 * error tracking). A few of ours carry a secret:
 * - /activate/<token>: the activation link. For a teacher the token alone
 *   sets the password, and it lasts for days. The API calls behind the page
 *   (/activations/<token>) carry the same token.
 * - /impersonate?token=…: staff "open as", a session token in the query.
 * - /handoff#code=…: the mobile app's single-use sign-in code.
 * Reported addresses name the route instead of the secret.
 */
const TOKEN_SEGMENT = /\/(activate|activations)\/[^/?#\s]+/g;
const IMPERSONATE_QUERY = /(\/impersonate\/?)\?[^#\s]*/g;
const HANDOFF_HASH = /(\/handoff\/?)#\S*/g;

/** A path or a full address with its secrets taken out */
export const safePath = (path: string): string =>
  path
    .replace(TOKEN_SEGMENT, '/$1/:token')
    .replace(IMPERSONATE_QUERY, '$1')
    .replace(HANDOFF_HASH, '$1');

const MAX_DEPTH = 12;

/**
 * The same, for every text inside a report (an error-tracking event with
 * its breadcrumbs, spans and request). Changes the report in place.
 */
export const scrubAddresses = <T>(report: T, depth = 0): T => {
  if (typeof report === 'string') return safePath(report) as T;
  if (!report || typeof report !== 'object' || depth > MAX_DEPTH) return report;
  const holder = report as Record<string, unknown>;
  for (const key of Object.keys(holder)) {
    const value = holder[key];
    if (typeof value === 'string') {
      const safe = safePath(value);
      if (safe !== value) holder[key] = safe;
    } else if (value && typeof value === 'object') {
      scrubAddresses(value, depth + 1);
    }
  }
  return report;
};
