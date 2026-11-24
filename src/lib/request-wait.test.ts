import { describe, expect, it } from 'vitest';
import {
  OFFICE_WAIT,
  offerWait,
  proposalWait,
  trialRequestWait,
  viewOfOfficeRequest,
  viewOfProposal,
  viewOfTrialRequest,
} from './request-wait';

const due = '2026-11-25T14:10:00Z';

describe('who a request is waiting for', () => {
  it('a proposal needs you while you can answer, else it waits on the other side', () => {
    const toMe = { status: 'pending', can_answer: true, expires_at: due };
    const fromMe = { status: 'pending', can_answer: false, expires_at: due };
    expect(viewOfProposal(toMe)).toBe('inbox');
    expect(viewOfProposal(fromMe)).toBe('sent');
    expect(proposalWait(toMe, 'MOVE')).toEqual({
      who: 'you',
      until: due,
      note: 'MOVE',
    });
    expect(proposalWait(fromMe, 'WEEKLY')).toEqual({
      who: 'other',
      until: due,
      note: 'WEEKLY',
    });
  });

  it('an answered, expired or withdrawn proposal is finished, whoever could answer', () => {
    for (const status of [
      'accepted',
      'approved',
      'declined',
      'expired',
      'withdrawn',
    ]) {
      expect(viewOfProposal({ status, can_answer: false })).toBe('history');
      expect(viewOfProposal({ status, can_answer: true })).toBe('history');
    }
  });

  it("a tutor's free-trial request is theirs to answer, with its deadline", () => {
    expect(offerWait({ expires_at: due })).toEqual({
      who: 'you',
      until: due,
      note: 'OFFER',
    });
    expect(offerWait({}).until).toBeNull();
  });

  it("a family's trial waits for a tutor; when nobody took it, it needs the family", () => {
    const pending = { status: 'pending', actionable: true, pending_until: due };
    const nobody = { status: 'unmatched', actionable: true };
    expect(viewOfTrialRequest(pending)).toBe('sent');
    expect(trialRequestWait(pending)).toEqual({
      who: 'tutor',
      until: due,
      note: 'TRIAL',
    });
    expect(viewOfTrialRequest(nobody)).toBe('inbox');
    expect(trialRequestWait(nobody)).toEqual({
      who: 'you',
      until: null,
      note: 'TRIAL_UNMATCHED',
    });
    expect(viewOfTrialRequest({ status: 'booked', actionable: false })).toBe(
      'history',
    );
    expect(viewOfTrialRequest({ status: 'cancelled', actionable: false })).toBe(
      'history',
    );
    // Unmatched and no longer the family's to act on: finished
    expect(viewOfTrialRequest({ status: 'unmatched', actionable: false })).toBe(
      'history',
    );
  });

  it('a request to the office waits for the office until it is handled or declined', () => {
    expect(viewOfOfficeRequest({ status: 'pending' })).toBe('sent');
    expect(viewOfOfficeRequest({ status: 'handled' })).toBe('history');
    expect(viewOfOfficeRequest({ status: 'declined' })).toBe('history');
    expect(OFFICE_WAIT).toEqual({ who: 'office', until: null, note: 'OFFICE' });
  });
});
