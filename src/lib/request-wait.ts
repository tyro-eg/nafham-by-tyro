/**
 * Who a request is waiting for, and where it sits on the Requests page
 * (24 Nov 2026): every card says "Waiting for: you / Karim / a tutor / the
 * Nafham office", until when, and what happens with no answer. Pure, so the
 * three tabs and the line are the same for families and tutors.
 */

/** The three tabs: needs you, waiting on others, finished */
export type RequestView = 'inbox' | 'sent' | 'history';

export type WaitWho = 'you' | 'other' | 'tutor' | 'office';
/** What happens with no answer, by kind of request (a translation key) */
export type WaitNote =
  | 'MOVE'
  | 'WEEKLY'
  | 'OFFER'
  | 'TRIAL'
  | 'TRIAL_UNMATCHED'
  | 'OFFICE';

export interface WaitInfo {
  who: WaitWho;
  /** The answer is due by then (ISO time), when there is a limit */
  until: string | null;
  note: WaitNote;
}

/** A proposal between a family and a tutor: one of them answers */
interface Answerable {
  status: string;
  can_answer: boolean;
  expires_at?: string | null;
}

/** Needs you while you can answer; waiting while pending; else finished */
export const viewOfProposal = (request: Answerable): RequestView =>
  request.status !== 'pending'
    ? 'history'
    : request.can_answer
      ? 'inbox'
      : 'sent';

export const proposalWait = (
  request: Answerable,
  note: 'MOVE' | 'WEEKLY',
): WaitInfo => ({
  who: request.can_answer ? 'you' : 'other',
  until: request.expires_at ?? null,
  note,
});

/** A free-trial request as the tutor asked sees it: theirs to answer */
export const offerWait = (offer: { expires_at?: string | null }): WaitInfo => ({
  who: 'you',
  until: offer.expires_at ?? null,
  note: 'OFFER',
});

/** A family's free-trial request */
interface FamilyTrial {
  status: string;
  actionable: boolean;
  pending_until?: string | null;
}

/**
 * Waiting for a tutor while pending. When nobody could take it the family
 * picks another time or cancels, so it needs them. Booked or cancelled is
 * finished.
 */
export const viewOfTrialRequest = (request: FamilyTrial): RequestView =>
  request.status === 'pending'
    ? 'sent'
    : request.status === 'unmatched' && request.actionable
      ? 'inbox'
      : 'history';

export const trialRequestWait = (request: FamilyTrial): WaitInfo =>
  request.status === 'pending'
    ? { who: 'tutor', until: request.pending_until ?? null, note: 'TRIAL' }
    : { who: 'you', until: null, note: 'TRIAL_UNMATCHED' };

/** A request to the Nafham office (schedule, more hours, cancel or move) */
export const viewOfOfficeRequest = (request: {
  status: string;
}): RequestView => (request.status === 'pending' ? 'sent' : 'history');

export const OFFICE_WAIT: WaitInfo = {
  who: 'office',
  until: null,
  note: 'OFFICE',
};
