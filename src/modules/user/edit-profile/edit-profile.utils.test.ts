import { describe, expect, it } from 'vitest';

import { parseTargetStudents, targetProgress } from './edit-profile.utils';

describe('targetProgress', () => {
  it('is null without a target', () => {
    expect(targetProgress(4, null)).toBeNull();
    expect(targetProgress(4, undefined)).toBeNull();
    expect(targetProgress(4, 0)).toBeNull();
  });

  it('rounds the percent reached', () => {
    expect(targetProgress(9, 15)).toEqual({
      percent: 60,
      width: 60,
      reached: false,
    });
    expect(targetProgress(1, 3)).toEqual({
      percent: 33,
      width: 33,
      reached: false,
    });
  });

  it('may pass 100 while the bar stops full', () => {
    expect(targetProgress(15, 15)).toEqual({
      percent: 100,
      width: 100,
      reached: true,
    });
    expect(targetProgress(20, 10)).toEqual({
      percent: 200,
      width: 100,
      reached: true,
    });
  });
});

describe('parseTargetStudents', () => {
  it('clears on empty input', () => {
    expect(parseTargetStudents('')).toBe('');
    expect(parseTargetStudents('  ')).toBe('');
  });

  it('takes whole numbers from 1 to 200', () => {
    expect(parseTargetStudents('1')).toBe(1);
    expect(parseTargetStudents(' 15 ')).toBe(15);
    expect(parseTargetStudents('200')).toBe(200);
  });

  it('refuses anything else', () => {
    expect(parseTargetStudents('0')).toBeNull();
    expect(parseTargetStudents('201')).toBeNull();
    expect(parseTargetStudents('2.5')).toBeNull();
    expect(parseTargetStudents('-3')).toBeNull();
    expect(parseTargetStudents('ten')).toBeNull();
  });
});
