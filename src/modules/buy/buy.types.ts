import type { CheckoutLine } from '../../hooks/usePayments';
import {
  emptySchedule,
  scheduleIsEmpty,
  type WeeklySchedule,
} from '../../lib/weekly-schedule';

/** The wizard's steps, in order; a parent first says which child it is for */
export const STEPS = [
  'who',
  'what',
  'when',
  'tutors',
  'hours',
  'basket',
] as const;
export type Step = (typeof STEPS)[number];
export const stepsFor = (parent: boolean): readonly Step[] =>
  parent ? STEPS : STEPS.filter((step) => step !== 'who');

/** Who teaches: a tutor the parent picked, a tutor Nafham will match, or
 * the package the child already has with that tutor, renewed instead */
export type TutorChoice =
  | { kind: 'tutor'; tutorId: number; tutorName: string }
  | { kind: 'match' }
  | { kind: 'renewal'; packageId: number; tutorName: string };

/** One line of the basket, priced when it was added; the server prices it
 * again at checkout and refuses when the total moved */
export interface BasketLine {
  key: string;
  studentId: number;
  studentName: string;
  courseId: number;
  courseName: string;
  examBoardId?: number;
  examBoardName?: string;
  choice: TutorChoice;
  hours: number;
  price: number;
  vat: number;
  floorPrice: number;
  schedule: WeeklySchedule;
}

/** Everything the payer has picked so far */
export interface BuyDraft {
  step: Step;
  childId?: number;
  courseId?: number;
  examBoardId?: number;
  schedule: WeeklySchedule;
  choice?: TutorChoice;
  hours?: number;
  basket: BasketLine[];
  /** The currency and VAT rule of the lines in the basket, from their quotes */
  pricing?: { currency: string; vatApplies: boolean; vatRatePercent: number };
  /** The payment this basket was sent to pay; the basket stays until it is paid */
  checkoutSlug?: string;
}

export const MAX_LINES = 12;

const DRAFT_KEY = 'tyro.buyDraft';

export const emptyDraft = (): BuyDraft => ({
  step: 'what',
  schedule: emptySchedule(),
  basket: [],
});

/** A draft older than this starts again: its prices and offers have moved */
export const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** What is stored: the draft and when it was last saved */
type StoredDraft = Partial<BuyDraft> & { savedAt?: number };

/**
 * The draft survives a reload, a new tab, a few days away and the trip to
 * Nomod's page, per payer. It is only emptied once its payment went
 * through (settleCheckout), so a cancelled or declined payment comes back
 * to the same basket.
 */
export const loadDraft = (
  userId: number,
  now: number = Date.now(),
): BuyDraft => {
  try {
    const raw = localStorage.getItem(`${DRAFT_KEY}.${userId}`);
    if (!raw) return emptyDraft();
    const { savedAt, ...saved } = JSON.parse(raw) as StoredDraft;
    if (typeof savedAt !== 'number' || now - savedAt > DRAFT_TTL_MS) {
      return emptyDraft();
    }
    const draft = { ...emptyDraft(), ...saved };
    if (!STEPS.includes(draft.step)) draft.step = 'what';
    if (!Array.isArray(draft.basket)) draft.basket = [];
    return draft;
  } catch {
    return emptyDraft();
  }
};

export const saveDraft = (
  userId: number,
  draft: BuyDraft,
  now: number = Date.now(),
) => {
  try {
    const stored: StoredDraft = { ...draft, savedAt: now };
    localStorage.setItem(`${DRAFT_KEY}.${userId}`, JSON.stringify(stored));
  } catch {
    // Private mode or storage full: the wizard still works for this page
  }
};

export const clearDraft = (userId: number) => {
  try {
    localStorage.removeItem(`${DRAFT_KEY}.${userId}`);
  } catch {
    // Nothing to clear
  }
};

/** Payment statuses where the money was taken: the basket is bought */
const MONEY_TAKEN = [
  'paid',
  'fulfilled',
  'needs_review',
  'refunded',
  'partially_refunded',
  'disputed',
];
/** Still on Nomod's page (or abandoned there): nothing decided yet */
const STILL_OPEN = ['created', 'pending'];

/**
 * The draft once its checkout has this status: emptied when the money was
 * taken, kept (without the finished checkout) when the payment failed, was
 * cancelled or ran out, and untouched while it is still open.
 */
export const draftAfterCheckout = (
  draft: BuyDraft,
  status: string,
): BuyDraft => {
  if (MONEY_TAKEN.includes(status)) return emptyDraft();
  if (STILL_OPEN.includes(status)) return draft;
  const { checkoutSlug: _done, ...rest } = draft;
  return rest;
};

/**
 * The same, for a draft open in the wizard: a paid basket is emptied, but
 * the child and course being picked right now (from a link, say) are kept,
 * and someone who was looking at that basket goes back to the first step.
 */
