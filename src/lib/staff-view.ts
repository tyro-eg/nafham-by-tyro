/**
 * Staff signed in as someone from the Admin ("open as"). The website shows a
 * banner the whole time, so nobody mistakes it for the person's own visit:
 * what staff do here (accepting terms, paying) is recorded as that person's.
 * The funnel steps are the exception: a staff member opening /trial or /buy
 * is not the family getting that far, so none are reported (funnel.ts).
 * Kept in localStorage next to the token; signing in or out, an expired
 * session and the mobile app's handoff clear it.
 */
const KEY = 'nafham.staffView';

export const setStaffView = (impersonatorEmail: string | null) => {
  try {
    localStorage.setItem(KEY, impersonatorEmail || 'staff');
  } catch {
    // Storage blocked: no banner, nothing else breaks
  }
};

export const clearStaffView = () => {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing to clear
  }
};

/** The staff member's email, 'staff' when unknown, or null */
export const getStaffView = (): string | null => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};

/** Staff are looking at the site as someone else right now */
export const inStaffView = (): boolean => getStaffView() !== null;
