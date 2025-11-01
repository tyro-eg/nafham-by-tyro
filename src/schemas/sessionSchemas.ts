import { z } from 'zod';

import i18n from '../component/i18next/i18n';

/**
 * Trial Session Booking Schema
 *
 * Validates trial session booking form data.
 *
 * Fields:
 * - tutor_id: Required, number or string, ID of the selected tutor
 * - start_time: Required, ISO datetime string for session start
 * - grade_subject_id: Required, number or string, ID of subject/grade combination
 *
 * Used in:
 * - Free Trial Modal
 * - Calendar Stepper Modal (for trial booking)
 *
 * @example
 * const { register, handleSubmit } = useForm<TrialSessionFormData>({
 *   resolver: zodResolver(trialSessionSchema),
 *   defaultValues: {
 *     tutor_id: selectedTutor.id,
 *     grade_subject_id: selectedSubject.id,
 *   },
 * });
 */
export const trialSessionSchema = z.object({
  tutor_id: z.number().or(z.string()),
  start_time: z.string().min(1, { message: i18n.t('GENEREL.REQUIRED') }),
  grade_subject_id: z.number().or(z.string()),
});

/**
 * Trial Session Form Data Type
 *
 * Inferred from trialSessionSchema, represents validated trial session booking data.
 */
export type TrialSessionFormData = z.infer<typeof trialSessionSchema>;

/**
 * Private Session Booking Schema
 *
 * Validates private session booking form data.
 *
 * Fields:
 * - tutor_id: Required, number or string, ID of the selected tutor
 * - start_time: Required, ISO datetime string for session start
 * - grade_subject_id: Required, number or string, ID of subject/grade combination
 * - package_id: Optional, number or string, ID of package if booking from a package
 *
 * Used in:
 * - My Session Calendar Modal
 * - Calendar Stepper Modal (for private session booking)
 *
 * @example
 * const bookPrivateSession = useBookPrivateSession();
 *
 * const handleBook = async (data: PrivateSessionFormData) => {
 *   await bookPrivateSession.mutateAsync(data);
 * };
 */
export const privateSessionSchema = z.object({
  tutor_id: z.number().or(z.string()),
  start_time: z.string().min(1, { message: i18n.t('GENEREL.REQUIRED') }),
  grade_subject_id: z.number().or(z.string()),
  package_id: z.number().or(z.string()).optional(),
});

/**
 * Private Session Form Data Type
 *
 * Inferred from privateSessionSchema, represents validated private session booking data.
 */
export type PrivateSessionFormData = z.infer<typeof privateSessionSchema>;

/**
 * Base Instructor Rate Schema
 *
 * Base schema for instructor session rating/reporting forms.
 * Contains common fields used by both trial and progress report ratings.
 *
 * Fields:
 * - startTime: Required, session start time string
 * - endTime: Required, session end time string
 * - attendees: Required, array of student IDs who attended
 * - notes: Optional, additional notes about the session
 *
 * Note: This schema uses camelCase field names (startTime, endTime) which may
 * differ from API expectations. Consider standardizing to snake_case if needed.
 *
 * Extended by:
 * - trialInstructorRateSchema
 * - progressReportInstructorRateSchema
 */
export const baseInstructorRateSchema = z.object({
  startTime: z.string().min(1, { message: i18n.t('GENEREL.REQUIRED') }),
  endTime: z.string().min(1, { message: i18n.t('GENEREL.REQUIRED') }),
  attendees: z.array(z.number()),
  notes: z.string().optional(),
});

/**
 * Base Instructor Rate Form Data Type
 *
 * Inferred from baseInstructorRateSchema, represents common rating form fields.
 */
export type BaseInstructorRateFormData = z.infer<
  typeof baseInstructorRateSchema
>;

