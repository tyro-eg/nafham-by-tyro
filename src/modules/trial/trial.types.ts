import type { TrialSlot } from '../../hooks/useTrial';

/** Time-of-day windows the student can narrow the search to (local hours) */
export type TimeWindow = 'any' | 'morning' | 'afternoon' | 'evening';

export const TIME_WINDOWS: Record<TimeWindow, { start: number; end: number }> =
  {
    any: { start: 0, end: 24 },
    morning: { start: 6, end: 12 },
    afternoon: { start: 12, end: 17 },
    evening: { start: 17, end: 23 },
  };

/** The wizard's steps, in order */
export const STEPS = ['course', 'when', 'tutors', 'slot', 'confirm'] as const;
export type Step = (typeof STEPS)[number];

/** How far ahead "flexible" looks, and how far a picked date may be */
export const FLEXIBLE_DAYS = 14;
export const MAX_DAYS = 30;

/** Which day(s) the student wants: today, tomorrow, one date, or any day soon */
export type DayChoice = 'today' | 'tomorrow' | 'date' | 'flexible';

/** Everything the student has picked so far */
export interface TrialDraft {
  step: Step;
  courseId?: number;
  /** The exam board the student sits, when the course's tutors declare boards */
  examBoardId?: number;
  day: DayChoice;
  /** yyyy-mm-dd, local; used when day is "date" */
  date: string;
  window: TimeWindow;
  tutorId?: number;
  slot?: TrialSlot;
  guardianPhone: string;
}

const DRAFT_KEY = 'tyro.trialDraft';

const isoDate = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const addDays = (yyyymmdd: string, days: number) => {
  const date = new Date(`${yyyymmdd}T00:00:00`);
  date.setDate(date.getDate() + days);
  return isoDate(date);
};

export const today = () => isoDate(new Date());
export const tomorrow = () => addDays(today(), 1);

/** The search's first and last day for a day choice */
export const rangeFor = (day: DayChoice, date: string) => {
  switch (day) {
    case 'today':
      return { from: today(), to: today() };
    case 'tomorrow':
      return { from: tomorrow(), to: tomorrow() };
    case 'date':
      return { from: date, to: date };
    default:
      return { from: today(), to: addDays(today(), FLEXIBLE_DAYS) };
  }
};

export const emptyDraft = (): TrialDraft => ({
  step: 'course',
  day: 'tomorrow',
  date: tomorrow(),
  window: 'any',
  guardianPhone: '',
});

/**
 * The draft survives a page change: a visitor registers at the last step,
 * the app switches layout, and the wizard picks up where they were.
 */
export const loadDraft = (): TrialDraft => {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return emptyDraft();
    const saved = JSON.parse(raw) as Partial<TrialDraft>;
    const draft = { ...emptyDraft(), ...saved };
    // A picked date in the past is no use any more
    if (!draft.date || draft.date < today()) draft.date = tomorrow();
    if (!['today', 'tomorrow', 'date', 'flexible'].includes(draft.day)) {
      draft.day = 'tomorrow';
    }
    return draft;
  } catch {
    return emptyDraft();
  }
};

export const saveDraft = (draft: TrialDraft) => {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Private mode or storage full: the wizard still works for this page
  }
};

export const clearDraft = () => {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // Nothing to clear
  }
};

/** The browser's IANA timezone, which the backend uses to read the time window */
export const localTimeZone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Cairo';

/** A slot's start as the student reads it, e.g. "Tue 3 Nov, 7:00 AM" */
export const formatSlot = (iso: string, locale: string) =>
  new Date(iso).toLocaleString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });

export const formatTime = (iso: string, locale: string) =>
  new Date(iso).toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: '2-digit',
  });

export const formatDay = (iso: string, locale: string) =>
  new Date(iso).toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

/** Local calendar day of a slot, to group slots */
export const dayOf = (iso: string) => {
  const date = new Date(iso);
  return isoDate(date);
};

/** "Tue 3 Nov", for tiles and the summary rail */
export const formatDate = (yyyymmdd: string, locale: string) =>
  new Date(`${yyyymmdd}T00:00:00`).toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
