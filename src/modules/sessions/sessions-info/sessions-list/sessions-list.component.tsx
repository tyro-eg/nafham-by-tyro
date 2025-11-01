import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { CalendarToday } from '@mui/icons-material';

import { useInfiniteSessions } from '../../../../hooks/useSessions';

import SessionListCard from './sessions-list-card/sessions-list-card.component';

import './sessions-list.styles.scss';

const SessionsList: FC = () => {
  const { t } = useTranslation();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteSessions(10);

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
        <p>Loading sessions...</p>
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
          loader={<p>{isFetchingNextPage ? 'Loading more...' : ''}</p>}
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
