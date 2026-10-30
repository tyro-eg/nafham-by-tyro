import { FC, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { SessionFilters } from '../../lib/queryKeys';
import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';

import SessionsInfo from './sessions-info/sessions-info.component';
import SessionsOverview from './sessions-overview/sessions-overview.component';
import SessionFilter from './session-filter/session-filter.component';

import './dashboard-shell.styles.scss';
import './index.styles.scss';

/**
 * Sessions Page Component
 *
 * Main sessions page that manages filter state and coordinates
 * between SessionFilter, SessionsInfo, and other session-related components.
 */
const Sessions: FC = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<SessionFilters>({});
  const currentUser = useAppSelector(selectCurrentUser);

  // Get overview data from current user
  const overViewData = useMemo(() => {
    return {
      previous_sessions_count: currentUser?.previous_sessions_count ?? 0,
      completed_sessions_count: currentUser?.completed_sessions_count ?? 0,
      upcoming_sessions_count: currentUser?.upcoming_sessions_count ?? 0,
      total_unscheduled_time_in_hours: currentUser?.unscheduled_hours ?? 0,
      canceled_sessions_count: currentUser?.cancelled_sessions_count ?? 0,
    };
  }, [currentUser]);

  const handleFiltersChange = (newFilters: SessionFilters) => {
    setFilters(newFilters);
  };

  return (
    <section className="sessions dashboard-page">
      <header className="dashboard-header">
        <div className="container dashboard-header__inner">
          <div className="dashboard-header__text">
            <h1 className="dashboard-header__title">
              {t('NAVIGATION.SESSIONS')}
            </h1>
          </div>
        </div>
      </header>
      <div className="sessions__container container dashboard-page__body">
        {overViewData && <SessionsOverview overViewData={overViewData} />}
        <SessionFilter onFiltersChange={handleFiltersChange} />
        <SessionsInfo filters={filters} />
      </div>
    </section>
  );
};

export default Sessions;
