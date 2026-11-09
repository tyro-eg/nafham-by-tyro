import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { useRtlClass } from '../../assets/utils/utils';
import type { GradeSubject, Instructor } from '../../assets/types';
import ChildTabs from '../family/child-tabs.component';

import SessionsList from './sessions-info/sessions-list/sessions-list.component';
import SessionsCalendarContainer from './sessions-info/sessions-calendar-container/sessions-calendar-container.component';

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
 * The sessions page: the numbers in one strip, one toolbar (status pills,
 * tutor, course, list or calendar), then the lessons grouped by day.
 */
const Sessions: FC = () => {
  const { t } = useTranslation();
  const rtlClass = useRtlClass();
  const currentUser = useAppSelector(selectCurrentUser);
  const isParent = currentUser?.type === 'Parent';
  const isTutor = currentUser?.type === 'Tutor';

  const [status, setStatus] = useState<Status>('all');
  const [tutor, setTutor] = useState<Instructor | null>(null);
  const [course, setCourse] = useState<GradeSubject | null>(null);
  const [view, setView] = useState<'list' | 'calendar'>('list');

  // A parent sees the chosen child's counts; a student their own
  const childStats = useChildStats(isParent);
  const stats = useMemo(() => {
    const source = isParent ? childStats.data : currentUser;
    return [
      {
        key: 'upcoming',
        icon: <EventAvailableOutlined />,
        tone: 'brand',
        value: source?.upcoming_sessions_count ?? 0,
        label: t('MYSESSIONS.OVERVIEW.UPCOMING'),
      },
      {
        key: 'unscheduled',
        icon: <HourglassEmptyOutlined />,
        tone: 'accent',
        value: source?.unscheduled_hours ?? 0,
        label: t('MYSESSIONS.OVERVIEW.UNSCHEDULED'),
      },
      {
        key: 'completed',
        icon: <CheckCircleOutlined />,
        tone: 'mint',
        value: source?.completed_sessions_count ?? 0,
        label: t('MYSESSIONS.OVERVIEW.COMPLETED'),
      },
      {
        key: 'cancelled',
        icon: <CancelOutlined />,
        tone: 'neutral',
        value: source?.cancelled_sessions_count ?? 0,
        label: t('MYSESSIONS.OVERVIEW.CANCELLED'),
      },
    ];
  }, [currentUser, childStats.data, isParent, t]);

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
        </div>
      </header>

      <div className="sessions__container container dashboard-page__body">
        {isParent && <ChildTabs />}

        <ul className="ss-stats" aria-label={t('MYSESSIONS.OVERVIEW.TITLE')}>
          {stats.map((stat) => (
            <li key={stat.key} className={`ss-stat ss-stat--${stat.tone}`}>
              <span className="ss-stat__icon" aria-hidden="true">
                {stat.icon}
              </span>
              <span className="ss-stat__value">{stat.value}</span>
              <span className="ss-stat__label">{stat.label}</span>
            </li>
          ))}
        </ul>

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
            <SessionsCalendarContainer filters={filters} enableWeekView />
          </div>
        )}
      </div>
    </section>
  );
};

export default Sessions;
