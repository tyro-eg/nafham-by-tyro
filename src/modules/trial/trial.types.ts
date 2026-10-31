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

/** How far ahead the search looks by default and at most */
export const DEFAULT_DAYS = 14;
export const MAX_DAYS = 30;

/** Everything the student has picked so far */
export interface TrialDraft {
  step: Step;
  courseId?: number;
  /** yyyy-mm-dd, local */
  from: string;
  to: string;
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

export const tomorrow = () => addDays(isoDate(new Date()), 1);

export const emptyDraft = (): TrialDraft => ({
  step: 'course',
  from: tomorrow(),
  to: addDays(tomorrow(), DEFAULT_DAYS),
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
    // Dates in the past are no use any more
    if (draft.from < tomorrow()) draft.from = tomorrow();
    if (draft.to <= draft.from) draft.to = addDays(draft.from, DEFAULT_DAYS);
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
