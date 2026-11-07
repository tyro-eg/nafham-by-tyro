import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import {
  EventNoteRounded,
  HourglassTopRounded,
  MarkEmailReadRounded,
  SearchOffRounded,
} from '@mui/icons-material';

import type { TrialRequest } from '../../hooks/useTrial';
import { formatSlot } from './trial.types';

interface RequestSentProps {
  request: TrialRequest;
  /** Back to the tutors step, to pick another time */
  onRetry: () => void;
}

/**
 * After the request is sent: who we are waiting for, when the family hears
 * back at the latest, and what happens next. A request nobody could take
 * (no instructor at that time) asks for another time instead.
 */
const RequestSent: FC<RequestSentProps> = ({ request, onRetry }) => {
  const { t, i18n } = useTranslation();
  const locale = `${i18n.language}-u-nu-latn`;

  if (request.status !== 'pending') {
    return (
      <div className="trial-sent">
        <span className="trial-sent__icon trial-sent__icon--muted">
          <SearchOffRounded />
        </span>
        <h2 className="trial-sent__title">{t('TRIAL.SENT.UNMATCHED')}</h2>
        <p className="trial-sent__text">{t('TRIAL.SENT.UNMATCHED_TEXT')}</p>
        <div className="trial-sent__actions">
          <Button className="trial__cta" variant="contained" onClick={onRetry}>
            {t('TRIAL.REQUESTS.PICK_AGAIN')}
          </Button>
        </div>
      </div>
    );
  }

  const title =
    request.dispatch === 'direct' && request.tutor
      ? t('TRIAL.SENT.WAITING_FOR', { name: request.tutor.first_name })
      : t('TRIAL.SENT.ASKING', { count: request.offers_count });

  return (
    <div className="trial-sent">
      <span className="trial-sent__icon">
        <HourglassTopRounded />
      </span>
      <h2 className="trial-sent__title">{title}</h2>
      <p className="trial-sent__text">
        {request.grade_subject?.full_course_name} ·{' '}
        {formatSlot(request.start_time, locale)}
      </p>
      {request.pending_until && (
        <p className="trial-sent__deadline">
          {t('TRIAL.SENT.BY', {
            time: formatSlot(request.pending_until, locale),
          })}
        </p>
      )}
      <ul className="trial-sent__next">
        <li>
          <MarkEmailReadRounded />
          {t('TRIAL.SENT.NEXT_EMAIL')}
        </li>
        <li>
          <EventNoteRounded />
          {t(
            request.dispatch === 'direct'
              ? 'TRIAL.SENT.NEXT_DIRECT'
              : request.dispatch === 'fastest'
                ? 'TRIAL.SENT.NEXT_FASTEST'
                : 'TRIAL.SENT.NEXT_BEST',
          )}
        </li>
      </ul>
      <div className="trial-sent__actions">
        <Button
          component={Link}
          to="/my_sessions"
          className="trial__cta"
          variant="contained"
        >
          {t('CHECKOUT.MODALS.TRIAL_SUCCESS.BUTTON')}
        </Button>
      </div>
    </div>
  );
};

export default RequestSent;
