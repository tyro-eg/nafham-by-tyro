# Redux State Management Documentation

This document provides comprehensive documentation for the **Redux** state management after the migration to TanStack Query, completed on October 31, 2025.

---

## 📂 Directory Overview

```
redux/
├── store.ts              # Redux store configuration with persistence
├── root-reducer.ts       # Root reducer combining all slices
└── user/                 # User slice (authentication state)
    ├── user.slice.ts     # User state management
    └── user.selectors.ts # Memoized user selectors
```

---

## 🎯 Purpose

After the migration to TanStack Query, **Redux is now exclusively used for client-side state that requires persistence**. Specifically:

- **Current User Authentication State**: Stores authenticated user information that needs to persist across page reloads

### What Redux Does NOT Handle Anymore:

- ❌ **Sessions Data**: Managed by `useSessions` hook (TanStack Query)
- ❌ **Instructors Data**: Managed by `useInstructors` hook (TanStack Query)
- ❌ **Calendar Data**: Managed by `useCalendar` hook (TanStack Query)
- ❌ **Any Server-Side Data**: All server state is now managed by TanStack Query for better caching, synchronization, and invalidation

---

## 🏗️ Architecture

### Store Configuration (`store.ts`)

**Purpose**: Configures the Redux store with Redux Toolkit and Redux Persist.

**Features**:
- ✅ Redux Toolkit for simplified Redux setup
- ✅ Redux Persist for localStorage persistence
- ✅ Typed hooks (`useAppDispatch`, `useAppSelector`)
- ✅ DevTools enabled in development
- ✅ Serializable check for Redux Persist actions

**Configuration**:

```typescript
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Persist Configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'], // Only persist user state
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Store Configuration
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const persistor = persistStore(store);
export default store;
```

**Key Exports**:
- `store`: Main Redux store instance
- `persistor`: Redux Persist persistor instance
- `RootState`: TypeScript type for the entire state tree
- `AppDispatch`: TypeScript type for dispatch function
- `useAppDispatch`: Typed useDispatch hook
- `useAppSelector`: Typed useSelector hook

---

### Root Reducer (`root-reducer.ts`)

**Purpose**: Combines all feature slices into a single root reducer.

**Current Slices**:
- `user`: User authentication state

**Structure**:

```typescript
import { combineReducers } from '@reduxjs/toolkit';
import userReducer from './user/user.slice';

const rootReducer = combineReducers({
  user: userReducer,
});

export default rootReducer;
```

**Why Only One Slice?**
After migrating to TanStack Query, Redux is no longer needed for server state. The `user` slice is the only remaining slice because:
1. User data needs to persist across page reloads
2. User authentication state is client-side state
3. It's used across many components for conditional rendering and access control

---

## 👤 User Slice

### State Structure (`user/user.slice.ts`)

**Purpose**: Manages current authenticated user state with persistence.

**State Interface**:

```typescript
interface UserState {
  currentUser: CurrentUser | null;
}
```

**Initial State**:

```typescript
const initialState: UserState = {
  currentUser: null,
};
```

**Actions**:

#### 1. `setCurrentUser`

**Purpose**: Sets the current authenticated user.

**When to use**:
- After successful login
- After registration
- When refreshing user data

**Usage**:

```typescript
import { useAppDispatch } from '@/redux/store';
import { setCurrentUser } from '@/redux/user/user.slice';

const dispatch = useAppDispatch();

// After successful login
dispatch(setCurrentUser({
  id: 1,
  email: 'user@example.com',
  first_name: 'John',
  last_name: 'Doe',
  type: 'users',
  email_confirmed: true,
  // ... other user fields
}));
```

#### 2. `clearCurrentUser`

**Purpose**: Clears the current user (logout).

**When to use**:
- On user logout
- On session expiration
- On authentication error

**Usage**:

```typescript
import { useAppDispatch } from '@/redux/store';
import { clearCurrentUser } from '@/redux/user/user.slice';

const dispatch = useAppDispatch();

// On logout
dispatch(clearCurrentUser());
```

---

### Selectors (`user/user.selectors.ts`)

**Purpose**: Provides memoized selectors for accessing user state.

**Available Selectors**:

#### `selectCurrentUser`

**Purpose**: Returns the current authenticated user or null.

**Why Memoized?**
Uses `createSelector` from Redux Toolkit to memoize the result. This prevents unnecessary re-renders when the user state hasn't changed.

**Usage**:

