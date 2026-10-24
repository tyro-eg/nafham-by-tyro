import { FC, ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  EventAvailableOutlined,
  HistoryOutlined,
  HourglassEmptyOutlined,
} from '@mui/icons-material';

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
    <section
      className="sessions-overview"
      aria-label={t('MYSESSIONS.OVERVIEW.TITLE')}
    >
      <SessionCard
        title={t('MYSESSIONS.OVERVIEW.UPCOMING')}
        value={overViewData.upcoming_sessions_count}
        icon={<EventAvailableOutlined />}
        tone="brand"
      />
      <SessionCard
        title={t('MYSESSIONS.OVERVIEW.UNSCHEDULED')}
        value={overViewData.total_unscheduled_time_in_hours}
        icon={<HourglassEmptyOutlined />}
        tone="accent"
      />
      <SessionCard
        title={t('MYSESSIONS.OVERVIEW.PREVIOUS')}
        value={overViewData.previous_sessions_count}
        icon={<HistoryOutlined />}
        tone="neutral"
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
const SessionCard: FC<{
  title: string;
  value: number;
  icon: ReactNode;
  tone: 'brand' | 'accent' | 'neutral';
}> = memo(({ title, value, icon, tone }) => (
  <div className={`sessions-overview__card sessions-overview__card--${tone}`}>
    <span className="sessions-overview__card-icon" aria-hidden="true">
      {icon}
    </span>
    <div className="sessions-overview__card-text">
      <p className="sessions-overview__card-value">{value}</p>
      <p className="sessions-overview__card-title">{title}</p>
    </div>
  </div>
));

SessionCard.displayName = 'SessionCard';

export default SessionsOverview;
