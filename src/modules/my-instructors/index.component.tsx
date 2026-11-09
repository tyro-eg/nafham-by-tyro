import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import {
  Autocomplete,
  Avatar,
  Button,
  Dialog,
  Skeleton,
  TextField,
} from '@mui/material';
import {
  ArrowForwardRounded,
  ChatBubbleOutlineRounded,
  EventNoteRounded,
  PlayCircleOutlineRounded,
  Star,
} from '@mui/icons-material';

import { useMyInstructors } from '../../hooks/useInstructors';
import { useGradeSubjects } from '../../hooks/useGradeSubjects';
import { usePackages } from '../../hooks/usePackages';
import { useSessions } from '../../hooks/useSessions';
import { useFamily, useActiveChild } from '../../hooks/useFamily';
import { useCanMessage, useStartConversation } from '../../hooks/useStreamChat';
import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import type {
  GradeSubject,
  Instructor,
  Package,
  SessionType,
} from '../../assets/types';
import { useRtlClass } from '../../assets/utils/utils';
import { subjectName } from '../dashboard/dashboard.utils';
import { formatRelative } from '../homework/homework.utils';
import ChildTabs from '../family/child-tabs.component';
import RequestSessionsModal from '../../modals/request-sessions-modal/request-sessions-modal.component';
import { ReactComponent as EmptyImg } from '../../assets/images/empty.svg';

import '../sessions/dashboard-shell.styles.scss';
import './index.styles.scss';

const UPCOMING = ['scheduled', 'open'];

/** Hours still owned on a package: bought less moved out and taught */
const hoursLeft = (pkg: Package) => {
  const hours = pkg.hours;
  if (!hours) return pkg.remaining_hours ?? 0;
  return Math.max(hours.bought - hours.moved_out - hours.used, 0);
};

interface TutorCardProps {
  tutor: Instructor;
  packages: Package[];
  next?: SessionType;
  isParent: boolean;
  canRequest: boolean;
}

/**
 * One tutor the family learns with: who they are, what they teach us, the
 * hours left with them, the next lesson, and the ways to reach them.
 */
