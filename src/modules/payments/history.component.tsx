import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Chip, Skeleton } from '@mui/material';
import { ReceiptLongRounded } from '@mui/icons-material';
import { parseISO, format } from 'date-fns';
import { arSA } from 'date-fns/locale/ar-SA';
import { enUS } from 'date-fns/locale/en-US';
import {
  paymentErrorMessage,
  useCancelPayment,
  usePayments,
  type Payment,
} from '../../hooks/usePayments';
import { formatMoney } from '../../lib/money';
import { snackActions } from '../../assets/utils/toaster';
import { subjectName } from '../dashboard/dashboard.utils';
import './payments.styles.scss';

const LOCALES = { ar: arSA, en: enUS };

const CHIP_COLOR: Record<
  string,
  'default' | 'success' | 'warning' | 'error' | 'info'
> = {
  fulfilled: 'success',
  paid: 'info',
  pending: 'warning',
  created: 'warning',
  needs_review: 'info',
  failed: 'error',
  cancelled: 'default',
  expired: 'default',
  refunded: 'info',
  partially_refunded: 'info',
  disputed: 'error',
};

/** The payer's receipts: what was paid, when, and anything still open */
const PaymentsHistory: FC = () => {
  const { t, i18n } = useTranslation();
  const locale = LOCALES[i18n.language as 'en' | 'ar'] ?? enUS;
  const payments = usePayments();
  const cancel = useCancelPayment();
  const [busy, setBusy] = useState<string | null>(null);

  const when = (iso: string) => format(parseISO(iso), 'PPp', { locale });

  const cancelPayment = async (payment: Payment) => {
    setBusy(payment.slug);
    try {
      await cancel.mutateAsync(payment.slug);
      snackActions.success(t('PAYMENTS.HISTORY.CANCELLED'));
    } catch (err) {
      snackActions.error(paymentErrorMessage(err, t('FAMILY.ERROR')));
    } finally {
      setBusy(null);
    }
  };

  return (
    <main className="pay-history">
      <header className="pay-history__head">
        <h1>{t('PAYMENTS.TITLE')}</h1>
        <p>{t('PAYMENTS.SUBTITLE')}</p>
      </header>

      {payments.isLoading && (
        <div className="pay-history__list">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} variant="rounded" height={88} />
          ))}
        </div>
      )}

      {payments.isError && (
        <p className="pay-history__empty">
          {paymentErrorMessage(payments.error, t('FAMILY.ERROR'))}
        </p>
      )}

      {payments.data?.length === 0 && (
        <div className="pay-history__empty">
          <ReceiptLongRounded />
          <p>{t('PAYMENTS.EMPTY')}</p>
        </div>
      )}

      {!!payments.data?.length && (
        <ul className="pay-history__list">
          {payments.data.map((payment) => (
            <li key={payment.id} className="pay-row">
              <div className="pay-row__main">
                <span className="pay-row__when">
                  {when(payment.created_at)}
                </span>
                <ul className="pay-row__lines">
                  {payment.lines.map((line) => (
                    <li key={line.id} dir="auto">
                      {t('PAYMENTS.HISTORY.LINE', {
                        hours: line.hours,
                        course: subjectName(line.course_name),
                        student: line.student_first_name,
                      })}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pay-row__side">
                <span className="pay-row__amount">
                  {formatMoney(payment.amount, payment.currency, i18n.language)}
                </span>
                <Chip
                  size="small"
                  color={CHIP_COLOR[payment.status] ?? 'default'}
                  label={t(`PAYMENTS.STATUS.${payment.status}`)}
                />
                {payment.open && payment.checkout_url && (
                  <div className="pay-row__actions">
                    <Button
                      size="small"
                      variant="contained"
                      href={payment.checkout_url}
                    >
                      {t('PAYMENTS.HISTORY.RESUME')}
                    </Button>
                    <Button
                      size="small"
                      variant="text"
                      disabled={busy === payment.slug}
                      onClick={() => cancelPayment(payment)}
                    >
                      {t('PAYMENTS.HISTORY.CANCEL')}
                    </Button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default PaymentsHistory;
