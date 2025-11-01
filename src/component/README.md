# Components Directory

## Purpose

This directory contains reusable UI components and application-level components that are shared across different features/modules of the application.

## Structure

### `/app/` - Application Core Components

#### `Routes.tsx`

Application routing configuration using React Router v6.

- **Purpose**: Defines all application routes with lazy loading
- **Features**:
  - Code splitting via `React.lazy()`
  - Protected routes via `GuardedRoute` component
  - Suspense fallback with `Loader` component
  - Automatic redirects for authenticated users
- **Props**:
  - `currentUser: CurrentUser | null` - Current authenticated user

**Routes**:

- `/` - Home (public)
- `/login` - Sign in (redirects if authenticated)
- `/register` - Registration (redirects to `/registered` if authenticated)
- `/registered` - Post-registration page (protected)
- `/account_settings` - Account settings (protected, Tutor only)
- `/home` - Private sessions listing (protected)
- `/my_sessions` - User sessions (protected)
- `/profile/:id` - Profile edit page (protected)
- `/checkout` - Checkout page (public)
- `/terms` - Terms and conditions (public)
- `*` - 404 page

#### `Layout.tsx`

Main application layout wrapper.

- **Purpose**: Provides consistent header/footer structure
- **Features**:
  - Renders `Header` on all pages
  - Conditionally renders `Footer` (hidden on auth pages)
  - Clean route configuration via `ROUTES_WITHOUT_FOOTER` constant
- **Props**:
  - `children: React.ReactNode` - Page content

**Routes without footer**: `/login`, `/register`, `/registered`

#### `NotistackProvider.tsx`

Notification system provider wrapper.

- **Purpose**: Configures global toast notifications
- **Features**:
  - Wraps `SnackbarProvider` from `notistack`
  - Custom close button with Material-UI icon
  - Bottom-center positioning
  - Duplicate prevention
  - Initializes `SnackbarUtilsConfigurator` for global access
- **Props**:
  - `children: React.ReactNode` - Application content

**Usage**: Wrap the entire app at root level to enable `snackActions` utilities.

#### `Loader.tsx`

Global loading indicator component.

- **Purpose**: Loading fallback for Suspense boundaries
- **Features**: Material-UI `CircularProgress` spinner
- **Styling**: Styled via `.loader-div` class

### `/card/` - Card Components

#### `app-card.component.tsx`

Generic card component for displaying content with optional pricing and action button.

- **Purpose**: Reusable card layout for courses, packages, etc.
- **Features**:
  - Flexible content via children
  - Price display with before/after pricing
  - Configurable button types (primary, secondary, disabled, special)
  - Responsive typography
  - Clean BEM-style CSS architecture
- **Props**:
  - `children?: ReactNode` - Card content
  - `title: string` - Card title (required)
  - `label?: string` - Button label
  - `type?: 'primary' | 'secondary' | 'disabled' | 'special'` - Button variant (default: 'primary')
  - `priceConfig?: PriceConfig` - Price display configuration
  - `onClickButton?: () => void` - Button click handler

**PriceConfig**:

```typescript
{
  priceAfter: { price: number | null };
  priceBefore?: { price: number | null };
}
```

**Button Types**:

- `primary` - Blue primary button (default)
- `secondary` - Dark secondary button
- `disabled` - Greyed out, not clickable
- `special` - White with blue text and border

### `/carousel/` - Carousel Component

#### `carousel.tsx`

Responsive carousel/slider component using `react-slick`.

- **Purpose**: Horizontal scrollable content display
- **Features**:
  - RTL support via `useRtlClass()` hook
  - Responsive breakpoints (mobile/tablet/desktop)
  - Auto-play capability
  - Configurable slide counts
  - Dots and arrow navigation
  - Memoized settings for performance
- **Props**:
  - `children: ReactNode[]` - Carousel items (required)
  - `small?: boolean` - Small mode (1 slide per view) vs default (1/2/3)
  - `arrows?: boolean` - Show navigation arrows (default: true)

**Responsive Behavior**:

- **Small mode**: 1 slide on all breakpoints
- **Default mode**:
  - Mobile (<768px): 1 slide
  - Tablet (768-992px): 2 slides
  - Desktop (>992px): 3 slides

**Dependencies**: `react-slick`, `slick-carousel`

### `/guarded-route/` - Protected Route Component

#### `guarded-route.component.tsx`

Simple route protection wrapper.

- **Purpose**: Redirects unauthenticated users to home
- **Props**:
  - `element: React.ReactElement` - Component to render if authorized
  - `auth: boolean` - Authorization condition
- **Behavior**: Redirects to `/` if `auth` is false

**Usage**:

