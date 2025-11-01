# Assets Directory

## Purpose

This directory contains shared assets used throughout the application, including TypeScript type definitions, utility functions, stylesheets, and image assets.

## Structure

### `/types.ts`

Contains core TypeScript type definitions for the application's domain models:

- **`Field`** - Course/subject field definition
- **`Instructor`** - Complete tutor/instructor profile with reviews, packages, and availability
- **`InstructorProfile`** - Basic instructor profile information
- **`CurrentUser`** - Authenticated user data
- **`SessionType`** - Session data including tutor, student, status, and timing

**Internal Types** (not exported):

- `TutorReview` - Review data for tutors
- `FreeTrial` - Free trial status
- `TutorPackage` - Pricing package information
- `Schedule` - Time slot schedule data

### `/utils/`

#### `api.ts`

Axios HTTP client configuration with:

- Request/response interceptors
- Automatic token refresh on 401 errors
- Authentication header injection
- Language header injection
- CRUD operation helpers: `get()`, `post()`, `patch()`, `putRequest()`, `remove()`

**Note**: Contains redundant functions that should be consolidated (see Refactoring Notes).

#### `countries.ts`

Country and nationality data utilities:

- `getCountries()` - Returns sorted list of countries with preferred countries first (AE, EG, SA)
- `getNationalities()` - Returns proper demonyms (e.g., "Emirati" for UAE)
- Uses `i18n-iso-countries` library for internationalization

#### `event.utils.ts`

Calendar event utilities for FullCalendar integration:

- `parseTimeSlotsIntoCalendarEvents()` - Transforms API time slot data into FullCalendar events
- Event color coding based on status (available/reserved)

#### `toaster.ts`

Notification utilities using `notistack`:

- `snackActions` - Helper methods: `success()`, `error()`, `warning()`, `info()`, `toast()`
- `SnackbarUtilsConfigurator` - Initializer component (must be rendered in app root)

#### `utils.ts`

Miscellaneous utility functions:

- `rtlClass()` - Returns RTL class for right-to-left language support
- `tabsProps()` - Generates accessibility props for Material-UI tabs
- `showSpinner()` / `hideSpinner()` - Controls global loading spinner
- `getNameInitials()` - Extracts initials from a full name

**Warning**: `rtlClass()` violates React hooks rules (see Refactoring Notes).

#### `fawry.ts`

**Status**: Dead code - entire file is commented out

- Legacy payment integration code (no longer used)
- Should be removed

### `/styles/`

SCSS stylesheets with modular organization:

- `main.scss` - Main entry point, imports all other stylesheets
- `variables.scss` - SCSS variables (colors, fonts, grid, breakpoints) and RTL/LTR directionality mixins
- `mixins.scss` - Reusable SCSS mixins
- `base.scss` - Base HTML element styles
- `reset.scss` - CSS reset/normalize
- `typography.scss` - Typography styles
- `utilities.scss` - Utility classes
- `grid.scss` - Grid system
- `carousel.scss` - Carousel component styles
- `spinner.scss` - Loading spinner styles

### `/images/`

Image assets organized by feature:

- `auth/` - Authentication-related images
- `browsers/` - Browser icons
- `landing/` - Landing page assets
- `newLanding/` - New landing page redesign assets
- `mobileApp/` - Mobile app promotional images
- `videoSession/` - Video session interface assets
- Root-level: logos, placeholders, payment method icons

## Dependencies

### NPM Packages

- `axios` - HTTP client
- `i18n-iso-countries` - Country/nationality data
- `notistack` - Toast notifications
- `react-i18next` - Internationalization
- `@fullcalendar/core` - Calendar events

## Usage Examples

### API Calls

```typescript
import { get, post } from '@/assets/utils/api';

// Simple GET request
const response = await get('/users/me');

// GET with query params
const response = await get('/tutors', {
  params: {
    per_page: 10,
    page: 1,
  },
});

// GET with additional config
const response = await get('/tutors', {
  params: { include: 'fields,packages' },
  config: { timeout: 5000 },
});

// Create data
await post('/sessions', { data: sessionData });
```

### Notifications

```typescript
import { snackActions } from '@/assets/utils/toaster';

snackActions.success('Operation completed!');
snackActions.error('Something went wrong');
```

### Country/Nationality Dropdowns

```typescript
import { getCountries, getNationalities } from '@/assets/utils/countries';

const countries = getCountries(); // AE, EG, SA appear first
const nationalities = getNationalities();
```

### Type Safety

```typescript
import { CurrentUser, Instructor, SessionType } from '@/assets/types';

const user: CurrentUser = { ... };
```

## Refactoring Notes

### ✅ Completed Refactorings

1. **Dead Code Removed**: `fawry.ts` has been deleted (186 lines of commented code)

2. **API Function Consolidation**:

   - Removed redundant `jsonGet()` and `apiGet()` functions
   - Consolidated into single `get()` function with optional `params` and `config`
   - Updated all usages across `useInstructors`, `useSessions`, and `useCalendar` hooks

3. **React Hooks Violation Fixed**:

   - Created proper `useRtlClass()` hook to replace `rtlClass()` function
   - Old `rtlClass` kept as deprecated alias for backward compatibility
   - Now follows React hooks rules (hook names must start with "use")

4. **Type Exports**:
   - Exported previously internal types: `TutorReview`, `FreeTrial`, `TutorPackage`, `Schedule`
   - All core domain types now available for import from `types.ts`

### Issues to Address

3. **Type Duplication** (Documented Pattern):

   - Some components (e.g., `checkout`) define simplified versions of types from `types.ts`
   - Example: `TutorPackage` in checkout only uses `id`, `type`, `rate`, `time_in_hours` (subset of full type)
   - **Reason**: Components only need specific fields, full types have additional API metadata
   - **Pattern**: Keep full types in `types.ts`, allow components to define simplified Pick/interface versions
   - **All core types are now exported** from `types.ts` for reuse

4. **Type Organization** (Future Consideration):

   - Consider feature-based type organization (e.g., SessionType → `/sessions/types.ts`)
   - `Instructor` and `InstructorProfile` have significant overlap - could use type extension

5. **Naming Consistency** (Low Priority):
   - Mixed use of "Instructor" vs "Tutor" terminology
   - Type is called `Instructor` but has properties like `tutor_fields`, `tutor_packages`
   - **Note**: This reflects API naming; changing would require large refactor

## Best Practices

1. **Adding New Types**: Add to `types.ts` if shared across features, otherwise create feature-specific type files
2. **API Calls**: Always use the centralized `api.ts` functions to ensure interceptors are applied
3. **Notifications**: Use `snackActions` instead of directly calling `enqueueSnackbar`
4. **Styling**: Import from `main.scss` in component files, use SCSS variables for consistency
5. **Images**: Optimize images before adding, use WebP format where possible
