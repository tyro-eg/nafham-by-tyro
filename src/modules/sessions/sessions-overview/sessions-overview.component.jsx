// import React from 'react';
// import { useTranslation } from 'react-i18next';
// import PropTypes from 'prop-types';

// import './sessions-overview.styles.scss';

// const SessionsOverview = ({ overViewData }) => {
//   const { t } = useTranslation();
//   return (
//     <section className="sessions-overview">
//       <div className="sessions-overview__card">
//         <p className="sessions-overview__card-value">
//           {overViewData.upcoming_sessions_count}
//         </p>
//         <p className="sessions-overview__card-title">
//           {t('MYSESSIONS.OVERVIEW.UPCOMING')}
//         </p>
//       </div>

//       <div className="sessions-overview__card">
//         <p className="sessions-overview__card-value">
//           {overViewData.total_unscheduled_time_in_hours}
//         </p>
//         <p className="sessions-overview__card-title">
//           {t('MYSESSIONS.OVERVIEW.UNSCHEDULED')}
//         </p>
//       </div>

//       <div className="sessions-overview__card">
//         <p className="sessions-overview__card-value">
//           {overViewData.previous_sessions_count}
//         </p>
//         <p className="sessions-overview__card-title">
//           {t('MYSESSIONS.OVERVIEW.PREVIOUS')}
//         </p>
//       </div>
//     </section>
//   );
// };

// SessionsOverview.propTypes = {
//   overViewData: PropTypes.object,
// };

// export default SessionsOverview;

const SessionsOverview = () => {
  return <div>SessionsOverview</div>;
};

export default SessionsOverview;
