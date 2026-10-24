import type { Package, SessionType } from '../../assets/types';
import { sessionHours, subjectName } from '../dashboard/dashboard.utils';

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
  nextSession?: SessionType;
  lastSession?: SessionType;
  active: boolean;
}

/**
 * Builds the tutor's student list from their packages and sessions.
 * A student counts as enrolled if they have a package or a session with
 * this tutor; "active" means hours left or an upcoming session.
 */
export const buildStudents = (
  packages: Package[],
  sessions: SessionType[],
  now: Date,
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
    s.hoursRemaining += Number(pkg.remaining_hours) || 0;
    s.hoursPurchased += Number(pkg.original_hours) || 0;
    addCourse(s, pkg.grade_subject?.full_course_name);
  });

  sessions.forEach((session) => {
    if (!session.student) return;
    const s = ensure(
      session.student.id,
      session.student.first_name,
      session.student.last_name,
      session.student.email,
      session.student.image,
    );
    addCourse(s, session.grade_subject?.full_course_name);
    const start = new Date(session.start_time);

    if (session.status === 'completed') {
      s.completedSessions += 1;
      s.hoursTaught += sessionHours(session);
      if (!s.lastSession || start > new Date(s.lastSession.start_time)) {
        s.lastSession = session;
      }
    }

    const upcoming =
      session.status === 'open' ||
      (session.status === 'scheduled' && new Date(session.end_time) > now);
    if (
      upcoming &&
      (!s.nextSession || start < new Date(s.nextSession.start_time))
    ) {
      s.nextSession = session;
    }
  });

  byId.forEach((s) => {
    s.active = s.hoursRemaining > 0 || !!s.nextSession;
  });

  // Active students first, then by soonest session, then by name
  return [...byId.values()].sort((a, b) => {
    if (a.active !== b.active) return a.active ? -1 : 1;
    const aNext = a.nextSession
      ? new Date(a.nextSession.start_time).getTime()
      : Infinity;
    const bNext = b.nextSession
      ? new Date(b.nextSession.start_time).getTime()
      : Infinity;
    if (aNext !== bNext) return aNext - bNext;
    return `${a.firstName} ${a.lastName}`.localeCompare(
      `${b.firstName} ${b.lastName}`,
    );
  });
};
