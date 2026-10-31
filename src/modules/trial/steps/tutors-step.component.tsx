import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Chip, CircularProgress, Rating } from '@mui/material';
import { ArrowBack, StarRounded } from '@mui/icons-material';

import type { GradeSubject } from '../../../assets/types';
import { getNameInitials } from '../../../assets/utils/utils';
import {
  useTrialEligibility,
  type TrialSlot,
  type TrialTutor,
} from '../../../hooks/useTrial';
import { formatSlot } from '../trial.types';

interface TutorsStepProps {
  course?: GradeSubject;
  tutors?: TrialTutor[];
  loading: boolean;
  failed: boolean;
  signedIn: boolean;
  onPickTutor: (tutorId: number) => void;
  onPickSlot: (tutorId: number, slot: TrialSlot) => void;
  onBack: () => void;
}

const TOP = 3;
const BIO_LENGTH = 140;

/**
 * The tutors who can give the trial, best first as our team ranks them for
 * this course. The top three show first; the rest unfold on request.
 */
const TutorsStep: FC<TutorsStepProps> = ({
  course,
  tutors = [],
  loading,
  failed,
  signedIn,
  onPickTutor,
  onPickSlot,
  onBack,
}) => {
  const { t, i18n } = useTranslation();
  const locale = `${i18n.language}-u-nu-latn`;
  const [showAll, setShowAll] = useState(false);
  // A signed-in student may have used their trial with some of these tutors
  const eligibility = useTrialEligibility(course?.id, signedIn);

  const visible = showAll ? tutors : tutors.slice(0, TOP);
  const hidden = tutors.length - visible.length;

  const back = (
    <Button variant="outlined" startIcon={<ArrowBack />} onClick={onBack}>
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

  if (!tutors.length) {
    return (
      <div className="trial__step">
        <p className="trial__empty">
          {t('TRIAL.TUTORS.EMPTY', { course: course?.full_course_name ?? '' })}
        </p>
        <div className="trial__actions">{back}</div>
      </div>
    );
  }

  return (
    <div className="trial__step">
      <h2 className="trial__step-title">{t('TRIAL.TUTORS.TITLE')}</h2>
      <p className="trial__hint">
        {t('TRIAL.TUTORS.SUBTITLE', { course: course?.full_course_name ?? '' })}
      </p>

      <ul className="trial__tutors">
        {visible.map((tutor, index) => {
          const name = `${tutor.first_name} ${tutor.last_name}`.trim();
          const used = eligibility.data?.[tutor.id]?.enabled === false;
          const bio = tutor.bio ?? '';
          return (
            <li
              key={tutor.id}
              className={`trial-tutor ${index < TOP ? 'trial-tutor--top' : ''}`}
            >
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
                    <Chip
                      size="small"
                      color="secondary"
                      icon={<StarRounded />}
                      label={t('TRIAL.TUTORS.OPS_PICK')}
                    />
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
                <p className="trial-tutor__bio" dir="auto">
                  {bio.length > BIO_LENGTH
                    ? `${bio.slice(0, BIO_LENGTH)}…`
                    : bio}
                </p>
                <p className="trial__label">{t('TRIAL.TUTORS.NEXT_SLOTS')}</p>
                <div className="trial__chips">
                  {tutor.slots.slice(0, 3).map((slot) => (
                    <Chip
                      key={slot.id}
                      label={formatSlot(slot.start_time, locale)}
                      variant="outlined"
                      disabled={used}
                      onClick={() => onPickSlot(tutor.id, slot)}
                    />
                  ))}
                </div>
              </div>
              <div className="trial-tutor__action">
                {used ? (
                  <span className="trial-tutor__used">
                    {t('TRIAL.TUTORS.USED')}
                  </span>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
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
          <Button variant="text" onClick={() => setShowAll(true)}>
            {t('TRIAL.TUTORS.MORE', { count: hidden })}
          </Button>
        )}
        {showAll && tutors.length > TOP && (
          <Button variant="text" onClick={() => setShowAll(false)}>
            {t('TRIAL.TUTORS.LESS')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default TutorsStep;
