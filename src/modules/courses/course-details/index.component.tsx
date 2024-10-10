// import React, { createRef, useEffect, useRef, useState } from 'react'
// import {
//   Accordion,
//   AccordionDetails,
//   AccordionSummary,
// } from '@material-ui/core'
// import { ExpandMore } from '@material-ui/icons'
// import { useTranslation } from 'react-i18next'
// import { useParams } from 'react-router-dom'

// import CourseInfo from './course-info/course-info.component'
// import Calendar from '../../../components/calendar/calendar.component'
// import CourseInstructor from './course-instructor/course-instructor.component'
// import ReadMore from '../../../components/read-more/read-more.component'
// import COURSES from '../courses-data'

// import './index.styles.scss'
// const CourseDetails = () => {
//   const contentRef = createRef()
//   const scrollRef = useRef()
//   const { t } = useTranslation()
//   const { courseId } = useParams()
//   const [course, setCourse] = useState()
//   useEffect(() => {
//     setCourse(
//       COURSES.filter(
//         (courseObj) => Number(courseObj.id) === Number(courseId),
//       )[0],
//     )
//   }, [courseId])

//   useEffect(() => {
//     if (course) {
//       if (course.content) {
//         contentRef.current.innerHTML = course.content.replace(
//           '<p data-f-id="pbf" style="text-align: center; font-size: 14px; margin-top: 30px; opacity: 0.65; font-family: sans-serif;">Powered by <a href="https://www.froala.com/wysiwyg-editor?pb=1" title="Froala Editor">Froala Editor</a></p>',
//           '',
//         )
//       }
//     }
//   }, [course])

//   const scrollBottom = () => {
//     scrollRef.current.scrollIntoView({
//       behavior: 'smooth',
//     })
//   }
//   return (
//     <>
//       {!!course && (
//         <section className="course-details">
//           <CourseInfo scrollToDes={scrollBottom} data={course} />
//           <div className="course-details__container container">
//             <div className="course-details__content">
//               <h4 className="course-details__content-title">
//                 {t('COURSES.COURSE_INFO.COURSE_CONTENT')}
//               </h4>
//               <div className="course-details__content-container">
//                 <Accordion>
//                   <AccordionSummary
//                     expandIcon={<ExpandMore />}
//                     aria-controls="panel1a-content"
//                     id="panel1a-header"
//                     className="content-title"
//                   >
//                     {t('COURSES.COURSE_INFO.SECTION')}
//                   </AccordionSummary>
//                   <AccordionDetails ref={contentRef}></AccordionDetails>
//                 </Accordion>
//               </div>
//             </div>
//             <div className="course-details__description" ref={scrollRef}>
//               <h4 className="course-details__description-title">
//                 {t('COURSES.COURSE_INFO.COURSE_DESCRIPTION')}
//               </h4>
//               <div className="course-details__description-container">
//                 <ReadMore text={course.description || ''} maxLength={405} />
//               </div>
//             </div>
//             {course.course_type !== 'webinar' && (
//               <div className="course-details__calendar">
//                 <h4 className="course-details__calendar-title">
//                   {t('COURSES.CALENDAR.TITLE')}
//                 </h4>
//                 <div className="course-details__calendar-container">
//                   <Calendar />
//                 </div>
//               </div>
//             )}
//             <div className="course-details__instructor">
//               <h4 className="course-details__instructor-title">
//                 {t('COURSES.COURSE_INSTRUCTOR.INSTRUCTOR')}
//               </h4>
//               <div className="course-details__instructor-container">
//                 <CourseInstructor data={course} />
//               </div>
//             </div>
//           </div>
//         </section>
//       )}
//     </>
//   )
// }

// export default CourseDetails

const CourseDetails = () => {
  return <div>Course Details</div>;
};

export default CourseDetails;
