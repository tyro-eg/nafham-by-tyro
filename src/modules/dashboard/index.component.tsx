import { FC, ReactNode, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Avatar, Button, Dialog, Skeleton } from '@mui/material';
import {
  AccessTimeRounded,
  ArrowForwardRounded,
  AutoStoriesRounded,
  CalendarMonthRounded,
  EmojiEventsRounded,
  EventAvailableRounded,
  LocalFireDepartmentRounded,
  PersonSearchRounded,
  VideocamRounded,
} from '@mui/icons-material';

import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import { useSessions } from '../../hooks/useSessions';
import { usePackages } from '../../hooks/usePackages';
import { useMyInstructors } from '../../hooks/useInstructors';
import { useRtlClass } from '../../assets/utils/utils';
import type { SessionType } from '../../assets/types';
import RequestSessionsModal from '../../modals/request-sessions-modal/request-sessions-modal.component';
import heroArt from '../../assets/images/newLanding/start-learning.webp';
import emptyArt from '../../assets/images/newLanding/rafiki.svg?url';
import {
  formatHours,
  studentInsights,
  subjectBreakdown,
  subjectName,
  upcomingSessions,
  weeklyHours,
} from './dashboard.utils';

import './dashboard.styles.scss';

// Enough history for the insights without paging through the API
const HISTORY_SIZE = 100;

// Friendly rotating colours for subjects and packages
const TONES = ['sky', 'mint', 'sun', 'lilac', 'coral'] as const;

interface SectionProps {
  title: string;
  action?: { to: string; label: string };
  children: ReactNode;
  className?: string;
}

const Section: FC<SectionProps> = ({ title, action, children, className }) => (
  <section className={`sd-card ${className || ''}`}>
    <header className="sd-card__header">
      <h2 className="sd-card__title">{title}</h2>
      {action && (
        <Link className="sd-card__link" to={action.to}>
          {action.label}
          <ArrowForwardRounded className="sd-flip" />
        </Link>
      )}
    </header>
    {children}
  </section>
);

type EmptyCta = { label: string } & ({ to: string } | { onClick: () => void });

const Empty: FC<{ text: string; cta?: EmptyCta }> = ({ text, cta }) => (
  <div className="sd-empty">
    <img src={emptyArt} alt="" className="sd-empty__art" />
    <p className="sd-empty__text">{text}</p>
    {cta && 'to' in cta && (
      <Button component={Link} to={cta.to} variant="outlined">
        {cta.label}
      </Button>
    )}
    {cta && 'onClick' in cta && (
      <Button onClick={cta.onClick} variant="outlined">
        {cta.label}
      </Button>
    )}
  </div>
);

/** Circular progress ring for package hours */
const Ring: FC<{ value: number; label: string; tone: string }> = ({
  value,
  label,
  tone,
}) => {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, value));
  return (
    <span className={`sd-ring sd-ring--${tone}`}>
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle className="sd-ring__track" cx="32" cy="32" r={radius} />
        <circle
          className="sd-ring__value"
          cx="32"
          cy="32"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
        />
      </svg>
      <span className="sd-ring__label">{label}</span>
    </span>
  );
};

