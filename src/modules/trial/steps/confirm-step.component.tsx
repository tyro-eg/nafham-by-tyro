import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  TextField,
} from '@mui/material';
import { ArrowBack, CardGiftcardRounded } from '@mui/icons-material';

import type { GradeSubject } from '../../../assets/types';
import type { TrialSlot, TrialTutor } from '../../../hooks/useTrial';
import {
  bookingErrorMessage,
  useBookTrialSession,
} from '../../../hooks/useSessions';
import RegisterModal from '../../../modals/register-modal/register-modal.component';
import LoginModal from '../../../modals/login-modal/login-modal.component';
import { formatSlot } from '../trial.types';

interface ConfirmStepProps {
  course?: GradeSubject;
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
      });
      onBooked();
    } catch (err) {
      setError(bookingErrorMessage(err, t('TRIAL.ERROR')));
    }
  };

  return (
    <div className="trial__step">
      <h2 className="trial__step-title">{t('TRIAL.CONFIRM.TITLE')}</h2>
      <dl className="trial__summary">
        <dt>{t('TRIAL.CONFIRM.COURSE')}</dt>
        <dd>{course.full_course_name}</dd>
        <dt>{t('TRIAL.CONFIRM.TUTOR')}</dt>
        <dd>{`${tutor.first_name} ${tutor.last_name}`.trim()}</dd>
        <dt>{t('TRIAL.CONFIRM.WHEN')}</dt>
        <dd>
          {formatSlot(slot.start_time, locale)} ·{' '}
          {t('TRIAL.CONFIRM.DURATION', { minutes: minutes || SLOT_MINUTES })}
        </dd>
      </dl>

      <TextField
        className="trial__guardian"
        size="small"
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

      {!signedIn && <p className="trial__hint">{t('TRIAL.CONFIRM.VISITOR')}</p>}

      <div className="trial__actions">
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={onBack}>
          {t('TRIAL.ACTIONS.BACK')}
        </Button>
        {signedIn ? (
          <Button
            variant="contained"
            color="primary"
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
            <Button variant="text" onClick={() => setAuth('login')}>
              {t('TRIAL.CONFIRM.LOGIN')}
            </Button>
            <Button
              variant="contained"
              color="primary"
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
