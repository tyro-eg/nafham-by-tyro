import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { get, patch, post } from '../assets/utils/api';
import { queryKeys } from '../lib/queryKeys';
import type { WeeklySchedule } from '../lib/weekly-schedule';

/**
 * Online payments: the sizes a package can be renewed at, a payment that
 * sends the payer to Nomod's hosted checkout (for renewals, new courses and
 * tutors Nafham will match), and the payment polled from the return page
 * until the webhook has done its work. Hooks stay silent; components
 * surface errors.
 */
export interface RenewalOption {
  hours: number;
  list_price: number;
  price: number;
  vat: number;
  total: number;
  basis: 'offer' | 'list' | 'pro_rata';
  offer_until: string | null;
  saving: number;
  same_as_current: boolean;
  /** The lowest this size may go with a bundle discount (the margin floor) */
  floor_price: number;
}

/** The same package again at the price paid before, when the margin still allows it */
export interface SameAgainOffer {
  hours: number;
  price: number;
  vat: number;
  total: number;
  basis: 'original';
  floor_price: number;
}

/** A renewal: a size at today's list price, or the same deal again */
export interface RenewalCheckoutLine {
  package_id: number;
  hours?: number;
  basis?: 'original' | 'list';
}

/** A new course for a child (or the adult payer) with a chosen tutor */
export interface NewCourseCheckoutLine {
  student_id: number;
  grade_subject_id: number;
  tutor_id: number;
  hours: number;
  exam_board_id?: number;
  schedule?: WeeklySchedule;
}

/** A new course with no tutor yet: ops match one that fits the weekly times */
export interface MatchCheckoutLine {
  student_id: number;
  grade_subject_id: number;
  match: true;
  hours: number;
  exam_board_id?: number;
  schedule: WeeklySchedule;
}

export type CheckoutLine =
  | RenewalCheckoutLine
  | NewCourseCheckoutLine
  | MatchCheckoutLine;

export interface RenewalQuote {
  package: {
    id: number;
    slug: string;
    course_name: string;
    tutor_name: string;
    student_id: number;
    student_first_name: string;
    original_hours: number;
    remaining_hours: number;
    low_on_hours: boolean;
    current_size: number;
  };
  renewable: boolean;
  reasons: string[];
  renew_instead_package_id: number | null;
  currency: string;
  payer_country: string | null;
  vat_applies: boolean;
  vat_rate_percent: number;
  same_again: SameAgainOffer | null;
  same_again_reason: string | null;
  options: RenewalOption[];
}

/** One row of the renew-all sheet: a running package with its quote */
export interface RenewalRow extends RenewalQuote {
  due: boolean;
  scheduled_hours: number;
  last_session_on: string | null;
}

export interface FamilyRenewalQuote {
  currency: string;
  payer_country: string | null;
  vat_applies: boolean;
  vat_rate_percent: number;
  bundle: { min_subjects: number; discount_percent: number };
  max_lines: number;
  children: { id: number; first_name: string; rows: RenewalRow[] }[];
  running_count: number;
  due_count: number;
}

/** What a paid line is for the payer */
export type PaymentLineKind =
  | 'new_package'
  | 'top_up'
  | 'match_pending'
  | 'match_done'
  | 'refunded';

export interface PaymentLine {
  id: number;
  student_id: number;
  student_first_name: string;
  course_name: string;
  tutor_name: string | null;
  hours: number;
  price: number;
  kind: PaymentLineKind;
  package_id: number | null;
}

export type PaymentStatus =
  | 'created'
  | 'pending'
  | 'paid'
  | 'fulfilled'
  | 'needs_review'
  | 'failed'
  | 'cancelled'
  | 'expired'
  | 'refunded'
  | 'partially_refunded'
  | 'disputed';

export interface Payment {
  id: number;
  slug: string;
  status: PaymentStatus;
  origin: 'checkout' | 'link';
  client: string;
  currency: string;
  amount: number;
  subtotal: number;
  vat: number;
  vat_applies: boolean;
  final: boolean;
  open: boolean;
  checkout_url: string | null;
  expires_at: string;
  paid_at: string | null;
  fulfilled_at: string | null;
  failure_reason: string | null;
  created_at: string;
  lines: PaymentLine[];
}

