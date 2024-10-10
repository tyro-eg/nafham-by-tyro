// import React, { useEffect, useState } from 'react'
// import { useTranslation } from 'react-i18next'
// import { Button } from '@material-ui/core'
// // import PropTypes from 'prop-types'

// import COURSES from '../courses-data'
// import { ReactComponent as EmptyImg } from '../../../assets/images/empty.svg'
// import CourseCard from '../../../components/course-card/course-card-component'
// import CourseFilter from '../course-filter/course-filter.component'
// import feature1 from '../../../assets/images/landing/feature_1.png'

// import './courses-list.styles.scss'
// const CoursesList = () => {
//   const { t } = useTranslation()
//   const [groupCourses, setGroupCourses] = useState([])
//   const [webinarCourses, setWebinarCourses] = useState([])
//   useEffect(() => {
//     setGroupCourses(
//       COURSES.filter((course) => course.course_type !== 'webinar'),
//     )
//     setWebinarCourses(
//       COURSES.filter((course) => course.course_type === 'webinar'),
//     )
//   }, [COURSES])

//   const openFreeTrail = () => {}
//   return (
//     <>
//       <CourseFilter />
//       <section className="course-directory">
//         {COURSES && COURSES.length > 0 ? (
//           <div className="courses">
//             {groupCourses && groupCourses.length > 0 && (
//               <div className="course container">
//                 <div className="course__header">
//                   <p className="title">
//                     {t('COURSES.COURSE_LIST.COURSE_ITEM_3.TITLE')}
//                   </p>
//                 </div>
//                 <p className="course__text">
//                   {t('COURSES.COURSE_LIST.COURSE_ITEM_3.DESCRIPTION')}
//                 </p>
//                 <div className="course__list">
//                   {groupCourses.map((card) => (
//                     <CourseCard key={card.id} data={card}></CourseCard>
//                   ))}
//                 </div>
//               </div>
//             )}
//             <div className="banner">
//               <div className="banner__container container">
//                 <div className="banner__block1">
//                   <h5 className="title1">{t('COURSES.BANNER.TITLE1')}</h5>
//                   <h2 className="title2">{t('COURSES.BANNER.TITLE2')}</h2>
//                   <p className="description">
//                     {t('COURSES.BANNER.DESCRIPTION')}
//                   </p>
//                 </div>
//                 <div className="banner__block2">
//                   <img className="image" src={feature1} alt="feature_1" />
//                   <Button
//                     size="large"
//                     className="button"
//                     variant="contained"
//                     color="primary"
//                     onClick={openFreeTrail}
//                   >
//                     {t('COURSES.BANNER.ACTION')}
//                   </Button>
//                 </div>
//               </div>
//             </div>
//             {webinarCourses && webinarCourses.length > 0 && (
//               <div className="course container">
//                 <div className="course__header">
//                   <p className="title">
//                     {t('COURSES.COURSE_LIST.COURSE_ITEM_1.TITLE')}
//                   </p>
//                 </div>
//                 <p className="course__text">
//                   {t('COURSES.COURSE_LIST.COURSE_ITEM_1.DESCRIPTION')}
//                 </p>
//                 <div className="course__list">
//                   {webinarCourses.map((card) => (
//                     <CourseCard key={card.id} data={card}></CourseCard>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         ) : (
//           <div className="no_results">
//             <div className="no_results__img">
//               <EmptyImg />
//             </div>
//             <div className="no_results__content">
//               <p>{t('COURSES.COURSE_LIST.NO_RESULTS.FIRST_P')}</p>
//               <p>{t('COURSES.COURSE_LIST.NO_RESULTS.SECOND_P')}!</p>
//             </div>
//           </div>
//         )}
//       </section>
//     </>
//   )
// }

// // CoursesList.propTypes = {

// // }

// export default CoursesList

const CoursesList = () => {
  return <div>Courses List</div>;
};

export default CoursesList;
