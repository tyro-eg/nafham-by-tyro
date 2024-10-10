// import React, { useState } from 'react';
// import { useHistory } from 'react-router-dom';
// import { Button, Dialog } from '@material-ui/core';
// import { makeStyles } from '@material-ui/core/styles';
// import PropTypes from 'prop-types';
// import { useTranslation } from 'react-i18next';
// import { Today } from '@material-ui/icons';
// import { format, parseISO } from 'date-fns';
// import arSA from 'date-fns/locale/ar-SA';
// import enUS from 'date-fns/locale/en-US';

// import { rtlClass } from '../../../../assets/utils/utils';
// import JoinCourseSuccessModal from '../../../../components/modals/join-course-success-modal/join-course-success-modal.component';
// import ReadMore from '../../../../components/read-more/read-more.component';

// import './course-info.styles.scss';
// const useStyles = makeStyles(() => ({
//   paperFullWidth: {
//     width: '100%',
//   },
//   paper: {
//     borderTop: '10px solid #3ac5f1',
//     margin: 0,
//   },
// }));
// const CourseInfo = ({ data, scrollToDes }) => {
//   const history = useHistory();
//   const locales = { ar: arSA, en: enUS };
//   const { t, i18n } = useTranslation();
//   const classes = useStyles();
//   const [openJoinSuccessModal, setOpenJoinSuccessModal] = useState(false);

//   const myDateFormatter = (dateStr) => {
//     const locale = locales[i18n.language];
//     return format(parseISO(dateStr), 'EEEE, LLLL d, y', { locale });
//   };

//   const navigateToHomeDirectory = () => {
//     history.push('/home');
//   };
//   const navigateToCourseCheckout = () => {
//     if (data.price < 1) {
//       setOpenJoinSuccessModal(true);
//     } else {
//       history.push(`/checkout?id=${data.id}&course=true`);
//     }
//   };

//   const handleCloseJoinSuccessModal = () => {
//     setOpenJoinSuccessModal(false);
//   };

//   return (
//     <section className={`course-detail ${rtlClass()}`}>
//       <div className="course-info">
//         <div className="course-info__container container">
//           <div className="course-info__container__details">
//             <div className="course-info__container__details__name">
//               {data.name}
//             </div>
//             <div className="course-info__container__details__by">
//               {t('COURSES.COURSE_INFO.BY')}
//               {data.tutor_name}
//             </div>
//             <div className="course-info__container__details__about">
//               <ReadMore
//                 text={data.description || ''}
//                 maxLength={250}
//                 readonly
//                 onClick={scrollToDes}
//               />
//             </div>
//           </div>
//           <div className="course-info__container__price-card">
//             <img
//               width="360"
//               height="200"
//               src={data.course_img}
//               alt="course cover"
//             />
//             <div className="content">
//               <p className="title">
//                 {t('COURSES.COURSE_DETAILS.FIRST_CARD.TITLE')}
//               </p>
//               {!!data.price && data.price > 0 ? (
//                 <>
//                   <span className="newPrice">
//                     {data.price} {t('GENEREL.EGP')}{' '}
//                   </span>
//                   {!!data.old_price && (
//                     <span className="oldPrice">
//                       {data.old_price} {t('GENEREL.EGP')}
//                     </span>
//                   )}
//                 </>
//               ) : (
//                 <span className="newPrice">
//                   {t('COURSES.COURSE_CARD.FREE')}
//                 </span>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//       <div className="block2 container">
//         <div className="block2__statistics">
//           <div className="block2__statistics-card">
//             <p className="block2__statistics-card__name">
//               <Today />
//               {t('COURSES.COURSE_CARD.START_DATE')}
//             </p>
//             <p className="block2__statistics-card__value">
//               {data.start_time && (
//                 <span>{myDateFormatter(data.start_time)}</span>
//               )}
//               {!data.start_time && <span>{t('COURSES.COURSE_CARD.TBA')}</span>}
//             </p>
//           </div>
//           <div className="block2__statistics-card">
//             <p className="block2__statistics-card__name">
//               {t('COURSES.COURSE_DESCRIPTION.LANGUAGE_LEVEL')}
//             </p>
//             <p className="block2__statistics-card__value">
//               {data.language_level}
//             </p>
//           </div>
//           <div className="block2__statistics-card">
//             <p className="block2__statistics-card__name">
//               {t('COURSES.COURSE_DESCRIPTION.COURSE_DURATION')}
//             </p>
//             <p className="block2__statistics-card__value">
//               {data.course_duration} {t('GENEREL.HOURS')}
//             </p>
//           </div>
//           <div className="block2__statistics-card">
//             <p className="block2__statistics-card__name">
//               {t('COURSES.COURSE_DESCRIPTION.NUMBER_OF_STUDENTS')}
//             </p>
//             <p className="block2__statistics-card__value">
//               {data.number_of_students}
//             </p>
//           </div>
//         </div>
//         <div className="block2__price-card">
//           {!data.user_purchased_course && (
//             <Button
//               onClick={navigateToCourseCheckout}
//               className="action1"
//               color="primary"
//               variant="contained"
//             >
//               {t('COURSES.COURSE_DETAILS.FIRST_CARD.LABELS.NOT_PURCHASED')}
//             </Button>
//           )}
//           <div>
//             <p className="title">
//               {t('COURSES.COURSE_DETAILS.SECOND_CARD.TITLE')}
//             </p>
//             <p className="description">
//               {t('COURSES.COURSE_DETAILS.SECOND_CARD.BODY')}
//             </p>
//           </div>
//           <Button
//             onClick={navigateToHomeDirectory}
//             className="action2"
//             color="primary"
//             variant="contained"
//           >
//             {t('COURSES.COURSE_DETAILS.SECOND_CARD.LABEL')}
//           </Button>
//         </div>
//       </div>
//       {openJoinSuccessModal && (
//         <Dialog
//           maxWidth="sm"
//           fullWidth
//           onClose={handleCloseJoinSuccessModal}
//           aria-labelledby="success-dialog"
//           open={openJoinSuccessModal}
//           classes={classes}
//         >
//           <JoinCourseSuccessModal
//             onClose={handleCloseJoinSuccessModal}
//             courseName={data && data.name ? data.name : undefined}
//           />
//         </Dialog>
//       )}
//     </section>
//   );
// };

// CourseInfo.propTypes = {
//   data: PropTypes.object,
//   scrollToDes: PropTypes.func,
// };

// export default CourseInfo;

const CourseInfo = () => {
  return <div>CourseInfo</div>;
};

export default CourseInfo;
