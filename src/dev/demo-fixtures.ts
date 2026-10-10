/**
 * Sample data for local demo mode (see demo-mode.ts). Dev server only.
 *
 * Everything here is fictional. Dates are generated relative to "now" so
 * the pages always show a mix of upcoming and past sessions.
 */
import {
  CurrentUser,
  GradeSubject,
  Field,
  Instructor,
  Package,
  SessionType,
  TutorReview,
  TutorPackage,
} from '../assets/types';
import type { DemoRole } from './demo-mode';
import instructor1 from '../assets/images/newLanding/instructor1.webp';
import instructor2 from '../assets/images/newLanding/instructor2.webp';
import instructor3 from '../assets/images/newLanding/instructor3.webp';
import instructor4 from '../assets/images/newLanding/instructor4.webp';

export const DEMO_EMAIL_DOMAIN = '@demo.local';

const STUDENT_ID = 900001;
const TUTOR_ID = 900002;
const TS = '2026-10-01T09:00:00.000Z';

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

const at = (dayOffset: number, hour: number, minute = 0): Date => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
};
const plusMinutes = (d: Date, minutes: number) =>
  new Date(d.getTime() + minutes * 60000);

// ---------------------------------------------------------------------------
// Grade subjects ("Curriculum - Grade - Subject")
// ---------------------------------------------------------------------------

const GRADE_SUBJECTS_RAW: Array<[number, string, string, string]> = [
  [11, 'IGCSE', 'Grade 10', 'Mathematics'],
  [12, 'IGCSE', 'Grade 10', 'English as a Second Language'],
  [13, 'American', 'Grade 11', 'SAT Math'],
  [14, 'American', 'Grade 11', 'SAT Verbal'],
  [15, 'IGCSE', 'Grade 9', 'Physics'],
  [16, 'General', 'Adults', 'Conversational English'],
  [17, 'IELTS', 'Adults', 'IELTS Academic'],
  [18, 'Egyptian National', 'Grade 12', 'Chemistry'],
];

const curriculumIds: Record<string, number> = {};
const gradeSubjects: GradeSubject[] = GRADE_SUBJECTS_RAW.map(
  ([id, curriculum, grade, subject], index) => {
    if (!curriculumIds[curriculum]) {
      curriculumIds[curriculum] = Object.keys(curriculumIds).length + 1;
    }
    return {
      id,
      full_course_name: `${curriculum} - ${grade} - ${subject}`,
      created_at: TS,
      updated_at: TS,
      curriculum: { id: curriculumIds[curriculum], name: curriculum },
      grade: { id: 100 + index, name: grade },
      subject: { id: 200 + index, name: subject },
    };
  },
);
const gradeSubjectById = new Map(gradeSubjects.map((g) => [g.id, g]));
const gs = (id: number): GradeSubject => gradeSubjectById.get(id)!;
const field = (id: number): Field => ({
  id,
  full_course_name: gs(id).full_course_name,
  created_at: TS,
  updated_at: TS,
});

// ---------------------------------------------------------------------------
// Tutors
// ---------------------------------------------------------------------------

const OMAR_BIO =
  'Hi, I am Omar, a mathematics and physics tutor with 8 years of experience teaching IGCSE and SAT students across Egypt and the Gulf. I focus on building real understanding first, then exam technique: past papers, timing drills and clear worked solutions. My students regularly move up two grade boundaries within a single term.';

const REVIEWS: TutorReview[] = [
  {
    id: 1,
    student: 'Sara Ahmed',
    rating: 5,
    text: 'Omar explains quadratic equations so clearly. My IGCSE mock grade went from a C to an A in two months.',
    created_at: '2026-09-21T15:00:00.000Z',
  },
  {
    id: 2,
    student: 'Youssef Kamal',
    rating: 5,
    text: 'Very patient and well organised. Every session ends with a short practice sheet, which really helps.',
    created_at: '2026-09-02T15:00:00.000Z',
  },
  {
    id: 3,
    student: 'Laila Hassan',
    rating: 4,
    text: 'Great SAT Math strategies. I would love slightly longer sessions before the exam.',
    created_at: '2026-08-14T15:00:00.000Z',
  },
  {
    id: 4,
    student: 'Nour El-Din',
    rating: 5,
    text: 'The best tutor I have had. Friendly, punctual and always prepared.',
    created_at: '2026-07-30T15:00:00.000Z',
  },
];

