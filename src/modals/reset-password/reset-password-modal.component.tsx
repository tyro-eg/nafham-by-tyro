import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, InputLabel, TextField } from '@mui/material';

import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '../../schemas/authSchemas';
import './reset-password-modal.styles.scss';

interface ResetPasswordModalProps {
  handleClose: () => void;
}

const ResetPasswordModal: FC<ResetPasswordModalProps> = ({ handleClose }) => {
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: ResetPasswordFormData) => {
    // TODO: Implement password reset API call
    console.log('Reset password for:', values.email);
    // if no error after submit
    handleClose();
  };

  return (
    <div className="forget-password">
      <p className="forget-password__title">{t('FORGET_PASSWORD.TITLE')}</p>
      <div className="forget-password__description">
        <p className="title">{t('FORGET_PASSWORD.DESCRIPTION1')}</p>
        <p className="title">{t('FORGET_PASSWORD.DESCRIPTION2')}</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="forget-password__form">
        <InputLabel htmlFor="email">
          {t('FORGET_PASSWORD.FORM.LABEL')}
        </InputLabel>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              placeholder={t('FORGET_PASSWORD.FORM.EMAIL_PLACEHOLDER')}
              id="email"
              type="email"
              variant="outlined"
              className="custom-input-style"
              error={!!errors.email}
              helperText={errors.email?.message && t(errors.email.message)}
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
          {t('FORGET_PASSWORD.FORM.RESET_PASSWORD_BTN')}
        </Button>
      </form>
    </div>
  );
};

export default ResetPasswordModal;
