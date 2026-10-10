import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useRtlClass } from '../../assets/utils/utils';
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
            {LEGEND.filter(
              (item) => filter === 'all' || item.key === 'SCHEDULED',
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
          />
        </section>
      </div>
    </div>
  );
};

export default CalendarPage;
