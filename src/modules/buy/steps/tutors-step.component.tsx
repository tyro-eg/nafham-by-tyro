import { FC, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Button,
  CircularProgress,
  Rating,
  Tab,
  Tabs,
} from '@mui/material';
import {
  ArrowBackRounded,
  ArrowForwardRounded,
  AutoAwesomeRounded,
  AutorenewRounded,
  EditCalendarRounded,
  StarRounded,
  WorkspacePremiumRounded,
} from '@mui/icons-material';

import { getNameInitials } from '../../../assets/utils/utils';
import type {
  PurchaseTutor,
  PurchaseTutorsResult,
} from '../../../hooks/usePurchases';
import {
  scheduleIsEmpty,
  type WeeklySchedule,
} from '../../../lib/weekly-schedule';
import type { TutorChoice } from '../buy.types';
import { formatSlot } from '../../trial/trial.types';

type Tab = 'recommended' | 'trialed' | 'match';

interface TutorsStepProps {
  result?: PurchaseTutorsResult;
  loading: boolean;
  failed: boolean;
  schedule: WeeklySchedule;
  /** The tutor a deep link named, shown first in "trialed with" */
  preferredTutorId?: number;
  onChoose: (choice: TutorChoice) => void;
  onAddTimes: () => void;
  onBack: () => void;
}

const TOP = 4;
const BIO_LENGTH = 160;

/**
 * Who teaches: the tutors our team ranks for the course (with the price for
 * the size being considered and how many of their open times fall in the
 * weekly schedule), the ones the child already trialed with, or Nafham
 * matching one after payment. A tutor the child already learns the course
 * with is offered as a renewal instead.
 */
