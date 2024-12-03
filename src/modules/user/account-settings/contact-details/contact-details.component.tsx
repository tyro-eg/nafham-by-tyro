/* eslint-disable camelcase */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InputLabel, TextField as MuiTextField } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import 'yup-phone';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import { useDispatch, useSelector } from 'react-redux';

import { updateUserInfo } from '../../../../redux/user/user.actions';
import { selectCurrentUser } from '../../../../redux/user/user.selectors';
import { AppDispatch, RootState } from '../../../../redux/store';

import { rtlClass } from '../../../../assets/utils/utils';

import './contact-details.styles.scss';

const ContactDetails: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) =>
    selectCurrentUser(state),
  );

  const [editInfoFlag, setEditInfoFlag] = useState(false);

  const contactDetailsSchema = Yup.object().shape({
    first_name: Yup.string()
      .required(i18n.t('GENEREL.REQUIRED'))
      .trim(i18n.t('GENEREL.FIRST_NAME_BLANK'))
      .strict(),
    last_name: Yup.string()
      .required(i18n.t('GENEREL.REQUIRED'))
      .trim(i18n.t('GENEREL.LAST_NAME_BLANK'))
      .strict(),
    email: Yup.string()
      .email(i18n.t('GENEREL.INVALID_EMAIL'))
      .required(i18n.t('GENEREL.REQUIRED')),
    phone_number: Yup.string()
      .required(i18n.t('GENEREL.REQUIRED'))
      .test(
        'isValidPhoneNumber',
        i18n.t('GENEREL.INVALID_PHONE_NUMBER'),
        function (value) {
          const { countryCode } = this.parent;

          return value && value.length > 0
            ? Yup.string().phone(countryCode, true).isValidSync(value)
            : false;
        },
      ),
  });

  const toggleInfoFlag = () => setEditInfoFlag((prev) => !prev);
  const cancelInfoEdit = () => setEditInfoFlag(false);

  return (
    <div className="contact-details">
      <div className="title-container">
        <h3 className="title container">{t('ACCOUNT_SETTINGS.TITLE')}</h3>
      </div>
      <div className="form-container container">
        <h4 className="sub-title">
          {t('ACCOUNT_SETTINGS.CONTACT_DETAILS_FORM.TITLE')}
        </h4>
        <div className="contact-details__form-container">
          <Formik
            initialValues={{
              first_name: currentUser?.first_name || '',
              last_name: currentUser?.last_name || '',
              email: currentUser?.email || '',
              phone_number: currentUser?.phone_number || '',
            }}
            validationSchema={contactDetailsSchema}
            onSubmit={(values, { setSubmitting }) => {
              try {
                dispatch(
                  updateUserInfo({
                    userData: values,
                    id: currentUser.id,
                    type: currentUser.type,
                  }),
                );
                setSubmitting(false);
                cancelInfoEdit();
              } catch (error) {
                setSubmitting(false);
              }
            }}
          >
            {({ submitForm, isSubmitting, errors, touched }) => (
              <Form className={`contact-details__form ${rtlClass()}`}>
                <fieldset disabled={!editInfoFlag} className="form-inputs">
                  <div className={`form-group ${rtlClass()}`}>
                    <InputLabel htmlFor="first_name">
                      {t(
                        'ACCOUNT_SETTINGS.CONTACT_DETAILS_FORM.FIRST_NAME_PLACEHOLDER',
                      )}
                    </InputLabel>
                    <Field
                      as={MuiTextField}
                      name="first_name"
                      variant="outlined"
                      placeholder={t(
                        'ACCOUNT_SETTINGS.CONTACT_DETAILS_FORM.FIRST_NAME_PLACEHOLDER',
                      )}
                      className="custom-input-style"
                      disabled={!editInfoFlag}
                      fullWidth
                      error={touched.first_name && Boolean(errors.first_name)}
                      helperText={touched.first_name && errors.first_name}
                    />
                  </div>
                  <div className={`form-group ${rtlClass()}`}>
                    <InputLabel htmlFor="last_name">
                      {t(
                        'ACCOUNT_SETTINGS.CONTACT_DETAILS_FORM.LAST_NAME_PLACEHOLDER',
                      )}
                    </InputLabel>
                    <Field
                      as={MuiTextField}
                      name="last_name"
                      variant="outlined"
                      placeholder={t(
                        'ACCOUNT_SETTINGS.CONTACT_DETAILS_FORM.LAST_NAME_PLACEHOLDER',
                      )}
                      className="custom-input-style"
                      disabled={!editInfoFlag}
                      fullWidth
                      error={touched.last_name && Boolean(errors.last_name)}
                      helperText={touched.last_name && errors.last_name}
                    />
                  </div>
                  <div className={`form-group ${rtlClass()}`}>
                    <InputLabel htmlFor="email">
                      {t(
                        'ACCOUNT_SETTINGS.CONTACT_DETAILS_FORM.EMAIL_PLACEHOLDER',
                      )}
                    </InputLabel>
                    <Field
                      as={MuiTextField}
                      name="email"
                      type="email"
                      variant="outlined"
                      placeholder={t(
                        'ACCOUNT_SETTINGS.CONTACT_DETAILS_FORM.EMAIL_PLACEHOLDER',
                      )}
                      fullWidth
                      className="custom-input-style"
                      disabled={!editInfoFlag}
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                    />
                  </div>
                  <div className={`phone-input form-group ${rtlClass()}`}>
                    <InputLabel htmlFor="phone_number">
                      {t(
                        'ACCOUNT_SETTINGS.CONTACT_DETAILS_FORM.PHONE_PLACEHOLDER',
                      )}
                    </InputLabel>
                    <Field name="phone_number">
                      {({ field, form: { setFieldValue } }: any) => (
                        <PhoneInput
                          {...field}
                          country="ae"
                          preferredCountries={['ae', 'eg', 'sa']}
                          specialLabel={false}
                          inputStyle={{ width: '100%' }}
                          onChange={(phoneNumber: string, countryData: any) => {
                            setFieldValue('phone_number', phoneNumber);
                            setFieldValue(
                              'countryCode',
                              countryData.countryCode,
                            );
                          }}
                        />
                      )}
                    </Field>
                    {errors.phone_number && touched.phone_number && (
                      <div className="form-control-danger">
                        {errors.phone_number as string}
                      </div>
                    )}
                  </div>
                </fieldset>
                {editInfoFlag && (
                  <div className="form-actions">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={submitForm}
                      disabled={isSubmitting}
                      className="btn-custom-style"
                    >
                      {t('ACCOUNT_SETTINGS.CONTACT_DETAILS_FORM.SUBMIT_BTN')}
                    </Button>
                    <Button
                      variant="text"
                      onClick={cancelInfoEdit}
                      disabled={isSubmitting}
                      className="cancel-btn"
                    >
                      {t('ACCOUNT_SETTINGS.CONTACT_DETAILS_FORM.CANCEL')}
                    </Button>
                  </div>
                )}
              </Form>
            )}
          </Formik>
          {!editInfoFlag && (
            <Button
              variant="text"
              onClick={toggleInfoFlag}
              className="edit-btn"
            >
              {t('ACCOUNT_SETTINGS.EDIT')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactDetails;
