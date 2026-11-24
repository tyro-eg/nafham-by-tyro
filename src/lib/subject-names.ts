/**
 * Subject names in Arabic (23 Nov 2026). Course names come from the server in
 * English ("IGCSE OL - G10 - Chemistry"); the server also lists each
 * subject's Arabic name (GET /subjects/names), and in Arabic the subject part
 * of a course name reads in Arabic. A subject with no Arabic name stays as it
 * is. Kept apart from the pages so it can be tested.
 */

let names: Record<string, string> = {};
// Longest first, so "English - Pronounce" wins over "Pronounce"
let byLength: string[] = [];

export const setSubjectNames = (map: Record<string, string>) => {
  names = { ...map };
  byLength = Object.keys(names).sort((a, b) => b.length - a.length);
};

/** The subject a course name ends with, as the server spells it, if known */
export const knownSubject = (courseName: string): string | undefined =>
  byLength.find(
    (subject) => courseName === subject || courseName.endsWith(` - ${subject}`),
  );

/** The course name with its subject part in Arabic, when one is known */
export const localizeCourse = (courseName: string, language: string) => {
  if (language !== 'ar') return courseName;
  const subject = knownSubject(courseName);
  if (!subject) return courseName;
  return (
    courseName.slice(0, courseName.length - subject.length) + names[subject]
  );
};

/** Just the subject, in Arabic when known */
export const localizeSubject = (courseName: string, language: string) => {
  const subject = knownSubject(courseName);
  if (!subject) return undefined;
  return language === 'ar' ? names[subject] : subject;
};
