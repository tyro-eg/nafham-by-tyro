import { z } from 'zod';

import i18n from '../component/i18next/i18n';

/**
 * Login Schema
 *
 * Validates user login form data with email and password.
 *
 * Fields:
 * - email: Required, must be valid email format
 * - password: Required, minimum 6 characters
 *
 * @example
 * const { register, handleSubmit } = useForm<LoginFormData>({
 *   resolver: zodResolver(loginSchema),
 * });
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: i18n.t('GENEREL.REQUIRED') })
    .email({ message: i18n.t('GENEREL.INVALID_EMAIL') }),
  password: z
    .string()
    .min(1, { message: i18n.t('GENEREL.REQUIRED') })
    .min(6, { message: i18n.t('GENEREL.PASSWORD_MIN_LENGTH') }),
});

/**
 * Login Form Data Type
 *
 * Inferred from loginSchema, represents validated login form data.
 */
export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Register Schema
 *
 * Validates new user registration form data.
 *
 * Fields:
 * - first_name: Required, trimmed string
 * - last_name: Required, trimmed string
 * - email: Required, must be valid email format
 * - password: Required, minimum 6 characters
 * - password_confirmation: Required, must match password
 * - phone_number: Required, phone number with country code
 * - country_code: Required, ISO country code (e.g., 'AE', 'EG')
 * - nationality: Required, ISO country code for nationality
 *
 * Custom Validation:
 * - Ensures password and password_confirmation match
 *
 * @example
 * const { register, handleSubmit } = useForm<RegisterFormData>({
 *   resolver: zodResolver(registerSchema),
 *   defaultValues: {
 *     country_code: 'AE',
 *     nationality: 'AE',
 *   },
 * });
 */
export const registerSchema = z
  .object({
    first_name: z
      .string()
      .min(1, { message: i18n.t('GENEREL.REQUIRED') })
      .trim(),
    last_name: z
      .string()
      .min(1, { message: i18n.t('GENEREL.REQUIRED') })
      .trim(),
    email: z
      .string()
      .min(1, { message: i18n.t('GENEREL.REQUIRED') })
      .email({ message: i18n.t('GENEREL.INVALID_EMAIL') }),
    password: z
      .string()
      .min(1, { message: i18n.t('GENEREL.REQUIRED') })
      .min(6, { message: i18n.t('GENEREL.PASSWORD_MIN_LENGTH') }),
    password_confirmation: z
      .string()
      .min(1, { message: i18n.t('GENEREL.REQUIRED') }),
    phone_number: z.string().min(1, { message: i18n.t('GENEREL.REQUIRED') }),
    country_code: z.string().min(1, { message: i18n.t('GENEREL.REQUIRED') }),
    nationality: z.string().min(1, { message: i18n.t('GENEREL.REQUIRED') }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: i18n.t('GENEREL.PASSWORD_MISMATCH'),
    path: ['password_confirmation'],
  });

/**
 * Register Form Data Type
 *
 * Inferred from registerSchema, represents validated registration form data.
 */
export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Reset Password Schema
 *
 * Validates password reset request form data.
 *
 * Fields:
 * - email: Required, must be valid email format
 *
 * Used to request a password reset link via email.
 *
 * @example
 * const { register, handleSubmit } = useForm<ResetPasswordFormData>({
 *   resolver: zodResolver(resetPasswordSchema),
 * });
 */
export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: i18n.t('GENEREL.REQUIRED') })
    .email({ message: i18n.t('GENEREL.INVALID_EMAIL') }),
});

/**
 * Reset Password Form Data Type
 *
 * Inferred from resetPasswordSchema, represents validated reset password request data.
 */
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * Change Password Schema
 *
 * Validates password change form data for authenticated users.
 *
 * Fields:
 * - current_password: Required, user's current password for verification
 * - new_password: Required, minimum 6 characters
 * - confirm_password: Required, must match new_password
 *
 * Custom Validation:
 * - Ensures new_password and confirm_password match
 *
 * @example
 * const { register, handleSubmit } = useForm<ChangePasswordFormData>({
 *   resolver: zodResolver(changePasswordSchema),
 * });
 */
export const changePasswordSchema = z
  .object({
    current_password: z
      .string()
      .min(1, { message: i18n.t('GENEREL.REQUIRED') }),
    new_password: z
      .string()
      .min(1, { message: i18n.t('GENEREL.REQUIRED') })
      .min(6, { message: i18n.t('GENEREL.PASSWORD_MIN_LENGTH') }),
    confirm_password: z
      .string()
      .min(1, { message: i18n.t('GENEREL.REQUIRED') }),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: i18n.t('GENEREL.PASSWORD_MISMATCH'),
    path: ['confirm_password'],
  });

/**
 * Change Password Form Data Type
 *
 * Inferred from changePasswordSchema, represents validated password change data.
 */
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
