import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
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
  TimerOutlined,
  UndoRounded,
} from '@mui/icons-material';

import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import { useRtlClass } from '../../assets/utils/utils';
import {
  changeErrorMessage,
  remainingOptions,
  useAnswerMove,
  useRescheduleRequests,
  useWithdrawMove,
  type RequestBox,
  type RequestTab,
  type RescheduleRequest,
} from '../../hooks/useSessionChanges';
import {
  useAnswerScheduleChange,
  useScheduleChangeRequests,
  useWithdrawScheduleChange,
  weeklyPatternLabel,
  type ScheduleChangeRequest,
} from '../../hooks/useScheduleChanges';
import { formatSlot, localTimeZone } from '../trial/trial.types';

import '../sessions/dashboard-shell.styles.scss';
import './requests.styles.scss';

type View = 'inbox' | 'sent' | 'history';
const VIEWS: View[] = ['inbox', 'sent', 'history'];
const REASON_LENGTH = 500;

const boxOf = (view: View): RequestBox => (view === 'sent' ? 'sent' : 'inbox');
const tabOf = (view: View): RequestTab =>
  view === 'history' ? 'answered' : 'pending';

/**
 * Proposals between a family and a tutor: to move one lesson to one of up
 * to three times, or to change a package's weekly times. "Needs your
 * answer" lists what the other side proposed; "Sent" what this side did;
 * "History" what was answered. Emails and chat notices link here.
 */
const RequestsPage: FC = () => {
  const { t } = useTranslation();
  const rtlClass = useRtlClass();
  const [view, setView] = useState<View>('inbox');
  const moves = useRescheduleRequests(boxOf(view), tabOf(view));
  const weekly = useScheduleChangeRequests(boxOf(view), tabOf(view));
  const inboxMoves = useRescheduleRequests('inbox', 'pending');
  const inboxWeekly = useScheduleChangeRequests('inbox', 'pending');
  const waiting =
    (inboxMoves.data?.length ?? 0) + (inboxWeekly.data?.length ?? 0);
  // History also shows the proposals this side made
  const sentHistory = useScheduleChangeRequests(
    'sent',
    'answered',
    view === 'history',
  );
  const sentMoveHistory = useRescheduleRequests(
    'sent',
    'answered',
    view === 'history',
  );

  const loading = moves.isLoading || weekly.isLoading;
  const moveList = [
    ...(moves.data ?? []),
    ...(view === 'history' ? (sentMoveHistory.data ?? []) : []),
  ];
  const weeklyList = [
    ...(weekly.data ?? []),
    ...(view === 'history' ? (sentHistory.data ?? []) : []),
  ];
  const empty = !loading && moveList.length === 0 && weeklyList.length === 0;

  return (
    <section className={`requests dashboard-page ${rtlClass}`}>
      <header className="dashboard-header">
        <div className="container dashboard-header__inner">
          <div className="dashboard-header__text">
            <h1 className="dashboard-header__title">
              {t('SESSION_CHANGES.REQUESTS.TITLE')}
            </h1>
            <p className="dashboard-header__subtitle">
              {t('SESSION_CHANGES.REQUESTS.SUBTITLE', { tz: localTimeZone() })}
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
          {VIEWS.map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={view === key}
              className={`requests__tab${view === key ? ' is-on' : ''}`}
              onClick={() => setView(key)}
            >
              {t(`SESSION_CHANGES.REQUESTS.TABS.${key.toUpperCase()}`)}
              {key === 'inbox' && waiting > 0 && ` (${waiting})`}
            </button>
          ))}
        </div>

        {loading && (
          <div className="requests__list">
            <Skeleton variant="rounded" height={160} />
            <Skeleton variant="rounded" height={160} />
          </div>
        )}

        {(moves.isError || weekly.isError) && (
          <Alert severity="error">
            {t('SESSION_CHANGES.REQUESTS.ERROR_LOADING')}
          </Alert>
        )}

        {empty && (
          <div className="requests__empty">
            <p>{t(`SESSION_CHANGES.REQUESTS.EMPTY.${view.toUpperCase()}`)}</p>
            <Button component={Link} to="/my_sessions" variant="outlined">
              {t('TRIAL_OFFERS.OPEN_SESSIONS')}
            </Button>
          </div>
        )}

        {moveList.length > 0 && (
          <ul className="requests__list">
            {moveList.map((request) => (
              <MoveCard key={request.id} request={request} />
            ))}
          </ul>
        )}
        {weeklyList.length > 0 && (
          <ul className="requests__list">
            {weeklyList.map((request) => (
              <WeeklyCard key={request.id} request={request} />
            ))}
          </ul>
        )}
      </div>
    </section>
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
          {request.session.grade_subject?.full_course_name}
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
          <p className="request-card__deadline">
            <TimerOutlined />
            {t('TRIAL_OFFERS.ANSWER_BY', {
              time: formatSlot(request.expires_at, locale),
            })}
          </p>
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
        {request.status === 'accepted' && (
          <Button component={Link} to="/my_sessions" variant="outlined">
            {t('TRIAL_OFFERS.OPEN_SESSIONS')}
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
          {request.package.grade_subject?.full_course_name}
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
          <p className="request-card__deadline">
            <TimerOutlined />
            {t('TRIAL_OFFERS.ANSWER_BY', {
              time: formatSlot(request.expires_at, locale),
            })}
          </p>
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
        {request.status === 'approved' && (
          <Button component={Link} to="/my_sessions" variant="outlined">
            {t('TRIAL_OFFERS.OPEN_SESSIONS')}
          </Button>
        )}
      </div>
    </li>
  );
};

export default RequestsPage;
