// /* eslint-disable camelcase */
// import React, { useState } from 'react';
// import { useTranslation } from 'react-i18next';
// import PropTypes from 'prop-types';
// import { Button, InputLabel } from '@material-ui/core';
// import { TextField } from 'formik-material-ui';
// import { Formik, Form, Field } from 'formik';
// import * as Yup from 'yup';
// import 'yup-phone';
// import 'react-phone-input-2/lib/material.css';
// import { createStructuredSelector } from 'reselect';

// import { connect } from 'react-redux';
// import { changePasswordStart } from '../../../../redux/user/user.actions';
// import {
//   selectChangePasswordError,
//   selectCurrentUser,
// } from '../../../../redux/user/user.selectors.ts';

// import { rtlClass } from '../../../../assets/utils/utils';

// import './change-password.styles.scss';
// const ChangePassword = ({
//   changePasswordStartProp,
//   changePasswordError,
//   currentUser,
// }) => {
//   const { t, i18n } = useTranslation();
//   const ChangePasswordSchema = Yup.object().shape({
//     password: Yup.string()
//       .trim(i18n.t('GENEREL.EMPTY_SPACE'))
//       .strict()
//       .required(i18n.t('GENEREL.REQUIRED'))
//       .min(8, i18n.t('GENEREL.SHORT_PASSWORD')),
//     password_confirmation: Yup.string()
//       .trim(i18n.t('GENEREL.EMPTY_SPACE'))
//       .strict()
//       .required(i18n.t('GENEREL.REQUIRED'))
//       .oneOf(
//         [Yup.ref('password'), null],
//         i18n.t('GENEREL.PASSWORD_CONFIRMATION_ERROR'),
//       ),
//   });
//   const [editPasswordFlag, setEditPasswordFlag] = useState(false);

//   const togglePasswordFlag = () => {
//     setEditPasswordFlag((prevFlag) => !prevFlag);
//   };

//   const cancelPasswordEdit = () => setEditPasswordFlag(false);

//   return (
//     <div className="container change-password">
//       <h4 className="sub-title">
//         {t('ACCOUNT_SETTINGS.CHANGE_PASSWORD_FORM.TITLE')}
//       </h4>
//       <div className="change-password__form-container">
//         <Formik
//           initialValues={{
//             password: '',
//             password_confirmation: '',
//           }}
//           validationSchema={ChangePasswordSchema}
//           onSubmit={(values, { setSubmitting, resetForm }) => {
//             changePasswordStartProp({ ...values, type: currentUser.type });
//             setSubmitting(false);
//             if (!changePasswordError) {
//               resetForm();
//               cancelPasswordEdit();
//             }
//           }}
//         >
//           {({ submitForm, isSubmitting }) => (
//             <Form className={`change-password__form  ${rtlClass()}`}>
//               <fieldset disabled={!editPasswordFlag} className="form-inputs">
//                 <div className={`form-group  ${rtlClass()}`}>
//                   <InputLabel htmlFor="password">
//                     {t('ACCOUNT_SETTINGS.CHANGE_PASSWORD_FORM.NEW_PASSWORD')}
//                   </InputLabel>
//                   <Field
//                     component={TextField}
//                     placeholder={t(
//                       'ACCOUNT_SETTINGS.CHANGE_PASSWORD_FORM.NEW_PASSWORD',
//                     )}
//                     variant="outlined"
//                     name="password"
//                     id="password"
//                     type="password"
//                     className="custom-input-style"
//                     disabled={!editPasswordFlag}
//                   />
//                 </div>
//                 <div className={`form-group  ${rtlClass()}`}>
//                   <InputLabel htmlFor="password_confirmation">
//                     {t('ACCOUNT_SETTINGS.CHANGE_PASSWORD_FORM.VERIFY_PASSWORD')}
//                   </InputLabel>
//                   <Field
//                     component={TextField}
//                     placeholder={t(
//                       'ACCOUNT_SETTINGS.CHANGE_PASSWORD_FORM.VERIFY_PASSWORD',
//                     )}
//                     variant="outlined"
//                     name="password_confirmation"
//                     id="password_confirmation"
//                     type="password"
//                     className="custom-input-style"
//                     disabled={!editPasswordFlag}
//                   />
//                 </div>
//                 {
//                   //   changePasswordError ? (
//                   //   <div className="form-control-danger">{changePasswordError}</div>
//                   // ) : null
//                 }
//               </fieldset>
//               {!!editPasswordFlag && (
//                 <div className="from-actions">
//                   <Button
//                     variant="contained"
//                     color="primary"
//                     disabled={isSubmitting}
//                     onClick={submitForm}
//                     className="btn-custom-style"
//                   >
//                     {t(
//                       'ACCOUNT_SETTINGS.CHANGE_PASSWORD_FORM.CHANGE_PASSWORD_BTN',
//                     )}
//                   </Button>
//                   <Button
//                     variant="text"
//                     disabled={isSubmitting || !editPasswordFlag}
//                     onClick={cancelPasswordEdit}
//                     className="cancel-btn"
//                   >
//                     {t('ACCOUNT_SETTINGS.CONTACT_DETAILS_FORM.CANCEL')}
//                   </Button>
//                 </div>
//               )}
//             </Form>
//           )}
//         </Formik>
//         {!editPasswordFlag && (
//           <Button
//             variant="text"
//             onClick={togglePasswordFlag}
//             className="edit-btn"
//           >
//             {t('ACCOUNT_SETTINGS.EDIT')}
//           </Button>
//         )}
//       </div>
//     </div>
//   );
// };

// ChangePassword.propTypes = {
//   changePasswordStartProp: PropTypes.func.isRequired,
//   changePasswordError: PropTypes.string,
//   currentUser: PropTypes.object,
// };

// const mapStateToProps = createStructuredSelector({
//   changePasswordError: selectChangePasswordError,
//   currentUser: selectCurrentUser,
// });

// const mapDispatchToProps = (dispatch) => ({
//   changePasswordStartProp: (userData) =>
//     dispatch(changePasswordStart(userData)),
// });

// export default connect(mapStateToProps, mapDispatchToProps)(ChangePassword);

const ChangePassword = () => {
  return <div>ChangePassword</div>;
};

export default ChangePassword;