```typescript
<GuardedRoute element={<ProtectedPage />} auth={!!currentUser} />
<GuardedRoute element={<TutorPage />} auth={!!currentUser && currentUser.type === 'Tutor'} />
```

### `/hoc/` - Higher-Order Components

#### `network-detector/` ⚠️ **UNUSED**

Legacy network connectivity detector HOC.

- **Status**: Not used anywhere in the codebase
- **Issues**:
  - Uses direct DOM manipulation (`document.getElementById`)
  - Fetches `google.com` which can fail/be blocked
  - Relies on external HTML element (`#snackbarDiv`)
  - Uses `setInterval` with potential memory leaks
- **Recommendation**:
  - Delete if network detection not needed
  - OR replace with modern React patterns (context + online/offline events)
  - OR use a library like `react-use` (`useNetworkState` hook)

## Dependencies

### NPM Packages

- `react-router-dom` - Routing
- `notistack` - Toast notifications
- `@mui/material` - UI components (Button, IconButton, CircularProgress)
- `@mui/icons-material` - Icons (Close)
- `react-slick` - Carousel functionality
- `slick-carousel` - Carousel styles
- `react-i18next` - Internationalization

### Internal Dependencies

- `@/assets/utils/utils` - `useRtlClass()` hook for RTL support
- `@/assets/utils/toaster` - `snackActions`, `SnackbarUtilsConfigurator`
- `@/assets/types` - `CurrentUser` type
- `@/lib/cn` - `cn()` utility for class name composition

## Usage Examples

### Setting up the App

```typescript
import { BrowserRouter } from 'react-router-dom';
import NotistackProvider from './component/app/NotistackProvider';
import Layout from './component/app/Layout';
import RoutesComponent from './component/app/Routes';

function App() {
  const currentUser = useAppSelector(selectCurrentUser);

  return (
    <BrowserRouter>
      <NotistackProvider>
        <Layout>
          <RoutesComponent currentUser={currentUser} />
        </Layout>
      </NotistackProvider>
    </BrowserRouter>
  );
}
```

### Using AppCard

```typescript
import AppCard from '@/component/card/app-card.component';

<AppCard
  title="Premium Package"
  label="Get Started"
  type="primary"
  priceConfig={{
    priceAfter: { price: 99 },
    priceBefore: { price: 149 },
  }}
  onClickButton={() => handlePurchase()}
>
  <p>Access to all features</p>
  <p>24/7 Support</p>
</AppCard>
```

### Using Carousel

```typescript
import Carousel from '@/component/carousel/carousel';

<Carousel small={false} arrows={true}>
  {items.map((item) => (
    <div key={item.id}>{item.content}</div>
  ))}
</Carousel>
```

### Protected Routes

```typescript
import GuardedRoute from '@/component/guarded-route/guarded-route.component';

// In your routing configuration
<Route
  path="/dashboard"
  element={<GuardedRoute element={<Dashboard />} auth={isAuthenticated} />}
/>
```

## Refactoring Notes

### ✅ Completed Refactorings

1. **Carousel RTL Support**:

   - Refactored to use `useRtlClass()` hook instead of direct `i18n.dir()` access
   - Added `useMemo` for settings optimization
   - Now consistent with app-wide RTL pattern

2. **AppCard Button Classes**:

   - Removed redundant `buttonType()` function
   - Directly compute `buttonClasses` using `cn()` utility
   - Cleaner, more readable code

3. **Layout Footer Logic**:

   - Replaced multiple hardcoded conditionals with `ROUTES_WITHOUT_FOOTER` constant
   - More maintainable - add new routes to array instead of chaining conditions
   - Improved readability with `showFooter` boolean

4. **LanguageSelector Improvements**:

   - Removed nested Box components (cleaner JSX)
   - Simplified conditional rendering to early returns
   - Moved DOM manipulation to useEffect for proper lifecycle management
   - Uses `sx` prop instead of inline styles
   - Improved documentation

5. **InstructorCard RTL Consistency**:

   - Updated from deprecated `rtlClass()` function to `useRtlClass()` hook
   - Removed function call overhead in JSX (now uses variable)
   - Consistent with app-wide RTL pattern

6. **Login Component RTL Consistency**:

   - Updated from deprecated `rtlClass()` function to `useRtlClass()` hook
   - Consistent with app-wide RTL pattern

7. **MaterialTheme Stability & Performance**:

   - Replaced unstable `unstable_createMuiStrictModeTheme` with stable `createTheme`
   - Added `useMemo` to prevent theme recreation on every render
   - Added proper TypeScript interface
   - Improved JSDoc documentation
   - Cleaner variable names (`isRtl` instead of conditional checks)

