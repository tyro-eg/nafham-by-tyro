# Lib Directory

## Purpose
This directory contains shared utility libraries, configurations, and helper functions used throughout the application. These are core utilities that don't fit into specific feature modules.

## Files Overview

### `/queryKeys.ts` - TanStack Query Key Factory
Centralized query key management using the factory pattern for type-safe, predictable cache keys.

#### Architecture
Query keys follow a hierarchical structure:
```typescript
['resource', 'scope', filters/params]
```

#### Benefits
- **Type Safety**: All keys are `as const` for literal type inference
- **Predictability**: Consistent structure across all queries
- **Cache Invalidation**: Easy to invalidate related queries
- **Debugging**: Clear, readable cache keys in DevTools

#### Query Key Structure

**Users/Profile**:
```typescript
queryKeys.users.all           // ['users']
queryKeys.users.lists()       // ['users', 'list']
queryKeys.users.list(filters) // ['users', 'list', filters]
queryKeys.users.details()     // ['users', 'detail']
queryKeys.users.detail(id)    // ['users', 'detail', id]
queryKeys.users.profile()     // ['users', 'profile']
```

**Instructors/Tutors**:
```typescript
queryKeys.instructors.all                // ['instructors']
queryKeys.instructors.lists()            // ['instructors', 'list']
queryKeys.instructors.list(page, size)   // ['instructors', 'list', { pageNumber, pageSize }]
queryKeys.instructors.details()          // ['instructors', 'detail']
queryKeys.instructors.detail(id)         // ['instructors', 'detail', id]
```

**Sessions**:
```typescript
queryKeys.sessions.all               // ['sessions']
queryKeys.sessions.lists()           // ['sessions', 'list']
queryKeys.sessions.list(page, size)  // ['sessions', 'list', { pageNumber, pageSize }]
queryKeys.sessions.infinite()        // ['sessions', 'infinite']
queryKeys.sessions.details()         // ['sessions', 'detail']
queryKeys.sessions.detail(id)        // ['sessions', 'detail', id]
```

**Calendar/Availability**:
```typescript
queryKeys.calendar.all                     // ['calendar']
queryKeys.calendar.slots()                 // ['calendar', 'slots']
queryKeys.calendar.userSlots(id, from, to) // ['calendar', 'slots', { userId, from, to }]
queryKeys.calendar.availabilities()        // ['calendar', 'availabilities']
queryKeys.calendar.availability(params)    // ['calendar', 'availabilities', params]
```

#### Usage Examples

**In Query Hooks**:
```typescript
export function useInstructor(id: number) {
  return useQuery({
    queryKey: queryKeys.instructors.detail(id),
    queryFn: () => fetchInstructor(id),
  });
}
```

**Cache Invalidation**:
```typescript
// Invalidate all instructor queries
queryClient.invalidateQueries({
  queryKey: queryKeys.instructors.all
});

// Invalidate specific instructor
queryClient.invalidateQueries({
  queryKey: queryKeys.instructors.detail(5)
});

// Invalidate all instructor lists (not details)
queryClient.invalidateQueries({
  queryKey: queryKeys.instructors.lists()
});
```

**Prefetching**:
```typescript
await queryClient.prefetchQuery({
  queryKey: queryKeys.instructors.list(1, 10),
  queryFn: () => fetchInstructors(1, 10),
});
```

---

### `/queryClient.ts` - TanStack Query Client Configuration
Global configuration for TanStack Query with custom defaults and error handling.

#### Configuration

**Stale Time**: `5 minutes`
- Data is considered fresh for 5 minutes
- No background refetch during this period
- Balances freshness with performance

**Garbage Collection Time**: `10 minutes`
- Inactive queries removed from cache after 10 minutes
- Formerly called `cacheTime` (renamed in v5)

**Retry Logic**:
- Failed queries retry up to 2 times
- Never retry on: 401 (Unauthorized), 403 (Forbidden), 404 (Not Found)
- Prevents unnecessary API calls for permanent errors

