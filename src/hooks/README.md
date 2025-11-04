# Hooks Directory

## Purpose

This directory contains custom React hooks built on TanStack Query (React Query) for managing server state, data fetching, and mutations throughout the application.

## Architecture

All hooks follow the **TanStack Query** pattern, providing:

- Automatic caching and background refetching
- Optimistic updates and cache invalidation
- Loading, error, and success states
- Retry logic and request deduplication
- Query invalidation for data consistency

## Hooks Overview

### `/useAuth.ts` - Authentication Hooks

Manages user authentication flows including sign in, sign up, sign out, and password changes.

#### `useSignIn()`

Authenticates user with email and password.

**Returns**: `UseMutationResult<UserData, Error, SignInPayload>`

**Payload**:

```typescript
{
  email: string;
  password: string;
}
```

**Features**:

- Saves authentication tokens to localStorage
- Updates Redux store with current user
- Shows loading spinner during authentication
- Navigates to home on success
- Displays success/error notifications

**Usage**:

```typescript
const signInMutation = useSignIn();

const handleLogin = async (credentials) => {
  const userData = await signInMutation.mutateAsync(credentials);
  if (userData?.id) {
    navigate('/home');
  }
};
```

#### `useSignUp()`

Creates new user account.

**Returns**: `UseMutationResult<UserData, Error, SignUpPayload>`

**Payload**:

```typescript
{
  email: string;
  password: string;
  password_confirmation: string;
  phone_number: string;
  first_name?: string;
  last_name?: string;
  type?: string;
  country_code?: string;
  nationality?: string;
}
```

**Features**:

- Creates user account
- Automatically signs in after registration
- Saves tokens and updates Redux store
- Shows success/error notifications

#### `useSignOut()`

Signs out current user and clears all cached data.

**Returns**: `UseMutationResult<void, Error, void>`

**Features**:

- Calls sign out API endpoint
- Clears localStorage (even if API fails)
- Clears Redux store
- Clears all TanStack Query cache
- Navigates to home
- Graceful error handling (continues even if API fails)

**Usage**:

```typescript
const signOutMutation = useSignOut();

const handleSignOut = () => {
  signOutMutation.mutate();
};
```

#### `useChangePassword()`

Updates user password.

**Returns**: `UseMutationResult<void, Error, ChangePasswordPayload>`

**Payload**:

```typescript
{
  type: string; // 'users' or 'tutors'
  userData: {
    old_password: string;
    password: string;
    password_confirmation: string;
  }
}
```

**Features**:

- Validates old password
- Updates to new password
- Shows loading spinner
- Success/error notifications

---

### `/useSessions.ts` - Session Management Hooks

Manages student/tutor sessions including booking, cancellation, and fetching.

#### `useSessions(pageNumber, pageSize)`

Fetches paginated list of sessions.

**Parameters**:

- `pageNumber: number` - Page to fetch (default: 1)
- `pageSize: number` - Items per page (default: 10)

**Returns**: `UseQueryResult<{ data: SessionType[], pagination: Headers }>`

**Features**:

- Automatic caching
- Background refetching
- Pagination support

**Usage**:

```typescript
const { data, isLoading, error } = useSessions(1, 10);
const sessions = data?.data || [];
const totalCount = data?.pagination['total-count'];
```

#### `useInfiniteSessions(pageSize)`

Fetches sessions with infinite scroll support.

**Parameters**:

- `pageSize: number` - Items per page (default: 10)

**Returns**: `UseInfiniteQueryResult<SessionType[]>`

**Features**:

- Infinite scroll pagination
- Automatic page loading
- "Load more" functionality

**Usage**:

```typescript
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
  useInfiniteSessions(10);

const allSessions = data?.pages.flatMap((page) => page.data) || [];
```

#### `useCancelSession()`

Cancels a scheduled session.

**Returns**: `UseMutationResult<void, Error, number>`

