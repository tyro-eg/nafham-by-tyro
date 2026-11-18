/**
 * Whether this browser tab was opened by the mobile app's handoff (the
 * /handoff page sets it). Kept in sessionStorage, so it lasts as long as the
 * in-app browser and never leaks into a tab the payer opens themselves.
 * Checkouts started here say `client: 'mobile'`, group courses are not sold,
 * and the return page sends the payer back to the app.
 */
const KEY = 'tyro.fromApp';

/** Where the app listens for the end of a payment */
export const APP_PAYMENT_COMPLETE = 'nafham://payment-complete';

export const isFromApp = (): boolean => {
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
};

export const markFromApp = () => {
  try {
    sessionStorage.setItem(KEY, '1');
  } catch {
    // storage unavailable: the tab behaves as a normal website visit
  }
};

/** The app's deep link for a payment that has reached a final status */
export const appPaymentCompleteUrl = (slug: string, status: string) =>
  `${APP_PAYMENT_COMPLETE}?slug=${encodeURIComponent(slug)}&status=${encodeURIComponent(status)}`;

/** Group courses are sold by the team, never from the app's handoff */
export const blockedInApp = (packageType: string | null | undefined) =>
  packageType === 'group_course' && isFromApp();

/** The single-use code in /handoff#code=…, kept out of server logs */
export const readHandoffCode = (hash: string): string | null =>
  new URLSearchParams(hash.replace(/^#/, '')).get('code') || null;

/** Only a path on this site: never another origin (`//host`, or `/\host`, which browsers read the same way) */
export const safeNextPath = (next: unknown): string =>
  typeof next === 'string' &&
  next.startsWith('/') &&
  !next.startsWith('//') &&
  !next.startsWith('/\\')
    ? next
    : '/';