const tutorPackagesFor = (tutorId: number, rate: number): TutorPackage[] => [
  {
    id: tutorId * 10 + 1,
    type: 'TrialPackage',
    minutes: 30,
    time_in_hours: 0.5,
    rate: 0,
    offline_rate: 0,
    tutor_user_id: tutorId,
  },
  {
    id: tutorId * 10 + 2,
    type: 'DefaultPackage',
    minutes: 60,
    time_in_hours: 1,
    rate,
    offline_rate: rate,
    tutor_user_id: tutorId,
  },
  {
    id: tutorId * 10 + 3,
    type: 'Package',
    minutes: 300,
    time_in_hours: 5,
    rate: Math.round(rate * 0.92),
    offline_rate: rate,
    tutor_user_id: tutorId,
  },
  {
    id: tutorId * 10 + 4,
    type: 'Package',
    minutes: 600,
    time_in_hours: 10,
    rate: Math.round(rate * 0.85),
    offline_rate: rate,
    tutor_user_id: tutorId,
  },
];

interface TutorSeed {
  id: number;
  first_name: string;
  last_name: string;
  avatar?: string;
  video_url: string;
  bio: string;
  rating: number;
  reviews: number;
  students: number;
  sessions: number;
  rate: number;
  trial: boolean;
  fields: number[];
  online?: boolean;
  recommended?: boolean;
}

const makeTutor = (seed: TutorSeed): Instructor => ({
  id: seed.id,
  type: 'Tutor',
  first_name: seed.first_name,
  last_name: seed.last_name,
  email: `${seed.first_name.toLowerCase()}.${seed.last_name.toLowerCase()}${DEMO_EMAIL_DOMAIN}`,
  phone_number: `+9715000${String(seed.id).slice(-5)}`,
  avatar: seed.avatar,
  video_url: seed.video_url,
  bio: seed.bio,
  created_at: TS,
  updated_at: TS,
  recommended: !!seed.recommended,
  available: true,
  online: !!seed.online,
  average_rating: seed.rating,
  number_of_reviews: seed.reviews,
  number_of_students: seed.students,
  number_of_sessions: seed.sessions,
  rate_to_display: seed.rate,
  grade_subjects: seed.fields.map(field),
  instructor_fields: seed.fields.map((id) => gs(id).subject.name),
  tutor_fields: seed.fields.map((id) => [id, gs(id).full_course_name]),
  tutor_reviews: seed.id === TUTOR_ID ? REVIEWS : REVIEWS.slice(1, 3),
  free_trial: { enabled: seed.trial, claimed: false },
  tutor_packages: tutorPackagesFor(seed.id, seed.rate),
});