```typescript
import { useAppSelector } from '@/redux/store';
import { selectCurrentUser } from '@/redux/user/user.selectors';

const MyComponent = () => {
  const currentUser = useAppSelector(selectCurrentUser);

  if (!currentUser) {
    return <LoginPrompt />;
  }

  return (
    <div>
      <h1>Welcome, {currentUser.first_name}!</h1>
      <p>Email: {currentUser.email}</p>
    </div>
  );
};
```

---

## 🔌 Integration Patterns

### 1. Using Redux in Components

**Import Pattern**:

```typescript
import { useAppSelector, useAppDispatch } from '@/redux/store';
import { selectCurrentUser } from '@/redux/user/user.selectors';
import { setCurrentUser, clearCurrentUser } from '@/redux/user/user.slice';
```

**Reading State**:

```typescript
const MyComponent = () => {
  const currentUser = useAppSelector(selectCurrentUser);
  
  // Use current user
  console.log(currentUser?.first_name);
};
```

**Updating State**:

```typescript
const MyComponent = () => {
  const dispatch = useAppDispatch();
  
  const handleLogin = async (credentials) => {
    const user = await loginAPI(credentials);
    dispatch(setCurrentUser(user));
  };
  
  const handleLogout = () => {
    dispatch(clearCurrentUser());
  };
};
```

---

### 2. Conditional Rendering Based on Auth

```typescript
const Header = () => {
  const currentUser = useAppSelector(selectCurrentUser);

  return (
    <header>
      <Logo />
      {currentUser ? (
        <>
          <ProfileMenu user={currentUser} />
          <LogoutButton />
        </>
      ) : (
        <>
          <LoginButton />
          <RegisterButton />
        </>
      )}
    </header>
  );
};
```

---

### 3. Protected Routes

```typescript
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/redux/store';
import { selectCurrentUser } from '@/redux/user/user.selectors';

const ProtectedRoute = ({ children }) => {
  const currentUser = useAppSelector(selectCurrentUser);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Usage
<Route 
  path="/my_sessions" 
  element={
    <ProtectedRoute>
      <MySessions />
    </ProtectedRoute>
  } 
/>
```

---

### 4. User Type-Based Rendering

```typescript
const Dashboard = () => {
  const currentUser = useAppSelector(selectCurrentUser);

  if (currentUser?.type === 'tutors') {
    return <TutorDashboard />;
  }

  return <StudentDashboard />;
};
```

---

## 🔄 Redux vs TanStack Query

### When to Use Redux:

✅ **Client-side state that needs persistence**:
- Current user authentication
- UI preferences (theme, language) - if needed
- Shopping cart - if not tied to user account

✅ **Global UI state**:
- Modal open/close states (if shared across routes)
- Notification preferences

### When to Use TanStack Query:

✅ **Server state**:
- API data (sessions, instructors, courses)
- User profile data (can be refetched)
- Any data that can be cached and invalidated

✅ **Asynchronous operations**:
- Fetching, creating, updating, deleting data
- Optimistic updates
- Background refetching

---

## 📦 Redux Persist

### Configuration:

```typescript
const persistConfig = {
  key: 'root',
  storage,               // localStorage
  whitelist: ['user'],   // Only persist user slice
};
```

### How It Works:

1. **On State Change**: Redux Persist saves the user state to localStorage
2. **On App Load**: Redux Persist hydrates the state from localStorage
3. **On Logout**: `clearCurrentUser` action clears both Redux state and localStorage

### Debugging Persist:

```typescript
// In browser console
localStorage.getItem('persist:root');
// Returns: {"user":"{\"currentUser\":{...}}","_persist":{"version":-1,"rehydrated":true}}

// Clear persisted state
localStorage.removeItem('persist:root');
```

---

## 🎨 Best Practices

### 1. Always Use Typed Hooks

❌ **Bad**:
```typescript
import { useDispatch, useSelector } from 'react-redux';

const currentUser = useSelector((state) => state.user.currentUser);
const dispatch = useDispatch();
```

✅ **Good**:
```typescript
import { useAppSelector, useAppDispatch } from '@/redux/store';
import { selectCurrentUser } from '@/redux/user/user.selectors';

const currentUser = useAppSelector(selectCurrentUser);
const dispatch = useAppDispatch();
```

---

### 2. Use Selectors, Not Direct State Access

❌ **Bad**:
```typescript
const currentUser = useAppSelector((state) => state.user.currentUser);
```

✅ **Good**:
```typescript
const currentUser = useAppSelector(selectCurrentUser);
```

**Why?** Selectors are memoized and can be easily updated if state structure changes.

---

### 3. Handle Null User State