8. **ReadMore Component Optimization**:

   - Replaced `document.createElement` with `DOMParser` (more modern, safer)
   - Removed problematic `useEffect` with missing dependencies
   - Added `useMemo` for text extraction and display text computation
   - SSR-safe HTML extraction
   - Cleaner state management (removed redundant states)
   - Better performance (no re-extraction on every render)

9. **ReviewCard Component Optimization**:
   - Replaced `document.createElement` with `DOMParser` (more modern, safer)
   - Removed unnecessary `useState` and `useEffect`
   - Added `useMemo` for text extraction
   - SSR-safe HTML extraction
   - Better performance (computed values instead of state updates)

### Issues to Address

1. **Network Detector HOC** ✅ **DELETED**:

   - Was not imported or used anywhere
   - Had problematic patterns (DOM manipulation, external fetch)
   - **Action Taken**: Deleted both component and styles files, removed empty directories

2. **Routes Configuration**:

   - Commented out course routes - should be cleaned up or implemented
   - Consider moving route configuration to separate file for better organization

3. **GuardedRoute Limitations**:

   - Only supports boolean auth check
   - No support for role-based permissions (though works with inline conditions)
   - Could be extended to accept `roles` prop and `requiredRole` for cleaner API

4. **AppCard Flexibility**:
   - Could benefit from more flexible pricing layouts
   - Consider separating price display into own component

## Best Practices

1. **Component Organization**:
   - Place reusable UI components in `/component`
   - Feature-specific components go in `/modules/[feature]`
2. **Lazy Loading**:

   - All route components use `React.lazy()` for code splitting
   - Always wrap with `<Suspense>` and provide fallback

3. **Type Safety**:
   - All components have TypeScript interfaces
   - Props are explicitly typed
4. **RTL Support**:

   - Use `useRtlClass()` hook for directional styling
   - Carousel automatically handles RTL layouts

5. **Styling**:
   - BEM methodology for CSS classes
   - SCSS modules co-located with components
   - Import from `@/assets/styles/variables.scss` for consistency

### `/i18next/` - Internationalization Components

#### `i18n.ts`

i18next configuration and initialization.

- **Purpose**: Configure language detection and translation resources
- **Features**:
  - Language detection via `i18next-browser-languagedetector`
  - Supports English and Arabic
  - Development debug mode
  - Suspense support for lazy loading translations
- **Resources**: `locales/en/translation.json`, `locales/ar/translation.json`

#### `LanguageSelector.tsx`

Language switcher component.

- **Purpose**: Toggle between English and Arabic languages
- **Features**:
  - Automatically updates document direction (RTL/LTR)
  - Shows opposite language button (Arabic when English is active, vice versa)
  - Clean conditional rendering
  - Uses Material-UI Button with consistent styling
  - Side-effect managed via useEffect for document direction
- **Usage**: Place in header/navigation area

**Recent Improvements**:

- Removed nested Box components
- Simplified conditional rendering logic
- Proper useEffect for DOM updates
- Uses `sx` prop instead of inline styles

### `/instructor-calendar/` - Calendar Component

#### `instructor-calendar.component.tsx`

FullCalendar-based availability calendar for instructors.

- **Purpose**: Display instructor time slot availability
- **Features**:
  - Day and week views
  - Custom toolbar buttons with i18n support
  - RTL support via `i18n.dir()`
  - Fetches slots via `useSlots` hook (TanStack Query)
  - Auto-refresh on date navigation
  - Arabic and English locales
  - Restricted to future dates only
- **Props**:
  - `instructorId: number` - Instructor to display calendar for
- **Dependencies**: `@fullcalendar/*`, `date-fns`, `useSlots` hook

**Usage**:

```typescript
<InstructorCalendar instructorId={instructor.id} />
```

### `/instructor-card/` - Instructor Card Component

#### `instructor-card.component.tsx`

Rich instructor profile card with video, calendar, and booking.

- **Purpose**: Display instructor profile in directory/search results
- **Features**:
  - YouTube video embed with lazy loading
  - Instructor avatar with fallback
  - Rating display
  - Subject/field badges
  - Bio with ReadMore component
  - Embedded InstructorCalendar
  - Free trial or profile CTA button
  - Calendar stepper modal for booking
  - RTL support
- **Props**:
  - `instructor: Instructor` - Full instructor object
- **Dependencies**: `InstructorCalendar`, `ReadMore`, `CalendarStepperModal`

**Recent Improvements**:

- Updated to use `useRtlClass()` hook
- Consistent RTL pattern across all elements

### `/login/` - Login Form Component

#### `login.component.tsx`

Complete login form with validation and password reset.

