import { describe, expect, it } from 'vitest';
import type { Package } from '../../assets/types';
import type { SessionSummary } from '../../hooks/useSessions';
import { buildStudents } from './my-students.utils';
import { studentInsights, subjectBreakdown, weeklyHours } from '../dashboard/dashboard.utils';

const summary: SessionSummary = {
  totals: { completed: 361, missed: 4, cancelled: 19, hours_completed: 431.5, hours_this_month: 140 },
  weeks: [
    { start: '2026-11-09', hours: 25.5 },
    { start: '2026-11-16', hours: 10.5 },
  ],
  subjects: [
    { course: 'IGCSE OL - G10 - Math', hours: 94 },
    { course: 'IB - DP2 - Physics', hours: 31 },
    { course: 'IGCSE AL - G11 - Math', hours: 20 },
  ],
  students: [
    {
      id: 7,
      first_name: 'Teya',
      last_name: 'N',
      courses: ['IB - DP2 - Physics'],
      completed: 31,
      hours: 31,
      next_session_at: '2026-11-20T06:00:00Z',
      last_session_at: '2026-11-11T08:00:00Z',
      last_course: 'IB - DP2 - Physics',
    },
    {
      id: 8,
      first_name: 'Ali',
      last_name: 'B',
      courses: [],
      completed: 2,
      hours: 1.5,
      next_session_at: null,
      last_session_at: null,
      last_course: null,
    },
  ],
};

describe('totals from the server summary', () => {
  it('reads the totals as the server added them up', () => {
    const insights = studentInsights(summary, []);
    expect(insights.completed).toBe(361);
    expect(insights.hoursThisMonth).toBe(140);
    expect(insights.attendanceRate).toBeCloseTo(361 / 365);
  });

  it('weeks start at local midnight on the Monday the server gives', () => {
    const [first] = weeklyHours(summary);
    expect([first.start.getFullYear(), first.start.getMonth(), first.start.getDate(), first.start.getHours()]).toEqual([2026, 10, 9, 0]);
  });

  it('subjects with the same name join into one row', () => {
    expect(subjectBreakdown(summary).map((s) => [s.name, s.hours])).toEqual([
      ['Math', 114],
      ['Physics', 31],
    ]);
  });

  it('students: next and last session, and active with a session to come or hours left', () => {
    const pkg = { student: { id: 8, first_name: 'Ali', last_name: 'B' }, original_hours: 10, remaining_hours: 0 } as unknown as Package;
    const students = buildStudents([pkg], summary.students || []);
    expect(students.map((s) => [s.id, s.active, s.nextSessionAt, s.lastCourse])).toEqual([
      [7, true, '2026-11-20T06:00:00Z', 'IB - DP2 - Physics'],
      [8, false, undefined, undefined],
    ]);
    expect(students[0].courses).toEqual(['Physics']);
  });
});
