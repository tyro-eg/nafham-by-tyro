import React, { useEffect, useState } from 'react';
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
import { Formik, Form, Field, FieldArray } from 'formik';
import { format, parseISO } from 'date-fns';
import * as Yup from 'yup';

import { rtlClass } from '../../../../../assets/utils/utils';
import './sessions-instructor-rate.styles.scss';
import { InstructorRateData } from '../sessions-rate-card.component';

interface SessionsInstructorRateProps {
  instructorData: InstructorRateData;
  onClose: () => void;
}

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
  const [instructorRateSchema, setInstructorRateSchema] = useState<any>();
  const [instructorRateValues, setInstructorRateValues] = useState<any>();

  useEffect(() => {
    if (isSessionTrial) {
      setInstructorRateSchema(
        Yup.object().shape({
          startTime: Yup.string().required(),
          endTime: Yup.string().required(),
          attendees: Yup.array(),
          languageLevel: Yup.string().required(),
          recommendedCourse: Yup.string().required(),
          learningGoal: Yup.string().required(),
          areasOfImprovement: Yup.string().required(),
          notes: Yup.string(),
        }),
      );
      setInstructorRateValues({
        startTime: format(parseISO(instructorData?.startTime!), 'HH:mm'),
        endTime: format(parseISO(instructorData?.endTime!), 'HH:mm'),
        attendees: [],
        languageLevel: '',
        recommendedCourse: '',
        learningGoal: '',
        areasOfImprovement: '',
        notes: '',
      });
    } else if (isProgressReport) {
      setInstructorRateSchema(
        Yup.object().shape({
          startTime: Yup.string().required(),
          endTime: Yup.string().required(),
          attendees: Yup.array(),
          languageLevel: Yup.string().required(),
          previousLanguageLevel: Yup.string().required(),
          learningGoal: Yup.string().required(),
          areasOfImprovement: Yup.string().required(),
          rating: Yup.number().required(),
          reasonForRating: Yup.string().required(),
          feedback: Yup.string(),
          notes: Yup.string(),
        }),
      );
      setInstructorRateValues({
        startTime: format(parseISO(instructorData?.startTime!), 'HH:mm'),
        endTime: format(parseISO(instructorData?.endTime!), 'HH:mm'),
        attendees: [],
        languageLevel: '',
        previousLanguageLevel: '',
        learningGoal: '',
        areasOfImprovement: '',
        rating: 1,
        reasonForRating: '',
        feedback: '',
        notes: '',
      });
    } else {
      setInstructorRateSchema(
        Yup.object().shape({
          startTime: Yup.string().required(),
          endTime: Yup.string().required(),
          attendees: Yup.array(),
          notes: Yup.string(),
        }),
      );
      setInstructorRateValues({
        startTime: format(parseISO(instructorData?.startTime!), 'HH:mm'),
        endTime: format(parseISO(instructorData?.endTime!), 'HH:mm'),
        attendees: [],
        notes: '',
      });
    }
  }, [instructorData, isSessionTrial, isProgressReport]);

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
      {instructorRateValues && instructorRateSchema && (
        <Formik
          initialValues={instructorRateValues}
          validationSchema={instructorRateSchema}
          onSubmit={(values) => {
            values.rating = Number(values.rating);
          }}
        >
          {({
            values,
            handleChange,
            handleBlur,
            submitForm,
            isValid,
            dirty,
          }) => (
            <Form>
              <div className="instructorRateModal__time">
                <Field
                  as={TextField}
                  name="startTime"
                  type="time"
                  label={t('MYSESSIONS.RATE.FEEDBACK.START')}
                  variant="standard"
                  id="startTime"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  className="time-field"
                />
                <Field
                  as={TextField}
                  name="endTime"
                  type="time"
                  label={t('MYSESSIONS.RATE.FEEDBACK.END')}
                  variant="standard"
                  id="endTime"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  className="time-field"
                />
              </div>
              <div className="instructorRateModal__attended-students">
                <h4 className="u-color-title u-font-size-14 u-font-weight-bold">
                  {t('MYSESSIONS.RATE.FEEDBACK.WHOATTENDED')}
                </h4>
                <FieldArray
                  name="attendees"
                  render={(arrayHelpers) => (
                    <div className="instructorRateModal__attended-students-checkboxes">
                      {instructorData.students?.map((student) => (
                        <FormControlLabel
                          key={student.id}
                          control={
                            <Checkbox
                              name="attendees"
                              value={student.id}
                              checked={values.attendees.includes(student.id)}
                              color="primary"
                              onChange={(e: any) => {
                                if (e.target.checked)
                                  arrayHelpers.push(student.id);
                                else {
                                  const idx = values.attendees.indexOf(
                                    student.id,
                                  );
                                  arrayHelpers.remove(idx);
                                }
                              }}
                            />
                          }
                          label={student.student_full_name}
                        />
                      ))}
                    </div>
                  )}
                />
              </div>

              <hr className="u-full-width" />

              {(isProgressReport || isSessionTrial) && (
                <div className="instructorRateModal__instructor-feedback">
                  <div className="select-container">
                    <FormControl className="select-input">
                      <InputLabel htmlFor="lang-level">
                        Student Language level
                      </InputLabel>
                      <Field
                        as={Select}
                        variant="standard"
                        name="languageLevel"
                        inputProps={{
                          id: 'lang-level',
                        }}
                      >
                        {langLevels.map((lang) => (
                          <MenuItem key={lang.id} value={lang.id}>
                            {lang.display}
                          </MenuItem>
                        ))}
                      </Field>
                    </FormControl>
                    {isProgressReport && (
                      <FormControl className="select-input">
                        <InputLabel htmlFor="prev-lang-level">
                          Previous Language level
                        </InputLabel>
                        <Field
                          as={Select}
                          variant="standard"
                          name="previousLanguageLevel"
                          inputProps={{
                            id: 'prev-lang-level',
                          }}
                        >
                          {langLevels.map((lang) => (
                            <MenuItem key={lang.id} value={lang.id}>
                              {lang.display}
                            </MenuItem>
                          ))}
                        </Field>
                      </FormControl>
                    )}
                    {isSessionTrial && (
                      <FormControl className="select-input">
                        <InputLabel htmlFor="recommended-course">
                          Recommended Course
                        </InputLabel>
                        <Field
                          as={Select}
                          variant="standard"
                          name="recommendedCourse"
                          inputProps={{
                            id: 'recommended-course',
                          }}
                        >
                          {recoCourses.map((course) => (
                            <MenuItem key={course.id} value={course.id}>
                              {course.name}
                            </MenuItem>
                          ))}
                        </Field>
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
                      <Rating
                        className="rating-icon"
                        name="rating"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={Number(values.rating)}
                        icon={<StarRounded fontSize="inherit" />}
                      />
                      <textarea
                        name="reasonForRating"
                        placeholder={t(
                          'MYSESSIONS.RATE.FEEDBACK.RATEDESCRIPTION',
                        )}
                        rows={5}
                        id="instructor-feedback-1"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.reasonForRating}
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
                    <textarea
                      name="learningGoal"
                      placeholder={
                        isProgressReport
                          ? t('MYSESSIONS.RATE.FEEDBACK.GOALDESCRIPTION')
                          : t('MYSESSIONS.RATE.FEEDBACK.GOAL')
                      }
                      rows={5}
                      id="instructor-feedback-2"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.learningGoal}
                    />
                  </div>
                  <div className="textarea-container">
                    <label
                      htmlFor="instructor-feedback-3"
                      className="u-color-title u-font-size-14 u-font-weight-500"
                    >
                      {isProgressReport
                        ? t(
                            'MYSESSIONS.RATE.FEEDBACK.AREAOFIMPROVEMENTDESCRIPTION',
                          )
                        : t('MYSESSIONS.RATE.FEEDBACK.AREAOFIMPROVEMENT')}
                    </label>
                    <textarea
                      name="areasOfImprovement"
                      placeholder={
                        isProgressReport
                          ? t(
                              'MYSESSIONS.RATE.FEEDBACK.AREAOFIMPROVEMENTDESCRIPTION',
                            )
                          : t('MYSESSIONS.RATE.FEEDBACK.AREAOFIMPROVEMENT')
                      }
                      rows={5}
                      id="instructor-feedback-3"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.areasOfImprovement}
                    />
                  </div>
                  <div className="textarea-container">
                    <label
                      htmlFor="instructor-feedback-4"
                      className="u-color-title u-font-size-14 u-font-weight-500"
                    >
                      {t('MYSESSIONS.RATE.FEEDBACK.NOTES')}
                    </label>
                    <textarea
                      name="notes"
                      placeholder={t('MYSESSIONS.RATE.FEEDBACK.NOTES')}
                      rows={5}
                      id="instructor-feedback-4"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.notes}
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
                  disabled={!isValid || !dirty}
                  onClick={submitForm}
                  variant="contained"
                  color="primary"
                  className="submit-btn"
                >
                  {t('MYSESSIONS.RATE.FEEDBACK.SUBMIT')}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      )}
    </section>
  );
};

export default SessionsInstructorRate;
