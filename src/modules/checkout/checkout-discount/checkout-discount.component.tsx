// import React from 'react';
// import { Field, Form, Formik } from 'formik';
// import { useTranslation } from 'react-i18next';
// import { Button, InputLabel } from '@material-ui/core';
// import { TextField } from 'formik-material-ui';
// import * as Yup from 'yup';
// import PropTypes from 'prop-types';
// import { connect } from 'react-redux';
// import { createStructuredSelector } from 'reselect';

// import { selectCurrentUser } from '../../../redux/user/user.selectors.ts';
// import { rtlClass } from '../../../assets/utils/utils';

// import './checkout-discount.styles.scss';
// const CheckoutDiscount = ({
//   promoCode,
//   promoCodeOut,
//   loginModelOut,
//   currentUser,
// }) => {
//   const { t } = useTranslation();
//   const discountSchema = Yup.object().shape({
//     discount: Yup.string().required('required'),
//   });
//   const checkPromoCode = (discount) => {
//     if (currentUser) {
//       if (discount) {
//         promoCodeOut(discount);
//       }
//     } else {
//       loginModelOut();
//     }
//   };
//   return (
//     <section className="discount">
//       <Formik
//         initialValues={{
//           discount: '',
//         }}
//         validationSchema={discountSchema}
//         onSubmit={(values, { setSubmitting }) => {
//           setSubmitting(false);
//           checkPromoCode(values.discount);
//         }}
//       >
//         {({ submitForm, isSubmitting }) => (
//           <Form className="discount__form">
//             <InputLabel htmlFor="discount">
//               {t('CHECKOUT.DISCOUNT.FORM.LABEL')}
//             </InputLabel>
//             <div className={`discount__input-group ${rtlClass()}`}>
//               <Field
//                 component={TextField}
//                 name="discount"
//                 id="discount"
//                 placeholder={t('CHECKOUT.DISCOUNT.FORM.LABEL')}
//                 variant="outlined"
//                 className="discount__input"
//               />
//               {promoCode && promoCode.valueNum && (
//                 <div className="discount__applied">
//                   <span className="u-font-size-14">
//                     {t('CHECKOUT.DISCOUNT.FORM.APPLIED')}
//                   </span>
//                 </div>
//               )}
//               {promoCode && promoCode.errors === 'The code is wrong' && (
//                 <div className="discount__invalid">
//                   <span className="u-font-size-14">
//                     {t('CHECKOUT.DISCOUNT.FORM.INVALID')}
//                   </span>
//                 </div>
//               )}
//               {promoCode &&
//                 promoCode.errors === 'Code has been already used' && (
//                   <div className="discount__invalid">
//                     <span className="u-font-size-14">
//                       {t('CHECKOUT.DISCOUNT.FORM.USED')}
//                     </span>
//                   </div>
//                 )}
//             </div>
//             <Button
//               variant="contained"
//               color="primary"
//               disabled={isSubmitting}
//               onClick={submitForm}
//               className="discount__submit"
//             >
//               {t('CHECKOUT.DISCOUNT.FORM.APPLY')}
//             </Button>
//           </Form>
//         )}
//       </Formik>
//     </section>
//   );
// };

// CheckoutDiscount.propTypes = {
//   promoCode: PropTypes.object,
//   promoCodeOut: PropTypes.func.isRequired,
//   loginModelOut: PropTypes.func.isRequired,
//   currentUser: PropTypes.object,
// };
// const mapStateToProps = createStructuredSelector({
//   currentUser: selectCurrentUser,
// });

// export default connect(mapStateToProps)(CheckoutDiscount);

const CheckoutDiscount = () => {
  return <div>Checkout Discount</div>;
};

export default CheckoutDiscount;
