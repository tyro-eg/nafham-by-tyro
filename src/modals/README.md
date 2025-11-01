# Modals Directory

## Purpose

This directory contains all modal (dialog/popup) components used throughout the application. Modals provide focused interactions for user actions like authentication, bookings, confirmations, and profile editing.

## Architecture Overview

### Modal Types

1. **Authentication Modals** - Login, registration, password reset
2. **Booking Modals** - Trial booking, private session scheduling
3. **Success/Confirmation Modals** - Success messages after actions
4. **Profile Edit Modals** - Image/video profile editing
5. **Calendar Modals** - Session scheduling and viewing
6. **Info Modals** - Instructor listings, session details

### Consistent Patterns

All modals in this directory follow these patterns:

- Use `FC` from React (not `React.FC`)
- Use `useRtlClass()` hook for RTL support
- Use `useTranslation()` for i18n
- Props include `onClose` or `handleClose` for closing logic
- Material-UI components for UI elements
- SCSS files for styling (no inline styles)

---

## Modal Components

### Authentication Modals

#### `/login-modal`

**Purpose**: Handle user login with email and password.

**Features**:

- Email and password fields with validation
- Form validation using `react-hook-form` + Zod schema
- Forgot password link (opens Reset Password Modal)
- Link to registration modal
- Terms and conditions link
- Automatic navigation on successful login
- Integration with TanStack Query (`useSignIn` hook)

**Props**:

```typescript
interface LoginModalProps {
  onClose: () => void;
  openRegisterModal: () => void;
  openJoinCourseModal?: () => void;
  modalData: {
    courseItem?: any;
    fromCheckout?: boolean;
  };
}
```

**Usage**:

```tsx
<Dialog open={isLoginOpen} onClose={handleCloseLogin}>
  <LoginModal
    onClose={handleCloseLogin}
    openRegisterModal={handleOpenRegister}
    modalData={{ fromCheckout: false }}
  />
</Dialog>
```

**Dependencies**:

- `useSignIn` hook from `@/hooks/useAuth`
- `loginSchema` from `@/schemas/authSchemas`
- Redux: `selectCurrentUser`, `useAppSelector`

---

#### `/register-modal`

**Purpose**: Handle new user registration.

**Features**:

- Email, phone number, and password fields
- Auto-extraction of first name from email
- Auto-detection of country/nationality from phone input
- Password confirmation auto-sync
- Form validation using `react-hook-form` + Zod schema
- Link to login modal
- Terms and conditions link
- Success modal on completion
- Integration with TanStack Query (`useSignUp` hook)

**Props**:

```typescript
interface RegisterModalProps {
  onClose: () => void;
  openLoginModal: () => void;
  openJoinCourseModal?: () => void;
  modalData: {
    courseItem?: any;
    fromCheckout?: boolean;
  };
}
```

**Usage**:

```tsx
<Dialog open={isRegisterOpen} onClose={handleCloseRegister}>
  <RegisterModal
    onClose={handleCloseRegister}
    openLoginModal={handleOpenLogin}
    modalData={{ fromCheckout: false }}
  />
</Dialog>
```

**Dependencies**:

- `useSignUp` hook from `@/hooks/useAuth`
- `registerSchema` from `@/schemas/authSchemas`
- `PhoneInput` from `react-phone-input-2`
- Redux: `selectCurrentUser`, `useAppSelector`

**Default Values**:

- `country_code`: 'AE'
- `nationality`: 'AE'
- `first_name`: Extracted from email
- `last_name`: 'Student'

---

#### `/reset-password`

**Purpose**: Request password reset via email.

**Features**:

- Email input for password reset
- Form validation using `react-hook-form` + Zod schema
- TODO: Implement API call for password reset

**Props**:

```typescript
interface ResetPasswordModalProps {
  handleClose: () => void;
}
```

**Usage**:

```tsx
<Dialog open={isResetPasswordOpen} onClose={handleClose}>
  <ResetPasswordModal handleClose={handleClose} />
</Dialog>
```

**Dependencies**:

- `resetPasswordSchema` from `@/schemas/authSchemas`

**Note**: Currently a placeholder - password reset API call needs implementation.

---

### Booking Modals

#### `/calendar-stepper-modal`

**Purpose**: Multi-step wizard for booking free trial sessions.

**Features**:

- Step 1: Select subject/field
- Step 2: Schedule session (choose time slot)
- FullCalendar integration with time slot visualization
- Warning for already booked slots
- Opens register/login modal if user not authenticated
- Success modal after booking
- Supports trial booking from instructor profile or trail modal

