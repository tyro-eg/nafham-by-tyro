import React, { useEffect, useState } from 'react';
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

const ReviewCard: React.FC<ReviewCardProps> = ({ data }) => {
  const { i18n } = useTranslation();
  const [reviewText, setReviewText] = useState<string>('');

  useEffect(() => {
    if (data?.text) {
      const cleanedText = extractContent(data.text).replace(
        'Powered by Froala Editor',
        '',
      );
      setReviewText(cleanedText);
    }
  }, [data]);

  const locales = { ar: arSA, en: enUS };
  const myDateFormatter = (dateStr: string): string => {
    const locale = locales[i18n.language as 'ar' | 'en'] || enUS;
    return format(parseISO(dateStr), 'LLLL do, y', { locale });
  };

  const extractContent = (htmlString: string): string => {
    const span = document.createElement('span');
    span.innerHTML = htmlString;
    return span.textContent || span.innerText || '';
  };

  return (
    <>
      {data && (
        <div className="profile-review">
          <div className="profile-review__author">{data.student}</div>
          <div className="profile-review__date">
            {myDateFormatter(data.created_at)}
          </div>
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
          <div className="profile-review__text">
            <p>{reviewText}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default ReviewCard;
