import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button } from '@mui/material';
import {
  paymentErrorMessage,
  useCancelPayment,
  useOpenPayments,
} from '../../hooks/usePayments';
import { formatMoney } from '../../lib/money';
import { snackActions } from '../../assets/utils/toaster';

/**
 * A checkout the payer started and did not finish (the browser came back
 * from Nomod's page without paying): offer to pick it up or let it go,
 * so a second ask for the same course is not refused as already pending.
 */
const OpenPaymentBanner: FC<{ enabled?: boolean }> = ({ enabled = true }) => {
  const { t, i18n } = useTranslation();
  const open = useOpenPayments(enabled);
  const cancel = useCancelPayment();
  const [busy, setBusy] = useState(false);
  const payment = open.data?.[0];
  if (!payment || !payment.open) return null;

  const drop = async () => {
    setBusy(true);
    try {
      await cancel.mutateAsync(payment.slug);
      snackActions.success(t('PAYMENTS.HISTORY.CANCELLED'));
    } catch (err) {
      snackActions.error(paymentErrorMessage(err, t('FAMILY.ERROR')));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Alert
      severity="warning"
      className="pay-open"
      sx={{ mb: 2 }}
      action={
        <>
          {payment.checkout_url && (
            <Button
              size="small"
              variant="contained"
              href={payment.checkout_url}
            >
              {t('PAYMENTS.OPEN.RESUME')}
            </Button>
          )}
          <Button size="small" disabled={busy} onClick={drop}>
            {t('PAYMENTS.OPEN.CANCEL')}
          </Button>
        </>
      }
    >
      {t('PAYMENTS.OPEN.TEXT', {
        amount: formatMoney(payment.amount, payment.currency, i18n.language),
      })}
    </Alert>
  );
};

export default OpenPaymentBanner;
