import { FC, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Button,
  InputLabel,
  TextField,
  MenuItem,
  Select,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';

import { useSignUp } from '../../../hooks/useAuth';
import {
  registerSchema,
  type RegisterFormData,
} from '../../../schemas/authSchemas';
import { useRtlClass } from '../../../assets/utils/utils';
import {
  getCountries,
  getNationalities,
  PREFERRED_COUNTRIES,
} from '../../../assets/utils/countries';
import main from '../../../assets/images/auth/sign.png';

import './register.styles.scss';

const Register: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const signUpMutation = useSignUp();
  const rtlClass = useRtlClass();

  const countries = useMemo(() => getCountries(), []);
  const nationalities = useMemo(() => getNationalities(), []);
  // Who is signing up: a student with their own account, or a parent
  // who holds the account for their children
  const [role, setRole] = useState<'Student' | 'Parent'>('Student');
  const [child, setChild] = useState({ first_name: '', last_name: '' });
  const childMissing =
    role === 'Parent' && (!child.first_name.trim() || !child.last_name.trim());

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      password_confirmation: '',
      phone_number: '',
      country_code: 'AE',
      nationality: 'AE',
    },
  });

  const goToTerms = () => navigate('/terms');

  const onSubmit = async (values: RegisterFormData) => {
    try {
      const { phone_number, ...submitValues } = values;
      if (childMissing) return;
      const userData = await signUpMutation.mutateAsync({
        ...submitValues,
        phone_number: phone_number.startsWith('+')
          ? phone_number
          : `+${phone_number}`,
        type: role,
        ...(role === 'Parent'
          ? {
              child: {
                first_name: child.first_name.trim(),
                last_name: child.last_name.trim(),
              },
            }
          : {}),
      });

      if (userData?.id) {
        navigate(role === 'Parent' ? '/family' : '/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="register">
      <div className="container register__container">
        <div className="first-section">
          <img src={main} alt="sign" />
        </div>
        <div className="second-section">
          <div className="register__card">
            <div className="register__header">
              <h1 className="title">{t('REGISTER.MAIN.TITLE')}</h1>
              <p className="sub-title">{t('REGISTER.MAIN.SUBTITLE')}</p>
            </div>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className={`second-section__form ${rtlClass}`}
            >
              <ToggleButtonGroup
                exclusive
                fullWidth
                size="small"
                value={role}
                onChange={(_, value) => value && setRole(value)}
                aria-label={t('REGISTER.ROLE.LABEL')}
                sx={{ mb: 2 }}
              >
                <ToggleButton value="Student">
                  {t('REGISTER.ROLE.STUDENT')}
                </ToggleButton>
                <ToggleButton value="Parent">
                  {t('REGISTER.ROLE.PARENT')}
                </ToggleButton>
              </ToggleButtonGroup>
              {role === 'Parent' && (
                <p className="register__hint">
                  {t('REGISTER.ROLE.PARENT_HINT')}
                </p>
              )}

              <div className="group-inputs auth-field-row">
                <div className="group1 auth-field">
                  <InputLabel htmlFor="first_name">
                    {t('REGISTER.REGISTER_FIRST_NAME')}
                  </InputLabel>
                  <Controller
                    name="first_name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        variant="outlined"
                        placeholder={t(
                          'REGISTER.REGISTER_FIRST_NAME_INPUT_PLACEHOLDER',
                        )}
                        fullWidth
                        error={!!errors.first_name}
                        helperText={errors.first_name?.message}
                      />
                    )}
                  />
                </div>
                <div className="group1 auth-field">
                  <InputLabel htmlFor="last_name">
                    {t('REGISTER.REGISTER_LAST_NAME')}
                  </InputLabel>
                  <Controller
                    name="last_name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        variant="outlined"
                        placeholder={t(
                          'REGISTER.REGISTER_LAST_NAME_INPUT_PLACEHOLDER',
                        )}
                        fullWidth
                        error={!!errors.last_name}
                        helperText={errors.last_name?.message}
                      />
                    )}
                  />
                </div>
              </div>
              <div className="group1 auth-field">
                <InputLabel htmlFor="email">
                  {t('REGISTER.REGISTER_EMAIL')}
                </InputLabel>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="email"
                      variant="outlined"
                      placeholder={t(
                        'REGISTER.REGISTER_EMAIL_INPUT_PLACEHOLDER',
                      )}
                      fullWidth
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />
              </div>

              <div className="group-inputs auth-field-row">
                <div className="group1 auth-field">
                  <InputLabel htmlFor="password">
                    {t('REGISTER.REGISTER_PASSWORD')}
                  </InputLabel>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type="password"
                        variant="outlined"
                        placeholder={t(
                          'REGISTER.REGISTER_PASSWORD_INPUT_PLACEHOLDER',
                        )}
                        fullWidth
                        error={!!errors.password}
                        helperText={errors.password?.message}
                      />
                    )}
                  />
                </div>
                <div className="group1 auth-field">
                  <InputLabel htmlFor="password_confirmation">
                    {t('REGISTER.REGISTER_PASSWORD_CONFIRM')}
                  </InputLabel>
                  <Controller
                    name="password_confirmation"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type="password"
                        variant="outlined"
                        placeholder={t(
                          'REGISTER.REGISTER_PASSWORD_CONFIRM_INPUT_PLACEHOLDER',
                        )}
                        fullWidth
                        error={!!errors.password_confirmation}
                        helperText={errors.password_confirmation?.message}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="group-inputs auth-field-row">
                <div className="group1 auth-field">
                  <InputLabel htmlFor="country_code">
                    {t('REGISTER.COUNTRY')}
                  </InputLabel>
                  <Controller
                    name="country_code"
                    control={control}
                    render={({ field }) => {
                      const menuItems = [];
                      menuItems.push(
                        <MenuItem key="placeholder" value="" disabled>
                          {t('REGISTER.SELECT_COUNTRY')}
                        </MenuItem>,
                      );
                      countries.forEach((country, index) => {
                        menuItems.push(
                          <MenuItem key={country.code} value={country.code}>
                            {country.name}
                          </MenuItem>,
                        );
                        if (index === PREFERRED_COUNTRIES.length - 1) {
                          menuItems.push(<Divider key="divider" />);
                        }
                      });
                      return (
                        <Select
                          {...field}
                          variant="outlined"
                          fullWidth
                          error={!!errors.country_code}
                          displayEmpty
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: 300,
                                width: 260,
                              },
                            },
                            anchorOrigin: {
                              vertical: 'bottom',
                              horizontal: 'left',
                            },
                            transformOrigin: {
                              vertical: 'top',
                              horizontal: 'left',
                            },
                          }}
                        >
                          {menuItems}
                        </Select>
                      );
                    }}
                  />
                  {errors.country_code && (
                    <div className="form-control-danger">
                      {errors.country_code.message}
                    </div>
                  )}
                </div>
                <div className="group1 auth-field">
                  <InputLabel htmlFor="nationality">
                    {t('REGISTER.NATIONALITY')}
                  </InputLabel>
                  <Controller
                    name="nationality"
                    control={control}
                    render={({ field }) => {
                      const menuItems = [];
                      menuItems.push(
                        <MenuItem key="placeholder" value="" disabled>
                          {t('REGISTER.SELECT_NATIONALITY')}
                        </MenuItem>,
                      );
                      nationalities.forEach((nationality, index) => {
                        menuItems.push(
                          <MenuItem
                            key={nationality.code}
                            value={nationality.code}
                          >
                            {nationality.name}
                          </MenuItem>,
                        );
                        if (index === PREFERRED_COUNTRIES.length - 1) {
                          menuItems.push(<Divider key="divider-nat" />);
                        }
                      });
                      return (
                        <Select
                          {...field}
                          variant="outlined"
                          fullWidth
                          error={!!errors.nationality}
                          displayEmpty
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: 300,
                                width: 260,
                              },
                            },
                            anchorOrigin: {
                              vertical: 'bottom',
                              horizontal: 'left',
                            },
                            transformOrigin: {
                              vertical: 'top',
                              horizontal: 'left',
                            },
                          }}
                        >
                          {menuItems}
                        </Select>
                      );
                    }}
                  />
                  {errors.nationality && (
                    <div className="form-control-danger">
                      {errors.nationality.message}
                    </div>
                  )}
                </div>
              </div>

              {role === 'Parent' && (
                <div className="group-inputs auth-field-row">
                  <div className="group1 auth-field">
                    <InputLabel htmlFor="child_first_name">
                      {t('REGISTER.CHILD.FIRST_NAME')}
                    </InputLabel>
                    <TextField
                      id="child_first_name"
                      fullWidth
                      size="small"
                      value={child.first_name}
                      onChange={(e) =>
                        setChild({ ...child, first_name: e.target.value })
                      }
                      error={isSubmitting && !child.first_name.trim()}
                    />
                  </div>
                  <div className="group2 auth-field">
                    <InputLabel htmlFor="child_last_name">
                      {t('REGISTER.CHILD.LAST_NAME')}
                    </InputLabel>
                    <TextField
                      id="child_last_name"
                      fullWidth
                      size="small"
                      value={child.last_name}
                      onChange={(e) =>
                        setChild({ ...child, last_name: e.target.value })
                      }
                      error={isSubmitting && !child.last_name.trim()}
                    />
                  </div>
                </div>
              )}

              <div className="phone-input auth-field">
                <InputLabel htmlFor="phone_number">
                  {t('REGISTER.REGISTER_PHONE_NUMBER')}
                </InputLabel>
                <Controller
                  name="phone_number"
                  control={control}
                  render={({ field }) => (
                    <PhoneInput
                      {...field}
                      country="ae"
                      preferredCountries={['ae', 'eg', 'sa']}
                      specialLabel=""
                      inputStyle={{ width: '100%' }}
                      inputClass={errors.phone_number ? 'is-invalid' : ''}
                      onChange={(phoneNumber: string) => {
                        setValue('phone_number', phoneNumber);
                      }}
                    />
                  )}
                />
                {errors.phone_number && (
                  <div className="form-control-danger">
                    {errors.phone_number.message}
                  </div>
                )}
              </div>

              <Button
                variant="contained"
                color="primary"
                size="large"
                disabled={isSubmitting || childMissing}
                type="submit"
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

              <div className="term-body">
                <p className="term-first-text">{t('REGISTER.TERMS')}</p>
                <Button onClick={goToTerms} variant="text">
                  <span className="term-second-text">
                    {t('REGISTER.TERMS_GREEN')}
                  </span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
