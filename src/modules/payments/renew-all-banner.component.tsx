import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button } from '@mui/material';
import { AutorenewRounded } from '@mui/icons-material';
import { useFamilyRenewalOptions } from '../../hooks/usePayments';

interface RenewAllBannerProps {
  onOpen: () => void;
}

/**
 * "N packages are low on hours, renew all": shown to a payer when two or
 * more running packages are due. One due package keeps the per-package
 * Renew button, so the banner stays quiet then.
 */
const RenewAllBanner: FC<RenewAllBannerProps> = ({ onOpen }) => {
  const { t } = useTranslation();
  const quote = useFamilyRenewalOptions();
  const due = quote.data?.due_count ?? 0;
  if (due < 2) return null;
  return (
    <Alert
      severity="warning"
      icon={<AutorenewRounded fontSize="inherit" />}
      action={
        <Button color="inherit" size="small" onClick={onOpen}>
          {t('PAYMENTS.RENEW_ALL.BANNER_ACTION')}
        </Button>
      }
      sx={{ mb: 2, borderRadius: '1.6rem' }}
    >
      {t('PAYMENTS.RENEW_ALL.BANNER', { count: due })}
    </Alert>
  );
};

export default RenewAllBanner;
