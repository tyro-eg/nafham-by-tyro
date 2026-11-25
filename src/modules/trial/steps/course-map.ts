/**
 * The course map Nafham System uses (Find an Instructor), for the trial and
 * buy wizards:
 * - Curriculum, then grade. Grades sit under their stage: KG is PreSchool,
 *   G1–6 Primary, G7–9 Preparatory, G10 and up Secondary; IB counts in PYP,
 *   MYP and DP.
 * - A level (OL, AS, A2…) only for IGCSE, American and IB, and only at
 *   Secondary (DP for IB). Every other curriculum (British System too) is
 *   grade and subject only.
 * - An exam board (Cambridge, Edexcel, Oxford…) only for IGCSE.
 */

export const STAGES = [
  'PRESCHOOL',
  'PRIMARY',
  'PREPARATORY',
  'SECONDARY',
  'PYP',
  'MYP',
  'DP',
  'UNIVERSITY',
  'ADULTS',
  'OTHER',
] as const;
export type Stage = (typeof STAGES)[number];

const isIB = (curriculum: string) =>
  /^(ib|international baccalaureate)\b/i.test(curriculum.trim());

/** The stage a grade belongs to, as Nafham System counts it */
export const stageOf = (grade: string, curriculum = ''): Stage => {
  const g = grade.trim().toUpperCase();
  if (/^(KG|FS|PRE-?SCHOOL)/.test(g)) return 'PRESCHOOL';
  if (/^PYP/.test(g)) return 'PYP';
  if (/^MYP/.test(g)) return 'MYP';
  if (/^DP/.test(g)) return 'DP';
  if (/^KS[12]$/.test(g) || g === 'PRIMARY') return 'PRIMARY';
  if (g === 'PREPARATORY' || g === 'CHECKPOINT') return 'PREPARATORY';
  if (g === 'SECONDARY') return 'SECONDARY';
  if (/^(UNIVERSITY|YEAR \d)/.test(g)) return 'UNIVERSITY';
  if (/^ADULT/.test(g)) return 'ADULTS';
  const number = /^(?:G|GRADE)\s*-?\s*(\d{1,2})$/.exec(g);
  if (!number) return 'OTHER';
  const n = Number(number[1]);
  if (n < 1) return 'OTHER';
  if (isIB(curriculum)) return n <= 5 ? 'PYP' : n <= 10 ? 'MYP' : 'DP';
  return n <= 6 ? 'PRIMARY' : n <= 9 ? 'PREPARATORY' : 'SECONDARY';
};

/** IGCSE, American and IB ask for a level, at Secondary (DP for IB) only */
export const asksLevel = (curriculum: string, stage: Stage): boolean =>
  /^(igcse|american|ib|international baccalaureate)\b/i.test(
    curriculum.trim(),
  ) &&
  (stage === 'SECONDARY' || stage === 'DP');

/** Only IGCSE asks which exam board the student sits */
export const asksExamBoard = (curriculum: string): boolean =>
  /^igcse\b/i.test(curriculum.trim());

/** Curricula the website has that Nafham System does not offer */
const HIDDEN = /^unknown\b/i;
export const shownCurriculum = (name: string): boolean => !HIDDEN.test(name);

/** The website's curriculum names in Nafham System's words */
const NAMES: Record<string, string> = {
  'kuwaiti national': 'Kuwait National',
  'jordanian national': 'Jordan National',
};
export const curriculumName = (name: string): string =>
  NAMES[name.trim().toLowerCase()] ?? name;

/** Grades in the order they are taught (KG1, KG2, G1 … G12), named ones last */
export const compareGrades = (a: string, b: string): number => {
  const rank = (g: string) =>
    /^(kg|fs)\d*$/i.test(g.trim())
      ? 0
      : /^(g|grade)\s*\d/i.test(g.trim())
        ? 1
        : 2;
  return (
    rank(a) - rank(b) ||
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
  );
};
