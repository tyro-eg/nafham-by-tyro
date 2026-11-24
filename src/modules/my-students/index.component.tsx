import { FC, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Avatar,
  Button,
  InputAdornment,
  MenuItem,
  Skeleton,
  TextField,
} from '@mui/material';
import {
  AccessTimeRounded,
  CalendarMonthRounded,
  ChatBubbleOutlineRounded,
  CheckCircleRounded,
  GroupsRounded,
  SchoolRounded,
  SearchRounded,
} from '@mui/icons-material';

import { useSessionSummary, useTrialsSummary } from '../../hooks/useSessions';
import { hoursText, trialDots, widths } from '../../lib/hours-meter';
import { useAllPackages } from '../../hooks/usePackages';
import { useStartConversation } from '../../hooks/useStreamChat';
import { useRtlClass } from '../../assets/utils/utils';
import { formatHours, subjectName } from '../dashboard/dashboard.utils';
import { buildStudents, StudentSummary } from './my-students.utils';
import emptyArt from '../../assets/images/newLanding/rafiki.svg?url';

import PageTabs from '../../component/page-tabs/page-tabs.component';
import PackagesList from '../packages/packages-list/packages-list.component';
import '../packages/index.styles.scss';
import '../sessions/hours-card/hours-card.styles.scss';
import './my-students.styles.scss';

const TONES = ['sky', 'mint', 'sun', 'lilac', 'coral'] as const;

type StatusFilter = 'all' | 'active' | 'inactive';

const initialsOf = (s: StudentSummary) =>
  `${s.firstName?.[0] || ''}${s.lastName?.[0] || ''}`.toUpperCase();

