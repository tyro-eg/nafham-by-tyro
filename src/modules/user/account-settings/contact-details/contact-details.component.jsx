// /* eslint-disable camelcase */
// import React, { useState } from 'react';
// import { useTranslation } from 'react-i18next';
// import PropTypes from 'prop-types';
// import { Button, FormControlLabel, InputLabel, Radio } from '@material-ui/core';
// import { TextField, RadioGroup } from 'formik-material-ui';
// import { Formik, Form, Field } from 'formik';
// import * as Yup from 'yup';
// import 'yup-phone';
// import PhoneInput from 'react-phone-input-2';
// import 'react-phone-input-2/lib/material.css';
// import { createStructuredSelector } from 'reselect';
// import { connect } from 'react-redux';

// import { updateUserInfoStart } from '../../../../redux/user/user.actions';
// import {
//   selectCurrentUser,
//   // selectUpdatedUserInfoError,
// } from '../../../../redux/user/user.selectors.ts';

// import { rtlClass } from '../../../../assets/utils/utils';

// import './contact-details.styles.scss';
// const ContactDetails = ({
//   updateUserInfoStartProp,
//   // updateUserInfoError,
//   currentUser,
// }) => {
//   const { t, i18n } = useTranslation();
//   const contactDetailsSchema = Yup.object().shape({
//     first_name: Yup.string()
//       .required(i18n.t('GENEREL.REQUIRED'))
//       .trim(i18n.t('GENEREL.FIRST_NAME_BLANK'))
//       .strict(),
//     last_name: Yup.string()
//       .required(i18n.t('GENEREL.REQUIRED'))
//       .trim(i18n.t('GENEREL.LAST_NAME_BLANK'))
//       .strict(),
//     email: Yup.string()
//       .email(i18n.t('GENEREL.INVALID_EMAIL'))
//       .required(i18n.t('GENEREL.REQUIRED')),
//     phone_number: Yup.string()
//       .phone(undefined, true, i18n.t('GENEREL.INVALID_PHONE_NUMBER'))
//       .required(i18n.t('GENEREL.REQUIRED')),
//   });
//   const GenderEnum = Object.freeze({ male: 0, female: 1, other: 2 });
//   const [editInfoFlag, setEditInfoFlag] = useState(false);

//   const toggleInfoFlag = () => {
//     setEditInfoFlag((prevFlag) => !prevFlag);
//   };

//   const cancelInfoEdit = () => setEditInfoFlag(false);

