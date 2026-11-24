import { afterEach, describe, expect, it } from 'vitest';
import i18n from '../../component/i18next/i18n';
import { setSubjectNames } from '../../lib/subject-names';
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

describe('subject names in Arabic', () => {
  afterEach(async () => {
    setSubjectNames({});
    await i18n.changeLanguage('en');
  });

  it('reads the subject part in Arabic, and only in Arabic', async () => {
    setSubjectNames({
      Chemistry: 'الكيمياء',
      'English - Pronounce': 'النطق الإنجليزي',
    });
    expect(subjectName('IGCSE OL - G10 - Chemistry')).toBe('Chemistry');
    await i18n.changeLanguage('ar');
    expect(courseLabel('IGCSE OL - G10 - Chemistry')).toBe(
      'IGCSE OL - G10 - الكيمياء',
    );
    expect(subjectName('IGCSE OL - G10 - Chemistry')).toBe('الكيمياء');
    expect(subjectName('British - G6 - English - Pronounce')).toBe(
      'النطق الإنجليزي',
    );
  });

  it('leaves a subject with no Arabic name as it is', async () => {
    setSubjectNames({ Chemistry: 'الكيمياء' });
    await i18n.changeLanguage('ar');
    expect(subjectName('IGCSE - G9 - Pottery')).toBe('Pottery');
    expect(courseLabel('IGCSE - G9 - Pottery')).toBe('IGCSE - G9 - Pottery');
  });
});
