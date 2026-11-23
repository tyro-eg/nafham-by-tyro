import { beforeEach, describe, expect, it } from 'vitest';
import {
  backTarget,
  placeKey,
  previousPage,
  recordPage,
  resetTrail,
} from './back-trail';

describe('back trail', () => {
  beforeEach(() => resetTrail());

  it('remembers the page before this one, not redirects', () => {
    recordPage('/my_instructors', false);
    recordPage('/profile/12', false);
    expect(previousPage()).toBe('/my_instructors');
    // A redirect replaces the page: what you were on before stays.
    recordPage('/profile/12?tab=reviews', true);
    expect(previousPage()).toBe('/my_instructors');
    // The same page again changes nothing.
    recordPage('/profile/12?tab=reviews', false);
    expect(previousPage()).toBe('/my_instructors');
  });

  it('names the place it goes back to', () => {
    expect(placeKey('/my_instructors')).toBe('NAVIGATION.MY_INSTRUCTORS');
    expect(placeKey('/my_students?tab=packages')).toBe(
      'NAVIGATION.MY_STUDENTS',
    );
    expect(placeKey('/my_sessions?view=calendar')).toBe('NAVIGATION.SESSIONS');
    expect(placeKey('/')).toBe('NAVIGATION.HOME');
    expect(placeKey('/register')).toBe('BACK_LINK.SIGN_UP');
    expect(placeKey('/profile/3')).toBeNull();
    expect(placeKey(null)).toBeNull();
    // A page whose name only starts the same is not that page.
    expect(placeKey('/homeworkish')).toBeNull();
  });

  it('goes back in the tab when it can, else to the list', () => {
    expect(backTarget(true, '/account', '/my_sessions')).toEqual({
      useHistory: true,
      to: '/my_sessions',
      labelKey: 'NAVIGATION.SESSIONS',
    });
    // Opened from a link or a new tab: the fallback list, named.
    expect(backTarget(false, '/account', '/my_sessions')).toEqual({
      useHistory: false,
      to: '/account',
      labelKey: 'NAVIGATION.ACCOUNT',
    });
    // A page before this one with no short name: just "Back".
    expect(backTarget(true, '/', '/profile/9').labelKey).toBe('BACK_LINK.BACK');
    expect(backTarget(true, '/terms-list', null)).toEqual({
      useHistory: false,
      to: '/terms-list',
      labelKey: 'BACK_LINK.BACK',
    });
  });
});
