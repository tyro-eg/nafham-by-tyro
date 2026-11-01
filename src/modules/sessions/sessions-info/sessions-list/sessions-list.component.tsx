import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { CalendarToday } from '@mui/icons-material';

import { useInfiniteSessions } from '../../../../hooks/useSessions';
import { SessionFilters } from '../../../../lib/queryKeys';
import { useAppSelector } from '../../../../redux/store';
import { selectCurrentUser } from '../../../../redux/user/user.selectors';
import { counterpartName, useLiveSessionToast } from '../../session-state';

import SessionListCard from './sessions-list-card/sessions-list-card.component';

import './sessions-list.styles.scss';

interface SessionsListProps {
  filters?: SessionFilters;
  /** Headed by day (today, tomorrow, the date), the date tile dropped */
  grouped?: boolean;
}

const dayKey = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * SessionsList Component
 *
 * Displays paginated list of sessions with infinite scroll.
 * Supports filtering by status and tutor_id.
 *
 * @param filters - Session filters (status, tutor_id)
 */
const SessionsList: FC<SessionsListProps> = ({ filters, grouped = false }) => {
  const { t, i18n } = useTranslation();

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
  const currentUser = useAppSelector(selectCurrentUser);

  // The day each session falls on, as a heading: today, tomorrow, or the date
  const groups = useMemo(() => {
    const today = dayKey(new Date().toISOString());
    const tomorrow = dayKey(new Date(Date.now() + 86400000).toISOString());
    const yesterday = dayKey(new Date(Date.now() - 86400000).toISOString());
    const map = new Map<string, { label: string; items: typeof sessions }>();
    sessions.forEach((session) => {
      if (!session?.id) return;
      const key = dayKey(session.start_time);
      if (!map.has(key)) {
        const label =
          key === today
            ? t('MYSESSIONS.GROUP.TODAY')
            : key === tomorrow
              ? t('MYSESSIONS.GROUP.TOMORROW')
              : key === yesterday
                ? t('MYSESSIONS.GROUP.YESTERDAY')
                : new Date(session.start_time).toLocaleDateString(
                    `${i18n.language}-u-nu-latn`,
                    {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    },
                  );
        map.set(key, { label, items: [] });
      }
      map.get(key)!.items.push(session);
    });
    return [...map.entries()];
  }, [sessions, t, i18n.language]);

  useLiveSessionToast(data ? sessions : undefined, (session) =>
    t('MYSESSIONS.MAIN.CARD.LIVE_TOAST', {
      name: counterpartName(session, currentUser?.id),
    }),
  );

  if (isError) {
    return (
      <div className="sessions-list-container">
        <div className="no-sessions dashboard-empty">
          <span className="dashboard-empty__icon" aria-hidden="true">
            <CalendarToday />
          </span>
          <p className="dashboard-empty__title">
            {t('MYSESSIONS.ERROR_TITLE')}
          </p>
          <p className="dashboard-empty__text">
            {t('MYSESSIONS.ERROR_SUBTITLE')}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="sessions-list-container">
        <div className="dashboard-empty sessions-list__loading" role="status">
          <p className="dashboard-empty__text">
            {t('MYSESSIONS.LOADING_SESSIONS')}
          </p>
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
            <div className="sessions-list__loader">
              {isFetchingNextPage ? t('MYSESSIONS.LOADING_MORE') : ''}
            </div>
          }
        >
          {grouped ? (
            <div className="sessions-list sessions-list--grouped">
              {groups.map(([key, group]) => (
                <section key={key} className="sessions-day">
                  <h2 className="sessions-day__title">{group.label}</h2>
                  {group.items.map((session) => (
                    <SessionListCard key={session.id} session={session} />
                  ))}
                </section>
              ))}
            </div>
          ) : (
            <div className="sessions-list">
              {sessions.map((session) =>
                session && session.id ? (
                  <SessionListCard key={session.id} session={session} />
                ) : null,
              )}
            </div>
          )}
        </InfiniteScroll>
      ) : (
        <div className="no-sessions dashboard-empty">
          <span className="dashboard-empty__icon" aria-hidden="true">
            <CalendarToday />
          </span>
          <p className="dashboard-empty__title">
            {t('MYSESSIONS.NO_SESSIONS_TITLE')}
          </p>
          <p className="dashboard-empty__text">
            {t('MYSESSIONS.NO_SESSIONS_SUBTITLE')}
          </p>
        </div>
      )}
    </div>
  );
};

export default SessionsList;
