import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Avatar, Button } from '@mui/material';
import {
  AutorenewRounded,
  Group,
  Person,
  Star,
  WarningAmberRounded,
} from '@mui/icons-material';
import { parseISO, format } from 'date-fns';
import { arSA } from 'date-fns/locale/ar-SA';
import { enUS } from 'date-fns/locale/en-US';
import { useAppSelector } from '../../../../redux/store';
import { selectCurrentUser } from '../../../../redux/user/user.selectors';
import { subjectName } from '../../../dashboard/dashboard.utils';
import type { Package } from '../../../../assets/types';

import './packages-list-card.styles.scss';

interface PackageListCardProps {
  packageData: Package;
  /** A parent's list: the child's colour, as on the calendar */
  color?: string;
  /**
   * Who renews this package: the viewer ('renew' opens the checkout), or
   * the family's parent ('ask_parent', for a child with their own login)
   */
  renewal?: 'renew' | 'ask_parent';
  onRenew?: (pkg: Package) => void;
}

const LOCALES = { ar: arSA, en: enUS };
const LOW_HOURS = 2;

/** Hours left as a ring, with the figure in the middle */
const Ring: FC<{ value: number; label: string }> = ({ value, label }) => {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, value));
  return (
    <span className="pk-ring" aria-hidden="true">
      <svg viewBox="0 0 64 64">
        <circle className="pk-ring__track" cx="32" cy="32" r={radius} />
        <circle
          className="pk-ring__value"
          cx="32"
          cy="32"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
        />
      </svg>
      <span className="pk-ring__label">{label}</span>
    </span>
  );
};

/**
 * One package: the course and the hours left up top, the person it is with,
 * the hours as a bar (used, booked, free), then what was paid and when.
 */
