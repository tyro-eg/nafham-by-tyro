import { z } from 'zod';

import i18n from '../component/i18next/i18n';

/**
 * Contact Details Schema
 *
 * Validates user contact information update form data.
 *
 * Fields:
 * - first_name: Required, trimmed string
 * - last_name: Required, trimmed string
 * - email: Required, must be valid email format
 * - phone_number: Required, phone number string
 * - country_code: Optional, ISO country code
 *
 * Used in:
 * - Account Settings > Contact Details
 * - User Profile Edit
 *
 * @example
 * const { register, handleSubmit } = useForm<ContactDetailsFormData>({
 *   resolver: zodResolver(contactDetailsSchema),
 *   defaultValues: {
 *     first_name: currentUser?.first_name,
 *     last_name: currentUser?.last_name,
 *     email: currentUser?.email,
 *     phone_number: currentUser?.phone_number,
 *   },
 * });
 */
export const contactDetailsSchema = z.object({
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
  phone_number: z.string().min(1, { message: i18n.t('GENEREL.REQUIRED') }),
  country_code: z.string().optional(),
});

/**
 * Contact Details Form Data Type
 *
 * Inferred from contactDetailsSchema, represents validated contact details data.
 */
export type ContactDetailsFormData = z.infer<typeof contactDetailsSchema>;

/**
 * Profile Update Schema
 *
 * Validates instructor profile update form data.
 *
 * Fields:
 * - first_name: Required, trimmed string
 * - last_name: Required, trimmed string
 * - bio: Optional, instructor bio/description
 * - video_url: Optional, URL to instructor introduction video
 * - avatar: Optional, profile picture file (any type for file upload)
 *
 * Used in:
 * - Instructor Profile Edit
 * - Profile Modal
 *
 * Note: The `avatar` field uses `z.any()` to accommodate File objects
 * from file input fields. Consider using a more specific type if possible.
 *
 * @example
 * const { register, handleSubmit } = useForm<ProfileUpdateFormData>({
 *   resolver: zodResolver(profileUpdateSchema),
 *   defaultValues: {
 *     first_name: instructor?.first_name,
 *     last_name: instructor?.last_name,
 *     bio: instructor?.bio,
 *     video_url: instructor?.video_url,
 *   },
 * });
 */
export const profileUpdateSchema = z.object({
  first_name: z
    .string()
    .min(1, { message: i18n.t('GENEREL.REQUIRED') })
    .trim(),
  last_name: z
    .string()
    .min(1, { message: i18n.t('GENEREL.REQUIRED') })
    .trim(),
  bio: z.string().optional(),
  video_url: z.string().optional(),
  avatar: z.any().optional(), // File upload field
});

/**
 * Profile Update Form Data Type
 *
 * Inferred from profileUpdateSchema, represents validated profile update data.
 */
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