**Refetch Behavior**:
- `refetchOnWindowFocus: false` - Don't refetch when user returns to tab
- `refetchOnReconnect: true` - Do refetch when internet reconnects

#### Error Handling

**Query Errors**:
```typescript
onError: (error) => {
  // 401: Handled by axios interceptor (token refresh)
  // 404: Silently ignored (might be intentional)
  // Others: Logged to console
}
```

**Mutation Errors**:
```typescript
onError: (error) => {
  // Global fallback error notification
  // Individual mutations can override this
}
```

**Note**: Global mutation error handler provides fallback for mutations without their own `onError`. If a mutation defines `onError`, it takes precedence.

#### Usage

**Provider Setup** (in App root):
```typescript
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app */}
    </QueryClientProvider>
  );
}
```

**Manual Invalidation**:
```typescript
import { queryClient } from '@/lib/queryClient';

queryClient.invalidateQueries({ queryKey: ['sessions'] });
```

**Clear All Cache**:
```typescript
queryClient.clear(); // Used on sign out
```

#### DevTools Integration

TanStack Query DevTools can inspect:
- All cached queries
- Query states (loading, error, success)
- Cache keys
- Refetch behavior

Enable in development:
```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

---

### `/cn.ts` - Class Name Utility
Simple utility for conditionally merging CSS class names using `clsx`.

#### Purpose
Provides a clean API for combining class names, handling conditionals, and merging objects.

#### Implementation
```typescript
import clsx, { ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
```

#### Usage Examples

**Basic Class Merging**:
```typescript
cn('btn', 'btn-primary')
// Result: "btn btn-primary"
```

**Conditional Classes**:
```typescript
cn('btn', isActive && 'active', 'btn-large')
// Result: "btn active btn-large" (if isActive is true)
// Result: "btn btn-large" (if isActive is false)
```

**Object Syntax**:
```typescript
cn({
  'btn': true,
  'btn-primary': isPrimary,
  'btn-disabled': isDisabled,
  'btn-large': size === 'large'
})
```

**Mixed Syntax**:
```typescript
cn(
  'base-class',
  {
    'modifier-class': hasModifier,
    'state-class': isActive
  },
  isSpecial && 'special-class'
)
```

**With Tailwind/Utility Classes**:
```typescript
cn(
  'px-4 py-2 rounded',
  isLarge ? 'text-lg' : 'text-sm',
  { 'bg-blue-500': isPrimary, 'bg-gray-500': !isPrimary }
)
```

**Real Example from Codebase**:
```typescript
// From AppCard component
const buttonClasses = cn({
  card__btn: true,
  'card__btn--primary': type === 'primary' || type === 'special',
  'card__btn--secondary': type === 'secondary',
  'card__btn--disabled': type === 'disabled',
  'special-btn': type === 'special',
  'price-btn': !!priceConfig,
});

<Button className={buttonClasses}>...</Button>
```

#### Why Use `cn()` Instead of Direct `clsx()`?

1. **Shorter**: `cn()` vs `clsx()`
2. **Consistency**: Single utility across the codebase
3. **Extensibility**: Can add custom logic in the future (e.g., Tailwind merge)
4. **Convention**: Common pattern in modern React apps

#### Alternative: `twMerge` Integration
If using Tailwind CSS, you might want to merge conflicting utilities:

```typescript
import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

This would handle cases like:
```typescript
cn('p-4', 'p-2') // Returns "p-2" (later value wins)
```

Currently, the project uses BEM + SCSS, so `twMerge` is not needed.

---

## File Organization

```
src/lib/
├── queryKeys.ts      # TanStack Query cache key factory
├── queryClient.ts    # TanStack Query client config
├── cn.ts            # Class name utility
└── README.md        # This file
```

---

## Best Practices

### Query Keys

1. **Always use the factory**:
   ```typescript
   // ✅ GOOD
   queryKey: queryKeys.instructors.detail(id)
   
   // ❌ BAD
   queryKey: ['instructors', 'detail', id]
   ```

2. **Invalidate at the right level**:
   ```typescript
   // Invalidate all sessions (list + details)
   queryClient.invalidateQueries({ 
     queryKey: queryKeys.sessions.all 
   });
   
   // Invalidate only session lists (not individual details)
   queryClient.invalidateQueries({ 
     queryKey: queryKeys.sessions.lists() 
   });
   
   // Invalidate specific session
   queryClient.invalidateQueries({ 
     queryKey: queryKeys.sessions.detail(5) 
   });
   ```

3. **Use `as const` for literal types**:
   ```typescript
   // Ensures TypeScript infers exact tuple type
   ['sessions'] as const
   ```

### Query Client

1. **Don't create multiple clients**:
   ```typescript
   // ✅ GOOD - Import singleton
   import { queryClient } from '@/lib/queryClient';
   
   // ❌ BAD - Creates new client
   const queryClient = new QueryClient();
   ```

2. **Provide at app root**:
   ```typescript
   // Only wrap once at the top level
   <QueryClientProvider client={queryClient}>
     <App />
   </QueryClientProvider>
   ```

3. **Override defaults in hooks when needed**:
   ```typescript
   useQuery({
     queryKey: queryKeys.users.profile(),
     queryFn: fetchProfile,
     staleTime: 0, // Always refetch
     gcTime: Infinity, // Never garbage collect
   });
   ```

### Class Names

1. **Use `cn()` for conditional logic**:
   ```typescript
   // ✅ GOOD
   className={cn('btn', isActive && 'active')}
   
   // ❌ BAD
   className={`btn ${isActive ? 'active' : ''}`}
   ```

2. **Object syntax for multiple conditions**:
   ```typescript
   className={cn({
     'card': true,
     'card--highlighted': isHighlighted,
     'card--disabled': isDisabled,
   })}
   ```

---

## Dependencies

### External Packages
- `@tanstack/react-query` (v5.x) - Data fetching and caching
- `clsx` - Class name utility

### Internal Dependencies
- `@/assets/utils/toaster` - Notification system (used in queryClient error handler)

---

## Type Safety

### Query Keys
All query keys are typed as `readonly` tuples:
```typescript
const key = queryKeys.sessions.detail(5);
// Type: readonly ['sessions', 'detail', 5]
```

This ensures:
- TypeScript knows the exact structure
- Can't accidentally modify keys
- Better autocomplete in IDE

### Query Client
Uses TanStack Query's built-in types:
```typescript
QueryClient<{
  queries: QueryOptions;
  mutations: MutationOptions;
}>
```

### Class Names
Uses `clsx` types:
```typescript
type ClassValue = 
  | ClassArray
  | ClassDictionary
  | string
  | number
  | null
  | boolean
  | undefined;
```

---

## Future Improvements

1. **Query Keys**:
   - Add specific types for filter parameters (currently `any`)
   - Add course/curriculum query keys when those features are implemented
   - Consider splitting into separate files if it grows large

2. **Query Client**:
   - Add network status detection (online/offline handling)
   - Implement optimistic update helpers
   - Add query persistence for offline support

3. **Class Names**:
   - Add `tailwind-merge` if migrating to Tailwind CSS
   - Consider adding a `cva` (class-variance-authority) wrapper for component variants

---

## Migration Notes

This lib directory was created during the Redux → TanStack Query migration:

- **Query Keys**: Replaced manual string keys scattered across Redux actions
- **Query Client**: Centralized configuration that was previously in multiple files
- **cn()**: Already existed, moved here during refactor for better organization

The factory pattern for query keys prevents bugs from typos and ensures consistent cache behavior.

See `MODERNIZATION_COMPLETE.md` for full migration details.

