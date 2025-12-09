import { FC, useState, useMemo, useEffect } from 'react';

import { useRtlClass } from '../../assets/utils/utils';
import { SessionFilters } from '../../lib/queryKeys';
import { usePackages } from '../../hooks/usePackages';
import { useInfiniteSessions } from '../../hooks/useSessions';

import SessionsInfo from './sessions-info/sessions-info.component';
import SessionsOverview from './sessions-overview/sessions-overview.component';
import SessionsSchedule from './sessions-schedule/sessions-schedule.component';
import SessionFilter from './session-filter/session-filter.component';

import './index.styles.scss';

/**
 * Sessions Page Component
 *
 * Main sessions page that manages filter state and coordinates
 * between SessionFilter, SessionsInfo, and other session-related components.
 */
const Sessions: FC = () => {
  const rtlClass = useRtlClass();
  const [filters, setFilters] = useState<SessionFilters>({});

  // Fetch packages with unscheduled sessions
  const { data: packagesResponse, isLoading: isLoadingPackages } = usePackages(
    1,
    20,
  );
  const packages = packagesResponse?.data || [];

  // Fetch all sessions to calculate overview statistics
  const {
    data: sessionsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteSessions(100); // Fetch large pages to get all sessions

  // Fetch all pages on mount to get complete session data for calculations
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, sessionsData]);

  // Flatten all sessions from all pages
  const allSessions = useMemo(() => {
    if (!sessionsData?.pages) return [];
    return sessionsData.pages.flatMap((page) => page.data);
  }, [sessionsData]);

  // Calculate overview data from actual sessions and packages
  const overViewData = useMemo(() => {
    const now = new Date();

    // Calculate session counts by status
    const previousSessions = allSessions.filter((session) => {
      const sessionDate = new Date(session.end_time);
      return (
        (session.status === 'completed' || session.status === 'missed') &&
        sessionDate < now
      );
    });

    const upcomingSessions = allSessions.filter((session) => {
      const sessionDate = new Date(session.start_time);
      return (
        (session.status === 'scheduled' || session.status === 'open') &&
        sessionDate >= now
      );
    });

    const canceledSessions = allSessions.filter(
      (session) => session.status === 'canceled',
    );

    // Calculate total unscheduled time from packages
    const totalUnscheduledHours = packages.reduce(
      (total, pkg) => total + (pkg.remaining_hours || 0),
      0,
    );

    return {
      previous_sessions_count: previousSessions.length,
      upcoming_sessions_count: upcomingSessions.length,
      total_unscheduled_time_in_hours: totalUnscheduledHours,
      canceled_sessions_count: canceledSessions.length,
    };
  }, [allSessions, packages]);

  const handleFiltersChange = (newFilters: SessionFilters) => {
    setFilters(newFilters);
  };

  return (
    <section className="sessions">
      <div className="sessions__banner">
        {overViewData && (
          <div className={`overview ${rtlClass}`}>
            <SessionsOverview overViewData={overViewData} />
          </div>
        )}
        <div className={`filter container ${rtlClass}`}>
          <SessionFilter onFiltersChange={handleFiltersChange} />
        </div>
      </div>
      <div className="sessions__container container">
        <SessionsInfo filters={filters} />
      </div>
      <div className="sessions__container container">
        {!isLoadingPackages && packages.length > 0 && (
          <SessionsSchedule packages={packages} />
        )}
      </div>
    </section>
  );
};

export default Sessions;
