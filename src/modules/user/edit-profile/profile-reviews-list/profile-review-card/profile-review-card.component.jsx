// import React, { useEffect, useState } from 'react';
// import PropTypes from 'prop-types';
// import { Rating } from '@material-ui/lab';
// import { format, parseISO } from 'date-fns';
// import arSA from 'date-fns/locale/ar-SA';
// import enUS from 'date-fns/locale/en-US';
// import { useTranslation } from 'react-i18next';

// import './profile-review-card.styles.scss';
// const ProfileReviewCard = ({ data }) => {
//   const { i18n } = useTranslation();
//   const [reviewText, setReviewText] = useState();
//   useEffect(() => {
//     if (data) {
//       const dataText = extractContent(data.text);
//       setReviewText(dataText.replace('Powered by Froala Editor', ''));
//     }
//   }, [data]);
//   const locales = { ar: arSA, en: enUS };
//   const myDateFormatter = (dateStr) => {
//     const locale = locales[i18n.language];
//     return format(parseISO(dateStr), 'LLLL do, y', { locale });
//   };
//   const extractContent = (s) => {
//     const span = document.createElement('span');
//     span.innerHTML = s;
//     return span.textContent || span.innerText;
//   };
//   return (
//     <>
//       {data && (
//         <div className="profile-review">
//           <div className="profile-review__author">{data.student}</div>
//           <div className="profile-review__date">
//             {myDateFormatter(data.created_at)}
//           </div>
//           <div className="profile-review__rating-stars">
//             <Rating
//               name="profile review"
//               value={Math.round(data.rating)}
//               readOnly
//               size="large"
//             />
//             <span className="review-numbers">
//               {+Number(data.rating).toPrecision(2)} (5.0)
//             </span>
//           </div>
//           <div className="profile-review__text">
//             <p>{reviewText}</p>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// ProfileReviewCard.propTypes = {
//   data: PropTypes.object,
// };

// export default ProfileReviewCard;

const ProfileReviewCard = () => {
  return <div>ProfileReviewCard</div>;
};

export default ProfileReviewCard;
