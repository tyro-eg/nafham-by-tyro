import { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  Skeleton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { LockRounded } from '@mui/icons-material';
import { parseISO, format } from 'date-fns';
import { arSA } from 'date-fns/locale/ar-SA';
import { enUS } from 'date-fns/locale/en-US';
import {
  errorStatus,
  paymentErrorMessage,
  useFamilyRenewalOptions,
  useStartCheckout,
  type CheckoutLine,
  type RenewalRow,
} from '../../hooks/usePayments';
import { formatMoney } from '../../lib/money';
import { trackEvent } from '../../lib/analytics';
import { subjectName } from '../dashboard/dashboard.utils';
import './payments.styles.scss';

const LOCALES = { ar: arSA, en: enUS };

interface RenewAllSheetProps {
  onClose: () => void;
  /** The old more-hours request, for a package that cannot be renewed online */
  onRequestInstead?: (packageId: number) => void;
}

/** What the parent picked for one row: whether it is in, and which deal */
interface Pick {
  ticked: boolean;
  hours: number;
}

/** The deal a row pays at for the picked hours */
interface Deal {
  hours: number;
  price: number;
  floor: number;
  basis: 'original' | 'list';
}

const dealOf = (row: RenewalRow, hours: number): Deal | null => {
  const same = row.same_again;
  if (same && same.hours === hours) {
    return {
      hours,
      price: same.price,
      floor: same.floor_price,
      basis: 'original',
    };
  }
  const option = row.options.find((o) => o.hours === hours);
  return option
    ? {
        hours,
        price: option.price,
        floor: option.floor_price,
        basis: 'list',
      }
    : null;
};

const defaultHours = (row: RenewalRow) =>
  row.same_again?.hours ?? row.options[0]?.hours ?? 0;

/**
 * Renew everything that is running low in one payment. One row per running
 * package, grouped by child; each keeps its size and price from last time
 * unless more hours are chosen. Four or more subjects earn the family
 * discount, line by line, never under the margin floor. One Pay button, the
 * usual hosted checkout and return page.
 */
const RenewAllSheet: FC<RenewAllSheetProps> = ({
  onClose,
  onRequestInstead,
}) => {
  const { t, i18n } = useTranslation();
  const locale = LOCALES[i18n.language as 'en' | 'ar'] ?? enUS;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const quote = useFamilyRenewalOptions();
  const start = useStartCheckout();
  const [picks, setPicks] = useState<Record<number, Pick>>({});
  const [error, setError] = useState<string | null>(null);

  const rows = useMemo(
    () => quote.data?.children.flatMap((child) => child.rows) ?? [],
    [quote.data],
  );

  // Due packages start ticked; every row starts on last time's size
  useEffect(() => {
    if (rows.length === 0 || Object.keys(picks).length > 0) return;
    const initial: Record<number, Pick> = {};
    rows.forEach((row) => {
      initial[row.package.id] = {
        ticked: row.renewable && row.due,
        hours: defaultHours(row),
      };
    });
    setPicks(initial);
  }, [rows, picks]);

  const currency = quote.data?.currency ?? 'AED';
  const money = (value: number) => formatMoney(value, currency, i18n.language);
  const bundle = quote.data?.bundle ?? { min_subjects: 4, discount_percent: 5 };
  const rate = bundle.discount_percent / 100;

  // The ticked rows with their deals, and the footer's arithmetic
  const basket = useMemo(() => {
    const lines = rows.flatMap((row) => {
      const pick = picks[row.package.id];
      if (!pick?.ticked || !row.renewable) return [];
      const deal = dealOf(row, pick.hours);
      return deal ? [{ row, deal }] : [];
    });
    const discounting = lines.length >= bundle.min_subjects;
    const priced = lines.map(({ row, deal }) => {
      const share = Math.floor(deal.price * rate * 100) / 100;
      const room = Math.max(deal.price - deal.floor, 0);
      const discount = discounting ? Math.min(share, room) : 0;
      return { row, deal, discount, net: deal.price - discount };
    });
    const subtotal = priced.reduce((sum, l) => sum + l.deal.price, 0);
    const discount = priced.reduce((sum, l) => sum + l.discount, 0);
    const net = subtotal - discount;
    const vat = quote.data?.vat_applies
      ? Math.round(net * quote.data.vat_rate_percent) / 100
      : 0;
    return {
      lines: priced,
      discounting,
      subtotal,
      discount,
      vat,
      total: net + vat,
    };
  }, [rows, picks, bundle.min_subjects, rate, quote.data]);

  const tooMany = quote.data
    ? basket.lines.length > quote.data.max_lines
    : false;

  const setTicked = (id: number, ticked: boolean) =>
    setPicks((prev) => ({ ...prev, [id]: { ...prev[id], ticked } }));
  const setHours = (id: number, hours: number) =>
    setPicks((prev) => ({
      ...prev,
      [id]: { ...prev[id], hours, ticked: true },
    }));

  const pay = async () => {
    if (basket.lines.length === 0 || tooMany) return;
    setError(null);
    const lines: CheckoutLine[] = basket.lines.map(({ row, deal }) =>
      deal.basis === 'original'
        ? { package_id: row.package.id, basis: 'original' }
        : { package_id: row.package.id, hours: deal.hours, basis: 'list' },
    );
    try {
      const payment = await start.mutateAsync({ lines, bundle: true });
      trackEvent('Payment', 'begin_checkout', payment.slug, payment.amount, {
        currency: payment.currency,
        subjects: lines.length,
        bundle: basket.discounting,
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

  const lessonDay = (iso: string) => format(parseISO(iso), 'PP', { locale });

  const renderRow = (row: RenewalRow) => {
    const id = row.package.id;
    const pick = picks[id] ?? { ticked: false, hours: defaultHours(row) };
    const deal = row.renewable ? dealOf(row, pick.hours) : null;
    const line = basket.lines.find((l) => l.row.package.id === id);
    const sizes = row.options.map((o) => o.hours);
    if (row.same_again && !sizes.includes(row.same_again.hours)) {
      sizes.unshift(row.same_again.hours);
    }
    return (
      <li
        key={id}
        className={`ra-row${pick.ticked && deal ? ' ra-row--on' : ''}${row.renewable ? '' : ' ra-row--off'}`}
      >
        <Checkbox
          className="ra-row__tick"
          checked={pick.ticked && !!deal}
          disabled={!row.renewable}
          onChange={(e) => setTicked(id, e.target.checked)}
          inputProps={{ 'aria-label': row.package.course_name }}
        />
        <div className="ra-row__text">
          <span className="ra-row__course" dir="auto">
            {subjectName(row.package.course_name)}
          </span>
          <span className="ra-row__meta">
            {row.package.tutor_name} ·{' '}
            {t('PAYMENTS.RENEW.LOW', { count: row.package.remaining_hours })}
            {row.scheduled_hours > 0 &&
              ` · ${t('PAYMENTS.RENEW_ALL.BOOKED', { count: row.scheduled_hours })}`}
            {row.last_session_on &&
              ` · ${t('PAYMENTS.RENEW_ALL.LAST_LESSON', { date: lessonDay(row.last_session_on) })}`}
          </span>
          <span className="ra-row__tags">
            {row.due && row.renewable && (
              <span className="renew-tag">{t('PAYMENTS.RENEW_ALL.DUE')}</span>
            )}
            {deal?.basis === 'original' && (
              <span className="renew-tag">
                {t('PAYMENTS.RENEW.SAME_AGAIN')}
              </span>
            )}
            {deal?.basis === 'list' && (
              <span className="renew-tag renew-tag--muted">
                {t('PAYMENTS.RENEW_ALL.TODAYS_PRICE')}
              </span>
            )}
            {!row.renewable && (
              <span className="renew-tag renew-tag--muted">
                {t('PAYMENTS.RENEW_ALL.NOT_ONLINE')}
              </span>
            )}
          </span>
        </div>
        <div className="ra-row__deal">
          {row.renewable ? (
            <>
              <Select
                size="small"
                className="ra-row__hours"
                value={pick.hours}
                onChange={(e) => setHours(id, Number(e.target.value))}
                aria-label={t('PAYMENTS.RENEW_ALL.MORE_HOURS')}
              >
                {sizes.map((hours) => (
                  <MenuItem key={hours} value={hours}>
                    {t('PAYMENTS.RENEW.HOURS', { count: hours })}
                  </MenuItem>
                ))}
              </Select>
              {deal && (
                <span className="ra-row__price">
                  {line && line.discount > 0 ? (
                    <>
                      <s>{money(deal.price)}</s> {money(line.net)}
                    </>
                  ) : (
                    money(deal.price)
                  )}
                  {line && basket.discounting && line.discount === 0 && (
                    <small>{t('PAYMENTS.RENEW_ALL.AT_FLOOR')}</small>
                  )}
                </span>
              )}
            </>
          ) : (
            onRequestInstead && (
              <Button size="small" onClick={() => onRequestInstead(id)}>
                {t('PAYMENTS.RENEW_ALL.REQUEST')}
              </Button>
            )
          )}
        </div>
      </li>
    );
  };

  const count = basket.lines.length;

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={fullScreen}
    >
      <DialogTitle>{t('PAYMENTS.RENEW_ALL.TITLE')}</DialogTitle>
      <DialogContent sx={{ display: 'grid', gap: 2, pt: '8px !important' }}>
        <p className="renew-for">{t('PAYMENTS.RENEW_ALL.INTRO')}</p>

        {quote.isLoading && (
          <>
            <Skeleton variant="rounded" height={72} />
            <Skeleton variant="rounded" height={72} />
            <Skeleton variant="rounded" height={72} />
          </>
        )}
        {quote.isError && (
          <Alert severity="error">
            {paymentErrorMessage(quote.error, t('FAMILY.ERROR'))}
          </Alert>
        )}
        {quote.data && rows.length === 0 && (
          <Alert severity="info">{t('PAYMENTS.RENEW_ALL.EMPTY')}</Alert>
        )}

        {quote.data?.children
          .filter((child) => child.rows.length > 0)
          .map((child) => (
            <section key={child.id} className="ra-child">
              {quote.data.children.length > 1 && (
                <h3 className="ra-child__name">{child.first_name}</h3>
              )}
              <ul className="ra-rows">{child.rows.map(renderRow)}</ul>
            </section>
          ))}

        {count > 0 && (
          <dl className="renew-summary">
            <div>
              <dt>
                {t('PAYMENTS.RENEW_ALL.SUBTOTAL')} ·{' '}
                {t('PAYMENTS.RENEW_ALL.SUBJECTS', { count })}
              </dt>
              <dd>{money(basket.subtotal)}</dd>
            </div>
            {basket.discounting && (
              <div className="renew-summary__discount">
                <dt>{t('PAYMENTS.RENEW_ALL.DISCOUNT', { count })}</dt>
                <dd>−{money(basket.discount)}</dd>
              </div>
            )}
            {quote.data?.vat_applies && (
              <div>
                <dt>
                  {t('PAYMENTS.RENEW.VAT', {
                    rate: quote.data.vat_rate_percent,
                  })}
                </dt>
                <dd>{money(basket.vat)}</dd>
              </div>
            )}
            <div className="renew-summary__total">
              <dt>{t('PAYMENTS.RENEW.TOTAL')}</dt>
              <dd>{money(basket.total)}</dd>
            </div>
          </dl>
        )}
        {count === bundle.min_subjects - 1 && (
          <Alert severity="info" icon={false}>
            {t('PAYMENTS.RENEW_ALL.DISCOUNT_HINT', {
              percent: bundle.discount_percent,
            })}
          </Alert>
        )}
        {tooMany && (
          <Alert severity="warning">
            {t('PAYMENTS.RENEW_ALL.TOO_MANY', { count: quote.data?.max_lines })}
          </Alert>
        )}
        {count > 0 && (
          <p className="renew-secure">
            <LockRounded fontSize="inherit" /> {t('PAYMENTS.RENEW.REDIRECT')}
          </p>
        )}
        {error && <Alert severity="error">{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('FAMILY.CANCEL')}</Button>
        <Button
          variant="contained"
          onClick={pay}
          disabled={count === 0 || tooMany || start.isPending}
        >
          {count > 0
            ? t('PAYMENTS.RENEW_ALL.PAY', { amount: money(basket.total) })
            : t('PAYMENTS.RENEW_ALL.TITLE')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RenewAllSheet;
