import { describe, expect, it } from 'vitest';
import { courseLabel, subjectName } from './dashboard.utils';

describe('courseLabel: no importer placeholder for families', () => {
  it('replaces "Unspecified (import)" and keeps the rest', () => {
    expect(courseLabel('IGCSE - G10 - Unspecified (import)')).toBe(
      'IGCSE - G10 - Subject not set',
    );
    expect(subjectName('IGCSE - G10 - Unspecified (import)')).toBe(
      'Subject not set',
    );
  });

  it('leaves real course names alone', () => {
    expect(courseLabel('IGCSE OL - G10 - Chemistry')).toBe(
      'IGCSE OL - G10 - Chemistry',
    );
    expect(subjectName('IGCSE OL - G10 - Chemistry')).toBe('Chemistry');
    expect(courseLabel(undefined)).toBe('');
  });
});
