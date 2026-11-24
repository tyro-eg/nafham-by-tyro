import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { childColor } from '../../../lib/family-child';
import '../../family/week-strip.styles.scss';

type Syllabus = 'igcse' | 'british' | 'american' | 'uae';
// [subject, hour (24h), child (0 or 1), done]
type Entry = [string, number, 0 | 1, boolean?];

const SYLLABI: Syllabus[] = ['igcse', 'british', 'american', 'uae'];

// A made-up family's week: yesterday, today and the next five days. Today's
// finished sessions come before the "now" line.
const WEEKS: Record<Syllabus, Entry[][]> = {
  igcse: [
    [['CHEMISTRY', 17, 0, true]],
    [
      ['ENGLISH', 16, 1, true],
      ['MATH', 20, 0],
    ],
    [],
    [['PHYSICS', 18, 0]],
    [['ENGLISH', 16, 1]],
    [],
    [['MATH', 11, 0]],
  ],
  british: [
    [['ENGLISH', 17, 0, true]],
    [
      ['MATHS', 16.5, 1, true],
      ['SCIENCE', 19, 0],
    ],
    [['MATHS', 17, 1]],
    [],
    [['ENGLISH', 18, 0]],
    [],
    [['SCIENCE', 10, 1]],
  ],
  american: [
    [['SAT_MATH', 18, 0, true]],
    [['READING', 19.5, 0]],
    [['MATH', 16, 1]],
    [['SAT_MATH', 18, 0]],
    [],
    [],
    [['SCIENCE', 12, 1]],
  ],
  uae: [
    [['ARABIC', 16, 1, true]],
    [
      ['MATH', 17, 0, true],
      ['PHYSICS', 20, 0],
    ],
    [],
    [['ARABIC', 16, 1]],
    [['CHEMISTRY', 18, 0]],
    [],
    [],
  ],
};

/**
 * The home page's hero picture (23 Nov 2026): a sample family's week in the
 * same navy timetable parents get on their home page. A syllabus chip swaps
 * the sessions, which slide into the days.
 */
const HomeWeekDemo: FC = () => {
  const { t, i18n } = useTranslation();
  const [syllabus, setSyllabus] = useState<Syllabus>('igcse');
  const locale = `${i18n.language}-u-nu-latn`;

  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + i - 1,
      );
      return { date, today: i === 1 };
    });
  }, []);
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  const time = (hour: number) =>
    new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: hour % 1 ? '2-digit' : undefined,
    }).format(new Date(2026, 0, 1, Math.floor(hour), (hour % 1) * 60));
  const names = [t('LANDING.WEEK.CHILD_1'), t('LANDING.WEEK.CHILD_2')];

  return (
    <div className="hero-week">
      <div className="hero-week__head">
        <h2>{t('LANDING.WEEK.TITLE')}</h2>
        <p>{t('LANDING.WEEK.SUBTITLE')}</p>
      </div>
      <div
        className="hero-week__chips"
        role="radiogroup"
        aria-label={t('LANDING.WEEK.SYLLABUS')}
      >
        {SYLLABI.map((key) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={syllabus === key}
            className={`hero-week__chip${syllabus === key ? ' hero-week__chip--on' : ''}`}
            onClick={() => setSyllabus(key)}
          >
            {t(`LANDING.WEEK.SYLLABI.${key.toUpperCase()}`)}
          </button>
        ))}
      </div>

      <ol className="wk__days" key={syllabus}>
        {days.map((day, i) => {
          const entries = WEEKS[syllabus][i];
          const doneCount = entries.filter((e) => e[3]).length;
          return (
            <li
              key={day.date.toISOString()}
              className={`wk__day${day.today ? ' wk__day--today' : ''}`}
            >
              <h3 className="wk__date">
                <span>
                  {day.today
                    ? t('LANDING.WEEK.TODAY')
                    : weekday.format(day.date)}
                </span>
                <b>{day.date.getDate()}</b>
              </h3>
              {entries.map(([subject, hour, child, done], j) => (
                <div key={`${subject}-${hour}`} className="hero-week__slot">
                  {day.today && j === doneCount && <span className="wk__now" />}
                  <div
                    className={`wk__pill${done ? ' wk__pill--done' : ''}`}
                    style={
                      {
                        '--c': childColor(child),
                        animationDelay: `${i * 0.05 + j * 0.04}s`,
                      } as React.CSSProperties
                    }
                  >
                    <b>{t(`LANDING.WEEK.SUBJECTS.${subject}`)}</b>
                    <span>{time(hour)}</span>
                    <span>{names[child]}</span>
                  </div>
                </div>
              ))}
              {day.today && doneCount === entries.length && (
                <span className="wk__now" />
              )}
            </li>
          );
        })}
      </ol>

      <ul className="wk__key">
        {names.map((name, i) => (
          <li
            key={name}
            style={{ '--c': childColor(i) } as React.CSSProperties}
          >
            {t('LANDING.WEEK.CHILD_AGE', { name, age: i === 0 ? 14 : 10 })}
          </li>
        ))}
      </ul>
      <p className="hero-week__note">
        <span aria-hidden="true">📝</span>
        <span>
          <b>{t('LANDING.WEEK.NOTE_LEAD')}</b> {t('LANDING.WEEK.NOTE')}
        </span>
      </p>
    </div>
  );
};

export default HomeWeekDemo;
