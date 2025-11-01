import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
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
      <p className="u-font-weight-bold">
        {t('PROFILE.STUDENTMODAL.BODYMESS1')}.
      </p>
      <p>{t('PROFILE.STUDENTMODAL.BODYMESS2')}.</p>
      <div className="calendar-actions__container">
        <Button
          className="calendar-actions__button"
          color="primary"
          variant="contained"
          onClick={goToMySessions}
        >
          {t('PROFILE.STUDENTMODAL.ACTIONS.MYSESSIONS')}
        </Button>

        <Button
          className="calendar-actions__button calendar-actions__button-secondary"
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
