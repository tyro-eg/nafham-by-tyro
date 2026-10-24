import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, IconButton, Skeleton, Tooltip } from '@mui/material';
import {
  AccessTimeRounded,
  AccountBalanceWalletRounded,
  ChevronLeftRounded,
  ChevronRightRounded,
  EventAvailableRounded,
  InfoOutlined,
  PaymentsRounded,
  TrendingUpRounded,
} from '@mui/icons-material';

import { useSessions } from '../../hooks/useSessions';
import { usePackages } from '../../hooks/usePackages';
import { useRtlClass } from '../../assets/utils/utils';
import { formatHours } from '../dashboard/dashboard.utils';
import { buildSalaryReport } from './my-salary.utils';

import './my-salary.styles.scss';

// Enough history for a few months without paging through the API
const HISTORY_SIZE = 200;

const MySalary: FC = () => {
  const { t, i18n } = useTranslation();
  const rtlClass = useRtlClass();
  const locale = `${i18n.language}-u-nu-latn`;

  const now = useMemo(() => new Date(), []);
  // 0 = this month, -1 = last month, ...
  const [offset, setOffset] = useState(0);
  const month = useMemo(
    () => new Date(now.getFullYear(), now.getMonth() + offset, 1),
    [now, offset],
  );
  const isCurrentMonth = offset === 0;

  const sessionsQuery = useSessions(1, HISTORY_SIZE);
  const packagesQuery = usePackages(1, HISTORY_SIZE);
  const loading = sessionsQuery.isLoading || packagesQuery.isLoading;

  const report = useMemo(
    () =>
      buildSalaryReport(
        sessionsQuery.data?.data || [],
        packagesQuery.data?.data || [],
        month,
        now,
      ),
    [sessionsQuery.data, packagesQuery.data, month, now],
  );

  const money = (value: number, currency: string, decimals = 2) => {
    try {
      if (currency) {
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
          maximumFractionDigits: decimals,
          minimumFractionDigits: 0,
        }).format(value);
      }
    } catch {
      // Unknown currency code: fall through to a plain number
    }
    return `${new Intl.NumberFormat(locale, {
      maximumFractionDigits: decimals,
    }).format(value)}${currency ? ` ${currency}` : ''}`;
  };

  const totalsText = (totals: Record<string, number>) => {
    const entries = Object.entries(totals);
    if (entries.length === 0) return money(0, '');
    return entries.map(([currency, v]) => money(v, currency)).join(' + ');
  };

  const averageRate = (() => {
    const priced = report.lines.filter((l) => l.rate.perHour !== null);
    const hours = priced.reduce((acc, l) => acc + l.hours, 0);
    const currencies = [...new Set(priced.map((l) => l.rate.currency))];
    if (!hours || currencies.length !== 1) return '–';
    const amount = priced.reduce((acc, l) => acc + l.amount, 0);
    return money(amount / hours, currencies[0], 0);
  })();

  const monthLabel = month.toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
  });
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
      key: 'earned',
      tone: 'mint',
      icon: <AccountBalanceWalletRounded />,
      value: totalsText(report.totals),
      label: isCurrentMonth
        ? t('MY_SALARY.STATS.EARNED_MTD')
        : t('MY_SALARY.STATS.EARNED_MONTH'),
      highlight: true,
    },
    {
      key: 'sessions',
      tone: 'sky',
      icon: <EventAvailableRounded />,
      value: String(report.sessions),
      label: t('MY_SALARY.STATS.SESSIONS'),
    },
    {
      key: 'hours',
      tone: 'lilac',
      icon: <AccessTimeRounded />,
      value: formatHours(report.hours),
      label: t('MY_SALARY.STATS.HOURS'),
    },
    {
      key: 'rate',
      tone: 'sun',
      icon: <TrendingUpRounded />,
      value: averageRate,
      label: t('MY_SALARY.STATS.AVG_RATE'),
    },
  ];

  const prevIcon = rtlClass ? <ChevronRightRounded /> : <ChevronLeftRounded />;
  const nextIcon = rtlClass ? <ChevronLeftRounded /> : <ChevronRightRounded />;

  return (
    <div className={`my-salary ${rtlClass}`}>
      <div className="container sal-container">
        <header className="sal-header">
          <div>
            <h1 className="sal-header__title">{t('MY_SALARY.TITLE')}</h1>
            <p className="sal-header__subtitle">{t('MY_SALARY.SUBTITLE')}</p>
          </div>
          <div className="sal-month" role="group" aria-label={monthLabel}>
            <IconButton
              onClick={() => setOffset((o) => o - 1)}
              aria-label={t('MY_SALARY.PREV_MONTH')}
            >
              {prevIcon}
            </IconButton>
            <span className="sal-month__label">
              {monthLabel}
              {isCurrentMonth && (
                <span className="sal-month__badge">{t('MY_SALARY.MTD')}</span>
              )}
            </span>
            <IconButton
              onClick={() => setOffset((o) => Math.min(0, o + 1))}
              disabled={isCurrentMonth}
              aria-label={t('MY_SALARY.NEXT_MONTH')}
            >
              {nextIcon}
            </IconButton>
          </div>
        </header>

        <div className="sal-stats">
          {stats.map((stat) => (
            <div
              key={stat.key}
              className={`sal-stat sal-stat--${stat.tone}${
                stat.highlight ? ' sal-stat--highlight' : ''
              }`}
            >
              <span className="sal-stat__icon" aria-hidden="true">
                {stat.icon}
              </span>
              <div className="sal-stat__body">
                {loading ? (
                  <Skeleton width={90} height={40} />
                ) : (
                  <span className="sal-stat__value">{stat.value}</span>
                )}
                <span className="sal-stat__label">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>

        {isCurrentMonth && report.upcomingSessions > 0 && !loading && (
          <div className="sal-projection">
            <PaymentsRounded aria-hidden="true" />
            <p>
              {t('MY_SALARY.PROJECTION', {
                count: report.upcomingSessions,
                amount: totalsText(report.upcomingTotals),
              })}
            </p>
          </div>
        )}

        {/* ---------- Breakdown by course ---------- */}
        <section className="sal-card">
          <header className="sal-card__header">
            <h2>{t('MY_SALARY.BREAKDOWN.TITLE')}</h2>
            <span className="sal-card__hint">
              {t('MY_SALARY.BREAKDOWN.HINT')}
            </span>
          </header>

          {loading && <Skeleton variant="rounded" height={160} />}
          {!loading && report.groups.length === 0 && (
            <p className="sal-empty">
              {isCurrentMonth
                ? t('MY_SALARY.EMPTY_MTD')
                : t('MY_SALARY.EMPTY_MONTH')}
            </p>
          )}
          {!loading && report.groups.length > 0 && (
            <div className="sal-table-wrap">
              <table className="sal-table">
                <thead>
                  <tr>
                    <th>{t('MY_SALARY.COLS.CURRICULUM')}</th>
                    <th>{t('MY_SALARY.COLS.STAGE')}</th>
                    <th>{t('MY_SALARY.COLS.SUBJECT')}</th>
                    <th className="num">{t('MY_SALARY.COLS.SESSIONS')}</th>
                    <th className="num">{t('MY_SALARY.COLS.HOURS')}</th>
                    <th className="num">{t('MY_SALARY.COLS.RATE')}</th>
                    <th className="num">{t('MY_SALARY.COLS.AMOUNT')}</th>
                  </tr>
                </thead>
                <tbody>
                  {report.groups.map((group) => (
                    <tr key={group.key}>
                      <td data-label={t('MY_SALARY.COLS.CURRICULUM')}>
                        <span className="sal-chip" dir="auto">
                          {group.course.curriculum || '–'}
                        </span>
                      </td>
                      <td data-label={t('MY_SALARY.COLS.STAGE')} dir="auto">
                        {group.course.stage || '–'}
                      </td>
                      <td
                        data-label={t('MY_SALARY.COLS.SUBJECT')}
                        className="strong"
                        dir="auto"
                      >
                        {group.course.subject}
                      </td>
                      <td
                        data-label={t('MY_SALARY.COLS.SESSIONS')}
                        className="num"
                      >
                        {group.sessions}
                      </td>
                      <td
                        data-label={t('MY_SALARY.COLS.HOURS')}
                        className="num"
                      >
                        {formatHours(group.hours)}
                      </td>
                      <td data-label={t('MY_SALARY.COLS.RATE')} className="num">
                        {group.rate.perHour === null ? (
                          <span className="sal-missing">
                            {t('MY_SALARY.NO_RATE')}
                          </span>
                        ) : (
                          t('MY_SALARY.PER_HOUR', {
                            amount: money(
                              group.rate.perHour,
                              group.rate.currency,
                            ),
                          })
                        )}
                      </td>
                      <td
                        data-label={t('MY_SALARY.COLS.AMOUNT')}
                        className="num strong"
                      >
                        {group.rate.perHour === null
                          ? '–'
                          : money(group.amount, group.rate.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3}>{t('MY_SALARY.TOTAL')}</td>
                    <td className="num">{report.sessions}</td>
                    <td className="num">{formatHours(report.hours)}</td>
                    <td className="num" />
                    <td className="num">{totalsText(report.totals)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {report.unpricedSessions > 0 && (
            <p className="sal-warning">
              <InfoOutlined aria-hidden="true" />
              {t('MY_SALARY.UNPRICED', { count: report.unpricedSessions })}
            </p>
          )}
        </section>

        {/* ---------- Session details ---------- */}
        {!loading && report.lines.length > 0 && (
          <section className="sal-card">
            <header className="sal-card__header">
              <h2>{t('MY_SALARY.SESSIONS.TITLE')}</h2>
              <span className="sal-card__hint">
                {t('MY_SALARY.SESSIONS.HINT', { count: report.sessions })}
              </span>
            </header>
            <ul className="sal-lines">
              {report.lines.map((line) => {
                const student = line.session.student;
                const name =
                  `${student?.first_name || ''} ${student?.last_name || ''}`.trim();
                return (
                  <li key={line.session.id} className="sal-line">
                    <span className="sal-line__date">
                      <strong>{formatDate(line.session.start_time)}</strong>
                      <span>{formatTime(line.session.start_time)}</span>
                    </span>
                    <span className="sal-line__who">
                      <Avatar src={student?.image} alt={name}>
                        {`${student?.first_name?.[0] || ''}${
                          student?.last_name?.[0] || ''
                        }`.toUpperCase()}
                      </Avatar>
                      <span>
                        <strong>{name}</strong>
                        <span dir="auto">
                          {line.session.grade_subject?.full_course_name}
                        </span>
                      </span>
                    </span>
                    <span className="sal-line__calc">
                      {t('MY_SALARY.LINE_CALC', {
                        hours: formatHours(line.hours),
                        rate:
                          line.rate.perHour === null
                            ? '?'
                            : money(line.rate.perHour, line.rate.currency),
                      })}
                    </span>
                    <strong className="sal-line__amount">
                      {line.rate.perHour === null ? (
                        <Tooltip title={t('MY_SALARY.NO_RATE')}>
                          <span>–</span>
                        </Tooltip>
                      ) : (
                        money(line.amount, line.rate.currency)
                      )}
                    </strong>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <p className="sal-note">
          <InfoOutlined aria-hidden="true" />
          {t('MY_SALARY.NOTE')}
        </p>
      </div>
    </div>
  );
};

export default MySalary;
