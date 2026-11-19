import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Dialog,
  IconButton,
  InputAdornment,
  InputLabel,
  TextField as MuiTextField,
} from '@mui/material';
import { Close, Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '../../schemas/authSchemas';
import { useRtlClass } from '../../assets/utils/utils';

import './login.styles.scss';
import ResetPasswordModal from '../../modals/reset-password/reset-password-modal.component';
import { useSignIn } from '../../hooks/useAuth';
import { getHomePath } from '../../assets/utils/home-path';

const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const rtlClass = useRtlClass();
  // The server has no self-service reset: the window says how to get a new
  // password from support (the Admin's "New password").
  const [openForgetPasswordModal, setOpenForgetPasswordModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const signInMutation = useSignIn();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleCloseForgetPasswordModal = () => {
    setOpenForgetPasswordModal(false);
  };

  const onSubmit = async (values: LoginFormData) => {
    try {
      const userData = await signInMutation.mutateAsync(values);
      if (userData?.id) {
        navigate(getHomePath(userData));
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-container__header">
        <h1 className="title">{t('LOGIN.MAIN.TITLE')}</h1>
        <p className="sub-title">{t('LOGIN.MAIN.SUBTITLE')}</p>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`login-container__form ${rtlClass}`}
      >
        <div className="auth-field">
          <InputLabel htmlFor="email">{t('LOGIN.LOGIN_EMAIL')}</InputLabel>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <MuiTextField
                {...field}
                placeholder={t('LOGIN.LOGIN_EMAIL_INPUT_PLACEHOLDER')}
                type="email"
                variant="outlined"
                className="custom-input-style"
                id="email"
                autoComplete="email"
                error={!!errors.email}
                helperText={errors.email?.message}
                fullWidth
              />
            )}
          />
        </div>
        <div className="auth-field">
          <div className="forget-password-label">
            <InputLabel htmlFor="password">
              {t('LOGIN.LOGIN_PASSWORD')}
            </InputLabel>
            <Button
              variant="text"
              className={`forget-password-btn ${rtlClass}`}
              onClick={() => setOpenForgetPasswordModal(true)}
            >
              <span>{t('LOGIN.FORGET_PASSWORD')}</span>
            </Button>
          </div>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <MuiTextField
                {...field}
                placeholder={t('LOGIN.LOGIN_PASSWORD_INPUT_PLACEHOLDER')}
                variant="outlined"
                type={showPassword ? 'text' : 'password'}
                className="custom-input-style"
                id="password"
                autoComplete="current-password"
                error={!!errors.password}
                helperText={errors.password?.message}
                fullWidth
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
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          disabled={isSubmitting}
          className="btn-custom-style"
          fullWidth
        >
          {t('LOGIN.LOGIN_SUBMIT_BTN')}
        </Button>
        {/* Sign in needs no consent line: the terms are agreed at sign-up */}
        <p className="login-container__or">{t('LOGIN.OR_SHORT')}</p>
        <Button
          component={Link}
          to="/trial"
          variant="outlined"
          size="large"
          className="login-container__trial"
          fullWidth
        >
          {t('LOGIN.FREE_TRIAL')}
        </Button>
        <div className="no-account">
          <p className="register-text">
            {t('LOGIN.NO_ACCOUNT')}{' '}
            <Link to="/register" className="register-link">
              {t('LOGIN.REGISTER')}
            </Link>
          </p>
        </div>
      </form>
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
