/* eslint-disable camelcase */
import { FC, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InputLabel, TextField } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';

import { useAppSelector } from '../../../../redux/store';
import { selectCurrentUser } from '../../../../redux/user/user.selectors';
import { useUpdateTutorProfile } from '../../../../hooks/useInstructors';
import {
  contactDetailsSchema,
  type ContactDetailsFormData,
} from '../../../../schemas/userSchemas';
import { useRtlClass } from '../../../../assets/utils/utils';

import './contact-details.styles.scss';

const ContactDetails: FC = () => {
  const { t } = useTranslation();
  const rtlClass = useRtlClass();
  const updateTutorProfileMutation = useUpdateTutorProfile();
  const currentUser = useAppSelector(selectCurrentUser);

  const [editInfoFlag, setEditInfoFlag] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactDetailsFormData>({
    resolver: zodResolver(contactDetailsSchema),
    defaultValues: {
      first_name: currentUser?.first_name || '',
      last_name: currentUser?.last_name || '',
      email: currentUser?.email || '',
      phone_number: currentUser?.phone_number || '',
      country_code: '',
    },
  });

  // Update form when currentUser changes
  useEffect(() => {
    if (currentUser) {
      reset({
        first_name: currentUser.first_name || '',
        last_name: currentUser.last_name || '',
        email: currentUser.email || '',
        phone_number: currentUser.phone_number || '',
        country_code: '',
      });
    }
  }, [currentUser, reset]);

  const toggleInfoFlag = () => setEditInfoFlag((prev) => !prev);
  const cancelInfoEdit = () => {
    setEditInfoFlag(false);
    reset();
  };

  const onSubmit = async (values: ContactDetailsFormData) => {
    try {
      await updateTutorProfileMutation.mutateAsync({
        userData: { tutor: values },
        id: currentUser?.id!,
      });
      cancelInfoEdit();
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  return (
    <div className="contact-details">
      <div className="title-container">
        <h3 className="title container">{t('ACCOUNT_SETTINGS.TITLE')}</h3>
      </div>
      <div className="form-container container">
        <h4 className="sub-title">
          {t('ACCOUNT_SETTINGS.CONTACT_DETAILS_FORM.TITLE')}
        </h4>
        <div className="contact-details__form-container">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className={`contact-details__form ${rtlClass}`}
          >
            <fieldset disabled={!editInfoFlag} className="form-inputs">
              <div className={`form-group ${rtlClass}`}>
                <InputLabel htmlFor="first_name">
                  {t(
                    'ACCOUNT_SETTINGS.CONTACT_DETAILS_FORM.FIRST_NAME_PLACEHOLDER',
                  )}
                </InputLabel>
                <Controller
                  name="first_name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      variant="outlined"
                      placeholder={t(
                        'ACCOUNT_SETTINGS.CONTACT_DETAILS_FORM.FIRST_NAME_PLACEHOLDER',
                      )}
                      className="custom-input-style"
                      disabled={!editInfoFlag}
                      fullWidth
                      error={!!errors.first_name}
                      helperText={errors.first_name?.message}
                    />
                  )}
                />
              </div>
              <div className={`form-group ${rtlClass}`}>
                <InputLabel htmlFor="last_name">
                  {t(
                    'ACCOUNT_SETTINGS.CONTACT_DETAILS_FORM.LAST_NAME_PLACEHOLDER',
                  )}
                </InputLabel>
                <Controller
                  name="last_name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      variant="outlined"
                      placeholder={t(
                        'ACCOUNT_SETTINGS.CONTACT_DETAILS_FORM.LAST_NAME_PLACEHOLDER',
                      )}
                      className="custom-input-style"
                      disabled={!editInfoFlag}
                      fullWidth
                      error={!!errors.last_name}
                      helperText={errors.last_name?.message}
                    />
                  )}
                />
              </div>
              <div className={`form-group ${rtlClass}`}>
                <InputLabel htmlFor="email">
                  {t('ACCOUNT_SETTINGS.CONTACT_DETAILS_FORM.EMAIL_PLACEHOLDER')}
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
                        'ACCOUNT_SETTINGS.CONTACT_DETAILS_FORM.EMAIL_PLACEHOLDER',
                      )}
                      fullWidth
                      className="custom-input-style"
                      disabled={!editInfoFlag}
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />
              </div>
              <div className={`phone-input form-group ${rtlClass}`}>
                <InputLabel htmlFor="phone_number">
                  {t('ACCOUNT_SETTINGS.CONTACT_DETAILS_FORM.PHONE_PLACEHOLDER')}
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
                        setValue('country_code', countryData.countryCode);
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
            </fieldset>
            {editInfoFlag && (
              <div className="form-actions">
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-custom-style"
                >
                  {t('ACCOUNT_SETTINGS.CONTACT_DETAILS_FORM.SUBMIT_BTN')}
                </Button>
                <Button
                  variant="text"
                  onClick={cancelInfoEdit}
                  disabled={isSubmitting}
                  className="cancel-btn"
                >
                  {t('ACCOUNT_SETTINGS.CONTACT_DETAILS_FORM.CANCEL')}
                </Button>
              </div>
            )}
          </form>
          {!editInfoFlag && (
            <Button
              variant="text"
              onClick={toggleInfoFlag}
              className="edit-btn"
            >
              {t('ACCOUNT_SETTINGS.EDIT')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactDetails;
