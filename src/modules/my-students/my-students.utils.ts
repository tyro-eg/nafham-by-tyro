import type { Package } from '../../assets/types';
import type { SummaryStudent } from '../../hooks/useSessions';
import { subjectName } from '../dashboard/dashboard.utils';
import { hoursLeft } from '../../lib/package-hours';

export interface StudentSummary {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  avatar?: string;
  courses: string[];
  hoursRemaining: number;
  hoursPurchased: number;
  completedSessions: number;
  hoursTaught: number;
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
        hoursRemaining: 0,
        hoursPurchased: 0,
        completedSessions: 0,
        hoursTaught: 0,
        active: false,
      };
      byId.set(id, student);
    }
    student.avatar = student.avatar || avatar;
    student.email = student.email || email;
    return student;
  };

  const addCourse = (student: StudentSummary, fullCourseName?: string) => {
    const name = subjectName(fullCourseName);
    if (name && !student.courses.includes(name)) student.courses.push(name);
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
    addCourse(s, pkg.grade_subject?.full_course_name);
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

  byId.forEach((s) => {
    s.active = s.hoursRemaining > 0 || !!s.nextSessionAt;
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