const tutors: Instructor[] = [
  makeTutor({
    id: TUTOR_ID,
    first_name: 'Omar',
    last_name: 'Fadl',
    avatar: instructor4,
    video_url: 'M7lc1UVf-VE',
    bio: OMAR_BIO,
    rating: 4.9,
    reviews: 48,
    students: 63,
    sessions: 412,
    rate: 350,
    trial: true,
    online: true,
    recommended: true,
    fields: [11, 13, 15],
  }),
  makeTutor({
    id: 900102,
    first_name: 'Mariam',
    last_name: 'Saleh',
    avatar: instructor2,
    video_url: 'aqz-KE-bpKQ',
    bio: 'CELTA-certified English teacher. I help teenagers and adults speak confidently, write clearly and score 7+ in IELTS Academic.',
    rating: 4.8,
    reviews: 36,
    students: 51,
    sessions: 288,
    rate: 300,
    trial: true,
    fields: [12, 16, 17],
  }),
  makeTutor({
    id: 900103,
    first_name: 'Karim',
    last_name: 'Nabil',
    video_url: 'ScMzIvxBSi4',
    bio: 'SAT specialist (1580 scorer). Structured study plans, full-length mocks and weekly progress reports for parents.',
    rating: 4.6,
    reviews: 22,
    students: 30,
    sessions: 175,
    rate: 420,
    trial: false,
    fields: [13, 14],
  }),
  makeTutor({
    id: 900104,
    first_name: 'Hana',
    last_name: 'Mostafa',
    avatar: instructor1,
    video_url: 'LXb3EKWsInQ',
    bio: 'Chemistry teacher for Thanaweya Amma and IGCSE. I turn memorisation into understanding with simple experiments you can do at home.',
    rating: 5,
    reviews: 17,
    students: 24,
    sessions: 140,
    rate: 280,
    trial: true,
    fields: [18, 15],
  }),
  makeTutor({
    id: 900105,
    first_name: 'Ahmed',
    last_name: 'Zaki',
    video_url: 'M7lc1UVf-VE',
    bio: 'Friendly maths and English tutor for younger IGCSE learners.',
    rating: 4.3,
    reviews: 9,
    students: 12,
    sessions: 60,
    rate: 250,
    trial: false,
    fields: [11, 12],
  }),
  makeTutor({
    id: 900106,
    first_name: 'Yasmine',
    last_name: 'Abdelrahman',
    avatar: instructor3,
    video_url: 'aqz-KE-bpKQ',
    bio: 'Conversational English coach. Business English, interview preparation and everyday fluency for professionals who are short on time.',
    rating: 4.7,
    reviews: 28,
    students: 40,
    sessions: 230,
    rate: 320,
    trial: true,
    fields: [16, 17, 12],
  }),
];
const tutorById = new Map(tutors.map((t) => [t.id, t]));
const tutor = (id: number): Instructor => tutorById.get(id)!;
const MY_INSTRUCTOR_IDS = [TUTOR_ID, 900102, 900106];

// ---------------------------------------------------------------------------
// Demo users
// ---------------------------------------------------------------------------

export const demoUsers: Record<DemoRole, CurrentUser> = {
  student: {
    id: STUDENT_ID,
    first_name: 'Sara',
    last_name: 'Ahmed',
    email: `sara${DEMO_EMAIL_DOMAIN}`,
    phone_number: '+971500000001',
    type: 'Student',
    created_at: TS,
    updated_at: TS,
    email_confirmed: true,
    previous_sessions_count: 9,
    upcoming_sessions_count: 4,
    unscheduled_hours: 7,
  },
  tutor: {
    id: TUTOR_ID,
    first_name: 'Omar',
    last_name: 'Fadl',
    email: `omar${DEMO_EMAIL_DOMAIN}`,
    phone_number: '+971500000002',
    type: 'Tutor',
    avatar: instructor4,
    bio: OMAR_BIO,
    video_url: 'M7lc1UVf-VE',
    recommended: true,
    created_at: TS,
    updated_at: TS,
    email_confirmed: true,
    grade_subjects: [11, 13, 15].map(field),
    previous_sessions_count: 37,
    upcoming_sessions_count: 6,
    unscheduled_hours: 12,
  },
};

// ---------------------------------------------------------------------------
// Students
// ---------------------------------------------------------------------------

interface StudentSeed {
  id: number;
  first_name: string;
  last_name: string;
}
const students: StudentSeed[] = [
  { id: STUDENT_ID, first_name: 'Sara', last_name: 'Ahmed' },
  { id: 900202, first_name: 'Youssef', last_name: 'Kamal' },
  { id: 900203, first_name: 'Laila', last_name: 'Hassan' },
  { id: 900204, first_name: 'Nour', last_name: 'El-Din' },
];
const studentById = new Map(students.map((s) => [s.id, s]));
const studentEmail = (s: StudentSeed) =>
  s.id === STUDENT_ID
    ? demoUsers.student.email
    : `${s.first_name.toLowerCase()}${DEMO_EMAIL_DOMAIN}`;
const studentPhone = (s: StudentSeed) => `+9715000${String(s.id).slice(-5)}`;

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

