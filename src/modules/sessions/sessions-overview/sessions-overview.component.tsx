import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';

import './sessions-overview.styles.scss';

interface SessionsOverviewProps {
  overViewData: {
    upcoming_sessions_count: number;
    total_unscheduled_time_in_hours: number;
    previous_sessions_count: number;
    canceled_sessions_count: number;
  };
}

/**
 * SessionsOverview Component
 *
 * Displays session statistics overview cards.
 * Memoized to prevent unnecessary re-renders.
 */
const SessionsOverview: FC<SessionsOverviewProps> = memo(({ overViewData }) => {
  const { t } = useTranslation();

  return (
    <section className="sessions-overview">
      <SessionCard
        title={t('MYSESSIONS.OVERVIEW.UPCOMING')}
        value={overViewData.upcoming_sessions_count}
      />
      <SessionCard
        title={t('MYSESSIONS.OVERVIEW.UNSCHEDULED')}
        value={overViewData.total_unscheduled_time_in_hours}
      />
      <SessionCard
        title={t('MYSESSIONS.OVERVIEW.PREVIOUS')}
        value={overViewData.previous_sessions_count}
      />
      {/* <SessionCard
        title={t('MYSESSIONS.OVERVIEW.CANCELLED')}
        value={overViewData.canceled_sessions_count}
      /> */}
    </section>
  );
});

SessionsOverview.displayName = 'SessionsOverview';

/**
 * SessionCard Component
 *
 * Individual card displaying a single session statistic.
 * Memoized to prevent unnecessary re-renders.
 */
const SessionCard: FC<{ title: string; value: number }> = memo(
  ({ title, value }) => (
    <div className="sessions-overview__card">
      <p className="sessions-overview__card-value">{value}</p>
      <p className="sessions-overview__card-title">{title}</p>
    </div>
  ),
);

SessionCard.displayName = 'SessionCard';

export default SessionsOverview;
