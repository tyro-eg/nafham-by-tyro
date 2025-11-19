import { FC, useState } from 'react';

import { useRtlClass } from '../../assets/utils/utils';
import { SessionFilters } from '../../lib/queryKeys';
import { usePackages } from '../../hooks/usePackages';

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

  const overViewData = {
    previous_sessions_count: 21,
    upcoming_sessions_count: 0,
    total_unscheduled_time_in_minutes: 930,
    total_unscheduled_time_in_hours: 15.5,
    canceled_sessions_count: 5,
  };

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
