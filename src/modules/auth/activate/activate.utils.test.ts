import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { blockedStorage, memoryStorage } from '../../../test/memory-storage';
import {
  RESEND_SECONDS,
  codeAskedAt,
  forgetCodeAsked,
  rememberCodeAsked,
  resendWait,
} from './activate.utils';

const LINK = 'eyJfcmFpbHMiOnsibWVzc2FnZSI6Ik1qUT0ifX0--9f8a7b6c5d4e3f2a1b0c';
const OTHER = 'eyJfcmFpbHMiOnsibWVzc2FnZSI6Ik1qVT0ifX0--0a1b2c3d4e5f6a7b8c9d';

describe('the code step, remembered for a reload', () => {
  beforeEach(() => vi.stubGlobal('sessionStorage', memoryStorage()));
  afterEach(() => vi.unstubAllGlobals());

  it('starts with nothing asked', () => {
    expect(codeAskedAt(LINK)).toBeNull();
  });

  it('remembers when a code was asked for, per link', () => {
    rememberCodeAsked(LINK, 1_000_000);
    expect(codeAskedAt(LINK)).toBe(1_000_000);
    expect(codeAskedAt(OTHER)).toBeNull();
  });

  it('keeps the latest time when a new code is asked for', () => {
    rememberCodeAsked(LINK, 1_000_000);
    rememberCodeAsked(LINK, 1_090_000);
    expect(codeAskedAt(LINK)).toBe(1_090_000);
  });

  it('forgets once the account is active', () => {
    rememberCodeAsked(LINK, 1_000_000);
    rememberCodeAsked(OTHER, 1_000_000);
    forgetCodeAsked(LINK);
    expect(codeAskedAt(LINK)).toBeNull();
    expect(codeAskedAt(OTHER)).toBe(1_000_000);
  });

  it('does not copy the link’s token into storage', () => {
    rememberCodeAsked(LINK, 1_000_000);
    const key = sessionStorage.key(0) ?? '';
    expect(key).not.toContain(LINK);
    expect(key.length).toBeLessThan(LINK.length);
  });

  it('ignores a value that is not a time', () => {
    rememberCodeAsked(LINK, 1_000_000);
    sessionStorage.setItem(sessionStorage.key(0) ?? '', 'yes');
    expect(codeAskedAt(LINK)).toBeNull();
  });

  it('never throws when storage is blocked', () => {
    vi.stubGlobal('sessionStorage', blockedStorage());
    expect(() => rememberCodeAsked(LINK)).not.toThrow();
    expect(codeAskedAt(LINK)).toBeNull();
    expect(() => forgetCodeAsked(LINK)).not.toThrow();
  });
});

describe('the wait before another code', () => {
  it('is nothing when no code was asked for', () => {
    expect(resendWait(null, 5_000_000)).toBe(0);
  });

  it('counts down from a minute after the last code', () => {
    const askedAt = 5_000_000;
    expect(resendWait(askedAt, askedAt)).toBe(RESEND_SECONDS);
    expect(resendWait(askedAt, askedAt + 20_000)).toBe(40);
    expect(resendWait(askedAt, askedAt + 59_500)).toBe(1);
    expect(resendWait(askedAt, askedAt + 60_000)).toBe(0);
    expect(resendWait(askedAt, askedAt + 3_600_000)).toBe(0);
  });

  it('is never longer than a minute, whatever the clock says', () => {
    expect(resendWait(5_000_000, 4_000_000)).toBe(RESEND_SECONDS);
  });
});
