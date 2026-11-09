import { z } from 'zod';

import i18n from '../component/i18next/i18n';

const required = () => i18n.t('GENEREL.REQUIRED');

/**
 * Rubric Criterion Schema
 *
 * One row of the inline "create rubric" mini-form.
 *
 * Fields:
 * - name: Required
 * - description: Optional
 * - max_points: Required, whole number from 1 to 1000 (typed as a string
 *   because it comes from a text input; converted on submit)
 */
export const rubricCriterionSchema = z.object({
  name: z.string().trim().min(1, { message: required() }),
  description: z.string().trim().optional(),
  max_points: z
    .string()
    .trim()
    .min(1, { message: required() })
    .refine((v) => /^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 1000, {
      message: i18n.t('HOMEWORK.FORM.POINTS_RANGE'),
    }),
});

/**
 * New Rubric Schema
 *
 * Validates the inline rubric form: a title plus at least one criterion.
 */
export const newRubricSchema = z.object({
  title: z.string().trim().min(1, { message: required() }),
  criteria: z
    .array(rubricCriterionSchema)
    .min(1, { message: i18n.t('HOMEWORK.FORM.CRITERIA_MIN') }),
});

export type NewRubricFormData = z.infer<typeof newRubricSchema>;

/**
 * Assign Homework Schema
 *
 * Validates the "Assign homework" modal.
 *
 * Fields:
 * - student_id: Required, the student's id as a select value
 * - grade_subject_id: Required, the course id as a select value
 * - title: Required, max 200 characters
 * - instructions: Optional, max 5000 characters
 * - due_at: Required, `datetime-local` value that must be in the future
 * - rubric_id: Optional select value; '' means none, 'new' means the inline
 *   form is used and `new_rubric` must validate
 * - new_rubric: The inline rubric form, only validated when rubric_id is 'new'
 *
 * Attachments live outside the form state (File objects in local state).
 *
 * @example
 * const { control, handleSubmit } = useForm<AssignHomeworkFormData>({
 *   resolver: zodResolver(assignHomeworkSchema),
 * });
 */
export const assignHomeworkSchema = z
  .object({
    student_id: z.string().min(1, { message: required() }),
    grade_subject_id: z.string().min(1, { message: required() }),
    title: z
      .string()
      .trim()
      .min(1, { message: required() })
      .max(200, { message: i18n.t('HOMEWORK.FORM.TITLE_MAX') }),
    instructions: z
      .string()
      .trim()
      .max(5000, { message: i18n.t('HOMEWORK.FORM.INSTRUCTIONS_MAX') })
      .optional(),
    due_at: z
      .string()
      .min(1, { message: required() })
      .refine((v) => !Number.isNaN(new Date(v).getTime()), {
        message: i18n.t('HOMEWORK.FORM.DUE_INVALID'),
      })
      .refine((v) => new Date(v).getTime() > Date.now(), {
        message: i18n.t('HOMEWORK.FORM.DUE_PAST'),
      }),
    rubric_id: z.string(),
    // Loose here; checked strictly below only when a rubric is being created
    new_rubric: z
      .object({
        title: z.string(),
        criteria: z.array(
          z.object({
            name: z.string(),
            description: z.string().optional(),
            max_points: z.string(),
          }),
        ),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.rubric_id !== 'new') return;
    const result = newRubricSchema.safeParse(data.new_rubric);
    if (result.success) return;
    result.error.issues.forEach((issue) =>
      ctx.addIssue({ ...issue, path: ['new_rubric', ...issue.path] }),
    );
  });

export type AssignHomeworkFormData = z.infer<typeof assignHomeworkSchema>;
