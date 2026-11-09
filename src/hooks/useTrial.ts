import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { get, patch, post } from '../assets/utils/api';
import type { FreeTrial, GradeSubject, Instructor } from '../assets/types';
import { queryKeys } from '../lib/queryKeys';
import { ALL_CHILDREN } from '../lib/family-child';

/**
 * The free-trial wizard reads public endpoints, so a visitor can plan their
 * trial before creating an account: the courses open for trials, the tutors
 * who can give one in the student's dates and time window, and who a
 * request at one time would reach. A trial is a request the instructor
 * confirms (POST /trial_requests); tutors answer theirs at /trial_offers.
 */

export interface TrialSlot {
  id: number;
  start_time: string;
  end_time: string;
}

export interface ExamBoardOption {
  id: number;
  name: string;
}

/** A course open for trials, with the exam boards its tutors teach it for */
export type TrialCourse = GradeSubject & { exam_boards: ExamBoardOption[] };

export interface TrialTutor {
  id: number;
  first_name: string;
  last_name: string;
  avatar?: string | null;
  bio?: string | null;
  video_url?: string | null;
  recommended: boolean;
  /** The exam boards this tutor teaches the course for */
  exam_boards: ExamBoardOption[];
  /** Ops' rating of the tutor for this course, 1 to 5, null when unrated */
  ops_rating: number | null;
  /** Takes requests outside their published times */
  wants_students: boolean;
  /** Open slots a whole trial can start on, soonest first; may be empty for a tutor who wants students */
  slots: TrialSlot[];
}

/** A tutor a "best match" or "fastest" request at one time would reach */
export interface TrialCandidate {
  id: number;
  first_name: string;
  last_name: string;
  avatar?: string | null;
  recommended: boolean;
  wants_students: boolean;
  ops_rating: number | null;
  on_calendar: boolean;
  exam_boards: ExamBoardOption[];
}

export interface TrialCandidates {
  /** Tutors whose open slots cover the whole trial */
  on_calendar: TrialCandidate[];
  /** Tutors who take requests outside their calendar */
  off_calendar: TrialCandidate[];
  /** How many tutors a "fastest" request asks at once */
  max_broadcast: number;
}

export interface TrialCandidatesSearch {
  grade_subject_id: number;
  start_time: string;
  exam_board_id?: number;
}

/** How a request finds its instructor */
export type TrialDispatch = 'direct' | 'best_match' | 'fastest';

export type TrialRequestStatus =
  | 'pending'
  | 'booked'
  | 'unmatched'
  | 'cancelled';

export interface TrialRequestPerson {
  id: number;
  first_name: string;
  last_name: string;
  avatar?: string | null;
}

/** A trial request as the family sees it (TrialRequestBlueprint) */
export interface TrialRequest {
  id: number;
  slug: string;
  dispatch: TrialDispatch;
  status: TrialRequestStatus;
  start_time: string;
  end_time: string;
  time_zone?: string | null;
  note?: string | null;
  unmatched_reason?: 'no_candidates' | 'all_declined' | 'timed_out' | null;
  created_at: string;
  exam_board?: ExamBoardOption | null;
  /** How many instructors have been asked so far */
  offers_count: number;
  /** When the family hears back at the latest, while pending */
  pending_until?: string | null;
  /** Pending or unmatched: the family can still cancel it */
  actionable: boolean;
  student?: TrialRequestPerson | null;
  /** The tutor the family picked, or the one who accepted */
  tutor?: TrialRequestPerson | null;
  grade_subject?: { id: number; full_course_name: string } | null;
  session?: { id: number } | null;
}

export interface TrialRequestData {
  grade_subject_id: number;
  exam_board_id?: number;
  start_time: string;
  time_zone: string;
  dispatch: TrialDispatch;
  /** Only for a direct request */
  tutor_id?: number;
  note?: string;
  guardian_phone?: string;
}

export type TrialOfferStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'expired'
  | 'taken'
  | 'withdrawn';

