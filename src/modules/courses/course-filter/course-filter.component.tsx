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

// import './course-filter.styles.scss';

// const useStyles = makeStyles(() => ({
//   formControl: {
//     width: '100%',
//   },
// }));

// const CourseFilter = ({ width }) => {
//   const classes = useStyles();
//   const { t } = useTranslation();
//   const [category, setCategory] = useState('');
//   const [field, setField] = useState('');
//   const [language, setLanguage] = useState('ALL');
//   const [listBody, setListBody] = useState(false);

//   const LanguageLevel = [
//     {
//       id: 'ALL',
//       display: t('COURSES.COURSE_FILTER.LANGUAGE_LEVEL.OPTIONS.ALL'),
//     },
//     {
//       id: 'A1',
//       display: t('COURSES.COURSE_FILTER.LANGUAGE_LEVEL.OPTIONS.A1'),
//     },
//     {
//       id: 'A2',
//       display: t('COURSES.COURSE_FILTER.LANGUAGE_LEVEL.OPTIONS.A2'),
//     },
//     {
//       id: 'B1',
//       display: t('COURSES.COURSE_FILTER.LANGUAGE_LEVEL.OPTIONS.B1'),
//     },
//   ];

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

//   const handleLanguageChange = (event) => {
//     setLanguage(event.target.value);
//   };

//   const toggleListBody = () => {
//     setListBody(!listBody);
//   };
//   return (
//     <div className="course-filter">
//       <Container maxWidth="lg">
//         <div className="container course-filter__container">
//           <div
//             className={`course-filter__dropdown-container ${
//               listBody ? 'visible' : 'hidden'
//             }`}
//           >
//             <div className={`course-filter__dropdown-group ${rtlClass()}`}>
//               <div className={`course-filter__field ${rtlClass()}`}>
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

//               <div className={`course-filter__field ${rtlClass()}`}>
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
//               <div className={`course-filter__field ${rtlClass()}`}>
//                 <FormControl variant="outlined" className={classes.formControl}>
//                   <InputLabel id="language-label">
//                     {t('COURSES.COURSE_FILTER.LANGUAGE_LEVEL.PLACEHOLDER')}
//                   </InputLabel>
//                   <Select
//                     labelId="language-label"
//                     id="language"
//                     value={language}
//                     onChange={handleLanguageChange}
//                     label={t(
//                       'COURSES.COURSE_FILTER.LANGUAGE_LEVEL.PLACEHOLDER',
//                     )}
//                   >
//                     {LanguageLevel.map((item) => (
//                       <MenuItem key={item.id} value={item.id}>
//                         {item.display}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//               </div>
//             </div>
//           </div>

//           <div className={`course-filter__field--search ${rtlClass()}`}>
//             <input
//               className={rtlClass()}
//               type="search"
//               placeholder={t('COURSES.COURSE_FILTER.SEARCH_PLACEHOLDER')}
//             />
//             <Button type="button" className={rtlClass()}>
//               <img src={SearchIcon} alt="Magnifying Glass" />
//             </Button>
//           </div>

//           <div className={`course-filter__field--filter ${rtlClass()}`}>
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

// CourseFilter.propTypes = { width: PropTypes.string };

// export default withWidth()(CourseFilter);

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

const CourseFilter = () => {
  return <div>CourseFilter</div>;
};

export default CourseFilter;