const TutorsStep: FC<TutorsStepProps> = ({
  result,
  loading,
  failed,
  schedule,
  preferredTutorId,
  onChoose,
  onAddTimes,
  onBack,
}) => {
  const { t, i18n } = useTranslation();
  const locale = `${i18n.language}-u-nu-latn`;
  const trialedAny = result?.tutors.some((tutor) => tutor.trialed) ?? false;
  // A tutor the child already met comes first: "Trialed with" opens by
  // default whenever there is one, until the parent picks another tab
  const [tab, setTab] = useState<Tab>('recommended');
  const tabTouched = useRef(false);
  useEffect(() => {
    if (trialedAny && !tabTouched.current) setTab('trialed');
  }, [trialedAny]);
  const [showAll, setShowAll] = useState(false);

  const back = (
    <Button
      className="trial__back"
      variant="outlined"
      startIcon={<ArrowBackRounded />}
      onClick={onBack}
    >
      {t('BUY.ACTIONS.BACK')}
    </Button>
  );

  if (loading) {
    return (
      <div className="trial__loading">
        <CircularProgress size={28} />
        <span>{t('BUY.TUTORS.LOADING')}</span>
      </div>
    );
  }

  if (failed || !result) {
    return (
      <div className="trial__step">
        <Alert severity="error">{t('BUY.TUTORS.ERROR')}</Alert>
        <div className="trial__actions">{back}</div>
      </div>
    );
  }

  const student = result.student.first_name;
  const blocking = result.tutors.find(
    (tutor) => tutor.already_learning_package_id,
  )?.already_learning_package_id;
  const listed =
    tab === 'trialed'
      ? result.tutors.filter((tutor) => tutor.trialed)
      : result.tutors;
  const ordered =
    preferredTutorId === undefined
      ? listed
      : [
          ...listed.filter((tutor) => tutor.id === preferredTutorId),
          ...listed.filter((tutor) => tutor.id !== preferredTutorId),
        ];
  const visible =
    showAll || tab === 'trialed' ? ordered : ordered.slice(0, TOP);
  const hidden = ordered.length - visible.length;

  const renderTutor = (tutor: PurchaseTutor, index: number) => {
    const name = `${tutor.first_name} ${tutor.last_name}`.trim();
    const renew = tutor.renew_instead_package_id;
    const top = index === 0 && tab === 'recommended' && tutor.purchasable;
    const bio = tutor.bio ?? '';
    const off = !tutor.purchasable && !renew;
    return (
      <li
        key={tutor.id}
        className={`trial-tutor ${top ? 'trial-tutor--top' : ''} ${off ? 'trial-tutor--used' : ''}`}
      >
        {top && (
          <span className="trial-tutor__ribbon">
            <WorkspacePremiumRounded />
            {t('TRIAL.TUTORS.TOP')}
          </span>
        )}
        <div className="trial-tutor__main">
          <div
            className="trial-tutor__avatar"
            style={
              tutor.avatar
                ? { backgroundImage: `url(${tutor.avatar})` }
                : undefined
            }
          >
            {tutor.avatar ? null : getNameInitials(name)}
          </div>
          <div className="trial-tutor__body">
            <div className="trial-tutor__head">
              <h3 className="trial-tutor__name">{name}</h3>
              {tutor.recommended && (
                <span className="trial-tutor__pick">
                  <StarRounded />
                  {t('TRIAL.TUTORS.OPS_PICK')}
                </span>
              )}
              {tutor.ops_rating ? (
                <span
                  className="trial-tutor__rating"
                  title={t('TRIAL.TUTORS.RATED')}
                >
                  <Rating value={tutor.ops_rating} size="small" readOnly />
                </span>
              ) : null}
            </div>
            {tutor.exam_boards.length > 0 && (
              <p className="trial-tutor__boards">
                {tutor.exam_boards.map((b) => b.name).join(' · ')}
              </p>
            )}
            {bio && (
              <p className="trial-tutor__bio" dir="auto">
                {bio.length > BIO_LENGTH ? `${bio.slice(0, BIO_LENGTH)}…` : bio}
              </p>
            )}
            <p className="buy-tutor__facts">
              {tutor.trialed && tutor.trial_on && (
                <span className="renew-tag">
                  {tutor.trial_status === 'scheduled'
                    ? t('BUY.TUTORS.TRIAL_SCHEDULED', {
                        date: formatSlot(tutor.trial_on, locale),
                      })
                    : t('BUY.TUTORS.TRIALED_ON', {
                        date: formatSlot(tutor.trial_on, locale),
                      })}
                </span>
              )}
              {tutor.overlap !== null &&
                (tutor.overlap > 0 ? (
                  <span className="renew-tag renew-tag--save">
                    {t('BUY.TUTORS.OVERLAP', { count: tutor.overlap })}
                  </span>
                ) : (
                  <span className="renew-tag renew-tag--muted">
                    {t('BUY.TUTORS.NO_OVERLAP')}
                  </span>
                ))}
            </p>
            {off && (
              <p className="trial-tutor__used" dir="auto">
                {tutor.reasons[0] ?? t('BUY.TUTORS.NOT_ONLINE')}
              </p>
            )}
          </div>
        </div>

        <div className="trial-tutor__action buy-tutor__action">
          {renew ? (
            <Button
              className="trial__back"
              variant="outlined"
              startIcon={<AutorenewRounded />}
              onClick={() =>
                onChoose({ kind: 'renewal', packageId: renew, tutorName: name })
              }
            >
              {t('BUY.TUTORS.RENEW', { name: tutor.first_name })}
            </Button>
          ) : tutor.purchasable ? (
            <Button
              className={top ? 'trial__cta' : 'trial__back'}
              variant={top ? 'contained' : 'outlined'}
              endIcon={<ArrowForwardRounded />}
              onClick={() =>
                onChoose({ kind: 'tutor', tutorId: tutor.id, tutorName: name })
              }
            >
              {t('BUY.TUTORS.CHOOSE', { name: tutor.first_name })}
            </Button>
          ) : tutor.already_learning_package_id ? null : (
            <span className="trial-tutor__used">
              {t('BUY.TUTORS.NOT_ONLINE')}
            </span>
          )}
        </div>
      </li>
    );
  };

  const renderMatch = () => {
    const match = result.match;
    const needsTimes = scheduleIsEmpty(schedule);
    return (
      <div className="buy-match">
        <span className="buy-match__icon" aria-hidden="true">
          <AutoAwesomeRounded />
        </span>
        <h3 className="buy-match__title">{t('BUY.TUTORS.MATCH_TITLE')}</h3>
        <p className="buy-match__text" dir="auto">
          {t('BUY.TUTORS.MATCH_TEXT', { name: student })}
        </p>
        <p className="trial__hint">{t('BUY.TUTORS.MATCH_SLA')}</p>
        {!match.purchasable && (
          <Alert severity="info">
            {match.reasons[0] ?? t('BUY.TUTORS.NOT_ONLINE')}
          </Alert>
        )}
        {match.purchasable && needsTimes && (
          <Alert
            severity="warning"
            action={
              <Button
                size="small"
                startIcon={<EditCalendarRounded />}
                onClick={onAddTimes}
              >
                {t('BUY.TUTORS.MATCH_ADD_TIMES')}
              </Button>
            }
          >
            {t('BUY.TUTORS.MATCH_NEEDS_TIMES')}
          </Alert>
        )}
        <div className="buy-tutor__action">
          <Button
            className="trial__cta"
            variant="contained"
            endIcon={<ArrowForwardRounded />}
            disabled={!match.purchasable || needsTimes}
            onClick={() => onChoose({ kind: 'match' })}
          >
            {t('BUY.TUTORS.MATCH_CHOOSE')}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="trial__step">
      <div>
        <h2 className="trial__step-title">{t('BUY.TUTORS.TITLE')}</h2>
        <p className="trial__hint">
          {t('BUY.TUTORS.SUBTITLE', {
            course: result.course.name,
            name: student,
          })}
        </p>
      </div>

      {blocking && (
        <Alert
          severity="info"
          action={
            <Button
              component={Link}
              to={`/my_packages?renew=${blocking}`}
              size="small"
            >
              {t('BUY.TUTORS.RENEW_THAT')}
            </Button>
          }
        >
          {t('BUY.TUTORS.ALREADY_LEARNING', { name: student })}{' '}
          <Link to="/messages">{t('BUY.TUTORS.CHANGE_TUTOR')}</Link>
        </Alert>
      )}

      <Tabs
        className="buy-tabs"
        value={tab}
        onChange={(_event, value: Tab) => {
          tabTouched.current = true;
          setTab(value);
        }}
        variant="scrollable"
        allowScrollButtonsMobile
      >
        <Tab value="recommended" label={t('BUY.TUTORS.TAB_RECOMMENDED')} />
        <Tab
          value="trialed"
          label={t('BUY.TUTORS.TAB_TRIALED')}
          disabled={!trialedAny}
        />
        <Tab value="match" label={t('BUY.TUTORS.TAB_MATCH')} />
      </Tabs>

      {tab === 'match' && renderMatch()}

      {tab !== 'match' && ordered.length === 0 && (
        <div className="trial__empty-box">
          <p className="trial__empty">
            {tab === 'trialed'
              ? t('BUY.TUTORS.NO_TRIALS')
              : t('BUY.TUTORS.EMPTY', { course: result.course.name })}
          </p>
        </div>
      )}

      {tab !== 'match' && ordered.length > 0 && (
        <ul className="trial__tutors">{visible.map(renderTutor)}</ul>
      )}

      <div className="trial__actions">
        {back}
        {tab === 'recommended' && hidden > 0 && (
          <Button
            className="trial__link"
            variant="text"
            onClick={() => setShowAll(true)}
          >
            {t('TRIAL.TUTORS.MORE', { count: hidden })}
          </Button>
        )}
      </div>
    </div>
  );
};

export default TutorsStep;
