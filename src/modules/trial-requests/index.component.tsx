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
  EventAvailableRounded,
  EventBusyRounded,
  FormatQuoteRounded,
  TimerOutlined,
} from '@mui/icons-material';

import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import { useRtlClass } from '../../assets/utils/utils';
import {
  useAcceptTrialOffer,
  useDeclineTrialOffer,
  useTrialOffers,
  type TrialOffer,
  type TrialOfferTab,
} from '../../hooks/useTrial';
import { bookingErrorMessage } from '../../hooks/useSessions';
import { formatSlot, formatTime, localTimeZone } from '../trial/trial.types';

import '../sessions/dashboard-shell.styles.scss';
import './trial-requests.styles.scss';

const TABS: TrialOfferTab[] = ['pending', 'answered'];
const REASON_LENGTH = 500;

/**
 * A tutor's free-trial requests: families who asked for them, or for
 * whoever is free first. Each shows the student's first name and course,
 * the time in the tutor's zone, whether it is on their calendar, the
 * family's note and the deadline, with Accept and Decline. Emails and the
 * support chat link here (/trial_requests).
 */
const TrialRequestsPage: FC = () => {
  const { t } = useTranslation();
  const rtlClass = useRtlClass();
  const [tab, setTab] = useState<TrialOfferTab>('pending');
  const offers = useTrialOffers(tab);
  const pendingCount = useTrialOffers('pending').data?.length ?? 0;
  const currentUser = useAppSelector(selectCurrentUser);

  return (
    <section className={`trial-offers dashboard-page ${rtlClass}`}>
      <header className="dashboard-header">
        <div className="container dashboard-header__inner">
          <div className="dashboard-header__text">
            <h1 className="dashboard-header__title">
              {t('TRIAL_OFFERS.TITLE')}
            </h1>
            <p className="dashboard-header__subtitle">
              {t('TRIAL_OFFERS.SUBTITLE', { tz: localTimeZone() })}
            </p>
          </div>
        </div>
      </header>

      <div className="container dashboard-page__body">
        <div
          className="trial-offers__tabs"
          role="tablist"
          aria-label={t('TRIAL_OFFERS.TITLE')}
        >
          {TABS.map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className={`trial-offers__tab${tab === key ? ' is-on' : ''}`}
              onClick={() => setTab(key)}
            >
              {t(`TRIAL_OFFERS.TABS.${key.toUpperCase()}`)}
              {key === 'pending' && pendingCount > 0 && ` (${pendingCount})`}
            </button>
          ))}
        </div>

        {offers.isLoading && (
          <div className="trial-offers__list">
            <Skeleton variant="rounded" height={180} />
            <Skeleton variant="rounded" height={180} />
          </div>
        )}

        {offers.isError && (
          <Alert severity="error">{t('TRIAL_OFFERS.ERROR_LOADING')}</Alert>
        )}

        {offers.data && offers.data.length === 0 && (
          <div className="trial-offers__empty">
            <p>
              {tab === 'pending'
                ? t('TRIAL_OFFERS.EMPTY')
                : t('TRIAL_OFFERS.EMPTY_ANSWERED')}
            </p>
            {tab === 'pending' && currentUser && (
              <Button
                component={Link}
                to={`/profile/${currentUser.id}`}
                variant="outlined"
              >
                {t('TRIAL_OFFERS.MORE_STUDENTS')}
              </Button>
            )}
          </div>
        )}

        {offers.data && offers.data.length > 0 && (
          <ul className="trial-offers__list">
            {offers.data.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

const OfferCard: FC<{ offer: TrialOffer }> = ({ offer }) => {
  const { t, i18n } = useTranslation();
  const locale = `${i18n.language}-u-nu-latn`;
  const accept = useAcceptTrialOffer();
  const decline = useDeclineTrialOffer();
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const pending = offer.status === 'pending';
  const busy = accept.isPending || decline.isPending;

  const answer = async (kind: 'accept' | 'decline') => {
    setError(null);
    try {
      if (kind === 'accept') await accept.mutateAsync({ offer });
      else await decline.mutateAsync({ offer, reason });
    } catch (err) {
      setError(bookingErrorMessage(err, t('TRIAL_OFFERS.ERROR')));
    }
  };

  const course = offer.exam_board
    ? `${offer.grade_subject.full_course_name} · ${offer.exam_board.name}`
    : offer.grade_subject.full_course_name;

  return (
    <li className={`trial-offer trial-offer--${offer.status}`}>
      <div className="trial-offer__when">
        <span className="trial-offer__day">
          {new Date(offer.start_time).toLocaleDateString(locale, {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          })}
        </span>
        <span className="trial-offer__time">
          {formatTime(offer.start_time, locale)}–
          {formatTime(offer.end_time, locale)}
        </span>
      </div>

      <div className="trial-offer__body">
        <div className="trial-offer__top">
          <h2 className="trial-offer__student">{offer.student.first_name}</h2>
          <span
            className={`trial-offer__calendar trial-offer__calendar--${offer.on_calendar ? 'on' : 'off'}`}
          >
            {offer.on_calendar ? (
              <EventAvailableRounded />
            ) : (
              <EventBusyRounded />
            )}
            {offer.on_calendar
              ? t('TRIAL_OFFERS.ON_CALENDAR')
              : t('TRIAL_OFFERS.OFF_CALENDAR')}
          </span>
          {!pending && (
            <span
              className={`trial-offer__status trial-offer__status--${offer.status}`}
            >
              {t(`TRIAL_OFFERS.STATUS.${offer.status.toUpperCase()}`)}
            </span>
          )}
        </div>
        <p className="trial-offer__course" dir="auto">
          {course}
        </p>
        <p className="trial-offer__dispatch">
          {t(`TRIAL_OFFERS.DISPATCH.${offer.dispatch.toUpperCase()}`)}
          {!offer.on_calendar && pending && ` ${t('TRIAL_OFFERS.OFF_HINT')}`}
        </p>
        {offer.note && (
          <blockquote className="trial-offer__note" dir="auto">
            <FormatQuoteRounded aria-hidden="true" />
            {offer.note}
          </blockquote>
        )}
        {pending && (
          <p className="trial-offer__deadline">
            <TimerOutlined />
            {t('TRIAL_OFFERS.ANSWER_BY', {
              time: formatSlot(offer.expires_at, locale),
            })}
          </p>
        )}
        {!pending && offer.reason && (
          <p className="trial-offer__reason" dir="auto">
            {offer.status === 'declined'
              ? t('TRIAL_OFFERS.YOUR_REASON', { reason: offer.reason })
              : offer.reason}
          </p>
        )}

        {error && (
          <Alert severity="error" className="trial-offer__error">
            {error}
          </Alert>
        )}

        {pending && declining && (
          <div className="trial-offer__decline">
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
          </div>
        )}
      </div>

      <div className="trial-offer__actions">
        {pending && !declining && (
          <>
            <Button
              variant="contained"
              startIcon={
                accept.isPending ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <CheckRounded />
                )
              }
              disabled={busy}
              onClick={() => answer('accept')}
            >
              {t('TRIAL_OFFERS.ACCEPT')}
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
              onClick={() => answer('decline')}
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
        {offer.status === 'accepted' && (
          <Button component={Link} to="/my_sessions" variant="outlined">
            {t('TRIAL_OFFERS.OPEN_SESSIONS')}
          </Button>
        )}
      </div>
    </li>
  );
};

export default TrialRequestsPage;