/**
 * Trial Session Instructor Rate Schema
 *
 * Validates instructor rating/assessment form for trial sessions.
 * Extends baseInstructorRateSchema with trial-specific fields.
 *
 * Additional Fields:
 * - languageLevel: Required, assessed language proficiency level
 * - recommendedCourse: Required, recommended course for the student
 * - learningGoal: Required, identified learning objectives
 * - areasOfImprovement: Required, areas where student needs improvement
 *
 * Used in:
 * - Sessions Rate Component (for trial sessions)
 * - Instructor Dashboard (trial session reports)
 *
 * @example
 * const { register, handleSubmit } = useForm<TrialInstructorRateFormData>({
 *   resolver: zodResolver(trialInstructorRateSchema),
 * });
 */
export const trialInstructorRateSchema = baseInstructorRateSchema.extend({
  languageLevel: z.string().min(1, { message: i18n.t('GENEREL.REQUIRED') }),
  recommendedCourse: z.string().min(1, { message: i18n.t('GENEREL.REQUIRED') }),
  learningGoal: z.string().min(1, { message: i18n.t('GENEREL.REQUIRED') }),
  areasOfImprovement: z
    .string()
    .min(1, { message: i18n.t('GENEREL.REQUIRED') }),
});

/**
 * Trial Instructor Rate Form Data Type
 *
 * Inferred from trialInstructorRateSchema, represents validated trial session rating data.
 */
export type TrialInstructorRateFormData = z.infer<
  typeof trialInstructorRateSchema
>;

/**
 * Progress Report Instructor Rate Schema
 *
 * Validates instructor progress report form for regular sessions.
 * Extends baseInstructorRateSchema with progress tracking fields.
 *
 * Additional Fields:
 * - languageLevel: Required, current language proficiency level
 * - previousLanguageLevel: Required, previous language proficiency level
 * - learningGoal: Required, learning objectives for this period
 * - areasOfImprovement: Required, areas where student needs improvement
 * - rating: Required, numeric rating from 1 to 5
 * - reasonForRating: Required, explanation for the rating given
 * - feedback: Optional, additional feedback for the student
 *
 * Used in:
 * - Sessions Rate Component (for regular sessions)
 * - Instructor Dashboard (progress reports)
 *
 * @example
 * const { register, handleSubmit } = useForm<ProgressReportInstructorRateFormData>({
 *   resolver: zodResolver(progressReportInstructorRateSchema),
 * });
 */
export const progressReportInstructorRateSchema =
  baseInstructorRateSchema.extend({
    languageLevel: z.string().min(1, { message: i18n.t('GENEREL.REQUIRED') }),
    previousLanguageLevel: z
      .string()
      .min(1, { message: i18n.t('GENEREL.REQUIRED') }),
    learningGoal: z.string().min(1, { message: i18n.t('GENEREL.REQUIRED') }),
    areasOfImprovement: z
      .string()
      .min(1, { message: i18n.t('GENEREL.REQUIRED') }),
    rating: z.number().min(1).max(5),
    reasonForRating: z.string().min(1, { message: i18n.t('GENEREL.REQUIRED') }),
    feedback: z.string().optional(),
  });

/**
 * Progress Report Instructor Rate Form Data Type
 *
 * Inferred from progressReportInstructorRateSchema, represents validated progress report data.
 */
export type ProgressReportInstructorRateFormData = z.infer<
  typeof progressReportInstructorRateSchema
>;

/**
 * Student Rate Schema
 *
 * Validates student rating form for completed sessions.
 *
 * Fields:
 * - rate: Required, numeric rating from 1 to 5 stars
 * - feedback: Optional, written feedback/review from student
 *
 * Used in:
 * - Sessions Rate Component (student view)
 * - Session Details Modal
 *
 * @example
 * const { register, handleSubmit } = useForm<StudentRateFormData>({
 *   resolver: zodResolver(studentRateSchema),
 *   defaultValues: {
 *     rate: 5,
 *   },
 * });
 */
export const studentRateSchema = z.object({
  rate: z
    .number()
    .min(1, { message: i18n.t('GENEREL.REQUIRED') })
    .max(5),
  feedback: z.string().optional(),
});

/**
 * Student Rate Form Data Type
 *
 * Inferred from studentRateSchema, represents validated student rating data.
 */
export type StudentRateFormData = z.infer<typeof studentRateSchema>;
