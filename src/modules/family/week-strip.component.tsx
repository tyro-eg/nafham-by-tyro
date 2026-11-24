import { FC, Fragment, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import type { FamilyChild } from '../../hooks/useFamily';
import { childColor } from '../../lib/family-child';
import { subjectName } from '../dashboard/dashboard.utils';
import { buildWeek, fuelBlocks } from './week-strip.utils';
import './week-strip.styles.scss';

const locale = (language: string) => `${language}-u-nu-latn`;

/**
 * This week on the parent's home (23 Nov 2026): today and the next six days,
 * each child's sessions in their own colour, the gold "now" line today. A
 * session opens My Sessions on that child.
 */
export const WeekStrip: FC<{
  kids: FamilyChild[];
  onOpen: (child: FamilyChild) => void;
}> = ({ kids, onOpen }) => {
  const { t, i18n } = useTranslation();
  const days = useMemo(() => buildWeek(kids, childColor), [kids]);
  const lang = locale(i18n.language);
  const weekday = new Intl.DateTimeFormat(lang, { weekday: 'short' });
  const time = new Intl.DateTimeFormat(lang, {
    hour: 'numeric',
    minute: '2-digit',
  });
  const empty = days.every((day) => day.entries.length === 0);
  const named = kids.length > 1;

  return (
    <div className="wk">
      <ol className="wk__days" aria-label={t('FAMILY.WEEK.TITLE')}>
        {days.map((day) => (
          <li
            key={day.date.toISOString()}
            className={`wk__day${day.today ? ' wk__day--today' : ''}`}
          >
            <h3 className="wk__date">
              <span>
                {day.today ? t('FAMILY.WEEK.TODAY') : weekday.format(day.date)}
              </span>
              <b>{day.date.getDate()}</b>
            </h3>
            {day.entries.map((entry, i) => (
              <Fragment key={entry.session.id}>
                {day.nowAfter === i && <span className="wk__now" />}
                <Link
                  to="/my_sessions"
                  onClick={() => onOpen(entry.child)}
                  className={`wk__pill${entry.done ? ' wk__pill--done' : ''}${
                    entry.live ? ' wk__pill--live' : ''
                  }`}
                  style={{ '--c': entry.color } as React.CSSProperties}
                >
                  <b dir="auto">{subjectName(entry.session.course_name)}</b>
                  <span>
                    {entry.live
                      ? t('FAMILY.WEEK.LIVE')
                      : time.format(new Date(entry.session.start_time))}
                    {named && ` · ${entry.child.first_name}`}
                  </span>
                </Link>
              </Fragment>
            ))}
            {day.today && day.nowAfter === day.entries.length && (
              <span className="wk__now" />
            )}
          </li>
        ))}
      </ol>
      {empty && <p className="wk__empty">{t('FAMILY.WEEK.EMPTY')}</p>}
      {named && (
        <ul className="wk__key">
          {kids.map((child, i) => (
            <li
              key={child.id}
              style={{ '--c': childColor(i) } as React.CSSProperties}
            >
              {child.first_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/** Hours left as a fuel bar; gold when low */
export const FuelBar: FC<{ left: number; total: number; low?: boolean }> = ({
  left,
  total,
  low = false,
}) => (
  <span className={`fuel${low ? ' fuel--low' : ''}`} aria-hidden="true">
    {fuelBlocks(left, total).map((fill, i) => (
      <i key={i}>
        {fill > 0 && <em style={{ inlineSize: `${fill * 100}%` }} />}
      </i>
    ))}
  </span>
);
