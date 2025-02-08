import { useEffect, useState, FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Dialog,
  InputLabel,
  TextField as MuiTextField,
} from '@mui/material';
import { ExitToApp } from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import 'yup-phone';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';

import CompleteRegisterSuccessModal from '../complete-register-success-modal/complete-register-success-modal.component';
// import { ReactComponent as Facebook } from '../../../assets/images/auth/Facebook.svg';
// import { ReactComponent as Google } from '../../../assets/images/auth/google.svg';
import './register-modal.styles.scss';
import { rtlClass } from '../../assets/utils/utils';
import { signUp } from '../../redux/user/user.actions';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';

interface RegisterModalProps {
  onClose: () => void;
  openLoginModal: () => void;
  openJoinCourseModal?: () => void;
  modalData: {
    courseItem?: any;
    fromCheckout?: boolean;
  };
}

const RegisterModal: FC<RegisterModalProps> = ({
  onClose,
  openLoginModal,
  openJoinCourseModal,
  modalData,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);

  const [openCompleteRegisterModal, setOpenCompleteRegisterModal] =
    useState(false);

  const SignupSchema = Yup.object().shape({
    email: Yup.string()
      .email(i18n.t('GENEREL.INVALID_EMAIL'))
      .required(i18n.t('GENEREL.REQUIRED')),
    password: Yup.string()
      .trim(i18n.t('GENEREL.EMPTY_SPACE'))
      .strict()
      .required(i18n.t('GENEREL.REQUIRED'))
      .min(8, i18n.t('GENEREL.SHORT_PASSWORD')),
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

  useEffect(() => {
    if (currentUser) successLogic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const goToTerms = () => navigate('/terms');

  const successLogic = () => {
    modalData?.fromCheckout
      ? openJoinCourseModal?.()
      : setOpenCompleteRegisterModal(true);
    onClose();
  };

  const handleCloseCompleteRegisterModal = () =>
    setOpenCompleteRegisterModal(false);

  const onLogin = () => {
    openLoginModal();
    onClose();
  };

  return (
    <div className="register-modal">
      <div className="register-modal__card">
        <div className="register-modal__card-icon">
          <ExitToApp />
        </div>
        <div className={`register-modal__card-body ${rtlClass()}`}>
          <p className="register-modal__card-body__header">
            {modalData.courseItem
              ? t('REGISTER.REGISTER_TITLE_1')
              : t('REGISTER.REGISTER_TITLE')}
          </p>
          <p className="register-modal__card-body__text">
            {t('REGISTER.REGISTER_SUBTITLE')}
          </p>
        </div>
      </div>

      <hr className="full-line" />

      <Formik
        initialValues={{
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          password_confirmation: '',
          phone_number: '',
          countryCode: '',
        }}
        validationSchema={SignupSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const { countryCode, ...submitValues } = values;
            const user = {
              ...submitValues,
              first_name: values.email.split('@')[0],
              last_name: 'Student',
              password_confirmation: values.password,
              type: 'Student',
            };
            const signUpResponse = await dispatch(signUp(user));

            if (signUpResponse?.payload?.id) {
              navigate('/home');
            }
            setSubmitting(false);
          } catch (error) {
            setSubmitting(false);
          }
        }}
      >
        {({ submitForm, isSubmitting, handleChange, errors, touched }) => (
          <Form className={`register-modal__form ${rtlClass()}`}>
            <InputLabel htmlFor="email">
              {t('REGISTER.REGISTER_EMAIL')}
            </InputLabel>
            <Field
              as={MuiTextField}
              name="email"
              type="email"
              variant="outlined"
              placeholder={t('REGISTER.REGISTER_EMAIL_INPUT_PLACEHOLDER')}
              fullWidth
              error={touched.email && Boolean(errors.email)}
              helperText={touched.email && errors.email}
              className="custom-input-style"
            />

            <div className="phone-input">
              <InputLabel htmlFor="phone_number">
                {t('REGISTER.REGISTER_PHONE_NUMBER')}
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
                      setFieldValue('countryCode', countryData.countryCode);
                    }}
                  />
                )}
              </Field>
              {errors.phone_number && touched.phone_number && (
                <div className="form-control-danger">{errors.phone_number}</div>
              )}
            </div>

            <InputLabel htmlFor="password">
              {t('REGISTER.REGISTER_PASSWORD')}
            </InputLabel>
            <Field
              as={MuiTextField}
              name="password"
              type="password"
              variant="outlined"
              placeholder={t('REGISTER.REGISTER_PASSWORD_INPUT_PLACEHOLDER')}
              fullWidth
              error={touched.password && Boolean(errors.password)}
              helperText={touched.password && errors.password}
              className="custom-input-style"
            />

            <Button
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              onClick={submitForm}
              className="btn-custom-style"
            >
              {t('REGISTER.REGISTER_SUBMIT_BTN')}
            </Button>
            <div className="no-account">
              <p className="register-text">
                {t('REGISTER.ALREADY_USER')}
                <Button onClick={onLogin} className="register-link">
                  {t('REGISTER.LOGIN_BTN')}
                </Button>
              </p>
            </div>

            {/* <div className="social-login">
              <Button startIcon={<Facebook />} className="social-btn">
                Facebook
              </Button>
              <Button startIcon={<Google />} className="social-btn">
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

      {openCompleteRegisterModal && (
        <Dialog
          maxWidth="sm"
          fullWidth
          aria-labelledby="complete-register-dialog"
          open={openCompleteRegisterModal}
          onClose={handleCloseCompleteRegisterModal}
        >
          <CompleteRegisterSuccessModal
            onClose={handleCloseCompleteRegisterModal}
          />
        </Dialog>
      )}
    </div>
  );
};

export default RegisterModal;
