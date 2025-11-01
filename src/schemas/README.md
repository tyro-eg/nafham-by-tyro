# Form Validation Schemas Documentation

This document provides comprehensive documentation for the **Zod validation schemas** used throughout the application for form validation.

---

## 📂 Directory Overview

```
schemas/
├── authSchemas.ts      # Authentication-related schemas (login, register, password)
├── userSchemas.ts      # User profile and contact schemas
└── sessionSchemas.ts   # Session booking and rating schemas
```

---

## 🎯 Purpose

These schemas provide **runtime type safety** and **form validation** using [Zod](https://zod.dev/). They are used with:

- **react-hook-form**: Form state management
- **@hookform/resolvers**: Zod integration with react-hook-form
- **TanStack Query mutations**: Data validation before API calls

### Benefits:

1. ✅ **Type Safety**: TypeScript types inferred from schemas
2. ✅ **Runtime Validation**: Catches invalid data before submission
3. ✅ **User-Friendly Error Messages**: Internationalized error messages
4. ✅ **DRY Principle**: Single source of truth for validation rules
5. ✅ **IntelliSense Support**: Auto-completion for form data types

---

## 📝 Authentication Schemas (`authSchemas.ts`)

### Login Schema

**Purpose**: Validates user login credentials.

**Fields**:
- `email`: Required, must be valid email format
- `password`: Required, minimum 6 characters

**Usage**:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/schemas/authSchemas';

const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    // data is validated and typed
    console.log(data.email, data.password);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}
      
      <button type="submit">Login</button>
    </form>
  );
};
```

---

### Register Schema

**Purpose**: Validates new user registration data.

**Fields**:
- `first_name`: Required, trimmed string
- `last_name`: Required, trimmed string
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters
- `password_confirmation`: Required, must match password
- `phone_number`: Required, phone number with country code
- `country_code`: Required, ISO country code (e.g., 'AE', 'EG')
- `nationality`: Required, ISO country code for nationality

**Custom Validation**:
- Password and password_confirmation must match

**Usage**:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormData } from '@/schemas/authSchemas';

const RegisterForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      country_code: 'AE',
      nationality: 'AE',
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    // All fields are validated
    signUpMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('first_name')} placeholder="First Name" />
      {errors.first_name && <span>{errors.first_name.message}</span>}
      
      <input {...register('email')} placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}
      
      <input type="password" {...register('password_confirmation')} />
      {errors.password_confirmation && <span>{errors.password_confirmation.message}</span>}
      
      <button type="submit">Register</button>
    </form>
  );
};
```

---

### Reset Password Schema

**Purpose**: Validates password reset request.

**Fields**:
- `email`: Required, valid email format

**Usage**:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, ResetPasswordFormData } from '@/schemas/authSchemas';

const ResetPasswordForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    // Request password reset email
    resetPasswordMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} placeholder="Enter your email" />
      {errors.email && <span>{errors.email.message}</span>}
      
      <button type="submit">Send Reset Link</button>
    </form>
  );
};
```

---

### Change Password Schema

**Purpose**: Validates password change for authenticated users.

**Fields**:
- `current_password`: Required, user's current password
- `new_password`: Required, minimum 6 characters
- `confirm_password`: Required, must match new_password

**Custom Validation**:
- new_password and confirm_password must match

**Usage**:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, ChangePasswordFormData } from '@/schemas/authSchemas';
import { useChangePassword } from '@/hooks/useAuth';

const ChangePasswordForm = () => {
  const changePassword = useChangePassword();
  
  const { register, handleSubmit, formState: { errors } } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    await changePassword.mutateAsync(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="password" {...register('current_password')} />
      {errors.current_password && <span>{errors.current_password.message}</span>}
      
      <input type="password" {...register('new_password')} />
      {errors.new_password && <span>{errors.new_password.message}</span>}
      
      <input type="password" {...register('confirm_password')} />
      {errors.confirm_password && <span>{errors.confirm_password.message}</span>}
      
      <button type="submit">Change Password</button>
    </form>
  );
};
```

