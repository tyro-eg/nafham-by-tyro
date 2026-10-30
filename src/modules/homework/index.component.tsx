import { FC, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Dialog, MenuItem, Skeleton, TextField } from '@mui/material';
import {
  AddRounded,
  ArrowForwardRounded,
  EventRounded,
  MenuBookRounded,
  PersonRounded,
} from '@mui/icons-material';

import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import {
  assignmentErrorMessage,
  useAssignments,
  type Assignment,
  type AssignmentStatus,
} from '../../hooks/useAssignments';
import { useTutorStudents } from '../../hooks/useTutorStudents';
import { useRtlClass } from '../../assets/utils/utils';
import { snackActions } from '../../assets/utils/toaster';
import AssignHomeworkModal from '../../modals/assign-homework-modal/assign-homework-modal.component';
import {
  formatDateTime,
  formatRelative,
  fullName,
  statusChip,
} from './homework.utils';
import emptyArt from '../../assets/images/newLanding/rafiki.svg?url';

import './homework.styles.scss';

const ALL = 'all';

type StatusFilter = AssignmentStatus | typeof ALL;
const STATUS_FILTERS: StatusFilter[] = [
  ALL,
  'assigned',
  'submitted',
  'reviewed',
];

/**
 * Homework list for both roles. Tutors see every assignment they set,
 * filter by student and status, and open the "Assign homework" modal.
 * Students see their own assignments with due dates and feedback state.
 * Each card opens the detail page at /homework/:slug.
 */
