import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FormControl,
  MenuItem,
  RadioGroup,
  Select,
  FormControlLabel,
  Radio,
  SelectChangeEvent,
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

import Carousel from '../../../component/carousel/carousel';
import { TutorField, TutorPackage } from '../index.component';

import './available-packages.styles.scss';

interface AvailablePackagesProps {
  tutorFields: TutorField[];
  tutorPackages: TutorPackage[];
}

const AvailablePackages: React.FC<AvailablePackagesProps> = ({
  tutorFields,
  tutorPackages,
}) => {
  const { t } = useTranslation();
  const [field, setField] = useState<TutorField | null>(null);
  const [selectedFieldId, setSelectedFieldId] = useState<number>(0);
  const [selectedPackageId, setSelectedPackageId] = useState<number>(0);

  useEffect(() => {
    if (tutorFields[0]) {
      setField(tutorFields[0]);
      setSelectedFieldId(tutorFields[0].id);
    }
    if (tutorPackages[0]) {
      setSelectedPackageId(tutorPackages[0].id);
    }
  }, [tutorPackages, tutorFields]);

  const handleFieldChange = (event: SelectChangeEvent<number>) => {
    const fieldId = Number(event.target.value);
    setSelectedFieldId(fieldId);
    const selectedField = tutorFields.find((fld) => fld.id === fieldId);
    if (selectedField) {
      setField(selectedField);
    }
  };

  const handlePackageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const packageId = Number(event.target.value);
    setSelectedPackageId(packageId);
  };

  return (
    <section className="available-packages">
      {tutorFields[0] && tutorPackages[0] && field && (
        <>
          <h4 className="available-packages__title">
            {t('CHECKOUT.PACKAGES.TITLE1')}
          </h4>
          <div className="field-container">
            <FormControl variant="outlined" className="select-field">
              <Select
                labelId="field-label"
                name="fieldOp"
                value={selectedFieldId}
                onChange={handleFieldChange}
              >
                {tutorFields.map((tutorField) => (
                  <MenuItem key={tutorField.id} value={tutorField.id}>
                    {tutorField.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <h4 className="available-packages__title">
            {t('CHECKOUT.PACKAGES.TITLE2')}
          </h4>
          <div className="available-packages__radio-container">
            <FormControl component="fieldset">
              <RadioGroup
                aria-label="packages"
                name="packageOp"
                value={selectedPackageId}
                onChange={handlePackageChange}
              >
                <Carousel>
                  {tutorPackages.map((tutorPackage) => (
                    <FormControlLabel
                      className={`radio-wrapper ${
                        Number(tutorPackage.id) === Number(selectedPackageId)
                          ? 'checked'
                          : ''
                      } ${
                        tutorPackage.type === 'DefaultPackage'
                          ? 'popular_theme'
                          : ''
                      }`}
                      key={tutorPackage.id}
                      value={tutorPackage.id}
                      name="packageOp"
                      control={<Radio color="primary" />}
                      checked={
                        Number(tutorPackage.id) === Number(selectedPackageId)
                      }
                      label={
                        <div
                          className={`profile-package ${
                            tutorPackage.type === 'DefaultPackage'
                              ? 'popular'
                              : ''
                          }`}
                        >
                          {tutorPackage.type === 'DefaultPackage' && (
                            <p className="profile-package__badge">
                              {t('PROFILE.PACKAGES.MOST_POPULAR')}
                            </p>
                          )}
                          <p className="profile-package__rate">
                            ${Number(tutorPackage.rate)}{' '}
                            <span className="profile-package__rate-perHour">
                              {t('PROFILE.PACKAGES.PER_HOUR')}
                            </span>
                          </p>
                          <div className="profile-package__minutes">
                            {tutorPackage.time_in_hours}{' '}
                            {tutorPackage.time_in_hours > 1
                              ? t('PROFILE.PACKAGES.HOURS')
                              : t('PROFILE.PACKAGES.HOUR')}
                          </div>
                          <div className="profile-package__save">
                            <CheckCircle color="primary" />
                            <span className="profile-package__save-title">
                              {t('PROFILE.PACKAGES.SAVE')}
                            </span>
                            20%
                          </div>
                          <div className="profile-package__action">
                            {t('PROFILE.PACKAGES.CHOOSE')}
                          </div>
                        </div>
                      }
                    />
                  ))}
                </Carousel>
              </RadioGroup>
            </FormControl>
          </div>
        </>
      )}
    </section>
  );
};

export default AvailablePackages;
