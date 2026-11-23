/**
 * Where "Back" goes, and what it is called (23 Nov 2026: "back buttons on
 * all websites"). The page you came from in this tab when there is one,
 * named after it ("My Tutors"); opened from a link or a new tab, the page's
 * own list instead, so Back never leaves the website.
 */

/** The page shown before this one in this tab (kept by <BackTrail /> in Routes). */
let previous: string | null = null;
let current: string | null = null;

/** Called on every page change; a redirect (replace) does not count as a page you were on. */
export function recordPage(path: string, replaced: boolean) {
  if (path === current) return;
  if (!replaced && current) previous = current;
  current = path;
}

export const previousPage = () => previous;

/** For the tests. */
export function resetTrail() {
  previous = null;
  current = null;
}

/** Menu pages a Back can name, by the start of their address (NAVIGATION.* keys). */
const PLACES: Array<[string, string]> = [
  ['/my_instructors', 'NAVIGATION.MY_INSTRUCTORS'],
  ['/my_students', 'NAVIGATION.MY_STUDENTS'],
  ['/my_sessions', 'NAVIGATION.SESSIONS'],
  ['/my_packages', 'NAVIGATION.PACKAGES'],
  ['/homework', 'NAVIGATION.HOMEWORK'],
  ['/messages', 'NAVIGATION.MESSAGES'],
  ['/requests', 'NAVIGATION.REQUESTS'],
  ['/payments', 'NAVIGATION.PAYMENTS'],
  ['/family', 'NAVIGATION.FAMILY'],
  ['/account', 'NAVIGATION.ACCOUNT'],
  ['/dashboard', 'NAVIGATION.DASHBOARD'],
  ['/home', 'NAVIGATION.HOME'],
  ['/register', 'BACK_LINK.SIGN_UP'],
];

/** The words for a page, or null when it has no short name. */
export function placeKey(path: string | null | undefined): string | null {
  if (!path) return null;
  const pathname = path.split(/[?#]/)[0];
  if (pathname === '/') return 'NAVIGATION.HOME';
  const hit = PLACES.find(
    ([start]) => pathname === start || pathname.startsWith(`${start}/`),
  );
  return hit ? hit[1] : null;
}

export interface BackTarget {
  /** Go back in the tab's history (true) or open `to` (false). */
  useHistory: boolean;
  to: string;
  /** Translation key for the words on the button. */
  labelKey: string;
}

/**
 * canGoBack: this tab has a page before this one (react-router's first page
 * has the key "default"). fallback: the list to open otherwise.
 */
export function backTarget(
  canGoBack: boolean,
  fallback: string,
  prev: string | null = previous,
): BackTarget {
  if (canGoBack && prev)
    return {
      useHistory: true,
      to: prev,
      labelKey: placeKey(prev) ?? 'BACK_LINK.BACK',
    };
  return {
    useHistory: false,
    to: fallback,
    labelKey: placeKey(fallback) ?? 'BACK_LINK.BACK',
  };
}