---

## 👤 User Schemas (`userSchemas.ts`)

### Contact Details Schema

**Purpose**: Validates user contact information updates.

**Fields**:
- `first_name`: Required, trimmed string
- `last_name`: Required, trimmed string
- `email`: Required, valid email format
- `phone_number`: Required
- `country_code`: Optional, ISO country code

**Used In**:
- Account Settings > Contact Details
- User Profile Edit

**Usage**:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactDetailsSchema, ContactDetailsFormData } from '@/schemas/userSchemas';
import { useAppSelector } from '@/redux/store';
import { selectCurrentUser } from '@/redux/user/user.selectors';

const ContactDetailsForm = () => {
  const currentUser = useAppSelector(selectCurrentUser);
  
  const { register, handleSubmit, formState: { errors } } = useForm<ContactDetailsFormData>({
    resolver: zodResolver(contactDetailsSchema),
    defaultValues: {
      first_name: currentUser?.first_name,
      last_name: currentUser?.last_name,
      email: currentUser?.email,
      phone_number: currentUser?.phone_number,
    },
  });

  const onSubmit = (data: ContactDetailsFormData) => {
    updateContactDetailsMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('first_name')} />
      <input {...register('last_name')} />
      <input {...register('email')} />
      <input {...register('phone_number')} />
      <button type="submit">Update Contact Details</button>
    </form>
  );
};
```

---

### Profile Update Schema

**Purpose**: Validates instructor profile updates.

**Fields**:
- `first_name`: Required, trimmed string
- `last_name`: Required, trimmed string
- `bio`: Optional, instructor bio/description
- `video_url`: Optional, URL to instructor introduction video
- `avatar`: Optional, profile picture file

**Used In**:
- Instructor Profile Edit
- Profile Modal

**Note**: The `avatar` field uses `z.any()` to accommodate File objects from file input fields.

**Usage**:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileUpdateSchema, ProfileUpdateFormData } from '@/schemas/userSchemas';
import { useUpdateTutorProfile } from '@/hooks/useInstructors';

const ProfileUpdateForm = () => {
  const updateProfile = useUpdateTutorProfile();
  
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
  });

  const onSubmit = async (data: ProfileUpdateFormData) => {
    const formData = new FormData();
    formData.append('first_name', data.first_name);
    formData.append('last_name', data.last_name);
    if (data.bio) formData.append('bio', data.bio);
    if (data.video_url) formData.append('video_url', data.video_url);
    if (data.avatar) formData.append('avatar', data.avatar);
    
    await updateProfile.mutateAsync(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('first_name')} />
      <input {...register('last_name')} />
      <textarea {...register('bio')} />
      <input {...register('video_url')} />
      <input type="file" {...register('avatar')} />
      <button type="submit">Update Profile</button>
    </form>
  );
};
```

---

## 📅 Session Schemas (`sessionSchemas.ts`)

### Trial Session Schema

**Purpose**: Validates trial session booking data.

**Fields**:
- `tutor_id`: Required, number or string, tutor ID
- `start_time`: Required, ISO datetime string
- `grade_subject_id`: Required, number or string, subject/grade ID

**Used In**:
- Free Trial Modal
- Calendar Stepper Modal (trial booking)

**Usage**:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { trialSessionSchema, TrialSessionFormData } from '@/schemas/sessionSchemas';
import { useBookTrialSession } from '@/hooks/useSessions';

