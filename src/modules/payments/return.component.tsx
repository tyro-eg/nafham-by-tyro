import { FC, useEffect, useRef } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, CircularProgress } from '@mui/material';
import {
  CheckCircleRounded,
  ErrorOutlineRounded,
  HourglassTopRounded,
  LockRounded,
} from '@mui/icons-material';
import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import {
  errorStatus,
  usePayment,
  type Payment,
  type PaymentStatus,
} from '../../hooks/usePayments';
import { formatMoney } from '../../lib/money';
import { trackPurchase } from '../../lib/analytics';
import './payments.styles.scss';

type Tone = 'wait' | 'good' | 'bad' | 'info';

const TONES: Record<PaymentStatus, Tone> = {
  created: 'wait',
  pending: 'wait',
  paid: 'wait',
  fulfilled: 'good',
  needs_review: 'info',
  failed: 'bad',
  cancelled: 'bad',
  expired: 'bad',
  refunded: 'info',
  partially_refunded: 'info',
  disputed: 'info',
};

/**
 * Where Nomod sends the payer back. The `outcome` in the URL is only a hint
 * for the first paint: the page polls the payment until the webhook (or the
 * backend's own check with Nomod) has settled it.
 */
const PaymentReturn: FC = () => {
  const { t, i18n } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [params] = useSearchParams();
  const outcome = params.get('outcome');
  const currentUser = useAppSelector(selectCurrentUser);
  const signedIn = !!currentUser;
  const payment = usePayment(slug, signedIn);
  const tracked = useRef(false);

  // One purchase event per fulfilled payment seen here
  useEffect(() => {
    const data = payment.data;
    if (!data || data.status !== 'fulfilled' || tracked.current) return;
    tracked.current = true;
    trackPurchase(
      data.slug,
      data.amount,
      data.currency,
      data.lines.map((line) => ({
        item_id: `package-${line.package_id ?? line.id}`,
        item_name: `${line.hours}h ${line.course_name}`,
        price: line.price,
        quantity: 1,
        item_category: 'renewal',
      })),
    );
  }, [payment.data]);

  const packagesPath =
    currentUser?.type === 'Parent' ? '/family' : '/my_packages';

  const render = (
    tone: Tone,
    title: string,
    text: string,
    actions: JSX.Element,
  ) => (
    <main className={`pay-return pay-return--${tone}`}>
      <div className="pay-return__card">
        <span className="pay-return__icon" aria-hidden="true">
          {tone === 'wait' && <CircularProgress size={48} />}
          {tone === 'good' && <CheckCircleRounded />}
          {tone === 'bad' && <ErrorOutlineRounded />}
          {tone === 'info' && <HourglassTopRounded />}
        </span>
        <h1>{title}</h1>
        <p>{text}</p>
        {actions}
      </div>
    </main>
  );

  if (!signedIn) {
    const hint =
      outcome === 'success'
        ? t('PAYMENTS.RETURN.FULFILLED_HINT')
        : outcome === 'cancelled'
          ? t('PAYMENTS.RETURN.CANCELLED')
          : t('PAYMENTS.RETURN.FAILED');
    return render(
      outcome === 'success' ? 'good' : 'bad',
      hint,
      t('PAYMENTS.RETURN.SIGN_IN'),
      <Button component={Link} to="/login" variant="contained">
        {t('LOGIN.TITLE', { defaultValue: 'Sign in' })}
      </Button>,
    );
  }

  if (payment.isError) {
    const missing = errorStatus(payment.error) === 404;
    return render(
      'bad',
      missing ? t('PAYMENTS.RETURN.NOT_FOUND') : t('FAMILY.ERROR'),
      '',
      <Button component={Link} to={packagesPath} variant="contained">
        {t('PAYMENTS.RETURN.SEE_PACKAGES')}
      </Button>,
    );
  }

  const data: Payment | undefined = payment.data;
  if (!data || !data.final) {
    return render(
      'wait',
      t('PAYMENTS.RETURN.CONFIRMING'),
      t('PAYMENTS.RETURN.CONFIRMING_TEXT'),
      <p className="pay-return__secure">
        <LockRounded fontSize="inherit" />{' '}
        {outcome === 'success'
          ? t('PAYMENTS.RETURN.KEEP_OPEN')
          : t('PAYMENTS.RETURN.CHECKING')}
      </p>,
    );
  }

  const tone = TONES[data.status];
  const hours = data.lines.reduce((sum, line) => sum + line.hours, 0);
  const amount = formatMoney(data.amount, data.currency, i18n.language);
  const titles: Partial<Record<PaymentStatus, [string, string]>> = {
    fulfilled: [
      t('PAYMENTS.RETURN.FULFILLED'),
      t('PAYMENTS.RETURN.FULFILLED_TEXT', { count: hours, amount }),
    ],
    needs_review: [
      t('PAYMENTS.RETURN.REVIEW'),
      t('PAYMENTS.RETURN.REVIEW_TEXT'),
    ],
    failed: [t('PAYMENTS.RETURN.FAILED'), t('PAYMENTS.RETURN.FAILED_TEXT')],
    cancelled: [
      t('PAYMENTS.RETURN.CANCELLED'),
      t('PAYMENTS.RETURN.FAILED_TEXT'),
    ],
    expired: [t('PAYMENTS.RETURN.EXPIRED'), t('PAYMENTS.RETURN.EXPIRED_TEXT')],
  };
  const [title, text] = titles[data.status] ?? [
    t(`PAYMENTS.STATUS.${data.status}`),
    t('PAYMENTS.RETURN.REVIEW_TEXT'),
  ];
  const packageId = data.lines[0]?.package_id;

  return render(
    tone,
    title,
    text,
    <div className="pay-return__actions">
      {tone === 'bad' && packageId && (
        <Button
          component={Link}
          to={`/my_packages?renew=${packageId}`}
          variant="contained"
        >
          {t('PAYMENTS.RETURN.TRY_AGAIN')}
        </Button>
      )}
      <Button
        component={Link}
        to={packagesPath}
        variant={tone === 'bad' ? 'outlined' : 'contained'}
      >
        {t('PAYMENTS.RETURN.SEE_PACKAGES')}
      </Button>
      <Button component={Link} to="/payments" variant="text">
        {t('PAYMENTS.RETURN.RECEIPTS')}
      </Button>
    </div>,
  );
};

export default PaymentReturn;
