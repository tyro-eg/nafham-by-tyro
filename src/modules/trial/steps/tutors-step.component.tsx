import { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, CircularProgress, Rating } from '@mui/material';
import {
  ArrowBackRounded,
  ArrowForwardRounded,
  ScheduleSendRounded,
  StarRounded,
  WorkspacePremiumRounded,
} from '@mui/icons-material';

import type { GradeSubject } from '../../../assets/types';
import { getNameInitials } from '../../../assets/utils/utils';
import {
  useTrialEligibility,
  type TrialDispatch,
  type TrialSlot,
  type TrialTutor,
} from '../../../hooks/useTrial';
import { formatSlot } from '../trial.types';
import MatchCards from './match-cards.component';
import RequestTime from './request-time.component';

interface TutorsStepProps {
  course?: GradeSubject;
  tutors?: TrialTutor[];
  loading: boolean;
  failed: boolean;
  signedIn: boolean;
  onPickTutor: (tutorId: number) => void;
  onPickSlot: (tutorId: number, slot: TrialSlot) => void;
  /** "Quickest to confirm" or "Best match" at one time */
  onPickMatch: (
    dispatch: Exclude<TrialDispatch, 'direct'>,
    startTime: string,
  ) => void;
  /** A tutor who wants students, at a time outside their calendar */
  onAskTime: (tutorId: number, startTime: string) => void;
  /** The search, for the time pickers */
  range: { from: string; to: string };
  window: { start: number; end: number };
  examBoardId?: number;
  /** The time asked for earlier, when coming back */
  startTime?: string;
  onBack: () => void;
}

const TOP = 3;
const BIO_LENGTH = 160;

/**
 * Two ways to ask for a trial: let us find the instructor at one time
 * (quickest to confirm, or best match), or pick a tutor, best first as our
 * team ranks them for this course. A tutor with free times offers them; a
 * tutor who wants students but has none in the window takes a time asked
 * for. The top three show first; the rest unfold on request.
 */
