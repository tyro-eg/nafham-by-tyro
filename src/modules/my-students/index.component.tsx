import { FC, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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

import { useSessions } from '../../hooks/useSessions';
import { usePackages } from '../../hooks/usePackages';
import { useStartConversation } from '../../hooks/useStreamChat';
import { useRtlClass } from '../../assets/utils/utils';
import { formatHours, subjectName } from '../dashboard/dashboard.utils';
import { buildStudents, StudentSummary } from './my-students.utils';
import emptyArt from '../../assets/images/newLanding/rafiki.svg?url';

import './my-students.styles.scss';

// Enough history to list every student without paging through the API
const HISTORY_SIZE = 100;
const TONES = ['sky', 'mint', 'sun', 'lilac', 'coral'] as const;

type StatusFilter = 'all' | 'active' | 'inactive';

const initialsOf = (s: StudentSummary) =>
  `${s.firstName?.[0] || ''}${s.lastName?.[0] || ''}`.toUpperCase();

const MyStudents: FC = () => {
  const { t, i18n } = useTranslation();
  const rtlClass = useRtlClass();
  const chat = useStartConversation();
  const [search, setSearch] = useState('');
  const [course, setCourse] = useState('all');
  const [status, setStatus] = useState<StatusFilter>('all');

  const sessionsQuery = useSessions(1, HISTORY_SIZE);
  const packagesQuery = usePackages(1, HISTORY_SIZE);
  const loading = sessionsQuery.isLoading || packagesQuery.isLoading;

  const now = useMemo(() => new Date(), []);
  const locale = `${i18n.language}-u-nu-latn`;

  const students = useMemo(
    () =>
      buildStudents(
        packagesQuery.data?.data || [],
        sessionsQuery.data?.data || [],
        now,
      ),
    [packagesQuery.data, sessionsQuery.data, now],
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
            {(['all', 'active', 'inactive'] as StatusFilter[]).map((key) => (
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
            ))}
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
              const percent =
                student.hoursPurchased > 0
                  ? (student.hoursRemaining / student.hoursPurchased) * 100
                  : 0;
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
                        <span className="ms-card__email">{student.email}</span>
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

                  {student.courses.length > 0 && (
                    <div className="ms-card__courses">
                      {student.courses.map((name) => (
                        <span key={name} className="ms-card__course" dir="auto">
                          {name}
                        </span>
                      ))}
                    </div>
                  )}

                  {student.hoursPurchased > 0 ? (
                    <div className="ms-card__hours">
                      <div className="ms-card__hours-row">
                        <span>{t('MY_STUDENTS.CARD.HOURS_LEFT')}</span>
                        <strong>
                          {t('MY_STUDENTS.CARD.HOURS_OF', {
                            left: formatHours(student.hoursRemaining),
                            total: formatHours(student.hoursPurchased),
                          })}
                        </strong>
                      </div>
                      <span
                        className="ms-card__track"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={student.hoursPurchased}
                        aria-valuenow={student.hoursRemaining}
                      >
                        <span
                          className="ms-card__bar"
                          style={{ width: `${percent}%` }}
                        />
                      </span>
                    </div>
                  ) : (
                    <div className="ms-card__hours ms-card__hours--none">
                      {t('MY_STUDENTS.CARD.NO_PACKAGE')}
                    </div>
                  )}

                  <dl className="ms-card__facts">
                    <div>
                      <dt>{t('MY_STUDENTS.CARD.NEXT')}</dt>
                      <dd>
                        {student.nextSession ? (
                          <>
                            <CalendarMonthRounded />
                            {formatDate(student.nextSession.start_time)} ·{' '}
                            {formatTime(student.nextSession.start_time)}
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
                    {student.lastSession && (
                      <div>
                        <dt>{t('MY_STUDENTS.CARD.LAST')}</dt>
                        <dd>
                          {formatDate(student.lastSession.start_time)} ·{' '}
                          <span dir="auto">
                            {subjectName(
                              student.lastSession.grade_subject
                                ?.full_course_name,
                            )}
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
                          chat.startConversation(student.id, student.courses[0])
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
      </div>
    </div>
  );
};

export default MyStudents;