/** The codes a checkout is refused with, when the client can act on them */
export type PaymentRefusalCode =
  | 'unavailable'
  | 'rate_limited'
  | 'not_found'
  | 'below_floor'
  | 'not_a_payer'
  | 'over_ceiling'
  | 'not_purchasable'
  | 'already_learning'
  | 'renew_instead'
  | 'terms_required'
  | 'country_required'
  | 'price_changed'
  | 'already_pending';

const POLL_MS = 2000;

/** The sizes and prices to renew this package at, as of now */
export function useRenewalOptions(packageId: number | null, enabled = true) {
  return useQuery({
    queryKey: queryKeys.payments.options(packageId ?? 0),
    queryFn: async () =>
      (await get(`/packages/${packageId}/renewal_options`)).data
        .data as RenewalQuote,
    enabled: enabled && !!packageId,
    staleTime: 60 * 1000,
  });
}

/** The renew-all sheet: every running package of the family, with quotes */
export function useFamilyRenewalOptions(enabled = true) {
  return useQuery({
    queryKey: queryKeys.payments.familyOptions(),
    queryFn: async () =>
      (await get('/payments/renewal_options')).data.data as FamilyRenewalQuote,
    enabled,
    staleTime: 60 * 1000,
  });
}

export interface StartCheckoutInput {
  lines: CheckoutLine[];
  bundle?: boolean;
  /** The total the UI showed, in cents; the server refuses when its own differs */
  expected_total_cents?: number;
  /** Only read when no country is on file for the payer */
  payer_country?: string;
}

/** Starts a checkout: the answer carries the Nomod URL to send the payer to */
export function useStartCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      lines,
      bundle = false,
      expected_total_cents,
      payer_country,
    }: StartCheckoutInput) =>
      (
        await post('/payments', {
          lines,
          client: 'web',
          bundle,
          expected_total_cents,
          payer_country,
        })
      ).data.data as Payment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
    },
    // The dialog shows the API's own message; keep the global toast quiet
    onError: () => undefined,
  });
}

/**
 * One payment, polled every couple of seconds until it is final. The
 * backend gives a quiet pending payment one look at Nomod per poll window,
 * so a late webhook is caught here too.
 */
export function usePayment(slug: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.payments.detail(slug ?? ''),
    queryFn: async () => (await get(`/payments/${slug}`)).data.data as Payment,
    enabled: enabled && !!slug,
    refetchInterval: (query) => (query.state.data?.final ? false : POLL_MS),
    refetchIntervalInBackground: true,
    retry: false,
  });
}

/** The payer's receipts, newest first */
export function usePayments(enabled = true) {
  return useQuery({
    queryKey: queryKeys.payments.list(),
    queryFn: async () =>
      (await get('/payments', { params: { per_page: 100 } })).data
        .data as Payment[],
    enabled,
    staleTime: 30 * 1000,
  });
}

/** Checkouts still waiting to be paid, for the "payment in progress" banner */
export function useOpenPayments(enabled = true) {
  return useQuery({
    queryKey: queryKeys.payments.open(),
    queryFn: async () =>
      (await get('/payments', { params: { open: 1, per_page: 5 } })).data
        .data as Payment[],
    enabled,
    staleTime: 15 * 1000,
  });
}

export function useCancelPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string) =>
      (await patch(`/payments/${slug}/cancel`, {})).data.data as Payment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
    },
    onError: () => undefined,
  });
}

const responseData = (error: unknown): Record<string, unknown> | null => {
  const data = (error as { response?: { data?: unknown } })?.response?.data;
  return data && typeof data === 'object'
    ? (data as Record<string, unknown>)
    : null;
};

/** `errors[]` from the API, else the fallback */
export const paymentErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  const errors = responseData(error)?.errors;
  if (Array.isArray(errors) && errors.length) return errors.join(', ');
  return fallback;
};

/** The refusal code the API named, when it named one */
export const paymentErrorCode = (
  error: unknown,
): PaymentRefusalCode | undefined => {
  const code = responseData(error)?.code;
  return typeof code === 'string' ? (code as PaymentRefusalCode) : undefined;
};

/** What the API sent along with a refusal: a fresh total, an open payment */
export const paymentErrorDetails = <T extends object>(
  error: unknown,
): T | undefined => {
  const details = responseData(error)?.details;
  return details && typeof details === 'object' ? (details as T) : undefined;
};

/** The HTTP status of a failed request, when there is one */
export const errorStatus = (error: unknown): number | undefined =>
  (error as { response?: { status?: number } })?.response?.status;
