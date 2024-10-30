import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface TrialSessionSuccessModalProps {
  onClose: () => void;
}

const TrialSessionSuccessModal: React.FC<TrialSessionSuccessModalProps> = ({
  onClose,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const navigateToMySessions = () => {
    onClose();
    navigate('/my_sessions');
  };

  return (
    <div className="trialSessionModal__wrapper">
      <img
        src="https://tyro-app.s3-eu-west-1.amazonaws.com/checkout/Payment+Successful!%403x.png"
        alt="Success"
      />
      <h4 style={{ fontWeight: 'bold' }}>
        {t('CHECKOUT.MODALS.TRIAL_SUCCESS.TITLE')}
      </h4>
      <p style={{ fontSize: '16px' }}>
        {t('CHECKOUT.MODALS.TRIAL_SUCCESS.MESSAGE')}
      </p>
      <Button
        variant="contained"
        color="primary"
        onClick={navigateToMySessions}
        sx={{
          marginTop: 2,
          textTransform: 'none',
        }}
      >
        {t('CHECKOUT.MODALS.TRIAL_SUCCESS.BUTTON')}
      </Button>
    </div>
  );
};

export default TrialSessionSuccessModal;
