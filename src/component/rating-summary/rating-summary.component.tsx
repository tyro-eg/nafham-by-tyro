import React, { memo } from 'react';
import { Rating, RatingProps } from '@mui/material';
import { useTranslation } from 'react-i18next';

import './rating-summary.styles.scss';

interface RatingSummaryProps {
  /** Average rating out of 5 */
  value?: number | string | null;
  /** Optional number of reviews, shown as "· 48 reviews" */
  count?: number | null;
  size?: RatingProps['size'];
  /** Use whole stars only (e.g. a single review) */
  wholeStars?: boolean;
  className?: string;
}

/**
 * Star row + numeric rating ("4.9" or "4.9 · 48 reviews").
 *
 * The stars are laid out LTR and mirrored in RTL so MUI's partial-star
 * clipping keeps working and the fill still starts on the reading side.
 */
const RatingSummary: React.FC<RatingSummaryProps> = memo(
  ({ value, count, size = 'small', wholeStars = false, className = '' }) => {
    const { t } = useTranslation();
    const numeric = Math.min(Math.max(Number(value) || 0, 0), 5);
    const rounded = wholeStars
      ? Math.round(numeric)
      : Math.round(numeric * 10) / 10;

    return (
      <span className={`rating-summary ${className}`.trim()}>
        <Rating
          className="rating-summary__stars"
          value={rounded}
          precision={wholeStars ? 1 : 0.1}
          size={size}
          readOnly
          dir="ltr"
          aria-hidden="true"
        />
        <span className="rating-summary__value">{numeric.toFixed(1)}</span>
        {!!count && count > 0 && (
          <span className="rating-summary__count">
            {t('GENEREL.REVIEWS_COUNT', { count })}
          </span>
        )}
      </span>
    );
  },
);

RatingSummary.displayName = 'RatingSummary';

export default RatingSummary;
