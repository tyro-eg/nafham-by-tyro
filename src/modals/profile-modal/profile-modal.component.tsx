import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import { EventAvailable } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import './profile-modal.styles.scss';

interface ProfileModalProps {
  instructorId: string;
}

const ProfileModal: FC<ProfileModalProps> = ({ instructorId }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const goToMySessions = () => {
    navigate('/my_sessions');
  };

  const goToCheckout = () => {
    navigate(`/checkout?id=${instructorId}&course=false`);
  };

  return (
    <div className="profile-modal">
      <div className="profile-modal__icon">
        <EventAvailable />
      </div>
      <h4 className="profile-modal__title">
        {t('PROFILE.STUDENTMODAL.BODYMESS1')}.
      </h4>
      <p className="profile-modal__text">
        {t('PROFILE.STUDENTMODAL.BODYMESS2')}.
      </p>
      <div className="calendar-actions__container">
        <Button
          className="calendar-actions__button"
          variant="outlined"
          onClick={goToMySessions}
        >
          {t('PROFILE.STUDENTMODAL.ACTIONS.MYSESSIONS')}
        </Button>

        <Button
          className="calendar-actions__button"
          color="primary"
          variant="contained"
          onClick={goToCheckout}
        >
          {t('PROFILE.STUDENTMODAL.ACTIONS.CHECKOUT')}
        </Button>
      </div>
    </div>
  );
};

export default ProfileModal;
