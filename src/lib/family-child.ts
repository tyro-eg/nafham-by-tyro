/**
 * Which child a parent is looking at. Stored per browser and sent on every
 * request as the X-Child-Id header, so the student pages serve that child.
 */
const KEY = 'nafham.child';
const EVENT = 'nafham:child-changed';

export const getActiveChildId = (): number | null => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? Number(raw) : null;
  } catch {
    return null;
  }
};

export const setActiveChildId = (id: number | null) => {
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
