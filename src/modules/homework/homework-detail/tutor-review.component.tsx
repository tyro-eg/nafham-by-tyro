import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, TextField } from '@mui/material';
import { EditRounded, SaveRounded, SendRounded } from '@mui/icons-material';

import {
  assignmentErrorMessage,
  useReviewAssignment,
  type Assignment,
  type CriterionMark,
} from '../../../hooks/useAssignments';
import { snackActions } from '../../../assets/utils/toaster';
import ReviewView from './review-view.component';
import { formatDateTime } from '../homework.utils';

interface TutorReviewProps {
  assignment: Assignment;
}

const clamp = (value: number, max: number) =>
  Math.min(max, Math.max(0, Number.isFinite(value) ? value : 0));

/**
 * The tutor's review panel: one numeric input per rubric criterion, the
 * running total and written feedback. "Save draft" keeps it private;
 * "Release to student" (after an inline confirm) marks the assignment
 * reviewed. A released review shows read-only with an "Edit" toggle.
 */
const TutorReview: FC<TutorReviewProps> = ({ assignment }) => {
  const { t, i18n } = useTranslation();
  const reviewMutation = useReviewAssignment();
  const { review, rubric } = assignment;
  const released = review?.status === 'released';

  const initialMarks = useMemo<CriterionMark[]>(
    () =>
      (rubric?.criteria ?? []).map((criterion) => {
        const existing = review?.criterion_marks.find(
          (mark) => mark.name === criterion.name,
        );
        return {
          name: criterion.name,
          max_points: criterion.max_points,
          points: existing?.points ?? 0,
        };
      }),
    [rubric, review],
  );

  const [marks, setMarks] = useState<CriterionMark[]>(initialMarks);
  const [feedback, setFeedback] = useState(review?.feedback ?? '');
  const [editing, setEditing] = useState(!released);
  const [confirmRelease, setConfirmRelease] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = marks.reduce((sum, mark) => sum + mark.points, 0);
  const max = marks.reduce((sum, mark) => sum + mark.max_points, 0);

  const setPoints = (index: number, raw: string) =>
    setMarks((prev) =>
      prev.map((mark, i) =>
        i === index
          ? { ...mark, points: clamp(Number(raw), mark.max_points) }
          : mark,
      ),
    );

  const save = async (release: boolean) => {
    setError(null);
    try {
      await reviewMutation.mutateAsync({
        slug: assignment.slug,
        criterion_marks: marks,
        feedback: feedback.trim(),
        release,
      });
      snackActions.success(
        release
          ? t('HOMEWORK.REVIEW.RELEASED')
          : t('HOMEWORK.REVIEW.DRAFT_SAVED'),
      );
      setConfirmRelease(false);
      if (release) setEditing(false);
    } catch (err) {
      setError(assignmentErrorMessage(err, t('HOMEWORK.REVIEW.ERROR')));
    }
  };

  const cancelEdit = () => {
    setMarks(initialMarks);
    setFeedback(review?.feedback ?? '');
    setConfirmRelease(false);
    setError(null);
    setEditing(false);
  };

  return (
    <section className="hw-section">
      <div className="hw-section__head">
        <h2 className="hw-section__title">{t('HOMEWORK.REVIEW.TITLE')}</h2>
        {review?.status === 'draft' && (
          <span className="hw-chip hw-chip--sun">
            {t('HOMEWORK.REVIEW.DRAFT_CHIP')}
          </span>
        )}
        {released && review.released_at && (
          <span className="hw-section__meta">
            {t('HOMEWORK.REVIEW.RELEASED_AT', {
              date: formatDateTime(review.released_at, i18n.language),
            })}
          </span>
        )}
        {released && !editing && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditRounded />}
            onClick={() => setEditing(true)}
          >
            {t('HOMEWORK.REVIEW.EDIT')}
          </Button>
        )}
      </div>

      {!editing && review ? (
        <ReviewView review={review} />
      ) : (
        <div className="hw-form">
          {rubric ? (
            <table className="hw-marks hw-marks--editable">
              <thead>
                <tr>
                  <th scope="col">{t('HOMEWORK.REVIEW.CRITERION')}</th>
                  <th scope="col" className="hw-marks__points">
                    {t('HOMEWORK.REVIEW.POINTS')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {marks.map((mark, index) => (
                  <tr key={mark.name}>
                    <td>
                      <span className="hw-marks__name" dir="auto">
                        {mark.name}
                      </span>
                      {rubric.criteria[index]?.description && (
                        <span className="hw-marks__description" dir="auto">
                          {rubric.criteria[index].description}
                        </span>
                      )}
                    </td>
                    <td className="hw-marks__points">
                      <span className="hw-marks__input">
                        <TextField
                          size="small"
                          type="number"
                          value={mark.points}
                          onChange={(e) => setPoints(index, e.target.value)}
                          inputProps={{
                            min: 0,
                            max: mark.max_points,
                            step: 1,
                            'aria-label': mark.name,
                          }}
                        />
                        <span className="hw-marks__max">
                          / {mark.max_points}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row">{t('HOMEWORK.REVIEW.TOTAL')}</th>
                  <td className="hw-marks__points">
                    {t('HOMEWORK.POINTS_OF', { points: total, max })}
                  </td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <p className="hw-muted">{t('HOMEWORK.REVIEW.NO_RUBRIC')}</p>
          )}

          <TextField
            multiline
            minRows={4}
            fullWidth
            label={t('HOMEWORK.REVIEW.FEEDBACK')}
            placeholder={t('HOMEWORK.REVIEW.FEEDBACK_PLACEHOLDER')}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            inputProps={{ maxLength: 5000, dir: 'auto' }}
          />

          {error && <Alert severity="error">{error}</Alert>}

          {confirmRelease ? (
            <div className="hw-confirm" role="alertdialog">
              <strong>{t('HOMEWORK.REVIEW.CONFIRM_RELEASE_TITLE')}</strong>
              <p>{t('HOMEWORK.REVIEW.CONFIRM_RELEASE_TEXT')}</p>
              <div className="hw-confirm__actions">
                <Button
                  variant="outlined"
                  onClick={() => setConfirmRelease(false)}
                  disabled={reviewMutation.isPending}
                >
                  {t('HOMEWORK.REVIEW.CANCEL')}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SendRounded />}
                  onClick={() => save(true)}
                  disabled={reviewMutation.isPending}
                >
                  {t('HOMEWORK.REVIEW.CONFIRM')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="hw-form__actions">
              {released && (
                <Button
                  variant="text"
                  color="inherit"
                  onClick={cancelEdit}
                  disabled={reviewMutation.isPending}
                >
                  {t('HOMEWORK.REVIEW.CANCEL')}
                </Button>
              )}
              {/* A released review stays released; drafts only before that */}
              {!released && (
                <Button
                  variant="outlined"
                  startIcon={<SaveRounded />}
                  onClick={() => save(false)}
                  disabled={reviewMutation.isPending}
                >
                  {t('HOMEWORK.REVIEW.SAVE_DRAFT')}
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<SendRounded />}
                onClick={() => setConfirmRelease(true)}
                disabled={reviewMutation.isPending}
              >
                {t('HOMEWORK.REVIEW.RELEASE')}
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default TutorReview;
