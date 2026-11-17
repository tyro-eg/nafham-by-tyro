import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  basketTotals,
  clearDraft,
  courseKey,
  draftAfterCheckout,
  draftFrom,
  emptyDraft,
  loadDraft,
  saveDraft,
  settleCheckout,
  toCheckoutLine,
  type BasketLine,
  type BuyDraft,
} from './buy.types';
import { blockedStorage, memoryStorage } from '../../test/memory-storage';

const line = (overrides: Partial<BasketLine> = {}): BasketLine => ({
  key: overrides.key ?? 'k',
  studentId: 1,
  studentName: 'Omar',
  courseId: 10,
  courseName: 'IGCSE - Year 10 - Mathematics',
  choice: { kind: 'tutor', tutorId: 5, tutorName: 'Mona' },
  hours: 8,
  price: 880,
  vat: 0,
  floorPrice: 500,
  schedule: { days: [], windows: [], time_zone: 'Asia/Dubai' },
  ...overrides,
});

describe('courseKey', () => {
  it('ignores the curriculum, the level and the board, as the server does', () => {
    expect(courseKey('IGCSE - Year 10 - Mathematics')).toBe(
      courseKey('IGCSE A Level - Year 10 - Mathematics (Edexcel)'),
    );
    expect(courseKey('IGCSE - Year 10 - Mathematics')).not.toBe(
      courseKey('IGCSE - Year 11 - Mathematics'),
    );
    expect(courseKey('IGCSE - Year 10 - Physics')).not.toBe(
      courseKey('IGCSE - Year 10 - Mathematics'),
    );
  });
});

describe('basketTotals', () => {
  const bundle = { minSubjects: 4, discountPercent: 5 };

  it('adds VAT on the subtotal, rounded to the cent like the server', () => {
    const totals = basketTotals([line({ price: 1675 })], bundle, true, 5);
    expect(totals.subtotalCents).toBe(167_500);
    expect(totals.vatCents).toBe(8_375);
    expect(totals.totalCents).toBe(175_875);
    expect(totals.discounting).toBe(false);
  });

  it('discounts every line once there are enough subjects, never under its floor', () => {
    const lines = [
      line({ key: 'a' }),
      line({ key: 'b' }),
      line({ key: 'c' }),
      line({ key: 'd', price: 880, floorPrice: 870 }),
    ];
    const totals = basketTotals(lines, bundle, false, 5);
    expect(totals.discounting).toBe(true);
    // 5% of 880 is 44; the last line has only 10 of room above its floor
    expect(totals.perLine.map((p) => p.discount)).toEqual([
      4_400, 4_400, 4_400, 1_000,
    ]);
    expect(totals.discountCents).toBe(14_200);
    expect(totals.subtotalCents).toBe(4 * 88_000 - 14_200);
  });

  it('floors the share like the server does with cents', () => {
    const totals = basketTotals(
      Array.from({ length: 4 }, (_, i) =>
        line({ key: String(i), price: 10.1, floorPrice: 0 }),
      ),
      bundle,
      false,
      5,
    );
    // 5% of 1010 cents is 50.5, floored to 50
    expect(totals.perLine[0].discount).toBe(50);
  });
});

describe('toCheckoutLine', () => {
  it('sends a renewal by package, a tutor line with its schedule, a match with the times required', () => {
    expect(
      toCheckoutLine(
        line({ choice: { kind: 'renewal', packageId: 9, tutorName: 'Mona' } }),
      ),
    ).toEqual({ package_id: 9, hours: 8, basis: 'list' });

    const withTimes = line({
      schedule: {
        days: ['sun'],
        windows: ['evening'],
        time_zone: 'Asia/Dubai',
      },
      examBoardId: 2,
    });
    expect(toCheckoutLine(withTimes)).toEqual({
      student_id: 1,
      grade_subject_id: 10,
      tutor_id: 5,
      hours: 8,
      exam_board_id: 2,
      schedule: withTimes.schedule,
    });
    // An empty schedule is left out for a tutor line
    expect(toCheckoutLine(line())).not.toHaveProperty('schedule');

    const match = toCheckoutLine(line({ choice: { kind: 'match' } }));
    expect(match).toMatchObject({
      match: true,
      student_id: 1,
      grade_subject_id: 10,
    });
  });
});