/** A trial request as the tutor asked sees it (TrialOfferBlueprint) */
export interface TrialOffer {
  id: number;
  status: TrialOfferStatus;
  /** The time was on the tutor's open slots when the request was sent */
  on_calendar: boolean;
  expires_at: string;
  responded_at?: string | null;
  /** The tutor's decline reason, or why an acceptance failed */
  reason?: string | null;
  created_at: string;
  start_time: string;
  end_time: string;
  time_zone?: string | null;
  note?: string | null;
  dispatch: TrialDispatch;
  request_status: TrialRequestStatus;
  student: { id: number; first_name: string };
  grade_subject: { id: number; full_course_name: string };
  exam_board?: ExamBoardOption | null;
  /** Set once this tutor accepted */
  session_id?: number | null;
}

export type TrialOfferTab = 'pending' | 'answered';

export interface TrialSearch {
  grade_subject_id: number;
  from: string;
  to: string;
  start_hour: number;
  end_hour: number;
  time_zone: string;
  /** Required by the backend once the course's tutors declare boards */
  exam_board_id?: number;
}

export const trialKeys = {
  all: ['trial'] as const,
  courses: () => [...trialKeys.all, 'courses'] as const,
  tutors: (search: TrialSearch | null) =>
    [...trialKeys.all, 'tutors', search] as const,
  eligibility: (gradeSubjectId?: number) =>
    [...trialKeys.all, 'eligibility', gradeSubjectId] as const,
  candidates: (search: TrialCandidatesSearch | null) =>
    [...trialKeys.all, 'candidates', search] as const,
  requests: (allChildren: boolean) =>
    [...trialKeys.all, 'requests', { allChildren }] as const,
  offers: (tab: TrialOfferTab) => [...trialKeys.all, 'offers', tab] as const,
};

/** Courses at least one active tutor teaches, with curriculum, stage, subject and variants */
export function useTrialCourses() {
  return useQuery({
    queryKey: trialKeys.courses(),
    queryFn: async () => {
      const response = await get('/public/courses');
      return (response.data.data || []) as TrialCourse[];
    },
    staleTime: 30 * 60 * 1000,
  });
}

/** Tutors for the course with the slots a trial can start on, best first */
export function useTrialTutors(search: TrialSearch | null) {
  return useQuery({
    queryKey: trialKeys.tutors(search),
    queryFn: async () => {
      const response = await get('/public/trial_tutors', {
        params: search ?? {},
      });
      return (response.data.data || []) as TrialTutor[];
    },
    enabled: !!search,
    staleTime: 60 * 1000,
  });
}

/**
 * For a signed-in student: which tutors still offer them a free trial
 * (one trial per tutor, none with a tutor they already learn with).
 */
export function useTrialEligibility(
  gradeSubjectId: number | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: trialKeys.eligibility(gradeSubjectId),
    queryFn: async () => {
      const response = await get('/tutors', {
        params: { grade_subject_id: gradeSubjectId, per_page: 100, page: 1 },
      });
      const map: Record<number, FreeTrial | undefined> = {};
      ((response.data.data || []) as Instructor[]).forEach((tutor) => {
        map[tutor.id] = tutor.free_trial;
      });
      return map;
    },
    enabled: enabled && !!gradeSubjectId,
    staleTime: 60 * 1000,
  });
}

/**
 * Who a "best match" or "fastest" request at that time would reach: the
 * instructors free then and those who take requests regardless
 */
export function useTrialCandidates(search: TrialCandidatesSearch | null) {
  return useQuery({
    queryKey: trialKeys.candidates(search),
    queryFn: async () => {
      const response = await get('/public/trial_candidates', {
        params: search ?? {},
      });
      return response.data.data as TrialCandidates;
    },
    enabled: !!search,
    staleTime: 60 * 1000,
  });
}

/**
 * Ask for a free trial. The request becomes a session once an instructor
 * accepts; the caller shows the backend's reasons when it is refused
 * (bookingErrorMessage).
 */
