// TODO: Uncomment when backend is ready
// import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Button,
  // TODO: Uncomment when backend is ready
  // Dialog,
  // IconButton,
  InputLabel,
  TextField as MuiTextField,
} from '@mui/material';
// TODO: Uncomment when backend is ready
// import { Close } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '../../schemas/authSchemas';
import { useRtlClass } from '../../assets/utils/utils';

import './login.styles.scss';
// TODO: Uncomment when backend is ready
// import ResetPasswordModal from '../../modals/reset-password/reset-password-modal.component';
import { useSignIn } from '../../hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const rtlClass = useRtlClass();
  // TODO: Uncomment when backend is ready
  // const [openForgetPasswordModal, setOpenForgetPasswordModal] = useState(false);

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

  // TODO: Uncomment when backend is ready
  // const handleCloseForgetPasswordModal = () => {
  //   setOpenForgetPasswordModal(false);
  // };

  const goToTerms = () => navigate('/terms');

  const onSubmit = async (values: LoginFormData) => {
    try {
      const userData = await signInMutation.mutateAsync(values);
      if (userData?.id) {
        navigate('/home');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="login-container">
      <h3 className="title">{t('LOGIN.MAIN.TITLE')}</h3>
      <p className="sub-title">{t('LOGIN.MAIN.SUBTITLE')}</p>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`login-container__form  ${rtlClass}`}
      >
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
              error={!!errors.email}
              helperText={errors.email?.message}
              fullWidth
            />
          )}
        />
        <div className="forget-password-label">
          <InputLabel htmlFor="password">
            {t('LOGIN.LOGIN_PASSWORD')}
          </InputLabel>
          {/* TODO: Uncomment when backend is ready */}
          {/* <Button
            variant="text"
            className={`forget-password-btn ${rtlClass}`}
            onClick={() => setOpenForgetPasswordModal(true)}
          >
            <span>{t('LOGIN.FORGET_PASSWORD')}</span>
          </Button> */}
        </div>
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <MuiTextField
              {...field}
              placeholder={t('LOGIN.LOGIN_PASSWORD_INPUT_PLACEHOLDER')}
              variant="outlined"
              type="password"
              className="custom-input-style"
              id="password"
              error={!!errors.password}
              helperText={errors.password?.message}
              fullWidth
            />
          )}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isSubmitting}
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
      </form>
      {/* TODO: Uncomment when backend is ready */}
      {/* {openForgetPasswordModal && (
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
      )} */}
    </div>
  );
};

export default Login;