**Props**:

```typescript
interface CalendarStepperModalProps {
  handleClose: () => void;
  instructor: Instructor;
  fromTrailModal?: boolean;
}
```

**Usage**:

```tsx
<Dialog open={isStepperOpen} onClose={handleClose}>
  <CalendarStepperModal
    handleClose={handleClose}
    instructor={selectedInstructor}
    fromTrailModal={false}
  />
</Dialog>
```

**Sub-Component**: `/calendar-stepper-modal/stepper-calendar`

- FullCalendar with custom buttons
- RTL support
- Time zone display
- Slot selection with visual feedback
- Color-coded availability legend

**Dependencies**:

- `useSlots` hook from `@/hooks/useCalendar`
- `@fullcalendar/react` and related plugins
- Material-UI `Stepper` components

---

#### `/mysession-calendar`

**Purpose**: Schedule or reschedule private sessions.

**Features**:

- FullCalendar integration
- Select multiple consecutive time slots
- Group slots into session chunks
- Display unscheduled hours
- Warning for reserved slots
- Color-coded slot status (available, reserved, busy)
- Schedule or reschedule modes
- Integration with TanStack Query (`useBookPrivateSession` hook)

**Props**:

```typescript
interface MySessionCalendarProps {
  rescheduleFlag?: boolean;
  handleClose: () => void;
  unscheduledHours: number;
}
```

**Usage**:

```tsx
<Dialog open={isCalendarOpen} onClose={handleClose}>
  <MySessionCalendar
    handleClose={handleClose}
    unscheduledHours={10}
    rescheduleFlag={false}
  />
</Dialog>
```

**Dependencies**:

- `useBookPrivateSession` hook from `@/hooks/useSessions`
- `useInstructors` hook from `@/hooks/useInstructors`
- `parseTimeSlotsIntoCalendarEvents` utility
- FullCalendar library

**Key Logic**:

- `separateEvents()` - Groups consecutive slots by level
- `scheduleNow()` - Books grouped slots as private sessions
- `rescheduleNow()` - TODO: Implement rescheduling logic

---

#### `/free-trail-modal`

**Purpose**: Display list of available instructors for free trial.

**Features**:

- Displays up to 6 instructors
- Uses `TrailModalCard` component for each instructor
- Integration with TanStack Query (`useInstructors` hook)

**Props**: None (no props)

**Usage**:

```tsx
<Dialog open={isFreeTrialOpen} onClose={handleClose}>
  <FreeTrailModal />
</Dialog>
```

**Dependencies**:

- `useInstructors` hook from `@/hooks/useInstructors`
- `TrailModalCard` component

---

### Success/Confirmation Modals

#### `/trial-session-success-modal`

**Purpose**: Confirmation message after booking a trial session.

**Features**:

- Success image
- Confirmation message
- Navigate to "My Sessions" button

**Props**:

```typescript
interface TrialSessionSuccessModalProps {
  onClose: () => void;
}
```

**Usage**:

```tsx
<Dialog open={isSuccessOpen} onClose={handleClose}>
  <TrialSessionSuccessModal onClose={handleClose} />
</Dialog>
```

**Styling**: Uses SCSS classes (no inline styles)

---

#### `/trial-booking-success-modal`

**Purpose**: Confirmation message after trial booking completion.

**Features**:

- Success GIF animation
- Confirmation message
- OK button to close

**Props**:

```typescript
interface TrialBookingSuccessModalProps {
  handleClose: () => void;
}
```

**Usage**:

```tsx
<Dialog open={isSuccessOpen} onClose={handleClose}>
  <TrialBookingSuccessModal handleClose={handleClose} />
</Dialog>
```

---

#### `/complete-register-success-modal`

**Purpose**: Confirmation message after successful registration.

**Features**:

- Success image
- Welcome message
- Close button

**Props**:

```typescript
interface CompleteRegisterSuccessModalProps {
  onClose: () => void;
}
```

**Usage**:

```tsx
<Dialog open={isSuccessOpen} onClose={handleClose}>
  <CompleteRegisterSuccessModal onClose={handleClose} />
</Dialog>
```

---

#### `/cancel-session-modal`

**Purpose**: Confirm cancellation or ending of a session.

**Features**:

- Warning icon
- Confirmation message
- Yes/No buttons
- Integration with TanStack Query (`useCancelSession`, `useEndSession` hooks)
- Supports both "cancel" and "end" actions

**Props**:

