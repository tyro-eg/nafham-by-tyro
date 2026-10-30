import { FC, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Skeleton } from '@mui/material';
import {
  ArrowBackRounded,
  DeleteOutlineRounded,
  EventRounded,
  MenuBookRounded,
  PersonRounded,
} from '@mui/icons-material';

import { useAppSelector } from '../../../redux/store';
import { selectCurrentUser } from '../../../redux/user/user.selectors';
import {
  assignmentErrorMessage,
  useAssignment,
  useDeleteAssignment,
} from '../../../hooks/useAssignments';
import { useRtlClass } from '../../../assets/utils/utils';
import { snackActions } from '../../../assets/utils/toaster';
import AttachmentList from './attachment-list.component';
import ReviewView from './review-view.component';
import StudentSubmission from './student-submission.component';
import SubmissionView from './submission-view.component';
import TutorReview from './tutor-review.component';
import {
  formatDateTime,
  formatRelative,
  fullName,
  statusChip,
} from '../homework.utils';

import './homework-detail.styles.scss';

/**
 * One assignment at /homework/:slug. Both roles see the title, course,
 * due date, status, instructions and attachments. A student submits (or
 * updates) their answer until it is reviewed, then sees the review. A
 * tutor sees the submission, grades it in the review panel and can delete
 * the assignment while nothing was submitted.
 */
