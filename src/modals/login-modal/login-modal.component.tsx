import { useEffect, useState, FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Dialog,
  IconButton,
  InputLabel,
  TextField,
} from '@mui/material';
import { Close, ExitToApp } from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';

import ResetPasswordModal from '../reset-password/reset-password-modal.component';

// import { ReactComponent as Facebook } from '../../../assets/images/auth/Facebook.svg';
// import { ReactComponent as Google } from '../../../assets/images/auth/google.svg';

import './login-modal.styles.scss';
import {
  selectCurrentUser,
  selectSignInError,
} from '../../redux/user/user.selectors';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { signInWithEmail } from '../../redux/user/user.actions';
import { rtlClass } from '../../assets/utils/utils';

interface LoginModalProps {
  onClose: () => void;
  openRegisterModal: () => void;
  openJoinCourseModal?: () => void;
  modalData: {
    courseItem?: boolean;
    fromCheckout?: boolean;
  };
}

const LoginModal: FC<LoginModalProps> = ({
  onClose,
  openRegisterModal,
  openJoinCourseModal,
  modalData,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const signInError = useAppSelector(selectSignInError);
  const currentUser = useAppSelector(selectCurrentUser);

  const LoginSchema = (t: any) =>
    Yup.object().shape({
      email: Yup.string()
        .email(i18n.t('GENEREL.INVALID_EMAIL'))
        .required(i18n.t('GENEREL.REQUIRED')),
      password: Yup.string()
        .trim(i18n.t('GENEREL.EMPTY_SPACE'))
        .strict()
        .required(i18n.t('GENEREL.REQUIRED')),
    });

  const [openForgetPasswordModal, setOpenForgetPasswordModal] = useState(false);

  useEffect(() => {
    if (currentUser) {
      successLogic();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const successLogic = () => {
    if (modalData.fromCheckout) {
      openJoinCourseModal?.();
    }
    onClose();
  };

  const handleOpenForgetPassword = () => setOpenForgetPasswordModal(true);
  const handleCloseForgetPasswordModal = () =>
    setOpenForgetPasswordModal(false);
  const goToTerms = () => navigate('/terms');

  return (
    <div className="login-modal">
      <div className="login-modal__card">
        <div className="login-modal__card-icon">
          <ExitToApp />
        </div>
        <div className={`login-modal__card-body ${rtlClass()}`}>
          <p className="login-modal__card-body__header">
            {modalData.courseItem
              ? t('LOGIN.LOGIN_TITLE_1')
              : t('LOGIN.LOGIN_TITLE')}
          </p>
          <p className="login-modal__card-body__text">
            {t('LOGIN.LOGIN_SUBTITLE')}
          </p>
        </div>
      </div>

      <hr className="full-line" />
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={LoginSchema(i18n)}
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
          <Form className={`login-modal__form ${rtlClass()}`}>
            <InputLabel htmlFor="email">{t('LOGIN.LOGIN_EMAIL')}</InputLabel>
            <Field
              as={TextField}
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
                onClick={handleOpenForgetPassword}
                className={`forget-password-btn ${rtlClass()}`}
              >
                {t('LOGIN.FORGET_PASSWORD')}
              </Button>
            </div>
            <Field
              as={TextField}
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
            >
              {t('LOGIN.LOGIN_SUBMIT_BTN')}
            </Button>
            <div className="no-account">
              <p className="register-text">
                {t('LOGIN.NO_ACCOUNT')}
                <Button onClick={openRegisterModal} className="register-link">
                  {t('LOGIN.REGISTER')}
                </Button>
              </p>
            </div>
            {/* <div className="social-login">
              <p className="or-text">{t('LOGIN.OR')}</p>
              <Button
                variant="outlined"
                startIcon={<Facebook />}
                className="social-btn"
              >
                Facebook
              </Button>
              <Button
                variant="outlined"
                startIcon={<Google />}
                className="social-btn"
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
          open={openForgetPasswordModal}
          onClose={handleCloseForgetPasswordModal}
          sx={{
            '& .MuiDialog-paper': {
              width: '100%',
              margin: 0,
              borderRadius: '16px',
            },
          }}
        >
          <IconButton
            className="modal-close-btn"
            onClick={handleCloseForgetPasswordModal}
          >
            <Close />
          </IconButton>
          <ResetPasswordModal handleClose={handleCloseForgetPasswordModal} />
        </Dialog>
      )}
    </div>
  );
};

export default LoginModal;
