import React, { useMemo, memo } from 'react';
import { Rating } from '@mui/material';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';

import { arSA } from 'date-fns/locale/ar-SA';
import { enUS } from 'date-fns/locale/en-US';
import { ReviewData } from '../../modules/user/edit-profile/profile-reviews-list/profile-reviews-list.component';
import './review-card.styles.scss';

interface ReviewCardProps {
  data: ReviewData;
}

/**
 * Extracts plain text content from HTML string
 * @param html - HTML string to extract text from
 * @returns Plain text content
 */
const extractTextFromHtml = (html: string): string => {
  if (typeof window === 'undefined') return html; // SSR safety

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return (doc.body.textContent || '')
    .replace('Powered by Froala Editor', '')
    .trim();
};

/**
 * ReviewCard Component
 *
 * Displays a single review with rating, date, and feedback.
 * Memoized to prevent unnecessary re-renders when used in lists.
 *
 * @param data - The review data to display
 */
const ReviewCard: React.FC<ReviewCardProps> = memo(({ data }) => {
  const { i18n } = useTranslation();

  // Extract review text once when data changes
  const reviewText = useMemo(
    () => (data?.text ? extractTextFromHtml(data.text) : ''),
    [data?.text],
  );

  const locales = { ar: arSA, en: enUS };
  const myDateFormatter = (dateStr: string): string => {
    const locale = locales[i18n.language as 'ar' | 'en'] || enUS;
    return format(parseISO(dateStr), 'LLLL do, y', { locale });
  };

  return (
    <>
      {data && (
        <div className="profile-review">
          <div className="profile-review__author">{data.student}</div>
          <div className="profile-review__date">
            {myDateFormatter(data.created_at)}
          </div>
          {data.rating && (
            <div className="profile-review__rating-stars">
              <Rating
                name="profile-review"
                value={Math.round(data.rating)}
                readOnly
                size="large"
              />
              <span className="review-numbers">
                {data.rating.toFixed(1)} (5.0)
              </span>
            </div>
          )}
          <div className="profile-review__text">
            <p>{reviewText}</p>
          </div>
        </div>
      )}
    </>
  );
});

ReviewCard.displayName = 'ReviewCard';

export default ReviewCard;
