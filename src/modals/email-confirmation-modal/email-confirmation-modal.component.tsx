import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';

import './email-confirmation-modal.styles.scss';

interface EmailConfirmationModalProps {
  email: string;
  onClose: () => void;
}

const EmailConfirmationModal: FC<EmailConfirmationModalProps> = ({
  email,
  onClose,
}) => {
  const { t } = useTranslation();

  const handleConfirm = () => {
    // TODO: Implement email confirmation resend API call
    // When backend is ready, use: useResendEmailConfirmation hook
    onClose();
  };

  return (
    <div className="email-confirm">
      <div>
        <h5>
          {t('EMAIL_CONFIRMATION.MESSAGE')} <b>{email}</b>
        </h5>
      </div>

      <div className="button-wrapper">
        <Button
          className="button-wrapper__action"
          variant="contained"
          color="error"
          onClick={onClose}
        >
          {t('MODALS.ACTIONS.CANCEL')}
        </Button>
        <Button
          className="button-wrapper__action"
          variant="contained"
          color="primary"
          onClick={handleConfirm}
        >
          {t('EMAIL_CONFIRMATION.SEND')}
        </Button>
      </div>
    </div>
  );
};

export default EmailConfirmationModal;
