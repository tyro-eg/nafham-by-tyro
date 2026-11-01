import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Skeleton,
} from '@mui/material';
import { LockRounded } from '@mui/icons-material';
import { parseISO, format } from 'date-fns';
import { arSA } from 'date-fns/locale/ar-SA';
import { enUS } from 'date-fns/locale/en-US';
import {
  errorStatus,
  paymentErrorMessage,
  useRenewalOptions,
  useStartCheckout,
  type RenewalOption,
} from '../../hooks/usePayments';
import { formatMoney } from '../../lib/money';
import { trackEvent } from '../../lib/analytics';
import { subjectName } from '../dashboard/dashboard.utils';
import './payments.styles.scss';

const LOCALES = { ar: arSA, en: enUS };

interface RenewDialogProps {
  packageId: number;
  onClose: () => void;
  /** Offered when the package cannot be renewed online: the old request flow */
  onRequestInstead?: () => void;
}

/**
 * Renew one package: every size on the price list, priced today, VAT when it
 * applies, and a Pay button that sends the payer to Nomod's hosted page.
 * The webhook adds the hours; the return page shows the outcome.
 */
const RenewDialog: FC<RenewDialogProps> = ({
  packageId,
  onClose,
  onRequestInstead,
}) => {
  const { t, i18n } = useTranslation();
  const locale = LOCALES[i18n.language as 'en' | 'ar'] ?? enUS;
  const quote = useRenewalOptions(packageId);
  const start = useStartCheckout();
  const [hours, setHours] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const options = quote.data?.options ?? [];
  // The size the package was bought at is picked first
  useEffect(() => {
    if (hours !== null || options.length === 0) return;
    const current = options.find((option) => option.same_as_current);
    setHours((current ?? options[0]).hours);
  }, [options, hours]);

  const chosen = options.find((option) => option.hours === hours) ?? null;
  const currency = quote.data?.currency ?? 'AED';
  const money = (value: number) => formatMoney(value, currency, i18n.language);

  const pay = async () => {
    if (!chosen || !quote.data) return;
    setError(null);
    try {
      const payment = await start.mutateAsync([
        { package_id: packageId, hours: chosen.hours },
      ]);
      trackEvent('Payment', 'begin_checkout', payment.slug, payment.amount, {
        currency: payment.currency,
        hours: chosen.hours,
      });
      if (payment.checkout_url) {
        window.location.assign(payment.checkout_url);
      } else {
        setError(t('PAYMENTS.RENEW.UNAVAILABLE'));
      }
    } catch (err) {
      setError(
        errorStatus(err) === 503
          ? t('PAYMENTS.RENEW.UNAVAILABLE')
          : paymentErrorMessage(err, t('FAMILY.ERROR')),
      );
    }
  };

  const offerDay = (iso: string) => format(parseISO(iso), 'PP', { locale });

  const renderOption = (option: RenewalOption) => {
    const selected = option.hours === hours;
    return (
      <li key={option.hours}>
        <button
          type="button"
          className={`renew-option${selected ? ' renew-option--on' : ''}`}
          onClick={() => setHours(option.hours)}
          aria-pressed={selected}
        >
          <span className="renew-option__hours">
            {t('PAYMENTS.RENEW.HOURS', { count: option.hours })}
          </span>
          <span className="renew-option__price">
            {money(option.price)}
            {option.saving > 0 && (
              <s className="renew-option__list">{money(option.list_price)}</s>
            )}
          </span>
          <span className="renew-option__tags">
            {option.same_as_current && (
              <span className="renew-tag">{t('PAYMENTS.RENEW.CURRENT')}</span>
            )}
            {option.saving > 0 && (
              <span className="renew-tag renew-tag--save">
                {t('PAYMENTS.RENEW.SAVE', { amount: money(option.saving) })}
              </span>
            )}
            {option.offer_until && (
              <span className="renew-option__until">
                {t('PAYMENTS.RENEW.OFFER_UNTIL', {
                  date: offerDay(option.offer_until),
                })}
              </span>
            )}
          </span>
        </button>
      </li>
    );
  };

  const pkg = quote.data?.package;

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {pkg
          ? t('PAYMENTS.RENEW.TITLE', { course: subjectName(pkg.course_name) })
          : t('PAYMENTS.RENEW.BUTTON')}
      </DialogTitle>
      <DialogContent sx={{ display: 'grid', gap: 2, pt: '8px !important' }}>
        {pkg && (
          <p className="renew-for" dir="auto">
            {t('PAYMENTS.RENEW.FOR', {
              name: pkg.student_first_name,
              tutor: pkg.tutor_name,
            })}{' '}
            · {t('PAYMENTS.RENEW.LOW', { count: pkg.remaining_hours })}
          </p>
        )}

        {quote.isLoading && (
          <>
            <Skeleton variant="rounded" height={64} />
            <Skeleton variant="rounded" height={64} />
            <Skeleton variant="rounded" height={64} />
          </>
        )}

        {quote.isError && (
          <Alert severity="error">
            {paymentErrorMessage(quote.error, t('FAMILY.ERROR'))}
          </Alert>
        )}

        {quote.data && !quote.data.renewable && (
          <Alert severity="info">
            <strong>{t('PAYMENTS.RENEW.NOT_RENEWABLE')}</strong>
            <ul className="renew-reasons">
              {quote.data.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </Alert>
        )}

        {quote.data?.renewable && (
          <>
            <p className="renew-choose">{t('PAYMENTS.RENEW.CHOOSE')}</p>
            <ul className="renew-options">{options.map(renderOption)}</ul>
            {chosen && (
              <dl className="renew-summary">
                <div>
                  <dt>{t('PAYMENTS.RENEW.HOURS', { count: chosen.hours })}</dt>
                  <dd>{money(chosen.price)}</dd>
                </div>
                {quote.data.vat_applies && (
                  <div>
                    <dt>
                      {t('PAYMENTS.RENEW.VAT', {
                        rate: quote.data.vat_rate_percent,
                      })}
                    </dt>
                    <dd>{money(chosen.vat)}</dd>
                  </div>
                )}
                <div className="renew-summary__total">
                  <dt>{t('PAYMENTS.RENEW.TOTAL')}</dt>
                  <dd>{money(chosen.total)}</dd>
                </div>
              </dl>
            )}
            <p className="renew-secure">
              <LockRounded fontSize="inherit" /> {t('PAYMENTS.RENEW.REDIRECT')}
            </p>
          </>
        )}

        {error && <Alert severity="error">{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('FAMILY.CANCEL')}</Button>
        {quote.data && !quote.data.renewable && onRequestInstead && (
          <Button variant="outlined" onClick={onRequestInstead}>
            {t('PAYMENTS.RENEW.ASK_INSTEAD')}
          </Button>
        )}
        {quote.data?.renewable && (
          <Button
            variant="contained"
            onClick={pay}
            disabled={!chosen || start.isPending}
          >
            {chosen
              ? t('PAYMENTS.RENEW.PAY', { amount: money(chosen.total) })
              : t('PAYMENTS.RENEW.BUTTON')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default RenewDialog;