const MyStudents: FC = () => {
  const [params, setParams] = useSearchParams();
  const section = params.get('tab') === 'packages' ? 'packages' : 'students';
  const { t, i18n } = useTranslation();
  const rtlClass = useRtlClass();
  const chat = useStartConversation();
  const [search, setSearch] = useState('');
  const [course, setCourse] = useState('all');
  const [status, setStatus] = useState<StatusFilter>('all');

  const summaryQuery = useSessionSummary();
  const packagesQuery = useAllPackages();
  // Free trials per student against the limit of 3 (23 Nov 2026)
  const trialsQuery = useTrialsSummary();
  const trialsById = useMemo(
    () =>
      new Map(
        (trialsQuery.data?.students ?? []).map((row) => [row.student_id, row]),
      ),
    [trialsQuery.data],
  );
  const trialMax = trialsQuery.data?.max ?? 3;
  const loading = summaryQuery.isLoading || packagesQuery.isLoading;

  const locale = `${i18n.language}-u-nu-latn`;

  const students = useMemo(
    () =>
      buildStudents(
        packagesQuery.data?.data || [],
        summaryQuery.data?.students || [],
        summaryQuery.data?.active_student_ids,
      ),
    [packagesQuery.data, summaryQuery.data],
  );

  const courses = useMemo(
    () => [...new Set(students.flatMap((s) => s.courses))].sort(),
    [students],
  );

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return students.filter((s) => {
      if (status === 'active' && !s.active) return false;
      if (status === 'inactive' && s.active) return false;
      if (course !== 'all' && !s.courses.includes(course)) return false;
      if (!query) return true;
      return `${s.firstName} ${s.lastName} ${s.email || ''}`
        .toLowerCase()
        .includes(query);
    });
  }, [students, search, course, status]);

  const totals = useMemo(
    () => ({
      students: students.length,
      active: students.filter((s) => s.active).length,
      hoursRemaining: students.reduce((a, s) => a + s.hoursRemaining, 0),
      hoursTaught: students.reduce((a, s) => a + s.hoursTaught, 0),
    }),
    [students],
  );

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString(locale, {
      hour: 'numeric',
      minute: '2-digit',
    });

  const stats = [
    {
      key: 'students',
      tone: 'sky',
      icon: <GroupsRounded />,
      value: String(totals.students),
      label: t('MY_STUDENTS.STATS.STUDENTS'),
    },
    {
      key: 'active',
      tone: 'mint',
      icon: <CheckCircleRounded />,
      value: String(totals.active),
      label: t('MY_STUDENTS.STATS.ACTIVE'),
    },
    {
      key: 'remaining',
      tone: 'sun',
      icon: <AccessTimeRounded />,
      value: formatHours(totals.hoursRemaining),
      label: t('MY_STUDENTS.STATS.HOURS_REMAINING'),
    },
    {
      key: 'taught',
      tone: 'lilac',
      icon: <SchoolRounded />,
      value: formatHours(totals.hoursTaught),
      label: t('MY_STUDENTS.STATS.HOURS_TAUGHT'),
    },
  ];

  return (
    <div className={`my-students ${rtlClass}`}>
      <div className="container ms-container">
        <header className="ms-header">
          <div>
            <h1 className="ms-header__title">
              {t('MY_STUDENTS.TITLE')}
              {!loading && (
                <span className="ms-header__count">{totals.students}</span>
              )}
            </h1>
            <p className="ms-header__subtitle">{t('MY_STUDENTS.SUBTITLE')}</p>
          </div>
        </header>

        {/* My Packages joined this page (23 Nov 2026): a tutor's packages
            are their students' packages */}
        <PageTabs
          label={t('MY_STUDENTS.TITLE')}
          tabs={[
            { key: 'students', label: t('MY_STUDENTS.TABS.STUDENTS') },
            { key: 'packages', label: t('MY_STUDENTS.TABS.PACKAGES') },
          ]}
          value={section}
          onChange={(key) => setParams({ tab: key }, { replace: true })}
        />

        {section === 'packages' ? (
          <section className="packages packages--embedded">
            <PackagesList />
          </section>
        ) : (
          <>
            <div className="ms-stats">
              {stats.map((stat) => (
                <div key={stat.key} className={`ms-stat ms-stat--${stat.tone}`}>
                  <span className="ms-stat__icon" aria-hidden="true">
                    {stat.icon}
                  </span>
                  <div>
                    {loading ? (
                      <Skeleton width={48} height={40} />
                    ) : (
                      <span className="ms-stat__value">{stat.value}</span>
                    )}
                    <span className="ms-stat__label">{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="ms-toolbar">
              <TextField
                className="ms-toolbar__search"
                placeholder={t('MY_STUDENTS.SEARCH')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRounded />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                select
                size="small"
                className="ms-toolbar__select"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                aria-label={t('MY_STUDENTS.FILTER_COURSE')}
              >
                <MenuItem value="all">{t('MY_STUDENTS.ALL_COURSES')}</MenuItem>
                {courses.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </TextField>
              <div className="ms-segment" role="group">
                {(['all', 'active', 'inactive'] as StatusFilter[]).map(
                  (key) => (
                    <button
                      key={key}
                      type="button"
                      className={`ms-segment__btn${
                        status === key ? ' ms-segment__btn--on' : ''
                      }`}
                      aria-pressed={status === key}
                      onClick={() => setStatus(key)}
                    >
                      {t(`MY_STUDENTS.STATUS.${key.toUpperCase()}`)}
                    </button>
                  ),
                )}
              </div>
            </div>

            {loading && (
              <div className="ms-grid">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} variant="rounded" height={260} />
                ))}
              </div>
            )}

            {!loading && visible.length === 0 && (
              <div className="ms-empty">
                <img src={emptyArt} alt="" />
                <h2>
                  {students.length === 0
                    ? t('MY_STUDENTS.EMPTY_TITLE')
                    : t('MY_STUDENTS.NO_MATCH_TITLE')}
                </h2>
                <p>
                  {students.length === 0
                    ? t('MY_STUDENTS.EMPTY_TEXT')
                    : t('MY_STUDENTS.NO_MATCH_TEXT')}
                </p>
              </div>
            )}

            {!loading && visible.length > 0 && (
              <ul className="ms-grid">
                {visible.map((student, index) => {
                  const tone = TONES[index % TONES.length];
                  return (
                    <li key={student.id} className="ms-card">
                      <div className="ms-card__top">
                        <Avatar
                          src={student.avatar}
                          alt={student.firstName}
                          className={`ms-card__avatar ms-card__avatar--${tone}`}
                        >
                          {initialsOf(student)}
                        </Avatar>
                        <div className="ms-card__who">
                          <h3 className="ms-card__name">
                            {student.firstName} {student.lastName}
                          </h3>
                          {student.email && (
                            <span className="ms-card__email">
                              {student.email}
                            </span>
                          )}
                        </div>
                        <span
                          className={`ms-card__status ms-card__status--${
                            student.active ? 'active' : 'inactive'
                          }`}
                        >
                          {student.active
                            ? t('MY_STUDENTS.STATUS.ACTIVE')
                            : t('MY_STUDENTS.STATUS.INACTIVE')}
                        </span>
                      </div>

                      {/* Subject, then grade and curriculum (24 Nov 2026) */}
                      {student.courseDetails.length > 0 && (
                        <div className="ms-card__courses">
                          {student.courseDetails.map((course) => (
                            <span
                              key={`${course.subject}|${course.grade}|${course.curriculum}`}
                              className="ms-card__course"
                              dir="auto"
                              data-testid="ms-course"
                            >
                              <strong>{course.subject}</strong>
                              {(course.grade || course.curriculum) && (
                                <span className="ms-card__course-more">
                                  {[course.grade, course.curriculum]
                                    .filter(Boolean)
                                    .join(' · ')}
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      )}

                      {student.lines.length > 0 ? (
                        <div className="ms-card__hours">
                          <div className="ms-card__hours-row">
                            <span>{t('MY_STUDENTS.CARD.HOURS_LEFT')}</span>
                            <strong>
                              {/* From the meters, so top-ups count (23 Nov 2026: it read "56 of 36 h") */}
                              {t('MY_STUDENTS.CARD.HOURS_OF', {
                                left: formatHours(
                                  student.lines.reduce((n, l) => n + l.left, 0),
                                ),
                                total: formatHours(
                                  student.lines.reduce(
                                    (n, l) => n + l.total,
                                    0,
                                  ),
                                ),
                              })}
                            </strong>
                          </div>
                          {/* One meter per course: done, missed, booked, free (23 Nov 2026) */}
                          <ul className="ms-meters">
                            {student.lines.slice(0, 3).map((line) => {
                              const w = widths(line);
                              return (
                                <li
                                  key={line.id}
                                  className="ms-meter"
                                  data-testid={`ms-meter-${line.id}`}
                                >
                                  <span className="ms-meter__head">
                                    <span dir="auto">{line.course}</span>
                                    <span
                                      className={`ms-meter__left${line.low ? ' ms-meter__left--low' : ''}${line.usedUp ? ' ms-meter__left--done' : ''}`}
                                    >
                                      {line.usedUp
                                        ? t('HOURS_CARD.USED_UP')
                                        : t('HOURS_CARD.LEFT_CHIP', {
                                            h: hoursText(line.left),
                                          })}
                                    </span>
                                  </span>
                                  <span
                                    className="hc-meter hc-meter--small"
                                    role="img"
                                    aria-label={t('HOURS_CARD.METER_LABEL', {
                                      done: hoursText(line.done),
                                      missed: hoursText(line.missed),
                                      booked: hoursText(line.booked),
                                      free: hoursText(line.free),
                                      total: hoursText(line.total),
                                    })}
                                  >
                                    <span
                                      className="hc-meter__done"
                                      style={{ width: `${w.done}%` }}
                                    />
                                    <span
                                      className="hc-meter__missed"
                                      style={{ width: `${w.missed}%` }}
                                    />
                                    <span
                                      className="hc-meter__booked"
                                      style={{ width: `${w.booked}%` }}
                                    />
                                    <span
                                      className="hc-meter__free"
                                      style={{ width: `${w.free}%` }}
                                    />
                                  </span>
                                  <span className="ms-meter__nums">
                                    {[
                                      t('HOURS_CARD.DONE', {
                                        h: hoursText(line.done),
                                      }),
                                      line.missed > 0 &&
                                        t('HOURS_CARD.MISSED', {
                                          h: hoursText(line.missed),
                                        }),
                                      line.booked > 0 &&
                                        t('HOURS_CARD.BOOKED', {
                                          h: hoursText(line.booked),
                                        }),
                                    ]
                                      .filter(Boolean)
                                      .join(' · ')}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ) : (
                        <div className="ms-card__hours ms-card__hours--none">
                          {t('MY_STUDENTS.CARD.NO_PACKAGE')}
                        </div>
                      )}

                      {trialsById.get(student.id) &&
                        (() => {
                          const row = trialsById.get(student.id)!;
                          return (
                            <p
                              className="hc-trials ms-trials"
                              data-testid={`ms-trials-${student.id}`}
                            >
                              <b>{t('HOURS_CARD.TRIALS')}</b>
                              <span
                                className="hc-trials__dots"
                                aria-hidden="true"
                              >
                                {trialDots(row, trialMax).map((kind, i) => (
                                  <span
                                    key={i}
                                    className={`hc-dot hc-dot--${kind}`}
                                  />
                                ))}
                              </span>
                              <small>
                                {[
                                  row.done &&
                                    t('HOURS_CARD.TRIAL_DONE', {
                                      count: row.done,
                                    }),
                                  row.booked &&
                                    t('HOURS_CARD.TRIAL_BOOKED', {
                                      count: row.booked,
                                    }),
                                  row.missed + row.cancelled &&
                                    t('HOURS_CARD.TRIAL_GONE', {
                                      count: row.missed + row.cancelled,
                                    }),
                                  t('HOURS_CARD.TRIAL_LEFT', {
                                    left: row.left,
                                    max: trialMax,
                                  }),
                                ]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </small>
                            </p>
                          );
                        })()}

                      <dl className="ms-card__facts">
                        <div>
                          <dt>{t('MY_STUDENTS.CARD.NEXT')}</dt>
                          <dd>
                            {student.nextSessionAt ? (
                              <>
                                <CalendarMonthRounded />
                                {formatDate(student.nextSessionAt)} ·{' '}
                                {formatTime(student.nextSessionAt)}
                              </>
                            ) : (
                              <span className="ms-muted">
                                {t('MY_STUDENTS.CARD.NONE')}
                              </span>
                            )}
                          </dd>
                        </div>
                        <div>
                          <dt>{t('MY_STUDENTS.CARD.COMPLETED')}</dt>
                          <dd>
                            {t('MY_STUDENTS.CARD.SESSIONS_HOURS', {
                              count: student.completedSessions,
                              hours: formatHours(student.hoursTaught),
                            })}
                          </dd>
                        </div>
                        {student.lastSessionAt && (
                          <div>
                            <dt>{t('MY_STUDENTS.CARD.LAST')}</dt>
                            <dd>
                              {formatDate(student.lastSessionAt)} ·{' '}
                              <span dir="auto">
                                {subjectName(student.lastCourse)}
                              </span>
                            </dd>
                          </div>
                        )}
                      </dl>

                      <div className="ms-card__actions">
                        {chat.isAvailable ? (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<ChatBubbleOutlineRounded />}
                            disabled={chat.isStarting}
                            onClick={() =>
                              chat.startConversation(
                                student.id,
                                student.courses[0],
                              )
                            }
                          >
                            {t('MESSAGES.MESSAGE_BUTTON')}
                          </Button>
                        ) : (
                          student.email && (
                            <Button
                              variant="outlined"
                              size="small"
                              href={`mailto:${student.email}`}
                            >
                              {t('MY_STUDENTS.CARD.EMAIL')}
                            </Button>
                          )
                        )}
                        <Button
                          variant="contained"
                          size="small"
                          component={Link}
                          to="/my_sessions"
                        >
                          {t('MY_STUDENTS.CARD.SESSIONS')}
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyStudents;
