// import React from 'react';
// import { useTranslation } from 'react-i18next';
// import { Tabs, Tab } from '@material-ui/core';

// import { tabsProps } from '../../../assets/utils/utils';
// import TabPanel from '../../../components/tabs/tab-banal.component';
// import SessionsList from './sessions-list/sessions-list.component';
// import SessionsDownloads from './sessions-downloads/sessions-downloads.component';
// import SessionsCalendarContainer from './sessions-calendar-container/sessions-calendar-container.component';
// import SessionsRate from '../sessions-rate/sessions-rate.component';

// import UNRATED_SESSIONS_DATA from '../sessions-rate/unrated-sessions-data';

// import './sessions-info.styles.scss';

// const SessionsInfo = () => {
//   const { t, i18n } = useTranslation();
//   const [tab1, setTab1] = React.useState(2);
//   const [tab2, setTab2] = React.useState(0);

//   const onChangeTab1 = (event, newValue) => {
//     setTab1(newValue);
//   };
//   const onChangeTab2 = (event, newValue) => {
//     setTab2(newValue);
//   };

//   return (
//     <div className="sessions-info">
//       <Tabs
//         value={tab1}
//         onChange={onChangeTab1}
//         indicatorColor="primary"
//         textColor="primary"
//         aria-label="my sessions tabs"
//         className="session-tab1"
//       >
//         <Tab
//           className="tab1"
//           label={t('MYSESSIONS.MAIN.DOWNLOADS')}
//           {...tabsProps(0)}
//         />
//         <Tab
//           className="tab1"
//           label={t('MYSESSIONS.MAIN.CALENDAR')}
//           {...tabsProps(1)}
//         />
//         <Tab
//           className="tab1"
//           label={t('MYSESSIONS.MAIN.LIST')}
//           {...tabsProps(2)}
//         />
//       </Tabs>
//       <div className="sessions-info__tab-init">
//         <TabPanel value={tab1} index={2} dir={i18n.dir()}>
//           <Tabs
//             value={tab2}
//             onChange={onChangeTab2}
//             indicatorColor="primary"
//             textColor="primary"
//             aria-label="sessions lists"
//             className="session-tab2"
//           >
//             <Tab
//               className="tab2"
//               label={t('MYSESSIONS.TABS.SESSIONS')}
//               {...tabsProps(0)}
//             />
//             <Tab
//               className="tab2"
//               label={t('MYSESSIONS.TABS.RATE')}
//               {...tabsProps(1)}
//             />
//           </Tabs>
//           <div className="session-list-tabs">
//             <TabPanel value={tab2} index={0} dir={i18n.dir()}>
//               <SessionsList />
//             </TabPanel>
//             <TabPanel value={tab2} index={1} dir={i18n.dir()}>
//               {UNRATED_SESSIONS_DATA && (
//                 <SessionsRate unratedSessions={UNRATED_SESSIONS_DATA} />
//               )}
//             </TabPanel>
//           </div>
//         </TabPanel>
//         <TabPanel value={tab1} index={1} dir={i18n.dir()}>
//           <SessionsCalendarContainer />
//         </TabPanel>
//         <TabPanel value={tab1} index={0} dir={i18n.dir()}>
//           <SessionsDownloads />
//         </TabPanel>
//       </div>
//     </div>
//   );
// };

// export default SessionsInfo;

const SessionsInfo = () => {
  return <div>SessionsInfo</div>;
};

export default SessionsInfo;
