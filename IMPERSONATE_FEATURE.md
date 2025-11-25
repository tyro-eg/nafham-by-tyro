# Impersonate Feature Implementation

## Overview

Implemented admin impersonation feature that allows admins to log in as any user via a special URL with a JWT token.

## How It Works

### URL Format

```
/impersonate?token=JWT_TOKEN&impersonator_email=admin@example.com
```

### Flow

1. Admin clicks "Impersonate" button in admin panel
2. Redirected to frontend with token and impersonator email in URL params
3. Frontend extracts token from URL (works on any host - production or localhost)
4. Clears current user data from Redux and localStorage
5. Sets new token in localStorage
6. Calls `GET /api/v1/me` with the token to fetch user data
7. Saves user data and token like normal login
8. Redirects to home page (`/`)
9. User is now logged in as the impersonated user

### Error Handling

- If token is missing → redirect to `/login`
- If token is invalid/expired → show error message and redirect to `/login`
- If API call fails → show error message and redirect to `/login`

## Files Created

### 1. Component

- `src/modules/auth/impersonate/impersonate.component.tsx`
  - Main impersonation component
  - Extracts URL params
  - Handles impersonation flow
  - Shows loading state

- `src/modules/auth/impersonate/impersonate.styles.scss`
  - Styling for impersonation loading screen
  - Gradient background with loading spinner

### 2. Hook

- `src/hooks/useAuth.ts` (modified)
  - Added `useImpersonate()` hook
  - Handles clearing old user data
  - Fetches new user data with token
  - Saves data to localStorage and Redux
  - Error handling with user feedback

### 3. Routes

- `src/component/app/Routes.tsx` (modified)
  - Added `/impersonate` route
  - No authentication required (public route)

### 4. Translations

- `src/component/i18next/locales/en/translation.json`
  - Added `IMPERSONATE.LOADING`: "Logging you in..."

- `src/component/i18next/locales/ar/translation.json`
  - Added `IMPERSONATE.LOADING`: "جاري تسجيل الدخول..."

## API Endpoint

- **Endpoint**: `GET /api/v1/me`
- **Headers**: `Authorization: <token>`
- **Response**: User data with headers containing auth tokens

## Exit Impersonation

- No special exit required
- User can logout normally using the standard logout button
- Logout clears all user data and redirects to login

## Testing

### Production

```
https://nafham-by-tyro.vercel.app/impersonate?token=YOUR_TOKEN&impersonator_email=admin@example.com
```

### Localhost

```
http://localhost:5173/impersonate?token=YOUR_TOKEN&impersonator_email=admin@example.com
```

## Security Notes

1. Token is validated by the backend (`/api/v1/me` endpoint)
2. `impersonator_email` is only for logging purposes (not stored)
3. Token is stored like normal authentication token
4. Old user data is completely cleared before impersonation
5. All TanStack Query cache is cleared

## User Experience

1. ✅ Loading spinner with message during impersonation
2. ✅ Success toast notification on successful login
3. ✅ Error toast notification on failure
4. ✅ Automatic redirect to home after success
5. ✅ Automatic redirect to login after error
6. ✅ Works in both English and Arabic
7. ✅ Responsive design

## Implementation Details

### State Management

- Uses Redux for user state (`setCurrentUser`, `clearCurrentUser`)
- Uses TanStack Query for API calls
- Uses localStorage for token persistence

### Error Messages

- "Impersonation failed. Invalid or expired token."
- Shown via toast notification (Notistack)

### Success Flow

1. Show loading spinner
2. Clear old user
3. Set new token
4. Fetch user data
5. Save to localStorage
6. Update Redux
7. Clear query cache
8. Show success message
9. Redirect to home

### Error Flow

1. Show loading spinner
2. Attempt impersonation
3. On error: clear localStorage
4. Show error message
5. Redirect to login

## Logging

- Impersonation attempts are logged to console with impersonator email
- Format: `Impersonation initiated by: admin@example.com`

## Dependencies

- react-router-dom (URL params, navigation)
- @tanstack/react-query (mutations, query client)
- @mui/material (UI components)
- react-i18next (translations)
- axios (API calls)

---

**Status**: ✅ Complete and Ready for Testing
**Date**: November 25, 2025
