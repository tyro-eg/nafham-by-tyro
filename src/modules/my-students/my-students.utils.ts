import type { Package } from '../../assets/types';
import type { SummaryStudent } from '../../hooks/useSessions';
import { courseLabel, subjectName } from '../dashboard/dashboard.utils';
import { hoursLeft } from '../../lib/package-hours';
import { meterLine, orderLines, type MeterLine } from '../../lib/hours-meter';

/** One course a student takes with the tutor: what, which grade, which curriculum */
export interface CourseInfo {
  subject: string;
  grade: string;
  curriculum: string;
}

/**
 * "IGCSE - G10 - Accounting" as its three parts (24 Nov 2026: the tutor
 * sees subject, grade and curriculum on each student). The server's own
 * grade and curriculum names win when the package carries them; a name
 * without all three parts keeps only its subject.
 */
export const courseInfo = (
  fullCourseName?: string,
  known?: { grade?: { name: string }; curriculum?: { name: string } } | null,
): CourseInfo | null => {
  const subject = subjectName(fullCourseName);
  if (!subject) return null;
  const parts = courseLabel(fullCourseName)
    .split(' - ')
    .map((part) => part.trim());
  const named = parts.length >= 3;
  // Imported courses can carry "Unspecified" for a part: say nothing instead
  const set = (value?: string) =>
    value && !/^unspecified/i.test(value.trim()) ? value.trim() : '';
  return {
    subject,
    grade: set(known?.grade?.name) || set(named ? parts[1] : ''),
    curriculum: set(known?.curriculum?.name) || set(named ? parts[0] : ''),
  };
};

export interface StudentSummary {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  avatar?: string;
  courses: string[];
  /** Each course with its grade and curriculum, for the card */
  courseDetails: CourseInfo[];
  hoursRemaining: number;
  hoursPurchased: number;
  completedSessions: number;
  hoursTaught: number;
  /** One hours meter per course (done, missed, booked, free), 23 Nov 2026 */
  lines: MeterLine[];
  /** When the next booked session starts (ISO), if any */
  nextSessionAt?: string;
  /** The last completed session: when, and which course */
  lastSessionAt?: string;
  lastCourse?: string;
  active: boolean;
}

/**
 * Builds the tutor's student list from their packages and the server's
 * per-student summary (sessions taught, hours, courses, next session).
 * A student counts as enrolled if they have a package or a session with
 * this tutor; "active" means hours left or an upcoming session.
 */
export const buildStudents = (
  packages: Package[],
  summaryStudents: SummaryStudent[],
  /** The server's active students (the profile's count); older servers send none */
  activeIds?: number[],
): StudentSummary[] => {
  const byId = new Map<number, StudentSummary>();

  const ensure = (
    id: number,
    firstName: string,
    lastName: string,
    email?: string,
    avatar?: string,
  ): StudentSummary => {
    let student = byId.get(id);
    if (!student) {
      student = {
        id,
        firstName,
        lastName,
        email,
        avatar,
        courses: [],
        courseDetails: [],
        hoursRemaining: 0,
        hoursPurchased: 0,
        completedSessions: 0,
        hoursTaught: 0,
        lines: [],
        active: false,
      };
      byId.set(id, student);
    }
    student.avatar = student.avatar || avatar;
    student.email = student.email || email;
    return student;
  };

  const addCourse = (
    student: StudentSummary,
    fullCourseName?: string,
    known?: Parameters<typeof courseInfo>[1],
  ) => {
    const info = courseInfo(fullCourseName, known);
    if (!info) return;
    if (!student.courses.includes(info.subject))
      student.courses.push(info.subject);
    const same = student.courseDetails.find(
      (c) =>
        c.subject === info.subject &&
        (!c.grade || !info.grade || c.grade === info.grade) &&
        (!c.curriculum || !info.curriculum || c.curriculum === info.curriculum),
    );
    // The same course seen twice: keep whichever knows more
    if (same) {
      same.grade ||= info.grade;
      same.curriculum ||= info.curriculum;
    } else student.courseDetails.push(info);
  };

  packages.forEach((pkg) => {
    if (!pkg.student) return;
    const s = ensure(
      pkg.student.id,
      pkg.student.first_name,
      pkg.student.last_name,
      pkg.student.email,
      pkg.student.avatar,
    );
    s.hoursRemaining += hoursLeft(pkg);
    s.hoursPurchased += Number(pkg.original_hours) || 0;
    addCourse(s, pkg.grade_subject?.full_course_name, pkg.grade_subject);
    const line = meterLine(
      pkg,
      subjectName(pkg.grade_subject?.full_course_name),
    );
    if (line) s.lines = orderLines([...s.lines, line]);
  });

  summaryStudents.forEach((row) => {
    const s = ensure(row.id, row.first_name, row.last_name, row.email);
    row.courses.forEach((name) => addCourse(s, name));
    s.completedSessions = row.completed;
    s.hoursTaught = row.hours;
    if (row.next_session_at) s.nextSessionAt = row.next_session_at;
    if (row.last_session_at) s.lastSessionAt = row.last_session_at;
    if (row.last_course) s.lastCourse = row.last_course;
  });

  // One rule with the profile and dashboard: the server's (hours left or a
  // session coming, or a session in the last 30 days; trial-only students
  // don't count). 19 Nov 2026: this page counted 66, the profile 57.
  const serverActive = activeIds ? new Set(activeIds) : null;
  byId.forEach((s) => {
    s.active = serverActive
      ? serverActive.has(s.id)
      : s.hoursRemaining > 0 || !!s.nextSessionAt;
  });

  // Active students first, then by soonest session, then by name
  return [...byId.values()].sort((a, b) => {
    if (a.active !== b.active) return a.active ? -1 : 1;
    const aNext = a.nextSessionAt
      ? new Date(a.nextSessionAt).getTime()
      : Infinity;
    const bNext = b.nextSessionAt
      ? new Date(b.nextSessionAt).getTime()
      : Infinity;
    if (aNext !== bNext) return aNext - bNext;
    return `${a.firstName} ${a.lastName}`.localeCompare(
      `${b.firstName} ${b.lastName}`,
    );
  });
};