let nextSessionId = 9000;
const makeSession = (
  tutorId: number,
  studentId: number,
  start: Date,
  minutes: number,
  sessionType: SessionType['session_type'],
  status: SessionType['status'],
  gradeSubjectId: number,
): SessionType => {
  const t = tutor(tutorId);
  const s = studentById.get(studentId)!;
  const id = ++nextSessionId;
  return {
    id,
    created_at: TS,
    updated_at: TS,
    start_time: start.toISOString(),
    end_time: plusMinutes(start, minutes).toISOString(),
    session_type: sessionType,
    status,
    grade_subject: field(gradeSubjectId),
    tutor: {
      id: t.id,
      created_at: TS,
      email: t.email,
      first_name: t.first_name,
      last_name: t.last_name,
      phone_number: t.phone_number,
      type: 'Tutor',
      updated_at: TS,
      image: t.avatar || '',
      rating: t.average_rating || 0,
      reviews: t.number_of_reviews || 0,
    },
    student: {
      id: s.id,
      created_at: TS,
      email: studentEmail(s),
      first_name: s.first_name,
      last_name: s.last_name,
      phone_number: studentPhone(s),
      type: 'Student',
      updated_at: TS,
      image: '',
    },
    session_link:
      status === 'open' || status === 'scheduled'
        ? `https://meet.example.com/demo-${id}`
        : '',
  };
};

const buildSessions = (role: DemoRole): SessionType[] => {
  const liveStart = new Date(Date.now() - 10 * 60000);
  if (role === 'tutor') {
    return [
      makeSession(TUTOR_ID, STUDENT_ID, liveStart, 60, 'regular', 'open', 11),
      makeSession(TUTOR_ID, 900202, at(1, 16), 60, 'regular', 'scheduled', 15),
      makeSession(TUTOR_ID, 900203, at(3, 20), 60, 'trial', 'scheduled', 13),
      makeSession(
        TUTOR_ID,
        STUDENT_ID,
        at(4, 18, 30),
        90,
        'regular',
        'scheduled',
        13,
      ),
      makeSession(TUTOR_ID, 900204, at(6, 17), 60, 'group', 'scheduled', 11),
      makeSession(TUTOR_ID, 900202, at(15, 16), 60, 'regular', 'scheduled', 15),
      makeSession(TUTOR_ID, 900203, at(-2, 19), 60, 'regular', 'completed', 13),
      makeSession(TUTOR_ID, 900204, at(-4, 17), 60, 'regular', 'missed', 11),
      // Two months of teaching history for the tutor dashboard
      ...(
        [
          [-1, 17, 60, STUDENT_ID, 11],
          [-3, 18, 90, 900202, 15],
          [-6, 17, 60, 900203, 13],
          [-8, 18, 60, STUDENT_ID, 11],
          [-9, 19, 60, 900204, 11],
          [-13, 17, 90, 900202, 15],
          [-15, 18, 60, STUDENT_ID, 13],
          [-17, 17, 60, 900203, 13],
          [-20, 18, 60, 900202, 15],
          [-23, 18, 60, STUDENT_ID, 11],
          [-27, 17, 90, 900204, 11],
          [-30, 18, 60, 900202, 15],
          [-34, 18, 60, STUDENT_ID, 11],
          [-38, 17, 60, 900203, 13],
          [-41, 18, 60, 900202, 15],
          [-45, 18, 60, STUDENT_ID, 11],
          [-49, 17, 60, 900204, 11],
        ] as const
      ).map(([day, hour, minutes, studentId, subjectId]) =>
        makeSession(
          TUTOR_ID,
          studentId,
          at(day, hour),
          minutes,
          'regular',
          'completed',
          subjectId,
        ),
      ),
    ];
  }
  return [
    makeSession(TUTOR_ID, STUDENT_ID, liveStart, 60, 'regular', 'open', 11),
    makeSession(900102, STUDENT_ID, at(2, 17), 60, 'trial', 'scheduled', 12),
    makeSession(
      TUTOR_ID,
      STUDENT_ID,
      at(4, 18, 30),
      90,
      'regular',
      'scheduled',
      13,
    ),
    makeSession(900106, STUDENT_ID, at(8, 19), 60, 'group', 'scheduled', 16),
    makeSession(
      TUTOR_ID,
      STUDENT_ID,
      at(12, 18),
      60,
      'regular',
      'scheduled',
      11,
    ),
    makeSession(900103, STUDENT_ID, at(-1, 16), 60, 'regular', 'completed', 13),
    makeSession(
      TUTOR_ID,
      STUDENT_ID,
      at(-3, 18),
      60,
      'regular',
      'canceled',
      15,
    ),
    makeSession(900104, STUDENT_ID, at(-5, 17), 45, 'trial', 'missed', 18),
    // Two months of learning history so the dashboard insights look real
    ...(
      [
        [-8, 18, 60, TUTOR_ID, 11],
        [-10, 17, 90, 900103, 13],
        [-12, 18, 60, 900102, 12],
        [-15, 18, 60, TUTOR_ID, 11],
        [-17, 19, 60, 900106, 16],
        [-19, 18, 90, TUTOR_ID, 13],
        [-22, 17, 60, 900102, 12],
        [-26, 18, 60, TUTOR_ID, 11],
        [-29, 18, 90, 900103, 13],
        [-33, 18, 60, TUTOR_ID, 11],
        [-36, 17, 60, 900102, 12],
        [-40, 18, 60, TUTOR_ID, 11],
        [-43, 19, 60, 900106, 16],
        [-47, 18, 60, TUTOR_ID, 11],
        [-50, 17, 60, 900102, 12],
      ] as const
    ).map(([day, hour, minutes, tutorId, subjectId]) =>
      makeSession(
        tutorId,
        STUDENT_ID,
        at(day, hour),
        minutes,
        'regular',
        'completed',
        subjectId,
      ),
    ),
  ];
};

