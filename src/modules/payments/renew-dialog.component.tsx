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
  type CheckoutLine,
  type RenewalOption,
} from '../../hooks/usePayments';
import { formatMoney } from '../../lib/money';
import { blockedInApp } from '../../lib/from-app';
import { trackEvent } from '../../lib/analytics';
import { subjectName } from '../dashboard/dashboard.utils';
import './payments.styles.scss';

const LOCALES = { ar: arSA, en: enUS };

interface RenewDialogProps {
  packageId: number;
  /** When the caller already knows it: a group course is not sold from the app */
  packageType?: string | null;
  onClose: () => void;
  /** Offered when the package cannot be renewed online: the old request flow */
  onRequestInstead?: () => void;
}

/** What the payer is about to pay for: the price, its VAT and the total */
interface Charge {
  hours: number;
  price: number;
  vat: number;
  total: number;
}

/**
 * Renew one package. By default the same package again at the price paid
 * before (while the margin still allows it); a second button opens every
 * size on the price list, priced today. The Pay button sends the payer to
 * Nomod's hosted page; the webhook adds the hours and the return page shows
 * the outcome.
 */
const RenewDialog: FC<RenewDialogProps> = ({
  packageId,
  packageType,
  onClose,
  onRequestInstead,
}) => {
  const { t, i18n } = useTranslation();
  const locale = LOCALES[i18n.language as 'en' | 'ar'] ?? enUS;
  const quote = useRenewalOptions(packageId);
  const start = useStartCheckout();
  const [hours, setHours] = useState<number | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Opened from the app, a group course is the team's to sell
  const groupInApp = blockedInApp(packageType ?? quote.data?.package_type);
  const renewable = !!quote.data?.renewable && !groupInApp;

  const sameAgain = quote.data?.same_again ?? null;
  const options = quote.data?.options ?? [];
  // Without a same-again offer the list is the only view
  const listing = showOptions || sameAgain === null;

  // The size the package was bought at is picked first in the list
  useEffect(() => {
    if (hours !== null || options.length === 0) return;
    const current = options.find((option) => option.same_as_current);
    setHours((current ?? options[0]).hours);
  }, [options, hours]);

  const chosen = options.find((option) => option.hours === hours) ?? null;
  const charge: Charge | null = listing ? chosen : sameAgain;
  const line: CheckoutLine | null = listing
    ? chosen && { package_id: packageId, hours: chosen.hours, basis: 'list' }
    : { package_id: packageId, basis: 'original' };

  const currency = quote.data?.currency ?? 'AED';
  const money = (value: number) => formatMoney(value, currency, i18n.language);

  const pay = async () => {
    if (!line || !charge) return;
    setError(null);
    try {
      const payment = await start.mutateAsync({ lines: [line] });
      trackEvent('Payment', 'begin_checkout', payment.slug, payment.amount, {
        currency: payment.currency,
        hours: charge.hours,
        basis: line.basis,
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

  const renderSameAgain = () =>
    sameAgain && (
      <>
        <div className="renew-same">
          <span className="renew-same__label">
            {t('PAYMENTS.RENEW.SAME_AGAIN')}
          </span>
          <div className="renew-same__deal">
            <span>{t('PAYMENTS.RENEW.HOURS', { count: sameAgain.hours })}</span>
            <span>{money(sameAgain.price)}</span>
          </div>
          <p className="renew-same__hint">
            {t('PAYMENTS.RENEW.SAME_AGAIN_HINT')}
          </p>
        </div>
        <Button
          className="renew-switch"
          variant="text"
          onClick={() => setShowOptions(true)}
        >
          {t('PAYMENTS.RENEW.OTHER_OPTIONS')}
        </Button>
      </>
    );

  const renderListing = () => (
    <>
      <p className="renew-choose">{t('PAYMENTS.RENEW.CHOOSE')}</p>
      <ul className="renew-options">{options.map(renderOption)}</ul>
      {sameAgain && (
        <Button
          className="renew-switch"
          variant="text"
          onClick={() => setShowOptions(false)}
        >
          {t('PAYMENTS.RENEW.BACK_TO_SAME')}
        </Button>
      )}
    </>
  );

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

        {groupInApp && (
          <Alert severity="info">{t('PAYMENTS.GROUP_COURSE_SUPPORT')}</Alert>
        )}

        {quote.data && !quote.data.renewable && !groupInApp && (
          <Alert severity="info">
            <strong>{t('PAYMENTS.RENEW.NOT_RENEWABLE')}</strong>
            <ul className="renew-reasons">
              {quote.data.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </Alert>
        )}

        {renewable && quote.data && (
          <>
            {listing ? renderListing() : renderSameAgain()}
            {charge && (
              <dl className="renew-summary">
                <div>
                  <dt>{t('PAYMENTS.RENEW.HOURS', { count: charge.hours })}</dt>
                  <dd>{money(charge.price)}</dd>
                </div>
                {quote.data.vat_applies && (
                  <div>
                    <dt>
                      {t('PAYMENTS.RENEW.VAT', {
                        rate: quote.data.vat_rate_percent,
                      })}
                    </dt>
                    <dd>{money(charge.vat)}</dd>
                  </div>
                )}
                <div className="renew-summary__total">
                  <dt>{t('PAYMENTS.RENEW.TOTAL')}</dt>
                  <dd>{money(charge.total)}</dd>
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
        {quote.data && !renewable && onRequestInstead && (
          <Button variant="outlined" onClick={onRequestInstead}>
            {t('PAYMENTS.RENEW.ASK_INSTEAD')}
          </Button>
        )}
        {renewable && (
          <Button
            variant="contained"
            onClick={pay}
            disabled={!charge || start.isPending}
          >
            {charge
              ? t('PAYMENTS.RENEW.PAY', { amount: money(charge.total) })
              : t('PAYMENTS.RENEW.BUTTON')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default RenewDialog;
