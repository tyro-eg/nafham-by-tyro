import { describe, expect, it } from 'vitest';

import en from '../../component/i18next/locales/en/translation.json';
import ar from '../../component/i18next/locales/ar/translation.json';
import {
  EMPTY_REPORT,
  lateCancelChip,
  lateCancelNotice,
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

describe('sessions left out of the total', () => {
  const withTotals = (
    totals: Partial<MySalaryResponse['totals']>,
  ): MySalaryResponse => {
    const data = response([line({})]);
    return { ...data, totals: { ...data.totals, ...totals } };
  };

  it('keeps a rate that looks wrong apart from no rate yet', () => {
    const report = toSalaryReport(
      withTotals({ unpriced: 2, rate_looks_wrong: 3 }),
    );
    expect(report.unpricedSessions).toBe(2);
    expect(report.rateLooksWrongSessions).toBe(3);
  });

  it('says nothing about no rate when only the rate looks wrong', () => {
    const report = toSalaryReport(
      withTotals({ unpriced: 0, rate_looks_wrong: 1 }),
    );
    expect(report.unpricedSessions).toBe(0);
    expect(report.rateLooksWrongSessions).toBe(1);
  });

  it('copes with a backend that does not count wrong rates', () => {
    expect(toSalaryReport(withTotals({ unpriced: 1 }))).toMatchObject({
      unpricedSessions: 1,
      rateLooksWrongSessions: 0,
    });
    expect(EMPTY_REPORT.rateLooksWrongSessions).toBe(0);
  });
});

describe('the late-cancel chip', () => {
  const cancelled = (overrides: Partial<MySalaryLine>) =>
    line({ status: 'cancelled', tutor_paid_fraction: 0.5, ...overrides });

  it('names the hours of notice when they are known', () => {
    expect(lateCancelChip(cancelled({ cancel_notice_hours: 3.5 }))).toEqual({
      key: 'MY_SALARY.LATE_CANCEL_HALF',
      hours: 3.5,
    });
    expect(
      lateCancelChip(
        cancelled({ tutor_paid_fraction: 1, cancel_notice_hours: 0.5 }),
      ),
    ).toEqual({ key: 'MY_SALARY.LATE_CANCEL_FULL', hours: 0.5 });
  });

  it('never says "0 h before" when the cancel time is not on record', () => {
    for (const missing of [null, undefined]) {
      expect(
        lateCancelChip(cancelled({ cancel_notice_hours: missing })),
      ).toEqual({ key: 'MY_SALARY.LATE_CANCEL_HALF_PLAIN', hours: null });
    }
  });

  it('never prints a negative number for a cancel after the start', () => {
    expect(
      lateCancelChip(
        cancelled({ tutor_paid_fraction: 1, cancel_notice_hours: -1.5 }),
      ),
    ).toEqual({ key: 'MY_SALARY.LATE_CANCEL_FULL_PLAIN', hours: null });
    expect(lateCancelNotice(-0.1)).toBeNull();
    expect(lateCancelNotice(0)).toBeNull();
    expect(lateCancelNotice(Number.NaN)).toBeNull();
    expect(lateCancelNotice(0.1)).toBe(0.1);
  });

  it('is only for sessions paid although cancelled', () => {
    expect(lateCancelChip(line({ status: 'completed' }))).toBeNull();
    expect(lateCancelChip(line({ status: 'missed' }))).toBeNull();
    expect(
      lateCancelChip(
        cancelled({ tutor_paid_fraction: 0, cancel_notice_hours: 30 }),
      ),
    ).toBeNull();
    expect(
      lateCancelChip(
        line({ status: 'cancelled', tutor_paid_fraction: undefined }),
      ),
    ).toBeNull();
  });

  it('has every sentence in both languages; the plain ones name no hours', () => {
    for (const key of [
      'LATE_CANCEL_HALF',
      'LATE_CANCEL_FULL',
      'LATE_CANCEL_HALF_PLAIN',
      'LATE_CANCEL_FULL_PLAIN',
    ] as const) {
      for (const texts of [en.MY_SALARY, ar.MY_SALARY]) {
        expect(texts[key]).toBeTruthy();
        expect(texts[key].includes('{{hours}}')).toBe(!key.endsWith('_PLAIN'));
      }
    }
  });
});
