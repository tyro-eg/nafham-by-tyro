import { ChangeEvent, FC, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDays, format, setHours, setMinutes } from 'date-fns';
import {
  Alert,
  Button,
  Chip,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import {
  AddRounded,
  AssignmentRounded,
  AttachFileRounded,
  Close,
  DeleteOutlineRounded,
} from '@mui/icons-material';

import { useTutorStudents } from '../../hooks/useTutorStudents';
import {
  assignmentErrorMessage,
  useCreateAssignment,
  useCreateRubric,
  useRubrics,
} from '../../hooks/useAssignments';
import { snackActions } from '../../assets/utils/toaster';
import {
  assignHomeworkSchema,
  type AssignHomeworkFormData,
} from '../../schemas/assignmentSchemas';

import './assign-homework-modal.styles.scss';

interface AssignHomeworkModalProps {
  handleClose: () => void;
}

const NONE = '';
const NEW_RUBRIC = 'new';
const DEFAULT_DUE_DAYS = 7;
const DEFAULT_DUE_HOUR = 18;

/** `datetime-local` value for 18:00 local time, a week from now */
const defaultDueAt = () =>
  format(
    setMinutes(
      setHours(addDays(new Date(), DEFAULT_DUE_DAYS), DEFAULT_DUE_HOUR),
      0,
    ),
    "yyyy-MM-dd'T'HH:mm",
  );

const emptyCriterion = () => ({ name: '', description: '', max_points: '10' });

/**
 * Tutor form to assign homework to one of their students: student and
 * course from the tutor's packages, title, instructions, due date, an
 * optional rubric (existing or created inline) and file attachments.
 */
const AssignHomeworkModal: FC<AssignHomeworkModalProps> = ({ handleClose }) => {
  const { t } = useTranslation();
  const createAssignment = useCreateAssignment();
  const createRubric = useCreateRubric();
  const {
    students,
    coursesFor,
    isLoading: packagesLoading,
  } = useTutorStudents();
  const { data: rubricsData } = useRubrics();

  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AssignHomeworkFormData>({
    resolver: zodResolver(assignHomeworkSchema),
    defaultValues: {
      student_id: NONE,
      grade_subject_id: NONE,
      title: '',
      instructions: '',
      due_at: defaultDueAt(),
      rubric_id: NONE,
      new_rubric: { title: '', criteria: [emptyCriterion()] },
    },
  });

  const criteria = useFieldArray({ control, name: 'new_rubric.criteria' });

  const studentId = watch('student_id');
  const courseId = watch('grade_subject_id');
  const rubricId = watch('rubric_id');
  const creatingRubric = rubricId === NEW_RUBRIC;

  /** Courses the chosen student has a package for */
  const courses = useMemo(() => coursesFor(studentId), [coursesFor, studentId]);

  // Auto-fill the course when the student has only one; drop a stale pick
  useEffect(() => {
    if (courseId && !courses.some((c) => String(c.id) === courseId)) {
      setValue('grade_subject_id', NONE);
    } else if (!courseId && courses.length === 1) {
      setValue('grade_subject_id', String(courses[0].id), {
        shouldValidate: false,
      });
    }
  }, [courseId, courses, setValue]);

  const rubrics = rubricsData?.data ?? [];

  const addFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []);
    if (picked.length) setFiles((prev) => [...prev, ...picked]);
    // Let the same file be picked again after removing it
    event.target.value = '';
  };

  const removeFile = (index: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== index));

  const onSubmit = async (data: AssignHomeworkFormData) => {
    setError(null);

    let rubricIdToSend: number | null = null;
    if (data.rubric_id === NEW_RUBRIC && data.new_rubric) {
      try {
        const rubric = await createRubric.mutateAsync({
          title: data.new_rubric.title.trim(),
          criteria: data.new_rubric.criteria.map((c) => ({
            name: c.name.trim(),
            description: c.description?.trim() || undefined,
            max_points: Number(c.max_points),
          })),
        });
        rubricIdToSend = rubric.id;
      } catch (err) {
        setError(assignmentErrorMessage(err, t('HOMEWORK.FORM.RUBRIC_ERROR')));
        return;
      }
    } else if (data.rubric_id) {
      rubricIdToSend = Number(data.rubric_id);
    }

    try {
      await createAssignment.mutateAsync({
        title: data.title.trim(),
        instructions: data.instructions?.trim(),
        due_at: new Date(data.due_at).toISOString(),
        student_id: Number(data.student_id),
        grade_subject_id: Number(data.grade_subject_id),
        rubric_id: rubricIdToSend,
        attachments: files,
      });
      snackActions.success(t('HOMEWORK.FORM.SUCCESS'));
      handleClose();
    } catch (err) {
      setError(assignmentErrorMessage(err, t('HOMEWORK.FORM.ERROR')));
    }
  };

  const busy =
    isSubmitting || createAssignment.isPending || createRubric.isPending;
  const noStudents = !packagesLoading && students.length === 0;

  return (
    <form
      className="assign-homework-modal"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <header className="assign-homework-modal__header">
        <div className="assign-homework-modal__icon">
          <AssignmentRounded />
        </div>
        <div className="assign-homework-modal__heading">
          <h4
            className="assign-homework-modal__title"
            id="assign-homework-title"
          >
            {t('HOMEWORK.FORM.TITLE')}
          </h4>
          <p className="assign-homework-modal__subtitle">
            {t('HOMEWORK.FORM.SUBTITLE')}
          </p>
        </div>
        <IconButton
          aria-label={t('HOMEWORK.FORM.CANCEL')}
          className="assign-homework-modal__close"
          onClick={handleClose}
        >
          <Close />
        </IconButton>
      </header>

      <div className="assign-homework-modal__body">
        {noStudents && (
          <Alert severity="info">{t('HOMEWORK.FORM.NO_STUDENTS')}</Alert>
        )}

        <div className="assign-homework-modal__row">
          <Controller
            name="student_id"
            control={control}
            render={({ field }) => (
              <FormControl
                className="assign-homework-modal__field"
                size="small"
                error={!!errors.student_id}
              >
                <InputLabel id="assign-student-label">
                  {t('HOMEWORK.FORM.STUDENT')}
                </InputLabel>
                <Select
                  {...field}
                  labelId="assign-student-label"
                  label={t('HOMEWORK.FORM.STUDENT')}
                  disabled={packagesLoading}
                >
                  {students.map((student) => (
                    <MenuItem key={student.id} value={String(student.id)}>
                      {student.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.student_id && (
                  <FormHelperText>{errors.student_id.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />

          <Controller
            name="grade_subject_id"
            control={control}
            render={({ field }) => (
              <FormControl
                className="assign-homework-modal__field"
                size="small"
                error={!!errors.grade_subject_id}
              >
                <InputLabel id="assign-course-label">
                  {t('HOMEWORK.FORM.COURSE')}
                </InputLabel>
                <Select
                  {...field}
                  labelId="assign-course-label"
                  label={t('HOMEWORK.FORM.COURSE')}
                  disabled={!studentId || courses.length === 0}
                >
                  {courses.map((course) => (
                    <MenuItem key={course.id} value={String(course.id)}>
                      {course.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.grade_subject_id && (
                  <FormHelperText>
                    {errors.grade_subject_id.message}
                  </FormHelperText>
                )}
              </FormControl>
            )}
          />
        </div>

        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              className="assign-homework-modal__field"
              size="small"
              label={t('HOMEWORK.FORM.TITLE_FIELD')}
              placeholder={t('HOMEWORK.FORM.TITLE_PLACEHOLDER')}
              error={!!errors.title}
              helperText={errors.title?.message}
              inputProps={{ maxLength: 200, dir: 'auto' }}
            />
          )}
        />

        <Controller
          name="instructions"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              className="assign-homework-modal__field"
              size="small"
              multiline
              minRows={3}
              label={t('HOMEWORK.FORM.INSTRUCTIONS')}
              placeholder={t('HOMEWORK.FORM.INSTRUCTIONS_PLACEHOLDER')}
              error={!!errors.instructions}
              helperText={errors.instructions?.message}
              inputProps={{ maxLength: 5000, dir: 'auto' }}
            />
          )}
        />

        <div className="assign-homework-modal__row">
          <Controller
            name="due_at"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                className="assign-homework-modal__field"
                size="small"
                type="datetime-local"
                label={t('HOMEWORK.FORM.DUE_AT')}
                error={!!errors.due_at}
                helperText={errors.due_at?.message}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            )}
          />

          <Controller
            name="rubric_id"
            control={control}
            render={({ field }) => (
              <FormControl
                className="assign-homework-modal__field"
                size="small"
              >
                <InputLabel id="assign-rubric-label">
                  {t('HOMEWORK.FORM.RUBRIC')}
                </InputLabel>
                <Select
                  {...field}
                  labelId="assign-rubric-label"
                  label={t('HOMEWORK.FORM.RUBRIC')}
                >
                  <MenuItem value={NONE}>
                    {t('HOMEWORK.FORM.NO_RUBRIC')}
                  </MenuItem>
                  {rubrics.map((rubric) => (
                    <MenuItem key={rubric.id} value={String(rubric.id)}>
                      {rubric.title}
                      {rubric.shared && (
                        <span className="assign-homework-modal__shared">
                          {t('HOMEWORK.FORM.SHARED_RUBRIC')}
                        </span>
                      )}
                    </MenuItem>
                  ))}
                  <MenuItem value={NEW_RUBRIC}>
                    {t('HOMEWORK.FORM.NEW_RUBRIC')}
                  </MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </div>

        {!creatingRubric && (
          <button
            type="button"
            className="assign-homework-modal__link"
            onClick={() => setValue('rubric_id', NEW_RUBRIC)}
          >
            <AddRounded />
            {t('HOMEWORK.FORM.CREATE_RUBRIC')}
          </button>
        )}

        {creatingRubric && (
          <fieldset className="assign-homework-modal__rubric">
            <legend>{t('HOMEWORK.FORM.NEW_RUBRIC')}</legend>

            <Controller
              name="new_rubric.title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  className="assign-homework-modal__field"
                  size="small"
                  label={t('HOMEWORK.FORM.RUBRIC_TITLE')}
                  error={!!errors.new_rubric?.title}
                  helperText={errors.new_rubric?.title?.message}
                  inputProps={{ maxLength: 120, dir: 'auto' }}
                />
              )}
            />

            {criteria.fields.map((row, index) => {
              const rowErrors = errors.new_rubric?.criteria?.[index];
              return (
                <div key={row.id} className="assign-homework-modal__criterion">
                  <Controller
                    name={`new_rubric.criteria.${index}.name`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        className="assign-homework-modal__criterion-name"
                        label={t('HOMEWORK.FORM.CRITERION_NAME')}
                        error={!!rowErrors?.name}
                        helperText={rowErrors?.name?.message}
                        inputProps={{ maxLength: 120, dir: 'auto' }}
                      />
                    )}
                  />
                  <Controller
                    name={`new_rubric.criteria.${index}.max_points`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        type="number"
                        className="assign-homework-modal__criterion-points"
                        label={t('HOMEWORK.FORM.CRITERION_POINTS')}
                        error={!!rowErrors?.max_points}
                        helperText={rowErrors?.max_points?.message}
                        inputProps={{ min: 1, max: 1000, step: 1 }}
                      />
                    )}
                  />
                  <IconButton
                    className="assign-homework-modal__criterion-remove"
                    aria-label={t('HOMEWORK.FORM.REMOVE_CRITERION')}
                    disabled={criteria.fields.length === 1}
                    onClick={() => criteria.remove(index)}
                  >
                    <DeleteOutlineRounded />
                  </IconButton>
                  <Controller
                    name={`new_rubric.criteria.${index}.description`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        className="assign-homework-modal__criterion-description"
                        label={t('HOMEWORK.FORM.CRITERION_DESCRIPTION')}
                        inputProps={{ maxLength: 500, dir: 'auto' }}
                      />
                    )}
                  />
                </div>
              );
            })}

            {typeof errors.new_rubric?.criteria?.message === 'string' && (
              <FormHelperText error>
                {errors.new_rubric.criteria.message}
              </FormHelperText>
            )}

            <div className="assign-homework-modal__rubric-actions">
              <Button
                size="small"
                startIcon={<AddRounded />}
                onClick={() => criteria.append(emptyCriterion())}
              >
                {t('HOMEWORK.FORM.ADD_CRITERION')}
              </Button>
              <Button
                size="small"
                color="inherit"
                onClick={() => setValue('rubric_id', NONE)}
              >
                {t('HOMEWORK.FORM.CANCEL_RUBRIC')}
              </Button>
            </div>
          </fieldset>
        )}

        <div className="assign-homework-modal__files">
          <span className="assign-homework-modal__label">
            {t('HOMEWORK.FORM.ATTACHMENTS')}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={addFiles}
          />
          <div className="assign-homework-modal__file-list">
            {files.map((file, index) => (
              <Chip
                key={`${file.name}-${index}`}
                label={file.name}
                size="small"
                onDelete={() => removeFile(index)}
                deleteIcon={
                  <Close aria-label={t('HOMEWORK.FORM.REMOVE_FILE')} />
                }
              />
            ))}
            <Button
              size="small"
              variant="outlined"
              startIcon={<AttachFileRounded />}
              onClick={() => fileInputRef.current?.click()}
            >
              {t('HOMEWORK.FORM.ADD_FILES')}
            </Button>
          </div>
        </div>

        {error && <Alert severity="error">{error}</Alert>}
      </div>

      <footer className="assign-homework-modal__footer">
        <Button variant="outlined" onClick={handleClose} disabled={busy}>
          {t('HOMEWORK.FORM.CANCEL')}
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={busy || noStudents}
        >
          {t('HOMEWORK.FORM.SUBMIT')}
        </Button>
      </footer>
    </form>
  );
};

export default AssignHomeworkModal;
