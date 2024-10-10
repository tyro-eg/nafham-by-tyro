// import React from 'react';
// import PropTypes from 'prop-types';
// import { useTranslation } from 'react-i18next';
// import { Button } from '@material-ui/core';
// import { Rating } from '@material-ui/lab';
// import { useHistory } from 'react-router-dom';

// import './course-instructor.styles.scss';
// const CourseInstructor = ({ data }) => {
//   const { t } = useTranslation();
//   const history = useHistory();
//   const navigateToInstructorProfile = () => {
//     history.push(`/profile/${data.tutor_id}`);
//   };
//   return (
//     <>
//       {!!data && (
//         <div className="course-instructor">
//           <div className="course-instructor__instructor">
//             <div className="course-instructor__instructor-info">
//               <div className="instructor__img">
//                 <img src={data.tutor_img} alt="Instructor" />
//               </div>
//               <div className="instructor__details">
//                 <div className="name">{data.tutor_name}</div>
//                 <div className="instructor__details-review">
//                   <Rating
//                     name="course rating"
//                     value={+Number(data.tutor_average_rating).toPrecision(2)}
//                     precision={0.1}
//                     readOnly
//                   />
//                   <span className="review-numbers">
//                     {+Number(data.tutor_average_rating).toPrecision(2)} (5.0)
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <h4 className="course-instructor__title">
//             {t('COURSES.COURSE_INSTRUCTOR.ABOUT_ME')}
//           </h4>
//           <div className="course-instructor__instructor-bio">
//             <p>
//               {data.tutor_bio}
//               <Button
//                 className="course-instructor__action"
//                 variant="text"
//                 color="primary"
//                 onClick={navigateToInstructorProfile}
//               >
//                 {t('COURSES.COURSE_INSTRUCTOR.READ_MORE')}
//               </Button>
//             </p>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// CourseInstructor.propTypes = {
//   data: PropTypes.object,
// };

// export default CourseInstructor;

const CourseInstructor = () => {
  return <div>CourseInstructor</div>;
};

export default CourseInstructor;