const Dashboard: FC = () => {
  const { t, i18n } = useTranslation();
  const rtlClass = useRtlClass();
  const currentUser = useAppSelector(selectCurrentUser);
  // Students cannot book sessions; they send a request to support
  const [requestOpen, setRequestOpen] = useState(false);
  const openRequest = () => setRequestOpen(true);
  const closeRequest = () => setRequestOpen(false);

  const sessionsQuery = useSessions(1, HISTORY_SIZE);
  const packagesQuery = usePackages(1, 50);
  const instructorsQuery = useMyInstructors();

  // Keep "now" stable for the lifetime of the page
  const now = useMemo(() => new Date(), []);
  const locale = `${i18n.language}-u-nu-latn`;

  const sessions = useMemo(
    () => sessionsQuery.data?.data || [],
    [sessionsQuery.data],
  );
  const packages = useMemo(
    () => packagesQuery.data?.data || [],
    [packagesQuery.data],
  );
  const instructors = instructorsQuery.data?.data || [];

  const upcoming = useMemo(
    () => upcomingSessions(sessions, now),
    [sessions, now],
  );
  const insights = useMemo(
    () => studentInsights(sessions, packages, now),
    [sessions, packages, now],
  );
  const weeks = useMemo(() => weeklyHours(sessions, now), [sessions, now]);
  const subjects = useMemo(() => subjectBreakdown(sessions, 5), [sessions]);

  const loading = sessionsQuery.isLoading;
  const nextSession = upcoming[0];
  const laterSessions = upcoming.slice(1, 4);
  const maxWeekHours = Math.max(1, ...weeks.map((w) => w.hours));
  const activeWeeks = weeks.filter((w) => w.hours > 0).length;
  const firstName = currentUser?.first_name || '';
  const initials =
    `${currentUser?.first_name?.[0] || ''}${currentUser?.last_name?.[0] || ''}`.toUpperCase();

  const tutorName = (s: SessionType) =>
    `${s.tutor?.first_name || ''} ${s.tutor?.last_name || ''}`.trim();
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString(locale, {
      hour: 'numeric',
      minute: '2-digit',
    });
  const formatDay = (iso: string) =>
    new Date(iso).toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

  const startsIn = (iso: string) => {
    const diffMs = new Date(iso).getTime() - now.getTime();
    if (diffMs <= 0) return t('DASHBOARD.NEXT.LIVE_NOW');
    const minutes = Math.round(diffMs / 60000);
    if (minutes < 60) {
      return t('DASHBOARD.NEXT.IN_MINUTES', { count: Math.max(1, minutes) });
    }
    const hours = Math.round(minutes / 60);
    if (hours < 24) return t('DASHBOARD.NEXT.IN_HOURS', { count: hours });
    return t('DASHBOARD.NEXT.IN_DAYS', { count: Math.round(hours / 24) });
  };

  const heroMessage = (() => {
    if (loading) return '';
    if (nextSession) {
      return t('DASHBOARD.HERO.NEXT', {
        subject: subjectName(nextSession.grade_subject?.full_course_name),
        tutor: tutorName(nextSession),
        when: startsIn(nextSession.start_time).toLowerCase(),
      });
    }
    return t('DASHBOARD.HERO.NO_NEXT');
  })();

  const encouragement = (() => {
    if (insights.hoursThisMonth >= 4) {
      return t('DASHBOARD.PROGRESS.GREAT', {
        hours: formatHours(insights.hoursThisMonth),
        count: insights.hoursThisMonth,
      });
    }
    if (insights.hoursThisMonth > 0) {
      return t('DASHBOARD.PROGRESS.GOOD', {
        hours: formatHours(insights.hoursThisMonth),
        count: insights.hoursThisMonth,
      });
    }
    return t('DASHBOARD.PROGRESS.START');
  })();

  const stats = [
    {
      key: 'upcoming',
      tone: 'sky',
      icon: <CalendarMonthRounded />,
      value: String(upcoming.length),
      label: t('DASHBOARD.STATS.UPCOMING'),
    },
    {
      key: 'learned',
      tone: 'mint',
      icon: <AutoStoriesRounded />,
      value: formatHours(insights.hoursLearned),
      label: t('DASHBOARD.STATS.HOURS_LEARNED'),
    },
    {
      key: 'remaining',
      tone: 'sun',
      icon: <AccessTimeRounded />,
      value: formatHours(insights.hoursRemaining),
      label: t('DASHBOARD.STATS.HOURS_REMAINING'),
    },
    {
      key: 'attendance',
      tone: 'lilac',
      icon: <EmojiEventsRounded />,
      value:
        insights.attendanceRate === null
          ? '–'
          : `${Math.round(insights.attendanceRate * 100)}%`,
      label: t('DASHBOARD.STATS.ATTENDANCE'),
    },
  ];

  return (
    <div className={`student-dashboard ${rtlClass}`}>
      <div className="container sd-container">
        {/* ---------- Welcome ---------- */}
        <section className="sd-hero">
          <div className="sd-hero__content">
            <div className="sd-hero__identity">
              <Avatar
                src={currentUser?.avatar}
                alt={firstName}
                className="sd-hero__avatar"
              >
                {initials}
              </Avatar>
              <span className="sd-hero__eyebrow">
                {t('DASHBOARD.HERO.EYEBROW')}
              </span>
            </div>
            <h1 className="sd-hero__title">
              {t('DASHBOARD.HERO.WELCOME', { name: firstName })}
            </h1>
            {loading ? (
              <Skeleton className="sd-hero__skeleton" width="70%" height={28} />
            ) : (
              <p className="sd-hero__message">{heroMessage}</p>
            )}
            <div className="sd-hero__actions">
              <Button
                onClick={openRequest}
                className="sd-hero__primary"
                startIcon={<EventAvailableRounded />}
              >
                {t('DASHBOARD.BOOK_SESSION')}
              </Button>
              <Button
                component={Link}
                to="/my_sessions"
                className="sd-hero__secondary"
              >
                {t('DASHBOARD.HERO.MY_SESSIONS')}
              </Button>
            </div>
          </div>
          <img src={heroArt} alt="" className="sd-hero__art" />
        </section>

        {/* ---------- Quick stats ---------- */}
        <div className="sd-stats">
          {stats.map((stat) => (
            <div key={stat.key} className={`sd-stat sd-stat--${stat.tone}`}>
              <span className="sd-stat__icon" aria-hidden="true">
                {stat.icon}
              </span>
              {loading ? (
                <Skeleton width={56} height={44} />
              ) : (
                <span className="sd-stat__value">{stat.value}</span>
              )}
              <span className="sd-stat__label">{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="sd-grid">
          <div className="sd-col">
            {/* ---------- Up next ---------- */}
            <Section
              title={t('DASHBOARD.NEXT.TITLE')}
              action={{ to: '/my_sessions', label: t('DASHBOARD.VIEW_ALL') }}
            >
              {loading && <Skeleton variant="rounded" height={140} />}
              {!loading && !nextSession && (
                <Empty
                  text={t('DASHBOARD.NEXT.EMPTY')}
                  cta={{
                    onClick: openRequest,
                    label: t('DASHBOARD.BOOK_SESSION'),
                  }}
                />
              )}
              {nextSession && (
                <div
                  className={`sd-next${
                    nextSession.status === 'open' ? ' sd-next--live' : ''
                  }`}
                >
                  <div className="sd-next__date" aria-hidden="true">
                    <span className="sd-next__month">
                      {new Date(nextSession.start_time).toLocaleDateString(
                        locale,
                        { month: 'short' },
                      )}
                    </span>
                    <span className="sd-next__daynum">
                      {new Date(nextSession.start_time).toLocaleDateString(
                        locale,
                        { day: 'numeric' },
                      )}
                    </span>
                  </div>
                  <div className="sd-next__body">
                    <span className="sd-next__chip">
                      {nextSession.status === 'open' && (
                        <span className="sd-next__pulse" />
                      )}
                      {startsIn(nextSession.start_time)}
                    </span>
                    <h3 className="sd-next__subject" dir="auto">
                      {subjectName(nextSession.grade_subject?.full_course_name)}
                    </h3>
                    <p className="sd-next__when">
                      {formatDay(nextSession.start_time)} ·{' '}
                      {formatTime(nextSession.start_time)} –{' '}
                      {formatTime(nextSession.end_time)}
                    </p>
                    <span className="sd-next__tutor">
                      <Avatar
                        src={nextSession.tutor?.image}
                        alt={tutorName(nextSession)}
                        sx={{ width: 32, height: 32 }}
                      />
                      {tutorName(nextSession)}
                    </span>
                  </div>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<VideocamRounded />}
                    disabled={
                      nextSession.status !== 'open' ||
                      nextSession.awaiting_confirmation === true ||
                      !nextSession.session_link
                    }
                    onClick={() =>
                      window.open(nextSession.session_link, '_blank')
                    }
                    className="sd-next__join"
                  >
                    {t('DASHBOARD.NEXT.JOIN')}
                  </Button>
                </div>
              )}

              {laterSessions.length > 0 && (
                <>
                  <h3 className="sd-subheading">{t('DASHBOARD.NEXT.LATER')}</h3>
                  <ol className="sd-timeline">
                    {laterSessions.map((s) => (
                      <li key={s.id} className="sd-timeline__item">
                        <span className="sd-timeline__dot" />
                        <div className="sd-timeline__card">
                          <div className="sd-timeline__main">
                            <span className="sd-timeline__subject" dir="auto">
                              {subjectName(s.grade_subject?.full_course_name)}
                            </span>
                            <span className="sd-timeline__meta">
                              {new Date(s.start_time).toLocaleDateString(
                                locale,
                                {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short',
                                },
                              )}{' '}
                              · {formatTime(s.start_time)}
                            </span>
                          </div>
                          <span className="sd-timeline__tutor">
                            <Avatar
                              src={s.tutor?.image}
                              alt={tutorName(s)}
                              sx={{ width: 28, height: 28 }}
                            />
                            <span>{tutorName(s)}</span>
                          </span>
                        </div>
                      </li>
                    ))}
                  </ol>
                </>
              )}
            </Section>

            {/* ---------- Progress ---------- */}
            <Section title={t('DASHBOARD.PROGRESS.TITLE')}>
              <div className="sd-cheer">
                <span className="sd-cheer__icon" aria-hidden="true">
                  <LocalFireDepartmentRounded />
                </span>
                <div>
                  <p className="sd-cheer__text">{encouragement}</p>
                  <p className="sd-cheer__sub">
                    {t('DASHBOARD.PROGRESS.ACTIVE_WEEKS', {
                      count: activeWeeks,
                      total: weeks.length,
                    })}
                  </p>
                </div>
              </div>

              <div className="sd-progress">
                <div className="sd-progress__chart">
                  <h3 className="sd-subheading">
                    {t('DASHBOARD.PROGRESS.WEEKLY')}
                  </h3>
                  <div
                    className="sd-chart"
                    role="img"
                    aria-label={t('DASHBOARD.PROGRESS.WEEKLY')}
                  >
                    {weeks.map((week, index) => (
                      <div
                        key={week.start.toISOString()}
                        className={`sd-chart__col${
                          index === weeks.length - 1
                            ? ' sd-chart__col--current'
                            : ''
                        }`}
                      >
                        <span className="sd-chart__value">
                          {week.hours > 0 ? formatHours(week.hours) : ''}
                        </span>
                        <span className="sd-chart__track">
                          <span
                            className="sd-chart__bar"
                            style={{
                              height: `${Math.max(
                                week.hours > 0 ? 8 : 0,
                                (week.hours / maxWeekHours) * 100,
                              )}%`,
                            }}
                          />
                        </span>
                        <span className="sd-chart__label">
                          {index === weeks.length - 1
                            ? t('DASHBOARD.PROGRESS.THIS_WEEK')
                            : week.start.toLocaleDateString(locale, {
                                day: 'numeric',
                                month: 'short',
                              })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="sd-progress__side">
                  <h3 className="sd-subheading">
                    {t('DASHBOARD.PROGRESS.SUBJECTS')}
                  </h3>
                  {subjects.length === 0 ? (
                    <p className="sd-muted">
                      {t('DASHBOARD.PROGRESS.NO_HISTORY')}
                    </p>
                  ) : (
                    <ul className="sd-pills">
                      {subjects.map((subject, index) => (
                        <li
                          key={subject.name}
                          className={`sd-pill sd-pill--${
                            TONES[index % TONES.length]
                          }`}
                        >
                          <span dir="auto">{subject.name}</span>
                          <strong>
                            {t('DASHBOARD.HOURS_SHORT', {
                              hours: formatHours(subject.hours),
                            })}
                          </strong>
                        </li>
                      ))}
                    </ul>
                  )}

                  <h3 className="sd-subheading sd-subheading--spaced">
                    {t('DASHBOARD.PROGRESS.ATTENDANCE')}
                  </h3>
                  <div className="sd-attendance">
                    <span className="sd-attendance__item sd-attendance__item--done">
                      <strong>{insights.completed}</strong>
                      {t('DASHBOARD.PROGRESS.COMPLETED')}
                    </span>
                    <span className="sd-attendance__item sd-attendance__item--missed">
                      <strong>{insights.missed}</strong>
                      {t('DASHBOARD.PROGRESS.MISSED')}
                    </span>
                    <span className="sd-attendance__item sd-attendance__item--canceled">
                      <strong>{insights.canceled}</strong>
                      {t('DASHBOARD.PROGRESS.CANCELED')}
                    </span>
                  </div>
                </div>
              </div>
            </Section>
          </div>

          <aside className="sd-col sd-col--side">
            {/* ---------- Packages ---------- */}
            <Section
              title={t('DASHBOARD.PACKAGES.TITLE')}
              action={{ to: '/my_packages', label: t('DASHBOARD.VIEW_ALL') }}
            >
              {packagesQuery.isLoading && (
                <Skeleton variant="rounded" height={160} />
              )}
              {!packagesQuery.isLoading && packages.length === 0 && (
                <Empty text={t('DASHBOARD.PACKAGES.EMPTY')} />
              )}
              <ul className="sd-packages">
                {packages.slice(0, 4).map((pkg, index) => {
                  const total = Number(pkg.original_hours) || 0;
                  const remaining = Number(pkg.remaining_hours) || 0;
                  const tone = TONES[index % TONES.length];
                  return (
                    <li key={pkg.id} className="sd-package">
                      <Ring
                        value={total > 0 ? remaining / total : 0}
                        label={formatHours(remaining)}
                        tone={tone}
                      />
                      <div className="sd-package__text">
                        <span className="sd-package__subject" dir="auto">
                          {subjectName(pkg.grade_subject?.full_course_name)}
                        </span>
                        <span className="sd-package__tutor">
                          {t('DASHBOARD.PACKAGES.WITH', {
                            tutor: `${pkg.tutor?.first_name || ''} ${
                              pkg.tutor?.last_name || ''
                            }`.trim(),
                          })}
                        </span>
                        <span className="sd-package__meta">
                          {t('DASHBOARD.PACKAGES.LEFT_OF', {
                            left: formatHours(remaining),
                            total: formatHours(total),
                          })}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Section>

            {/* ---------- Instructors ---------- */}
            <Section
              title={t('DASHBOARD.INSTRUCTORS.TITLE')}
              action={{ to: '/my_instructors', label: t('DASHBOARD.VIEW_ALL') }}
            >
              {instructorsQuery.isLoading && (
                <Skeleton variant="rounded" height={140} />
              )}
              {!instructorsQuery.isLoading && instructors.length === 0 && (
                <Empty
                  text={t('DASHBOARD.INSTRUCTORS.EMPTY')}
                  cta={{ to: '/home', label: t('DASHBOARD.INSTRUCTORS.FIND') }}
                />
              )}
              <ul className="sd-tutors">
                {instructors.slice(0, 4).map((instructor) => (
                  <li key={instructor.id}>
                    <Link to={`/profile/${instructor.id}`} className="sd-tutor">
                      <Avatar
                        src={instructor.avatar}
                        alt={instructor.first_name}
                        className="sd-tutor__avatar"
                      />
                      <span className="sd-tutor__text">
                        <span className="sd-tutor__name">
                          {instructor.first_name} {instructor.last_name}
                        </span>
                        <span className="sd-tutor__fields" dir="auto">
                          {(instructor.instructor_fields || [])
                            .slice(0, 2)
                            .join(' · ')}
                        </span>
                      </span>
                      {!!instructor.average_rating && (
                        <span className="sd-tutor__rating">
                          <span aria-hidden="true">★</span>
                          {Number(instructor.average_rating).toFixed(1)}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
              <Button
                component={Link}
                to="/home"
                variant="outlined"
                fullWidth
                startIcon={<PersonSearchRounded />}
                className="sd-tutors__find"
              >
                {t('DASHBOARD.INSTRUCTORS.FIND')}
              </Button>
            </Section>
          </aside>
        </div>
      </div>

      {requestOpen && (
        <Dialog
          maxWidth="sm"
          fullWidth
          open
          onClose={closeRequest}
          aria-labelledby="request-sessions-dialog"
        >
          <RequestSessionsModal handleClose={closeRequest} />
        </Dialog>
      )}
    </div>
  );
};

export default Dashboard;
