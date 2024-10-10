// import React, { useEffect, useState } from 'react';
// import { useTranslation } from 'react-i18next';
// import PropTypes from 'prop-types';
// import { rtlClass } from '../../../assets/utils/utils';

// import './checkout-receipt.styles.scss';
// const CheckoutReceipt = ({ receiptData, privateSessionAmount, promoCode }) => {
//   const { t } = useTranslation();
//   const [receiptValues, setReceiptValues] = useState(receiptData);
//   useEffect(() => {
//     setReceiptValues(receiptData);
//   }, [receiptData]);
//   useEffect(() => {
//     reCalculateAmounts(receiptValues, promoCode);
//   }, [promoCode]);

//   const reCalculateAmounts = (receiptDataObj, promoCodeValue) => {
//     let newRecipeDataTotal = receiptDataObj.subTotal - promoCodeValue;

//     if (receiptDataObj.subTotal < promoCodeValue) {
//       newRecipeDataTotal = 0;
//     }
//     const newRecipeData = {
//       ...receiptDataObj,
//       discount: promoCodeValue,
//       total: newRecipeDataTotal,
//     };
//     setReceiptValues(newRecipeData);
//   };
//   return (
//     <>
//       {receiptValues && (
//         <section className="receipt">
//           <h4 className="receipt__title">{t('CHECKOUT.RECEIPT.TITLE')}</h4>
//           <table className={rtlClass()}>
//             <tbody>
//               {receiptValues.tutorName && privateSessionAmount && (
//                 <tr>
//                   <td>
//                     <div className="receipt__tutor-wrapper">
//                       <img
//                         src={receiptValues.tutorImg}
//                         alt="tutor"
//                         className="tutor-img"
//                       />
//                       <h5 className="tutor-title">{receiptValues.tutorName}</h5>
//                     </div>
//                   </td>
//                 </tr>
//               )}
//               {receiptValues.courseName && (
//                 <tr>
//                   <td className="u-color-primary u-font-weight-bold">
//                     {receiptValues.courseName}
//                   </td>
//                   <td className="u-color-title u-font-weight-bold">
//                     {receiptValues.amount}
//                     <span> {t('GENEREL.EGP')}</span>
//                   </td>
//                 </tr>
//               )}
//               {receiptValues.tutorName && privateSessionAmount && (
//                 <tr className="receipt__border">
//                   <td className="u-color-title u-font-weight-bold">
//                     {privateSessionAmount.time_in_hours} {t('GENEREL.HOURS')}{' '}
//                     {t('GENEREL.PACKAGE')}
//                   </td>
//                   <td className="u-color-title u-font-weight-bold">
//                     <span>{privateSessionAmount.amount}</span>
//                     <span> {t('GENEREL.EGP')}</span>
//                     <span className="u-font-weight-500 u-color-body u-font-size-14">
//                       {' '}
//                       ({privateSessionAmount.rate}
//                       <span> {t('GENEREL.EGP')}</span> x{' '}
//                       {privateSessionAmount.time_in_hours} {t('GENEREL.HOURS')})
//                     </span>
//                   </td>
//                 </tr>
//               )}
//               <tr>
//                 <td className="u-color-title u-font-weight-bold">
//                   {t('CHECKOUT.RECEIPT.TABLE.DISCOUNT_CODE')}
//                 </td>
//                 <td className="u-color-danger u-font-weight-bold">
//                   -{receiptValues.discount} <span>{t('GENEREL.EGP')}</span>
//                 </td>
//               </tr>
//               {
//                 //   receiptValues.tutorName && (
//                 //   <tr>
//                 //     <td>{receiptValues.tutorField}</td>
//                 //   </tr>
//                 // )
//               }
//               {
//                 //   receiptValues.courseName && (
//                 //   <tr>
//                 //     <td>
//                 //       {receiptValues.fields.map((field, id) => (
//                 //         <span key={field.id}>
//                 //           {field.name}
//                 //           {id !== receiptValues.fields.length - 1 && (
//                 //             <span>, </span>
//                 //           )}
//                 //         </span>
//                 //       ))}
//                 //     </td>
//                 //   </tr>
//                 // )
//               }
//               {
//                 //   <tr className="receipt__border">
//                 //   <td>{t('CHECKOUT.RECEIPT.TABLE.SUBTOTAL')}</td>
//                 //   <td>
//                 //     {receiptValues.subTotal} <span>{t('GENEREL.EGP')}</span>
//                 //   </td>
//                 // </tr>
//               }
//               <tr className="receipt__border">
//                 <td className="total-title">
//                   {t('CHECKOUT.RECEIPT.TABLE.TOTAL')}
//                 </td>
//                 <td className="total-price">
//                   {receiptValues.total} <span>{t('GENEREL.EGP')}</span>
//                 </td>
//               </tr>
//             </tbody>
//           </table>
//         </section>
//       )}
//     </>
//   );
// };

// CheckoutReceipt.propTypes = {
//   receiptData: PropTypes.object.isRequired,
//   privateSessionAmount: PropTypes.object,
//   promoCode: PropTypes.number,
// };
// export default CheckoutReceipt;

const CheckoutReceipt = () => {
  return <div>Checkout Receipt</div>;
};

export default CheckoutReceipt;