const HomeworkDetail: FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const rtlClass = useRtlClass();
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectCurrentUser);
  const isTutor = currentUser?.type === 'Tutor';
  const viewer = isTutor ? 'tutor' : 'student';

  const query = useAssignment(slug);
  const deleteMutation = useDeleteAssignment();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const notFound =
    query.isError &&
    (query.error as { response?: { status?: number } })?.response?.status ===
      404;

  useEffect(() => {
    if (query.isError && !notFound) {
      snackActions.error(
        assignmentErrorMessage(query.error, t('HOMEWORK.LOAD_FAILED')),
      );
    }
  }, [query.isError, query.error, notFound, t]);

  const now = useMemo(() => new Date(), []);
  const assignment = query.data;

  const onDelete = async () => {
    if (!assignment) return;
    try {
      await deleteMutation.mutateAsync(assignment.slug);
      snackActions.success(t('HOMEWORK.DELETE.SUCCESS'));
      navigate('/homework', { replace: true });
    } catch (err) {
      setConfirmDelete(false);
      snackActions.error(
        assignmentErrorMessage(err, t('HOMEWORK.DELETE.ERROR')),
      );
    }
  };

  const back = (
    <Link to="/homework" className="hw-back">
      <ArrowBackRounded aria-hidden="true" />
      {t('HOMEWORK.BACK')}
    </Link>
  );

  if (query.isLoading) {
    return (
      <div className={`homework-detail ${rtlClass}`}>
        <div className="container hwd-container">
          {back}
          <Skeleton variant="rounded" height={220} />
          <Skeleton variant="rounded" height={260} />
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className={`homework-detail ${rtlClass}`}>
        <div className="container hwd-container">
          {back}
          <div className="hw-section hw-section--empty">
            <h2>{t('HOMEWORK.NOT_FOUND')}</h2>
            <Button variant="contained" component={Link} to="/homework">
              {t('HOMEWORK.BACK')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const chip = statusChip(assignment, viewer, now);
  const person = isTutor ? assignment.student : assignment.tutor;
  const canDelete = isTutor && !assignment.submission;

  return (
    <div className={`homework-detail ${rtlClass}`}>
      <div className="container hwd-container">
        {back}

        <header className="hw-section hwd-head">
          <div className="hwd-head__top">
            <div className="hwd-head__heading">
              <span className="hwd-head__slug">{assignment.slug}</span>
              <h1 className="hwd-head__title" dir="auto">
                {assignment.title}
              </h1>
            </div>
            <span className={`hw-chip hw-chip--${chip.tone}`}>
              {t(`HOMEWORK.STATUS.${chip.key}`, chip.values)}
            </span>
          </div>

          <dl className="hwd-head__facts">
            <div>
              <dt>
                <MenuBookRounded aria-hidden="true" />
                {t('HOMEWORK.DETAIL.COURSE')}
              </dt>
              <dd dir="auto">{assignment.grade_subject.full_course_name}</dd>
            </div>
            <div>
              <dt>
                <PersonRounded aria-hidden="true" />
                {isTutor
                  ? t('HOMEWORK.DETAIL.STUDENT')
                  : t('HOMEWORK.DETAIL.TUTOR')}
              </dt>
              <dd>{fullName(person)}</dd>
            </div>
            <div>
              <dt>
                <EventRounded aria-hidden="true" />
                {t('HOMEWORK.DETAIL.DUE_AT')}
              </dt>
              <dd>
                {formatDateTime(assignment.due_at, i18n.language)}
                <span className="hw-muted">
                  {' '}
                  ({formatRelative(assignment.due_at, i18n.language)})
                </span>
              </dd>
            </div>
            {isTutor && (
              <div>
                <dt>{t('HOMEWORK.DETAIL.OPENED')}</dt>
                <dd>
                  {assignment.opened_at ? (
                    formatDateTime(assignment.opened_at, i18n.language)
                  ) : (
                    <span className="hw-muted">
                      {t('HOMEWORK.DETAIL.NOT_OPENED')}
                    </span>
                  )}
                </dd>
              </div>
            )}
          </dl>

          <div className="hwd-head__block">
            <h2 className="hw-section__subtitle">
              {t('HOMEWORK.DETAIL.INSTRUCTIONS')}
            </h2>
            {assignment.instructions ? (
              <p className="hw-prose" dir="auto">
                {assignment.instructions}
              </p>
            ) : (
              <p className="hw-muted">{t('HOMEWORK.DETAIL.NO_INSTRUCTIONS')}</p>
            )}
          </div>

          {assignment.attachments.length > 0 && (
            <div className="hwd-head__block">
              <h2 className="hw-section__subtitle">
                {t('HOMEWORK.DETAIL.ATTACHMENTS')}
              </h2>
              <AttachmentList files={assignment.attachments} />
            </div>
          )}

          {canDelete && (
            <div className="hwd-head__danger">
              {confirmDelete ? (
                <div
                  className="hw-confirm hw-confirm--danger"
                  role="alertdialog"
                >
                  <strong>{t('HOMEWORK.DELETE.CONFIRM_TITLE')}</strong>
                  <p>{t('HOMEWORK.DELETE.CONFIRM_TEXT')}</p>
                  <div className="hw-confirm__actions">
                    <Button
                      variant="outlined"
                      onClick={() => setConfirmDelete(false)}
                      disabled={deleteMutation.isPending}
                    >
                      {t('HOMEWORK.REVIEW.CANCEL')}
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<DeleteOutlineRounded />}
                      onClick={onDelete}
                      disabled={deleteMutation.isPending}
                    >
                      {t('HOMEWORK.DELETE.CONFIRM')}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="text"
                  color="error"
                  size="small"
                  startIcon={<DeleteOutlineRounded />}
                  onClick={() => setConfirmDelete(true)}
                >
                  {t('HOMEWORK.DELETE.BUTTON')}
                </Button>
              )}
            </div>
          )}
        </header>

        {/* Student: answer until reviewed, then the released review */}
        {!isTutor &&
          (assignment.status === 'reviewed' && assignment.review ? (
            <section className="hw-section">
              <h2 className="hw-section__title">
                {t('HOMEWORK.REVIEW.FEEDBACK_TITLE')}
              </h2>
              {assignment.submission && (
                <SubmissionView submission={assignment.submission} />
              )}
              <ReviewView review={assignment.review} />
            </section>
          ) : (
            <StudentSubmission
              key={assignment.submission?.id ?? 'new'}
              assignment={assignment}
            />
          ))}

        {/* Tutor: the submission, then the review panel */}
        {isTutor && (
          <>
            <section className="hw-section">
              <h2 className="hw-section__title">
                {t('HOMEWORK.SUBMISSION.TITLE_TUTOR')}
              </h2>
              {assignment.submission ? (
                <SubmissionView submission={assignment.submission} />
              ) : (
                <div className="hw-submission hw-submission--empty">
                  <strong>{t('HOMEWORK.SUBMISSION.NONE')}</strong>
                  <p className="hw-muted">
                    {t('HOMEWORK.SUBMISSION.NONE_HINT')}
                  </p>
                </div>
              )}
            </section>

            {(assignment.submission || assignment.review) && (
              <TutorReview
                key={`${assignment.review?.id ?? 'new'}-${
                  assignment.review?.status ?? ''
                }`}
                assignment={assignment}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HomeworkDetail;
