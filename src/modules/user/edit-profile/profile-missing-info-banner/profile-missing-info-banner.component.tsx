import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

import { calculateMissingProfileInformation } from '../edit-profile.utils';

import './profile-missing-info-banner.styles.scss';

interface MissingProfileItem {
  text: string;
  bold?: boolean;
}

interface ProfileMissingInfoBannerProps {
  data: Record<string, any>;
  blockingMissingInfo: (flag: boolean) => void;
}

const ProfileMissingInfoBanner: React.FC<ProfileMissingInfoBannerProps> = ({
  data,
  blockingMissingInfo,
}) => {
  const { t } = useTranslation();
  const [missingProfileItems, setMissingProfileItems] = useState<
    MissingProfileItem[]
  >([]);

  useEffect(() => {
    const missingItems = calculateMissingProfileInformation(data);
    setMissingProfileItems(missingItems);

    const hasBoldItems = missingItems.some((item) => item.bold);
    blockingMissingInfo(hasBoldItems);
  }, [data, blockingMissingInfo]);

  return (
    <>
      {missingProfileItems.length > 0 && (
        <section className="profile-missing-info-banner">
          <HighlightOffIcon />
          <h4>{t('PROFILE.EDITPROFILE.MISSING_INFORMATION.TITLE')}</h4>
          <p>{t('PROFILE.EDITPROFILE.MISSING_INFORMATION.DESCRIPTION')}</p>
          <ul>
            {missingProfileItems.map((item) => (
              <li key={item.text} className={item.bold ? 'bold' : ''}>
                {t(item.text)}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
};

export default ProfileMissingInfoBanner;