const PackageListCard: FC<PackageListCardProps> = ({
  packageData,
  color,
  renewal,
  onRenew,
}) => {
  const { t, i18n } = useTranslation();
  const currentUser = useAppSelector(selectCurrentUser);
  const locale = LOCALES[i18n.language as 'en' | 'ar'] ?? enUS;
  const isTutor = currentUser?.id === packageData.tutor.id;
  const person = isTutor ? packageData.student : packageData.tutor;

  const typeLabel =
    packageData.package_type === 'group_course'
      ? t('MYPACKAGES.CARD.GROUP_COURSE')
      : packageData.package_type === 'trial_session'
        ? t('MYPACKAGES.CARD.TRIAL_SESSION')
        : t('MYPACKAGES.CARD.PRIVATE_SESSION');

  const paymentMethodLabel = useMemo(() => {
    const method = packageData.payment_method;
    const map: Record<string, string> = {
      cash: t('MYPACKAGES.CARD.PAYMENT_METHODS.CASH'),
      credit_card: t('MYPACKAGES.CARD.PAYMENT_METHODS.CREDIT_CARD'),
      vodafone_cash: t('MYPACKAGES.CARD.PAYMENT_METHODS.VODAFONE_CASH'),
      bank_transfer: t('MYPACKAGES.CARD.PAYMENT_METHODS.BANK_TRANSFER'),
      fawry: t('MYPACKAGES.CARD.PAYMENT_METHODS.FAWRY'),
      western_union: t('MYPACKAGES.CARD.PAYMENT_METHODS.WESTERN_UNION'),
    };
    return (method && map[method]) || t('MYPACKAGES.CARD.OTHER');
  }, [packageData.payment_method, t]);

  const fullCourse = packageData.grade_subject?.full_course_name?.trim() || '';
  const remainingHours = packageData.remaining_hours ?? 0;
  const originalHours = packageData.original_hours ?? 0;
  // Older API responses carry only the balance: then everything not free is "used"
  const hours = packageData.hours ?? {
    bought: originalHours,
    moved_out: 0,
    used: Math.max(originalHours - remainingHours, 0),
    scheduled: 0,
    unscheduled: remainingHours,
    consistent: true,
  };
  const active = Math.max(hours.bought - hours.moved_out, 0);
  // Only taught or missed hours count as gone; a booking is still the student's
  const hoursLeft = Math.max(active - hours.used, 0);
  const share = (value: number) =>
    active > 0 ? Math.min(100, Math.max(0, (value / active) * 100)) : 0;
  const purchases = packageData.purchases ?? [];
  const purchaseLabel = (kind: string) =>
    kind === 'top_up'
      ? t('MYPACKAGES.CARD.HISTORY.TOP_UP')
      : kind === 'moved_in'
        ? t('MYPACKAGES.CARD.HISTORY.MOVED_IN')
        : t('MYPACKAGES.CARD.HISTORY.BOUGHT');
  const day = (iso: string) => format(parseISO(iso), 'PP', { locale });
  const personName =
    `${person?.first_name ?? ''} ${person?.last_name ?? ''}`.trim();
  const exhausted = hoursLeft === 0;

  return (
    <article
      className={`pk-card${exhausted ? ' pk-card--done' : ''}`}
      style={color ? ({ '--kid': color } as React.CSSProperties) : undefined}
    >
      <header className="pk-card__head">
        <div className="pk-card__course">
          <span className="pk-card__type">
            {packageData.package_type === 'group_course' ? (
              <Group />
            ) : (
              <Person />
            )}
            {typeLabel}
          </span>
          <h3 className="pk-card__title" dir="auto">
            {subjectName(fullCourse) || t('MYPACKAGES.CARD.NOT_AVAILABLE')}
          </h3>
          <p className="pk-card__full" dir="auto">
            {fullCourse}
          </p>
        </div>
        <div className="pk-card__left">
          <Ring
            value={active ? hoursLeft / active : 0}
            label={`${hoursLeft}h`}
          />
          <span className="pk-card__left-label">
            {t('MYPACKAGES.CARD.REMAINING_HOURS')}
          </span>
        </div>
      </header>

      <div className="pk-card__person">
        {person?.type === 'Tutor' ? (
          <Link to={`/profile/${person.id}`} className="pk-card__avatar-link">
            <Avatar
              src={person.avatar ?? undefined}
              alt={personName}
              className="pk-card__avatar"
            >
              {personName[0]}
            </Avatar>
          </Link>
        ) : (
          <Avatar
            src={person?.avatar ?? undefined}
            alt={personName}
            className="pk-card__avatar"
          >
            {personName[0]}
          </Avatar>
        )}
        <div className="pk-card__who">
          <span className="pk-card__name">
            {personName || t('MYPACKAGES.CARD.NOT_AVAILABLE')}
          </span>
          <span className="pk-card__meta">
            {person?.type === 'Tutor' && !!person.average_rating && (
              <span className="pk-card__rating">
                <Star /> {Number(person.average_rating).toFixed(1)}
              </span>
            )}
            {currentUser?.type === 'Parent' &&
              packageData.student?.first_name && (
                <span className="pk-card__for">
                  {t('FAMILY.FOR', { name: packageData.student.first_name })}
                </span>
              )}
          </span>
        </div>
      </div>

      <div
        className="pk-card__bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={active}
        aria-valuenow={hoursLeft}
        aria-label={t('MYPACKAGES.CARD.REMAINING_HOURS')}
      >
        <span
          className="pk-card__seg pk-card__seg--used"
          style={{ width: `${share(hours.used)}%` }}
        />
        <span
          className="pk-card__seg pk-card__seg--scheduled"
          style={{ width: `${share(hours.scheduled)}%` }}
        />
        <span
          className="pk-card__seg pk-card__seg--free"
          style={{ width: `${share(hours.unscheduled)}%` }}
        />
      </div>
      <ul className="pk-card__legend">
        <li className="pk-card__legend-item pk-card__legend-item--used">
          <strong>{hours.used}</strong> {t('MYPACKAGES.CARD.LEGEND.USED')}
        </li>
        <li className="pk-card__legend-item pk-card__legend-item--scheduled">
          <strong>{hours.scheduled}</strong>{' '}
          {t('MYPACKAGES.CARD.LEGEND.SCHEDULED')}
        </li>
        <li className="pk-card__legend-item pk-card__legend-item--free">
          <strong>{hours.unscheduled}</strong>{' '}
          {t('MYPACKAGES.CARD.LEGEND.FREE')}
        </li>
        {hours.moved_out > 0 && (
          <li className="pk-card__legend-item">
            <strong>{hours.moved_out}</strong>{' '}
            {t('MYPACKAGES.CARD.LEGEND.MOVED_OUT')}
          </li>
        )}
      </ul>

      <dl className="pk-card__facts">
        <div>
          <dt>{t('MYPACKAGES.CARD.BOUGHT_HOURS')}</dt>
          <dd>
            {hours.bought} {t('MYPACKAGES.CARD.HOURS')}
          </dd>
        </div>
        {!isTutor && (
          <div>
            <dt>{t('MYPACKAGES.CARD.AMOUNT_PAID')}</dt>
            <dd>
              {packageData.amount_paid_total ?? packageData.amount_paid ?? 0}{' '}
              {packageData.amount_paid_currency || ''}
              <span className="pk-card__facts-sub">{paymentMethodLabel}</span>
            </dd>
          </div>
        )}
        <div>
          <dt>{t('MYPACKAGES.CARD.CREATED_DATE')}</dt>
          <dd>{day(packageData.created_at)}</dd>
        </div>
        <div>
          <dt>{t('MYPACKAGES.CARD.UPDATED_DATE')}</dt>
          <dd>{day(packageData.last_activity_at ?? packageData.updated_at)}</dd>
        </div>
      </dl>

      {purchases.length > 1 && (
        <ul className="pk-card__history">
          {purchases.map((entry, index) => (
            <li key={index}>
              {purchaseLabel(entry.kind)} {entry.hours}{' '}
              {t('MYPACKAGES.CARD.HOURS')}
              {entry.kind === 'moved_in' && entry.tutor_name
                ? ` (${entry.tutor_name})`
                : ''}{' '}
              · {day(entry.at)}
            </li>
          ))}
        </ul>
      )}

      {!isTutor && renewal && (
        <footer className="pk-card__actions">
          {hoursLeft <= LOW_HOURS ? (
            <span className="pk-card__low">
              <WarningAmberRounded fontSize="inherit" />
              {t('PAYMENTS.RENEW.LOW', { count: hoursLeft })}
            </span>
          ) : (
            <span />
          )}
          {renewal === 'renew' ? (
            <Button
              size="small"
              variant={hoursLeft <= LOW_HOURS ? 'contained' : 'outlined'}
              startIcon={<AutorenewRounded />}
              onClick={() => onRenew?.(packageData)}
            >
              {t('PAYMENTS.RENEW.BUTTON')}
            </Button>
          ) : (
            <p className="pk-card__ask">
              {t('PAYMENTS.RENEW.ASK_PARENT_SHORT')}
            </p>
          )}
        </footer>
      )}
    </article>
  );
};

export default PackageListCard;
