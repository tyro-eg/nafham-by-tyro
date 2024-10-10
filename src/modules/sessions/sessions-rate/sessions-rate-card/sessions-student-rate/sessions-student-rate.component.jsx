// import React from 'react';
// import { useTranslation } from 'react-i18next';
// import { Button } from '@material-ui/core';
// import Rating from '@material-ui/lab/Rating';
// import PropTypes from 'prop-types';
// import { Formik, Form } from 'formik';
// import * as Yup from 'yup';
// import StarRounded from '@material-ui/icons/StarRounded';

// import { rtlClass } from '../../../../../assets/utils/utils';
// import './sessions-student-rate.component.scss';

// const SessionsStudentRate = ({ onClose }) => {
//   const { t } = useTranslation();
//   const studentRateSchema = Yup.object().shape({
//     rate: Yup.number().required(),
//     feedback: Yup.string(),
//   });
//   return (
//     <section className="studentRateModal">
//       <div className="studentRateModal__head u-center-text">
//         <h3 className="u-color-title u-font-size-24 u-font-weight-bold">
//           {t('MYSESSIONS.RATE.FEEDBACK.STUDENTTITLE')}
//         </h3>
//         <p className="u-color-body u-font-size-14">
//           {t('MYSESSIONS.RATE.FEEDBACK.SUBTITLE')}
//         </p>
//       </div>
//       <Formik
//         initialValues={{
//           rate: null,
//           feedback: '',
//         }}
//         validationSchema={studentRateSchema}
//         onSubmit={(values) => {
//           // eslint-disable-next-line no-param-reassign
//           values.rate = Number(values.rate);
//         }}
//       >
//         {({ values, handleChange, handleBlur, submitForm, isValid, dirty }) => (
//           <Form>
//             <div className="studentRateModal__textarea">
//               <Rating
//                 type="rate"
//                 name="rate"
//                 onChange={handleChange}
//                 onBlur={handleBlur}
//                 value={Number(values.rate)}
//                 icon={<StarRounded fontSize="inherit" />}
//               />
//               <p className="u-color-title">
//                 {t('MYSESSIONS.RATE.FEEDBACK.EXPERIENCE')}
//               </p>
//               <textarea
//                 name="feedback"
//                 rows="6"
//                 onChange={handleChange}
//                 onBlur={handleBlur}
//                 value={values.feedback}
//               />
//             </div>
//             <div className="studentRateModal__actions-container">
//               <Button
//                 type="button"
//                 variant="outlined"
//                 color="secondary"
//                 onClick={onClose}
//                 className={rtlClass()}
//               >
//                 {t('MYSESSIONS.RATE.FEEDBACK.CANCEL')}
//               </Button>
//               <Button
//                 type="submit"
//                 variant="contained"
//                 color="primary"
//                 disabled={!dirty || (!!dirty && !isValid)}
//                 onClick={submitForm}
//               >
//                 {t('MYSESSIONS.RATE.FEEDBACK.SUBMIT')}
//               </Button>
//             </div>
//           </Form>
//         )}
//       </Formik>
//     </section>
//   );
// };

// SessionsStudentRate.propTypes = {
//   onClose: PropTypes.func.isRequired,
// };

// export default SessionsStudentRate;

const SessionsStudentRate = () => {
  return <div>SessionsStudentRate</div>;
};

export default SessionsStudentRate;