const TrialBookingForm = ({ tutorId, subjectId }: Props) => {
  const bookTrial = useBookTrialSession();
  
  const { register, handleSubmit, formState: { errors } } = useForm<TrialSessionFormData>({
    resolver: zodResolver(trialSessionSchema),
    defaultValues: {
      tutor_id: tutorId,
      grade_subject_id: subjectId,
    },
  });

  const onSubmit = async (data: TrialSessionFormData) => {
    await bookTrial.mutateAsync(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="datetime-local" {...register('start_time')} />
      {errors.start_time && <span>{errors.start_time.message}</span>}
      
      <button type="submit">Book Trial Session</button>
    </form>
  );
};
```

---

### Private Session Schema

**Purpose**: Validates private session booking data.

**Fields**:
- `tutor_id`: Required, tutor ID
- `start_time`: Required, ISO datetime string
- `grade_subject_id`: Required, subject/grade ID
- `package_id`: Optional, package ID if booking from a package

**Used In**:
- My Session Calendar Modal
- Calendar Stepper Modal (private booking)

**Usage**:

```typescript
import { useBookPrivateSession } from '@/hooks/useSessions';
import { privateSessionSchema, PrivateSessionFormData } from '@/schemas/sessionSchemas';

const BookPrivateSession = () => {
  const bookPrivateSession = useBookPrivateSession();

  const handleBook = async (data: PrivateSessionFormData) => {
    await bookPrivateSession.mutateAsync(data);
  };

  // Direct usage without form (e.g., calendar click)
  const onSlotClick = (slotInfo: any) => {
    const sessionData: PrivateSessionFormData = {
      tutor_id: tutorId,
      start_time: slotInfo.start,
      grade_subject_id: subjectId,
      package_id: selectedPackage?.id,
    };
    
    handleBook(sessionData);
  };
};
```

---

### Student Rate Schema

**Purpose**: Validates student rating for completed sessions.

**Fields**:
- `rate`: Required, 1-5 numeric rating
- `feedback`: Optional, written review

**Used In**:
- Sessions Rate Component (student view)
- Session Details Modal

**Usage**:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentRateSchema, StudentRateFormData } from '@/schemas/sessionSchemas';

const StudentRatingForm = ({ sessionId }: Props) => {
  const { register, handleSubmit, formState: { errors } } = useForm<StudentRateFormData>({
    resolver: zodResolver(studentRateSchema),
    defaultValues: {
      rate: 5,
    },
  });

  const onSubmit = (data: StudentRateFormData) => {
    rateSessionMutation.mutate({ sessionId, ...data });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Rating {...register('rate')} />
      {errors.rate && <span>{errors.rate.message}</span>}
      
      <textarea {...register('feedback')} placeholder="Optional feedback" />
      
      <button type="submit">Submit Rating</button>
    </form>
  );
};
```

---

### Instructor Rate Schemas

Three schemas for instructor session rating/reporting:

#### 1. Base Instructor Rate Schema

Base schema with common fields (not used directly).

**Fields**:
- `startTime`: Session start time
- `endTime`: Session end time
- `attendees`: Array of student IDs
- `notes`: Optional notes

#### 2. Trial Instructor Rate Schema

For rating trial sessions (extends base schema).

**Additional Fields**:
- `languageLevel`: Assessed proficiency level
- `recommendedCourse`: Recommended course
- `learningGoal`: Identified objectives
- `areasOfImprovement`: Areas needing work

#### 3. Progress Report Instructor Rate Schema

For regular session reports (extends base schema).

**Additional Fields**:
- `languageLevel`: Current proficiency
- `previousLanguageLevel`: Previous proficiency
- `learningGoal`: Learning objectives
- `areasOfImprovement`: Areas needing work
- `rating`: 1-5 numeric rating
- `reasonForRating`: Explanation
- `feedback`: Optional feedback

**Usage**:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  trialInstructorRateSchema, 
  TrialInstructorRateFormData 
} from '@/schemas/sessionSchemas';

const TrialSessionRatingForm = ({ session }: Props) => {
  const { register, handleSubmit, formState: { errors } } = useForm<TrialInstructorRateFormData>({
    resolver: zodResolver(trialInstructorRateSchema),
  });

  const onSubmit = (data: TrialInstructorRateFormData) => {
    rateTrialSessionMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('startTime')} type="time" />
      <input {...register('endTime')} type="time" />
      <select {...register('languageLevel')}>
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>
      <textarea {...register('learningGoal')} />
      <textarea {...register('areasOfImprovement')} />
      <button type="submit">Submit Rating</button>
    </form>
  );
};
```

---

## 🎨 Best Practices

### 1. Always Use TypeScript Types

✅ **Good**:
```typescript
import { LoginFormData } from '@/schemas/authSchemas';