const TutorsStep: FC<TutorsStepProps> = ({
  course,
  tutors = [],
  loading,
  failed,
  signedIn,
  onPickTutor,
  onPickSlot,
  onPickMatch,
  onAskTime,
  range,
  window,
  examBoardId,
  startTime,
  onBack,
}) => {
  const { t, i18n } = useTranslation();
  const locale = `${i18n.language}-u-nu-latn`;
  const [showAll, setShowAll] = useState(false);
  // The tutor whose "Ask for a time" is open, and the time picked there
  const [asking, setAsking] = useState<number | null>(null);
  const [askTime, setAskTime] = useState<string | undefined>(startTime);
  const onAskChange = useCallback((value: string) => setAskTime(value), []);
  // A signed-in student may have used their trial with some of these tutors
  const eligibility = useTrialEligibility(course?.id, signedIn);

  const visible = showAll ? tutors : tutors.slice(0, TOP);
  const hidden = tutors.length - visible.length;

  const back = (
    <Button
      className="trial__back"
      variant="outlined"
      startIcon={<ArrowBackRounded />}
      onClick={onBack}
    >
      {t('TRIAL.ACTIONS.BACK')}
    </Button>
  );

  if (loading) {
    return (
      <div className="trial__loading">
        <CircularProgress size={28} />
        <span>{t('TRIAL.TUTORS.LOADING')}</span>
      </div>
    );
  }

  if (failed) {
    return (
      <div className="trial__step">
        <Alert severity="error">{t('TRIAL.ERROR_LOADING')}</Alert>
        <div className="trial__actions">{back}</div>
      </div>
    );
  }

  const match = course ? (
    <MatchCards
      courseId={course.id}
      examBoardId={examBoardId}
      from={range.from}
      to={range.to}
      window={window}
      startTime={startTime}
      onPick={onPickMatch}
    />
  ) : null;

  if (!tutors.length) {
    return (
      <div className="trial__step">
        <h2 className="trial__step-title">{t('TRIAL.TUTORS.TITLE')}</h2>
        {match}
        <div className="trial__empty-box">
          <p className="trial__empty">
            {t('TRIAL.TUTORS.EMPTY', {
              course: course?.full_course_name ?? '',
            })}
          </p>
        </div>
        <div className="trial__actions">{back}</div>
      </div>
    );
  }

  return (
    <div className="trial__step">
      <div>
        <h2 className="trial__step-title">{t('TRIAL.TUTORS.TITLE')}</h2>
        <p className="trial__hint">
          {t('TRIAL.TUTORS.SUBTITLE', {
            course: course?.full_course_name ?? '',
          })}
        </p>
      </div>

      {match}

      <p className="trial-choice__label">{t('TRIAL.TUTORS.OR_PICK')}</p>
      <ul className="trial__tutors">
        {visible.map((tutor, index) => {
          const name = `${tutor.first_name} ${tutor.last_name}`.trim();
          const used = eligibility.data?.[tutor.id]?.enabled === false;
          const bio = tutor.bio ?? '';
          const top = index === 0;
          // No published time in the window, but takes requests
          const askOnly = tutor.slots.length === 0 && tutor.wants_students;
          const open = asking === tutor.id;
          return (
            <li
              key={tutor.id}
              className={`trial-tutor ${top ? 'trial-tutor--top' : ''} ${used ? 'trial-tutor--used' : ''}`}
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
                        <Rating
                          value={tutor.ops_rating}
                          size="small"
                          readOnly
                        />
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
                      {bio.length > BIO_LENGTH
                        ? `${bio.slice(0, BIO_LENGTH)}…`
                        : bio}
                    </p>
                  )}
                </div>
              </div>

              {askOnly ? (
                <div className="trial-tutor__slots">
                  <span className="trial-choice__label">
                    {t('TRIAL.TUTORS.ASK_HINT', { name: tutor.first_name })}
                  </span>
                  {open && !used && (
                    <RequestTime
                      from={range.from}
                      to={range.to}
                      window={window}
                      value={askTime}
                      onChange={onAskChange}
                    />
                  )}
                </div>
              ) : (
                <div className="trial-tutor__slots">
                  <span className="trial-choice__label">
                    {t('TRIAL.TUTORS.NEXT_SLOTS')}
                  </span>
                  <div className="trial-tutor__chips">
                    {tutor.slots.slice(0, 3).map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        className="trial-slot-chip"
                        disabled={used}
                        onClick={() => onPickSlot(tutor.id, slot)}
                      >
                        {formatSlot(slot.start_time, locale)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="trial-tutor__action">
                {used ? (
                  <span className="trial-tutor__used">
                    {t('TRIAL.TUTORS.USED')}
                  </span>
                ) : askOnly && open ? (
                  <Button
                    className="trial__cta"
                    variant="contained"
                    endIcon={<ArrowForwardRounded />}
                    disabled={!askTime}
                    onClick={() => askTime && onAskTime(tutor.id, askTime)}
                  >
                    {t('TRIAL.ACTIONS.NEXT')}
                  </Button>
                ) : askOnly ? (
                  <Button
                    className={top ? 'trial__cta' : 'trial__back'}
                    variant={top ? 'contained' : 'outlined'}
                    startIcon={<ScheduleSendRounded />}
                    onClick={() => setAsking(tutor.id)}
                  >
                    {t('TRIAL.TUTORS.ASK')}
                  </Button>
                ) : (
                  <Button
                    className={top ? 'trial__cta' : 'trial__back'}
                    variant={top ? 'contained' : 'outlined'}
                    endIcon={<ArrowForwardRounded />}
                    onClick={() => onPickTutor(tutor.id)}
                  >
                    {t('TRIAL.TUTORS.CHOOSE', { name: tutor.first_name })}
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="trial__actions">
        {back}
        {hidden > 0 && (
          <Button
            className="trial__link"
            variant="text"
            onClick={() => setShowAll(true)}
          >
            {t('TRIAL.TUTORS.MORE', { count: hidden })}
          </Button>
        )}
        {showAll && tutors.length > TOP && (
          <Button
            className="trial__link"
            variant="text"
            onClick={() => setShowAll(false)}
          >
            {t('TRIAL.TUTORS.LESS')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default TutorsStep;
