import { useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';

import SessionListCard from './sessions-list-card/sessions-list-card.component';
import {
  selectSessions,
  selectSessionsError,
  selectSessionsPagination,
} from '../../../../redux/session/session.selectors';

import { useAppDispatch, useAppSelector } from '../../../../redux/store';
import { getSessions } from '../../../../redux/session/session.actions';
import { CalendarToday } from '@mui/icons-material';

import './sessions-list.styles.scss';

const SessionsList = () => {
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const sessions = useAppSelector(selectSessions);
  const sessionsError = useAppSelector(selectSessionsError);
  const sessionsPagination = useAppSelector(selectSessionsPagination);

  useEffect(() => {
    dispatch(getSessions({ pageSize: 10, pageNumber: 1 }));
  }, [dispatch]);

  useEffect(() => {
    if (sessionsError) {
      enqueueSnackbar(sessionsError, {
        variant: 'error',
        persist: true,
      });
    }
  }, [sessionsError, enqueueSnackbar]);

  return (
    <div className="sessions-list-container">
      {sessionsPagination ? (
        <InfiniteScroll
          dataLength={sessions?.length || 0}
          next={() =>
            dispatch(
              getSessions({
                pageSize: Number(sessionsPagination['page-items']) + 10,
                pageNumber: 1,
              }),
            )
          }
          hasMore={
            (sessions?.length || 0) < Number(sessionsPagination['total-count'])
          }
          loader={<p>loading...</p>}
        >
          <div className="sessions-list">
            {sessions && sessions.length > 0 ? (
              sessions.map((session) =>
                session && session.id ? (
                  <SessionListCard key={session.id} session={session} />
                ) : null,
              )
            ) : (
              <div className="no-sessions">
                <CalendarToday />
                <p className="title">{t('MYSESSIONS.NO_SESSIONS_TITLE')}</p>
                <p className="subtitle">
                  {t('MYSESSIONS.NO_SESSIONS_SUBTITLE')}
                </p>
              </div>
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
