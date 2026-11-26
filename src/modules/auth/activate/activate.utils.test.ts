import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { blockedStorage, memoryStorage } from '../../../test/memory-storage';
import en from '../../../component/i18next/locales/en/translation.json';
import ar from '../../../component/i18next/locales/ar/translation.json';
import {
  ACTIVATION_CODES,
  RESEND_SECONDS,
  activationFailure,
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

/** An axios-style failure with the server's answer */
const refused = (status: number, data: unknown) => ({
  response: { status, data },
});

describe('what the page says when the server refuses', () => {
  it('has a sentence in both languages for every reason the server gives', () => {
    for (const code of ACTIVATION_CODES) {
      const { problem } = activationFailure(
        refused(422, { errors: ['English only'], code }),
        'action',
      );
      expect(problem).toEqual({ key: `ACTIVATE.ERRORS.${code.toUpperCase()}` });
      const name = code.toUpperCase() as keyof typeof en.ACTIVATE.ERRORS;
      expect(en.ACTIVATE.ERRORS[name]).toBeTruthy();
      expect(ar.ACTIVATE.ERRORS[name]).toBeTruthy();
      expect(ar.ACTIVATE.ERRORS[name]).not.toBe(en.ACTIVATE.ERRORS[name]);
    }
  });

  it('uses our sentence, not the server’s English, for a known reason', () => {
    const failure = activationFailure(
      refused(422, {
        errors: ['That code is not right. 3 tries left.'],
        code: 'wrong_code',
      }),
      'action',
    );
    expect(failure).toEqual({
      code: 'wrong_code',
      problem: { key: 'ACTIVATE.ERRORS.WRONG_CODE' },
      retry: false,
    });
  });

  it('names the reason, so the page can act on it', () => {
    expect(
      activationFailure(refused(409, { errors: ['x'], code: 'active' }), 'load')
        .code,
    ).toBe('active');
    expect(
      activationFailure(
        refused(429, { errors: ['x'], code: 'too_soon' }),
        'action',
      ).code,
    ).toBe('too_soon');
  });

  it('falls back to the server’s words only for a reason it does not know', () => {
    expect(
      activationFailure(
        refused(422, { errors: ['Phone is being changed'], code: 'frozen' }),
        'action',
      ),
    ).toEqual({
      code: null,
      problem: { text: 'Phone is being changed' },
      retry: false,
    });
    expect(
      activationFailure(refused(422, { errors: ['No code given'] }), 'action')
        .problem,
    ).toEqual({ text: 'No code given' });
  });

  it('says "bad link" only when the server says the link is wrong', () => {
    expect(
      activationFailure(
        refused(404, {
          errors: ['This activation link is not valid or has expired.'],
        }),
        'load',
      ),
    ).toEqual({
      code: null,
      problem: { key: 'ACTIVATE.BAD_LINK' },
      retry: false,
    });
  });

  it('says "could not load, try again" when the first load gets no answer', () => {
    for (const err of [new Error('Network Error'), { code: 'ECONNABORTED' }]) {
      expect(activationFailure(err, 'load')).toEqual({
        code: null,
        problem: { key: 'ACTIVATE.LOAD_FAILED' },
        retry: true,
      });
    }
    expect(en.ACTIVATE.LOAD_FAILED).toBeTruthy();
    expect(ar.ACTIVATE.LOAD_FAILED).toBeTruthy();
  });

  it('offers the first load again when the server itself failed', () => {
    expect(activationFailure(refused(503, '<html>'), 'load')).toEqual({
      code: null,
      problem: { key: 'ACTIVATE.LOAD_FAILED' },
      retry: true,
    });
  });

  it('blames the connection when a pressed button gets no answer', () => {
    expect(activationFailure(new Error('Network Error'), 'action')).toEqual({
      code: null,
      problem: { key: 'ACTIVATE.ERRORS.NETWORK' },
      retry: true,
    });
  });

  it('has a general sentence when the server gives no reason', () => {
    expect(activationFailure(refused(422, null), 'action').problem).toEqual({
      key: 'ACTIVATE.TRY_AGAIN',
    });
    expect(
      activationFailure(refused(422, { errors: [] }), 'action').problem,
    ).toEqual({ key: 'ACTIVATE.TRY_AGAIN' });
  });
});
