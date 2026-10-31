import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useRtlClass } from '../../assets/utils/utils';
import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import { useFamily } from '../../hooks/useFamily';
import { childColor } from '../../lib/family-child';
import SessionsCalendarContainer from '../sessions/sessions-info/sessions-calendar-container/sessions-calendar-container.component';

import './calendar.styles.scss';

type CalendarFilter = 'scheduled' | 'all';

// Scheduled sessions plus any that are live right now
const UPCOMING = ['scheduled', 'open'];

// Same colours as the calendar events (see sessions-calendar-container)
const LEGEND = [
  { key: 'SCHEDULED', color: '#ff9800' },
  { key: 'COMPLETED', color: '#4caf50' },
  { key: 'MISSED', color: '#dc3545' },
  { key: 'CANCELED', color: '#9aa8b8' },
] as const;

/**
 * Calendar page for students and tutors: their sessions on a month/week
 * calendar, scheduled sessions by default.
 */
const CalendarPage: FC = () => {
  const { t } = useTranslation();
  const rtlClass = useRtlClass();
  const [filter, setFilter] = useState<CalendarFilter>('scheduled');
  const currentUser = useAppSelector(selectCurrentUser);
  const isParent = currentUser?.type === 'Parent';
  const family = useFamily(isParent);

  // A parent tells the children apart by colour; the legend says which is which
  const children = useMemo(
    () =>
      isParent
        ? (family.data?.children ?? []).map((child, i) => ({
            id: child.id,
            name: child.first_name,
            color: childColor(i),
          }))
        : [],
    [isParent, family.data],
  );
  const colorByStudent = useMemo(
    () =>
      children.length
        ? Object.fromEntries(children.map((c) => [c.id, c.color]))
        : undefined,
    [children],
  );

  return (
    <div className={`calendar-page ${rtlClass}`}>
      <div className="container cal-container">
        <header className="cal-header">
          <div>
            <h1 className="cal-header__title">{t('CALENDAR_PAGE.TITLE')}</h1>
            <p className="cal-header__subtitle">
              {t('CALENDAR_PAGE.SUBTITLE')}
            </p>
          </div>
          <div className="cal-toggle" role="group">
            {(['scheduled', 'all'] as CalendarFilter[]).map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={filter === key}
                className={`cal-toggle__btn${
                  filter === key ? ' cal-toggle__btn--on' : ''
                }`}
                onClick={() => setFilter(key)}
              >
                {t(`CALENDAR_PAGE.FILTER.${key.toUpperCase()}`)}
              </button>
            ))}
          </div>
        </header>

        <section className="cal-card">
          <ul className="cal-legend">
            {children.map((child) => (
              <li key={child.id} className="cal-legend__child">
                <span
                  className="cal-legend__dot"
                  style={{ backgroundColor: child.color }}
                />
                {child.name}
              </li>
            ))}
            {LEGEND.filter(
              (item) =>
                !colorByStudent &&
                (filter === 'all' || item.key === 'SCHEDULED'),
            ).map((item) => (
              <li key={item.key}>
                <span
                  className="cal-legend__dot"
                  style={{ backgroundColor: item.color }}
                />
                {t(`CALENDAR_PAGE.LEGEND.${item.key}`)}
              </li>
            ))}
            <li className="cal-legend__hint">{t('CALENDAR_PAGE.HINT')}</li>
          </ul>

          <SessionsCalendarContainer
            enableWeekView
            onlyStatuses={filter === 'scheduled' ? UPCOMING : undefined}
            colorByStudent={colorByStudent}
          />
        </section>
      </div>
    </div>
  );
};

export default CalendarPage;
