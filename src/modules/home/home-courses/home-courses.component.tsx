// import React, { useEffect, useState } from 'react';
// import { useTranslation } from 'react-i18next';

// import { AppBar, Tabs, Tab } from '@material-ui/core';

// import { tabsProps } from '../../../assets/utils/utils';
// import TabPanel from '../../../components/tabs/tab-banal.component';
// import Carousel from '../../../components/carousel/carousel';
// import CourseCard from '../../../components/course-card/course-card-component';
// import COURSES from '../../courses/courses-data';
// import { ReactComponent as EmptyImg } from '../../../assets/images/empty.svg';

// import './home-courses.styles.scss';

// const HomeCourses = () => {
//   const { t, i18n } = useTranslation();
//   const [value, setValue] = useState(0);
//   const [groupCourses, setGroupCourses] = useState([]);
//   const [crashCourse, setCrashCourse] = useState([]);
//   const [webinarCourses, setWebinarCourses] = useState([]);

//   useEffect(() => {
//     setGroupCourses(
//       COURSES.filter((course) => course.course_type === 'group_course'),
//     );
//     setCrashCourse(
//       COURSES.filter((course) => course.course_type === 'crash_course'),
//     );
//     setWebinarCourses(
//       COURSES.filter((course) => course.course_type === 'webinar'),
//     );
//   }, [COURSES]);

//   const handleChange = (event, newValue) => {
//     setValue(newValue);
//   };

//   return (
//     <div className="landing__courses">
//       <div className="container">
//         <div className="courses-container">
//           <p className="courses-header">{t('LANDING.BLOCK5.TITLE')}</p>
//         </div>
//         <div className="course-list-container">
//           <AppBar position="static" color="transparent">
//             <Tabs
//               value={value}
//               onChange={handleChange}
//               indicatorColor="primary"
//               textColor="primary"
//               variant="fullWidth"
//               aria-label="full width tabs example"
//             >
//               <Tab
//                 label={t('COURSES.COURSE_LIST.COURSE_ITEM_3.TITLE')}
//                 {...tabsProps(0)}
//               />
//               <Tab
//                 label={t('COURSES.COURSE_LIST.COURSE_ITEM_2.TITLE')}
//                 {...tabsProps(1)}
//               />
//               <Tab
//                 label={t('COURSES.COURSE_LIST.COURSE_ITEM_1.TITLE')}
//                 {...tabsProps(2)}
//               />
//             </Tabs>
//           </AppBar>
//           <div className="tab-init">
//             <TabPanel value={value} index={0} dir={i18n.dir()}>
//               {groupCourses && groupCourses.length > 0 ? (
//                 <Carousel>
//                   {groupCourses.map((card) => (
//                     <CourseCard key={card.id} data={card}></CourseCard>
//                   ))}
//                 </Carousel>
//               ) : (
//                 <div className="no_results">
//                   <div className="no_results__img">
//                     <EmptyImg />
//                   </div>
//                   <div className="no_results__content">
//                     <p>{t('COURSES.COURSE_LIST.NO_RESULTS.FIRST_P')}</p>
//                     <p>{t('COURSES.COURSE_LIST.NO_RESULTS.SECOND_P')}!</p>
//                   </div>
//                 </div>
//               )}
//             </TabPanel>
//             <TabPanel value={value} index={1} dir={i18n.dir()}>
//               <Carousel>
//                 {crashCourse.map((card) => (
//                   <CourseCard key={card.id} data={card}></CourseCard>
//                 ))}
//               </Carousel>
//             </TabPanel>
//             <TabPanel value={value} index={2} dir={i18n.dir()}>
//               <Carousel>
//                 {webinarCourses.map((card) => (
//                   <CourseCard key={card.id} data={card}></CourseCard>
//                 ))}
//               </Carousel>
//             </TabPanel>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HomeCourses;

const HomeCourses = () => {
  return <div>HomeCourses</div>;
};

export default HomeCourses;
