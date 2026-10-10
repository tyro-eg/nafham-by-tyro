import { FC, ReactNode, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Avatar, Button, Skeleton } from '@mui/material';
import {
  ArrowForwardRounded,
  CalendarMonthRounded,
  EditCalendarRounded,
  EmojiEventsRounded,
  GroupsRounded,
  SchoolRounded,
  StarRounded,
  TrendingUpRounded,
  VideocamRounded,
  WarningAmberRounded,
} from '@mui/icons-material';

import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import { useSessions } from '../../hooks/useSessions';
import { usePackages } from '../../hooks/usePackages';
import { useInstructor } from '../../hooks/useInstructors';
import { useRtlClass } from '../../assets/utils/utils';
import RatingSummary from '../../component/rating-summary/rating-summary.component';
import type { SessionType } from '../../assets/types';
import heroArt from '../../assets/images/newLanding/start-learning.webp';
import emptyArt from '../../assets/images/newLanding/rafiki.svg?url';
import {
  formatHours,
  subjectName,
  upcomingSessions,
  weeklyHours,
} from './dashboard.utils';
import { buildStudents } from '../my-students/my-students.utils';

import './dashboard.styles.scss';
import './tutor-dashboard.styles.scss';

const HISTORY_SIZE = 100;

interface SectionProps {
  title: string;
  icon?: ReactNode;
  action?: { to: string; label: string };
  children: ReactNode;
  className?: string;
}

