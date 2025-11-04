import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import Rating from '@mui/material/Rating';
import StarRounded from '@mui/icons-material/StarRounded';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { rtlClass } from '../../../../../assets/utils/utils';
import './sessions-student-rate.component.scss';
import {
  studentRateSchema,
  type StudentRateFormData,
} from '../../../../../schemas/sessionSchemas';

interface SessionsStudentRateProps {
  onClose: () => void;
}

const SessionsStudentRate: React.FC<SessionsStudentRateProps> = ({
  onClose,
}) => {
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    formState: { isValid, isDirty },
  } = useForm<StudentRateFormData>({
    resolver: zodResolver(studentRateSchema),
    defaultValues: {
      rate: 0,
      feedback: '',
    },
    mode: 'onChange',
  });

  const onSubmit = (values: StudentRateFormData) => {
    values.rate = Number(values.rate);
    // TODO: Implement student rating submission API call
    // Handle submit logic here
  };

  return (
    <section className="studentRateModal">
      <div className="studentRateModal__head u-center-text">
        <h3 className="u-color-title u-font-size-24 u-font-weight-bold">
          {t('MYSESSIONS.RATE.FEEDBACK.STUDENTTITLE')}
        </h3>
        <p className="u-color-body u-font-size-14">
          {t('MYSESSIONS.RATE.FEEDBACK.SUBTITLE')}
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="studentRateModal__textarea">
          <Controller
            name="rate"
            control={control}
            render={({ field }) => (
              <Rating
                {...field}
                value={Number(field.value)}
                onChange={(_, value) => field.onChange(value)}
                icon={<StarRounded fontSize="inherit" />}
              />
            )}
          />
          <p className="u-color-title">
            {t('MYSESSIONS.RATE.FEEDBACK.EXPERIENCE')}
          </p>
          <Controller
            name="feedback"
            control={control}
            render={({ field }) => <textarea {...field} rows={6} />}
          />
        </div>
        <div className="studentRateModal__actions-container">
          <Button
            type="button"
            variant="outlined"
            color="error"
            onClick={onClose}
            className={rtlClass()}
          >
            {t('MYSESSIONS.RATE.FEEDBACK.CANCEL')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!isDirty || (!!isDirty && !isValid)}
          >
            {t('MYSESSIONS.RATE.FEEDBACK.SUBMIT')}
          </Button>
        </div>
      </form>
    </section>
  );
};

export default SessionsStudentRate;
