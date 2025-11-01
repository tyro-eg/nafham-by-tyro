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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';

import ResetPasswordModal from '../reset-password/reset-password-modal.component';
import { loginSchema, type LoginFormData } from '../../schemas/authSchemas';
import './login-modal.styles.scss';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import { useAppSelector } from '../../redux/store';
import { useRtlClass } from '../../assets/utils/utils';
import { useSignIn } from '../../hooks/useAuth';

interface LoginModalProps {
  onClose: () => void;
  openRegisterModal: () => void;
  openJoinCourseModal?: () => void;
  modalData: {
    courseItem?: any;
    fromCheckout?: boolean;
  };
}

const LoginModal: FC<LoginModalProps> = ({
  onClose,
  openRegisterModal,
  openJoinCourseModal,
  modalData,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectCurrentUser);
  const signInMutation = useSignIn();
  const rtlClass = useRtlClass();

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

  const handleOpenForgetPassword = () => setOpenForgetPasswordModal(true);
  const handleCloseForgetPasswordModal = () =>
    setOpenForgetPasswordModal(false);
  const goToTerms = () => {
    navigate('/terms');
    onClose();
  };

  const onRegister = () => {
    openRegisterModal();
    onClose();
  };

  return (
    <div className="login-modal">
      <div className="login-modal__card">
        <div className="login-modal__card-icon">
          <ExitToApp />
        </div>
        <div className={`login-modal__card-body ${rtlClass}`}>
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
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`login-modal__form ${rtlClass}`}
      >
        <InputLabel htmlFor="email">{t('LOGIN.LOGIN_EMAIL')}</InputLabel>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              placeholder={t('LOGIN.LOGIN_EMAIL_INPUT_PLACEHOLDER')}
              type="email"
              variant="outlined"
              className="custom-input-style"
              id="email"
              error={!!errors.email}
              helperText={errors.email?.message && t(errors.email.message)}
              fullWidth
            />
          )}
        />
        <div className="forget-password-label">
          <InputLabel htmlFor="password">
            {t('LOGIN.LOGIN_PASSWORD')}
          </InputLabel>
          <Button
            variant="text"
            onClick={handleOpenForgetPassword}
            className={`forget-password-btn ${rtlClass}`}
          >
            {t('LOGIN.FORGET_PASSWORD')}
          </Button>
        </div>
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              placeholder={t('LOGIN.LOGIN_PASSWORD_INPUT_PLACEHOLDER')}
              variant="outlined"
              type="password"
              className="custom-input-style"
              id="password"
              error={!!errors.password}
              helperText={
                errors.password?.message && t(errors.password.message)
              }
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
        >
          {t('LOGIN.LOGIN_SUBMIT_BTN')}
        </Button>
        <div className="no-account">
          <p className="register-text">
            {t('LOGIN.NO_ACCOUNT')}
            <Button onClick={onRegister} className="register-link">
              {t('LOGIN.REGISTER')}
            </Button>
          </p>
        </div>
        <div className="term-body">
          <p className="term-first-text">{t('REGISTER.TERMS')}</p>
          <Button onClick={goToTerms} variant="text">
            <p className="term-second-text">{t('REGISTER.TERMS_GREEN')}</p>
          </Button>
        </div>
      </form>

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
