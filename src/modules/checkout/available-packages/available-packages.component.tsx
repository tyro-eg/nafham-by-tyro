import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FormControl,
  MenuItem,
  RadioGroup,
  Select,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import * as Yup from 'yup';
import { Formik, Form } from 'formik';

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

  const availablePackagesSchema = Yup.object().shape({
    fieldOp: Yup.string().required(),
    packageOp: Yup.number().required(),
  });

  useEffect(() => {
    if (tutorFields[0]) {
      setField(tutorFields[0]);
    }
  }, [tutorPackages, tutorFields]);

  return (
    <section className="available-packages">
      {tutorFields[0] && tutorPackages[0] && field && (
        <Formik
          initialValues={{
            fieldOp: tutorFields[0].id,
            packageOp: tutorPackages[0].id,
          }}
          validationSchema={availablePackagesSchema}
          onSubmit={(values) => {
            const selectedData = {
              package: tutorPackages.find(
                (pck) => pck.id === values.packageOp,
              )!,
              field: tutorFields.find((fld) => fld.id === values.fieldOp)!,
            };

            if (selectedData.package && selectedData.field) {
              setField(selectedData.field);
            }
          }}
        >
          {({ values, handleChange, handleSubmit }) => (
            <Form>
              <h4 className="available-packages__title">
                {t('CHECKOUT.PACKAGES.TITLE1')}
              </h4>
              <div className="field-container">
                <FormControl variant="outlined" className="select-field">
                  <Select
                    labelId="field-label"
                    name="fieldOp"
                    value={values.fieldOp}
                    onChange={(event: any) => {
                      handleSubmit(event);
                      handleChange(event);
                    }}
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
                    value={values.packageOp}
                    onChange={(event: any) => {
                      handleSubmit(event);
                      handleChange(event);
                    }}
                  >
                    <Carousel>
                      {tutorPackages.map((tutorPackage) => (
                        <FormControlLabel
                          className={`radio-wrapper ${
                            Number(tutorPackage.id) === Number(values.packageOp)
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
                            Number(tutorPackage.id) === Number(values.packageOp)
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
            </Form>
          )}
        </Formik>
      )}
    </section>
  );
};

export default AvailablePackages;
