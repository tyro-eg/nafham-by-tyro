// import React, { useState, useEffect } from 'react';
// import { makeStyles } from '@material-ui/core/styles';
// import {
//   Button,
//   Container,
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

// import './private-sessions-filter.styles.scss';

// const useStyles = makeStyles(() => ({
//   formControl: {
//     width: '100%',
//   },
// }));

// const PrivateSessionsFilter = ({ width }) => {
//   const classes = useStyles();
//   const { t } = useTranslation();
//   const [category, setCategory] = useState('');
//   const [field, setField] = useState('');
//   const [listBody, setListBody] = useState(false);

//   useEffect(() => {
//     if (width === 'xs' || width === 'sm') {
//       setListBody(false);
//     } else {
//       setListBody(true);
//     }
//   }, [width]);

//   const handleCategoryChange = (event) => {
//     if (event.target.value === '') setField('');
//     setCategory(event.target.value);
//   };

//   const handleFieldChange = (event) => {
//     setField(event.target.value);
//   };

//   const toggleListBody = () => {
//     setListBody(!listBody);
//   };
//   return (
//     <div className="home-filter">
//       <Container maxWidth="lg">
//         <div className="container home-filter__container">
//           <div
//             className={`home-filter__dropdown-container ${
//               listBody ? 'visible' : 'hidden'
//             }`}
//           >
//             <div className={`home-filter__dropdown-group ${rtlClass()}`}>
//               <div className={`home-filter__field ${rtlClass()}`}>
//                 <FormControl variant="outlined" className={classes.formControl}>
//                   <InputLabel id="category-label">
//                     {t('COURSES.COURSE_FILTER.CATEGORY.PLACEHOLDER')}
//                   </InputLabel>
//                   <Select
//                     labelId="category-label"
//                     id="category"
//                     value={category}
//                     onChange={handleCategoryChange}
//                     label={t('COURSES.COURSE_FILTER.CATEGORY.PLACEHOLDER')}
//                   >
//                     <MenuItem value="">
//                       <em>None</em>
//                     </MenuItem>
//                     {CATEGORIES.map((item) => (
//                       <MenuItem key={item.id} value={item.id}>
//                         {item.name}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//               </div>

//               <div className={`home-filter__field ${rtlClass()}`}>
//                 <FormControl variant="outlined" className={classes.formControl}>
//                   <InputLabel id="fields-label">
//                     {t('COURSES.COURSE_FILTER.FIELD.PLACEHOLDER')}
//                   </InputLabel>
//                   <Select
//                     labelId="fields-label"
//                     id="fields"
//                     value={field}
//                     onChange={handleFieldChange}
//                     label={t('COURSES.COURSE_FILTER.FIELD.PLACEHOLDER')}
//                     disabled={!category}
//                   >
//                     <MenuItem value="">
//                       <em>None</em>
//                     </MenuItem>
//                     <MenuItem value={10}>Ten</MenuItem>
//                     <MenuItem value={20}>Twenty</MenuItem>
//                     <MenuItem value={30}>Thirty</MenuItem>
//                   </Select>
//                 </FormControl>
//               </div>
//             </div>
//           </div>

//           <div className={`home-filter__field--search ${rtlClass()}`}>
//             <input
//               className={rtlClass()}
//               type="search"
//               placeholder={t('COURSES.COURSE_FILTER.SEARCH_PLACEHOLDER')}
//             />
//             <Button className={rtlClass()} type="button">
//               <img src={SearchIcon} alt="Magnifying Glass" />
//             </Button>
//           </div>

//           <div className={`home-filter__field--filter ${rtlClass()}`}>
//             <Button
//               onClick={toggleListBody}
//               startIcon={<Search />}
//               type="button"
//               className={`${listBody ? 'active' : ''} ${rtlClass()}`}
//             >
//               {t('COURSES.COURSE_FILTER.FILTERS')}
//             </Button>
//           </div>
//         </div>
//       </Container>
//     </div>
//   );
// };

// PrivateSessionsFilter.propTypes = { width: PropTypes.string };

// export default withWidth()(PrivateSessionsFilter);

// const CATEGORIES = [
//   { id: 1, name: 'Languages ', parent_id: null, visible: true },
//   { id: 2, name: 'Business ', parent_id: null, visible: true },
//   { id: 4, name: 'Exam Preparation', parent_id: null, visible: true },
//   { id: 5, name: 'Math ', parent_id: null, visible: true },
//   { id: 256, name: 'Science', parent_id: null, visible: true },
//   { id: 260, name: 'Soft Skills', parent_id: null, visible: true },
//   { id: 265, name: 'IG-', parent_id: null, visible: true },
//   { id: 267, name: 'National-English', parent_id: null, visible: true },
//   { id: 270, name: 'Programming', parent_id: null, visible: true },
//   { id: 274, name: 'SEO', parent_id: null, visible: true },
//   { id: 281, name: 'Arabic', parent_id: null, visible: true },
//   { id: 283, name: 'ACT English', parent_id: null, visible: true },
//   { id: 287, name: 'IG Arabic', parent_id: null, visible: true },
//   { id: 291, name: 'Primary', parent_id: null, visible: true },
// ];

const PrivateSessionsFilter = () => {
  return <div>PrivateSessionsFilter</div>;
};

export default PrivateSessionsFilter;