const Homework: FC = () => {
  const { t, i18n } = useTranslation();
  const rtlClass = useRtlClass();
  const currentUser = useAppSelector(selectCurrentUser);
  const isTutor = currentUser?.type === 'Tutor';
  const viewer = isTutor ? 'tutor' : 'student';

  const [status, setStatus] = useState<StatusFilter>(ALL);
  const [studentId, setStudentId] = useState(ALL);
  const [assignOpen, setAssignOpen] = useState(false);

  const assignmentsQuery = useAssignments({
    ...(status !== ALL ? { status } : {}),
    ...(studentId !== ALL ? { student_id: Number(studentId) } : {}),
  });
  const { students } = useTutorStudents(isTutor);

  useEffect(() => {
    if (assignmentsQuery.isError) {
      snackActions.error(
        assignmentErrorMessage(
          assignmentsQuery.error,
          t('HOMEWORK.LOAD_FAILED'),
        ),
      );
    }
  }, [assignmentsQuery.isError, assignmentsQuery.error, t]);

  const now = useMemo(() => new Date(), []);
  const assignments = useMemo(
    () => assignmentsQuery.data?.data ?? [],
    [assignmentsQuery.data],
  );

  const loading = assignmentsQuery.isLoading;
  const filtered = status !== ALL || studentId !== ALL;

  const renderCard = (assignment: Assignment) => {
    const chip = statusChip(assignment, viewer, now);
    const person = isTutor ? assignment.student : assignment.tutor;
    const showReview = isTutor && assignment.status === 'submitted';

    return (
      <li key={assignment.slug} className="hw-card">
        <Link to={`/homework/${assignment.slug}`} className="hw-card__link">
          <div className="hw-card__top">
            <h3 className="hw-card__title" dir="auto">
              {assignment.title}
            </h3>
            <span className={`hw-chip hw-chip--${chip.tone}`}>
              {t(`HOMEWORK.STATUS.${chip.key}`, chip.values)}
            </span>
          </div>

          <dl className="hw-card__facts">
            <div>
              <dt>
                <PersonRounded aria-hidden="true" />
                {isTutor
                  ? t('HOMEWORK.CARD.STUDENT')
                  : t('HOMEWORK.CARD.TUTOR')}
              </dt>
              <dd>{fullName(person)}</dd>
            </div>
            <div>
              <dt>
                <MenuBookRounded aria-hidden="true" />
                {t('HOMEWORK.CARD.COURSE')}
              </dt>
              <dd dir="auto">{assignment.grade_subject.full_course_name}</dd>
            </div>
            <div>
              <dt>
                <EventRounded aria-hidden="true" />
                {t('HOMEWORK.CARD.DUE')}
              </dt>
              <dd>
                <span className="hw-card__relative">
                  {formatRelative(assignment.due_at, i18n.language)}
                </span>
                <span className="hw-card__absolute">
                  {formatDateTime(assignment.due_at, i18n.language)}
                </span>
              </dd>
            </div>
          </dl>

          {showReview && (
            <span className="hw-card__cta">
              {t('HOMEWORK.CARD.REVIEW')}
              <ArrowForwardRounded aria-hidden="true" />
            </span>
          )}
        </Link>
      </li>
    );
  };

  return (
    <div className={`homework ${rtlClass}`}>
      <div className="container hw-container">
        <header className="hw-header">
          <div>
            <h1 className="hw-header__title">
              {t('HOMEWORK.TITLE')}
              {!loading && (
                <span className="hw-header__count">
                  {assignmentsQuery.data?.total ?? assignments.length}
                </span>
              )}
            </h1>
            <p className="hw-header__subtitle">
              {isTutor
                ? t('HOMEWORK.SUBTITLE_TUTOR')
                : t('HOMEWORK.SUBTITLE_STUDENT')}
            </p>
          </div>
          {isTutor && (
            <Button
              variant="contained"
              className="hw-header__assign"
              startIcon={<AddRounded />}
              onClick={() => setAssignOpen(true)}
            >
              {t('HOMEWORK.ASSIGN')}
            </Button>
          )}
        </header>

        <div className="hw-toolbar">
          {isTutor && (
            <TextField
              select
              size="small"
              className="hw-toolbar__select"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              aria-label={t('HOMEWORK.FILTER_STUDENT')}
            >
              <MenuItem value={ALL}>{t('HOMEWORK.ALL_STUDENTS')}</MenuItem>
              {students.map((student) => (
                <MenuItem key={student.id} value={String(student.id)}>
                  {student.name}
                </MenuItem>
              ))}
            </TextField>
          )}
          <div className="hw-segment" role="group">
            {STATUS_FILTERS.map((key) => (
              <button
                key={key}
                type="button"
                className={`hw-segment__btn${
                  status === key ? ' hw-segment__btn--on' : ''
                }`}
                aria-pressed={status === key}
                onClick={() => setStatus(key)}
              >
                {key === ALL
                  ? t('HOMEWORK.FILTER.ALL')
                  : t(
                      `HOMEWORK.FILTER.${viewer.toUpperCase()}_${key.toUpperCase()}`,
                    )}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="hw-grid">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} variant="rounded" height={220} />
            ))}
          </div>
        )}

        {!loading && assignments.length === 0 && (
          <div className="hw-empty">
            <img src={emptyArt} alt="" />
            <h2>
              {filtered
                ? t('HOMEWORK.NO_MATCH_TITLE')
                : t(`HOMEWORK.EMPTY_TITLE_${viewer.toUpperCase()}`)}
            </h2>
            <p>
              {filtered
                ? t('HOMEWORK.NO_MATCH_TEXT')
                : t(`HOMEWORK.EMPTY_TEXT_${viewer.toUpperCase()}`)}
            </p>
            {isTutor && !filtered && (
              <Button
                variant="contained"
                startIcon={<AddRounded />}
                onClick={() => setAssignOpen(true)}
              >
                {t('HOMEWORK.ASSIGN')}
              </Button>
            )}
          </div>
        )}

        {!loading && assignments.length > 0 && (
          <ul className="hw-grid">{assignments.map(renderCard)}</ul>
        )}
      </div>

      {isTutor && assignOpen && (
        <Dialog
          maxWidth="sm"
          fullWidth
          open
          onClose={() => setAssignOpen(false)}
          aria-labelledby="assign-homework-title"
        >
          <AssignHomeworkModal handleClose={() => setAssignOpen(false)} />
        </Dialog>
      )}
    </div>
  );
};

export default Homework;
