import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearReturnTo,
  headedForTrial,
  isSafePath,
  justSignedOut,
  noteSignOut,
  peekReturnTo,
  rememberReturnTo,
} from './return-to';
import { blockedStorage, memoryStorage } from '../test/memory-storage';

const MINUTE = 60 * 1000;

describe('the remembered destination', () => {
  beforeEach(() => vi.stubGlobal('sessionStorage', memoryStorage()));
  afterEach(() => vi.unstubAllGlobals());

  it('keeps the path and its query string for the next reader', () => {
    rememberReturnTo('/buy?child=3&course=10&tutor=5', 0);
    expect(peekReturnTo(MINUTE)).toBe('/buy?child=3&course=10&tutor=5');
    // Still there: login and the route both read it
    expect(peekReturnTo(MINUTE)).toBe('/buy?child=3&course=10&tutor=5');
  });

  it('is forgotten after half an hour', () => {
    rememberReturnTo('/payments/abc/return', 0);
    expect(peekReturnTo(29 * MINUTE)).toBe('/payments/abc/return');
    expect(peekReturnTo(31 * MINUTE)).toBeNull();
  });

  it('is gone once cleared', () => {
    rememberReturnTo('/buy', 0);
    clearReturnTo();
    expect(peekReturnTo(0)).toBeNull();
  });

  it('never remembers another site or a page that bounces back', () => {
    for (const path of [
      '//evil.example/buy',
      'https://evil.example',
      '/\\evil.example',
      '/login',
      '/register?x=1',
      '/',
    ]) {
      rememberReturnTo(path, 0);
      expect(peekReturnTo(0)).toBeNull();
    }
  });

  it('ignores a stored value that is not a safe path', () => {
    sessionStorage.setItem(
      'tyro.returnTo',
      JSON.stringify({ path: '//evil.example', at: 0 }),
    );
    expect(peekReturnTo(0)).toBeNull();
    sessionStorage.setItem('tyro.returnTo', 'not json');
    expect(peekReturnTo(0)).toBeNull();
  });

  it('lands on the home page when storage is blocked', () => {
    vi.stubGlobal('sessionStorage', blockedStorage());
    expect(() => rememberReturnTo('/buy', 0)).not.toThrow();
    expect(peekReturnTo(0)).toBeNull();
    expect(() => clearReturnTo()).not.toThrow();
  });
});

describe('signing out', () => {
  beforeEach(() => vi.stubGlobal('sessionStorage', memoryStorage()));
  afterEach(() => vi.unstubAllGlobals());

  it('forgets the remembered page, so the next person is not sent there', () => {
    rememberReturnTo('/messages/abc', 0);
    noteSignOut(1000);
    expect(peekReturnTo(1000)).toBeNull();
  });

  it('counts as "just signed out" for a few seconds only', () => {
    noteSignOut(10_000);
    expect(justSignedOut(10_500)).toBe(true);
    expect(justSignedOut(14_999)).toBe(true);
    expect(justSignedOut(15_000)).toBe(false);
  });
});

describe('isSafePath', () => {
  it('accepts paths inside the site only', () => {
    expect(isSafePath('/buy?child=1')).toBe(true);
    expect(isSafePath('//x')).toBe(false);
    expect(isSafePath('buy')).toBe(false);
    expect(isSafePath(undefined)).toBe(false);
  });
});

describe('headedForTrial', () => {
  beforeEach(() => vi.stubGlobal('sessionStorage', memoryStorage()));
  afterEach(() => vi.unstubAllGlobals());

  it('is true when the free trial sent them to make an account', () => {
    rememberReturnTo('/trial', 0);
    expect(headedForTrial(MINUTE)).toBe(true);
  });

  it('keeps a tutor or course picked on the way', () => {
    rememberReturnTo('/trial?tutor=7&course=3', 0);
    expect(headedForTrial(MINUTE)).toBe(true);
    expect(peekReturnTo(MINUTE)).toBe('/trial?tutor=7&course=3');
  });

  it('is false for any other page, for nothing remembered, and once it is old', () => {
    expect(headedForTrial(0)).toBe(false);
    rememberReturnTo('/buy?child=1', 0);
    expect(headedForTrial(MINUTE)).toBe(false);
    rememberReturnTo('/trial_requests', 0);
    expect(headedForTrial(MINUTE)).toBe(false);
    rememberReturnTo('/trial', 0);
    expect(headedForTrial(31 * MINUTE)).toBe(false);
  });
});
