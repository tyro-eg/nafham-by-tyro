// import React, { useEffect, useState } from 'react';
// import { useTranslation } from 'react-i18next';
// import PropTypes from 'prop-types';

// import SessionsScheduleCard from './sessions-schedule-card/sessions-schedule-card.component';
// import Carousel from '../../../components/carousel/carousel';

// import './sessions-schedule.styles.scss';

// const SessionsSchedule = ({ unscheduledSessionsData }) => {
//   const { t } = useTranslation();
//   const [packageData, setPackageData] = useState([]);
//   useEffect(() => {
//     const unscheduled = {};
//     let packageCloneUser;

//     unscheduledSessionsData.forEach((p) => {
//       packageCloneUser = p.instructor_id;

//       if (!unscheduled[packageCloneUser]) {
//         unscheduled[packageCloneUser] = {
//           user_id: p.instructor_id,
//           user_image: p.instructor_image,
//           user_name: p.instructor_name,
//           field: p.package_clone_field,
//           field_id: p.package_clone_field_id,
//           total_minutes: 0,
//           package_clones: [],
//           instructor_rating: p.instructor_rating,
//           instructor_reviews: p.instructor_reviews,
//         };
//       }
//       unscheduled[packageCloneUser].package_clones.push({
//         id: p.package_clone_id,
//         minutes: p.minutes,
//         original_minutes: p.original_minutes,
//       });
//       unscheduled[packageCloneUser].total_minutes += p.minutes;
//     });
//     setPackageData(Object.values(unscheduled));
//   }, []);

//   return (
//     <section className="sessions-schedule">
//       <h2 className="sessions-schedule__title">
//         {t('MYSESSIONS.SCHEDULE.TITLE')}
//       </h2>
//       <div className="sessions-schedule__container">
//         <Carousel small>
//           {packageData.map((unscheduledSession) => (
//             <div key={unscheduledSession.user_id} className="unscheduled-card">
//               <SessionsScheduleCard data={unscheduledSession} />
//             </div>
//           ))}
//         </Carousel>
//       </div>
//     </section>
//   );
// };

// SessionsSchedule.propTypes = {
//   unscheduledSessionsData: PropTypes.array,
// };

// export default SessionsSchedule;

const SessionsSchedule = () => {
  return <div>SessionsSchedule</div>;
};

export default SessionsSchedule;
