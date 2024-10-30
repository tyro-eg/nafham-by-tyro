import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import SuccessGif from '../../assets/images/success.gif';

interface TrialBookingSuccessModalProps {
  handleClose: () => void;
}

const TrialBookingSuccessModal: React.FC<TrialBookingSuccessModalProps> = ({
  handleClose,
}) => {
  const { t } = useTranslation();

  return (
    <div className="trialBookingModal__wrapper">
      <img src={SuccessGif} alt="Success" />
      <p>{t('CALENDAR.SUCCESSMODAL.MESSAGE')}</p>
      <Button
        variant="contained"
        color="primary"
        onClick={handleClose}
        sx={{
          marginTop: 2,
          textTransform: 'none',
        }}
      >
        {t('CALENDAR.SUCCESSMODAL.OK')}
      </Button>
    </div>
  );
};

export default TrialBookingSuccessModal;
