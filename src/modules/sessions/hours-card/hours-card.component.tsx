import { FC, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePackages } from '../../../hooks/usePackages';
import { useTrialsSummary } from '../../../hooks/useSessions';
import { useActiveChild, useFamily } from '../../../hooks/useFamily';
import { courseLabel } from '../../dashboard/dashboard.utils';
import {
  hoursText,
  meterLine,
  orderLines,
  totalsOf,
  trialDots,
  widths,
  type MeterLine,
} from '../../../lib/hours-meter';
import './hours-card.styles.scss';

/**
 * Hours done and hours left, above My Sessions (23 Nov 2026: "completed
 * hours and remaining of sessions and trials"). Four totals, one meter per
 * course (done, missed, booked, free to book, of what it covers now), and the
 * free trials against the limit of 3. A parent sees the child picked in the
 * tabs above, or every child; a student only themself.
 */
const SHOWN = 4;

const Meter: FC<{ line: MeterLine }> = ({ line }) => {
  const { t } = useTranslation();
  const w = widths(line);
  return (
    <li className="hc-line" data-testid={`hours-line-${line.id}`}>
      <div className="hc-line__main">
        <p className="hc-line__title">
          <b>{line.course}</b>
          <span>
            {t('HOURS_CARD.WITH', { tutor: line.tutor })}
            {line.student ? ` · ${line.student}` : ''}
          </span>
        </p>
        <div
          className="hc-meter"
          role="img"
          aria-label={t('HOURS_CARD.METER_LABEL', {
            done: hoursText(line.done),
            missed: hoursText(line.missed),
            booked: hoursText(line.booked),
            free: hoursText(line.free),
            total: hoursText(line.total),
          })}
        >
          <span className="hc-meter__done" style={{ width: `${w.done}%` }} />
          <span
            className="hc-meter__missed"
            style={{ width: `${w.missed}%` }}
          />
          <span
            className="hc-meter__booked"
            style={{ width: `${w.booked}%` }}
          />
          <span className="hc-meter__free" style={{ width: `${w.free}%` }} />
        </div>
        <p className="hc-nums">
          <span>
            <i className="hc-meter__done" />
            {t('HOURS_CARD.DONE', { h: hoursText(line.done) })}
          </span>
          {line.missed > 0 && (
            <span>
              <i className="hc-meter__missed" />
              {t('HOURS_CARD.MISSED', { h: hoursText(line.missed) })}
            </span>
          )}
          {line.booked > 0 && (
            <span>
              <i className="hc-meter__booked" />
              {t('HOURS_CARD.BOOKED', { h: hoursText(line.booked) })}
            </span>
          )}
          <span>
            <i className="hc-meter__free" />
            {t('HOURS_CARD.FREE', { h: hoursText(line.free) })}
          </span>
          <span className="hc-nums__of">
            {t('HOURS_CARD.OF', { h: hoursText(line.total) })}
          </span>
        </p>
      </div>
      <p className={`hc-left${line.low ? ' hc-left--low' : ''}`}>
        <b>{t('HOURS_CARD.HOURS', { h: hoursText(line.left) })}</b>
        <small>{t('HOURS_CARD.LEFT_IN_ALL')}</small>
      </p>
    </li>
  );
};

const HoursCard: FC<{ isParent: boolean }> = ({ isParent }) => {
  const { t } = useTranslation();
  const packages = usePackages(1, 50);
  const trials = useTrialsSummary();
  const family = useFamily();
  const { childId, all } = useActiveChild(
    isParent ? family.data?.children : undefined,
  );
  // A parent with a child picked sees that child only
  const onlyChild =
    isParent && !all && typeof childId === 'number' ? childId : null;

  const lines = useMemo(
    () =>
      orderLines(
        (packages.data?.data ?? [])
          .map((p) =>
            meterLine(
              p,
              courseLabel(p.grade_subject?.full_course_name?.trim()),
            ),
          )
          .filter((l): l is MeterLine => !!l)
          .filter((l) => onlyChild == null || l.studentId === onlyChild),
      ),
    [packages.data, onlyChild],
  );
  const trialRows = (trials.data?.students ?? []).filter(
    (r) => onlyChild == null || r.student_id === onlyChild,
  );
  const max = trials.data?.max ?? 3;

  if (packages.isLoading)
    return (
      <section className="hours-card hours-card--loading" aria-busy="true" />
    );
  if (!lines.length && !trialRows.length) return null;
  const totals = totalsOf(lines);
  const tiles: Array<[string, number, string]> = [
    ['done', totals.done, t('HOURS_CARD.TOTAL_DONE')],
    ['missed', totals.missed, t('HOURS_CARD.TOTAL_MISSED')],
    ['booked', totals.booked, t('HOURS_CARD.TOTAL_BOOKED')],
    ['free', totals.free, t('HOURS_CARD.TOTAL_FREE')],
  ];

  return (
    <section
      className="hours-card"
      aria-label={t('HOURS_CARD.TITLE')}
      data-testid="hours-card"
    >
      <header className="hours-card__head">
        <h2>{t('HOURS_CARD.TITLE')}</h2>
        <Link to="/my_packages">{t('HOURS_CARD.ALL_PACKAGES')}</Link>
      </header>
      {lines.length > 0 && (
        <>
          <ul className="hc-totals">
            {tiles.map(([key, value, label]) => (
              <li key={key} className={`hc-total hc-total--${key}`}>
                <b>{t('HOURS_CARD.HOURS', { h: hoursText(value) })}</b>
                <span>{label}</span>
              </li>
            ))}
          </ul>
          <ul className="hc-lines">
            {lines.slice(0, SHOWN).map((line) => (
              <Meter key={line.id} line={line} />
            ))}
          </ul>
          {lines.length > SHOWN && (
            <Link className="hc-more" to="/my_packages">
              {t('HOURS_CARD.MORE', { count: lines.length - SHOWN })}
            </Link>
          )}
        </>
      )}
      {trialRows.map((row) => (
        <p
          key={row.student_id}
          className="hc-trials"
          data-testid={`trials-${row.student_id}`}
        >
          <b>
            {isParent
              ? t('HOURS_CARD.TRIALS_OF', { name: row.name.split(' ')[0] })
              : t('HOURS_CARD.TRIALS')}
          </b>
          <span className="hc-trials__dots" aria-hidden="true">
            {trialDots(row, max).map((kind, i) => (
              <span key={i} className={`hc-dot hc-dot--${kind}`} />
            ))}
          </span>
          <small>
            {[
              row.done && t('HOURS_CARD.TRIAL_DONE', { count: row.done }),
              row.booked && t('HOURS_CARD.TRIAL_BOOKED', { count: row.booked }),
              row.missed + row.cancelled &&
                t('HOURS_CARD.TRIAL_GONE', {
                  count: row.missed + row.cancelled,
                }),
              t('HOURS_CARD.TRIAL_LEFT', { left: row.left, max }),
            ]
              .filter(Boolean)
              .join(' · ')}
          </small>
        </p>
      ))}
    </section>
  );
};

export default HoursCard;
