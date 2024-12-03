/* eslint-disable camelcase */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InputLabel, TextField as MuiTextField } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import 'yup-phone';
import 'react-phone-input-2/lib/material.css';
import { changePassword } from '../../../../redux/user/user.actions';
import {
  selectChangePasswordError,
  selectCurrentUser,
} from '../../../../redux/user/user.selectors';

import { rtlClass } from '../../../../assets/utils/utils';

import './change-password.styles.scss';
import { useAppDispatch, useAppSelector } from '../../../../redux/store';

const ChangePassword: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const changePasswordError = useAppSelector(selectChangePasswordError);
  const currentUser = useAppSelector(selectCurrentUser);

  const [editPasswordFlag, setEditPasswordFlag] = useState(false);

  const togglePasswordFlag = () => {
    setEditPasswordFlag((prevFlag) => !prevFlag);
  };

  const cancelPasswordEdit = () => setEditPasswordFlag(false);

  const ChangePasswordSchema = Yup.object().shape({
    password: Yup.string()
      .trim(i18n.t('GENEREL.EMPTY_SPACE'))
      .strict()
      .required(i18n.t('GENEREL.REQUIRED'))
      .min(8, i18n.t('GENEREL.SHORT_PASSWORD')),
    password_confirmation: Yup.string()
      .trim(i18n.t('GENEREL.EMPTY_SPACE'))
      .strict()
      .required(i18n.t('GENEREL.REQUIRED'))
      .oneOf(
        [Yup.ref('password')],
        i18n.t('GENEREL.PASSWORD_CONFIRMATION_ERROR'),
      ),
  });

  return (
    <div className="container change-password">
      <h4 className="sub-title">
        {t('ACCOUNT_SETTINGS.CHANGE_PASSWORD_FORM.TITLE')}
      </h4>
      <div className="change-password__form-container">
        <Formik
          initialValues={{
            password: '',
            password_confirmation: '',
          }}
          validationSchema={ChangePasswordSchema}
          onSubmit={(values, { setSubmitting, resetForm }) => {
            try {
              dispatch(changePassword({ ...values, type: currentUser?.type }));
              setSubmitting(false);
              if (!changePasswordError) {
                resetForm();
                cancelPasswordEdit();
              }
            } catch (error) {
              setSubmitting(false);
            }
          }}
        >
          {({ submitForm, isSubmitting, touched, errors }) => (
            <Form className={`change-password__form ${rtlClass()}`}>
              <fieldset disabled={!editPasswordFlag} className="form-inputs">
                <div className={`form-group ${rtlClass()}`}>
                  <InputLabel htmlFor="password">
                    {t('ACCOUNT_SETTINGS.CHANGE_PASSWORD_FORM.NEW_PASSWORD')}
                  </InputLabel>
                  <Field
                    as={MuiTextField}
                    name="password"
                    type="password"
                    variant="outlined"
                    placeholder={t(
                      'ACCOUNT_SETTINGS.CHANGE_PASSWORD_FORM.NEW_PASSWORD',
                    )}
                    fullWidth
                    className="custom-input-style"
                    disabled={!editPasswordFlag}
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                  />
                </div>
                <div className={`form-group ${rtlClass()}`}>
                  <InputLabel htmlFor="password_confirmation">
                    {t('ACCOUNT_SETTINGS.CHANGE_PASSWORD_FORM.VERIFY_PASSWORD')}
                  </InputLabel>
                  <Field
                    as={MuiTextField}
                    name="password_confirmation"
                    type="password"
                    variant="outlined"
                    placeholder={t(
                      'ACCOUNT_SETTINGS.CHANGE_PASSWORD_FORM.VERIFY_PASSWORD',
                    )}
                    fullWidth
                    className="custom-input-style"
                    disabled={!editPasswordFlag}
                    error={
                      touched.password_confirmation &&
                      Boolean(errors.password_confirmation)
                    }
                    helperText={
                      touched.password_confirmation &&
                      errors.password_confirmation
                    }
                  />
                </div>
                {changePasswordError && (
                  <div className="form-control-danger">
                    {changePasswordError}
                  </div>
                )}
              </fieldset>
              {!!editPasswordFlag && (
                <div className="form-actions">
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting}
                    onClick={submitForm}
                    className="btn-custom-style"
                  >
                    {t(
                      'ACCOUNT_SETTINGS.CHANGE_PASSWORD_FORM.CHANGE_PASSWORD_BTN',
                    )}
                  </Button>
                  <Button
                    variant="text"
                    disabled={isSubmitting || !editPasswordFlag}
                    onClick={cancelPasswordEdit}
                    className="cancel-btn"
                  >
                    {t('ACCOUNT_SETTINGS.CONTACT_DETAILS_FORM.CANCEL')}
                  </Button>
                </div>
              )}
            </Form>
          )}
        </Formik>
        {!editPasswordFlag && (
          <Button
            variant="text"
            onClick={togglePasswordFlag}
            className="edit-btn"
          >
            {t('ACCOUNT_SETTINGS.EDIT')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChangePassword;
