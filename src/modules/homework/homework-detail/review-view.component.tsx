import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import type { AssignmentReview } from '../../../hooks/useAssignments';

interface ReviewViewProps {
  review: AssignmentReview;
}

/**
 * Read-only review: one row per criterion with points / max, the total
 * and the written feedback. Shown to students once released and to the
 * tutor when not editing.
 */
const ReviewView: FC<ReviewViewProps> = ({ review }) => {
  const { t } = useTranslation();

  return (
    <div className="hw-review-view">
      {review.criterion_marks.length > 0 && (
        <table className="hw-marks">
          <thead>
            <tr>
              <th scope="col">{t('HOMEWORK.REVIEW.CRITERION')}</th>
              <th scope="col" className="hw-marks__points">
                {t('HOMEWORK.REVIEW.POINTS')}
              </th>
            </tr>
          </thead>
          <tbody>
            {review.criterion_marks.map((mark) => (
              <tr key={mark.name}>
                <td dir="auto">{mark.name}</td>
                <td className="hw-marks__points">
                  {t('HOMEWORK.POINTS_OF', {
                    points: mark.points,
                    max: mark.max_points,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">{t('HOMEWORK.REVIEW.TOTAL')}</th>
              <td className="hw-marks__points">
                {t('HOMEWORK.POINTS_OF', {
                  points: review.total_points,
                  max: review.max_points,
                })}
              </td>
            </tr>
          </tfoot>
        </table>
      )}

      <div className="hw-review-view__feedback">
        <h3 className="hw-section__subtitle">
          {t('HOMEWORK.REVIEW.FEEDBACK')}
        </h3>
        {review.feedback ? (
          <p className="hw-prose" dir="auto">
            {review.feedback}
          </p>
        ) : (
          <p className="hw-muted">{t('HOMEWORK.REVIEW.NO_FEEDBACK')}</p>
        )}
      </div>
    </div>
  );
};

export default ReviewView;
