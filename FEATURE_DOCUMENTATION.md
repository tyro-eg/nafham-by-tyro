# Feature Documentation - Backend Pending Features

This document tracks all features that have been temporarily hidden or modified with workarounds until backend implementation is ready.

**Last Updated**: Current Session  
**Status**: Features commented out with TODO markers for easy restoration

---

## Table of Contents

1. [Forget Password Feature](#1-forget-password-feature)
2. [Email Confirmation Banner](#2-email-confirmation-banner)
3. [Instructors List Filters](#3-instructors-list-filters)
4. [Sessions Rate Tab](#4-sessions-rate-tab)
5. [Sessions Overview Data](#5-sessions-overview-data)

---

## 1. Forget Password Feature

### Status: ❌ Hidden (Commented Out)

### Files Modified:

- `src/component/login/login.component.tsx`
- `src/modals/login-modal/login-modal.component.tsx`

### What Was Changed:

- **Forgot Password Button**: Commented out in both login components
- **Reset Password Modal**: Commented out (import, state, handlers, Dialog component)
- **Material-UI Imports**: Commented out unused imports (`Dialog`, `IconButton`, `Close` icon)
- **State Management**: Commented out `useState` for modal state

### Current Behavior:

- Users can no longer access the "Forgot Password?" link
- Reset password modal is completely hidden
- Login functionality remains fully functional

### To Restore:

1. Uncomment all sections marked with `// TODO: Uncomment when backend is ready`
2. Restore imports:
   - `ResetPasswordModal` component
   - `Dialog`, `IconButton` from Material-UI
   - `Close` icon from Material-UI icons
   - `useState` hook (if not already imported)
3. Uncomment state: `openForgetPasswordModal`
4. Uncomment handlers: `handleCloseForgetPasswordModal`
5. Uncomment the "Forgot Password?" button
6. Uncomment the Dialog component with ResetPasswordModal
7. **Backend Required**: Implement password reset API endpoint
8. **Backend Required**: Implement email sending service for reset links

### Backend Requirements:

- `POST /auth/forgot-password` - Send reset email
- `POST /auth/reset-password` - Reset password with token
- Email service integration

---

## 2. Email Confirmation Banner

### Status: ❌ Hidden (Commented Out)

### Files Modified:

- `src/modules/header/main-header/main-header.component.tsx`
- `src/modules/header/mobile-header/mobile-header.component.tsx`
- `src/modules/header/index.component.tsx`

### What Was Changed:

- **Email Confirmation Banner**: Commented out in both desktop and mobile headers
- **Email Confirmation Modal**: Commented out (import, state, handlers, Dialog component)
- **Banner CSS Class**: Commented out `header__withBanner` className logic
- **Material-UI Imports**: Commented out unused imports (`Dialog`, `IconButton`, `Close` icon)
- **Info Icon**: Commented out import (only used for banner)
- **Props**: Commented out `openEmailConfirm` prop from HeaderProps interface

### Current Behavior:

- No email confirmation banner appears for unverified users
- Email confirmation modal is completely hidden
- Header displays normally without banner styling

### To Restore:

1. Uncomment all sections marked with `// TODO: Uncomment when backend is ready`
2. Restore imports:
   - `EmailConfirmationModal` component
   - `Info` icon from Material-UI icons
   - `Dialog`, `IconButton` from Material-UI (if needed)
   - `useAppSelector`, `selectCurrentUser` from Redux
3. Uncomment state: `openEmailConfirmModal`
4. Uncomment handlers: `handleCloseEmailConfirmModal`, `triggerOpenEmailConfirmModal`
5. Uncomment banner JSX in both header components
6. Uncomment `header__withBanner` className logic
7. Restore `openEmailConfirm` prop in HeaderProps interface
8. Uncomment Dialog component with EmailConfirmationModal
9. **Backend Required**: Implement email confirmation resend API endpoint

### Backend Requirements:

- `POST /auth/resend-confirmation` - Resend confirmation email
- Email service integration for confirmation emails

---

## 3. Instructors List Filters

### Status: ⚠️ Partially Hidden (Category/Field Filters Commented, Search Works Client-Side)

### Files Modified:

- `src/modules/private-sessions/private-sessions-filter/private-sessions-filter.component.tsx`
- `src/modules/private-sessions/index.component.tsx`

### What Was Changed:

- **Category Filter**: Commented out dropdown and related state/handlers
- **Field Filter**: Commented out dropdown (dependent on category)
- **Filter Toggle Button**: Commented out (mobile filter toggle)
- **Search Functionality**: **WORKING** - Implemented client-side filtering
- **Search Implementation**: Uses `useInfiniteInstructors` to fetch all instructors when searching

### Current Behavior:

- **Search Input**: ✅ Fully functional - searches across all instructors
- **Search Scope**: Searches in instructor name, bio, and course subjects
- **Pagination**: Hidden when searching (since filtering is client-side)
- **Category/Field Filters**: ❌ Hidden (commented out)

### Search Implementation Details:

- When user types in search, automatically fetches all instructor pages
- Filters instructors client-side by:
  - Full name (first_name + last_name)
  - Bio text
  - Course names (grade_subjects.full_course_name)
- Case-insensitive search
- Resets to page 1 when search query changes

### To Restore Category/Field Filters:

1. Uncomment all sections marked with `// TODO: Uncomment when backend is ready`
2. Restore imports:
   - `FormControl`, `InputLabel`, `MenuItem`, `Select`, `SelectChangeEvent` from Material-UI
   - `useTheme`, `useMediaQuery` from Material-UI
   - `useState`, `useEffect` hooks
   - `Search` icon from Material-UI icons
3. Uncomment `CATEGORIES` constant
4. Uncomment state: `category`, `field`, `listBody`
5. Uncomment handlers: `handleCategoryChange`, `handleFieldChange`, `toggleListBody`
6. Uncomment category and field dropdown JSX
7. Uncomment filter toggle button
8. **Backend Required**: Implement filter API endpoints
9. **Backend Required**: Fetch categories from API (currently hardcoded)
10. **Backend Required**: Fetch fields based on selected category

### Backend Requirements:

- `GET /categories` - Fetch available categories
- `GET /fields?category_id={id}` - Fetch fields for a category
- `GET /tutors?category_id={id}&field_id={id}` - Filter instructors by category/field
- Update search to work server-side instead of client-side

### Workaround Notes:

- Search currently works client-side as a temporary solution
- All instructors are fetched when searching (may impact performance with large datasets)
- Consider implementing server-side search when backend is ready

---

## 4. Sessions Rate Tab

### Status: ❌ Hidden (Commented Out)

### Files Modified:

- `src/modules/sessions/sessions-info/sessions-info.component.tsx`

### What Was Changed:

- **Rate Tab**: Commented out Tab component
- **Rate TabPanel**: Commented out TabPanel with SessionsRate component
- **Imports**: Commented out `SessionsRate` component and `RateSession` type
- **Data Import**: Commented out `UNRATED_SESSIONS_DATA` constant
- **JSDoc**: Updated to remove reference to Rate views

### Current Behavior:

- Only "Sessions" tab is visible in the List view
- Rate tab is completely hidden
- Sessions list functionality remains fully functional

### To Restore:

1. Uncomment all sections marked with `// TODO: Uncomment when backend is ready`
2. Restore imports:
   - `SessionsRate` component
   - `RateSession` type
   - `UNRATED_SESSIONS_DATA` constant
3. Uncomment Rate Tab component
4. Uncomment Rate TabPanel component
5. **Backend Required**: Implement session rating API endpoints
6. **Backend Required**: Fetch unrated sessions from API (currently using mock data)

### Backend Requirements:

- `GET /sessions/unrated` - Fetch sessions that need rating
- `POST /sessions/{id}/rate` - Submit session rating
- Rating data structure and validation

---

## 5. Sessions Overview Data

### Status: ✅ **WORKING** (Dynamically Calculated from API)

### Files Modified:

- `src/modules/sessions/index.component.tsx`

### What Was Changed:

- **Static Data Removed**: Replaced hardcoded overview statistics
- **Dynamic Calculation**: Now calculates from actual session and package data
- **API Integration**: Uses `useInfiniteSessions` to fetch all sessions
- **Package Integration**: Uses `usePackages` to calculate unscheduled time

### Current Behavior:

- ✅ **Fully Functional** - All statistics are calculated dynamically
- Overview cards show real-time data from API
- Updates automatically when sessions or packages change

### Calculated Statistics:

#### `previous_sessions_count`

- **Source**: All sessions from API
- **Logic**: Counts sessions with status `'completed'` or `'missed'` where `end_time < now`
- **Status**: ✅ Working

#### `upcoming_sessions_count`

- **Source**: All sessions from API
- **Logic**: Counts sessions with status `'scheduled'` or `'open'` where `start_time >= now`
- **Status**: ✅ Working

#### `total_unscheduled_time_in_hours`

- **Source**: All packages from API
- **Logic**: Sums `remaining_hours` from all packages
- **Status**: ✅ Working

#### `canceled_sessions_count`

- **Source**: All sessions from API
- **Logic**: Counts sessions with status `'canceled'`
- **Status**: ✅ Working (calculated but not displayed in overview component)

### Implementation Details:

- Fetches all sessions using `useInfiniteSessions(100)` with large page size
- Automatically fetches all pages on mount
- Uses `useMemo` for efficient recalculation
- Filters sessions by status and date comparison

### Performance Considerations:

- Fetches all sessions on page load (may be slow with many sessions)
- Consider pagination or server-side aggregation when backend supports it
- Current implementation is acceptable for moderate session counts

### Future Optimizations:

- **Backend Enhancement**: Add aggregation endpoint for statistics
  - `GET /sessions/statistics` - Return pre-calculated counts
  - Reduces client-side processing and API calls
- **Caching**: Consider caching statistics with appropriate stale time

---

## Summary of Changes

### Features Hidden (Commented Out):

1. ✅ Forget Password Feature
2. ✅ Email Confirmation Banner
3. ✅ Instructors Category/Field Filters
4. ✅ Sessions Rate Tab

### Features Modified (Workarounds):

1. ✅ Instructors Search - Client-side filtering (temporary)
2. ✅ Sessions Overview - Dynamic calculation (permanent improvement)

### Features Working:

1. ✅ Login functionality
2. ✅ Registration functionality
3. ✅ Instructors search (client-side)
4. ✅ Sessions overview statistics (dynamic)
5. ✅ All other core features

---

## Testing Checklist

Before deploying, verify:

- [ ] Login page loads without errors
- [ ] No "Forgot Password" button visible
- [ ] No email confirmation banner appears
- [ ] Instructors search works correctly
- [ ] Category/Field filters are hidden
- [ ] Sessions page loads without errors
- [ ] Sessions overview shows correct statistics
- [ ] Rate tab is not visible
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No linting errors

---

## Restoration Guide

When backend is ready:

1. **Search for TODO comments**: `// TODO: Uncomment when backend is ready`
2. **Review each section**: Check what needs to be restored
3. **Test incrementally**: Restore one feature at a time
4. **Update API calls**: Replace mock data/workarounds with real API calls
5. **Remove workarounds**: Clean up client-side filtering when server-side is ready
6. **Update documentation**: Remove this file or mark features as restored

---

## Notes

- All commented code is preserved with clear TODO markers
- No code was deleted, only commented out
- All changes follow existing code patterns
- TypeScript types remain intact
- No breaking changes to existing functionality
- All linting rules pass

---

**Maintained By**: Development Team  
**Contact**: For questions about these changes, refer to this documentation