const TutorCard: FC<TutorCardProps> = ({
  tutor,
  packages,
  next,
  isParent,
  canRequest,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const locale = `${i18n.language}-u-nu-latn`;
  const { startConversation, isStarting } = useStartConversation();
  const canMessage = useCanMessage(tutor.id);
  const [requestOpen, setRequestOpen] = useState(false);

  const name = `${tutor.first_name} ${tutor.last_name}`.trim();
  const hours = packages.reduce((sum, pkg) => sum + hoursLeft(pkg), 0);
  // The courses we take with this tutor, and for a parent whose they are
  const courses = Array.from(
    new Map(
      packages.map((pkg) => [
        `${pkg.grade_subject?.id}-${pkg.student?.id}`,
        {
          course: subjectName(pkg.grade_subject?.full_course_name),
          full: pkg.grade_subject?.full_course_name ?? '',
          child: pkg.student?.first_name,
        },
      ]),
    ).values(),
  );
  const taught = tutor.grade_subjects?.length ?? 0;

  return (
    <article className="mi-card">
      <header className="mi-card__head">
        <Avatar
          src={tutor.avatar || undefined}
          alt={name}
          className="mi-card__avatar"
        >
          {name[0]}
        </Avatar>
        <div className="mi-card__who">
          <h2 className="mi-card__name">{name}</h2>
          <div className="mi-card__meta">
            {!!tutor.average_rating && (
              <span className="mi-card__rating">
                <Star /> {Number(tutor.average_rating).toFixed(1)}
                {!!tutor.number_of_reviews && (
                  <span className="mi-card__muted">
                    {' '}
                    ({tutor.number_of_reviews})
                  </span>
                )}
              </span>
            )}
            {taught > 0 && (
              <span className="mi-card__muted">
                {t('MYINSTRUCTORS.CARD.TEACHES_COUNT', { count: taught })}
              </span>
            )}
          </div>
        </div>
        {tutor.video_url && (
          <a
            className="mi-card__intro"
            href={`https://www.youtube.com/watch?v=${tutor.video_url}`}
            target="_blank"
            rel="noreferrer"
          >
            <PlayCircleOutlineRounded />
            {t('MYINSTRUCTORS.CARD.INTRO')}
          </a>
        )}
      </header>

      {tutor.bio && (
        <p className="mi-card__bio" dir="auto">
          {tutor.bio}
        </p>
      )}

      <div className="mi-card__with">
        <span className="mi-card__label">
          {t('MYINSTRUCTORS.CARD.WITH_US')}
        </span>
        <ul className="mi-card__courses">
          {courses.map((item) => (
            <li
              key={`${item.full}-${item.child}`}
              className="mi-card__course"
              title={item.full}
              dir="auto"
            >
              {item.course}
              {isParent && item.child && (
                <span className="mi-card__course-child"> · {item.child}</span>
              )}
            </li>
          ))}
          {courses.length === 0 && (
            <li className="mi-card__muted">
              {t('MYINSTRUCTORS.CARD.NO_PACKAGE')}
            </li>
          )}
        </ul>
      </div>

      <dl className="mi-card__facts">
        <div>
          <dt>{t('MYINSTRUCTORS.CARD.HOURS_LEFT')}</dt>
          <dd>{hours}</dd>
        </div>
        <div className="mi-card__fact-wide">
          <dt>{t('MYINSTRUCTORS.CARD.NEXT_LESSON')}</dt>
          <dd>
            {next ? (
              <>
                <EventNoteRounded aria-hidden="true" />
                <span dir="auto">
                  {formatRelative(next.start_time, i18n.language)} ·{' '}
                  {new Date(next.start_time).toLocaleString(locale, {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                  {isParent && next.student?.first_name
                    ? ` · ${next.student.first_name}`
                    : ''}
                </span>
              </>
            ) : (
              <span className="mi-card__muted">
                {t('MYINSTRUCTORS.CARD.NO_LESSON')}
              </span>
            )}
          </dd>
        </div>
      </dl>

      <div className="mi-card__actions">
        <Button
          variant="contained"
          size="small"
          endIcon={<ArrowForwardRounded className="mi-flip" />}
          onClick={() => navigate(`/profile/${tutor.id}`)}
        >
          {t('DIRECTORY.OPENPROFILE')}
        </Button>
        {canMessage && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<ChatBubbleOutlineRounded />}
            disabled={isStarting}
            onClick={() => startConversation(tutor.id, courses[0]?.full)}
          >
            {t('MESSAGES.MESSAGE_BUTTON')}
          </Button>
        )}
        {canRequest && (
          <Button
            variant="text"
            size="small"
            onClick={() => setRequestOpen(true)}
          >
            {t('SESSION_REQUEST.BUTTON')}
          </Button>
        )}
      </div>

      {requestOpen && (
        <Dialog
          maxWidth="sm"
          fullWidth
          open
          onClose={() => setRequestOpen(false)}
        >
          <RequestSessionsModal
            instructor={tutor}
            handleClose={() => setRequestOpen(false)}
          />
        </Dialog>
      )}
    </article>
  );
};

/**
 * The tutors the student, or the family, learns with: one card each with
 * the courses taken, the hours left and the next lesson.
 */
const MyInstructors: FC = () => {
  const { t } = useTranslation();
  const rtlClass = useRtlClass();
  const currentUser = useAppSelector(selectCurrentUser);
  const isParent = currentUser?.type === 'Parent';
  const family = useFamily(isParent);
  const { all } = useActiveChild(family.data?.children);
  const [course, setCourse] = useState<GradeSubject | null>(null);

  const coursesQuery = useGradeSubjects();
  const instructorsQuery = useMyInstructors(
    course ? { grade_subject_id: course.id } : {},
  );
  const packagesQuery = usePackages(1, 100);
  const sessionsQuery = useSessions(1, 100);

  const instructors = instructorsQuery.data?.data ?? [];
  const packages = useMemo(
    () => packagesQuery.data?.data ?? [],
    [packagesQuery.data],
  );
  const nextByTutor = useMemo(() => {
    const now = Date.now();
    const map = new Map<number, SessionType>();
    (sessionsQuery.data?.data ?? [])
      .filter(
        (s) =>
          UPCOMING.includes(s.status) &&
          new Date(s.start_time).getTime() > now - 60 * 60 * 1000,
      )
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
      .forEach((s) => {
        const id = s.tutor?.id;
        if (id !== undefined && !map.has(id)) map.set(id, s);
      });
    return map;
  }, [sessionsQuery.data]);

  // A request is about one student: a parent asks for a child, not for all
  const canRequest = currentUser?.type === 'Student' || (isParent && !all);
  const loading = instructorsQuery.isLoading;

  return (
    <div className={`my-instructors dashboard-page ${rtlClass}`}>
      <header className="dashboard-header">
        <div className="container dashboard-header__inner">
          <div className="dashboard-header__text">
            <h1 className="dashboard-header__title">
              {t('NAVIGATION.MY_INSTRUCTORS')}
              {!loading && instructors.length > 0 && (
                <span className="dashboard-header__count">
                  {instructors.length}
                </span>
              )}
            </h1>
            <p className="dashboard-header__subtitle">
              {t('MYINSTRUCTORS.SUBTITLE')}
            </p>
          </div>
        </div>
      </header>

      <div className="container dashboard-page__body">
        {isParent && <ChildTabs />}

        <div className="mi-toolbar">
          <Autocomplete
            className="mi-toolbar__course"
            value={course}
            onChange={(_, value) => setCourse(value)}
            options={coursesQuery.data?.data ?? []}
            getOptionLabel={(option) => option.full_course_name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            loading={coursesQuery.isLoading}
            noOptionsText={t('MYSESSIONS.FILTERS.NO_COURSES_FOUND')}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                label={t('MYSESSIONS.FILTERS.COURSE')}
              />
            )}
          />
        </div>

        {loading && (
          <div className="mi-grid">
            {[0, 1, 2].map((i) => (
              <Skeleton
                key={i}
                variant="rounded"
                height={300}
                sx={{ borderRadius: '2rem' }}
              />
            ))}
          </div>
        )}

        {!loading && instructors.length === 0 && (
          <div className="dashboard-empty">
            <div className="dashboard-empty__img" aria-hidden="true">
              <EmptyImg />
            </div>
            <p className="dashboard-empty__title">
              {t('MYINSTRUCTORS.EMPTY.FIRST_P')}
            </p>
            <p className="dashboard-empty__text">
              {t('MYINSTRUCTORS.EMPTY.SECOND_P')}
            </p>
            <Button
              component={Link}
              to={isParent ? '/trial' : '/home'}
              variant="contained"
            >
              {isParent
                ? t('NAVIGATION.FREE_TRIAL')
                : t('DASHBOARD.INSTRUCTORS.FIND')}
            </Button>
          </div>
        )}

        {!loading && instructors.length > 0 && (
          <div className="mi-grid">
            {instructors.map((tutor) => (
              <TutorCard
                key={tutor.id}
                tutor={tutor}
                packages={packages.filter((pkg) => pkg.tutor?.id === tutor.id)}
                next={nextByTutor.get(tutor.id)}
                isParent={isParent}
                canRequest={canRequest}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyInstructors;