// ---------------------------------------------------------------------------
// Packages
// ---------------------------------------------------------------------------

const makePackage = (
  id: number,
  tutorId: number,
  studentId: number,
  gradeSubjectId: number,
  packageType: Package['package_type'],
  originalHours: number,
  remainingHours: number,
  amountPaid: number,
  paymentMethod: string,
  createdAt: string,
): Package => {
  const t = tutor(tutorId);
  const s = studentById.get(studentId)!;
  return {
    id,
    amount_paid: amountPaid,
    amount_paid_currency: 'EGP',
    created_at: createdAt,
    updated_at: '2026-10-08T12:00:00.000Z',
    grade_subject: gs(gradeSubjectId),
    initial_hours: originalHours,
    original_hours: originalHours,
    remaining_hours: remainingHours,
    package_type: packageType,
    payment_method: paymentMethod,
    slug: `demo-package-${id}`,
    source: 'web',
    tutor_rate: t.rate_to_display || 0,
    student: {
      id: s.id,
      country_code: 'EG',
      created_at: TS,
      email: studentEmail(s),
      first_name: s.first_name,
      last_name: s.last_name,
      nationality: 'Egyptian',
      phone_number: studentPhone(s),
      type: 'Student',
      updated_at: TS,
    },
    tutor: {
      id: t.id,
      created_at: TS,
      email: t.email,
      first_name: t.first_name,
      last_name: t.last_name,
      phone_number: t.phone_number,
      type: 'Tutor',
      updated_at: TS,
      avatar: t.avatar,
      average_rating: t.average_rating,
      number_of_reviews: t.number_of_reviews,
    },
  };
};

