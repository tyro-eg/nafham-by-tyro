import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  TextField,
} from '@mui/material';
import {
  ArrowBackRounded,
  BoltRounded,
  CardGiftcardRounded,
  EventRounded,
  LockOutlined,
  MenuBookRounded,
  PersonRounded,
  WorkspacePremiumRounded,
} from '@mui/icons-material';

import type { GradeSubject } from '../../../assets/types';
import {
  useCreateTrialRequest,
  type ExamBoardOption,
  type TrialDispatch,
  type TrialRequest,
  type TrialTutor,
} from '../../../hooks/useTrial';
import { bookingErrorMessage } from '../../../hooks/useSessions';
import RegisterModal from '../../../modals/register-modal/register-modal.component';
import LoginModal from '../../../modals/login-modal/login-modal.component';
import { formatSlot, localTimeZone } from '../trial.types';

interface ConfirmStepProps {
  course?: GradeSubject;
  examBoard?: ExamBoardOption;
  dispatch?: TrialDispatch;
  /** The picked tutor, for a direct request */
  tutor?: TrialTutor;
  startTime?: string;
  /** The time is one of the tutor's published slots */
  onCalendar: boolean;
  loading: boolean;
  note: string;
  onNote: (value: string) => void;
  guardianPhone: string;
  onGuardianPhone: (value: string) => void;
  signedIn: boolean;
  /** A parent's pick: the child the trial is for */
  childId?: number;
  onBack: () => void;
  onSent: (request: TrialRequest) => void;
}

const SLOT_MINUTES = 30;
const NOTE_LENGTH = 1000;

/**
 * The summary, a note for the instructor, an optional parent's phone, and
 * the request itself. A visitor creates an account (or signs in) first;
 * the auth modals bring them back here and the draft is restored.
 */