export const openDraftAfterCheckout = (
  draft: BuyDraft,
  status: string,
  parent: boolean,
): BuyDraft => {
  if (!MONEY_TAKEN.includes(status)) return draftAfterCheckout(draft, status);
  const { checkoutSlug: _done, pricing: _old, ...rest } = draft;
  const first: Step = parent ? 'who' : 'what';
  return {
    ...rest,
    basket: [],
    step: draft.step === 'basket' ? first : draft.step,
  };
};

/**
 * The payment page reports how a checkout ended. Only the draft that was
 * sent to that very payment is touched: paying a renewal leaves a basket
 * of new courses alone.
 */
export const settleCheckout = (
  userId: number,
  slug: string,
  status: string,
) => {
  const draft = loadDraft(userId);
  if (draft.checkoutSlug !== slug) return;
  const next = draftAfterCheckout(draft, status);
  if (next === draft) return;
  if (next.basket.length === 0 && !next.checkoutSlug && next.step === 'what') {
    clearDraft(userId);
  } else {
    saveDraft(userId, next);
  }
};

/** The line as the checkout wants it */
export const toCheckoutLine = (line: BasketLine): CheckoutLine => {
  const { choice } = line;
  if (choice.kind === 'renewal') {
    return { package_id: choice.packageId, hours: line.hours, basis: 'list' };
  }
  const schedule = scheduleIsEmpty(line.schedule) ? undefined : line.schedule;
  if (choice.kind === 'match') {
    return {
      student_id: line.studentId,
      grade_subject_id: line.courseId,
      match: true,
      hours: line.hours,
      exam_board_id: line.examBoardId,
      schedule: line.schedule,
    };
  }
  return {
    student_id: line.studentId,
    grade_subject_id: line.courseId,
    tutor_id: choice.tutorId,
    hours: line.hours,
    exam_board_id: line.examBoardId,
    ...(schedule ? { schedule } : {}),
  };
};

const toCents = (amount: number) => Math.round(amount * 100);

/** The footer's arithmetic, the way the server does it: the family
 * discount on every line when there are enough, capped at each line's
 * floor, then VAT on the discounted subtotal */
export const basketTotals = (
  lines: BasketLine[],
  bundle: { minSubjects: number; discountPercent: number },
  vatApplies: boolean,
  vatRatePercent: number,
) => {
  const discounting = lines.length >= bundle.minSubjects;
  const rate = bundle.discountPercent / 100;
  let subtotal = 0;
  let discount = 0;
  const perLine = lines.map((line) => {
    const price = toCents(line.price);
    const floor = toCents(line.floorPrice);
    const share = Math.floor(price * rate);
    const room = Math.max(price - floor, 0);
    const off = discounting ? Math.min(share, room) : 0;
    subtotal += price - off;
    discount += off;
    return { key: line.key, price: price - off, discount: off };
  });
  const vat = vatApplies ? Math.round((subtotal * vatRatePercent) / 100) : 0;
  return {
    discounting,
    perLine,
    subtotalCents: subtotal,
    discountCents: discount,
    vatCents: vat,
    totalCents: subtotal + vat,
  };
};

/** The size tutors are ranked and quoted at before the payer picks one */
export const DEFAULT_HOURS = 8;

/** Grade and subject of a course name ("IGCSE - Year 10 - Mathematics (Edexcel)"),
 * so a level or board variant counts as the same course, as the server does */
export const courseKey = (name: string) => {
  const parts = name.split(' - ');
  const subject = (parts[2] ?? '').replace(/\s*\(.*\)\s*$/, '').trim();
  return `${(parts[1] ?? '').trim()}|${subject}`.toLowerCase();
};

/** The saved draft, with what a deep link (`?child=&course=&board=&tutor=&hours=`) asks for */
export const draftFrom = (
  saved: BuyDraft,
  parent: boolean,
  params: URLSearchParams,
): { draft: BuyDraft; preferredTutorId?: number } => {
  const draft = { ...saved };
  const child = Number(params.get('child'));
  const course = Number(params.get('course'));
  const board = Number(params.get('board'));
  const tutor = Number(params.get('tutor'));
  const hours = Number(params.get('hours'));
  if (child > 0 && child !== draft.childId) {
    // Another child than the saved draft's: their course is picked afresh
    draft.childId = child;
    draft.courseId = undefined;
    draft.examBoardId = undefined;
    draft.choice = undefined;
    draft.step = 'what';
  }
  if (course > 0) {
    draft.courseId = course;
    draft.examBoardId = board > 0 ? board : undefined;
    draft.choice = undefined;
    draft.step = tutor > 0 ? 'tutors' : 'when';
  }
  if (hours > 0) draft.hours = hours;
  if (parent && draft.childId === undefined) draft.step = 'who';
  if (!parent && draft.step === 'who') draft.step = 'what';
  if (draft.basket.length > 0 && !course && !child) draft.step = 'basket';
  return { draft, preferredTutorId: tutor > 0 ? tutor : undefined };
};
