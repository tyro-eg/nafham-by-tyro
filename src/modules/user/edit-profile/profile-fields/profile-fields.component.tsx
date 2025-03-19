import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import './profile-fields.styles.scss';
import { Field } from '../../../../assets/types';

interface ProfileFieldsProps {
  fields: Field[];
}

const ProfileFields: React.FC<ProfileFieldsProps> = ({ fields }) => {
  const { t } = useTranslation();
  const [curriculums, setCurriculums] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    if (!!fields?.length) {
      separateFields(fields);
    }
  }, [fields]);

  const separateFields = (fieldsList: Field[]) => {
    const subjectsSet = new Set<string>();
    const categoriesSet = new Set<string>();
    const curriculumsSet = new Set<string>();

    fieldsList?.forEach((field) => {
      const [curriculum, category, subject] =
        field?.full_course_name?.split(' - ');
      subjectsSet.add(subject);
      categoriesSet.add(category);
      curriculumsSet.add(curriculum);
    });

    setSubjects(Array.from(subjectsSet).filter(Boolean));
    setCategories(Array.from(categoriesSet).filter(Boolean));
    setCurriculums(Array.from(curriculumsSet).filter(Boolean));
  };

  const renderFieldSection = (titleKey: string, items: string[]) => (
    <div className="profile-fields__field">
      <p className="profile-fields__field-title">{t(titleKey)}</p>
      <div className="profile-fields__field-slots">
        {items.map((item) => item && <span key={item}>{item}</span>)}
      </div>
    </div>
  );

  return (
    <div className="profile-fields">
      {curriculums.length > 0 &&
        renderFieldSection(
          'PROFILE.EDITPROFILE.FIELDS.CURRICULUMS',
          curriculums,
        )}
      {subjects.length > 0 &&
        renderFieldSection('PROFILE.EDITPROFILE.FIELDS.SUBJECTS', subjects)}
      {categories.length > 0 &&
        renderFieldSection('PROFILE.EDITPROFILE.FIELDS.CATEGORY', categories)}
    </div>
  );
};

export default ProfileFields;
