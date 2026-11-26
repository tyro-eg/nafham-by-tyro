import { FC, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Button,
  IconButton,
  InputAdornment,
  InputLabel,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';

import { useSignUp } from '../../../hooks/useAuth';
import {
  quickRegisterSchema,
  type QuickRegisterFormData,
} from '../../../schemas/authSchemas';
import { useRtlClass } from '../../../assets/utils/utils';
import { headedForTrial, peekReturnTo } from '../../../lib/return-to';
import { trackFunnel } from '../../../lib/funnel';
import { signUpBody } from './register.utils';
import {
  CardGiftcardRounded,
  FamilyRestroomRounded,
  PeopleAltRounded,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import logo from '../../../assets/images/logo.png';
import LanguageSelector from '../../../component/i18next/LanguageSelector';

import '../signin/signin.styles.scss';

import './register.styles.scss';

/**
 * Sign-up, kept to what is needed to start (26 Nov 2026): a name, a phone,
 * an email and a password, and for a parent their child's first name. The
 * country comes from the phone's country; the password is typed once, with
 * a button to see it; more children and the rest of the profile come later.
 */
const Register: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const signUpMutation = useSignUp();
  const rtlClass = useRtlClass();

  // Who is signing up: a parent who holds the account for their children
  // (most people, so it comes first), or a student with their own account
  const [role, setRole] = useState<'Student' | 'Parent'>('Parent');
  // Sent here from "Book a free trial": say so, and what comes next
  const [forTrial] = useState(() => headedForTrial());
  const [childName, setChildName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // Errors on fields outside the form library show once they tried to send
  const [tried, setTried] = useState(false);
  const childMissing = role === 'Parent' && !childName.trim();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<QuickRegisterFormData>({
    resolver: zodResolver(quickRegisterSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      phone_number: '',
      country_code: 'AE',
    },
  });

  const goToTerms = () => navigate('/terms');

  useEffect(() => {
    trackFunnel('signup_started', { from: 'register', kind: 'register' });
  }, []);

  const onSubmit = async (values: QuickRegisterFormData) => {
    setTried(true);
    if (childMissing) return;
    // Read now: once the account exists the route itself moves on and
    // forgets the remembered page
    const returnTo = peekReturnTo();
    try {
      const userData = await signUpMutation.mutateAsync(
        signUpBody(values, role, childName),
      );

      if (userData?.id) {
        navigate(returnTo ?? (role === 'Parent' ? '/family' : '/dashboard'), {
          replace: true,
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  // The same brand panel as sign in: no photo, no quote (19 Nov 2026)
  const facts = [
    { icon: <CardGiftcardRounded />, text: t('REGISTER.PANEL.FACT_TRIAL') },
    { icon: <PeopleAltRounded />, text: t('REGISTER.PANEL.FACT_TUTORS') },
    { icon: <FamilyRestroomRounded />, text: t('REGISTER.PANEL.FACT_FAMILY') },
  ];

  return (
    <div className="signin register">
      <aside className="signin__panel">
        <span className="signin__ring signin__ring--a" aria-hidden="true" />
        <span className="signin__ring signin__ring--b" aria-hidden="true" />
        <span className="signin__ring signin__ring--c" aria-hidden="true" />
        <Link to="/" className="signin__logo" aria-label="Nafham">
          <img src={logo} alt="" />
        </Link>
        <div className="signin__panel-copy">
          <h2 className="signin__headline">
            {t('REGISTER.PANEL.TITLE_START')}{' '}
            <em>{t('REGISTER.PANEL.TITLE_END')}</em>
          </h2>
          <p className="signin__sub">{t('REGISTER.PANEL.SUBTITLE')}</p>
          <ul className="signin__facts">
            {facts.map((fact) => (
              <li key={fact.text}>
                <span className="signin__fact-icon" aria-hidden="true">
                  {fact.icon}
                </span>
                {fact.text}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="signin__form">
        <div className="signin__top">
          <LanguageSelector />
        </div>
        <div className="signin__form-inner register__inner">
          <div className="register__header">
            <h1 className="title">
              {t(forTrial ? 'REGISTER.TRIAL.TITLE' : 'REGISTER.MAIN.TITLE')}
            </h1>
            <p className="sub-title">
              {t(
                forTrial ? 'REGISTER.TRIAL.SUBTITLE' : 'REGISTER.MAIN.SUBTITLE',
              )}
            </p>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit, () => setTried(true))}
            className={`second-section__form ${rtlClass}`}
            noValidate
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
              <ToggleButton value="Parent">
                {t('REGISTER.ROLE.PARENT')}
              </ToggleButton>
              <ToggleButton value="Student">
                {t('REGISTER.ROLE.STUDENT')}
              </ToggleButton>
            </ToggleButtonGroup>

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
                      id="first_name"
                      variant="outlined"
                      autoComplete="given-name"
                      // Ready to type on a computer; on a phone the keyboard
                      // would jump up over the page before they have read it
                      autoFocus={window.innerWidth >= 900}
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
                      id="last_name"
                      variant="outlined"
                      autoComplete="family-name"
                      fullWidth
                      error={!!errors.last_name}
                      helperText={errors.last_name?.message}
                    />
                  )}
                />
              </div>
            </div>

            {role === 'Parent' && (
              <div className="group1 auth-field">
                <InputLabel htmlFor="child_first_name">
                  {t('REGISTER.QUICK.CHILD_FIRST_NAME')}
                </InputLabel>
                <TextField
                  id="child_first_name"
                  variant="outlined"
                  fullWidth
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  error={tried && childMissing}
                  helperText={
                    tried && childMissing
                      ? t('GENEREL.REQUIRED')
                      : t('REGISTER.QUICK.CHILD_HINT')
                  }
                />
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
                    value={field.value}
                    onBlur={field.onBlur}
                    country="ae"
                    preferredCountries={['ae', 'eg', 'sa']}
                    specialLabel=""
                    inputStyle={{ width: '100%' }}
                    inputClass={errors.phone_number ? 'is-invalid' : ''}
                    inputProps={{
                      id: 'phone_number',
                      name: 'phone_number',
                      autoComplete: 'tel',
                    }}
                    onChange={(phoneNumber: string, country) => {
                      field.onChange(phoneNumber);
                      // The account's country is the phone's country
                      const code =
                        (country as { countryCode?: string })?.countryCode ??
                        'ae';
                      setValue('country_code', code.toUpperCase());
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
                    id="email"
                    type="email"
                    variant="outlined"
                    autoComplete="email"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </div>

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
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    autoComplete="new-password"
                    fullWidth
                    error={!!errors.password}
                    helperText={
                      errors.password?.message ??
                      t('REGISTER.QUICK.PASSWORD_HINT')
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword((shown) => !shown)}
                            edge="end"
                            aria-label={
                              showPassword
                                ? t('LOGIN.HIDE_PASSWORD')
                                : t('LOGIN.SHOW_PASSWORD')
                            }
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </div>

            <Button
              variant="contained"
              color="primary"
              size="large"
              disabled={isSubmitting}
              type="submit"
              className="btn-custom-style"
              fullWidth
            >
              {t(
                forTrial
                  ? 'REGISTER.TRIAL.SUBMIT'
                  : 'REGISTER.REGISTER_SUBMIT_BTN',
              )}
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
      </main>
    </div>
  );
};

export default Register;