const ConfirmStep: FC<ConfirmStepProps> = ({
  course,
  examBoard,
  dispatch,
  tutor,
  startTime,
  onCalendar,
  loading,
  note,
  onNote,
  guardianPhone,
  onGuardianPhone,
  signedIn,
  childId,
  onBack,
  onSent,
}) => {
  const { t, i18n } = useTranslation();
  const locale = `${i18n.language}-u-nu-latn`;
  const createRequest = useCreateTrialRequest();
  const [error, setError] = useState<string | null>(null);
  const [auth, setAuth] = useState<'register' | 'login' | null>(null);

  if (loading) {
    return (
      <div className="trial__loading">
        <CircularProgress size={28} />
      </div>
    );
  }

  // The tutor is no longer listed for that window, or the draft is incomplete
  if (!course || !startTime || !dispatch || (dispatch === 'direct' && !tutor)) {
    return (
      <div className="trial__step">
        <Alert severity="info">{t('TRIAL.CONFIRM.MISSING')}</Alert>
        <div className="trial__actions">
          <Button
            className="trial__back"
            variant="outlined"
            startIcon={<ArrowBackRounded />}
            onClick={onBack}
          >
            {t('TRIAL.ACTIONS.BACK')}
          </Button>
        </div>
      </div>
    );
  }

  const send = async () => {
    setError(null);
    try {
      const request = await createRequest.mutateAsync({
        grade_subject_id: course.id,
        exam_board_id: examBoard?.id,
        start_time: startTime,
        time_zone: localTimeZone(),
        dispatch,
        tutor_id: dispatch === 'direct' ? tutor?.id : undefined,
        note: note.trim() || undefined,
        guardian_phone: guardianPhone.trim() || undefined,
        childId,
      });
      onSent(request);
    } catch (err) {
      setError(bookingErrorMessage(err, t('TRIAL.ERROR')));
    }
  };

  const tutorName = tutor
    ? `${tutor.first_name} ${tutor.last_name}`.trim()
    : '';
  const how =
    dispatch === 'fastest'
      ? t('TRIAL.CONFIRM.HOW_FASTEST')
      : dispatch === 'best_match'
        ? t('TRIAL.CONFIRM.HOW_BEST')
        : onCalendar
          ? t('TRIAL.CONFIRM.HOW_DIRECT', { name: tutor?.first_name })
          : t('TRIAL.CONFIRM.HOW_ASK', { name: tutor?.first_name });

  const rows = [
    {
      icon: <MenuBookRounded />,
      label: t('TRIAL.CONFIRM.COURSE'),
      value: examBoard
        ? `${course.full_course_name} · ${examBoard.name}`
        : course.full_course_name,
    },
    {
      icon:
        dispatch === 'fastest' ? (
          <BoltRounded />
        ) : dispatch === 'best_match' ? (
          <WorkspacePremiumRounded />
        ) : (
          <PersonRounded />
        ),
      label: t('TRIAL.CONFIRM.TUTOR'),
      value:
        dispatch === 'fastest'
          ? t('TRIAL.MATCH.FASTEST')
          : dispatch === 'best_match'
            ? t('TRIAL.MATCH.BEST')
            : tutorName,
    },
    {
      icon: <EventRounded />,
      label: t('TRIAL.CONFIRM.WHEN'),
      value: `${formatSlot(startTime, locale)} · ${t('TRIAL.CONFIRM.DURATION', { minutes: SLOT_MINUTES })}`,
    },
  ];

  return (
    <div className="trial__step">
      <h2 className="trial__step-title">{t('TRIAL.CONFIRM.TITLE')}</h2>

      <div className="trial-receipt">
        <div className="trial-receipt__badge">
          <CardGiftcardRounded />
          <span>{t('TRIAL.CONFIRM.FREE')}</span>
        </div>
        <ul className="trial-receipt__rows">
          {rows.map((row) => (
            <li key={row.label} className="trial-receipt__row">
              <span className="trial-receipt__icon">{row.icon}</span>
              <span className="trial-receipt__text">
                <span className="trial-receipt__label">{row.label}</span>
                <span className="trial-receipt__value">{row.value}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="trial-receipt__how">{how}</p>
      </div>

      <TextField
        className="trial__guardian"
        fullWidth
        multiline
        minRows={2}
        label={t('TRIAL.CONFIRM.NOTE')}
        helperText={t('TRIAL.CONFIRM.NOTE_HINT')}
        value={note}
        onChange={(event) => onNote(event.target.value)}
        inputProps={{ maxLength: NOTE_LENGTH, dir: 'auto' }}
      />

      <TextField
        className="trial__guardian"
        type="tel"
        fullWidth
        label={t('TRIAL.CONFIRM.GUARDIAN_PHONE')}
        helperText={t('TRIAL.CONFIRM.GUARDIAN_HINT')}
        placeholder="+20 10 1234 5678"
        value={guardianPhone}
        onChange={(event) => onGuardianPhone(event.target.value)}
        inputProps={{ maxLength: 20, dir: 'ltr' }}
      />

      {error && <Alert severity="error">{error}</Alert>}

      {!signedIn && (
        <p className="trial__notice">
          <LockOutlined />
          {t('TRIAL.CONFIRM.VISITOR')}
        </p>
      )}

      <div className="trial__actions">
        <Button
          className="trial__back"
          variant="outlined"
          startIcon={<ArrowBackRounded />}
          onClick={onBack}
        >
          {t('TRIAL.ACTIONS.BACK')}
        </Button>
        {signedIn ? (
          <Button
            className="trial__cta trial__cta--gold"
            variant="contained"
            startIcon={<CardGiftcardRounded />}
            disabled={createRequest.isPending}
            onClick={send}
          >
            {createRequest.isPending
              ? t('TRIAL.CONFIRM.BOOKING')
              : t('TRIAL.CONFIRM.BOOK')}
          </Button>
        ) : (
          <>
            <Button
              className="trial__link"
              variant="text"
              onClick={() => setAuth('login')}
            >
              {t('TRIAL.CONFIRM.LOGIN')}
            </Button>
            <Button
              className="trial__cta trial__cta--gold"
              variant="contained"
              onClick={() => setAuth('register')}
            >
              {t('TRIAL.CONFIRM.REGISTER')}
            </Button>
          </>
        )}
      </div>

      <Dialog
        open={auth === 'register'}
        onClose={() => setAuth(null)}
        maxWidth="sm"
        fullWidth
      >
        <RegisterModal
          onClose={() => setAuth(null)}
          openLoginModal={() => setAuth('login')}
          modalData={{ returnTo: '/trial' }}
        />
      </Dialog>
      <Dialog
        open={auth === 'login'}
        onClose={() => setAuth(null)}
        maxWidth="sm"
        fullWidth
      >
        <LoginModal
          onClose={() => setAuth(null)}
          openRegisterModal={() => setAuth('register')}
          modalData={{ returnTo: '/trial' }}
        />
      </Dialog>
    </div>
  );
};

export default ConfirmStep;
