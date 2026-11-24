import { describe, expect, it } from 'vitest';
import type { Package } from '../../assets/types';
import type { SessionSummary } from '../../hooks/useSessions';
import { buildStudents, courseInfo } from './my-students.utils';
import {
  studentInsights,
  subjectBreakdown,
  weeklyHours,
} from '../dashboard/dashboard.utils';

const summary: SessionSummary = {
  totals: {
    completed: 361,
    missed: 4,
    cancelled: 19,
    hours_completed: 431.5,
    hours_this_month: 140,
  },
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
    expect([
      first.start.getFullYear(),
      first.start.getMonth(),
      first.start.getDate(),
      first.start.getHours(),
    ]).toEqual([2026, 10, 9, 0]);
  });

  it('subjects with the same name join into one row', () => {
    expect(subjectBreakdown(summary).map((s) => [s.name, s.hours])).toEqual([
      ['Math', 114],
      ['Physics', 31],
    ]);
  });

  it('students: next and last session, and active with a session to come or hours left', () => {
    const pkg = {
      student: { id: 8, first_name: 'Ali', last_name: 'B' },
      original_hours: 10,
      remaining_hours: 0,
    } as unknown as Package;
    const students = buildStudents([pkg], summary.students || []);
    expect(
      students.map((s) => [s.id, s.active, s.nextSessionAt, s.lastCourse]),
    ).toEqual([
      [7, true, '2026-11-20T06:00:00Z', 'IB - DP2 - Physics'],
      [8, false, undefined, undefined],
    ]);
    expect(students[0].courses).toEqual(['Physics']);
  });
});

describe('buildStudents: active follows the server', () => {
  it('marks exactly the students the server lists as active', () => {
    const pkg = (id: number, studentId: number, free: number) =>
      ({
        id,
        remaining_hours: free,
        original_hours: 10,
        student: {
          id: studentId,
          first_name: 'S',
          last_name: String(studentId),
        },
        tutor: { id: 1 },
        grade_subject: { full_course_name: 'IGCSE - G10 - Math' },
      }) as unknown as Package;
    const students = buildStudents([pkg(1, 11, 5), pkg(2, 12, 0)], [], [12]);
    const active = Object.fromEntries(students.map((s) => [s.id, s.active]));
    // 11 has hours but the server says not active (e.g. hours moved away)
    expect(active).toEqual({ 11: false, 12: true });
  });

  it('falls back to hours or a coming session when the server sends no list', () => {
    const pkg = {
      id: 1,
      remaining_hours: 5,
      original_hours: 10,
      student: { id: 11, first_name: 'S', last_name: 'A' },
      tutor: { id: 1 },
      grade_subject: { full_course_name: 'IGCSE - G10 - Math' },
    } as unknown as Package;
    expect(buildStudents([pkg], [])[0].active).toBe(true);
  });
});

describe('buildStudents: one hours meter per course (23 Nov 2026)', () => {
  it("lists each of the student's packages with this tutor, fewest hours left first", () => {
    const pkg = (id: number, course: string, hours: Record<string, number>) =>
      ({
        id,
        original_hours: 12,
        remaining_hours: hours.unscheduled ?? 0,
        student: { id: 5, first_name: 'Omar', last_name: 'Adel' },
        tutor: { first_name: 'Mona', last_name: 'F' },
        grade_subject: { id, full_course_name: course },
        hours: {
          bought: 12,
          moved_out: 0,
          used: 0,
          scheduled: 0,
          unscheduled: 0,
          consistent: true,
          ...hours,
        },
      }) as unknown as Package;
    const [student] = buildStudents(
      [
        pkg(1, 'IGCSE OL - G10 - Math', { used: 4, unscheduled: 8 }),
        pkg(2, 'IB - DP2 - Physics', {
          used: 9,
          missed: 1,
          scheduled: 1,
          unscheduled: 1,
        }),
      ],
      [],
    );
    expect(student.lines.map((l) => [l.id, l.left, l.low])).toEqual([
      [2, 2, true],
      [1, 8, false],
    ]);
    expect(student.lines[0]).toMatchObject({
      done: 8,
      missed: 1,
      booked: 1,
      free: 1,
    });
  });

  it('gives each course its grade and curriculum, from the package or the name', () => {
    expect(courseInfo('IGCSE - G10 - Accounting')).toEqual({
      subject: 'Accounting',
      grade: 'G10',
      curriculum: 'IGCSE',
    });
    // The server's own names win over the parts of the course name
    expect(
      courseInfo('IB - DP2 - Physics', {
        grade: { name: 'DP 2' },
        curriculum: { name: 'IB Diploma' },
      }),
    ).toEqual({ subject: 'Physics', grade: 'DP 2', curriculum: 'IB Diploma' });
    // A bare subject keeps only itself; no name at all is no course
    expect(courseInfo('Physics')).toEqual({
      subject: 'Physics',
      grade: '',
      curriculum: '',
    });
    expect(courseInfo(undefined)).toBeNull();
    // An imported course with no grade set: the word "Unspecified" is not shown
    expect(courseInfo('American Diploma ACT - Unspecified - Physics')).toEqual({
      subject: 'Physics',
      grade: '',
      curriculum: 'American Diploma ACT',
    });
  });
});
