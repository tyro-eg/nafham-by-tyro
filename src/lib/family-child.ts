/**
 * Which child a parent is looking at: one child's id, or "all" for every
 * child at once. Stored per browser and sent on every request as the
 * X-Child-Id header, so the student pages serve that choice.
 */
const KEY = 'nafham.child';
const EVENT = 'nafham:child-changed';

export const ALL_CHILDREN = 'all';
export type ActiveChild = number | typeof ALL_CHILDREN;

export const getActiveChildId = (): ActiveChild | null => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return raw === ALL_CHILDREN ? ALL_CHILDREN : Number(raw);
  } catch {
    return null;
  }
};

export const setActiveChildId = (id: ActiveChild | null) => {
  try {
    if (id === null) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, String(id));
  } catch {
    // storage unavailable: the header is simply not sent
  }
  window.dispatchEvent(new Event(EVENT));
};

export const onActiveChildChange = (listener: () => void) => {
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
};
