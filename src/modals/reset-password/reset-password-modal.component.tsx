import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import { LockReset, MailOutline, WhatsApp } from '@mui/icons-material';

import './reset-password-modal.styles.scss';

interface ResetPasswordModalProps {
  handleClose: () => void;
}

const SUPPORT_WHATSAPP = 'https://wa.me/971507105394';
const SUPPORT_EMAIL = 'mailto:learn@nafhambytyro.com';

/**
 * "Forgot password?": the server has no self-service reset yet, so this says
 * how to get a new password. Support sends one from the Admin ("New
 * password"), and the old one stops working at once.
 */
const ResetPasswordModal: FC<ResetPasswordModalProps> = ({ handleClose }) => {
  const { t } = useTranslation();

  return (
    <div className="forget-password">
      <div className="forget-password__icon">
        <LockReset />
      </div>
      <h2 className="forget-password__title">{t('FORGET_PASSWORD.TITLE')}</h2>
      <div className="forget-password__description">
        <p className="title">{t('FORGET_PASSWORD.ASK_SUPPORT')}</p>
        <p className="title">{t('FORGET_PASSWORD.OLD_STOPS')}</p>
      </div>
      <div className="forget-password__actions">
        <Button
          variant="contained"
          startIcon={<WhatsApp />}
          href={SUPPORT_WHATSAPP}
          target="_blank"
          rel="noopener noreferrer"
          fullWidth
        >
          {t('FORGET_PASSWORD.WHATSAPP')}
        </Button>
        <Button
          variant="outlined"
          startIcon={<MailOutline />}
          href={SUPPORT_EMAIL}
          fullWidth
        >
          {t('FORGET_PASSWORD.EMAIL')}
        </Button>
        <Button variant="text" onClick={handleClose}>
          {t('FORGET_PASSWORD.CLOSE')}
        </Button>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
