import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { CalendarToday } from '@mui/icons-material';

import { useInfiniteSessions } from '../../../../hooks/useSessions';
import { SessionFilters } from '../../../../lib/queryKeys';

import SessionListCard from './sessions-list-card/sessions-list-card.component';

import './sessions-list.styles.scss';

interface SessionsListProps {
  filters?: SessionFilters;
}

/**
 * SessionsList Component
 *
 * Displays paginated list of sessions with infinite scroll.
 * Supports filtering by status and tutor_id.
 *
 * @param filters - Session filters (status, tutor_id)
 */
const SessionsList: FC<SessionsListProps> = ({ filters }) => {
  const { t } = useTranslation();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteSessions(10, filters);

  // Flatten all pages into a single array
  const sessions = data?.pages.flatMap((page) => page.data) ?? [];

  if (isError) {
    return (
      <div className="sessions-list-container">
        <div className="no-sessions">
          <CalendarToday />
          <p className="title">{t('MYSESSIONS.ERROR_TITLE')}</p>
          <p className="subtitle">{t('MYSESSIONS.ERROR_SUBTITLE')}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="sessions-list-container">
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px',
          }}
        >
          <p>{t('MYSESSIONS.LOADING_SESSIONS')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sessions-list-container">
      {sessions.length > 0 ? (
        <InfiniteScroll
          dataLength={sessions.length}
          next={fetchNextPage}
          hasMore={!!hasNextPage}
          loader={
            <div style={{ textAlign: 'center', padding: '10px' }}>
              {isFetchingNextPage ? t('MYSESSIONS.LOADING_MORE') : ''}
            </div>
          }
        >
          <div className="sessions-list">
            {sessions.map((session) =>
              session && session.id ? (
                <SessionListCard key={session.id} session={session} />
              ) : null,
            )}
          </div>
        </InfiniteScroll>
      ) : (
        <div className="no-sessions">
          <CalendarToday />
          <p className="title">{t('MYSESSIONS.NO_SESSIONS_TITLE')}</p>
          <p className="subtitle">{t('MYSESSIONS.NO_SESSIONS_SUBTITLE')}</p>
        </div>
      )}
    </div>
  );
};

export default SessionsList;
