import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { memoryStorage } from '../test/memory-storage';

const STALE = {
  'tyro.token': 'expired',
  'tyro.refreshToken': 'expired',
  'tyro.expireAt': '1',
  'tyro.type': 'Student',
  'tyro.id': '9',
  'persist:root': '{"user":"{}"}',
  i18nextLng: 'en',
};

/** Loads the module fresh, as the entry point does on a page at `pathname` */
const loadOn = async (pathname: string) => {
  vi.resetModules();
  vi.stubGlobal('window', { location: { pathname } });
  return import('./handoff-reset');
};

describe('handoff reset', () => {
  beforeEach(() => vi.stubGlobal('localStorage', memoryStorage(STALE)));
  afterEach(() => vi.unstubAllGlobals());

  it('drops a stale session and stored user on /handoff', async () => {
    await loadOn('/handoff');
    Object.keys(STALE)
      .filter((key) => key !== 'i18nextLng')
      .forEach((key) => expect(localStorage.getItem(key)).toBeNull());
    expect(localStorage.getItem('i18nextLng')).toBe('en');
  });

  it('leaves the session alone anywhere else', async () => {
    await loadOn('/family');
    expect(localStorage.getItem('tyro.token')).toBe('expired');
    expect(localStorage.getItem('persist:root')).not.toBeNull();
  });

  it('knows the handoff page, with or without a trailing slash', async () => {
    const { isHandoffPath } = await loadOn('/');
    expect(isHandoffPath('/handoff')).toBe(true);
    expect(isHandoffPath('/handoff/')).toBe(true);
    expect(isHandoffPath('/handoffs')).toBe(false);
    expect(isHandoffPath('/family')).toBe(false);
  });
});
