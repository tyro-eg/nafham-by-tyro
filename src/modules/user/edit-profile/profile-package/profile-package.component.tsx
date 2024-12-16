import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import './profile-package.styles.scss';

interface PackageData {
  id: string;
  type: string;
  rate: number;
  package_type: string;
  time_in_hours: number;
}

interface ProfilePackageProps {
  packageData?: PackageData;
  instructorId: string;
}

const ProfilePackage: React.FC<ProfilePackageProps> = ({
  packageData,
  instructorId,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const navigateToCheckout = () => {
    navigate(`/checkout?id=${instructorId}&course=false`);
  };

  if (!packageData || packageData.type === 'TrialPackage') {
    return null;
  }

  return (
    <div
      className={`profile-package ${
        packageData.type === 'DefaultPackage' ? 'popular' : ''
      }`}
    >
      {packageData.type === 'DefaultPackage' && (
        <p className="profile-package__badge">
          {t('PROFILE.PACKAGES.MOST_POPULAR')}
        </p>
      )}
      <p className="profile-package__rate">
        ${packageData.rate}{' '}
        <span className="profile-package__rate-perHour">
          {t('PROFILE.PACKAGES.PER_HOUR')}
        </span>
      </p>
      <div className="profile-package__minutes">
        {packageData.time_in_hours}{' '}
        {packageData.time_in_hours > 1
          ? t('PROFILE.PACKAGES.HOURS')
          : t('PROFILE.PACKAGES.HOUR')}
      </div>
      <div className="profile-package__save">
        <CheckCircleIcon color="primary" />
        <span className="profile-package__save-title">
          {t('PROFILE.PACKAGES.SAVE')}
        </span>
        20%
      </div>
      <Button
        className="profile-package__action"
        variant="contained"
        color="primary"
        onClick={navigateToCheckout}
      >
        {t('PROFILE.PACKAGES.BOOK_NOW')}
      </Button>
    </div>
  );
};

export default ProfilePackage;
