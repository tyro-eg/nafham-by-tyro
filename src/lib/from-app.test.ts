import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  appPaymentCompleteUrl,
  blockedInApp,
  isFromApp,
  markFromApp,
  readHandoffCode,
  safeNextPath,
} from './from-app';
import { blockedStorage, memoryStorage } from '../test/memory-storage';

describe('the from-app flag', () => {
  beforeEach(() => vi.stubGlobal('sessionStorage', memoryStorage()));
  afterEach(() => vi.unstubAllGlobals());

  it('is off until the handoff marks the tab', () => {
    expect(isFromApp()).toBe(false);
    markFromApp();
    expect(isFromApp()).toBe(true);
    expect(sessionStorage.getItem('tyro.fromApp')).toBe('1');
  });

  it('reads as a normal visit when storage is blocked', () => {
    vi.stubGlobal('sessionStorage', blockedStorage());
    expect(() => markFromApp()).not.toThrow();
    expect(isFromApp()).toBe(false);
  });

  it('blocks only group courses, and only from the app', () => {
    expect(blockedInApp('group_course')).toBe(false);
    markFromApp();
    expect(blockedInApp('group_course')).toBe(true);
    expect(blockedInApp('private_session')).toBe(false);
    expect(blockedInApp(undefined)).toBe(false);
    expect(blockedInApp(null)).toBe(false);
  });
});

describe('appPaymentCompleteUrl', () => {
  it('builds the app deep link', () => {
    expect(appPaymentCompleteUrl('abc123', 'fulfilled')).toBe(
      'nafham://payment-complete?slug=abc123&status=fulfilled',
    );
  });

  it('encodes what it is given', () => {
    expect(appPaymentCompleteUrl('a&b=c', 'x y')).toBe(
      'nafham://payment-complete?slug=a%26b%3Dc&status=x%20y',
    );
  });
});

describe('readHandoffCode', () => {
  it('reads the code from the fragment, with or without the #', () => {
    expect(readHandoffCode('#code=abc-_123')).toBe('abc-_123');
    expect(readHandoffCode('code=abc')).toBe('abc');
    expect(readHandoffCode('#other=1&code=xyz')).toBe('xyz');
  });

  it('is null when there is no code', () => {
    expect(readHandoffCode('')).toBeNull();
    expect(readHandoffCode('#')).toBeNull();
    expect(readHandoffCode('#code=')).toBeNull();
    expect(readHandoffCode('#token=abc')).toBeNull();
  });
});

describe('safeNextPath', () => {
  it('keeps a path on this site', () => {
    expect(safeNextPath('/family?renew=12')).toBe('/family?renew=12');
    expect(safeNextPath('/my_packages?renew=all')).toBe(
      '/my_packages?renew=all',
    );
    expect(safeNextPath('/payments/abc/return')).toBe('/payments/abc/return');
    expect(safeNextPath('/')).toBe('/');
  });

  it('falls back to home for anything that could leave the site', () => {
    expect(safeNextPath('//evil.example')).toBe('/');
    expect(safeNextPath('/\\evil.example')).toBe('/');
    expect(safeNextPath('https://evil.example/family')).toBe('/');
    expect(safeNextPath('javascript:alert(1)')).toBe('/');
    expect(safeNextPath('family')).toBe('/');
    expect(safeNextPath('')).toBe('/');
    expect(safeNextPath(undefined)).toBe('/');
    expect(safeNextPath(null)).toBe('/');
    expect(safeNextPath(42)).toBe('/');
  });
});
