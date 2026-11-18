import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import { VisibilityRounded } from '@mui/icons-material';

import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import { useSignOut } from '../../hooks/useAuth';
import { getStaffView } from '../../lib/staff-view';
import './staff-banner.styles.scss';

/**
 * Shown on every page while staff are signed in as someone from the Admin
 * ("open as"), so nobody takes it for that person's own visit.
 */
const StaffBanner: FC = () => {
  const { t } = useTranslation();
  const currentUser = useAppSelector(selectCurrentUser);
  const signOut = useSignOut();
  const staff = getStaffView();
  if (!currentUser || !staff) return null;

  const name = [currentUser.first_name, currentUser.last_name]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="staff-banner" role="status">
      <VisibilityRounded className="staff-banner__icon" aria-hidden="true" />
      <p className="staff-banner__text">
        <strong>{t('STAFF_VIEW.TITLE', { name })}</strong>{' '}
        {t('STAFF_VIEW.TEXT')}
        {staff !== 'staff' && (
          <span className="staff-banner__who">
            {' '}
            {t('STAFF_VIEW.BY', { email: staff })}
          </span>
        )}
      </p>
      <Button
        size="small"
        variant="outlined"
        color="inherit"
        onClick={() => signOut.mutate()}
        className="staff-banner__leave"
      >
        {t('STAFF_VIEW.LEAVE')}
      </Button>
    </div>
  );
};

export default StaffBanner;
