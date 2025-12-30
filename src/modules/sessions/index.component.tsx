import { FC, useState, useMemo } from 'react';

import { useRtlClass } from '../../assets/utils/utils';
import { SessionFilters } from '../../lib/queryKeys';
import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';

import SessionsInfo from './sessions-info/sessions-info.component';
import SessionsOverview from './sessions-overview/sessions-overview.component';
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
  const currentUser = useAppSelector(selectCurrentUser);

  // Get overview data from current user
  const overViewData = useMemo(() => {
    return {
      previous_sessions_count: currentUser?.previous_sessions_count ?? 0,
      upcoming_sessions_count: currentUser?.upcoming_sessions_count ?? 0,
      total_unscheduled_time_in_hours: currentUser?.unscheduled_hours ?? 0,
      canceled_sessions_count: 0, // Not available in user data
    };
  }, [currentUser]);

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
    </section>
  );
};

export default Sessions;