- **Purpose**: User authentication interface
- **Features**:
  - React Hook Form with Zod validation
  - Email and password fields
  - Forgot password modal trigger
  - Link to registration page
  - TanStack Query mutation for sign-in
  - Auto-navigation on success
  - Terms and conditions link
  - RTL support
- **Dependencies**: `useSignIn` hook, `ResetPasswordModal`, `loginSchema`

**Recent Improvements**:

- Updated to use `useRtlClass()` hook
- Proper error handling
- Clean form state management

### `/material-theme/` - Theme Provider

#### `material-theme.component.tsx`

Global Material-UI theme configuration.

- **Purpose**: Provide consistent theming and RTL/LTR support
- **Features**:
  - Custom primary color palette (#3ac5f1)
  - Dynamic direction (RTL/LTR) based on language
  - Language-specific fonts (Inter for English, Tajawal for Arabic)
  - Memoized theme for performance
  - Button text transform disabled
  - Responsive typography
- **Props**:
  - `children: React.ReactNode` - App content to theme

**Recent Improvements**:

- Replaced unstable `unstable_createMuiStrictModeTheme` with stable `createTheme`
- Added useMemo for theme optimization
- Proper TypeScript interface
- JSDoc documentation

**Usage**: Wrap app at root level, inside Router but outside components.

### `/read-more/` - Text Truncation Component

#### `read-more.component.tsx`

Collapsible text component with "Read More" toggle.

- **Purpose**: Truncate long text content with expand/collapse
- **Features**:
  - Configurable max length
  - HTML content extraction
  - Cleans "Powered by Froala Editor" text
  - Optional readonly mode
  - Click callback support
  - i18n support
  - Optimized with useMemo
- **Props**:
  - `text: string` - Text/HTML content to display
  - `maxLength: number` - Character limit before truncation
  - `readonly?: boolean` - Disable expand/collapse behavior (default: false). Note: onClick still fires even when readonly
  - `onClick?: () => void` - Callback when toggle clicked (fires regardless of readonly state)

**Recent Improvements**:

- Replaced DOM manipulation with DOMParser
- Removed problematic useEffect dependencies
- Added useMemo for performance
- SSR-safe HTML extraction
- Cleaner state management
- Fixed onClick to fire even when readonly=true (allows navigation without expansion)

**Usage**:

```typescript
<ReadMore
  text={instructor.bio}
  maxLength={95}
  readonly
  onClick={goToProfile}
/>
```

### `/review-card/` - Review Display Component

#### `review-card.component.tsx`

Student review card with rating and formatted date.

- **Purpose**: Display student review/testimonial
- **Features**:
  - Star rating display
  - Formatted date with locale support (ar/en)
  - HTML content extraction
  - Cleans "Powered by Froala Editor" text
  - Responsive layout
- **Props**:
  - `data: ReviewData` - Review object (student, rating, text, created_at)
- **Dependencies**: `date-fns`, Material-UI Rating

**Recent Improvements**:

- Replaced DOM manipulation with DOMParser
- Removed useEffect for better performance
- Added useMemo for text extraction
- SSR-safe HTML extraction

**ReviewData Interface**:

```typescript
{
  student: string;
  rating: number;
  text: string;
  created_at: string;
}
```

### `/tabs/` - Tab Panel Component

#### `tab-banal.component.tsx`

Generic tab panel wrapper for Material-UI Tabs.

- **Purpose**: Content container for tab systems
- **Features**:
  - Accessibility props (role, aria-labels)
  - Conditional rendering based on active tab
  - Spread props support
- **Props**:
  - `children?: ReactNode` - Tab content
  - `value: number` - Current active tab index
  - `index: number` - This panel's index
  - `[key: string]: any` - Additional props

**Usage**:

```typescript
<TabPanel value={activeTab} index={0}>
  <YourContent />
</TabPanel>
```

### `/trail-modal-card/` - Trial Session Card

#### `trail-modal-card.component.tsx`

Instructor card for free trial modal selection.

- **Purpose**: Display instructor option in trial booking modal
- **Features**:
  - Avatar with fallback to initials
  - Name and subject fields
  - Star rating
  - Truncated bio preview
  - Opens calendar stepper modal on click
  - Clean Material-UI Dialog integration
- **Props**:
  - `instructor: Instructor` - Instructor object
- **Dependencies**: `CalendarStepperModal`, `getNameInitials` utility

**Usage**:

```typescript
{instructors.map(instructor => (
  <TrailModalCard key={instructor.id} instructor={instructor} />
))}
```

---

## File Naming Conventions

- Components: `PascalCase.tsx` or `kebab-case.component.tsx`
- Styles: `kebab-case.component.scss` or `kebab-case.styles.scss`
- Index files: Use default exports for easy importing
