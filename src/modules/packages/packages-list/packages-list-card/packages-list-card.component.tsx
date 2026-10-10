import { FC, useMemo } from 'react';
import { Button } from '@mui/material';
import {
  Person,
  Group,
  AccessTime,
  Payment,
  CalendarToday,
  Schedule,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { parseISO, format } from 'date-fns';
import { arSA } from 'date-fns/locale/ar-SA';
import { enUS } from 'date-fns/locale/en-US';
import RatingSummary from '../../../../component/rating-summary/rating-summary.component';
import { useAppSelector } from '../../../../redux/store';
import { selectCurrentUser } from '../../../../redux/user/user.selectors';
import { useRtlClass } from '../../../../assets/utils/utils';
import type { Package } from '../../../../assets/types';

import defaultProfileImage from '../../../../assets/images/videoSession/people/profile.png';

import './packages-list-card.styles.scss';

interface PackageListCardProps {
  packageData: Package;
}

/**
 * PackageListCard Component
 *
 * Displays package information in a card format similar to session cards.
 * Shows user info, package type, hours, course, payment details, and dates.
 *
 * @param packageData - The package data object
 *
 * @example
 * <PackageListCard packageData={package} />
 */
const PackageListCard: FC<PackageListCardProps> = ({ packageData }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectCurrentUser);
  const rtlClass = useRtlClass();

  const locales = { ar: arSA, en: enUS };

  // Determine if current user is the tutor
  const isCurrentUserTutor = useMemo(() => {
    return currentUser?.id === packageData.tutor.id;
  }, [currentUser, packageData]);

  // Determine which user to display based on current user role
  const displayUser = useMemo(() => {
    if (!currentUser) return null;
    return isCurrentUserTutor ? packageData.student : packageData.tutor;
  }, [currentUser, packageData, isCurrentUserTutor]);

  const packageTypeLabel = useMemo(() => {
    if (packageData.package_type === 'group_course') {
      return t('MYPACKAGES.CARD.GROUP_COURSE');
    }
    if (packageData.package_type === 'trial_session') {
      return t('MYPACKAGES.CARD.TRIAL_SESSION');
    }
    return t('MYPACKAGES.CARD.PRIVATE_SESSION');
  }, [packageData.package_type, t]);

  const paymentMethodLabel = useMemo(() => {
    const method = packageData.payment_method;
    if (!method || method.trim() === '') {
      return t('MYPACKAGES.CARD.OTHER');
    }

    const methodMap: Record<string, string> = {
      cash: t('MYPACKAGES.CARD.PAYMENT_METHODS.CASH'),
      credit_card: t('MYPACKAGES.CARD.PAYMENT_METHODS.CREDIT_CARD'),
      vodafone_cash: t('MYPACKAGES.CARD.PAYMENT_METHODS.VODAFONE_CASH'),
      bank_transfer: t('MYPACKAGES.CARD.PAYMENT_METHODS.BANK_TRANSFER'),
      fawry: t('MYPACKAGES.CARD.PAYMENT_METHODS.FAWRY'),
      western_union: t('MYPACKAGES.CARD.PAYMENT_METHODS.WESTERN_UNION'),
    };

    return methodMap[method] || t('MYPACKAGES.CARD.OTHER');
  }, [packageData.payment_method, t]);

  const courseName = useMemo(() => {
    return (
      packageData.grade_subject?.full_course_name?.trim() ||
      t('MYPACKAGES.CARD.NOT_AVAILABLE')
    );
  }, [packageData.grade_subject, t]);

  const userName = useMemo(() => {
    const firstName = displayUser?.first_name?.trim() || '';
    const lastName = displayUser?.last_name?.trim() || '';
    if (!firstName && !lastName) {
      return t('MYPACKAGES.CARD.NOT_AVAILABLE');
    }
    return `${firstName} ${lastName}`.trim();
  }, [displayUser, t]);

  const handleUserClick = () => {
    if (displayUser && displayUser.type === 'Tutor') {
      navigate(`/profile/${displayUser.id}`);
    }
  };

  if (!displayUser) return null;

  const remainingHours = packageData.remaining_hours ?? 0;
  const originalHours = packageData.original_hours ?? 0;
  // Purely presentational: share of the package still available
  const remainingPercent =
    originalHours > 0
      ? Math.min(100, Math.max(0, (remainingHours / originalHours) * 100))
      : 0;

  return (
    <article className="packages-card">
      <div className="packages-card__content">
        <header className={`packages-card__content-top ${rtlClass}`}>
          <div className="packages-card__img-container">
            <Button
              className="card-img packages-card__user-img"
              onClick={handleUserClick}
              disabled={displayUser.type !== 'Tutor'}
            >
              {displayUser.avatar ? (
                <img
                  src={displayUser.avatar}
                  alt={displayUser.first_name}
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = defaultProfileImage;
                  }}
                />
              ) : (
                <img
                  src={defaultProfileImage}
                  alt={displayUser.first_name}
                  loading="lazy"
                />
              )}
            </Button>
            <div className="user-info">
              <p className="name">{userName}</p>
              {displayUser.type === 'Tutor' && !!displayUser.average_rating && (
                <RatingSummary
                  className="review"
                  value={displayUser.average_rating}
                  count={displayUser.number_of_reviews}
                />
              )}
            </div>
          </div>
          <span
            className={`packages-card__type packages-card__type--${
              packageData.package_type || 'private'
            }`}
          >
            {packageData.package_type === 'group_course' ? (
              <Group />
            ) : (
              <Person />
            )}
            {packageTypeLabel}
          </span>
        </header>

        <div className="packages-card__progress">
          <div className="packages-card__progress-labels">
            <div className="packages-card__progress-stat">
              <span className="label">
                {t('MYPACKAGES.CARD.REMAINING_HOURS')}
              </span>
              <span className="value value--strong">
                <AccessTime />
                {remainingHours} {t('MYPACKAGES.CARD.HOURS')}
              </span>
            </div>
            <div className="packages-card__progress-stat packages-card__progress-stat--end">
              <span className="label">
                {t('MYPACKAGES.CARD.ORIGINAL_HOURS')}
              </span>
              <span className="value">
                {originalHours} {t('MYPACKAGES.CARD.HOURS')}
              </span>
            </div>
          </div>
          <div
            className="packages-card__progress-track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={originalHours}
            aria-valuenow={remainingHours}
            aria-label={t('MYPACKAGES.CARD.REMAINING_HOURS')}
          >
            <span
              className="packages-card__progress-bar"
              style={{ width: `${remainingPercent}%` }}
            />
          </div>
        </div>

        <div className="packages-card__content-middle">
          <div className={`prop-card prop-card--wide ${rtlClass}`}>
            <p className="title">{t('MYPACKAGES.CARD.COURSE')}</p>
            <p className="value field">{courseName}</p>
          </div>
          {!isCurrentUserTutor && (
            <>
              <div className={`prop-card ${rtlClass}`}>
                <p className="title">{t('MYPACKAGES.CARD.AMOUNT_PAID')}</p>
                <p className="value value--strong">
                  <Payment />
                  {packageData.amount_paid ?? 0}{' '}
                  {packageData.amount_paid_currency || ''}
                </p>
              </div>
              <div className={`prop-card ${rtlClass}`}>
                <p className="title">{t('MYPACKAGES.CARD.PAYMENT_METHOD')}</p>
                <p className="value">
                  <Payment />
                  {paymentMethodLabel}
                </p>
              </div>
            </>
          )}
          <div className={`prop-card ${rtlClass}`}>
            <p className="title">{t('MYPACKAGES.CARD.CREATED_DATE')}</p>
            <p className="value">
              <CalendarToday />
              {format(parseISO(packageData.created_at), 'PP', {
                locale: locales[i18n.language as 'en' | 'ar'],
              })}
            </p>
          </div>
          <div className={`prop-card ${rtlClass}`}>
            <p className="title">{t('MYPACKAGES.CARD.UPDATED_DATE')}</p>
            <p className="value">
              <Schedule />
              {format(parseISO(packageData.updated_at), 'PP', {
                locale: locales[i18n.language as 'en' | 'ar'],
              })}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PackageListCard;