```typescript
interface CancelSessionModalProps {
  type: 'cancel' | 'end';
  sessionId: number;
  handleClose: () => void;
}
```

**Usage**:

```tsx
<Dialog open={isCancelOpen} onClose={handleClose}>
  <CancelSessionModal type="cancel" sessionId={123} handleClose={handleClose} />
</Dialog>
```

**Dependencies**:

- `useCancelSession` and `useEndSession` hooks from `@/hooks/useSessions`

---

#### `/email-confirmation-modal`

**Purpose**: Confirm resending of confirmation email.

**Features**:

- Displays email address
- Cancel and Send buttons
- TODO: Implement email resend API call

**Props**:

```typescript
interface EmailConfirmationModalProps {
  email: string;
  onClose: () => void;
}
```

**Usage**:

```tsx
<Dialog open={isConfirmOpen} onClose={handleClose}>
  <EmailConfirmationModal email="user@example.com" onClose={handleClose} />
</Dialog>
```

**Note**: Currently a placeholder - email confirmation resend API call needs implementation.

**Translations Needed**:

- `EMAIL_CONFIRMATION.MESSAGE`
- `EMAIL_CONFIRMATION.SEND`

---

### Profile Edit Modals

#### `/edit-profile-image`

**Purpose**: Edit and crop profile image.

**Features**:

- Image upload
- Circular crop with `react-image-crop`
- Live preview
- Saves as WebP format
- High-quality image smoothing

**Props**:

```typescript
interface EditProfileImageModalProps {
  onClose: () => void;
  imageUrl: string | null | undefined;
  onSetProfileInfo: (imageData: string, type: string, value?: File) => void;
}
```

**Usage**:

```tsx
<EditProfileImageModal
  onClose={handleClose}
  imageUrl={currentUser.avatar}
  onSetProfileInfo={handleSaveImage}
/>
```

**Dependencies**:

- `react-image-crop` library

**Key Features**:

- Circular crop with aspect ratio 1:1
- Default crop size: 200x200 pixels
- Exports as WebP for optimal file size
- Provides both base64 string and File object

---

#### `/edit-profile-video`

**Purpose**: Edit profile video URL.

**Features**:

- Textarea for video URL input
- Save and cancel buttons

**Props**:

```typescript
interface EditProfileVideoModalProps {
  onClose: () => void;
  dataUrl: string | null | undefined;
  onSetProfileInfo: (videoUrl: string, type: string) => void;
}
```

**Usage**:

```tsx
<EditProfileVideoModal
  onClose={handleClose}
  dataUrl={currentUser.videoUrl}
  onSetProfileInfo={handleSaveVideo}
/>
```

---

### Calendar/Session Modals

#### `/session-view-calendar-modal`

**Purpose**: View all sessions for a specific date.

**Features**:

- Displays sessions sorted by date and status
- Shows session date in header
- Uses `SessionListCard` component for each session
- "Open" status sessions appear first

**Props**:

```typescript
interface SessionViewCalendarModalProps {
  sessions: SessionType[];
  handleClose: () => void;
}
```

**Usage**:

```tsx
<Dialog open={isViewOpen} onClose={handleClose}>
  <SessionViewCalendarModal
    sessions={selectedDateSessions}
    handleClose={handleClose}
  />
</Dialog>
```

**Dependencies**:

- `SessionListCard` component
- `date-fns` for date formatting

---

#### `/profile-modal`

**Purpose**: Modal shown after user tries to book when already having sessions.

**Features**:

- Information message
- Navigate to "My Sessions" button
- Navigate to "Checkout" button

**Props**:

```typescript
interface ProfileModalProps {
  instructorId: string;
}
```

**Usage**:

```tsx
<Dialog open={isProfileModalOpen} onClose={handleClose}>
  <ProfileModal instructorId="123" />
</Dialog>
```

---

## Folder Structure

