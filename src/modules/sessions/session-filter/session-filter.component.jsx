// import React, { useState, useEffect } from 'react';
// import { makeStyles } from '@material-ui/core/styles';
// import {
//   Button,
//   FormControl,
//   InputLabel,
//   MenuItem,
//   Select,
//   withWidth,
// } from '@material-ui/core';
// import { Search } from '@material-ui/icons';
// import { useTranslation } from 'react-i18next';
// import PropTypes from 'prop-types';

// import { rtlClass } from '../../../assets/utils/utils';
// import SearchIcon from '../../../assets/images/Icon.png';

// import './session-filter.styles.scss';

// const useStyles = makeStyles(() => ({
//   formControl: {
//     width: '100%',
//   },
// }));

// const SessionFilter = ({ width }) => {
//   const classes = useStyles();
//   const { t } = useTranslation();
//   const sessionTypeOptions = [
//     { id: 'all', display: t('MYSESSIONS.FILTERS.ALL') },
//     { id: 'privateSession', display: t('MYSESSIONS.FILTERS.1TO1SESSION') },
//     { id: 'groupSession', display: t('MYSESSIONS.FILTERS.GROUPSESSION') },
//     {
//       id: 'freeTrialSession',
//       display: t('MYSESSIONS.FILTERS.FREETRIALSESSION'),
//     },
//   ];
//   const sessionDateOptions = [
//     { id: 'today', display: t('MYSESSIONS.FILTERS.TODAYSESSIONS') },
//     { id: 'thisWeek', display: t('MYSESSIONS.FILTERS.THISWEEKSESSIONS') },
//     { id: 'nextWeek', display: t('MYSESSIONS.FILTERS.NEXTWEEKSESSIONS') },
//     { id: 'lastWeek', display: t('MYSESSIONS.FILTERS.LASTWEEKSESSIONS') },
//   ];
//   const sessionStateOptions = [
//     { id: 'all', display: t('MYSESSIONS.FILTERS.ALL') },
//     { id: 'missedSessions', display: t('MYSESSIONS.FILTERS.MISSEDSESSIONS') },
//     {
//       id: 'completedSessions',
//       display: t('MYSESSIONS.FILTERS.COMPLETEDSESSIONS'),
//     },
//     { id: 'liveSession', display: t('MYSESSIONS.FILTERS.LIVESESSIONS') },
//     {
//       id: 'upcomingSession',
//       display: t('MYSESSIONS.FILTERS.UPCOMINGSESSIONS'),
//     },
//     {
//       id: 'liveSession/upcomingSession',
//       display: t('MYSESSIONS.FILTERS.LIVE/UPCOMINGSESSIONS'),
//     },
//   ];
//   const [type, setType] = useState('');
//   const [date, setDate] = useState('');
//   const [state, setState] = useState('liveSession/upcomingSession');
//   const [listBody, setListBody] = useState(false);

//   useEffect(() => {
//     if (width === 'xs' || width === 'sm') {
//       setListBody(false);
//     } else {
//       setListBody(true);
//     }
//   }, [width]);

//   const handleTypeChange = (event) => {
//     setType(event.target.value);
//   };

//   const handleDateChange = (event) => {
//     setDate(event.target.value);
//   };

//   const handleStateChange = (event) => {
//     setState(event.target.value);
//   };

//   const toggleListBody = () => {
//     setListBody(!listBody);
//   };
//   return (
//     <div className="session-filter">
//       <div className="container session-filter__container">
//         <div
//           className={`session-filter__dropdown-container ${
//             listBody ? 'visible' : 'hidden'
//           }`}
//         >
//           <div className={`session-filter__dropdown-group ${rtlClass()}`}>
//             <div className={`session-filter__field ${rtlClass()}`}>
//               <InputLabel id="type-label">
//                 {t('MYSESSIONS.FILTERS.SESSIONTYPE')}
//               </InputLabel>
//               <FormControl variant="outlined" className={classes.formControl}>
//                 <Select
//                   labelId="type-label"
//                   id="type"
//                   variant="standard"
//                   value={type}
//                   onChange={handleTypeChange}
//                   displayEmpty
//                 >
//                   <MenuItem value="" disabled>
//                     {t('MYSESSIONS.FILTERS.SESSIONTYPE')}
//                   </MenuItem>
//                   {sessionTypeOptions.map((item) => (
//                     <MenuItem key={item.id} value={item.id}>
//                       {item.display}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </div>

//             <div className={`session-filter__field ${rtlClass()}`}>
//               <InputLabel id="date-label">
//                 {t('MYSESSIONS.FILTERS.SESSIONDATE')}
//               </InputLabel>
//               <FormControl variant="outlined" className={classes.formControl}>
//                 <Select
//                   labelId="date-label"
//                   id="date"
//                   variant="standard"
//                   value={date}
//                   onChange={handleDateChange}
//                   displayEmpty
//                 >
//                   <MenuItem value="" disabled>
//                     {t('MYSESSIONS.FILTERS.SESSIONDATE')}
//                   </MenuItem>
//                   {sessionDateOptions.map((item) => (
//                     <MenuItem key={item.id} value={item.id}>
//                       {item.display}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </div>
//             <div className={`session-filter__field ${rtlClass()}`}>
//               <InputLabel id="state-label">
//                 {t('MYSESSIONS.FILTERS.SESSIONSTATE')}
//               </InputLabel>
//               <FormControl variant="outlined" className={classes.formControl}>
//                 <Select
//                   labelId="state-label"
//                   id="state"
//                   variant="standard"
//                   value={state}
//                   onChange={handleStateChange}
//                   displayEmpty
//                 >
//                   <MenuItem value="" disabled>
//                     {t('MYSESSIONS.FILTERS.SESSIONSTATE')}
//                   </MenuItem>
//                   {sessionStateOptions.map((item) => (
//                     <MenuItem key={item.id} value={item.id}>
//                       {item.display}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </div>
//           </div>
//         </div>

//         <div className={`session-filter__field--search ${rtlClass()}`}>
//           <input
//             className={rtlClass()}
//             type="search"
//             placeholder={t('COURSES.COURSE_FILTER.SEARCH_PLACEHOLDER')}
//           />
//           <Button type="button" className={rtlClass()}>
//             <img src={SearchIcon} alt="Magnifying Glass" />
//           </Button>
//         </div>

//         <div className={`session-filter__field--filter ${rtlClass()}`}>
//           <Button
//             onClick={toggleListBody}
//             startIcon={<Search />}
//             type="button"
//             className={`${listBody ? 'active' : ''} ${rtlClass()}`}
//           >
//             {t('COURSES.COURSE_FILTER.FILTERS')}
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };

// SessionFilter.propTypes = { width: PropTypes.string };

// export default withWidth()(SessionFilter);

const SessionFilter = () => {
  return <div>SessionFilter</div>;
};

export default SessionFilter;
