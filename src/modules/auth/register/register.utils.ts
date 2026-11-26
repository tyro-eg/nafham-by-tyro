import type { QuickRegisterFormData } from '../../../schemas/authSchemas';

/**
 * What the short sign-up form sends. The server still wants a few things
 * the form no longer asks for, so they are filled in from what was typed:
 * - the password confirmation is the password (it is typed once, visibly);
 * - the nationality starts as the phone's country, as the old form's
 *   default did; it can be changed in the profile;
 * - a parent's first child takes the parent's last name.
 */
export const signUpBody = (
  values: QuickRegisterFormData,
  role: 'Student' | 'Parent',
  childFirstName: string,
) => {
  const digits = values.phone_number.replace(/[^\d+]/g, '');
  const country = values.country_code.toUpperCase();
  return {
    first_name: values.first_name.trim(),
    last_name: values.last_name.trim(),
    email: values.email.trim(),
    password: values.password,
    password_confirmation: values.password,
    phone_number: digits.startsWith('+') ? digits : `+${digits}`,
    country_code: country,
    nationality: country,
    type: role,
    ...(role === 'Parent'
      ? {
          child: {
            first_name: childFirstName.trim(),
            last_name: values.last_name.trim(),
          },
        }
      : {}),
  };
};
