import React, { useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';

import SessionListCard from './sessions-list-card/sessions-list-card.component';
import {
  selectSessions,
  selectSessionsError,
  selectSessionsPagination,
} from '../../../../redux/session/session.selectors';

import './sessions-list.styles.scss';
import { useAppDispatch, useAppSelector } from '../../../../redux/store';
import { useNavigate } from 'react-router-dom';
import { getSessions } from '../../../../redux/session/session.actions';
import { Button } from '@mui/material';
import { CalendarToday } from '@mui/icons-material';

const SessionsList = () => {
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const sessions = useAppSelector(selectSessions);
  const sessionsError = useAppSelector(selectSessionsError);
  const sessionsPagination = useAppSelector(selectSessionsPagination);

  useEffect(() => {
    dispatch(getSessions({ pageSize: 10 }));
  }, [dispatch]);

  useEffect(() => {
    if (sessionsError) {
      enqueueSnackbar(sessionsError, {
        variant: 'error',
        persist: true,
      });
    }
  }, [sessionsError, enqueueSnackbar]);

  const goToHome = () => {
    navigate('/home');
  };

  return (
    <div className="sessions-list-container">
      {sessionsPagination && (
        <InfiniteScroll
          dataLength={sessions?.length || 0}
          next={() =>
            dispatch(
              getSessions({
                pageSize: Number(sessionsPagination['page-items']) + 10,
              }),
            )
          }
          hasMore={Number(sessionsPagination['total-pages']) > 1}
          loader={<h4 className="loading-text">Loading...</h4>}
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
                <Button variant="contained" color="primary" onClick={goToHome}>
                  {t('MYSESSIONS.NO_SESSIONS_ACTION')}
                </Button>
              </div>
            )}
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
};

export default SessionsList;
