/* eslint-disable camelcase */
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InputLabel, TextField } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useAppSelector } from '../../../../redux/store';
import { selectCurrentUser } from '../../../../redux/user/user.selectors';
import { useChangePassword } from '../../../../hooks/useAuth';
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from '../../../../schemas/authSchemas';
import { useRtlClass } from '../../../../assets/utils/utils';

import './change-password.styles.scss';

const ChangePassword: FC = () => {
  const { t } = useTranslation();
  const rtlClass = useRtlClass();
  const changePasswordMutation = useChangePassword();
  const currentUser = useAppSelector(selectCurrentUser);

  const [editPasswordFlag, setEditPasswordFlag] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const togglePasswordFlag = () => {
    setEditPasswordFlag((prevFlag) => !prevFlag);
  };

  const cancelPasswordEdit = () => {
    setEditPasswordFlag(false);
    reset();
  };

  const onSubmit = async (values: ChangePasswordFormData) => {
    try {
      await changePasswordMutation.mutateAsync({
        type: currentUser?.type || 'users',
        userData: {
          old_password: values.current_password,
          password: values.new_password,
          password_confirmation: values.confirm_password,
        },
      });
      reset();
      cancelPasswordEdit();
    } catch (error) {
      console.error('Change password error:', error);
    }
  };

  return (
    <div className="container change-password">
      <h4 className="sub-title">
        {t('ACCOUNT_SETTINGS.CHANGE_PASSWORD_FORM.TITLE')}
      </h4>
      <div className="change-password__form-container">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={`change-password__form ${rtlClass}`}
        >
          <fieldset disabled={!editPasswordFlag} className="form-inputs">
            <div className={`form-group ${rtlClass}`}>
              <InputLabel htmlFor="current_password">
                {t('ACCOUNT_SETTINGS.CHANGE_PASSWORD_FORM.CURRENT_PASSWORD')}
              </InputLabel>
              <Controller
                name="current_password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="password"
                    variant="outlined"
                    placeholder={t(
                      'ACCOUNT_SETTINGS.CHANGE_PASSWORD_FORM.CURRENT_PASSWORD',
                    )}
                    fullWidth
                    className="custom-input-style"
                    disabled={!editPasswordFlag}
                    error={!!errors.current_password}
                    helperText={errors.current_password?.message}
                  />
                )}
              />
            </div>
            <div className={`form-group ${rtlClass}`}>
              <InputLabel htmlFor="new_password">
                {t('ACCOUNT_SETTINGS.CHANGE_PASSWORD_FORM.NEW_PASSWORD')}
              </InputLabel>
              <Controller
                name="new_password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="password"
                    variant="outlined"
                    placeholder={t(
                      'ACCOUNT_SETTINGS.CHANGE_PASSWORD_FORM.NEW_PASSWORD',
                    )}
                    fullWidth
                    className="custom-input-style"
                    disabled={!editPasswordFlag}
                    error={!!errors.new_password}
                    helperText={errors.new_password?.message}
                  />
                )}
              />
            </div>
            <div className={`form-group ${rtlClass}`}>
              <InputLabel htmlFor="confirm_password">
                {t('ACCOUNT_SETTINGS.CHANGE_PASSWORD_FORM.VERIFY_PASSWORD')}
              </InputLabel>
              <Controller
                name="confirm_password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="password"
                    variant="outlined"
                    placeholder={t(
                      'ACCOUNT_SETTINGS.CHANGE_PASSWORD_FORM.VERIFY_PASSWORD',
                    )}
                    fullWidth
                    className="custom-input-style"
                    disabled={!editPasswordFlag}
                    error={!!errors.confirm_password}
                    helperText={errors.confirm_password?.message}
                  />
                )}
              />
            </div>
          </fieldset>
          {!!editPasswordFlag && (
            <div className="form-actions">
              <Button
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                type="submit"
                className="btn-custom-style"
              >
                {t('ACCOUNT_SETTINGS.CHANGE_PASSWORD_FORM.CHANGE_PASSWORD_BTN')}
              </Button>
              <Button
                variant="text"
                disabled={isSubmitting || !editPasswordFlag}
                onClick={cancelPasswordEdit}
                className="cancel-btn"
              >
                {t('ACCOUNT_SETTINGS.CONTACT_DETAILS_FORM.CANCEL')}
              </Button>
            </div>
          )}
        </form>
        {!editPasswordFlag && (
          <Button
            variant="text"
            onClick={togglePasswordFlag}
            className="edit-btn"
          >
            {t('ACCOUNT_SETTINGS.EDIT')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChangePassword;
