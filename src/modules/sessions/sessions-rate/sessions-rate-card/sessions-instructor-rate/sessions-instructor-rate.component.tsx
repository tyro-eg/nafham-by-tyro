import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  FormControl,
  MenuItem,
  InputLabel,
  TextField,
  Checkbox,
  Select,
  FormControlLabel,
} from '@mui/material';
import Rating from '@mui/material/Rating';
import StarRounded from '@mui/icons-material/StarRounded';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, parseISO } from 'date-fns';

import { rtlClass } from '../../../../../assets/utils/utils';
import './sessions-instructor-rate.styles.scss';
import { InstructorRateData } from '../sessions-rate-card.component';
import {
  baseInstructorRateSchema,
  trialInstructorRateSchema,
  progressReportInstructorRateSchema,
  type BaseInstructorRateFormData,
  type TrialInstructorRateFormData,
  type ProgressReportInstructorRateFormData,
} from '../../../../../schemas/sessionSchemas';

interface SessionsInstructorRateProps {
  instructorData: InstructorRateData;
  onClose: () => void;
}

type InstructorRateFormData =
  | BaseInstructorRateFormData
  | TrialInstructorRateFormData
  | ProgressReportInstructorRateFormData;

const SessionsInstructorRate = ({
  instructorData,
  instructorData: { isProgressReport, isSessionTrial },
  onClose,
}: SessionsInstructorRateProps) => {
  const langLevels = [
    { id: 0, display: 'A1' },
    { id: 1, display: 'A2' },
    { id: 2, display: 'B1' },
  ];
  const recoCourses = [
    { id: 64, name: 'General English' },
    { id: 65, name: 'Conversation English' },
    { id: 70, name: 'General English Course October Cycle' },
    { id: 85, name: 'Test march Course' },
  ];
  const { t } = useTranslation();

  const { schema, defaultValues } = useMemo(() => {
    const baseValues = {
      startTime: format(parseISO(instructorData?.startTime!), 'HH:mm'),
      endTime: format(parseISO(instructorData?.endTime!), 'HH:mm'),
      attendees: [] as number[],
      notes: '',
    };

    if (isSessionTrial) {
      return {
        schema: trialInstructorRateSchema,
        defaultValues: {
          ...baseValues,
          languageLevel: '',
          recommendedCourse: '',
          learningGoal: '',
          areasOfImprovement: '',
        },
      };
    } else if (isProgressReport) {
      return {
        schema: progressReportInstructorRateSchema,
        defaultValues: {
          ...baseValues,
          languageLevel: '',
          previousLanguageLevel: '',
          learningGoal: '',
          areasOfImprovement: '',
          rating: 1,
          reasonForRating: '',
          feedback: '',
        },
      };
    } else {
      return {
        schema: baseInstructorRateSchema,
        defaultValues: baseValues,
      };
    }
  }, [instructorData, isSessionTrial, isProgressReport]);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<InstructorRateFormData>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange',
  });

  const {
    fields: _attendeesField, // Prefixed with underscore as it's required by useFieldArray but not used directly
    append,
    remove,
  } = useFieldArray<any>({
    control: control as any,
    name: 'attendees',
  });

  const watchAttendees = watch('attendees');

  const onSubmit = (values: InstructorRateFormData) => {
    if ('rating' in values) {
      values.rating = Number(values.rating);
    }
    // TODO: Implement instructor rating submission API call
    // Handle submit logic here
  };

  return (
    <section className="instructorRateModal">
      <div className="instructorRateModal__head u-center-text">
        <h3 className="u-color-title u-font-size-24 u-font-weight-bold">
          {t('MYSESSIONS.RATE.FEEDBACK.TITLE')}
        </h3>
        <p className="u-color-body u-font-size-14">
          {t('MYSESSIONS.RATE.FEEDBACK.SUBTITLE')}
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="instructorRateModal__time">
          <Controller
            name="startTime"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="time"
                label={t('MYSESSIONS.RATE.FEEDBACK.START')}
                variant="standard"
                id="startTime"
                InputLabelProps={{
                  shrink: true,
                }}
                className="time-field"
                error={!!errors.startTime}
                helperText={errors.startTime?.message}
              />
            )}
          />
          <Controller
            name="endTime"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="time"
                label={t('MYSESSIONS.RATE.FEEDBACK.END')}
                variant="standard"
                id="endTime"
                InputLabelProps={{
                  shrink: true,
                }}
                className="time-field"
                error={!!errors.endTime}
                helperText={errors.endTime?.message}
              />
            )}
          />
        </div>
        <div className="instructorRateModal__attended-students">
          <h4 className="u-color-title u-font-size-14 u-font-weight-bold">
            {t('MYSESSIONS.RATE.FEEDBACK.WHOATTENDED')}
          </h4>
          <div className="instructorRateModal__attended-students-checkboxes">
            {instructorData.students?.map((student) => (
              <FormControlLabel
                key={student.id}
                control={
                  <Checkbox
                    checked={watchAttendees?.includes(student.id) || false}
                    color="primary"
                    onChange={(e) => {
                      const currentAttendees = watchAttendees || [];
                      if (e.target.checked) {
                        append(student.id);
                      } else {
                        const idx = currentAttendees.indexOf(student.id);
                        if (idx > -1) remove(idx);
                      }
                    }}
                  />
                }
                label={student.student_full_name}
              />
            ))}
          </div>
        </div>

        <hr className="u-full-width" />

        {(isProgressReport || isSessionTrial) && (
          <div className="instructorRateModal__instructor-feedback">
            <div className="select-container">
              <FormControl className="select-input">
                <InputLabel htmlFor="lang-level">
                  Student Language level
                </InputLabel>
                <Controller
                  name="languageLevel"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      variant="standard"
                      inputProps={{
                        id: 'lang-level',
                      }}
                      error={!!(errors as any).languageLevel}
                    >
                      {langLevels.map((lang) => (
                        <MenuItem key={lang.id} value={lang.id}>
                          {lang.display}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
              {isProgressReport && (
                <FormControl className="select-input">
                  <InputLabel htmlFor="prev-lang-level">
                    Previous Language level
                  </InputLabel>
                  <Controller
                    name="previousLanguageLevel"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        variant="standard"
                        inputProps={{
                          id: 'prev-lang-level',
                        }}
                        error={!!(errors as any).previousLanguageLevel}
                      >
                        {langLevels.map((lang) => (
                          <MenuItem key={lang.id} value={lang.id}>
                            {lang.display}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormControl>
              )}
              {isSessionTrial && (
                <FormControl className="select-input">
                  <InputLabel htmlFor="recommended-course">
                    Recommended Course
                  </InputLabel>
                  <Controller
                    name="recommendedCourse"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        variant="standard"
                        inputProps={{
                          id: 'recommended-course',
                        }}
                        error={!!(errors as any).recommendedCourse}
                      >
                        {recoCourses.map((course) => (
                          <MenuItem key={course.id} value={course.id}>
                            {course.name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormControl>
              )}
            </div>

            {isProgressReport && (
              <div className="rating-container">
                <label
                  htmlFor="instructor-feedback-1"
                  className="u-color-title u-font-size-14 u-font-weight-500"
                >
                  {t('MYSESSIONS.RATE.FEEDBACK.RATEDESCRIPTION')}
                </label>
                <Controller
                  name="rating"
                  control={control}
                  render={({ field }) => (
                    <Rating
                      {...field}
                      className="rating-icon"
                      value={Number(field.value)}
                      onChange={(_, value) => field.onChange(value)}
                      icon={<StarRounded fontSize="inherit" />}
                    />
                  )}
                />
                <Controller
                  name="reasonForRating"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      placeholder={t(
                        'MYSESSIONS.RATE.FEEDBACK.RATEDESCRIPTION',
                      )}
                      rows={5}
                      id="instructor-feedback-1"
                    />
                  )}
                />
              </div>
            )}
            <div className="textarea-container">
              <label
                htmlFor="instructor-feedback-2"
                className="u-color-title u-font-size-14 u-font-weight-500"
              >
                {isProgressReport
                  ? t('MYSESSIONS.RATE.FEEDBACK.GOALDESCRIPTION')
                  : t('MYSESSIONS.RATE.FEEDBACK.GOAL')}
              </label>
              <Controller
                name="learningGoal"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    placeholder={
                      isProgressReport
                        ? t('MYSESSIONS.RATE.FEEDBACK.GOALDESCRIPTION')
                        : t('MYSESSIONS.RATE.FEEDBACK.GOAL')
                    }
                    rows={5}
                    id="instructor-feedback-2"
                  />
                )}
              />
            </div>
            <div className="textarea-container">
              <label
                htmlFor="instructor-feedback-3"
                className="u-color-title u-font-size-14 u-font-weight-500"
              >
                {isProgressReport
                  ? t('MYSESSIONS.RATE.FEEDBACK.AREAOFIMPROVEMENTDESCRIPTION')
                  : t('MYSESSIONS.RATE.FEEDBACK.AREAOFIMPROVEMENT')}
              </label>
              <Controller
                name="areasOfImprovement"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    placeholder={
                      isProgressReport
                        ? t(
                            'MYSESSIONS.RATE.FEEDBACK.AREAOFIMPROVEMENTDESCRIPTION',
                          )
                        : t('MYSESSIONS.RATE.FEEDBACK.AREAOFIMPROVEMENT')
                    }
                    rows={5}
                    id="instructor-feedback-3"
                  />
                )}
              />
            </div>
            <div className="textarea-container">
              <label
                htmlFor="instructor-feedback-4"
                className="u-color-title u-font-size-14 u-font-weight-500"
              >
                {t('MYSESSIONS.RATE.FEEDBACK.NOTES')}
              </label>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    placeholder={t('MYSESSIONS.RATE.FEEDBACK.NOTES')}
                    rows={5}
                    id="instructor-feedback-4"
                  />
                )}
              />
            </div>
          </div>
        )}

        <div className="studentRateModal__actions-container">
          <Button
            onClick={onClose}
            variant="outlined"
            color="error"
            className={`cancel-btn ${rtlClass()}`}
          >
            {t('MYSESSIONS.RATE.FEEDBACK.CANCEL')}
          </Button>
          <Button
            disabled={!isValid || !isDirty}
            type="submit"
            variant="contained"
            color="primary"
            className="submit-btn"
          >
            {t('MYSESSIONS.RATE.FEEDBACK.SUBMIT')}
          </Button>
        </div>
      </form>
    </section>
  );
};

export default SessionsInstructorRate;