const packagesByRole: Record<DemoRole, Package[]> = {
  student: [
    makePackage(
      701,
      TUTOR_ID,
      STUDENT_ID,
      11,
      'private_session',
      10,
      6,
      2975,
      'credit_card',
      '2026-09-01T10:00:00.000Z',
    ),
    makePackage(
      702,
      900102,
      STUDENT_ID,
      17,
      'private_session',
      5,
      1,
      1380,
      'vodafone_cash',
      '2026-08-20T10:00:00.000Z',
    ),
    makePackage(
      703,
      900106,
      STUDENT_ID,
      16,
      'group_course',
      12,
      12,
      1800,
      'fawry',
      '2026-10-05T10:00:00.000Z',
    ),
  ],
  tutor: [
    makePackage(
      701,
      TUTOR_ID,
      STUDENT_ID,
      11,
      'private_session',
      10,
      6,
      2975,
      'credit_card',
      '2026-09-01T10:00:00.000Z',
    ),
    makePackage(
      711,
      TUTOR_ID,
      900202,
      15,
      'private_session',
      5,
      3,
      1610,
      'bank_transfer',
      '2026-09-12T10:00:00.000Z',
    ),
    makePackage(
      712,
      TUTOR_ID,
      900203,
      13,
      'trial_session',
      0.5,
      0.5,
      0,
      '',
      '2026-10-07T10:00:00.000Z',
    ),
  ],
};

// ---------------------------------------------------------------------------
// Availability (three weeks ahead, morning and afternoon slots)
// ---------------------------------------------------------------------------

interface DemoSlot {
  id: number;
  start_time: string;
  end_time: string;
  status: 'available' | 'reserved';
  tutor_id: number;
}

const availabilityFor = (
  tutorId: number,
  from: string | null,
  to: string | null,
): DemoSlot[] => {
  const seed = tutorId % 100;
  const now = Date.now();
  const slots: DemoSlot[] = [];
  let id = seed * 1000;
  for (let day = 0; day < 21; day += 1) {
    if ((day + seed) % 7 === 5) continue; // one day off per week
    [7, 8, 15, 16, 17, 18, 19].forEach((hour, i) => {
      if ((i + day + seed) % 4 === 0) return;
      const start = at(day, hour);
      if (start.getTime() < now) return;
      id += 1;
      slots.push({
        id,
        start_time: start.toISOString(),
        end_time: plusMinutes(start, 60).toISOString(),
        status: (hour + day) % 5 === 0 ? 'reserved' : 'available',
        tutor_id: tutorId,
      });
    });
  }
  const fromMs = from ? new Date(from).getTime() : -Infinity;
  const toMs = to ? new Date(to).getTime() : Infinity;
  return slots.filter((slot) => {
    const start = new Date(slot.start_time).getTime();
    return start >= fromMs && start < toMs;
  });
};

// ---------------------------------------------------------------------------
// Request resolver
// ---------------------------------------------------------------------------

export interface DemoResult {
  status?: number;
  data?: unknown;
  headers?: Record<string, string>;
}

const paginate = <T>(list: T[], params: URLSearchParams): DemoResult => {
  const page = Math.max(1, Number(params.get('page')) || 1);
  const perPage = Math.max(1, Number(params.get('per_page')) || 10);
  const totalPages = Math.max(1, Math.ceil(list.length / perPage));
  return {
    data: { data: list.slice((page - 1) * perPage, page * perPage) },
    // Same pagination headers the real API sends
    headers: {
      'current-page': String(page),
      'total-pages': String(totalPages),
      'total-count': String(list.length),
      'page-items': String(perPage),
    },
  };
};

const numberParam = (params: URLSearchParams, key: string) => {
  const value = params.get(key);
  return value ? Number(value) : undefined;
};

/** Reads `tutor[bio]`-style fields from a FormData or JSON request body. */
const readBody = (body: unknown): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  const assign = (key: string, value: unknown) => {
    const match = key.match(/^\w+\[(\w+)\]$/);
    out[match ? match[1] : key] = value;
  };
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    body.forEach((value, key) => {
      if (typeof value === 'string') assign(key, value);
    });
    return out;
  }
  let parsed: unknown = body;
  if (typeof body === 'string') {
    try {
      parsed = JSON.parse(body);
    } catch {
      return out;
    }
  }
  if (parsed && typeof parsed === 'object') {
    Object.entries(parsed as Record<string, unknown>).forEach(
      ([key, value]) => {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          Object.assign(out, value);
        } else {
          assign(key, value);
        }
      },
    );
  }
  return out;
};

