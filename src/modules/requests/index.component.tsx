import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import {
  Alert,
  Button,
  CircularProgress,
  Skeleton,
  TextField,
} from '@mui/material';
import {
  CheckRounded,
  CloseRounded,
  EventRepeatRounded,
  FormatQuoteRounded,
  SupportAgentRounded,
  UndoRounded,
} from '@mui/icons-material';

import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import { useRtlClass } from '../../assets/utils/utils';
import { useTrialOffers, useTrialRequests } from '../../hooks/useTrial';
import {
  useSessionRequests,
  type SessionRequest,
} from '../../hooks/useSessionRequests';
import { OfferCard } from '../trial-requests/index.component';
import { TrialRequestRow } from '../trial/trial-requests-card.component';
import {
  changeErrorMessage,
  remainingOptions,
  useAnswerMove,
  useRescheduleRequests,
  useWithdrawMove,
  type RescheduleRequest,
} from '../../hooks/useSessionChanges';
import {
  useAnswerScheduleChange,
  useScheduleChangeRequests,
  useWithdrawScheduleChange,
  weeklyPatternLabel,
  type ScheduleChangeRequest,
} from '../../hooks/useScheduleChanges';
import {
  OFFICE_WAIT,
  proposalWait,
  viewOfOfficeRequest,
  viewOfProposal,
  viewOfTrialRequest,
  type RequestView,
} from '../../lib/request-wait';
import { formatSlot, localTimeZone } from '../trial/trial.types';
import WaitLine from './wait-line.component';

import '../sessions/dashboard-shell.styles.scss';
import '../trial-requests/trial-requests.styles.scss';
import './requests.styles.scss';
import { courseLabel } from '../dashboard/dashboard.utils';

const VIEWS: RequestView[] = ['inbox', 'sent', 'history'];
const REASON_LENGTH = 500;

/**
 * Every request in one place, the same for a family and a tutor (24 Nov
 * 2026): proposals to move a session or change weekly times, free-trial
 * requests, and a family's requests to the Nafham office. Three tabs:
 * "Needs you", "Waiting on others", "Finished". Each open card says who it
 * is waiting for and is answered inside the card. Emails and chat notices
 * link here.
 */
