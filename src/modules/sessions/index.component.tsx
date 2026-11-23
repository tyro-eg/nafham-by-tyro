import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { Autocomplete, TextField } from '@mui/material';
import {
  CalendarMonthRounded,
  CancelOutlined,
  CheckCircleOutlined,
  EventAvailableOutlined,
  HourglassEmptyOutlined,
  ViewAgendaRounded,
} from '@mui/icons-material';

import { SessionFilters } from '../../lib/queryKeys';
import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import { useChildStats } from '../../hooks/useFamily';
import { useMyInstructors } from '../../hooks/useInstructors';
import { useGradeSubjects } from '../../hooks/useGradeSubjects';
import { useSessionSummary } from '../../hooks/useSessions';
import { useRtlClass } from '../../assets/utils/utils';
import type { GradeSubject, Instructor } from '../../assets/types';
import ChildTabs from '../family/child-tabs.component';
import TrialRequestsCard from '../trial/trial-requests-card.component';
import HoursCard from './hours-card/hours-card.component';

import SessionsList from './sessions-info/sessions-list/sessions-list.component';
import SessionsCalendarContainer from './sessions-info/sessions-calendar-container/sessions-calendar-container.component';
import NextUp from './next-up/next-up.component';
import CalendarLegend, { useChildColors } from './calendar-legend.component';

import './dashboard-shell.styles.scss';
import './index.styles.scss';

const STATUSES = [
  'all',
  'scheduled',
  'open',
  'completed',
  'cancelled',
] as const;
type Status = (typeof STATUSES)[number];

/**
 * The sessions page: the numbers beside the title, the live or next lesson
 * large, one toolbar (status pills, tutor, course, list or calendar), then
 * the lessons as a timeline grouped by day.
 */
