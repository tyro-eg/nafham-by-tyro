import { describe, expect, it } from 'vitest';
import {
  asksExamBoard,
  asksLevel,
  compareGrades,
  curriculumName,
  isIGCSE,
  shownCurriculum,
  stageOf,
} from './course-map';

describe('stageOf (Nafham System: grades count to stages)', () => {
  it('KG is PreSchool, G1–6 Primary, G7–9 Preparatory, G10+ Secondary', () => {
    expect(stageOf('KG1')).toBe('PRESCHOOL');
    expect(stageOf('KG2')).toBe('PRESCHOOL');
    expect(stageOf('G1')).toBe('PRIMARY');
    expect(stageOf('G6')).toBe('PRIMARY');
    expect(stageOf('G7')).toBe('PREPARATORY');
    expect(stageOf('G9')).toBe('PREPARATORY');
    expect(stageOf('G10')).toBe('SECONDARY');
    expect(stageOf('G12')).toBe('SECONDARY');
    expect(stageOf('Grade 11')).toBe('SECONDARY');
  });

  it('IB counts in PYP, MYP and DP', () => {
    expect(stageOf('G5', 'IB')).toBe('PYP');
    expect(stageOf('G6', 'IB')).toBe('MYP');
    expect(stageOf('G10', 'IB')).toBe('MYP');
    expect(stageOf('G11', 'IB')).toBe('DP');
    expect(stageOf('PYP3', 'IB')).toBe('PYP');
    expect(stageOf('MYP5', 'IB')).toBe('MYP');
    expect(stageOf('DP1', 'IB')).toBe('DP');
  });

  it('places the named grades the backend has', () => {
    expect(stageOf('KS1')).toBe('PRIMARY');
    expect(stageOf('Checkpoint')).toBe('PREPARATORY');
    expect(stageOf('Secondary')).toBe('SECONDARY');
    expect(stageOf('University')).toBe('UNIVERSITY');
    expect(stageOf('Adults')).toBe('ADULTS');
    expect(stageOf('Unspecified')).toBe('OTHER');
  });
});

describe('asksLevel', () => {
  it('British System asks one at Secondary only (British Secondary is IGCSE)', () => {
    expect(asksLevel('British System', 'SECONDARY')).toBe(true);
    expect(asksLevel('British System', 'PREPARATORY')).toBe(false);
    expect(asksLevel('British System', 'PRIMARY')).toBe(false);
  });

  it('IGCSE, American and IB ask one at Secondary (DP) only', () => {
    expect(asksLevel('IGCSE', 'SECONDARY')).toBe(true);
    expect(asksLevel('IGCSE', 'PREPARATORY')).toBe(false);
    expect(asksLevel('American Diploma', 'SECONDARY')).toBe(true);
    expect(asksLevel('American System', 'SECONDARY')).toBe(true);
    expect(asksLevel('American System', 'PRIMARY')).toBe(false);
    expect(asksLevel('IB', 'DP')).toBe(true);
    expect(asksLevel('IB', 'MYP')).toBe(false);
  });

  it('other curricula never ask one', () => {
    expect(asksLevel('UAE National', 'SECONDARY')).toBe(false);
    expect(asksLevel('Egyptian National Languages', 'SECONDARY')).toBe(false);
  });
});

describe('asksExamBoard', () => {
  it('only British Secondary (IGCSE)', () => {
    expect(asksExamBoard('British System', 'SECONDARY')).toBe(true);
    expect(asksExamBoard('IGCSE', 'SECONDARY')).toBe(true);
    expect(asksExamBoard('British System', 'PREPARATORY')).toBe(false);
    expect(asksExamBoard('Pre-IGCSE', 'SECONDARY')).toBe(false);
    expect(asksExamBoard('American Diploma', 'SECONDARY')).toBe(false);
  });
});

describe('IGCSE is British', () => {
  it('is offered under British System', () => {
    expect(curriculumName('IGCSE')).toBe('British System');
    expect(isIGCSE('IGCSE')).toBe(true);
    expect(isIGCSE('British System')).toBe(false);
  });
});

describe('curriculum names', () => {
  it("uses Nafham System's names and hides the import's placeholder", () => {
    expect(curriculumName('Kuwaiti National')).toBe('Kuwait National');
    expect(curriculumName('Jordanian National')).toBe('Jordan National');
    expect(curriculumName('British System')).toBe('British System');
    expect(shownCurriculum('Unknown (import)')).toBe(false);
    expect(shownCurriculum('IGCSE')).toBe(true);
  });
});

describe('compareGrades', () => {
  it('orders KG before grades, and grades by number', () => {
    expect(['G10', 'G2', 'KG2', 'G1', 'KG1'].sort(compareGrades)).toEqual([
      'KG1',
      'KG2',
      'G1',
      'G2',
      'G10',
    ]);
  });
});

describe('compareGrades with named grades', () => {
  it('puts named grades after the numbered ones', () => {
    expect(['Primary', 'KS1', 'G2', 'G1'].sort(compareGrades)).toEqual([
      'G1',
      'G2',
      'KS1',
      'Primary',
    ]);
    expect(['Preschool', 'KG2', 'KG'].sort(compareGrades)).toEqual([
      'KG',
      'KG2',
      'Preschool',
    ]);
  });
});
