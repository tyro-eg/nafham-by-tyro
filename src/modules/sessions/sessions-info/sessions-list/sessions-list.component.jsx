// import React, { useEffect } from 'react';
// import PropTypes from 'prop-types';
// import { connect } from 'react-redux';
// import { createStructuredSelector } from 'reselect';
// import InfiniteScroll from 'react-infinite-scroll-component';
// import { useSnackbar } from 'notistack';
// import { Button } from '@material-ui/core';
// import { CalendarToday } from '@material-ui/icons';
// import { useTranslation } from 'react-i18next';
// import { useHistory } from 'react-router-dom';

// import SessionListCard from './sessions-list-card/sessions-list-card.component';
// import { getSessionStart } from '../../../../redux/session/session.actions';
// import {
//   selectSessions,
//   selectSessionsError,
//   selectSessionsPagination,
// } from '../../../../redux/session/session.selectors';
// import SESSIONS from './sessions-data';

// import './sessions-list.styles.scss';
// const SessionsList = ({
//   sessions,
//   sessionsError,
//   getSessionStartProp,
//   sessionsPagination,
// }) => {
//   const { enqueueSnackbar } = useSnackbar();
//   const { t } = useTranslation();
//   const history = useHistory();
//   useEffect(() => {
//     getSessionStartProp(10);
//   }, []);
//   useEffect(() => {
//     if (sessionsError)
//       enqueueSnackbar(sessionsError, {
//         variant: 'error',
//         persist: true,
//       });
//   }, [sessionsError]);
//   const goToHome = () => {
//     history.push('/home');
//   };
//   return (
//     <div>
//       {sessionsPagination && (
//         <InfiniteScroll
//           dataLength={sessions.length}
//           next={() =>
//             getSessionStartProp(Number(sessionsPagination['page-items']) + 10)
//           }
//           hasMore={Number(sessionsPagination['total-pages']) > 1}
//         >
//           <div className="sessions-list">
//             {SESSIONS && SESSIONS.length > 0 ? (
//               SESSIONS.map(
//                 (session) =>
//                   session &&
//                   session.id && (
//                     <SessionListCard key={session.id} session={session} />
//                   ),
//               )
//             ) : (
//               <div className="no-sessions">
//                 <CalendarToday />
//                 <p className="title">{t('MYSESSIONS.NO_SESSIONS_TITLE')}</p>
//                 <p className="subtitle">
//                   {t('MYSESSIONS.NO_SESSIONS_SUBTITLE')}
//                 </p>
//                 <Button variant="contained" color="primary" onClick={goToHome}>
//                   {t('MYSESSIONS.NO_SESSIONS_ACTION')}
//                 </Button>
//               </div>
//             )}
//           </div>
//         </InfiniteScroll>
//       )}
//     </div>
//   );
// };

// SessionsList.propTypes = {
//   sessions: PropTypes.array,
//   sessionsPagination: PropTypes.object,
//   sessionsError: PropTypes.any,
//   getSessionStartProp: PropTypes.func.isRequired,
// };

// const mapStateToProps = createStructuredSelector({
//   sessions: selectSessions,
//   sessionsPagination: selectSessionsPagination,
//   sessionsError: selectSessionsError,
// });

// const mapDispatchToProps = (dispatch) => ({
//   getSessionStartProp: (pageNumber) => dispatch(getSessionStart(pageNumber)),
// });

// export default connect(mapStateToProps, mapDispatchToProps)(SessionsList);

const SessionsList = () => {
  return <div>SessionsList</div>;
};

export default SessionsList;
