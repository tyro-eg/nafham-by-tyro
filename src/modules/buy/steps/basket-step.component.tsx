import { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
} from '@mui/material';
import {
  AddRounded,
  ArrowBackRounded,
  DeleteOutlineRounded,
  LockRounded,
} from '@mui/icons-material';

import {
  errorStatus,
  paymentErrorCode,
  paymentErrorDetails,
  paymentErrorMessage,
  useStartCheckout,
} from '../../../hooks/usePayments';
import { useAcceptTerms } from '../../../hooks/useFamily';
import { formatMoney } from '../../../lib/money';
import { trackEvent } from '../../../lib/analytics';
import {
  scheduleIsEmpty,
  scheduleSummary,
  type ScheduleWindow,
} from '../../../lib/weekly-schedule';
import { subjectName } from '../../dashboard/dashboard.utils';
import {
  MAX_LINES,
  basketTotals,
  toCheckoutLine,
  type BasketLine,
} from '../buy.types';

interface BasketStepProps {
  lines: BasketLine[];
  currency: string;
  vatApplies: boolean;
  vatRatePercent: number;
  /** A parent whose family has not accepted the current terms */
  termsPending: boolean;
  /** Nothing on file for the payer: ask once, the server remembers it */
  countryMissing: boolean;
  bundle: { minSubjects: number; discountPercent: number };
  onRemove: (key: string) => void;
  onAddAnother: () => void;
  onBack: () => void;
  onPaid: () => void;
}

/**
 * The basket: every course picked so far, grouped by child, the family
 * discount when there are enough subjects, VAT, and the one Pay button.
 * The server prices everything again and refuses when the total moved,
 * when a checkout for one of these courses is already open, when the
 * terms or the country are still missing; each refusal is shown with the
 * way out.
 */
