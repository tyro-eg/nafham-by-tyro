// import React, { useEffect } from 'react';
// import { useTranslation } from 'react-i18next';
// import { createStructuredSelector } from 'reselect';
// import { connect } from 'react-redux';
// import PropTypes from 'prop-types';

// import Carousel from '../../../components/carousel/carousel';
// import HomeInstructorCard from '../../../components/home-instructor-card/home-instructor-card.component';

// import './home-instructors.styles.scss';
// import { getInstructorsStart } from '../../../redux/user/user.actions';
// import { selectInstructors } from '../../../redux/user/user.selectors.ts';

// const HomeInstructors = ({ instructors, getInstructorsStartProp }) => {
//   const { t } = useTranslation();
//   useEffect(() => {
//     getInstructorsStartProp({ pageNumber: 1, pageSize: 5 });
//   }, []);
//   return (
//     <div className="landing__instructors">
//       <div className="container">
//         <div className="instructors-container">
//           <p className="instructors-header">{t('LANDING.BLOCK3.TITLE')}</p>
//         </div>
//         {instructors && (
//           <Carousel>
//             {instructors.map(
//               (instructor, i) =>
//                 i < 5 && (
//                   <HomeInstructorCard
//                     key={instructor.id}
//                     instructor={instructor}
//                   />
//                 ),
//             )}
//           </Carousel>
//         )}
//       </div>
//     </div>
//   );
// };

// HomeInstructors.propTypes = {
//   instructors: PropTypes.array,
//   getInstructorsStartProp: PropTypes.func.isRequired,
// };

// const mapStateToProps = createStructuredSelector({
//   instructors: selectInstructors,
// });

// const mapDispatchToProps = (dispatch) => ({
//   getInstructorsStartProp: (pageNumber) =>
//     dispatch(getInstructorsStart(pageNumber)),
// });

// export default connect(mapStateToProps, mapDispatchToProps)(HomeInstructors);

const HomeInstructors = () => {
  return <div>HomeInstructors</div>;
};

export default HomeInstructors;
