// import React, { useEffect, useState } from 'react';
// import { useTranslation } from 'react-i18next';
// import PropTypes from 'prop-types';
// import {
//   FormControl,
//   MenuItem,
//   RadioGroup,
//   Select,
//   FormControlLabel,
//   Radio,
// } from '@material-ui/core';
// import { CheckCircle } from '@material-ui/icons';
// import * as Yup from 'yup';
// import { Form, Formik } from 'formik';

// import Carousel from '../../../components/carousel/carousel';

// import './available-packages.styles.scss';
// const AvailablePackages = ({
//   tutorFields,
//   tutorPackages,
//   updatePrivateSessionAmount,
// }) => {
//   const { t } = useTranslation();
//   const [field, setField] = useState(null);
//   const availablePackagesSchema = Yup.object().shape({
//     fieldOp: Yup.string().required(),
//     packageOp: Yup.number().required(),
//   });
//   useEffect(() => {
//     if (tutorFields[0]) {
//       setField(tutorFields[0]);
//       updatePrivateSessionAmount({
//         package: tutorPackages[0],
//         field: tutorFields[0],
//       });
//     }
//   }, [tutorPackages, tutorFields]);

//   return (
//     <section className="available-packages">
//       {tutorFields[0] && tutorPackages[0] && field && (
//         <Formik
//           initialValues={{
//             fieldOp: tutorFields[0].id,
//             packageOp: tutorPackages[0].id,
//           }}
//           validationSchema={availablePackagesSchema}
//           onSubmit={(values) => {
//             const availablePackages = { package: undefined, field: undefined };
//             availablePackages.package = tutorPackages.find(
//               (pck) => pck.id === values.packageOp,
//             );
//             availablePackages.field = tutorFields.find(
//               (fld) => fld.id === values.fieldOp,
//             );
//             setField(availablePackages.field);
//             updatePrivateSessionAmount(availablePackages);
//           }}
//         >
//           {({ values, handleChange, handleSubmit }) => (
//             <Form>
//               <h4 className="available-packages__title">
//                 {t('CHECKOUT.PACKAGES.TITLE1')}
//               </h4>
//               <div className="field-container">
//                 <FormControl variant="outlined" className="select-field">
//                   <Select
//                     labelId="field-label"
//                     name="fieldOp"
//                     value={values.fieldOp}
//                     onChange={(event) => {
//                       handleSubmit(event);
//                       handleChange(event);
//                     }}
//                   >
//                     {tutorFields.map((tutorField) => (
//                       <MenuItem key={tutorField.id} value={tutorField.id}>
//                         {tutorField.normalized_name}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//               </div>
//               <h4 className="available-packages__title">
//                 {t('CHECKOUT.PACKAGES.TITLE2')}
//               </h4>
//               <div className="available-packages__radio-container">
//                 <FormControl component="fieldset">
//                   <RadioGroup
//                     aria-label="packages"
//                     name="packageOp"
//                     value={values.packageOp}
//                     onChange={(event) => {
//                       handleSubmit(event);
//                       handleChange(event);
//                     }}
//                   >
//                     <Carousel>
//                       {tutorPackages.map((tutorPackage) => (
//                         <FormControlLabel
//                           className={`radio-wrapper ${
//                             Number(tutorPackage.id) === Number(values.packageOp)
//                               ? 'checked'
//                               : ''
//                           }
//                           ${
//                             tutorPackage.package_type === 'monthly'
//                               ? 'popular_theme'
//                               : ''
//                           }
//                           `}
//                           key={tutorPackage.id}
//                           value={tutorPackage.id}
//                           name="packageOp"
//                           control={<Radio color="primary" />}
//                           checked={
//                             Number(tutorPackage.id) === Number(values.packageOp)
//                           }
//                           label={
//                             <div
//                               className={`profile-package ${
//                                 tutorPackage.package_type === 'monthly'
//                                   ? 'popular'
//                                   : ''
//                               }`}
//                             >
//                               {tutorPackage.package_type === 'monthly' && (
//                                 <p className="profile-package__badge">
//                                   {t('PROFILE.PACKAGES.MOST_POPULAR')}
//                                 </p>
//                               )}
//                               <p className="profile-package__rate">
//                                 ${Number(field.price)}{' '}
//                                 <span className="profile-package__rate-perHour">
//                                   {t('PROFILE.PACKAGES.PER_HOUR')}
//                                 </span>
//                               </p>
//                               <div className="profile-package__minutes">
//                                 {tutorPackage.hours}{' '}
//                                 {tutorPackage.hours > 1
//                                   ? t('PROFILE.PACKAGES.HOURS')
//                                   : t('PROFILE.PACKAGES.HOUR')}
//                               </div>
//                               <div className="profile-package__save">
//                                 <CheckCircle color="primary" />
//                                 <span className="profile-package__save-title">
//                                   {t('PROFILE.PACKAGES.SAVE')}
//                                 </span>
//                                 20%
//                               </div>
//                               <div className="profile-package__action">
//                                 {t('PROFILE.PACKAGES.CHOOSE')}
//                               </div>
//                             </div>
//                           }
//                         />
//                       ))}
//                     </Carousel>
//                   </RadioGroup>
//                 </FormControl>
//               </div>
//             </Form>
//           )}
//         </Formik>
//       )}
//     </section>
//   );
// };

// AvailablePackages.propTypes = {
//   tutorPackages: PropTypes.array.isRequired,
//   tutorFields: PropTypes.array.isRequired,
//   updatePrivateSessionAmount: PropTypes.func.isRequired,
// };

const AvailablePackages = () => {
  return <div>Available Packages</div>;
};

export default AvailablePackages;