export function useCreateTrialRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      childId,
      ...data
    }: TrialRequestData & { childId?: number }) => {
      // A parent asks for the child picked in the wizard, whatever the
      // child switcher shows
      const config = childId
        ? { headers: { 'X-Child-Id': String(childId) } }
        : {};
      const response = await post(
        '/trial_requests',
        { trial_request: data },
        config,
      );
      return response.data.data as TrialRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...trialKeys.all, 'requests'],
      });
    },
    // The caller shows the backend's reason inline
    onError: () => undefined,
  });
}

/**
 * Lists that change while the user waits: fresh for half a minute, polled
 * only while something is still pending (an answer, an offer)
 */
const liveList = <T>(pending: (rows: T[]) => boolean) => ({
  staleTime: 30 * 1000,
  refetchInterval: (query: { state: { data?: T[] } }) =>
    query.state.data && pending(query.state.data) ? 60 * 1000 : false,
  refetchIntervalInBackground: false,
});

/** A parent's whole family at once, whatever child is picked */
const allChildrenConfig = (allChildren: boolean) =>
  allChildren ? { headers: { 'X-Child-Id': ALL_CHILDREN } } : {};

/**
 * The family's trial requests, newest first. `allChildren` reads every
 * child of a parent (the family home); otherwise the picked child's.
 */
export function useTrialRequests(
  { allChildren = false, enabled = true } = {} as {
    allChildren?: boolean;
    enabled?: boolean;
  },
) {
  return useQuery({
    queryKey: trialKeys.requests(allChildren),
    queryFn: async () => {
      const response = await get('/trial_requests', {
        params: { per_page: 20, page: 1 },
        config: allChildrenConfig(allChildren),
      });
      return (response.data.data || []) as TrialRequest[];
    },
    enabled,
    ...liveList<TrialRequest>((rows) =>
      rows.some((r) => r.status === 'pending'),
    ),
  });
}

/** Cancel a pending or unmatched request, as the student it is for */
export function useCancelTrialRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: TrialRequest) => {
      // A parent cancels as the child the request is for
      const config = request.student
        ? { headers: { 'X-Child-Id': String(request.student.id) } }
        : {};
      const response = await patch(
        `/trial_requests/${request.id}/cancel`,
        {},
        config,
      );
      return response.data.data as TrialRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...trialKeys.all, 'requests'],
      });
    },
    // The caller shows the backend's reason inline
    onError: () => undefined,
  });
}

/** A tutor's trial requests: waiting for an answer, or answered */
export function useTrialOffers(tab: TrialOfferTab, enabled = true) {
  return useQuery({
    queryKey: trialKeys.offers(tab),
    queryFn: async () => {
      const response = await get('/trial_offers', {
        params: { status: tab, per_page: 50, page: 1 },
      });
      return (response.data.data || []) as TrialOffer[];
    },
    enabled,
    // A new offer also arrives as a support chat message, so polling only
    // keeps an open inbox current
    ...liveList<TrialOffer>((rows) => tab === 'pending' && rows.length > 0),
  });
}

const useOfferAnswer = (
  answer: (offer: TrialOffer, reason?: string) => Promise<TrialOffer>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ offer, reason }: { offer: TrialOffer; reason?: string }) =>
      answer(offer, reason),
    onSettled: () => {
      // A failed acceptance also moves the offer to answered
      queryClient.invalidateQueries({ queryKey: [...trialKeys.all, 'offers'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.all });
    },
    // The card shows the backend's reason inline
    onError: () => undefined,
  });
};

/** Accept a trial request: it becomes a session on the tutor's calendar */
export function useAcceptTrialOffer() {
  return useOfferAnswer(async (offer) => {
    const response = await patch(`/trial_offers/${offer.id}/accept`, {});
    return response.data.data as TrialOffer;
  });
}

/** Decline a trial request, optionally saying why */
export function useDeclineTrialOffer() {
  return useOfferAnswer(async (offer, reason) => {
    const response = await patch(`/trial_offers/${offer.id}/decline`, {
      reason: reason?.trim() || undefined,
    });
    return response.data.data as TrialOffer;
  });
}
