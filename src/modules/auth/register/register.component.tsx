import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, InputLabel, TextField as MuiTextField } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import { object, string, ref } from 'yup';
import 'yup-phone';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import './register.styles.scss';
import { rtlClass } from '../../../assets/utils/utils';

import { ReactComponent as Facebook } from '../../../assets/images/auth/Facebook.svg';
import { ReactComponent as Google } from '../../../assets/images/auth/google.svg';
import main from '../../../assets/images/auth/sign.png';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { selectSignUpError } from '../../../redux/user/user.selectors';
import { signUp } from '../../../redux/user/user.actions';

const Register: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const signUpError = useAppSelector(selectSignUpError);

  const SignUpSchema = object().shape({
    first_name: string()
      .required(i18n.t('GENEREL.REQUIRED'))
      .trim(i18n.t('GENEREL.FIRST_NAME_BLANK'))
      .strict(),
    last_name: string()
      .required(i18n.t('GENEREL.REQUIRED'))
      .trim(i18n.t('GENEREL.LAST_NAME_BLANK'))
      .strict(),
    email: string()
      .email(i18n.t('GENEREL.INVALID_EMAIL'))
      .required(i18n.t('GENEREL.REQUIRED')),
    password: string()
      .trim(i18n.t('GENEREL.EMPTY_SPACE'))
      .strict()
      .required(i18n.t('GENEREL.REQUIRED'))
      .min(8, i18n.t('GENEREL.SHORT_PASSWORD')),
    password_confirmation: string()
      .trim(i18n.t('GENEREL.EMPTY_SPACE'))
      .strict()
      .required(i18n.t('GENEREL.REQUIRED'))
      .oneOf([ref('password')], i18n.t('GENEREL.PASSWORD_CONFIRMATION_ERROR')),
    phone_number: string()
      .required(i18n.t('GENEREL.REQUIRED'))
      .test(
        'isValidPhoneNumber',
        i18n.t('GENEREL.INVALID_PHONE_NUMBER'),
        function (value) {
          const { countryCode } = this.parent;

          return value && value.length > 0
            ? string().phone(countryCode, true).isValidSync(value)
            : false;
        },
      ),
  });

  const goToTerms = () => navigate('/terms');

  return (
    <div className="register">
      <div className="container register__container">
        <div className="first-section">
          <img src={main} alt="sign" />
        </div>
        <div className="second-section">
          <h3 className="title">{t('REGISTER.MAIN.TITLE')}</h3>
          <p className="sub-title">{t('REGISTER.MAIN.SUBTITLE')}</p>
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
            validationSchema={SignUpSchema}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                const { countryCode, ...submitValues } = values;
                await dispatch(signUp(submitValues));

                if (!signUpError) {
                  navigate('/home');
                }
                setSubmitting(false);
              } catch (error) {
                setSubmitting(false);
              }
            }}
            validateOnBlur
          >
            {({ submitForm, isSubmitting, handleChange, errors, touched }) => (
              <Form className={`second-section__form ${rtlClass()}`}>
                <div className="group-inputs">
                  <div className="group1">
                    <InputLabel htmlFor="first_name">
                      {t('REGISTER.REGISTER_FIRST_NAME')}
                    </InputLabel>
                    <Field
                      as={MuiTextField}
                      name="first_name"
                      variant="outlined"
                      placeholder={t(
                        'REGISTER.REGISTER_FIRST_NAME_INPUT_PLACEHOLDER',
                      )}
                      fullWidth
                      error={touched.first_name && Boolean(errors.first_name)}
                      helperText={touched.first_name && errors.first_name}
                    />
                  </div>
                  <div className="group1">
                    <InputLabel htmlFor="last_name">
                      {t('REGISTER.REGISTER_LAST_NAME')}
                    </InputLabel>
                    <Field
                      as={MuiTextField}
                      name="last_name"
                      variant="outlined"
                      placeholder={t(
                        'REGISTER.REGISTER_LAST_NAME_INPUT_PLACEHOLDER',
                      )}
                      fullWidth
                      error={touched.last_name && Boolean(errors.last_name)}
                      helperText={touched.last_name && errors.last_name}
                    />
                  </div>
                </div>
                <div className="group1">
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
                  />
                </div>

                <div className="group-inputs">
                  <div className="group1">
                    <InputLabel htmlFor="password">
                      {t('REGISTER.REGISTER_PASSWORD')}
                    </InputLabel>
                    <Field
                      as={MuiTextField}
                      name="password"
                      type="password"
                      variant="outlined"
                      placeholder={t(
                        'REGISTER.REGISTER_PASSWORD_INPUT_PLACEHOLDER',
                      )}
                      fullWidth
                      error={touched.password && Boolean(errors.password)}
                      helperText={touched.password && errors.password}
                    />
                  </div>
                  <div className="group1">
                    <InputLabel htmlFor="password_confirmation">
                      {t('REGISTER.REGISTER_PASSWORD_CONFIRM')}
                    </InputLabel>
                    <Field
                      as={MuiTextField}
                      name="password_confirmation"
                      type="password"
                      variant="outlined"
                      placeholder={t(
                        'REGISTER.REGISTER_PASSWORD_CONFIRM_INPUT_PLACEHOLDER',
                      )}
                      fullWidth
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
                </div>

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
                    <div className="form-control-danger">
                      {errors.phone_number}
                    </div>
                  )}
                </div>

                <Button
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                  onClick={submitForm}
                  className="btn-custom-style"
                  fullWidth
                >
                  {t('REGISTER.REGISTER_SUBMIT_BTN')}
                </Button>

                <div className="no-account">
                  <p className="register-text">
                    {t('REGISTER.ALREADY_USER')}{' '}
                    <Link to="/login" className="register-link">
                      {t('REGISTER.LOGIN_BTN')}
                    </Link>
                  </p>
                </div>

                {/* <div className="social-login">
                  <p className="or-text">{t('REGISTER.OR')}</p>
                  <Button
                    variant="outlined"
                    startIcon={<Google />}
                    className="social-btn"
                    onClick={() => alert('Google login')}
                  >
                    Facebook
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Facebook />}
                    className="social-btn"
                    onClick={() => alert('Facebook login')}
                  >
                    Google
                  </Button>
                </div> */}
                <div className="term-body">
                  <p className="term-first-text">{t('REGISTER.TERMS')}</p>
                  <Button onClick={goToTerms} variant="text">
                    <p className="term-second-text">
                      {t('REGISTER.TERMS_GREEN')}
                    </p>
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default Register;