const Section: FC<SectionProps> = ({
  title,
  icon,
  action,
  children,
  className,
}) => (
  <section className={`sd-card ${className || ''}`}>
    <header className="sd-card__header">
      <h2 className="sd-card__title td-title">
        {icon && (
          <span className="td-title__icon" aria-hidden="true">
            {icon}
          </span>
        )}
        {title}
      </h2>
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

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const TutorDashboard: FC = () => {
  const { t, i18n } = useTranslation();
  const rtlClass = useRtlClass();
  const currentUser = useAppSelector(selectCurrentUser);

  const sessionsQuery = useSessions(1, HISTORY_SIZE);
  const packagesQuery = usePackages(1, HISTORY_SIZE);
  const profileQuery = useInstructor(currentUser?.id || 0, !!currentUser);

  const now = useMemo(() => new Date(), []);
  const locale = `${i18n.language}-u-nu-latn`;
  const loading = sessionsQuery.isLoading;

  const sessions = useMemo(
    () => sessionsQuery.data?.data || [],
    [sessionsQuery.data],
  );
  const packages = useMemo(
    () => packagesQuery.data?.data || [],
    [packagesQuery.data],
  );
  const profile = profileQuery.data;

  const upcoming = useMemo(
    () => upcomingSessions(sessions, now),
    [sessions, now],
  );
  const today = upcoming.filter((s) => isSameDay(new Date(s.start_time), now));
  const weeks = useMemo(() => weeklyHours(sessions, now), [sessions, now]);
  const students = useMemo(
    () => buildStudents(packages, sessions, now),
    [packages, sessions, now],
  );

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const completed = sessions.filter((s) => s.status === 'completed');
  const hoursThisMonth = completed
    .filter((s) => new Date(s.start_time) >= monthStart)
    .reduce(
      (acc, s) =>
        acc +
        (new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) /
          3600000,
      0,
    );
  const missed = sessions.filter((s) => s.status === 'missed').length;
  const canceled = sessions.filter((s) => s.status === 'canceled').length;
  const activeStudents = students.filter((s) => s.active).length;
  const maxWeekHours = Math.max(1, ...weeks.map((w) => w.hours));

  // Students who need a nudge: nearly out of hours, or hours but nothing booked
  const attention = students
    .filter(
      (s) =>
        (s.hoursRemaining > 0 && s.hoursRemaining <= 1) ||
        (s.hoursRemaining > 0 && !s.nextSession),
    )
    .slice(0, 4);

  const reviews = [...(profile?.tutor_reviews || [])]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 3);

  const activePackages = packages.filter(
    (p) => Number(p.remaining_hours) > 0,
  ).length;
  const hoursSold = packages.reduce(
    (acc, p) => acc + (Number(p.original_hours) || 0),
    0,
  );
  const hoursLeft = packages.reduce(
    (acc, p) => acc + (Number(p.remaining_hours) || 0),
    0,
  );

  const nextSession = upcoming[0];
  const laterSessions = upcoming.slice(1, 4);
  const studentName = (s: SessionType) =>
    `${s.student?.first_name || ''} ${s.student?.last_name || ''}`.trim();
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
    if (!nextSession) return t('TUTOR_DASHBOARD.HERO.NO_NEXT');
    const details = {
      subject: subjectName(nextSession.grade_subject?.full_course_name),
      student: studentName(nextSession),
      when: startsIn(nextSession.start_time).toLowerCase(),
    };
    return today.length > 0
      ? t('TUTOR_DASHBOARD.HERO.TODAY', { count: today.length, ...details })
      : t('TUTOR_DASHBOARD.HERO.NEXT', details);
  })();

  const rating = Number(profile?.average_rating) || 0;
  const stats = [
    {
      key: 'upcoming',
      tone: 'sky',
      icon: <CalendarMonthRounded />,
      value: String(upcoming.length),
      label: t('TUTOR_DASHBOARD.STATS.UPCOMING'),
    },
    {
      key: 'taught',
      tone: 'mint',
      icon: <SchoolRounded />,
      value: formatHours(hoursThisMonth),
      label: t('TUTOR_DASHBOARD.STATS.HOURS_MONTH'),
    },
    {
      key: 'students',
      tone: 'sun',
      icon: <GroupsRounded />,
      value: String(activeStudents),
      label: t('TUTOR_DASHBOARD.STATS.ACTIVE_STUDENTS'),
    },
    {
      key: 'rating',
      tone: 'lilac',
      icon: <StarRounded />,
      value: rating ? rating.toFixed(1) : '–',
      label: t('TUTOR_DASHBOARD.STATS.RATING', {
        count: Number(profile?.number_of_reviews) || 0,
      }),
    },
  ];

  return (
    <div className={`student-dashboard tutor-dashboard ${rtlClass}`}>
      <div className="container sd-container">
        {/* ---------- Welcome ---------- */}
        <section className="sd-hero">
          <div className="sd-hero__content">
            <div className="sd-hero__identity">
              <Avatar
                src={currentUser?.avatar || profile?.avatar}
                alt={currentUser?.first_name}
                className="sd-hero__avatar"
              >
                {`${currentUser?.first_name?.[0] || ''}${
                  currentUser?.last_name?.[0] || ''
                }`.toUpperCase()}
              </Avatar>
              <span className="sd-hero__eyebrow">
                {t('TUTOR_DASHBOARD.HERO.EYEBROW')}
              </span>
            </div>
            <h1 className="sd-hero__title">
              {t('DASHBOARD.HERO.WELCOME', {
                name: currentUser?.first_name || '',
              })}
            </h1>
            {loading ? (
              <Skeleton className="sd-hero__skeleton" width="70%" height={28} />
            ) : (
              <p className="sd-hero__message">{heroMessage}</p>
            )}
            <div className="sd-hero__actions">
              <Button
                component={Link}
                to={`/profile/${currentUser?.id}`}
                className="sd-hero__primary"
                startIcon={<EditCalendarRounded />}
              >
                {t('TUTOR_DASHBOARD.HERO.AVAILABILITY')}
              </Button>
              <Button
                component={Link}
                to="/my_students"
                className="sd-hero__secondary"
              >
                {t('NAVIGATION.MY_STUDENTS')}
              </Button>
            </div>
          </div>
          <img src={heroArt} alt="" className="sd-hero__art" />
        </section>

        {/* ---------- Highlights ---------- */}
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

        <div className="sd-grid td-grid">
          <div className="sd-col">
            {/* ---------- Up next ---------- */}
            <Section
              title={t('TUTOR_DASHBOARD.SCHEDULE.TITLE')}
              icon={<CalendarMonthRounded />}
              action={{ to: '/my_sessions', label: t('DASHBOARD.VIEW_ALL') }}
            >
              {loading && <Skeleton variant="rounded" height={140} />}
              {!loading && !nextSession && (
                <div className="sd-empty">
                  <img src={emptyArt} alt="" className="sd-empty__art" />
                  <p className="sd-empty__text">
                    {t('TUTOR_DASHBOARD.SCHEDULE.EMPTY')}
                  </p>
                  <Button
                    component={Link}
                    to={`/profile/${currentUser?.id}`}
                    variant="outlined"
                  >
                    {t('TUTOR_DASHBOARD.HERO.AVAILABILITY')}
                  </Button>
                </div>
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
                        src={nextSession.student?.image}
                        alt={studentName(nextSession)}
                        sx={{ width: 32, height: 32 }}
                      />
                      {studentName(nextSession)}
                    </span>
                  </div>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<VideocamRounded />}
                    disabled={
                      nextSession.status !== 'open' || !nextSession.session_link
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
                              src={s.student?.image}
                              alt={studentName(s)}
                              sx={{ width: 28, height: 28 }}
                            />
                            <span>{studentName(s)}</span>
                          </span>
                        </div>
                      </li>
                    ))}
                  </ol>
                </>
              )}
            </Section>

            {/* ---------- Teaching activity ---------- */}
            <Section
              title={t('TUTOR_DASHBOARD.ACTIVITY.TITLE')}
              icon={<TrendingUpRounded />}
            >
              <div className="sd-cheer">
                <span className="sd-cheer__icon" aria-hidden="true">
                  <EmojiEventsRounded />
                </span>
                <div>
                  <p className="sd-cheer__text">
                    {t('TUTOR_DASHBOARD.ACTIVITY.CHEER', {
                      hours: formatHours(hoursThisMonth),
                      count: hoursThisMonth,
                    })}
                  </p>
                  <p className="sd-cheer__sub">
                    {t('TUTOR_DASHBOARD.ACTIVITY.TOTAL', {
                      count: completed.length,
                    })}
                  </p>
                </div>
              </div>
              <div className="sd-progress">
                <div className="sd-progress__chart">
                  <h3 className="sd-subheading">
                    {t('TUTOR_DASHBOARD.ACTIVITY.WEEKLY')}
                  </h3>
                  <div
                    className="sd-chart"
                    role="img"
                    aria-label={t('TUTOR_DASHBOARD.ACTIVITY.WEEKLY')}
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
                    {t('TUTOR_DASHBOARD.ACTIVITY.SESSIONS')}
                  </h3>
                  <div className="sd-attendance">
                    <span className="sd-attendance__item sd-attendance__item--done">
                      <strong>{completed.length}</strong>
                      {t('DASHBOARD.PROGRESS.COMPLETED')}
                    </span>
                    <span className="sd-attendance__item sd-attendance__item--missed">
                      <strong>{missed}</strong>
                      {t('DASHBOARD.PROGRESS.MISSED')}
                    </span>
                    <span className="sd-attendance__item sd-attendance__item--canceled">
                      <strong>{canceled}</strong>
                      {t('DASHBOARD.PROGRESS.CANCELED')}
                    </span>
                  </div>

                  <h3 className="sd-subheading sd-subheading--spaced">
                    {t('TUTOR_DASHBOARD.PACKAGES.TITLE')}
                  </h3>
                  <div className="td-packages">
                    <div>
                      <strong>{activePackages}</strong>
                      <span>{t('TUTOR_DASHBOARD.PACKAGES.ACTIVE')}</span>
                    </div>
                    <div>
                      <strong>{formatHours(hoursSold)}</strong>
                      <span>{t('TUTOR_DASHBOARD.PACKAGES.SOLD')}</span>
                    </div>
                    <div>
                      <strong>{formatHours(hoursLeft)}</strong>
                      <span>{t('TUTOR_DASHBOARD.PACKAGES.LEFT')}</span>
                    </div>
                  </div>
                  <Link className="td-packages__link" to="/my_packages">
                    {t('TUTOR_DASHBOARD.PACKAGES.VIEW')}
                    <ArrowForwardRounded className="sd-flip" />
                  </Link>
                </div>
              </div>
            </Section>
          </div>

          <aside className="sd-col sd-col--side">
            {/* ---------- Students needing attention ---------- */}
            <Section
              title={t('TUTOR_DASHBOARD.ATTENTION.TITLE')}
              icon={<WarningAmberRounded />}
              action={{
                to: '/my_students',
                label: t('DASHBOARD.VIEW_ALL'),
              }}
            >
              {attention.length === 0 ? (
                <p className="td-ok">{t('TUTOR_DASHBOARD.ATTENTION.EMPTY')}</p>
              ) : (
                <ul className="td-attention">
                  {attention.map((s) => {
                    const low = s.hoursRemaining <= 1;
                    return (
                      <li key={s.id} className="td-attention__item">
                        <Avatar
                          src={s.avatar}
                          alt={s.firstName}
                          className="td-attention__avatar"
                        >
                          {`${s.firstName?.[0] || ''}${
                            s.lastName?.[0] || ''
                          }`.toUpperCase()}
                        </Avatar>
                        <div className="td-attention__text">
                          <span className="td-attention__name">
                            {s.firstName} {s.lastName}
                          </span>
                          <span
                            className={`td-attention__reason td-attention__reason--${
                              low ? 'low' : 'idle'
                            }`}
                          >
                            {low
                              ? t('TUTOR_DASHBOARD.ATTENTION.LOW', {
                                  hours: formatHours(s.hoursRemaining),
                                  count: s.hoursRemaining,
                                })
                              : t('TUTOR_DASHBOARD.ATTENTION.IDLE', {
                                  hours: formatHours(s.hoursRemaining),
                                  count: s.hoursRemaining,
                                })}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Section>

            {/* ---------- Latest reviews ---------- */}
            <Section
              title={t('TUTOR_DASHBOARD.REVIEWS.TITLE')}
              icon={<StarRounded />}
              action={{
                to: `/profile/${currentUser?.id}`,
                label: t('DASHBOARD.VIEW_ALL'),
              }}
            >
              {rating > 0 && (
                <div className="td-rating">
                  <RatingSummary
                    value={rating}
                    count={profile?.number_of_reviews}
                  />
                </div>
              )}
              {reviews.length === 0 ? (
                <p className="sd-muted">{t('TUTOR_DASHBOARD.REVIEWS.EMPTY')}</p>
              ) : (
                <ul className="td-reviews">
                  {reviews.map((review) => (
                    <li key={review.id} className="td-review">
                      <div className="td-review__top">
                        <span className="td-review__name" dir="auto">
                          {review.student}
                        </span>
                        <RatingSummary value={review.rating} wholeStars />
                      </div>
                      <p className="td-review__text" dir="auto">
                        “{review.text}”
                      </p>
                      <span className="td-review__date">
                        {new Date(review.created_at).toLocaleDateString(
                          locale,
                          { day: 'numeric', month: 'short', year: 'numeric' },
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;
