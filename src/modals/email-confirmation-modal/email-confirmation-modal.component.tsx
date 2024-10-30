import React from 'react';
import { Button } from '@mui/material';

import './email-confirmation-modal.styles.scss';
interface EmailConfirmationModalProps {
  email: string;
  onClose: () => void;
}

const EmailConfirmationModal: React.FC<EmailConfirmationModalProps> = ({
  email,
  onClose,
}) => {
  const confirm = () => {};
  return (
    <div className="email-confirm">
      <div>
        <h5>
          Are you sure you want to resend the confirmation email to your email:{' '}
          <b>{email}</b>
        </h5>
      </div>

      <div className="button-wrapper">
        <Button
          className="button-wrapper__action"
          variant="contained"
          color="error"
          onClick={onClose}
        >
          Close
        </Button>
        <Button
          className="button-wrapper__action"
          variant="contained"
          color="primary"
          onClick={confirm}
        >
          Send Confirmation
        </Button>
      </div>
    </div>
  );
};

export default EmailConfirmationModal;