const handleLogin = (data: LoginFormData) => {
  // data is fully typed
  console.log(data.email);
};
```

❌ **Bad**:
```typescript
const handleLogin = (data: any) => {
  // No type safety
  console.log(data.email);
};
```

---

### 2. Use Default Values for Better UX

```typescript
const { register, handleSubmit } = useForm<RegisterFormData>({
  resolver: zodResolver(registerSchema),
  defaultValues: {
    country_code: 'AE', // Default to UAE
    nationality: 'AE',
  },
});
```

---

### 3. Display Error Messages

```typescript
{errors.email && (
  <span className="error-message">
    {errors.email.message}
  </span>
)}
```

---

### 4. Handle Async Validation

```typescript
const onSubmit = async (data: LoginFormData) => {
  try {
    await loginMutation.mutateAsync(data);
  } catch (error) {
    // Handle API errors
    setError('email', { 
      message: 'Invalid credentials' 
    });
  }
};
```

---

### 5. Reset Form After Submission

```typescript
const { reset, handleSubmit } = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
});

const onSubmit = async (data: LoginFormData) => {
  await loginMutation.mutateAsync(data);
  reset(); // Clear form
};
```

---

## ⚠️ Known Inconsistencies

### Naming Convention Issues

**Issue**: Mixed use of camelCase and snake_case in field names.

#### In `userSchemas.ts`:
- ❌ `country_code` (snake_case) - used in contactDetailsSchema
- ✅ Most fields use snake_case (`first_name`, `last_name`, etc.)

#### In `sessionSchemas.ts`:
- ❌ `startTime`, `endTime`, `languageLevel`, etc. (camelCase) - used in instructor rate schemas
- ✅ `tutor_id`, `start_time`, `grade_subject_id` (snake_case) - used in booking schemas

**Recommendation**: Standardize all schemas to use snake_case to match API expectations. If the API uses camelCase for instructor ratings, document this explicitly.

---

## 🔄 Schema Extension Pattern

Zod supports schema extension for creating variants:

```typescript
// Base schema
const baseSchema = z.object({
  field1: z.string(),
  field2: z.number(),
});

// Extended schema
const extendedSchema = baseSchema.extend({
  field3: z.boolean(),
});

// Result: { field1: string, field2: number, field3: boolean }
```

**Used In**:
- `trialInstructorRateSchema` extends `baseInstructorRateSchema`
- `progressReportInstructorRateSchema` extends `baseInstructorRateSchema`

---

## 🧪 Testing Schemas

### Unit Testing Schemas:

```typescript
import { loginSchema } from '@/schemas/authSchemas';

describe('loginSchema', () => {
  it('should validate correct login data', () => {
    const validData = {
      email: 'user@example.com',
      password: 'password123',
    };

    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const invalidData = {
      email: 'not-an-email',
      password: 'password123',
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['email']);
    }
  });

  it('should reject short password', () => {
    const invalidData = {
      email: 'user@example.com',
      password: '12345', // Only 5 characters
    };

    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
```

---

## 📚 Related Documentation

- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [TanStack Query Hooks](../hooks/README.md)
- [Authentication Hooks](../hooks/useAuth.ts)

---

## 🔗 External Resources

- [Zod GitHub](https://github.com/colinhacks/zod)
- [React Hook Form + Zod Integration](https://react-hook-form.com/get-started#SchemaValidation)
- [Form Validation Best Practices](https://www.smashingmagazine.com/2022/09/inline-validation-web-forms-ux/)

---

**Last Updated**: October 31, 2025  
**Status**: ✅ Complete - Comprehensive Validation Schemas