const RequestsPage: FC = () => {
  const { t } = useTranslation();
  const rtlClass = useRtlClass();
  const currentUser = useAppSelector(selectCurrentUser);
  const isTutor = currentUser?.type === 'Tutor';
  const isParent = currentUser?.type === 'Parent';
  const [params, setParams] = useSearchParams();
  // Old links (?tab=trials, ?tab=changes) open on what needs an answer
  const asked = params.get('tab') as RequestView | null;
  const view: RequestView = asked && VIEWS.includes(asked) ? asked : 'inbox';
  const finished = view === 'history';

  const movesIn = useRescheduleRequests('inbox', 'pending');
  const movesOut = useRescheduleRequests('sent', 'pending');
  const weeklyIn = useScheduleChangeRequests('inbox', 'pending');
  const weeklyOut = useScheduleChangeRequests('sent', 'pending');
  const movesInDone = useRescheduleRequests('inbox', 'answered', finished);
  const movesOutDone = useRescheduleRequests('sent', 'answered', finished);
  const weeklyInDone = useScheduleChangeRequests('inbox', 'answered', finished);
  const weeklyOutDone = useScheduleChangeRequests('sent', 'answered', finished);
  // A tutor's free-trial requests; a family's own, and what it asked the office
  const offers = useTrialOffers('pending', isTutor);
  const offersDone = useTrialOffers('answered', isTutor && finished);
  const trials = useTrialRequests({
    allChildren: isParent,
    enabled: !!currentUser && !isTutor,
  });
  const office = useSessionRequests(undefined, !!currentUser && !isTutor);

  const moves = [
    ...(movesIn.data ?? []),
    ...(movesOut.data ?? []),
    ...(movesInDone.data ?? []),
    ...(movesOutDone.data ?? []),
  ];
  const weekly = [
    ...(weeklyIn.data ?? []),
    ...(weeklyOut.data ?? []),
    ...(weeklyInDone.data ?? []),
    ...(weeklyOutDone.data ?? []),
  ];
  const offerList = [...(offers.data ?? []), ...(offersDone.data ?? [])];
  const trialList = trials.data ?? [];
  const officeList = office.data?.data ?? [];

  const inView = (which: RequestView) => ({
    moves: moves.filter((r) => viewOfProposal(r) === which),
    weekly: weekly.filter((r) => viewOfProposal(r) === which),
    offers: offerList.filter(
      (o) => (o.status === 'pending' ? 'inbox' : 'history') === which,
    ),
    trials: trialList.filter((r) => viewOfTrialRequest(r) === which),
    office: officeList.filter((r) => viewOfOfficeRequest(r) === which),
  });
  const countOf = (which: RequestView) =>
    Object.values(inView(which)).reduce((sum, list) => sum + list.length, 0);
  const shown = inView(view);
  const total = Object.values(shown).reduce((sum, l) => sum + l.length, 0);

  const loading =
    movesIn.isLoading ||
    weeklyIn.isLoading ||
    movesOut.isLoading ||
    weeklyOut.isLoading ||
    (finished && (movesInDone.isLoading || weeklyInDone.isLoading));
  const failed = movesIn.isError || weeklyIn.isError;

  return (
    <section className={`requests dashboard-page ${rtlClass}`}>
      <header className="dashboard-header">
        <div className="container dashboard-header__inner">
          <div className="dashboard-header__text">
            <h1 className="dashboard-header__title">
              {t('SESSION_CHANGES.REQUESTS.TITLE')}
            </h1>
            <p className="dashboard-header__subtitle">
              {t(
                isTutor
                  ? 'SESSION_CHANGES.REQUESTS.SUBTITLE_TUTOR'
                  : 'SESSION_CHANGES.REQUESTS.SUBTITLE',
                { tz: localTimeZone() },
              )}
            </p>
          </div>
        </div>
      </header>

      <div className="container dashboard-page__body">
        <div
          className="requests__tabs"
          role="tablist"
          aria-label={t('SESSION_CHANGES.REQUESTS.TITLE')}
        >
          {VIEWS.map((key) => {
            const count = key === 'history' ? 0 : countOf(key);
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={view === key}
                className={`requests__tab${view === key ? ' is-on' : ''}`}
                onClick={() => setParams({ tab: key }, { replace: true })}
              >
                {t(`SESSION_CHANGES.REQUESTS.TABS.${key.toUpperCase()}`)}
                {count > 0 && <span className="requests__count">{count}</span>}
              </button>
            );
          })}
        </div>

        {loading && (
          <div className="requests__list">
            <Skeleton variant="rounded" height={160} />
            <Skeleton variant="rounded" height={160} />
          </div>
        )}

        {failed && (
          <Alert severity="error">
            {t('SESSION_CHANGES.REQUESTS.ERROR_LOADING')}
          </Alert>
        )}

        {!loading && !failed && total === 0 && (
          <div className="requests__empty">
            <p>{t(`SESSION_CHANGES.REQUESTS.EMPTY.${view.toUpperCase()}`)}</p>
          </div>
        )}

        {shown.offers.length > 0 && (
          <ul className="trial-offers__list">
            {shown.offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </ul>
        )}
        {shown.moves.length > 0 && (
          <ul className="requests__list">
            {shown.moves.map((request) => (
              <MoveCard key={request.id} request={request} />
            ))}
          </ul>
        )}
        {shown.weekly.length > 0 && (
          <ul className="requests__list">
            {shown.weekly.map((request) => (
              <WeeklyCard key={request.id} request={request} />
            ))}
          </ul>
        )}
        {shown.trials.length > 0 && (
          <ul className="trial-reqs__list requests__list">
            {shown.trials.map((request) => (
              <TrialRequestRow
                key={request.id}
                request={request}
                showStudent={isParent}
              />
            ))}
          </ul>
        )}
        {shown.office.length > 0 && (
          <ul className="requests__list">
            {shown.office.map((request) => (
              <OfficeCard key={request.id} request={request} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

/** What a family asked the Nafham office: it answers from the Admin */
const OfficeCard: FC<{ request: SessionRequest }> = ({ request }) => {
  const { t, i18n } = useTranslation();
  const locale = `${i18n.language}-u-nu-latn`;
  const pending = request.status === 'pending';
  const tutor = request.tutor
    ? `${request.tutor.first_name} ${request.tutor.last_name}`.trim()
    : '';

  return (
    <li className={`request-card request-card--${request.status}`}>
      <div className="request-card__kind request-card__kind--office">
        <SupportAgentRounded />
        <span>
          {t(`REQUEST_WAIT.OFFICE_KIND.${request.kind.toUpperCase()}`)}
        </span>
      </div>
      <div className="request-card__body">
        <div className="request-card__top">
          <h2 className="request-card__who">
            {t('REQUEST_WAIT.YOU_ASKED_OFFICE')}
          </h2>
          {!pending && (
            <span
              className={`request-card__status request-card__status--${request.status === 'handled' ? 'accepted' : 'declined'}`}
            >
              {t(`REQUEST_WAIT.OFFICE_STATUS.${request.status.toUpperCase()}`)}
            </span>
          )}
        </div>
        {(request.grade_subject?.full_course_name || tutor) && (
          <p className="request-card__course" dir="auto">
            {[courseLabel(request.grade_subject?.full_course_name), tutor]
              .filter(Boolean)
              .join(' · ')}
          </p>
        )}
        <p className="request-card__from">
          {t('REQUEST_WAIT.ASKED_ON', {
            when: formatSlot(request.created_at, locale),
          })}
          {request.hours_requested
            ? ` · ${t('REQUEST_WAIT.HOURS', { count: request.hours_requested })}`
            : ''}
        </p>
        {(request.preferred_times || request.note) && (
          <blockquote className="request-card__note" dir="auto">
            <FormatQuoteRounded aria-hidden="true" />
            {[request.preferred_times, request.note]
              .filter(Boolean)
              .join(' · ')}
          </blockquote>
        )}
        {pending && <WaitLine wait={OFFICE_WAIT} />}
      </div>
    </li>
  );
};

/** Who the proposal is about, for this viewer: the other person */
const useCounterpart = () => {
  const currentUser = useAppSelector(selectCurrentUser);
  return (session: {
    tutor?: { id: number; first_name: string; last_name: string };
    student?: { id: number; first_name: string; last_name: string };
  }) => {
    const other =
      session.tutor?.id === currentUser?.id ? session.student : session.tutor;
    return `${other?.first_name ?? ''} ${other?.last_name ?? ''}`.trim();
  };
};

const MoveCard: FC<{ request: RescheduleRequest }> = ({ request }) => {
  const { t, i18n } = useTranslation();
  const locale = `${i18n.language}-u-nu-latn`;
  const counterpart = useCounterpart();
  const answer = useAnswerMove();
  const withdraw = useWithdrawMove();
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState(request.options);
  const pending = request.status === 'pending';
  const busy = answer.isPending || withdraw.isPending;

  const accept = async (startTime: string) => {
    setError(null);
    try {
      await answer.mutateAsync({
        requestId: request.id,
        answer: 'accept',
        startTime,
      });
    } catch (err) {
      const left = remainingOptions(err);
      if (left) setOptions(left);
      setError(changeErrorMessage(err, t('SESSION_CHANGES.MOVE.ERROR_ANSWER')));
    }
  };
  const decline = async () => {
    setError(null);
    try {
      await answer.mutateAsync({
        requestId: request.id,
        answer: 'decline',
        reason,
      });
    } catch (err) {
      setError(changeErrorMessage(err, t('SESSION_CHANGES.MOVE.ERROR_ANSWER')));
    }
  };
  const takeBack = async () => {
    setError(null);
    try {
      await withdraw.mutateAsync(request.id);
    } catch (err) {
      setError(changeErrorMessage(err, t('SESSION_CHANGES.MOVE.ERROR_ANSWER')));
    }
  };

  return (
    <li className={`request-card request-card--${request.status}`}>
      <div className="request-card__kind">
        <EventRepeatRounded />
        <span>{t('SESSION_CHANGES.REQUESTS.KIND.MOVE')}</span>
      </div>
      <div className="request-card__body">
        <div className="request-card__top">
          <h2 className="request-card__who">
            {request.mine
              ? t('SESSION_CHANGES.REQUESTS.YOU_ASKED', {
                  name: counterpart(request.session),
                })
              : t('SESSION_CHANGES.REQUESTS.ASKS', {
                  name: request.proposed_by.first_name,
                })}
          </h2>
          {!pending && (
            <span
              className={`request-card__status request-card__status--${request.status}`}
            >
              {t(`SESSION_CHANGES.STATUS.${request.status.toUpperCase()}`)}
            </span>
          )}
        </div>
        <p className="request-card__course" dir="auto">
          {courseLabel(request.session.grade_subject?.full_course_name)}
        </p>
        <p className="request-card__from">
          {t(
            pending
              ? 'SESSION_CHANGES.MOVE.CURRENT'
              : 'SESSION_CHANGES.MOVE.WAS',
            {
              when: formatSlot(request.original_start_time, locale),
            },
          )}
        </p>
        {request.note && (
          <blockquote className="request-card__note" dir="auto">
            <FormatQuoteRounded aria-hidden="true" />
            {request.note}
          </blockquote>
        )}

        {pending && (
          <div className="request-card__options">
            {options.map((option) => (
              <button
                key={option.start_time}
                type="button"
                className="request-card__option"
                disabled={!request.can_answer || busy}
                onClick={() => request.can_answer && accept(option.start_time)}
              >
                {request.can_answer && <CheckRounded />}
                {formatSlot(option.start_time, locale)}
              </button>
            ))}
          </div>
        )}
        {request.status === 'accepted' && request.chosen_start_time && (
          <p className="request-card__result">
            {t('SESSION_CHANGES.MOVE.MOVED_TO', {
              when: formatSlot(request.chosen_start_time, locale),
            })}
          </p>
        )}
        {request.status === 'declined' && request.decline_reason && (
          <p className="request-card__result" dir="auto">
            {t('SESSION_CHANGES.REQUESTS.REASON', {
              reason: request.decline_reason,
            })}
          </p>
        )}
        {pending && (
          <WaitLine
            wait={proposalWait(request, 'MOVE')}
            name={counterpart(request.session)}
          />
        )}
        {pending && request.can_answer && (
          <p className="request-card__hint">
            {t('SESSION_CHANGES.MOVE.PICK_ONE')}
          </p>
        )}

        {error && (
          <Alert severity="error" className="request-card__error">
            {error}
          </Alert>
        )}

        {pending && declining && (
          <TextField
            size="small"
            fullWidth
            multiline
            minRows={2}
            label={t('TRIAL_OFFERS.REASON')}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            inputProps={{ maxLength: REASON_LENGTH, dir: 'auto' }}
          />
        )}
      </div>

      <div className="request-card__actions">
        {pending && request.can_answer && !declining && (
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<CloseRounded />}
            disabled={busy}
            onClick={() => setDeclining(true)}
          >
            {t('TRIAL_OFFERS.DECLINE')}
          </Button>
        )}
        {pending && declining && (
          <>
            <Button
              variant="contained"
              color="error"
              disabled={busy}
              onClick={decline}
            >
              {t('TRIAL_OFFERS.DECLINE_CONFIRM')}
            </Button>
            <Button
              variant="text"
              disabled={busy}
              onClick={() => setDeclining(false)}
            >
              {t('TRIAL_OFFERS.BACK')}
            </Button>
          </>
        )}
        {pending && request.can_withdraw && (
          <Button
            variant="outlined"
            color="inherit"
            startIcon={
              withdraw.isPending ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <UndoRounded />
              )
            }
            disabled={busy}
            onClick={takeBack}
          >
            {t('SESSION_CHANGES.REQUESTS.WITHDRAW')}
          </Button>
        )}
      </div>
    </li>
  );
};

const WeeklyCard: FC<{ request: ScheduleChangeRequest }> = ({ request }) => {
  const { t, i18n } = useTranslation();
  const locale = `${i18n.language}-u-nu-latn`;
  const counterpart = useCounterpart();
  const answer = useAnswerScheduleChange();
  const withdraw = useWithdrawScheduleChange();
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const pending = request.status === 'pending';
  const busy = answer.isPending || withdraw.isPending;
  const minutes = (count: number) =>
    t('MYSESSIONS.MAIN.CARD.MINUTES_COUNT', { count });

  const act = async (what: 'approve' | 'decline' | 'withdraw') => {
    setError(null);
    try {
      if (what === 'withdraw') await withdraw.mutateAsync(request.id);
      else
        await answer.mutateAsync({
          requestId: request.id,
          answer: what,
          reason,
        });
    } catch (err) {
      setError(
        changeErrorMessage(err, t('SESSION_CHANGES.WEEKLY.ERROR_ANSWER')),
      );
    }
  };

  return (
    <li className={`request-card request-card--${request.status}`}>
      <div className="request-card__kind request-card__kind--weekly">
        <EventRepeatRounded />
        <span>{t('SESSION_CHANGES.REQUESTS.KIND.WEEKLY')}</span>
      </div>
      <div className="request-card__body">
        <div className="request-card__top">
          <h2 className="request-card__who">
            {request.mine
              ? t('SESSION_CHANGES.REQUESTS.YOU_ASKED', {
                  name: counterpart(request.package),
                })
              : t('SESSION_CHANGES.REQUESTS.ASKS', {
                  name: request.proposed_by.first_name,
                })}
          </h2>
          {!pending && (
            <span
              className={`request-card__status request-card__status--${request.status}`}
            >
              {t(`SESSION_CHANGES.STATUS.${request.status.toUpperCase()}`)}
            </span>
          )}
        </div>
        <p className="request-card__course" dir="auto">
          {courseLabel(request.package.grade_subject?.full_course_name)}
        </p>
        <p className="request-card__times">
          <strong>
            {weeklyPatternLabel(request.pattern, locale, minutes)}
          </strong>
          {request.previous_pattern.length > 0 && (
            <span className="request-card__old">
              {t('SESSION_CHANGES.WEEKLY.INSTEAD_OF', {
                times: weeklyPatternLabel(
                  request.previous_pattern,
                  locale,
                  minutes,
                ),
              })}
            </span>
          )}
        </p>
        <p className="request-card__from">
          {t('SESSION_CHANGES.WEEKLY.EFFECTIVE', {
            date: request.effective_from,
          })}
        </p>
        {request.note && (
          <blockquote className="request-card__note" dir="auto">
            <FormatQuoteRounded aria-hidden="true" />
            {request.note}
          </blockquote>
        )}
        {request.status === 'approved' && (
          <p className="request-card__result">
            {t('SESSION_CHANGES.WEEKLY.BOOKED', {
              count: request.booked_session_ids.length,
            })}
            {request.conflicts_count > 0 &&
              ` ${t('SESSION_CHANGES.WEEKLY.CONFLICTS', { count: request.conflicts_count })}`}
          </p>
        )}
        {request.status === 'declined' && request.decline_reason && (
          <p className="request-card__result" dir="auto">
            {t('SESSION_CHANGES.REQUESTS.REASON', {
              reason: request.decline_reason,
            })}
          </p>
        )}
        {pending && (
          <WaitLine
            wait={proposalWait(request, 'WEEKLY')}
            name={counterpart(request.package)}
          />
        )}
        {pending && request.can_answer && (
          <p className="request-card__hint">
            {t('SESSION_CHANGES.WEEKLY.APPROVE_HINT')}
          </p>
        )}

        {error && (
          <Alert severity="error" className="request-card__error">
            {error}
          </Alert>
        )}

        {pending && declining && (
          <TextField
            size="small"
            fullWidth
            multiline
            minRows={2}
            label={t('TRIAL_OFFERS.REASON')}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            inputProps={{ maxLength: REASON_LENGTH, dir: 'auto' }}
          />
        )}
      </div>

      <div className="request-card__actions">
        {pending && request.can_answer && !declining && (
          <>
            <Button
              variant="contained"
              startIcon={
                answer.isPending ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <CheckRounded />
                )
              }
              disabled={busy}
              onClick={() => act('approve')}
            >
              {t('SESSION_CHANGES.WEEKLY.APPROVE')}
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<CloseRounded />}
              disabled={busy}
              onClick={() => setDeclining(true)}
            >
              {t('TRIAL_OFFERS.DECLINE')}
            </Button>
          </>
        )}
        {pending && declining && (
          <>
            <Button
              variant="contained"
              color="error"
              disabled={busy}
              onClick={() => act('decline')}
            >
              {t('TRIAL_OFFERS.DECLINE_CONFIRM')}
            </Button>
            <Button
              variant="text"
              disabled={busy}
              onClick={() => setDeclining(false)}
            >
              {t('TRIAL_OFFERS.BACK')}
            </Button>
          </>
        )}
        {pending && request.can_withdraw && (
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<UndoRounded />}
            disabled={busy}
            onClick={() => act('withdraw')}
          >
            {t('SESSION_CHANGES.REQUESTS.WITHDRAW')}
          </Button>
        )}
      </div>
    </li>
  );
};

export default RequestsPage;
