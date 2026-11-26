/**
 * What the activation page (/activate/<token>) works out for itself.
 *
 * The code step is remembered per link for as long as the tab lives: a
 * family asks for the code, switches to WhatsApp to read it, and the browser
 * often reloads the page when they come back. Without the memory the page
 * offered only "Send code" again, which the server refuses for a minute and
 * which then replaces the code they already hold.
 */
const ASKED_PREFIX = 'nafham.activateCode.';
/** The server sends another code a minute after the last (RESEND_AFTER) */
export const RESEND_SECONDS = 60;

/** The link's end is enough to tell links apart; the token is not copied */
const askedKey = (token: string) => ASKED_PREFIX + token.slice(-24);

/** A code was asked for with this link, now */
export const rememberCodeAsked = (token: string, now = Date.now()): void => {
  try {
    sessionStorage.setItem(askedKey(token), String(now));
  } catch {
    // No storage: a reload starts from "Send code", as before
  }
};

/** When a code was last asked for with this link in this tab, or null */
export const codeAskedAt = (token: string): number | null => {
  try {
    const at = Number(sessionStorage.getItem(askedKey(token)));
    return Number.isFinite(at) && at > 0 ? at : null;
  } catch {
    return null;
  }
};

/** The account is active: nothing left to remember */
export const forgetCodeAsked = (token: string): void => {
  try {
    sessionStorage.removeItem(askedKey(token));
  } catch {
    // Nothing to forget
  }
};

/** Seconds until another code may be asked for (0 = now) */
export const resendWait = (
  askedAt: number | null,
  now = Date.now(),
): number => {
  if (askedAt === null) return 0;
  const left = RESEND_SECONDS - Math.floor((now - askedAt) / 1000);
  return Math.min(RESEND_SECONDS, Math.max(0, left));
};