```
src/modals/
├── calendar-stepper-modal/
│   ├── calendar-stepper-modal.tsx
│   ├── calendar-stepper-modal.styles.scss
│   └── stepper-calendar/
│       ├── stepper-calendar.component.tsx
│       └── stepper-calendar.styles.scss
├── cancel-session-modal/
│   ├── cancel-session-modal.component.tsx
│   └── cancel-session-modal.styles.scss
├── complete-register-success-modal/
│   ├── complete-register-success-modal.component.tsx
│   └── complete-register-success-modal.styles.scss
├── edit-profile-image/
│   └── edit-profile-image.modal.tsx
├── edit-profile-video/
│   └── edit-profile-video.modal.tsx
├── email-confirmation-modal/
│   ├── email-confirmation-modal.component.tsx
│   └── email-confirmation-modal.styles.scss
├── free-trail-modal/
│   ├── free-trail-modal.component.tsx
│   └── free-trail-modal.styles.scss
├── login-modal/
│   ├── login-modal.component.tsx
│   └── login-modal.styles.scss
├── mysession-calendar/
│   ├── mysession-calendar.component.tsx
│   └── mysession-calendar.styles.scss
├── profile-modal/
│   ├── profile-modal.component.tsx
│   └── profile-modal.styles.scss
├── register-modal/
│   ├── register-modal.component.tsx
│   └── register-modal.styles.scss
├── reset-password/
│   ├── reset-password-modal.component.tsx
│   └── reset-password-modal.styles.scss
├── session-view-calendar-modal/
│   ├── session-view-calendar-modal.component.tsx
│   └── session-view-calendar-modal.styles.scss
├── trial-booking-success-modal/
│   ├── trial-booking-success-modal.component.tsx
│   └── trial-booking-success-modal.styles.scss
├── trial-session-success-modal/
│   ├── trial-session-success-modal.component.tsx
│   └── trial-session-success-modal.styles.scss
└── README.md
```

---

## Naming Conventions

### File Naming

- Most files use `.component.tsx` suffix
- Some older files use `.modal.tsx` suffix (legacy, but functional)
- Each modal has its own folder
- SCSS files match the component name

### Component Naming

- Use `FC` (Functional Component) from React
- Props interface named `{ComponentName}Props`
- Export default at the end of file

**Example**:

```tsx
import { FC } from 'react';

interface MyModalProps {
  onClose: () => void;
  // ... other props
}

const MyModal: FC<MyModalProps> = ({ onClose }) => {
  // ... component logic
  return (/* ... */);
};

export default MyModal;
```

---

## Common Patterns

### RTL Support

All modals with directional UI use `useRtlClass()` hook:

```tsx
import { useRtlClass } from '../../assets/utils/utils';

const MyModal: FC<MyModalProps> = () => {
  const rtlClass = useRtlClass();

  return <div className={`my-modal ${rtlClass}`}>{/* Content */}</div>;
};
```

### Translation (i18n)

All text is internationalized using `useTranslation`:

```tsx
import { useTranslation } from 'react-i18next';

const MyModal: FC<MyModalProps> = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('MY_MODAL.TITLE')}</h1>
      <p>{t('MY_MODAL.DESCRIPTION')}</p>
    </div>
  );
};
```

### Form Validation

Forms use `react-hook-form` + `@hookform/resolvers/zod`:

```tsx
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { mySchema, type MyFormData } from '../../schemas/mySchemas';

const MyModal: FC<MyModalProps> = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MyFormData>({
    resolver: zodResolver(mySchema),
    defaultValues: {
      /* ... */
    },
  });

  const onSubmit = async (values: MyFormData) => {
    // Handle submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="fieldName"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            error={!!errors.fieldName}
            helperText={errors.fieldName?.message}
          />
        )}
      />
    </form>
  );
};
```

### Data Fetching

Use TanStack Query hooks from `@/hooks`:

```tsx
import { useInstructors } from '../../hooks/useInstructors';
import { useBookTrialSession } from '../../hooks/useSessions';

const MyModal: FC<MyModalProps> = () => {
  // Fetch data
  const { data, isLoading } = useInstructors(1, 10);

  // Mutations
  const bookTrialMutation = useBookTrialSession();

  const handleBook = async () => {
    await bookTrialMutation.mutateAsync(bookingData);
  };

  return (/* ... */);
};
```

### Calendar Integration

Modals with FullCalendar use this pattern:

```tsx
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import arLocale from '@fullcalendar/core/locales/ar-kw';

const MyCalendarModal: FC<MyCalendarModalProps> = () => {
  const { i18n } = useTranslation();
  const [events, setEvents] = useState([]);

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      events={events}
      locale={i18n.language === 'ar' ? arLocale : undefined}
      direction={i18n.dir()}
      // ... other props
    />
  );
};
```

---

## Best Practices

### 1. **Prop Naming**

- Use `onClose` or `handleClose` consistently
- Prefix boolean props with `is` or `has`
- Use descriptive names for data props

### 2. **Error Handling**

```tsx
const onSubmit = async (values: FormData) => {
  try {
    await mutation.mutateAsync(values);
    onClose();
  } catch (error) {
    console.error('Error:', error);
    // Error is handled by TanStack Query and shown via snackbar
  }
};
```

