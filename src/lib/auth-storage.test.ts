import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearAuthStorage, saveTokens } from './auth-storage';
import { blockedStorage, memoryStorage } from '../test/memory-storage';

const SESSION = {
  'tyro.token': 'old-access',
  'tyro.refreshToken': 'old-refresh',
  'tyro.expireAt': '1',
  'tyro.type': 'Parent',
  'tyro.id': '7',
  'persist:root': '{"user":"{}"}',
  i18nextLng: 'ar',
  'nafham.child': '3',
};

describe('auth storage', () => {
  beforeEach(() => vi.stubGlobal('localStorage', memoryStorage(SESSION)));
  afterEach(() => vi.unstubAllGlobals());

  it('saves the tokens it is given and keeps the others', () => {
    saveTokens({ accessToken: 'new-access', refreshToken: null });
    expect(localStorage.getItem('tyro.token')).toBe('new-access');
    expect(localStorage.getItem('tyro.refreshToken')).toBe('old-refresh');
    expect(localStorage.getItem('tyro.expireAt')).toBe('1');
  });

  it('clears the session but not the language or the stored user', () => {
    clearAuthStorage();
    [
      'tyro.token',
      'tyro.refreshToken',
      'tyro.expireAt',
      'tyro.type',
      'tyro.id',
    ].forEach((key) => expect(localStorage.getItem(key)).toBeNull());
    expect(localStorage.getItem('persist:root')).not.toBeNull();
    expect(localStorage.getItem('i18nextLng')).toBe('ar');
  });

  it('clears the stored user when asked', () => {
    clearAuthStorage({ persistedUser: true });
    expect(localStorage.getItem('persist:root')).toBeNull();
    expect(localStorage.getItem('i18nextLng')).toBe('ar');
  });

  it('does not throw when storage is blocked', () => {
    vi.stubGlobal('localStorage', blockedStorage());
    expect(() => clearAuthStorage({ persistedUser: true })).not.toThrow();
  });
});
