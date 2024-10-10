// import React, { useEffect } from 'react'
// import { useTranslation } from 'react-i18next'
// import Pagination from '@material-ui/lab/Pagination'
// import { Button } from '@material-ui/core'
// import { createStructuredSelector } from 'reselect'
// import { connect } from 'react-redux'
// import PropTypes from 'prop-types'

// import {
//   selectInstructors,
//   selectInstructorsPagination,
// } from '../../redux/user/user.selectors'
// import { getInstructorsStart } from '../../redux/user/user.actions'
// import { ReactComponent as EmptyImg } from '../../assets/images/empty.svg'
// import InstructorCard from '../../components/instructor-card/instructor-card.component'
// import PrivateSessionsFilter from './private-sessions-filter/private-sessions-filter.component'
// import Group from '../../assets/images/landing/feature_3.png'

// import './index.styles.scss'

// const PrivateSessions = ({
//   instructors,
//   instructorsPagination,
//   getInstructorsStartProp,
// }) => {
//   const { t } = useTranslation()

//   useEffect(() => {
//     getInstructorsStartProp({ pageNumber: 1 })
//   }, [])

//   const navigateToCoursesPage = () => {
//     // console.log('courses page')
//   }

//   const handlePageChange = (_event, value) => {
//     getInstructorsStartProp({ pageNumber: value })
//     scrollToTop()
//   }

//   const scrollToTop = () => {
//     window.scrollTo({
//       top: 0,
//       behavior: 'smooth',
//     })
//   }

//   return (
//     <div>
//       <PrivateSessionsFilter />
//       <section className="instructor-list">
//         {instructors && (
//           <div className="instructor-list__container container">
//             {instructors.map(
//               (instructor, i) =>
//                 i < 3 && (
//                   <InstructorCard key={instructor.id} instructor={instructor} />
//                 ),
//             )}
//           </div>
//         )}

//         {instructors && instructors.length > 0 && (
//           <div className="banner">
//             <div className="banner__container container">
//               <div className="banner__block1">
//                 <h5 className="title1">{t('HOME.BANNER.TITLE1')}</h5>
//                 <h2 className="title2">{t('HOME.BANNER.TITLE2')}</h2>
//                 <p className="description">{t('HOME.BANNER.DESCRIPTION')}</p>
//               </div>
//               <div className="banner__block2">
//                 <img className="image" src={Group} alt="feature_1" />
//                 <Button
//                   size="large"
//                   className="button"
//                   variant="contained"
//                   color="primary"
//                   onClick={navigateToCoursesPage}
//                 >
//                   {t('HOME.BANNER.ACTION')}
//                 </Button>
//               </div>
//             </div>
//           </div>
//         )}

//         {instructors && (
//           <div className="instructor-list__container container">
//             {instructors.map(
//               (instructor, i) =>
//                 i >= 3 && (
//                   <InstructorCard key={instructor.id} instructor={instructor} />
//                 ),
//             )}
//           </div>
//         )}
//         {((!!instructors && instructors.length === 0) || !instructors) && (
//           <div className="no_results container">
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
//       {instructorsPagination && instructorsPagination['total-pages'] && (
//         <Pagination
//           color="primary"
//           size="large"
//           count={Number(instructorsPagination['total-pages'])}
//           onChange={handlePageChange}
//         />
//       )}
//     </div>
//   )
// }

// PrivateSessions.propTypes = {
//   instructors: PropTypes.array,
//   instructorsPagination: PropTypes.object,
//   getInstructorsStartProp: PropTypes.func.isRequired,
// }

// const mapStateToProps = createStructuredSelector({
//   instructors: selectInstructors,
//   instructorsPagination: selectInstructorsPagination,
// })

// const mapDispatchToProps = (dispatch) => ({
//   getInstructorsStartProp: (pageNumber) =>
//     dispatch(getInstructorsStart(pageNumber)),
// })

// export default connect(mapStateToProps, mapDispatchToProps)(PrivateSessions)

const PrivateSessions = () => {
  return <div>Private Sessions</div>;
};

export default PrivateSessions;