const BasketStep: FC<BasketStepProps> = ({
  lines,
  currency,
  vatApplies,
  vatRatePercent,
  termsPending,
  countryMissing,
  bundle,
  onRemove,
  onAddAnother,
  onBack,
  onPaid,
}) => {
  const { t, i18n } = useTranslation();
  const locale = `${i18n.language}-u-nu-latn`;
  const start = useStartCheckout();
  const acceptTerms = useAcceptTerms();
  const [terms, setTerms] = useState(!termsPending);
  const [country, setCountry] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [newTotal, setNewTotal] = useState<number | null>(null);
  const [pending, setPending] = useState<{
    slug: string;
    url: string | null;
  } | null>(null);

  const money = (cents: number) =>
    formatMoney(cents / 100, currency, i18n.language);
  const totals = basketTotals(lines, bundle, vatApplies, vatRatePercent);
  const byChild = lines.reduce<Record<string, BasketLine[]>>((acc, line) => {
    (acc[line.studentName] ??= []).push(line);
    return acc;
  }, {});

  const windowLabel = (w: ScheduleWindow) => t(`BUY.WHEN.${w.toUpperCase()}`);
  const lessonsLabel = (n: number) => t('BUY.WHEN.LESSONS_COUNT', { count: n });

  const pay = async (expectedTotalCents: number) => {
    setError(null);
    setNewTotal(null);
    setPending(null);
    try {
      if (termsPending && !acceptTerms.isSuccess)
        await acceptTerms.mutateAsync();
      const payment = await start.mutateAsync({
        lines: lines.map(toCheckoutLine),
        bundle: lines.length > 1,
        expected_total_cents: expectedTotalCents,
        payer_country: countryMissing
          ? country.trim().toUpperCase()
          : undefined,
      });
      trackEvent('Payment', 'begin_checkout', payment.slug, payment.amount, {
        currency: payment.currency,
        lines: lines.length,
        kinds: lines.map((line) => line.choice.kind).join(','),
      });
      if (payment.checkout_url) {
        onPaid();
        window.location.assign(payment.checkout_url);
      } else {
        setError(t('PAYMENTS.RENEW.UNAVAILABLE'));
      }
    } catch (err) {
      const code = paymentErrorCode(err);
      if (code === 'price_changed') {
        const details = paymentErrorDetails<{ total_cents: number }>(err);
        setNewTotal(details?.total_cents ?? null);
      } else if (code === 'already_pending') {
        const details = paymentErrorDetails<{
          payment_slug: string;
          checkout_url: string | null;
        }>(err);
        if (details)
          setPending({ slug: details.payment_slug, url: details.checkout_url });
      }
      setError(
        errorStatus(err) === 503
          ? t('PAYMENTS.RENEW.UNAVAILABLE')
          : paymentErrorMessage(err, t('FAMILY.ERROR')),
      );
    }
  };

  const canPay =
    lines.length > 0 &&
    lines.length <= MAX_LINES &&
    terms &&
    (!countryMissing || country.trim().length === 2) &&
    !start.isPending;

  return (
    <div className="trial__step">
      <h2 className="trial__step-title">{t('BUY.BASKET.TITLE')}</h2>

      {lines.length === 0 && (
        <div className="trial__empty-box">
          <p className="trial__empty">{t('BUY.BASKET.EMPTY')}</p>
        </div>
      )}

      {Object.entries(byChild).map(([name, group]) => (
        <section key={name} className="buy-basket__group">
          <h3 className="buy-basket__child">{name}</h3>
          <ul className="buy-basket__lines">
            {group.map((line) => {
              const perLine = totals.perLine.find((p) => p.key === line.key);
              const who =
                line.choice.kind === 'match'
                  ? t('BUY.BASKET.LINE_MATCH')
                  : line.choice.kind === 'renewal'
                    ? t('BUY.BASKET.LINE_RENEWAL', {
                        name: line.choice.tutorName,
                      })
                    : t('BUY.BASKET.LINE_TUTOR', {
                        name: line.choice.tutorName,
                      });
              return (
                <li key={line.key} className="buy-line">
                  <div className="buy-line__main">
                    <span className="buy-line__course" dir="auto">
                      {t('PAYMENTS.RENEW.HOURS', { count: line.hours })} ·{' '}
                      {subjectName(line.courseName)}
                      {line.examBoardName &&
                      !line.courseName.includes(line.examBoardName)
                        ? ` · ${line.examBoardName}`
                        : ''}
                    </span>
                    <span className="buy-line__meta" dir="auto">
                      {who}
                      {!scheduleIsEmpty(line.schedule) &&
                        ` · ${scheduleSummary(line.schedule, locale, {
                          window: windowLabel,
                          lessons: lessonsLabel,
                        })}`}
                    </span>
                  </div>
                  <span className="buy-line__price">
                    {perLine && perLine.discount > 0 ? (
                      <>
                        <s>{money(Math.round(line.price * 100))}</s>{' '}
                        {money(perLine.price)}
                      </>
                    ) : (
                      money(Math.round(line.price * 100))
                    )}
                  </span>
                  <Button
                    size="small"
                    variant="text"
                    color="error"
                    startIcon={<DeleteOutlineRounded />}
                    onClick={() => onRemove(line.key)}
                  >
                    {t('BUY.BASKET.REMOVE')}
                  </Button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {lines.length > 0 && lines.length < MAX_LINES && (
        <Button
          className="trial__link buy-basket__another"
          variant="text"
          startIcon={<AddRounded />}
          onClick={onAddAnother}
        >
          {t('BUY.ACTIONS.ANOTHER')}
        </Button>
      )}
      {lines.length >= MAX_LINES && (
        <Alert severity="info">
          {t('BUY.BASKET.TOO_MANY', { count: MAX_LINES })}
        </Alert>
      )}

      {lines.length > 0 && (
        <dl className="renew-summary">
          <div>
            <dt>{t('BUY.BASKET.SUBTOTAL')}</dt>
            <dd>{money(totals.subtotalCents + totals.discountCents)}</dd>
          </div>
          {totals.discounting && (
            <div className="renew-summary__discount">
              <dt>{t('BUY.BASKET.DISCOUNT', { count: lines.length })}</dt>
              <dd>−{money(totals.discountCents)}</dd>
            </div>
          )}
          {!totals.discounting && lines.length === bundle.minSubjects - 1 && (
            <div>
              <dt className="buy-basket__hint">
                {t('BUY.BASKET.DISCOUNT_HINT', {
                  percent: bundle.discountPercent,
                })}
              </dt>
              <dd />
            </div>
          )}
          {vatApplies && (
            <div>
              <dt>{t('PAYMENTS.RENEW.VAT', { rate: vatRatePercent })}</dt>
              <dd>{money(totals.vatCents)}</dd>
            </div>
          )}
          <div className="renew-summary__total">
            <dt>{t('PAYMENTS.RENEW.TOTAL')}</dt>
            <dd>{money(totals.totalCents)}</dd>
          </div>
        </dl>
      )}

      {countryMissing && lines.length > 0 && (
        <TextField
          label={t('BUY.BASKET.COUNTRY')}
          helperText={t('BUY.BASKET.COUNTRY_HINT')}
          value={country}
          onChange={(event) => setCountry(event.target.value.slice(0, 2))}
          inputProps={{
            maxLength: 2,
            dir: 'ltr',
            style: { textTransform: 'uppercase' },
          }}
          sx={{ maxWidth: 240 }}
        />
      )}

      {termsPending && lines.length > 0 && (
        <FormControlLabel
          control={
            <Checkbox
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
            />
          }
          label={
            <span>
              {t('BUY.BASKET.TERMS')}{' '}
              <Link to="/terms" target="_blank" rel="noreferrer">
                {t('BUY.BASKET.TERMS_LINK')}
              </Link>
            </span>
          }
        />
      )}

      {error && newTotal === null && !pending && (
        <Alert severity="error">{error}</Alert>
      )}

      {newTotal !== null && (
        <Alert
          severity="warning"
          action={
            <Button
              size="small"
              onClick={() => pay(newTotal)}
              disabled={start.isPending}
            >
              {t('BUY.BASKET.PAY_NEW', { amount: money(newTotal) })}
            </Button>
          }
        >
          {t('BUY.BASKET.PRICE_CHANGED', { amount: money(newTotal) })}
        </Alert>
      )}

      {pending && (
        <Alert
          severity="warning"
          action={
            <>
              {pending.url && (
                <Button size="small" href={pending.url}>
                  {t('BUY.BASKET.RESUME')}
                </Button>
              )}
              <Button size="small" component={Link} to="/payments">
                {t('BUY.BASKET.CANCEL_OPEN')}
              </Button>
            </>
          }
        >
          {t('BUY.BASKET.PENDING_OPEN')}
        </Alert>
      )}

      {lines.length > 0 && (
        <p className="renew-secure">
          <LockRounded fontSize="inherit" /> {t('BUY.BASKET.REDIRECT')}
        </p>
      )}

      <div className="trial__actions">
        <Button
          className="trial__back"
          variant="outlined"
          startIcon={<ArrowBackRounded />}
          onClick={onBack}
        >
          {t('BUY.ACTIONS.BACK')}
        </Button>
        <Button
          className="trial__cta trial__cta--gold"
          variant="contained"
          disabled={!canPay}
          onClick={() => pay(totals.totalCents)}
        >
          {t('BUY.ACTIONS.PAY', { amount: money(totals.totalCents) })}
        </Button>
      </div>
    </div>
  );
};

export default BasketStep;
