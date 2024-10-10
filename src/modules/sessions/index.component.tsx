// import React from 'react'

// import SessionsInfo from './sessions-info/sessions-info.component'
// import SessionsOverview from './sessions-overview/sessions-overview.component'
// import SessionsSchedule from './sessions-schedule/sessions-schedule.component'
// import SessionFilter from './session-filter/session-filter.component'

// import { rtlClass } from '../../assets/utils/utils'

// import SESSIONS_SCHEDULE_DATA from './sessions-schedule/sessions-schedule-data'

// import './index.styles.scss'
// const Sessions = () => {
//   const overViewData = {
//     previous_sessions_count: 21,
//     upcoming_sessions_count: 0,
//     total_unscheduled_time_in_minutes: 930,
//     total_unscheduled_time_in_hours: 15.5,
//     canceled_sessions_count: 5,
//   }
//   return (
//     <section className="sessions">
//       <div className="sessions__container container">
//         {SESSIONS_SCHEDULE_DATA && (
//           <SessionsSchedule unscheduledSessionsData={SESSIONS_SCHEDULE_DATA} />
//         )}
//       </div>
//       <div className="sessions__banner">
//         {overViewData && (
//           <div className={`overview ${rtlClass()}`}>
//             <SessionsOverview overViewData={overViewData} />
//           </div>
//         )}
//         <div className={`filter container ${rtlClass()}`}>
//           <SessionFilter />
//         </div>
//       </div>
//       <div className="sessions__container container">
//         <SessionsInfo />
//       </div>
//     </section>
//   )
// }

// export default Sessions

const Sessions = () => {
  return <div>Sessions</div>;
};

export default Sessions;