**Mutation Function**: `(sessionId: number) => Promise<void>`

**Features**:

- Invalidates session and calendar queries
- Success notification
- Automatic UI update

**Usage**:

```typescript
const cancelMutation = useCancelSession();

const handleCancel = (sessionId) => {
  cancelMutation.mutate(sessionId);
};
```

#### `useEndSession()`

Marks a session as ended.

**Returns**: `UseMutationResult<void, Error, number>`

**Mutation Function**: `(sessionId: number) => Promise<void>`

**Features**:

- Invalidates session queries
- Success notification

#### `useBookTrialSession()`

Books a free trial session with a tutor.

**Returns**: `UseMutationResult<void, Error, TrialSessionData>`

**Features**:

- Wraps data in `{ trial_session: data }` format
- Invalidates sessions and calendar
- Success notification

**Usage**:

```typescript
const bookTrialMutation = useBookTrialSession();

const handleBookTrial = (sessionData) => {
  bookTrialMutation.mutate({
    tutor_id: tutorId,
    start_time: startTime,
    // ... other fields
  });
};
```

#### `useBookPrivateSession()`

Books a paid private session.

**Returns**: `UseMutationResult<void, Error, PrivateSessionData>`

**Features**:

- Wraps data in `{ private_session: data }` format
- Invalidates sessions and calendar
- Success notification

---

### `/useCalendar.ts` - Calendar & Availability Hooks

Manages tutor availability slots and calendar events.

#### `useSlots(userId, from, to, enabled)`

Fetches tutor's availability slots for a date range.

**Parameters**:

- `userId: number` - Tutor ID
- `from: string` - Start date (ISO format)
- `to: string` - End date (ISO format)
- `enabled: boolean` - Enable/disable query (default: true)

**Returns**: `UseQueryResult<EventInput[]>` (FullCalendar events)

**Features**:

- Transforms API slots into FullCalendar events
- Array safety (handles non-array responses)
- Conditional fetching via `enabled` prop

**Usage**:

```typescript
const dateRange = useMemo(
  () => ({
    from: today.toISOString(),
    to: addDays(today, 7).toISOString(),
  }),
  [today],
);

const { data: slots = [] } = useSlots(
  tutorId,
  dateRange.from,
  dateRange.to,
  !!tutorId,
);
```

**Important**: Memoize date range to prevent infinite re-fetches!

#### `useAvailability(params)`

Fetches general availability (unclear purpose - needs clarification).

**Parameters**:

- `params: { a: string, end_time: string }`

**Returns**: `UseQueryResult<EventInput[]>`

**Note**: The `a` parameter name is unclear and should be documented or renamed.

#### `useCreateSlots()`

Creates new availability slots for a tutor.

**Returns**: `UseMutationResult<void, Error, AvailabilitySlots>`

**Mutation Function**: `(slots: AvailabilitySlot[]) => Promise<void>`

**Features**:

- Wraps data in `{ availabilities: slots }` format
- Invalidates calendar queries
- Success notification

**Usage**:

```typescript
const createSlotsMutation = useCreateSlots();

const handleCreateSlots = (slots) => {
  createSlotsMutation.mutate(slots);
};
```

#### `useDeleteSlots()`

Deletes multiple availability slots.

**Returns**: `UseMutationResult<void, Error, number[]>`

**Mutation Function**: `(ids: number[]) => Promise<void>`

**Features**:

- Batch deletion support
- Invalidates calendar queries
- Success notification

**Usage**:

```typescript
const deleteSlotsMutation = useDeleteSlots();

const handleDeleteSlots = (slotIds) => {
  deleteSlotsMutation.mutate(slotIds);
};
```

---

### `/useInstructors.ts` - Instructor/Tutor Hooks

Manages instructor data including profiles, listings, and updates.

#### `useInstructors(pageNumber, pageSize)`

Fetches paginated list of instructors.

**Parameters**:

- `pageNumber: number` - Page to fetch (default: 1)
- `pageSize: number` - Items per page (default: 10)

**Returns**: `UseQueryResult<{ data: Instructor[], pagination: Headers }>`

**Features**:

- Pagination support
- Returns full instructor objects with metadata

**Usage**:

```typescript
const { data, isLoading } = useInstructors(1, 12);
const instructors = data?.data || [];
```

#### `useInstructor(id, enabled)`

Fetches single instructor with full details and relationships.

**Parameters**:

- `id: number | string` - Instructor ID
- `enabled: boolean` - Enable/disable query (default: true)

**Returns**: `UseQueryResult<Instructor>`

**Features**:

- Includes related fields and packages (`include=fields,packages`)
- Conditional fetching
- Type-safe ID handling (converts string to number)

**Usage**:

```typescript
const { data: instructor } = useInstructor(instructorId, !!instructorId);
```

#### `useUpdateTutorProfile()`

Updates tutor profile information including avatar.

**Returns**: `UseMutationResult<TutorData, Error, UpdatePayload>`

**Payload**:

```typescript
{
  id: number;
  userData: {
    tutor: {
      first_name?: string;
      last_name?: string;
      phone_number?: string;
      email?: string;
      video_url?: string;
      bio?: string;
      avatar?: File;
    }
  }
}
```

**Features**:

- Handles file uploads (avatar) via FormData
- Separates avatar from other fields
- Invalidates both detail and list queries
- Success notification

**Usage**:

```typescript
const updateProfileMutation = useUpdateTutorProfile();

const handleUpdate = async (formData) => {
  await updateProfileMutation.mutateAsync({
    id: tutorId,
    userData: { tutor: formData },
  });
};
```

#### `useUpdateUserInfo()`

Generic user information update (deprecated/unclear - prefer specific hooks).

**Returns**: `UseMutationResult<void, Error, UpdateUserPayload>`

**Payload**:

```typescript
{
  id: number;
  type: string; // 'users' or 'Tutor'
  userData: UserInfoUpdateData;
}

interface UserInfoUpdateData {
  [key: string]:
    | string
    | number
    | boolean
    | File
    | null
    | undefined
    | Record<string, unknown>;
}
```

**Features**:

- Dynamic endpoint selection
- Type-safe user data updates
- Invalidates user and instructor queries
- Success notification

**Note**: Consider replacing with more specific hooks for clarity.

---

## Common Patterns

### Query Keys

All hooks use centralized query keys from `@/lib/queryKeys`:

```typescript
queryKeys.sessions.list(page, size);
queryKeys.instructors.detail(id);
queryKeys.calendar.userSlots(userId, from, to);
```

### Cache Invalidation

Mutations automatically invalidate related queries:

```typescript
queryClient.invalidateQueries({
  queryKey: queryKeys.sessions.all,
});
```

### Error Handling

All auth hooks handle errors with:

- Fallback to `error.message` or generic message
- User-friendly error notifications via `snackActions`
- Loading spinners via `showSpinner`/`hideSpinner`

### Notifications

All successful mutations show notifications:

```typescript
snackActions.success('Operation completed successfully');
```

---

## Best Practices

### 1. Memoize Date Ranges

```typescript
// ✅ GOOD
const dateRange = useMemo(() => ({
  from: start.toISOString(),
  to: end.toISOString()
}), [start, end]);

const { data } = useSlots(id, dateRange.from, dateRange.to);

// ❌ BAD - Causes infinite re-fetches
const { data } = useSlots(id, new Date().toISOString(), ...);
```

### 2. Use Enabled Flags

```typescript
// Only fetch when ID is available
const { data } = useInstructor(instructorId, !!instructorId);
```

### 3. Handle Loading States

```typescript
const { data, isLoading, error } = useSessions();

if (isLoading) return <Loader />;
if (error) return <ErrorMessage />;
return <SessionList sessions={data?.data || []} />;
```