describe('draftFrom', () => {
  const params = (query: string) => new URLSearchParams(query);

  it('starts a parent on the child step and an adult on the course step', () => {
    expect(draftFrom(emptyDraft(), true, params('')).draft.step).toBe('who');
    expect(draftFrom(emptyDraft(), false, params('')).draft.step).toBe('what');
  });

  it('opens a trial link on the tutor step with that tutor preferred', () => {
    const { draft, preferredTutorId } = draftFrom(
      emptyDraft(),
      true,
      params('child=7&course=10&tutor=5&board=2'),
    );
    expect(draft).toMatchObject({
      childId: 7,
      courseId: 10,
      examBoardId: 2,
      step: 'tutors',
    });
    expect(preferredTutorId).toBe(5);
  });

  it('picks a course afresh when the link names another child than the saved draft', () => {
    const saved = {
      ...emptyDraft(),
      childId: 1,
      courseId: 10,
      step: 'hours' as const,
    };
    const { draft } = draftFrom(saved, true, params('child=2'));
    expect(draft).toMatchObject({
      childId: 2,
      courseId: undefined,
      step: 'what',
    });
  });

  it('returns to the basket when it holds lines and nothing new is asked', () => {
    const saved = {
      ...emptyDraft(),
      childId: 1,
      basket: [line()],
      step: 'what' as const,
    };
    expect(draftFrom(saved, true, params('')).draft.step).toBe('basket');
  });
});

describe('the saved draft', () => {
  const DAY = 24 * 60 * 60 * 1000;
  beforeEach(() => vi.stubGlobal('localStorage', memoryStorage()));
  afterEach(() => vi.unstubAllGlobals());

  const basket = (): BuyDraft => ({
    ...emptyDraft(),
    step: 'basket',
    basket: [line()],
  });

  it('comes back in a new tab, per payer, for a week', () => {
    saveDraft(7, basket(), 0);
    expect(loadDraft(7, 6 * DAY).basket).toHaveLength(1);
    expect(loadDraft(7, 6 * DAY).step).toBe('basket');
    expect(loadDraft(8, 0).basket).toHaveLength(0);
    expect(loadDraft(7, 8 * DAY)).toEqual(emptyDraft());
  });

  it('starts again from a draft saved without a date, or unreadable', () => {
    localStorage.setItem('tyro.buyDraft.7', JSON.stringify(basket()));
    expect(loadDraft(7, 0)).toEqual(emptyDraft());
    localStorage.setItem('tyro.buyDraft.7', 'not json');
    expect(loadDraft(7, 0)).toEqual(emptyDraft());
  });

  it('works without storage', () => {
    vi.stubGlobal('localStorage', blockedStorage());
    expect(() => saveDraft(7, basket())).not.toThrow();
    expect(loadDraft(7)).toEqual(emptyDraft());
    expect(() => clearDraft(7)).not.toThrow();
  });
});

describe('draftAfterCheckout', () => {
  const sent = (): BuyDraft => ({
    ...emptyDraft(),
    step: 'basket',
    basket: [line()],
    checkoutSlug: 'pay1',
  });

  it('empties the basket once the money was taken', () => {
    for (const status of ['paid', 'fulfilled', 'needs_review', 'refunded']) {
      expect(draftAfterCheckout(sent(), status)).toEqual(emptyDraft());
    }
  });

  it('keeps the basket for another try when the payment did not go through', () => {
    for (const status of ['failed', 'cancelled', 'expired']) {
      const next = draftAfterCheckout(sent(), status);
      expect(next.basket).toHaveLength(1);
      expect(next.step).toBe('basket');
      expect(next.checkoutSlug).toBeUndefined();
    }
  });

  it('leaves a draft alone while its payment is still open', () => {
    const draft = sent();
    expect(draftAfterCheckout(draft, 'pending')).toBe(draft);
    expect(draftAfterCheckout(draft, 'created')).toBe(draft);
  });
});

describe('settleCheckout', () => {
  beforeEach(() => vi.stubGlobal('localStorage', memoryStorage()));
  afterEach(() => vi.unstubAllGlobals());

  const sent = (slug: string): BuyDraft => ({
    ...emptyDraft(),
    step: 'basket',
    basket: [line()],
    checkoutSlug: slug,
  });

  it('clears the basket that was paid', () => {
    saveDraft(7, sent('pay1'));
    settleCheckout(7, 'pay1', 'fulfilled');
    expect(loadDraft(7)).toEqual(emptyDraft());
    expect(localStorage.getItem('tyro.buyDraft.7')).toBeNull();
  });

  it('keeps the basket when the payment was cancelled', () => {
    saveDraft(7, sent('pay1'));
    settleCheckout(7, 'pay1', 'cancelled');
    const draft = loadDraft(7);
    expect(draft.basket).toHaveLength(1);
    expect(draft.checkoutSlug).toBeUndefined();
  });

  it('leaves a basket alone when another payment settles (a renewal)', () => {
    saveDraft(7, sent('pay1'));
    settleCheckout(7, 'renewal9', 'fulfilled');
    expect(loadDraft(7).basket).toHaveLength(1);
    expect(loadDraft(7).checkoutSlug).toBe('pay1');
  });
});
