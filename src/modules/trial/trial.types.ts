import type { TrialDispatch, TrialSlot } from '../../hooks/useTrial';

/** Time-of-day windows the student can narrow the search to (local hours) */
export type TimeWindow = 'any' | 'morning' | 'afternoon' | 'evening';

export const TIME_WINDOWS: Record<TimeWindow, { start: number; end: number }> =
  {
    any: { start: 0, end: 24 },
    morning: { start: 6, end: 12 },
    afternoon: { start: 12, end: 17 },
    evening: { start: 17, end: 23 },
  };

/** The wizard's steps, in order; a parent first says which child it is for */
export const STEPS = [
  'child',
  'course',
  'when',
  'tutors',
  'slot',
  'confirm',
] as const;
export type Step = (typeof STEPS)[number];
export const stepsFor = (parent: boolean): readonly Step[] =>
  parent ? STEPS : STEPS.filter((step) => step !== 'child');

/** How far ahead "flexible" looks, and how far a picked date may be */
export const FLEXIBLE_DAYS = 14;
export const MAX_DAYS = 30;

/** Which day(s) the student wants: today, tomorrow, one date, or any day soon */
export type DayChoice = 'today' | 'tomorrow' | 'date' | 'flexible';

/** Everything the student has picked so far */
export interface TrialDraft {
  step: Step;
  /** A parent's pick: which child the trial is for */
  childId?: number;
  courseId?: number;
  /** The exam board the student sits, when the course's tutors declare boards */
  examBoardId?: number;
  day: DayChoice;
  /** yyyy-mm-dd, local; used when day is "date" */
  date: string;
  window: TimeWindow;
  tutorId?: number;
  slot?: TrialSlot;
  /** How the request finds its instructor: the picked tutor, or us */
  dispatch?: TrialDispatch;
  /** The trial's start, ISO: the slot's, or the time asked for */
  startTime?: string;
  /** For the instructor, optional */
  note: string;
  guardianPhone: string;
}

/** Picking something earlier in the wizard forgets the tutor and time */
export const NO_CHOICE: Pick<
  TrialDraft,
  'tutorId' | 'slot' | 'dispatch' | 'startTime'
> = {
  tutorId: undefined,
  slot: undefined,
  dispatch: undefined,
  startTime: undefined,
};

/** A request must be this far ahead (TrialRequest::MIN_LEAD) */
export const MIN_LEAD_HOURS = 6;
/** Start times are offered in these steps */
export const STEP_MINUTES = 30;

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

/** Whether the search covers today only, so time that has passed is out */
const todayOnly = (day: DayChoice, date: string) =>
  day === 'today' || (day === 'date' && date === today());

/** A time window that has already ended today */
const windowOver = (key: TimeWindow, now = new Date()) =>
  key !== 'any' &&
  now.getHours() + now.getMinutes() / 60 >= TIME_WINDOWS[key].end;

/** No time window is left today: the last one has ended */
export const todayOver = (now = new Date()) =>
  (Object.keys(TIME_WINDOWS) as TimeWindow[])
    .filter((key) => key !== 'any')
    .every((key) => windowOver(key, now));

/** The time windows still worth offering for the chosen day */
export const openWindows = (day: DayChoice, date: string): TimeWindow[] =>
  (Object.keys(TIME_WINDOWS) as TimeWindow[]).filter(
    (key) => !todayOnly(day, date) || !windowOver(key),
  );

/** The first day a student may pick: tomorrow once today is over */
export const firstDay = () => (todayOver() ? tomorrow() : today());

/** The draft with any pick that time has overtaken moved to the next valid one */
export const freshWhen = <
  T extends Pick<TrialDraft, 'day' | 'date' | 'window'>,
>(
  draft: T,
): T => {
  const next = { ...draft };
  if (next.day === 'today' && todayOver()) next.day = 'tomorrow';
  if (!next.date || next.date < firstDay()) next.date = tomorrow();
  if (!openWindows(next.day, next.date).includes(next.window))
    next.window = 'any';
  return next;
};

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
  note: '',
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
    if (!['today', 'tomorrow', 'date', 'flexible'].includes(draft.day)) {
      draft.day = 'tomorrow';
    }
    // A draft saved before requests: the picked slot is a direct request
    if (draft.slot && !draft.dispatch) {
      draft.dispatch = 'direct';
      draft.startTime = draft.slot.start_time;
    }
    if (typeof draft.note !== 'string') draft.note = '';
    // A date or time of day already in the past is no use any more
    return freshWhen(draft);
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

/**
 * The start times a request can ask for on one local day, in 30-minute
 * steps inside the time window, at least MIN_LEAD_HOURS from now
 */
export const startTimesOn = (
  yyyymmdd: string,
  window: { start: number; end: number },
  now = new Date(),
): string[] => {
  const earliest = now.getTime() + MIN_LEAD_HOURS * 3600 * 1000;
  const times: string[] = [];
  for (
    let minutes = window.start * 60;
    minutes + STEP_MINUTES <= window.end * 60;
    minutes += STEP_MINUTES
  ) {
    const date = new Date(`${yyyymmdd}T00:00:00`);
    date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
    if (date.getTime() >= earliest) times.push(date.toISOString());
  }
  return times;
};

/** The local days a request can ask for: the search's range, up to MAX_DAYS */
export const daysBetween = (from: string, to: string): string[] => {
  const last =
    to < addDays(today(), MAX_DAYS) ? to : addDays(today(), MAX_DAYS);
  const days: string[] = [];
  for (let day = from; day <= last; day = addDays(day, 1)) days.push(day);
  return days;
};
