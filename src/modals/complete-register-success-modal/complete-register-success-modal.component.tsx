import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';

import './complete-register-success-modal.styles.scss';

interface CompleteRegisterSuccessModalProps {
  onClose: () => void;
}

const CompleteRegisterSuccessModal: FC<CompleteRegisterSuccessModalProps> = ({
  onClose,
}) => {
  const { t } = useTranslation();

  return (
    <div className="completeRegisterModal__wrapper">
      <img
        src="https://tyro-app.s3-eu-west-1.amazonaws.com/checkout/Payment+Successful!%403x.png"
        alt="Success"
      />
      <h4 className="u-font-weight-bold">
        {t('CHECKOUT.MODALS.COMPLETE_REGISTER.TITLE')}
      </h4>
      <p className="u-font-size-16">
        {t('CHECKOUT.MODALS.COMPLETE_REGISTER.MESSAGE')}
      </p>
      <Button
        className="completeRegisterModal__btn"
        variant="contained"
        color="primary"
        onClick={onClose}
      >
        {t('CHECKOUT.MODALS.COMPLETE_REGISTER.BUTTON')}
      </Button>
    </div>
  );
};

export default CompleteRegisterSuccessModal;