const Sessions: FC = () => {
  const { t } = useTranslation();
  const rtlClass = useRtlClass();
  const currentUser = useAppSelector(selectCurrentUser);
  const isParent = currentUser?.type === 'Parent';
  const isTutor = currentUser?.type === 'Tutor';

  // A dashboard tile can open the page on one status: /my_sessions?status=completed
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<Status>(() => {
    const asked = searchParams.get('status');
    return STATUSES.find((key) => key === asked) ?? 'all';
  });
  const [tutor, setTutor] = useState<Instructor | null>(null);
  const [course, setCourse] = useState<GradeSubject | null>(null);
  // The menu's old Calendar item opens /my_sessions?view=calendar
  const [view, setView] = useState<'list' | 'calendar'>(() =>
    searchParams.get('view') === 'calendar' ? 'calendar' : 'list',
  );
  const childColors = useChildColors(isParent);

  // A parent sees the chosen child's counts; a student their own. A tutor's
  // profile has no session totals, so theirs come from the summary (catchup:
  // My Sessions showed a tutor 0 completed and 0 cancelled)
  const childStats = useChildStats(isParent);
  const tutorSummary = useSessionSummary(isTutor);
  const stats = useMemo(() => {
    const totals = isTutor ? tutorSummary.data?.totals : undefined;
    const source = isParent ? childStats.data : currentUser;
    return [
      {
        key: 'upcoming',
        icon: <EventAvailableOutlined />,
        tone: 'brand',
        value: source?.upcoming_sessions_count ?? 0,
        label: t('MYSESSIONS.OVERVIEW.UPCOMING'),
        status: 'scheduled' as Status,
      },
      {
        key: 'unscheduled',
        icon: <HourglassEmptyOutlined />,
        tone: 'accent',
        value: source?.unscheduled_hours ?? 0,
        label: t('MYSESSIONS.OVERVIEW.UNSCHEDULED'),
        to: '/my_packages',
      },
      {
        key: 'completed',
        icon: <CheckCircleOutlined />,
        tone: 'mint',
        value: totals?.completed ?? source?.completed_sessions_count ?? 0,
        label: t('MYSESSIONS.OVERVIEW.COMPLETED'),
        status: 'completed' as Status,
      },
      {
        key: 'cancelled',
        icon: <CancelOutlined />,
        tone: 'neutral',
        value: totals?.cancelled ?? source?.cancelled_sessions_count ?? 0,
        label: t('MYSESSIONS.OVERVIEW.CANCELLED'),
        status: 'cancelled' as Status,
      },
    ] as {
      key: string;
      icon: JSX.Element;
      tone: string;
      value: number;
      label: string;
      status?: Status;
      to?: string;
    }[];
  }, [currentUser, childStats.data, isParent, isTutor, tutorSummary.data, t]);

  const statsLoading = isTutor
    ? tutorSummary.isLoading
    : isParent && childStats.isLoading;

  const instructorsQuery = useMyInstructors({}, { enabled: !isTutor });
  const coursesQuery = useGradeSubjects();

  const filters = useMemo<SessionFilters>(
    () => ({
      ...(status !== 'all' ? { status } : {}),
      ...(tutor ? { tutor_id: tutor.id } : {}),
      ...(course ? { grade_subject_id: course.id } : {}),
    }),
    [status, tutor, course],
  );

  return (
    <section className={`sessions dashboard-page ${rtlClass}`}>
      <header className="dashboard-header">
        <div className="container dashboard-header__inner">
          <div className="dashboard-header__text">
            <h1 className="dashboard-header__title">
              {t('NAVIGATION.SESSIONS')}
            </h1>
            <p className="dashboard-header__subtitle">
              {t('MYSESSIONS.SUBTITLE')}
            </p>
          </div>
          <ul className="ss-stats" aria-label={t('MYSESSIONS.OVERVIEW.TITLE')}>
            {stats.map((stat) => {
              const className = `ss-stat ss-stat--${stat.tone} ss-stat--link${
                stat.status && stat.status === status ? ' ss-stat--on' : ''
              }`;
              // "–" until the numbers arrive, never a misleading 0
              const body = (
                <>
                  <span className="ss-stat__icon" aria-hidden="true">
                    {stat.icon}
                  </span>
                  <span className="ss-stat__value">
                    {statsLoading ? '–' : stat.value}
                  </span>
                  <span className="ss-stat__label">{stat.label}</span>
                </>
              );
              return (
                <li key={stat.key}>
                  {stat.to ? (
                    <Link to={stat.to} className={className}>
                      {body}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className={className}
                      aria-pressed={stat.status === status}
                      onClick={() =>
                        stat.status &&
                        setStatus(stat.status === status ? 'all' : stat.status)
                      }
                    >
                      {body}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </header>

      <div className="sessions__container container dashboard-page__body">
        {isParent && <ChildTabs />}

        {/* Hours done and left, and free trials (23 Nov 2026) */}
        {!isTutor && <HoursCard isParent={isParent} />}

        {/* Free trials still waiting for an instructor to confirm */}
        {!isTutor && <TrialRequestsCard showStudent={isParent} />}

        <NextUp filters={filters} />

        <div className="ss-toolbar">
          <div
            className="ss-pills"
            role="radiogroup"
            aria-label={t('MYSESSIONS.FILTERS.SESSIONSTATE')}
          >
            {STATUSES.map((key) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={status === key}
                className={`ss-pill${status === key ? ' ss-pill--on' : ''}`}
                onClick={() => setStatus(key)}
              >
                {t(
                  `MYSESSIONS.FILTERS.${key === 'open' ? 'LIVE' : key.toUpperCase()}`,
                )}
              </button>
            ))}
          </div>

          <div className="ss-toolbar__fields">
            {!isTutor && (
              <Autocomplete
                className="ss-toolbar__field"
                size="small"
                value={tutor}
                onChange={(_, value) => setTutor(value)}
                options={instructorsQuery.data?.data ?? []}
                getOptionLabel={(option) =>
                  `${option.first_name} ${option.last_name}`.trim()
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                noOptionsText={t('MYSESSIONS.FILTERS.NO_INSTRUCTORS_FOUND')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('MYSESSIONS.FILTERS.INSTRUCTOR')}
                  />
                )}
              />
            )}
            <Autocomplete
              className="ss-toolbar__field"
              size="small"
              value={course}
              onChange={(_, value) => setCourse(value)}
              options={coursesQuery.data?.data ?? []}
              getOptionLabel={(option) => option.full_course_name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText={t('MYSESSIONS.FILTERS.NO_COURSES_FOUND')}
              renderInput={(params) => (
                <TextField {...params} label={t('MYSESSIONS.FILTERS.COURSE')} />
              )}
            />
          </div>

          <div
            className="ss-view"
            role="group"
            aria-label={t('MYSESSIONS.MAIN.LIST')}
          >
            <button
              type="button"
              aria-pressed={view === 'list'}
              className={`ss-view__btn${view === 'list' ? ' ss-view__btn--on' : ''}`}
              onClick={() => setView('list')}
            >
              <ViewAgendaRounded /> {t('MYSESSIONS.MAIN.LIST')}
            </button>
            <button
              type="button"
              aria-pressed={view === 'calendar'}
              className={`ss-view__btn${view === 'calendar' ? ' ss-view__btn--on' : ''}`}
              onClick={() => setView('calendar')}
            >
              <CalendarMonthRounded /> {t('MYSESSIONS.MAIN.CALENDAR')}
            </button>
          </div>
        </div>

        {view === 'list' ? (
          <SessionsList filters={filters} grouped />
        ) : (
          <div className="ss-calendar">
            <CalendarLegend kids={childColors.children} />
            <SessionsCalendarContainer
              filters={filters}
              enableWeekView
              colorByStudent={childColors.colorByStudent}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default Sessions;
