// import React, { useState, useEffect } from 'react';
// import PropTypes from 'prop-types';
// import SessionsRateCard from './sessions-rate-card/sessions-rate-card.component';
// import './sessions-rate.styles.scss';
// const SessionsRate = ({ unratedSessions }) => {
//   const [sessions, setSessions] = useState(unratedSessions);

//   useEffect(() => {
//     setSessions(
//       sessions
//         .sort((a, b) => (a.start_time > b.start_time ? -1 : 1))
//         .slice(0, 3),
//     );
//   }, []);
//   return (
//     <div className="sessions-rate-container">
//       <section className="sessions-rate">
//         <div className="sessions-rate__container">
//           {sessions.map((session) => (
//             <SessionsRateCard key={session.id} session={session} />
//           ))}
//         </div>
//       </section>
//     </div>
//   );
// };

// SessionsRate.propTypes = {
//   unratedSessions: PropTypes.array,
// };

// export default SessionsRate;

const SessionsRate = () => {
  return <div>SessionsRate</div>;
};

export default SessionsRate;
