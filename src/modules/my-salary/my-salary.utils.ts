export interface CourseParts {
  curriculum: string;
  stage: string;
  subject: string;
}

/** "IGCSE - Grade 10 - Mathematics" -> curriculum / stage / subject */
export const splitCourse = (fullCourseName?: string | null): CourseParts => {
  const parts = (fullCourseName || '').split(' - ').map((p) => p.trim());
  if (parts.length >= 3) {
    return {
      curriculum: parts[0],
      stage: parts.slice(1, -1).join(' - '),
      subject: parts[parts.length - 1],
    };
  }
  if (parts.length === 2) {
    return { curriculum: parts[0], stage: '', subject: parts[1] };
  }
  return { curriculum: '', stage: '', subject: parts[0] || '' };
};

/** Rates and amounts from GET /my_salary are in EGP */
export const SALARY_CURRENCY = 'EGP';

export interface MySalaryLine {
  session_id: number;
  start_time: string;
  end_time: string;
  student_id: number;
  student_name: string | null;
  grade_subject_id: number;
  course: string | null;
  session_type: 'regular' | 'trial';
  status: string;
  hours: number;
  /** Per hour, null when the session has no rate yet */
  rate: number | null;
  amount: number;
  /** False for sessions not paid (yet): missed but unconfirmed, or not closed */
  paid: boolean;
  flags: string[];
}

export interface MySalaryResponse {
  month: string;
  totals: {
    sessions: number;
    completed: number;
    missed: number;
    trials: number;
    hours: number;
    amount: number;
    unpriced: number;
  };
  groups: {
    grade_subject_id: number;
    course: string | null;
    rate: number | null;
    sessions: number;
    hours: number;
    amount: number;
  }[];
  lines: MySalaryLine[];
  /** Sessions still booked later this month, at their rate */
  upcoming: { sessions: number; amount: number };
}

export interface SalaryGroup {
  key: string;
  course: CourseParts;
  sessions: number;
  hours: number;
  rate: number | null;
  amount: number;
}

export interface SalaryReport {
  /** Paid sessions only, newest first */
  lines: MySalaryLine[];
  groups: SalaryGroup[];
  hours: number;
  sessions: number;
  amount: number;
  unpricedSessions: number;
  upcomingAmount: number;
  upcomingSessions: number;
  /** Paid hours that have a rate, for the average */
  pricedHours: number;
}

/** "2026-11" for the month `offset` months from `now` (0 = this month) */
export const monthKey = (now: Date, offset: number): string => {
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const EMPTY_REPORT: SalaryReport = {
  lines: [],
  groups: [],
  hours: 0,
  sessions: 0,
  amount: 0,
  unpricedSessions: 0,
  upcomingAmount: 0,
  upcomingSessions: 0,
  pricedHours: 0,
};

/** The page's view of GET /my_salary: only what the tutor is paid for */
export const toSalaryReport = (data?: MySalaryResponse): SalaryReport => {
  if (!data) return EMPTY_REPORT;
  const lines = data.lines
    .filter((line) => line.paid)
    .sort(
      (a, b) =>
        new Date(b.start_time).getTime() - new Date(a.start_time).getTime(),
    );
  return {
    lines,
    groups: data.groups.map((group) => ({
      key: `${group.grade_subject_id}|${group.rate}`,
      course: splitCourse(group.course),
      sessions: group.sessions,
      hours: group.hours,
      rate: group.rate,
      amount: group.amount,
    })),
    hours: data.totals.hours,
    sessions: data.totals.sessions,
    amount: data.totals.amount,
    unpricedSessions: data.totals.unpriced,
    upcomingAmount: data.upcoming.amount,
    upcomingSessions: data.upcoming.sessions,
    pricedHours: lines
      .filter((line) => line.rate !== null)
      .reduce((acc, line) => acc + line.hours, 0),
  };
};
