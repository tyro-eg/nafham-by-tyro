import { useQuery } from '@tanstack/react-query';
import { get } from '../assets/utils/api';
import { queryKeys } from '../lib/queryKeys';
import type { ScheduleDay, ScheduleWindow } from '../lib/weekly-schedule';
import type { RenewalOption } from './usePayments';

/**
 * The buy wizard's two reads: the tutors a child can take a course with
 * (ranked, priced for the size being considered, with why one cannot be
 * bought when they cannot) and the sizes for one tutor or for a tutor
 * Nafham will match. Both are answered for the payer, who names the child.
 */
export type PurchaseOption = RenewalOption;

export interface ExamBoardOption {
  id: number;
  name: string;
}

export interface PurchaseCourse {
  id: number;
  name: string;
  has_levels: boolean;
  /** A plain course with levels must name its level before it can be bought */
  level_required: boolean;
  board_required: boolean;
  exam_boards: ExamBoardOption[];
  exam_board_id: number | null;
}

export interface PurchaseTutor {
  id: number;
  first_name: string;
  last_name: string;
  avatar: string | null;
  bio: string | null;
  video_url: string | null;
  recommended: boolean;
  ops_rating: number | null;
  exam_boards: ExamBoardOption[];
  /** Open slots inside the weekly times over the next two weeks; null without a schedule */
  overlap: number | null;
  trialed: boolean;
  trial_on: string | null;
  trial_status: string | null;
  purchasable: boolean;
  reasons: string[];
  /** The child already learns this course with this tutor: renew that package */
  renew_instead_package_id: number | null;
  /** The child learns this course with another tutor: that package */
  already_learning_package_id: number | null;
  /** The price of the size being considered, when the tutor can be bought */
  price: PurchaseOption | null;
}

export interface MatchOffer {
  purchasable: boolean;
  reasons: string[];
  already_learning_package_id: number | null;
  options: PurchaseOption[];
}

export interface PurchaseTutorsResult {
  student: { id: number; first_name: string };
  course: PurchaseCourse;
  currency: string;
  payer_country: string | null;
  vat_applies: boolean;
  tutors: PurchaseTutor[];
  match: MatchOffer;
}

export interface PurchaseQuote {
  student: { id: number; first_name: string };
  course: PurchaseCourse;
  tutor: {
    id: number;
    first_name: string;
    last_name: string;
    avatar: string | null;
    recommended: boolean;
  } | null;
  match: boolean;
  purchasable: boolean;
  reasons: string[];
  renew_instead_package_id: number | null;
  already_learning_package_id: number | null;
  currency: string;
  payer_country: string | null;
  vat_applies: boolean;
  vat_rate_percent: number;
  options: PurchaseOption[];
}

export interface TutorSearch {
  student_id: number;
  grade_subject_id: number;
  exam_board_id?: number;
  hours?: number;
  days: ScheduleDay[];
  windows: ScheduleWindow[];
  lessons_per_week?: number;
  time_zone: string;
}

export interface OptionsParams {
  student_id: number;
  grade_subject_id: number;
  tutor_id?: number;
  match?: boolean;
  exam_board_id?: number;
}

/** The tutors for a course, best first, with the price for `hours` */
export function usePurchaseTutors(search: TutorSearch | null) {
  return useQuery({
    queryKey: queryKeys.purchases.tutors(search),
    queryFn: async () =>
      (
        await get('/purchases/tutors', {
          params: { ...search, match: undefined },
        })
      ).data.data as PurchaseTutorsResult,
    enabled: !!search,
    staleTime: 60 * 1000,
  });
}

/** The sizes and prices for a tutor, or for a tutor Nafham will match */
export function usePurchaseOptions(params: OptionsParams | null) {
  return useQuery({
    queryKey: queryKeys.purchases.options(params),
    queryFn: async () =>
      (
        await get('/purchases/options', {
          params: { ...params, match: params?.match ? 1 : undefined },
        })
      ).data.data as PurchaseQuote,
    enabled: !!params,
    staleTime: 60 * 1000,
  });
}

/** A free trial the payer can carry on from: the tutor, course and the link */
export interface TrialFollowUp {
  session_id: number;
  student_id: number;
  student_first_name: string;
  tutor_id: number;
  tutor_name: string;
  tutor_first_name: string;
  tutor_avatar: string | null;
  grade_subject_id: number;
  course_name: string;
  exam_board_id: number | null;
  trial_on: string;
  /** `/buy?child=&course=&tutor=&board=`, the wizard opened on that tutor */
  buy_path: string;
}

/** Completed trials of the last weeks with a tutor the student has no package with */
export function useTrialFollowUps(enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.purchases.all, 'follow-ups'] as const,
    queryFn: async () =>
      (await get('/purchases/follow_ups')).data.data as TrialFollowUp[],
    enabled,
    staleTime: 60 * 1000,
  });
}