### 4. Async Mutations

```typescript
// For navigation or chaining operations
const userData = await signInMutation.mutateAsync(credentials);
if (userData?.id) {
  navigate('/home');
}
```

### 5. Optimistic Updates (Not Yet Implemented)

Consider adding optimistic updates for better UX:

```typescript
onMutate: async (newData) => {
  await queryClient.cancelQueries({ queryKey });
  const previousData = queryClient.getQueryData(queryKey);
  queryClient.setQueryData(queryKey, newData);
  return { previousData };
},
onError: (err, variables, context) => {
  queryClient.setQueryData(queryKey, context.previousData);
}
```

---

## Type Safety ✅

All hooks now use proper TypeScript interfaces instead of `any` types.

### Shared Type Definitions

All common types are defined in `src/assets/types.ts` and imported where needed:

#### API Error Interface

Used consistently across all error handlers in all hooks:

```typescript
// Imported from: src/assets/types.ts
export interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
  message?: string;
}
```

**Usage**: All `onError` callbacks in mutations use this interface.

### Session Data Types

```typescript
// Trial sessions
interface TrialSessionData {
  tutor_id: number;
  start_time: string;
  grade_subject_id: number;
}

// Private sessions
interface PrivateSessionData {
  tutor_id: number;
  start_time: string;
  grade_subject_id: number;
  package_id: number;
}
```

### Availability Slots

```typescript
interface AvailabilitySlot {
  start_time: string;
  end_time: string;
  status?: 'available' | 'reserved';
}
```

#### Authentication Headers

Used in `useAuth.ts` for handling Axios response headers:

```typescript
// Imported from: src/assets/types.ts
export interface AuthHeaders {
  'access-token'?: string;
  'refresh-token'?: string;
  'expire-at'?: string;
  [key: string]: string | number | boolean | string[] | null | undefined;
}
```

**Usage**: Used in `useSignIn` and `useSignUp` to extract and store authentication tokens.

### Profile Update Data

```typescript
interface TutorProfileUpdateData {
  tutor: {
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    email?: string;
    video_url?: string;
    bio?: string;
    avatar?: File | string;
  };
}
```

**Benefits**:

- ✅ Compile-time type checking
- ✅ Better IDE autocomplete
- ✅ Fewer runtime errors
- ✅ Self-documenting code

---

## Dependencies

### External Libraries

- `@tanstack/react-query` - Data fetching and caching
- `react-router-dom` - Navigation (`useNavigate`)

### Internal Dependencies

- `@/assets/utils/api` - HTTP client functions
- `@/assets/utils/toaster` - Notification system
- `@/assets/utils/utils` - Loading spinner utilities
- `@/assets/utils/event.utils` - Calendar event parsing
- `@/assets/types` - TypeScript type definitions
- `@/lib/queryKeys` - Centralized query key management
- `@/redux/store` - Redux integration (auth only)
- `@/redux/user/user.slice` - User state management

---

## Future Improvements

1. **Add TypeScript interfaces** for all `any` types
2. **Error handling** in mutation onError callbacks
3. **Optimistic updates** for better UX
4. **Rename unclear parameters** (e.g., `a` in useAvailability)
5. **Create typed schemas** using Zod for runtime validation
6. **Add retry logic** configuration for critical operations
7. **Deprecate `useUpdateUserInfo`** in favor of specific hooks
8. **Add JSDoc examples** to all hook functions
9. **Extract common patterns** into reusable utilities
10. **Add unit tests** for all hooks

---

## Migration Notes

These hooks replaced Redux Thunks during the Redux → TanStack Query migration:

- ✅ All `useSelector` and `useDispatch` patterns removed
- ✅ Server state managed by TanStack Query
- ✅ Client state (currentUser) still in Redux
- ✅ Automatic caching and refetching implemented
- ✅ Loading/error states handled by React Query

See `MODERNIZATION_COMPLETE.md` for full migration details.
