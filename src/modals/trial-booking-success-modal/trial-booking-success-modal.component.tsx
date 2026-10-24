import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import SuccessGif from '../../assets/images/success.gif';

import './trial-booking-success-modal.styles.scss';

interface TrialBookingSuccessModalProps {
  handleClose: () => void;
}

const TrialBookingSuccessModal: FC<TrialBookingSuccessModalProps> = ({
  handleClose,
}) => {
  const { t } = useTranslation();

  return (
    <div className="trialBookingModal__wrapper">
      <img src={SuccessGif} alt="Success" />
      <h4 className="success-title">{t('CALENDAR.SUCCESSMODAL.MESSAGE')}</h4>
      <Button
        variant="contained"
        color="primary"
        size="large"
        fullWidth
        onClick={handleClose}
      >
        {t('CALENDAR.SUCCESSMODAL.OK')}
      </Button>
    </div>
  );
};

export default TrialBookingSuccessModal;
