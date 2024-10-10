// import React, { useEffect, useState } from 'react';
// import PropTypes from 'prop-types';
// import { useTranslation } from 'react-i18next';

// import './profile-fields.styles.scss';
// const ProfileFields = ({ fields }) => {
//   const { t } = useTranslation();
//   const [curriculums, setCurriculums] = useState([]);
//   const [subjects, setSubjects] = useState([]);
//   const [category, setCategory] = useState([]);
//   useEffect(() => {
//     if (fields && fields.length > 0) {
//       separateFields();
//     }
//   }, [fields]);

//   const separateFields = () => {
//     let subArr = [];
//     let cateArr = [];
//     let curriculumArr = [];
//     fields.forEach((field) => {
//       const separateField = field.normalized_name.split(' | ');
//       subArr = [...subArr, separateField[0]];
//       cateArr = [...cateArr, separateField[1]];
//       curriculumArr = [...curriculumArr, separateField[2]];
//     });
//     setSubjects([...new Set(subArr)]);
//     setCategory([...new Set(cateArr)]);
//     setCurriculums([...new Set(curriculumArr)]);
//   };
//   return (
//     <div className="profile-fields">
//       <div className="profile-fields__field">
//         <p className="profile-fields__field-title">
//           {t('PROFILE.EDITPROFILE.FIELDS.CURRICULUMS')}
//         </p>
//         <div className="profile-fields__field-slots">
//           {curriculums.map((curriculum) => (
//             <span key={curriculum}>{curriculum}</span>
//           ))}
//         </div>
//       </div>
//       <div className="profile-fields__field">
//         <p className="profile-fields__field-title">
//           {t('PROFILE.EDITPROFILE.FIELDS.SUBJECTS')}
//         </p>
//         <div className="profile-fields__field-slots">
//           {subjects.map((sub) => (
//             <span key={sub}>{sub}</span>
//           ))}
//         </div>
//       </div>
//       <div className="profile-fields__field">
//         <p className="profile-fields__field-title">
//           {t('PROFILE.EDITPROFILE.FIELDS.CATEGORY')}
//         </p>
//         <div className="profile-fields__field-slots">
//           {category.map((cate) => (
//             <span key={cate}>{cate}</span>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// ProfileFields.propTypes = {
//   fields: PropTypes.array,
// };

// export default ProfileFields;

const ProfileFields = () => {
  return <div>ProfileFields</div>;
};

export default ProfileFields;