const ok = (data: unknown = {}): DemoResult => ({ status: 200, data });

/** Answers one API request from sample data. Unknown paths get a 404. */
export function resolveDemoRequest(
  method: string,
  path: string,
  params: URLSearchParams,
  role: DemoRole,
  body: unknown,
): DemoResult {
  const user = demoUsers[role] ?? demoUsers.student;
  const cleanPath = path.replace(/\/+$/, '') || '/';
  let match: RegExpMatchArray | null;

  if (method === 'GET') {
    if (cleanPath === '/me') return ok(user);
    if (cleanPath === '/grade_subjects') return ok({ data: gradeSubjects });

    if (cleanPath === '/tutors') {
      const gradeSubjectId = numberParam(params, 'grade_subject_id');
      const list = gradeSubjectId
        ? tutors.filter((t) =>
            t.grade_subjects?.some((g) => g.id === gradeSubjectId),
          )
        : tutors;
      return paginate(list, params);
    }

    if (cleanPath === '/me/instructors') {
      const gradeSubjectId = numberParam(params, 'grade_subject_id');
      const mine =
        role === 'tutor'
          ? tutors.filter((t) => t.id !== TUTOR_ID).slice(0, 3)
          : MY_INSTRUCTOR_IDS.map(tutor);
      return ok({
        data: gradeSubjectId
          ? mine.filter((t) =>
              t.grade_subjects?.some((g) => g.id === gradeSubjectId),
            )
          : mine,
      });
    }

    if ((match = cleanPath.match(/^\/tutors\/(\d+)\/availabilities$/))) {
      return ok({
        data: availabilityFor(
          Number(match[1]),
          params.get('by_date_range[start_time]'),
          params.get('by_date_range[end_time]'),
        ),
      });
    }

    if ((match = cleanPath.match(/^\/tutors\/(\d+)$/))) {
      const found = tutorById.get(Number(match[1]));
      return found
        ? ok({ data: found })
        : { status: 404, data: { error: 'Tutor not found' } };
    }

    if (cleanPath === '/availabilities') {
      return ok({
        data: availabilityFor(
          TUTOR_ID,
          params.get('a'),
          params.get('end_time'),
        ),
      });
    }

    if (cleanPath === '/sessions') {
      const status = params.get('status');
      const tutorId = numberParam(params, 'tutor_id');
      const gradeSubjectId = numberParam(params, 'grade_subject_id');
      const list = buildSessions(role).filter(
        (s) =>
          (!status || s.status === status) &&
          (!tutorId || s.tutor.id === tutorId) &&
          (!gradeSubjectId || s.grade_subject.id === gradeSubjectId),
      );
      return paginate(list, params);
    }

    if (cleanPath === '/packages') {
      return paginate(packagesByRole[role] ?? [], params);
    }

    if ((match = cleanPath.match(/^\/sessions\/(\d+)\/(cancel|end)$/))) {
      return ok({ data: { id: Number(match[1]) } });
    }
  }

  if (method === 'POST') {
    if (cleanPath === '/users/tokens') return ok({});
    if (cleanPath === '/sessions/trial' || cleanPath === '/sessions/private') {
      return { status: 201, data: { data: { id: 9999 } } };
    }
    if (cleanPath === '/availabilities') return { status: 201, data: {} };
    if (cleanPath === '/users/sign_in' || cleanPath === '/users/sign_up') {
      return ok({ data: user });
    }
  }

  if (method === 'PATCH' || method === 'PUT') {
    if (
      cleanPath === '/user' ||
      cleanPath === '/tutor' ||
      cleanPath === `/tutors/${user.id}`
    ) {
      const changes = readBody(body);
      delete changes.avatar;
      return ok({ data: { ...user, ...changes } });
    }
    if (/^\/\w+\/passwords$/.test(cleanPath)) return ok({});
  }

  if (method === 'DELETE') {
    if (cleanPath === '/users/sign_out') return ok({});
    if (cleanPath === '/availabilities') return ok({});
  }

  return {
    status: 404,
    data: { error: `No demo data for ${method} ${path}` },
  };
}
