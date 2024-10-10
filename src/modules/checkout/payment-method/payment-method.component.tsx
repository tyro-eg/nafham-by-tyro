// import React, { useEffect, useState } from 'react';
// import { useTranslation } from 'react-i18next';
// import { Button, FormControlLabel, Radio } from '@material-ui/core';
// import PropTypes from 'prop-types';
// import { loadFawryPluginPopup } from '../../../assets/utils/fawry';

// import Credit from '../../../assets/images/credit.png';
// import Fawry from '../../../assets/images/fawry.png';
// import Vodafone from '../../../assets/images/vodafone.png';

// import './payment-method.styles.scss';
// const PaymentMethod = ({
//   paymentMethodObj,
//   isFree,
//   totalPrice,
//   freePurchaseOut,
//   loginModelOut,
// }) => {
//   const { t } = useTranslation();
//   const [selectedValue, setSelectedValue] = useState('visa');
//   const [iframeUrl, setIframeUrl] = useState();
//   useEffect(() => {
//     if (paymentMethodObj && paymentMethodObj.iframeUrl) {
//       setIframeUrl(paymentMethodObj.iframeUrl);
//     }
//   }, [paymentMethodObj]);
//   const handleChange = (event) => {
//     setSelectedValue(event.target.value);
//     if (event.target.value === 'fawry' && totalPrice) {
//       //   const payload = { amount: totalPrice, payment_method: 'fawry' }
//       const fawry = {
//         amount: '250',
//         customer_email: null,
//         customer_name: null,
//         locale: 'en-gb',
//         merchant_identifier: '1k6nvjWPKdxKitmTMhLsqw==',
//         merchant_reference: 13042,
//       };
//       let products = [];
//       const product = {};
//       product.productSKU = '125';
//       product.description = 'buy points';
//       product.price = fawry.amount;
//       product.quantity = '1';
//       products.push(product);
//       products = JSON.stringify(products);
//       loadFawryPluginPopup(
//         fawry.merchant_identifier,
//         fawry.locale,
//         fawry.merchant_reference,
//         products,
//         'anytestcom',
//         fawry.mobile_number,
//         '',
//       );
//     }
//   };
//   return (
//     <section className="payment-method">
//       <h4 className="payment-method__title">{t('CHECKOUT.PAYMENT.TITLE')}</h4>

//       {!isFree ? (
//         <div className="payment-method__radio-container">
//           <FormControlLabel
//             className={`radio-wrapper ${
//               selectedValue === 'visa' ? 'checked' : ''
//             }`}
//             value="visa"
//             control={<Radio color="primary" />}
//             checked={selectedValue === 'visa'}
//             name="Visa"
//             onChange={handleChange}
//             label={
//               <span className="label">
//                 <img src={Credit} alt="credit-ico" className="label-icon" />
//                 {t('CHECKOUT.PAYMENT.METHODS.CREDIT_CARD')}
//               </span>
//             }
//           />
//           {iframeUrl ? (
//             <div className="payment-method__iframe-container">
//               <iframe
//                 src={iframeUrl}
//                 frameBorder="0"
//                 title="visa-payment"
//                 className="payment-method__iframe"
//               ></iframe>
//             </div>
//           ) : (
//             <Button
//               onClick={loginModelOut}
//               className="payment-method__submit"
//               variant="contained"
//               color="primary"
//             >
//               {t('CHECKOUT.PAYMENT.ACTION')}
//             </Button>
//           )}
//           <FormControlLabel
//             className={`radio-wrapper ${
//               selectedValue === 'fawry' ? 'checked' : ''
//             }`}
//             value="fawry"
//             control={<Radio color="primary" />}
//             checked={selectedValue === 'fawry'}
//             name="Fawry"
//             onChange={handleChange}
//             label={
//               <span className="label">
//                 <img src={Fawry} alt="fawry-ico" className="label-icon" />
//                 {t('CHECKOUT.PAYMENT.METHODS.FAWRY')}
//               </span>
//             }
//           />
//           <FormControlLabel
//             className={`radio-wrapper ${
//               selectedValue === 'vodafone' ? 'checked' : ''
//             }`}
//             value="vodafone"
//             control={<Radio color="primary" />}
//             checked={selectedValue === 'vodafone'}
//             name="vodafone"
//             onChange={handleChange}
//             label={
//               <span className="label">
//                 <img src={Vodafone} alt="vodafone-ico" className="label-icon" />
//                 {t('CHECKOUT.PAYMENT.METHODS.VODAFONE')}
//               </span>
//             }
//           />
//         </div>
//       ) : (
//         <Button
//           onClick={freePurchaseOut}
//           className="payment-method__submit"
//           variant="contained"
//           color="primary"
//         >
//           {t('CHECKOUT.PAYMENT.FREE')}
//         </Button>
//       )}
//     </section>
//   );
// };

// PaymentMethod.propTypes = {
//   paymentMethodObj: PropTypes.object.isRequired,
//   isFree: PropTypes.bool,
//   totalPrice: PropTypes.number,
//   freePurchaseOut: PropTypes.func,
//   loginModelOut: PropTypes.func,
// };

// export default PaymentMethod;

const PaymentMethod = () => {
  return <div>Payment Method</div>;
};

export default PaymentMethod;
