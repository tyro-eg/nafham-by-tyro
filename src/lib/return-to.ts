/**
 * Where a signed-out visitor was going when a page asked them to sign in
 * (a buy link from an email, a receipt), so login and register can take
 * them there instead of to their home page. Kept for a short while only: an
 * old destination must not hijack a later, unrelated sign-in.
 */
const KEY = 'tyro.returnTo';
const TTL_MS = 30 * 60 * 1000;

/** Only paths inside this site: "/buy?child=1", never "//evil.example" */
export const isSafePath = (path: unknown): path is string =>
  typeof path === 'string' &&
  path.startsWith('/') &&
  !path.startsWith('//') &&
  !path.includes('\\');

/** Pages that would bounce a signed-in person straight back out */
const POINTLESS = ['/login', '/register', '/'];

export const rememberReturnTo = (path: string, now: number = Date.now()) => {
  if (!isSafePath(path) || POINTLESS.includes(path.split('?')[0])) return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ path, at: now }));
  } catch {
    // Private mode: they land on their home page, as before
  }
};

/** The remembered destination, still there for the next reader */
export const peekReturnTo = (now: number = Date.now()): string | null => {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as { path?: unknown; at?: unknown };
    if (typeof saved.at !== 'number' || now - saved.at > TTL_MS) return null;
    return isSafePath(saved.path) ? saved.path : null;
  } catch {
    return null;
  }
};

export const clearReturnTo = () => {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to clear
  }
};
