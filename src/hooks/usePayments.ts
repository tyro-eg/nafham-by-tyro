import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { get, patch, post } from '../assets/utils/api';
import { queryKeys } from '../lib/queryKeys';

/**
 * Online renewals: the sizes a package can be renewed at, a payment that
 * sends the payer to Nomod's hosted checkout, and the payment polled from
 * the return page until the webhook has done its work. Hooks stay silent;
 * components surface errors.
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
}

/** The same package again at the price paid before, when the margin still allows it */
export interface SameAgainOffer {
  hours: number;
  price: number;
  vat: number;
  total: number;
  basis: 'original';
}

/** A line of a checkout: a size at today's list price, or the same deal again */
export interface CheckoutLine {
  package_id: number;
  hours?: number;
  basis?: 'original' | 'list';
}

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

export interface PaymentLine {
  id: number;
  student_id: number;
  student_first_name: string;
  course_name: string;
  tutor_name: string;
  hours: number;
  price: number;
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

/** Starts a checkout: the answer carries the Nomod URL to send the payer to */
export function useStartCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (lines: CheckoutLine[]) =>
      (await post('/payments', { lines, client: 'web' })).data.data as Payment,
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

/** `errors[]` from the API, else the fallback */
export const paymentErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  const data = (error as { response?: { data?: unknown } })?.response?.data;
  if (data && typeof data === 'object') {
    const errors = (data as { errors?: unknown }).errors;
    if (Array.isArray(errors) && errors.length) return errors.join(', ');
  }
  return fallback;
};

/** The HTTP status of a failed request, when there is one */
export const errorStatus = (error: unknown): number | undefined =>
  (error as { response?: { status?: number } })?.response?.status;
