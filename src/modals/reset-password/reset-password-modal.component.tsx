import React from 'react';
import { useTranslation } from 'react-i18next';

import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';

import './reset-password-modal.styles.scss';
import { Button, InputLabel, TextField } from '@mui/material';
const ResetPasswordModal = ({ handleClose }: { handleClose: () => void }) => {
  const { t, i18n } = useTranslation();
  const restPasswordSchema = Yup.object().shape({
    email: Yup.string()
      .email(i18n.t('GENEREL.INVALID_EMAIL'))
      .required(i18n.t('GENEREL.REQUIRED')),
  });
  return (
    <div className="forget-password">
      <p className="forget-password__title">{t('FORGET_PASSWORD.TITLE')}</p>
      <div className="forget-password__description">
        <p className="title">{t('FORGET_PASSWORD.DESCRIPTION1')}</p>
        <p className="title">{t('FORGET_PASSWORD.DESCRIPTION2')}</p>
      </div>
      <Formik
        initialValues={{
          email: '',
        }}
        validationSchema={restPasswordSchema}
        onSubmit={(_values, { setSubmitting }) => {
          setSubmitting(false);
          // if no error after submit
          handleClose();
        }}
      >
        {({ submitForm, isSubmitting }) => (
          <Form className="forget-password__form">
            <InputLabel htmlFor="email">
              {t('FORGET_PASSWORD.FORM.LABEL')}
            </InputLabel>
            <Field
              as={TextField}
              placeholder={t('FORGET_PASSWORD.FORM.EMAIL_PLACEHOLDER')}
              name="email"
              id="email"
              type="email"
              variant="outlined"
              className="custom-input-style"
            />
            {/* <error ? <div className="form-control-danger">{error}</div> : null} */}
            <Button
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              onClick={submitForm}
              className="btn-custom-style"
            >
              {t('FORGET_PASSWORD.FORM.RESET_PASSWORD_BTN')}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ResetPasswordModal;
