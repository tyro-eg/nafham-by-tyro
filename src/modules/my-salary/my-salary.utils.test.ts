import { describe, expect, it } from 'vitest';

import {
  EMPTY_REPORT,
  monthKey,
  splitCourse,
  toSalaryReport,
  type MySalaryLine,
  type MySalaryResponse,
} from './my-salary.utils';

const line = (overrides: Partial<MySalaryLine>): MySalaryLine => ({
  session_id: 1,
  start_time: '2026-10-05T14:00:00.000+03:00',
  end_time: '2026-10-05T15:00:00.000+03:00',
  student_id: 9,
  student_name: 'Mariam Fouad',
  grade_subject_id: 3,
  course: 'IGCSE - Year 10 - Mathematics',
  session_type: 'regular',
  status: 'completed',
  hours: 1,
  rate: 200,
  amount: 200,
  paid: true,
  flags: [],
  ...overrides,
});

const response = (lines: MySalaryLine[]): MySalaryResponse => ({
  month: '2026-10',
  totals: {
    sessions: 2,
    completed: 1,
    missed: 1,
    trials: 0,
    hours: 1.5,
    amount: 300,
    unpriced: 0,
  },
  groups: [
    {
      grade_subject_id: 3,
      course: 'IGCSE - Year 10 - Mathematics',
      rate: 200,
      sessions: 2,
      hours: 1.5,
      amount: 300,
    },
  ],
  lines,
  upcoming: { sessions: 2, amount: 400 },
});

describe('monthKey', () => {
  it('counts months back from now, across a year', () => {
    const now = new Date(2026, 0, 31);
    expect(monthKey(now, 0)).toBe('2026-01');
    expect(monthKey(now, -1)).toBe('2025-12');
    expect(monthKey(now, -13)).toBe('2024-12');
  });
});

describe('splitCourse', () => {
  it('splits curriculum, stage and subject', () => {
    expect(splitCourse('IGCSE A Level - Year 12 - Physics (Edexcel)')).toEqual({
      curriculum: 'IGCSE A Level',
      stage: 'Year 12',
      subject: 'Physics (Edexcel)',
    });
    expect(splitCourse(null)).toEqual({
      curriculum: '',
      stage: '',
      subject: '',
    });
  });
});

describe('toSalaryReport', () => {
  it('is empty while loading', () => {
    expect(toSalaryReport(undefined)).toBe(EMPTY_REPORT);
  });

  it('keeps only paid sessions, newest first, and takes the totals from the backend', () => {
    const report = toSalaryReport(
      response([
        line({ session_id: 1, start_time: '2026-10-05T14:00:00.000+03:00' }),
        line({
          session_id: 2,
          start_time: '2026-10-09T14:00:00.000+03:00',
          status: 'missed',
          hours: 0.5,
          amount: 100,
        }),
        line({
          session_id: 3,
          status: 'missed',
          paid: false,
          amount: 0,
          flags: ['unconfirmed_missed'],
        }),
        line({
          session_id: 4,
          status: 'open',
          paid: false,
          amount: 0,
          flags: ['unclosed'],
        }),
      ]),
    );

    expect(report.lines.map((l) => l.session_id)).toEqual([2, 1]);
    expect([report.sessions, report.hours, report.amount]).toEqual([
      2, 1.5, 300,
    ]);
    expect([report.upcomingSessions, report.upcomingAmount]).toEqual([2, 400]);
    expect(report.groups[0].course.subject).toBe('Mathematics');
  });

  it('averages only over hours that have a rate', () => {
    const report = toSalaryReport(
      response([
        line({ hours: 1, amount: 200 }),
        line({ session_id: 2, hours: 2, rate: null, amount: 0 }),
      ]),
    );
    expect(report.pricedHours).toBe(1);
  });
});