### 3. **Loading States**

Use `isSubmitting` from `react-hook-form` or mutation states:

```tsx
<Button type="submit" disabled={isSubmitting || mutation.isLoading}>
  {t('SUBMIT')}
</Button>
```

### 4. **Accessibility**

```tsx
<Dialog
  open={isOpen}
  onClose={handleClose}
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">{t('TITLE')}</h2>
  <p id="modal-description">{t('DESCRIPTION')}</p>
</Dialog>
```

### 5. **Responsive Design**

```tsx
<Dialog maxWidth="sm" fullWidth open={isOpen} onClose={handleClose}>
  {/* Content */}
</Dialog>
```

### 6. **Cleanup**

Use `useEffect` cleanup for timers and subscriptions:

```tsx
useEffect(() => {
  const timeout = setTimeout(() => {
    // Do something
  }, 5000);

  return () => clearTimeout(timeout);
}, []);
```

---

## Common Issues and Solutions

### Issue 1: Modal Not Closing After Action

**Solution**: Ensure `onClose()` is called after successful mutation:

```tsx
await mutation.mutateAsync(data);
onClose(); // Don't forget this!
```

### Issue 2: Form Data Not Updating

**Solution**: Use `setValue` from `react-hook-form`:

```tsx
const { setValue } = useForm();

<input
  onChange={(e) => {
    field.onChange(e);
    setValue('otherField', derivedValue); // Update related field
  }}
/>;
```

### Issue 3: Calendar Not Showing Events

**Solution**: Ensure events are in correct format:

```tsx
const events = timeSlots.map((slot) => ({
  id: slot.id,
  title: slot.status === 'reserved' ? 'Booked' : '',
  start: slot.start_time,
  end: slot.end_time,
  extendedProps: {
    status: slot.status,
  },
}));
```

### Issue 4: RTL Layout Issues

**Solution**: Use `useRtlClass()` hook and apply to container:

```tsx
const rtlClass = useRtlClass();

<div className={`container ${rtlClass}`}>{/* Content */}</div>;
```

---

## TODO / Future Improvements

1. **Email Confirmation Modal**: Implement API call for email resend
2. **Reset Password Modal**: Implement password reset API call
3. **Reschedule Logic**: Complete `rescheduleNow()` in `mysession-calendar`
4. **File Naming**: Consider standardizing all files to `.component.tsx`
5. **Type Safety**: Replace remaining `any` types with proper interfaces
6. **Commented Code**: Remove commented social login buttons in `register-modal`
7. **Timeout Management**: Consider using a custom hook for warning timeouts
8. **Calendar Performance**: Optimize event rendering for large datasets

---

## Dependencies

### External Packages

- `@mui/material` - Material-UI components
- `@mui/icons-material` - Material-UI icons
- `react-hook-form` - Form management
- `@hookform/resolvers` - Form validation resolvers
- `zod` - Schema validation
- `react-i18next` - Internationalization
- `react-router-dom` - Navigation
- `@fullcalendar/react` - Calendar component
- `@fullcalendar/daygrid` - Day grid plugin
- `@fullcalendar/timegrid` - Time grid plugin
- `@fullcalendar/interaction` - Interaction plugin
- `react-image-crop` - Image cropping
- `react-phone-input-2` - Phone number input
- `date-fns` - Date utilities
- `notistack` - Notifications (used in some modals)

### Internal Dependencies

- `@/hooks/useAuth` - Authentication hooks
- `@/hooks/useSessions` - Session hooks
- `@/hooks/useInstructors` - Instructor hooks
- `@/hooks/useCalendar` - Calendar hooks
- `@/schemas/authSchemas` - Validation schemas
- `@/redux/user/user.selectors` - User state selectors
- `@/redux/store` - Redux store
- `@/assets/utils/utils` - Utility functions
- `@/assets/utils/event.utils` - Event parsing utilities
- `@/assets/types` - TypeScript types

---

## Migration Notes

This modals directory has been refactored to:

1. ✅ Use consistent `FC` imports (removed `React.FC`)
2. ✅ Replace `rtlClass()` with `useRtlClass()` hook
3. ✅ Remove inline styles (moved to SCSS)
4. ✅ Fix hardcoded strings (use i18n)
5. ✅ Clean up unused imports and variables
6. ✅ Improve type safety with proper interfaces
7. ✅ Consistent error handling patterns

All modals now follow modern React patterns and integrate with TanStack Query for data fetching instead of Redux actions.

See `MODERNIZATION_COMPLETE.md` for full migration details.
