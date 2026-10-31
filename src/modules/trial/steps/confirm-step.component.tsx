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
  CardGiftcardRounded,
  EventRounded,
  LockOutlined,
  MenuBookRounded,
  PersonRounded,
} from '@mui/icons-material';

import type { GradeSubject } from '../../../assets/types';
import type {
  ExamBoardOption,
  TrialSlot,
  TrialTutor,
} from '../../../hooks/useTrial';
import {
  bookingErrorMessage,
  useBookTrialSession,
} from '../../../hooks/useSessions';
import RegisterModal from '../../../modals/register-modal/register-modal.component';
import LoginModal from '../../../modals/login-modal/login-modal.component';
import { formatSlot } from '../trial.types';

interface ConfirmStepProps {
  course?: GradeSubject;
  examBoard?: ExamBoardOption;
  tutor?: TrialTutor;
  slot?: TrialSlot;
  loading: boolean;
  guardianPhone: string;
  onGuardianPhone: (value: string) => void;
  signedIn: boolean;
  onBack: () => void;
  onBooked: () => void;
}

const SLOT_MINUTES = 30;

/**
 * The summary, an optional parent's phone, and the booking itself. A
 * visitor creates an account (or signs in) first; the auth modals bring
 * them back here and the draft is restored.
 */
const ConfirmStep: FC<ConfirmStepProps> = ({
  course,
  examBoard,
  tutor,
  slot,
  loading,
  guardianPhone,
  onGuardianPhone,
  signedIn,
  onBack,
  onBooked,
}) => {
  const { t, i18n } = useTranslation();
  const locale = `${i18n.language}-u-nu-latn`;
  const bookTrial = useBookTrialSession();
  const [error, setError] = useState<string | null>(null);
  const [auth, setAuth] = useState<'register' | 'login' | null>(null);

  if (loading || !course || !tutor || !slot) {
    return (
      <div className="trial__loading">
        <CircularProgress size={28} />
      </div>
    );
  }

  const minutes = Math.round(
    (new Date(slot.end_time).getTime() - new Date(slot.start_time).getTime()) /
      60000,
  );

  const book = async () => {
    setError(null);
    try {
      await bookTrial.mutateAsync({
        tutor_id: tutor.id,
        grade_subject_id: course.id,
        start_time: slot.start_time,
        guardian_phone: guardianPhone.trim() || undefined,
        exam_board_id: examBoard?.id,
      });
      onBooked();
    } catch (err) {
      setError(bookingErrorMessage(err, t('TRIAL.ERROR')));
    }
  };

  const rows = [
    {
      icon: <MenuBookRounded />,
      label: t('TRIAL.CONFIRM.COURSE'),
      value: examBoard
        ? `${course.full_course_name} · ${examBoard.name}`
        : course.full_course_name,
    },
    {
      icon: <PersonRounded />,
      label: t('TRIAL.CONFIRM.TUTOR'),
      value: `${tutor.first_name} ${tutor.last_name}`.trim(),
    },
    {
      icon: <EventRounded />,
      label: t('TRIAL.CONFIRM.WHEN'),
      value: `${formatSlot(slot.start_time, locale)} · ${t('TRIAL.CONFIRM.DURATION', { minutes: minutes || SLOT_MINUTES })}`,
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
      </div>

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
            disabled={bookTrial.isPending}
            onClick={book}
          >
            {bookTrial.isPending
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
