import { useEffect, useState, FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Dialog, InputLabel, TextField } from '@mui/material';
import { ExitToApp } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';

import CompleteRegisterSuccessModal from '../complete-register-success-modal/complete-register-success-modal.component';
// import { ReactComponent as Facebook } from '../../../assets/images/auth/Facebook.svg';
// import { ReactComponent as Google } from '../../../assets/images/auth/google.svg';
import './register-modal.styles.scss';
import { useRtlClass } from '../../assets/utils/utils';
import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import { useSignUp } from '../../hooks/useAuth';
import {
  registerSchema,
  type RegisterFormData,
} from '../../schemas/authSchemas';

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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const signUpMutation = useSignUp();
  const currentUser = useAppSelector(selectCurrentUser);
  const rtlClass = useRtlClass();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onSubmit', // Only validate on submit
    defaultValues: {
      first_name: 'temp', // Will be extracted from email
      last_name: 'Student', // Default value
      email: '',
      password: '',
      password_confirmation: '', // Will be set automatically
      phone_number: '',
      country_code: 'AE',
      nationality: 'AE',
    },
  });

  const [openCompleteRegisterModal, setOpenCompleteRegisterModal] =
    useState(false);

  useEffect(() => {
    if (currentUser) successLogic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const goToTerms = () => {
    navigate('/terms');
    onClose();
  };

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

  const onSubmit = async (values: RegisterFormData) => {
    try {
      const { phone_number, email, ...submitValues } = values;
      // Extract name from email (part before @)
      const emailName = email.split('@')[0];
      const userData = await signUpMutation.mutateAsync({
        ...submitValues,
        email,
        first_name: emailName,
        last_name: 'Student',
        phone_number: phone_number.startsWith('+')
          ? phone_number
          : `+${phone_number}`,
        type: 'Student',
      });

      if (userData?.id) {
        navigate('/home');
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="register-modal">
      <div className="register-modal__card">
        <div className="register-modal__card-icon">
          <ExitToApp />
        </div>
        <div className={`register-modal__card-body ${rtlClass}`}>
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

      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`register-modal__form ${rtlClass}`}
      >
        <InputLabel htmlFor="email">{t('REGISTER.REGISTER_EMAIL')}</InputLabel>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              type="email"
              variant="outlined"
              placeholder={t('REGISTER.REGISTER_EMAIL_INPUT_PLACEHOLDER')}
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
              className="custom-input-style"
              id="email"
              onChange={(e) => {
                field.onChange(e);
                // Auto-extract first_name from email
                const emailName = e.target.value.split('@')[0];
                if (emailName) {
                  setValue('first_name', emailName);
                  setValue('last_name', 'Student');
                }
              }}
            />
          )}
        />

        <div className="phone-input">
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
                onChange={(phoneNumber: string, countryData: any) => {
                  setValue('phone_number', phoneNumber);
                  // Auto-set country and nationality from phone country
                  const countryCode =
                    countryData.countryCode?.toUpperCase() || 'AE';
                  setValue('country_code', countryCode);
                  setValue('nationality', countryCode);
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
              placeholder={t('REGISTER.REGISTER_PASSWORD_INPUT_PLACEHOLDER')}
              fullWidth
              error={!!errors.password}
              helperText={errors.password?.message}
              className="custom-input-style"
              id="password"
              onChange={(e) => {
                field.onChange(e);
                // Automatically set password_confirmation to match password
                setValue('password_confirmation', e.target.value);
              }}
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
      </form>

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
