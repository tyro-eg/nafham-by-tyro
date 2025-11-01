import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import './trial-session-success-modal.styles.scss';

interface TrialSessionSuccessModalProps {
  onClose: () => void;
}

const TrialSessionSuccessModal: FC<TrialSessionSuccessModalProps> = ({
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
      <h4 className="trialSessionModal__title">
        {t('CHECKOUT.MODALS.TRIAL_SUCCESS.TITLE')}
      </h4>
      <p className="trialSessionModal__message">
        {t('CHECKOUT.MODALS.TRIAL_SUCCESS.MESSAGE')}
      </p>
      <Button
        className="trialSessionModal__button"
        variant="contained"
        color="primary"
        onClick={navigateToMySessions}
      >
        {t('CHECKOUT.MODALS.TRIAL_SUCCESS.BUTTON')}
      </Button>
    </div>
  );
};

export default TrialSessionSuccessModal;
