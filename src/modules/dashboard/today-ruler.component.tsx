import { FC, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import type { SessionType } from '../../assets/types';
import { subjectName } from './dashboard.utils';
import { buildRulerDay } from './today-ruler.utils';
import './today-ruler.styles.scss';

/**
 * Today on the tutor's dashboard (23 Nov 2026): the sessions on an hour
 * ruler with the gold "now" line; a session opens My Sessions.
 */
const TodayRuler: FC<{ sessions: SessionType[]; now: Date }> = ({
  sessions,
  now,
}) => {
  const { t, i18n } = useTranslation();
  const day = useMemo(() => buildRulerDay(sessions, now), [sessions, now]);
  if (!day) return null;

  const hour = new Intl.DateTimeFormat(`${i18n.language}-u-nu-latn`, {
    hour: 'numeric',
  });
  const label = (h: number) =>
    hour.format(new Date(now.getFullYear(), now.getMonth(), now.getDate(), h));

  return (
    <div className="ruler-scroll">
      <div
        className="ruler"
        aria-label={t('TUTOR_DASHBOARD.TODAY.TITLE')}
        style={{ '--lanes': day.lanes } as React.CSSProperties}
      >
        <div className="ruler__track">
          {day.marks.map((mark) => (
            <span
              key={mark.hour}
              className="ruler__mark"
              style={{ insetInlineStart: `${mark.at}%` }}
            >
              <span className="ruler__hour">{label(mark.hour)}</span>
            </span>
          ))}
          {day.now !== null && (
            <span
              className="ruler__now"
              style={{ insetInlineStart: `${day.now}%` }}
            >
              <span>{t('TUTOR_DASHBOARD.TODAY.NOW')}</span>
            </span>
          )}
          {day.blocks.map((block, i) => {
            const s = block.session;
            const trial = s.session_type === 'trial';
            return (
              <Link
                key={s.id}
                to="/my_sessions"
                className={`ruler__block${block.past ? ' ruler__block--past' : ''}${
                  block.live ? ' ruler__block--live' : ''
                }${trial ? ' ruler__block--trial' : ''}`}
                style={{
                  insetInlineStart: `${block.start}%`,
                  inlineSize: `${Math.max(block.width, 9)}%`,
                  top: `${3 + block.lane * 5.4}rem`,
                  animationDelay: `${i * 0.08}s`,
                }}
              >
                <b dir="auto">
                  {trial
                    ? t('TUTOR_DASHBOARD.TODAY.TRIAL')
                    : subjectName(s.grade_subject?.full_course_name)}
                </b>
                <span dir="auto">{s.student?.first_name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TodayRuler;