//   return (
//     <div className="contact-details">
//       <div className="title-container">
//         <h3 className="title container">{t('ACCOUNT_SETTINGS.TITLE')}</h3>
//       </div>
//       <div className="form-container container">
//         <h4 className="sub-title">
//           {t('ACCOUNT_SETTINGS.CONTACT_DETAILS_FORM.TITLE')}
//         </h4>
//         <div className="contact-details__form-container">
//           <Formik
//             initialValues={{
//               first_name: currentUser.first_name,
//               last_name: currentUser.last_name,
//               email: currentUser.email,
//               phone_number: currentUser.phone_number,
//               gender: currentUser.gender,
//             }}
//             validationSchema={contactDetailsSchema}
//             onSubmit={(values, { setSubmitting }) => {
//               updateUserInfoStartProp({
//                 ...values,
//                 id: currentUser.id,
//                 type: currentUser.type,
//                 gender: GenderEnum[values.gender],
//               });
//               setSubmitting(false);
//               cancelInfoEdit();
//             }}
//           >
//             {({
//               submitForm,
//               isSubmitting,
//               handleChange,
//               errors,
//               touched,
//               values,
//             }) => (
//               <Form className={`contact-details__form  ${rtlClass()}`}>
//                 <fieldset disabled={!editInfoFlag} className="form-inputs">
//                   <div className={`form-group  ${rtlClass()}`}>
//                     <InputLabel htmlFor="first_name">
//                       {t(
//                         'ACCOUNT_SETTINGS.CONTACT_DETAILS_FORM.FIRST_NAME_PLACEHOLDER',
//                       )}
//                     </InputLabel>
//                     <Field
//                       component={TextField}
//                       placeholder={t(
//                         'ACCOUNT_SETTINGS.CONTACT_DETAILS_FORM.FIRST_NAME_PLACEHOLDER',
//                       )}
//                       name="first_name"
//                       id="first_name"
//                       variant="outlined"
//                       className="custom-input-style"
//                       disabled={!editInfoFlag}
//                     />
//                   </div>
//                   <div className={`form-group  ${rtlClass()}`}>
//                     <InputLabel htmlFor="last_name">
//                       {t(
//                         'ACCOUNT_SETTINGS.CONTACT_DETAILS_FORM.LAST_NAME_PLACEHOLDER',
//                       )}
//                     </InputLabel>
//                     <Field
//                       component={TextField}
//                       placeholder={t(
//                         'ACCOUNT_SETTINGS.CONTACT_DETAILS_FORM.LAST_NAME_PLACEHOLDER',
//                       )}
//                       name="last_name"
//                       variant="outlined"
//                       className="custom-input-style"
//                       disabled={!editInfoFlag}
//                     />
//                   </div>
//                   <div className={`form-group  ${rtlClass()}`}>
//                     <InputLabel htmlFor="email">
//                       {t(
//                         'ACCOUNT_SETTINGS.CONTACT_DETAILS_FORM.EMAIL_PLACEHOLDER',
//                       )}
//                     </InputLabel>
//                     <Field
//                       component={TextField}
//                       placeholder={t(
//                         'ACCOUNT_SETTINGS.CONTACT_DETAILS_FORM.EMAIL_PLACEHOLDER',
//                       )}
//                       name="email"
//                       type="email"
//                       variant="outlined"
//                       className="custom-input-style"
//                       disabled={!editInfoFlag}
//                     />
//                   </div>
//                   <div className={`phone-input form-group ${rtlClass()}`}>
//                     <InputLabel htmlFor="phone_number">
//                       {t(
//                         'ACCOUNT_SETTINGS.CONTACT_DETAILS_FORM.PHONE_PLACEHOLDER',
//                       )}
//                     </InputLabel>
//                     <Field
//                       component={PhoneInput}
//                       specialLabel={false}
//                       variant="outlined"
//                       enableSearch="true"
//                       className="custom-input-style"
//                       preferredCountries={['eg', 'sa', 'ae']}
//                       country="eg"
//                       value={values.phone_number}
//                       inputProps={{ name: 'phone_number', required: true }}
//                       onChange={(phoneNumber, country, e) => {
//                         handleChange(e);
//                       }}
//                       inputStyle={{ width: '100%' }}
//                       disabled={!editInfoFlag}
//                     />
//                     {errors.phone_number && touched.phone_number ? (
//                       <div className="form-control-danger">
//                         {errors.phone_number}
//                       </div>
//                     ) : null}
//                   </div>
//                   <div className={`form-group gender-container  ${rtlClass()}`}>
//                     <InputLabel htmlFor="gender">
//                       {t('REGISTER.REGISTER_GENDER')}
//                     </InputLabel>
//                     <Field
//                       component={RadioGroup}
//                       name="gender"
//                       label="Gender"
//                       className="gender-radio-group"
//                       disabled={!editInfoFlag}
//                     >
//                       <FormControlLabel
//                         value="male"
//                         control={
//                           <Radio color="primary" disabled={isSubmitting} />
//                         }
//                         label={t('REGISTER.REGISTER_GENDER_MALE')}
//                         disabled={isSubmitting}
//                       />
//                       <FormControlLabel
//                         value="female"
//                         control={
//                           <Radio color="primary" disabled={isSubmitting} />
//                         }
//                         label={t('REGISTER.REGISTER_GENDER_FEMALE')}
//                         disabled={isSubmitting}
//                       />
//                       <FormControlLabel
//                         value="other"
//                         control={
//                           <Radio color="primary" disabled={isSubmitting} />
//                         }
//                         label={t('REGISTER.REGISTER_GENDER_OTHER')}
//                         disabled={isSubmitting}
//                       />
//                     </Field>
//                     {
//                       //   updateUserInfoError ? (
//                       //   <div className="form-control-danger">{updateUserInfoError}</div>
//                       // ) : null
//                     }
//                   </div>
//                 </fieldset>
//                 {!!editInfoFlag && (
//                   <div className="from-actions">
//                     <Button
//                       variant="contained"
//                       color="primary"
//                       disabled={isSubmitting}
//                       onClick={submitForm}
//                       className="btn-custom-style"
//                     >
//                       {t('ACCOUNT_SETTINGS.CONTACT_DETAILS_FORM.SUBMIT_BTN')}
//                     </Button>
//                     <Button
//                       variant="text"
//                       disabled={isSubmitting || !editInfoFlag}
//                       onClick={cancelInfoEdit}
//                       className="cancel-btn"
//                     >
//                       {t('ACCOUNT_SETTINGS.CONTACT_DETAILS_FORM.CANCEL')}
//                     </Button>
//                   </div>
//                 )}
//               </Form>
//             )}
//           </Formik>
//           {!editInfoFlag && (
//             <Button
//               variant="text"
//               onClick={toggleInfoFlag}
//               className="edit-btn"
//             >
//               {t('ACCOUNT_SETTINGS.EDIT')}
//             </Button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// ContactDetails.propTypes = {
//   updateUserInfoStartProp: PropTypes.func.isRequired,
//   // updateUserInfoError: PropTypes.string,
//   currentUser: PropTypes.object,
// };

// const mapStateToProps = createStructuredSelector({
//   // updateUserInfoError: selectUpdatedUserInfoError,
//   currentUser: selectCurrentUser,
// });

// const mapDispatchToProps = (dispatch) => ({
//   updateUserInfoStartProp: (userData) =>
//     dispatch(updateUserInfoStart(userData)),
// });

// export default connect(mapStateToProps, mapDispatchToProps)(ContactDetails);

const ContactDetails = () => {
  return <div>ContactDetails</div>;
};

export default ContactDetails;
