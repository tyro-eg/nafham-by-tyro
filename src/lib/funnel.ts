/**
 * The steps a visitor takes toward a trial and a purchase, reported to our
 * own backend (the `funnel_events` table) so the team can see where people
 * drop out. Before sign-in a step carries only an id this browser made up;
 * after it, the same id goes along with the account, which ties the two.
 * The server adds the milestones it knows for itself (signed up, trial
 * booked, paid). Reporting never gets in the visitor's way: failures are
 * swallowed and nothing waits for it.
 *
 * Nothing is reported while staff view the site as a customer ("open as"):
 * those steps would be counted as the family's own, and would tie the staff
 * member's browser to the family's account.
 */
import { post } from '../assets/utils/api';
import { AUTH_KEYS } from './auth-storage';
import { inStaffView } from './staff-view';

/** What a client may report (FunnelEvent::CLIENT_NAMES on the server) */
export type FunnelStep =
  | 'landing_viewed'
  | 'trial_started'
  | 'trial_step_viewed'
  | 'trial_submitted'
  | 'signup_started'
  | 'buy_started'
  | 'buy_step_viewed'
  | 'buy_line_added'
  | 'first_lessons_viewed';

export type FunnelProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

interface QueuedEvent {
  name: FunnelStep;
  properties: Record<string, string | number | boolean>;
}

const ID_KEY = 'tyro.visitorId';
const ID_LENGTH = 22;
const ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
/** Steps taken close together go out in one request */
const FLUSH_MS = 800;
/** The server takes this many per request */
export const MAX_BATCH = 20;

/** A fresh random id, e.g. "q3ZkT0b1Yw9LmN2xAaBcDe" */
export const newVisitorId = (): string => {
  const bytes = new Uint8Array(ID_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join('');
};

/** This browser's id, made on first use and kept; null when storage is blocked */
export const visitorId = (): string | null => {
  try {
    const saved = localStorage.getItem(ID_KEY);
    if (saved && /^[A-Za-z0-9_-]{8,64}$/.test(saved)) return saved;
    const fresh = newVisitorId();
    localStorage.setItem(ID_KEY, fresh);
    return fresh;
  } catch {
    return null;
  }
};

const signedIn = (): boolean => {
  try {
    return !!localStorage.getItem(AUTH_KEYS.TOKEN);
  } catch {
    return false;
  }
};

/** Only what the server keeps: short text, numbers and yes/no */
const clean = (properties: FunnelProperties): QueuedEvent['properties'] => {
  const kept: QueuedEvent['properties'] = {};
  for (const [key, value] of Object.entries(properties)) {
    if (value === null || value === undefined) continue;
    kept[key] = value;
  }
  return kept;
};

let queue: QueuedEvent[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

/** Sends what is waiting, now. Resolves whether or not it arrived. */
export const flushFunnel = async (): Promise<void> => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (queue.length === 0) return;
  // Staff view began while steps were waiting: they are not the family's
  if (inStaffView()) {
    queue = [];
    return;
  }
  const events = queue.slice(0, MAX_BATCH);
  queue = queue.slice(MAX_BATCH);
  const anonymous_id = visitorId();
  // No id and no account: the server has nobody to count this for
  if (!anonymous_id && !signedIn()) return;
  try {
    await post(signedIn() ? '/funnel_events' : '/public/funnel_events', {
      anonymous_id,
      platform: 'web',
      events,
    });
  } catch {
    // The numbers can miss a step; the visitor must not notice
  }
  if (queue.length > 0) await flushFunnel();
};

/** Reports one step; sent shortly after, together with its neighbours */
export const trackFunnel = (
  name: FunnelStep,
  properties: FunnelProperties = {},
): void => {
  if (inStaffView()) return;
  queue.push({ name, properties: clean(properties) });
  if (timer) return;
  timer = setTimeout(() => {
    timer = null;
    void flushFunnel();
  }, FLUSH_MS);
};

const ONCE_PREFIX = 'tyro.funnelOnce.';

/**
 * Reports a step once per run of a flow in this tab. The trial page is
 * mounted again when a visitor signs in half-way (the layout changes), and
 * that must not count as starting a second trial. `resetFunnelOnce` ends
 * the run (the trial was sent), so the next one counts again.
 */
export const trackFunnelOnce = (
  key: string,
  name: FunnelStep,
  properties: FunnelProperties = {},
): void => {
  // Not marked as counted either: the family's own run still counts
  if (inStaffView()) return;
  try {
    if (sessionStorage.getItem(ONCE_PREFIX + key)) return;
    sessionStorage.setItem(ONCE_PREFIX + key, '1');
  } catch {
    // No storage: counting it twice beats not counting it
  }
  trackFunnel(name, properties);
};

export const resetFunnelOnce = (key: string): void => {
  try {
    sessionStorage.removeItem(ONCE_PREFIX + key);
  } catch {
    // Nothing to reset
  }
};

// A step taken just before leaving (to Nomod's page, or closing the tab)
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void flushFunnel();
  });
}
