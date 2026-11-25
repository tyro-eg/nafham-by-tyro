import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearLocalSession, forgetPersonalDrafts } from './session-storage';
import { blockedStorage, memoryStorage } from '../test/memory-storage';

describe('what a sign-out leaves in the browser', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'localStorage',
      memoryStorage({
        'tyro.token': 'secret',
        'tyro.refreshToken': 'secret',
        'persist:root': '{"user":"..."}',
        'tyro.visitorId': 'q3ZkT0b1Yw9LmN2xAaBcDe',
        'tyro.buyDraft.7': '{"basket":[1]}',
        'tyro.buyDraft.9': '{"basket":[2]}',
        'tyro.trialDraft': '{"note":"private","guardianPhone":"+971"}',
      }),
    );
    vi.stubGlobal(
      'sessionStorage',
      memoryStorage({ 'tyro.trialAutoSend': '1', 'tyro.fromApp': '1' }),
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it('wipes the session and anything personal not filed per account', () => {
    clearLocalSession();
    expect(localStorage.getItem('tyro.token')).toBeNull();
    expect(localStorage.getItem('tyro.refreshToken')).toBeNull();
    expect(localStorage.getItem('persist:root')).toBeNull();
    expect(localStorage.getItem('tyro.trialDraft')).toBeNull();
    expect(sessionStorage.getItem('tyro.trialAutoSend')).toBeNull();
  });

  it('keeps the visitor id and each account’s own basket', () => {
    clearLocalSession();
    expect(localStorage.getItem('tyro.visitorId')).toBe(
      'q3ZkT0b1Yw9LmN2xAaBcDe',
    );
    expect(localStorage.getItem('tyro.buyDraft.7')).toBe('{"basket":[1]}');
    expect(localStorage.getItem('tyro.buyDraft.9')).toBe('{"basket":[2]}');
    // Not ours to clear
    expect(sessionStorage.getItem('tyro.fromApp')).toBe('1');
  });

  it('an expired session forgets the trial draft and leaves the baskets', () => {
    forgetPersonalDrafts();
    expect(localStorage.getItem('tyro.trialDraft')).toBeNull();
    expect(sessionStorage.getItem('tyro.trialAutoSend')).toBeNull();
    expect(localStorage.getItem('tyro.buyDraft.7')).toBe('{"basket":[1]}');
  });

  it('never throws when storage is blocked', () => {
    vi.stubGlobal('localStorage', blockedStorage());
    vi.stubGlobal('sessionStorage', blockedStorage());
    expect(() => clearLocalSession()).not.toThrow();
    expect(() => forgetPersonalDrafts()).not.toThrow();
  });
});
