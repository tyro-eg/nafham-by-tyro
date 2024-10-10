import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Dialog,
  IconButton,
  InputLabel,
  TextField as MuiTextField,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import { object, string } from 'yup';
import { rtlClass } from '../../assets/utils/utils';

// import { ReactComponent as Facebook } from '../../assets/images/auth/Facebook.svg';
// import { ReactComponent as Google } from '../../assets/images/auth/google.svg';

import './login.styles.scss';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { signInWithEmail } from '../../redux/user/user.actions';
import { selectSignInError } from '../../redux/user/user.selectors';
import ResetPasswordModal from '../../modals/reset-password/reset-password-modal.component';

const Login = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const signInError = useAppSelector(selectSignInError);
  const [openForgetPasswordModal, setOpenForgetPasswordModal] = useState(false);

  const LoginSchema = object().shape({
    email: string()
      .email(i18n.t('GENEREL.INVALID_EMAIL'))
      .required(i18n.t('GENEREL.REQUIRED')),
    password: string()
      .trim(i18n.t('GENEREL.EMPTY_SPACE'))
      .strict()
      .required(i18n.t('GENEREL.REQUIRED')),
  });

  const handleCloseForgetPasswordModal = () => {
    setOpenForgetPasswordModal(false);
  };

  const goToTerms = () => navigate('/terms');

  return (
    <div className="login-container">
      <h3 className="title">{t('LOGIN.MAIN.TITLE')}</h3>
      <p className="sub-title">{t('LOGIN.MAIN.SUBTITLE')}</p>
      <Formik
        initialValues={{
          email: '',
          password: '',
        }}
        validationSchema={LoginSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            await dispatch(
              signInWithEmail({
                payload: values,
              }),
            );

            if (!signInError) {
              navigate('/home');
            }
            setSubmitting(false);
          } catch (error) {
            setSubmitting(false);
          }
        }}
      >
        {({ submitForm, isSubmitting, errors, touched }) => (
          <Form className={`login-container__form  ${rtlClass()}`}>
            <InputLabel htmlFor="email">{t('LOGIN.LOGIN_EMAIL')}</InputLabel>
            <Field
              as={MuiTextField}
              placeholder={t('LOGIN.LOGIN_EMAIL_INPUT_PLACEHOLDER')}
              name="email"
              type="email"
              variant="outlined"
              className="custom-input-style"
              id="email"
              error={touched.email && Boolean(errors.email)}
              helperText={touched.email && errors.email}
              fullWidth
            />
            <div className="forget-password-label">
              <InputLabel htmlFor="password">
                {t('LOGIN.LOGIN_PASSWORD')}
              </InputLabel>
              <Button
                variant="text"
                className={`forget-password-btn ${rtlClass()}`}
                onClick={() => setOpenForgetPasswordModal(true)}
              >
                <span>{t('LOGIN.FORGET_PASSWORD')}</span>
              </Button>
            </div>
            <Field
              as={MuiTextField}
              placeholder={t('LOGIN.LOGIN_PASSWORD_INPUT_PLACEHOLDER')}
              variant="outlined"
              name="password"
              type="password"
              className="custom-input-style"
              id="password"
              error={touched.password && Boolean(errors.password)}
              helperText={touched.password && errors.password}
              fullWidth
            />
            <Button
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              onClick={submitForm}
              className="btn-custom-style"
              fullWidth
            >
              {t('LOGIN.LOGIN_SUBMIT_BTN')}
            </Button>
            <div className="no-account">
              <p className="register-text">
                {t('LOGIN.NO_ACCOUNT')}{' '}
                <Link to="/register" className="register-link">
                  {t('LOGIN.REGISTER')}
                </Link>
              </p>
            </div>
            {/* <div className="social-login">
              <p className="or-text">{t('LOGIN.OR')}</p>
              <Button
                variant="outlined"
                startIcon={<Facebook />}
                className="social-btn"
                fullWidth
              >
                Facebook
              </Button>
              <Button
                variant="outlined"
                startIcon={<Google />}
                className="social-btn"
                fullWidth
              >
                Google
              </Button>
            </div> */}
            <div className="term-body">
              <p className="term-first-text">{t('REGISTER.TERMS')}</p>
              <Button onClick={goToTerms} variant="text">
                <p className="term-second-text">{t('REGISTER.TERMS_GREEN')}</p>
              </Button>
            </div>
          </Form>
        )}
      </Formik>
      {openForgetPasswordModal && (
        <Dialog
          maxWidth="xs"
          fullWidth
          onClose={handleCloseForgetPasswordModal}
          aria-labelledby="reset-password-dialog"
          open={openForgetPasswordModal}
          sx={{
            '.MuiDialog-paper': {
              width: '100%',
              margin: 0,
              borderRadius: '16px',
            },
          }}
        >
          <IconButton
            className="modal-close-btn"
            onClick={handleCloseForgetPasswordModal}
            aria-label="close"
          >
            <Close />
          </IconButton>
          <ResetPasswordModal handleClose={handleCloseForgetPasswordModal} />
        </Dialog>
      )}
    </div>
  );
};

export default Login;
