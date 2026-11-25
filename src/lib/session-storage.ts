/**
 * What is wiped from this browser when a session ends, and what stays.
 *
 * Signing out used to empty localStorage outright. Now that the buy basket
 * and the trial draft live there, that would also throw away a basket the
 * same person comes back to, and the id that ties a visitor's steps
 * together for the funnel numbers. So:
 * - kept: the visitor id (`tyro.visitorId`, nothing personal in it) and the
 *   buy drafts, which are filed per account (`tyro.buyDraft.<user id>`) and
 *   only ever read by that account;
 * - gone: everything else, including the trial draft, which is not filed
 *   per account and can hold a note and a parent's phone number.
 */
const KEEP_EXACT = ['tyro.visitorId'];
const KEEP_PREFIXES = ['tyro.buyDraft.'];
/** Not filed per account: must not outlive the session that wrote them */
const PERSONAL_DRAFTS = ['tyro.trialDraft'];

const kept = (key: string) =>
  KEEP_EXACT.includes(key) ||
  KEEP_PREFIXES.some((prefix) => key.startsWith(prefix));

/** Sign-out: clear the browser's storage except what is safe to keep */
export const clearLocalSession = () => {
  try {
    const saved: [string, string][] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key || !kept(key)) continue;
      const value = localStorage.getItem(key);
      if (value !== null) saved.push([key, value]);
    }
    localStorage.clear();
    saved.forEach(([key, value]) => localStorage.setItem(key, value));
  } catch {
    // Storage unavailable: nothing was kept in the first place
  }
  forgetPersonalDrafts();
};

/** A session that expired: the tokens go elsewhere; these go here */
export const forgetPersonalDrafts = () => {
  try {
    PERSONAL_DRAFTS.forEach((key) => localStorage.removeItem(key));
    sessionStorage.removeItem('tyro.trialAutoSend');
  } catch {
    // Nothing to forget
  }
};
