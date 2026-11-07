import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Alert, Button } from '@mui/material';
import {
  HourglassTopRounded,
  SearchOffRounded,
  ScheduleSendRounded,
} from '@mui/icons-material';

import {
  useCancelTrialRequest,
  useTrialRequests,
  type TrialRequest,
} from '../../hooks/useTrial';
import { bookingErrorMessage } from '../../hooks/useSessions';
import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import { setActiveChildId } from '../../lib/family-child';
import { emptyDraft, formatSlot, saveDraft } from './trial.types';

import './trial-requests-card.styles.scss';

interface TrialRequestsCardProps {
  /** A parent's every child at once, with each child's name */
  allChildren?: boolean;
  /** Show the child's name on each request */
  showStudent?: boolean;
  className?: string;
}

/**
 * The family's free-trial requests still waiting for an instructor, or
 * that nobody could take: status, who was asked, when they hear back at
 * the latest, Cancel, and for an unmatched one "Pick another time". Shows
 * nothing when there are none.
 */
const TrialRequestsCard: FC<TrialRequestsCardProps> = ({
  allChildren = false,
  showStudent = false,
  className,
}) => {
  const { t } = useTranslation();
  const requests = useTrialRequests({ allChildren });
  const open = (requests.data ?? []).filter((request) => request.actionable);

  if (!open.length) return null;

  return (
    <section
      className={`trial-reqs ${className ?? ''}`}
      aria-label={t('TRIAL.REQUESTS.TITLE')}
    >
      <header className="trial-reqs__head">
        <h2 className="trial-reqs__title">{t('TRIAL.REQUESTS.TITLE')}</h2>
      </header>
      <ul className="trial-reqs__list">
        {open.map((request) => (
          <RequestRow
            key={request.id}
            request={request}
            showStudent={showStudent}
          />
        ))}
      </ul>
    </section>
  );
};

const RequestRow: FC<{ request: TrialRequest; showStudent: boolean }> = ({
  request,
  showStudent,
}) => {
  const { t, i18n } = useTranslation();
  const locale = `${i18n.language}-u-nu-latn`;
  const cancel = useCancelTrialRequest();
  const isParent = useAppSelector(selectCurrentUser)?.type === 'Parent';
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pending = request.status === 'pending';

  const asked =
    request.dispatch === 'direct' && request.tutor
      ? t('TRIAL.REQUESTS.ASKED_TUTOR', { name: request.tutor.first_name })
      : t('TRIAL.REQUESTS.ASKED', { count: request.offers_count });

  const doCancel = async () => {
    setError(null);
    try {
      await cancel.mutateAsync(request);
    } catch (err) {
      setError(bookingErrorMessage(err, t('TRIAL.REQUESTS.CANCEL_ERROR')));
      setConfirming(false);
    }
  };

  // Back to the wizard with the same course (and child) already chosen
  const pickAgain = () => {
    const childId = isParent ? request.student?.id : undefined;
    if (childId) setActiveChildId(childId);
    saveDraft({
      ...emptyDraft(),
      step: 'when',
      childId,
      courseId: request.grade_subject?.id,
      examBoardId: request.exam_board?.id,
    });
  };

  return (
    <li className={`trial-req trial-req--${request.status}`}>
      <span className="trial-req__icon" aria-hidden="true">
        {pending ? <HourglassTopRounded /> : <SearchOffRounded />}
      </span>
      <div className="trial-req__body">
        <div className="trial-req__top">
          <span
            className={`trial-req__status trial-req__status--${request.status}`}
          >
            {t(`TRIAL.REQUESTS.STATUS.${request.status.toUpperCase()}`)}
          </span>
          {showStudent && request.student && (
            <span className="trial-req__student">
              {request.student.first_name}
            </span>
          )}
        </div>
        <p className="trial-req__course" dir="auto">
          {request.grade_subject?.full_course_name}
          {request.exam_board ? ` · ${request.exam_board.name}` : ''}
        </p>
        <p className="trial-req__meta">
          {formatSlot(request.start_time, locale)} · {asked}
        </p>
        {pending && request.pending_until && (
          <p className="trial-req__deadline">
            {t('TRIAL.SENT.BY', {
              time: formatSlot(request.pending_until, locale),
            })}
          </p>
        )}
        {!pending && (
          <p className="trial-req__deadline">
            {t(
              `TRIAL.REQUESTS.REASON.${(request.unmatched_reason ?? 'no_candidates').toUpperCase()}`,
            )}
          </p>
        )}
        {error && (
          <Alert severity="error" className="trial-req__error">
            {error}
          </Alert>
        )}
      </div>
      <div className="trial-req__actions">
        {!pending && (
          <Button
            component={Link}
            to="/trial"
            onClick={pickAgain}
            variant="contained"
            size="small"
            startIcon={<ScheduleSendRounded />}
          >
            {t('TRIAL.REQUESTS.PICK_AGAIN')}
          </Button>
        )}
        {confirming ? (
          <>
            <Button
              size="small"
              color="error"
              variant="outlined"
              disabled={cancel.isPending}
              onClick={doCancel}
            >
              {t('TRIAL.REQUESTS.CANCEL_CONFIRM')}
            </Button>
            <Button
              size="small"
              variant="text"
              disabled={cancel.isPending}
              onClick={() => setConfirming(false)}
            >
              {t('TRIAL.REQUESTS.KEEP')}
            </Button>
          </>
        ) : (
          <Button
            size="small"
            variant="text"
            color="inherit"
            onClick={() => setConfirming(true)}
          >
            {t('TRIAL.REQUESTS.CANCEL')}
          </Button>
        )}
      </div>
    </li>
  );
};

export default TrialRequestsCard;