```typescript
const currentUser = useAppSelector(selectCurrentUser);

// Safe navigation
const userName = currentUser?.first_name || 'Guest';

// Conditional rendering
if (!currentUser) {
  return <LoginPrompt />;
}

// Type narrowing
if (currentUser.type === 'tutors') {
  // TypeScript knows currentUser is not null here
}
```

---

### 4. Keep Redux State Minimal

Only store what needs to persist or is truly global. Don't store:
- Derived data (calculate on the fly)
- Temporary UI state (use useState)
- Server data (use TanStack Query)

---

## 🧪 Testing

### Testing Components with Redux:

```typescript
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '@/redux/user/user.slice';

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      user: userReducer,
    },
    preloadedState: initialState,
  });
};

describe('MyComponent', () => {
  it('should display user name when authenticated', () => {
    const mockStore = createMockStore({
      user: {
        currentUser: {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          // ... other required fields
        },
      },
    });

    render(
      <Provider store={mockStore}>
        <MyComponent />
      </Provider>
    );

    expect(screen.getByText('Welcome, John!')).toBeInTheDocument();
  });
});
```

---

## 🐛 Common Issues & Solutions

### Issue 1: State Not Persisting

**Problem**: User state is lost on page reload.

**Solution**:
1. Check Redux Persist configuration
2. Verify `whitelist` includes `'user'`
3. Check localStorage permissions
4. Clear old persisted state: `localStorage.removeItem('persist:root')`

---

### Issue 2: Stale User Data

**Problem**: User data is outdated after profile update.

**Solution**:
```typescript
// After updating user profile via API
const updatedUser = await updateUserProfile(data);

// Update Redux state
dispatch(setCurrentUser(updatedUser));
```

---

### Issue 3: Type Errors with useSelector

**Problem**: TypeScript errors when using `useSelector`.

**Solution**: Always use `useAppSelector` instead:
```typescript
import { useAppSelector } from '@/redux/store';
const currentUser = useAppSelector(selectCurrentUser);
```

---

## 📊 State Structure

### Complete State Tree:

```typescript
{
  user: {
    currentUser: {
      id: number;
      email: string;
      first_name: string;
      last_name: string;
      phone_number: string;
      type: 'users' | 'tutors';
      email_confirmed: boolean;
      // ... other CurrentUser fields
    } | null;
  };
}
```

---

## 🚀 Future Considerations

### Potential Additions:

1. **UI Preferences**:
   ```typescript
   interface PreferencesState {
     theme: 'light' | 'dark';
     language: 'en' | 'ar';
     notifications: boolean;
   }
   ```

2. **Shopping Cart** (if not tied to server):
   ```typescript
   interface CartState {
     items: CartItem[];
     total: number;
   }
   ```

3. **Draft State**:
   ```typescript
   interface DraftState {
     sessionBooking: Partial<SessionData>;
     profileUpdate: Partial<UserData>;
   }
   ```

**Note**: Only add new slices if they represent client-side state that needs persistence. For server state, always use TanStack Query.

---

## 📚 Related Documentation

- [TanStack Query Hooks](../hooks/README.md)
- [Assets Types](../assets/types.ts)
- [Authentication Hooks](../hooks/useAuth.ts)
- [Store Setup](./store.ts)

---

## 🔗 External Resources

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Redux Persist Documentation](https://github.com/rt2zz/redux-persist)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [When to Use Redux vs React Query](https://tkdodo.eu/blog/react-query-and-forms)

---

## ✅ Migration Summary

### What Was Removed:

- ❌ **Calendar Slice**: Migrated to `useCalendar` hooks
- ❌ **Session Slice**: Migrated to `useSessions` hooks
- ❌ **Instructor Slice**: Migrated to `useInstructors` hooks
- ❌ **All Async Thunks**: Replaced with TanStack Query mutations
- ❌ **Loading/Error States**: Now handled by TanStack Query

### What Remains:

- ✅ **User Slice**: For authentication state persistence
- ✅ **Redux Store**: Minimal, focused on client-side state
- ✅ **Redux Persist**: For user session persistence

### Benefits:

1. **Simpler State Management**: Redux only for what it's good at (global, persisted state)
2. **Better Caching**: TanStack Query handles all server state caching
3. **Automatic Refetching**: Background updates without manual actions
4. **Optimistic Updates**: Built-in support in TanStack Query
5. **Less Boilerplate**: No more actions, reducers, thunks for API calls
6. **Better DevTools**: TanStack Query DevTools show server state separately

---

**Last Updated**: October 31, 2025  
**Migrated By**: AI Assistant  
**Status**: ✅ Complete - Minimized to Essential Client State Only

