# Tyro Application Architecture

This document provides a comprehensive overview of the Tyro application architecture, folder structure, and documentation navigation.

---

## 📚 Documentation Index

### Getting Started
- **[README.md](./README.md)** - Project overview, quick start, tech stack
- **[ROOT_CONFIG.md](./ROOT_CONFIG.md)** - Configuration, environment setup, build tools

### Code Documentation
- **[src/assets/](./src/assets/README.md)** - Utilities, styles, and static assets
- **[src/component/](./src/component/README.md)** - Shared UI components
- **[src/hooks/](./src/hooks/README.md)** - Custom React hooks (TanStack Query)
- **[src/lib/](./src/lib/README.md)** - Core utilities and helpers
- **[src/modals/](./src/modals/README.md)** - Modal components
- **[src/modules/](./src/modules/README.md)** - Feature modules and pages
- **[src/redux/](./src/redux/README.md)** - Redux state management
- **[src/schemas/](./src/schemas/README.md)** - Zod validation schemas

---

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Application                         │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Redux     │  │  TanStack    │  │  React Router    │  │
│  │   (Auth)    │  │   Query      │  │   (Navigation)   │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
│         │                 │                    │            │
│         └─────────────────┴────────────────────┘            │
│                           │                                 │
│         ┌─────────────────┴─────────────────┐              │
│         │                                    │              │
│    ┌────▼────┐                          ┌───▼───┐          │
│    │ Modules │                          │ Hooks │          │
│    │ (Pages) │◄────────────────────────►│(Query)│          │
│    └────┬────┘                          └───┬───┘          │
│         │                                    │              │
│         └────────────┬───────────────────────┘              │
│                      │                                      │
│         ┌────────────▼──────────────┐                      │
│         │                            │                      │
│    ┌────▼────┐  ┌────────┐  ┌──────▼──────┐               │
│    │Components│  │ Modals │  │   Schemas   │               │
│    │(Shared)  │  │        │  │(Validation) │               │
│    └─────────┘  └────────┘  └─────────────┘               │
│                                                              │
│                           │                                 │
│                    ┌──────▼──────┐                          │
│                    │     API     │                          │
│                    │ (Axios/TQ)  │                          │
│                    └──────┬──────┘                          │
└────────────────────────────┼────────────────────────────────┘
                             │
                     ┌───────▼────────┐
                     │  Backend API   │
                     │ (REST/JSON:API)│
                     └────────────────┘
```

---

## 📁 Folder Structure

### Root Level
```
tyro-by-nafham-app/
├── public/              # Static assets (favicon, manifest)
├── src/                 # Source code
├── index.html           # HTML entry point
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript config
├── package.json         # Dependencies and scripts
├── .env.local           # Local environment variables
├── .eslintrc.json       # ESLint config
├── .prettierrc          # Prettier config
├── README.md            # Main documentation
├── ARCHITECTURE.md      # This file
└── ROOT_CONFIG.md       # Configuration guide
```

### Source Code (`src/`)
```
src/
├── index.tsx            # React app entry point
├── App.tsx              # Main app component
├── App.scss             # Global app styles
│
├── assets/              # Static assets and utilities
│   ├── images/          # Images and SVGs
│   ├── styles/          # Global SCSS files
│   ├── types.ts         # Shared TypeScript types
│   └── utils/           # Utility functions
│
├── component/           # Shared UI components
│   ├── app/             # Core app components (Layout, Routes)
│   ├── card/            # Card components
│   ├── carousel/        # Carousel component
│   ├── i18next/         # Internationalization
│   ├── instructor-*     # Instructor-specific components
│   ├── login/           # Login component
│   ├── material-theme/  # MUI theme provider
│   └── ...              # Other shared components
│
├── hooks/               # Custom React hooks
│   ├── useAuth.ts       # Authentication hooks
│   ├── useCalendar.ts   # Calendar/availability hooks
│   ├── useInstructors.ts # Instructor hooks
│   └── useSessions.ts   # Session management hooks
│
├── lib/                 # Core utilities
│   ├── queryClient.ts   # TanStack Query client
│   ├── queryKeys.ts     # Query key factory
│   └── cn.ts            # Class name utility
│
├── modals/              # Modal components
│   ├── login-modal/
│   ├── register-modal/
│   ├── calendar-stepper-modal/
│   └── ...              # Other modals
│
├── modules/             # Feature modules (pages)
│   ├── home/            # Landing page
│   ├── auth/            # Authentication pages
│   ├── sessions/        # Session management
│   ├── private-sessions/ # Private session booking
│   ├── user/            # User profile and settings
│   ├── header/          # Header components
│   ├── footer/          # Footer component
│   └── ...              # Other modules
│
├── redux/               # Redux state management
│   ├── store.ts         # Redux store configuration
│   ├── root-reducer.ts  # Root reducer
│   └── user/            # User slice (auth only)
│
└── schemas/             # Zod validation schemas
    ├── authSchemas.ts   # Authentication schemas
    ├── userSchemas.ts   # User profile schemas
    └── sessionSchemas.ts # Session schemas
```

---

## 🔄 Data Flow

### 1. Authentication Flow
```
User Login
    ↓
Login Component (modules/auth/signin)
    ↓
useSignIn Hook (hooks/useAuth.ts)
    ↓
TanStack Query Mutation
    ↓
API Call (axios)
    ↓
Response → Dispatch to Redux
    ↓
Redux Persist → localStorage
    ↓
User Authenticated ✓
```

### 2. Data Fetching Flow
```
Component Mounts
    ↓
Custom Hook (e.g., useInstructors)
    ↓
TanStack Query useQuery
    ↓
Check Cache
    ├─ Hit → Return Cached Data
    └─ Miss → Fetch from API
          ↓
       Cache Result
          ↓
       Return to Component
```

### 3. Form Submission Flow
```
User Fills Form
    ↓
React Hook Form (with Zod validation)
    ↓
Validation (schemas/)
    ├─ Invalid → Show Errors
    └─ Valid → Continue
          ↓
       onSubmit Handler
          ↓
       TanStack Query Mutation
          ↓
       API Call
          ↓
       Invalidate Queries (refresh data)
          ↓
       Success Notification
```

---

## 🎯 State Management Strategy

### Redux (Client State) - Authentication Only
- **What**: User authentication state
- **Why**: Needs to persist across page reloads
- **Where**: `src/redux/`
- **When**: Login, logout, session management

```typescript
// Current user state (persisted)
{
  user: {
    currentUser: CurrentUser | null
  }
}
```

### TanStack Query (Server State) - Everything Else
- **What**: All server data (instructors, sessions, calendar)
- **Why**: Automatic caching, background refetching, request deduplication
- **Where**: `src/hooks/`
- **When**: All API data fetching and mutations

```typescript
// Managed by TanStack Query
- useInstructors()      // Fetch instructors
- useSessions()         // Fetch sessions
- useSlots()            // Fetch calendar slots
- useBookTrialSession() // Mutation hooks
```

### Local React State - UI State
- **What**: Component-specific UI state
- **Why**: Doesn't need to be shared or persisted
- **Where**: Within components using `useState`, `useReducer`
- **When**: Modals open/close, form inputs, toggles, etc.

---

## 🛠️ Technology Stack Deep Dive

### Frontend Framework
- **React 18.3** - Concurrent features, automatic batching, improved SSR
- **TypeScript 5.6** - Type safety, better IDE support, fewer runtime errors

### Build & Dev Tools
- **Vite 5.4** - Fast HMR, optimized builds, plugin ecosystem
- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting

### State Management
- **Redux Toolkit 2.2** - Simplified Redux with less boilerplate
- **Redux Persist** - LocalStorage persistence for auth state
- **TanStack Query 5.59** - Powerful async state management
  - Automatic background refetching
  - Request deduplication
  - Cache management
  - Optimistic updates
  - Infinite queries support

### Forms & Validation
- **React Hook Form 7.53** - Performant, minimal re-renders
- **Zod 3.23** - TypeScript-first schema validation
- **@hookform/resolvers** - Zod integration with React Hook Form

### UI & Styling
- **Material-UI 6.1** - Comprehensive component library
  - Theme customization
  - RTL support
  - Responsive design
- **SCSS** - CSS preprocessing
- **FullCalendar 6.1** - Advanced calendar with drag & drop
- **React Slick** - Carousel/slider component

### Internationalization
- **i18next 24.0** - Internationalization framework
- **react-i18next 15.1** - React bindings for i18next
- **i18next-browser-languagedetector** - Auto-detect user language
- Supports: English (LTR) and Arabic (RTL)

### HTTP & API
- **Axios 1.7** - Promise-based HTTP client
  - Interceptors for auth
  - Request/response transformers
- **Kitsu 10.1** - JSON:API client
  - Standardized API format
  - Relationship handling

### Notifications
- **Notistack 3.0** - Snackbar notification system
  - Stacking notifications
  - Customizable styles
  - Auto-dismiss

---

## 🔌 API Integration Patterns

### 1. Query Hooks (GET requests)
```typescript
// src/hooks/useInstructors.ts
export const useInstructors = (page: number, size: number) => {
  return useQuery({
    queryKey: queryKeys.instructors.list({ pageNumber: page, pageSize: size }),
    queryFn: () => fetchInstructors(page, size),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

### 2. Mutation Hooks (POST/PUT/DELETE requests)
```typescript
// src/hooks/useAuth.ts
export const useSignIn = () => {
  const dispatch = useAppDispatch();
  
  return useMutation({
    mutationFn: (credentials: LoginFormData) => signInAPI(credentials),
    onSuccess: (user) => {
      dispatch(setCurrentUser(user));
      queryClient.invalidateQueries({ queryKey: queryKeys.user.details() });
    },
  });
};
```

### 3. Query Key Factory
```typescript
// src/lib/queryKeys.ts
export const queryKeys = {
  instructors: {
    all: () => ['instructors'] as const,
    list: (filters: PaginationParams) => 
      ['instructors', 'list', filters] as const,
    detail: (id: number) => 
      ['instructors', 'detail', id] as const,
  },
};
```

---

## 🧩 Component Patterns

### 1. Page Components (Modules)
Located in `src/modules/`, these are top-level page components:
```typescript
// src/modules/sessions/index.component.tsx
const Sessions: FC = () => {
  const { data: sessions, isLoading } = useSessions();
  
  return (
    <div className="sessions-container">
      {isLoading ? <Loader /> : <SessionsList sessions={sessions} />}
    </div>
  );
};
```

### 2. Shared Components
Located in `src/component/`, reusable across pages:
```typescript
// src/component/instructor-card/instructor-card.component.tsx
interface InstructorCardProps {
  instructor: Instructor;
  onBook: () => void;
}

const InstructorCard: FC<InstructorCardProps> = ({ instructor, onBook }) => {
  // Component logic
};
```

### 3. Modal Components
Located in `src/modals/`, dialog-based UI:
```typescript
// src/modals/login-modal/login-modal.component.tsx
interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

const LoginModal: FC<LoginModalProps> = ({ open, onClose }) => {
  // Modal logic
};
```

---

## 🎨 Styling Approach

### 1. Global Styles
- `src/assets/styles/main.scss` - Imports all global styles
- `src/assets/styles/variables.scss` - SCSS variables
- `src/assets/styles/mixins.scss` - SCSS mixins
- `src/assets/styles/utilities.scss` - Utility classes

### 2. Component Styles
- Co-located with components
- Naming: `component-name.styles.scss`
- BEM methodology for class names

### 3. Material-UI Theme
- Custom theme in `src/component/material-theme/`
- RTL support for Arabic
- Font customization (Inter for EN, Tajawal for AR)

---

## 🌐 Internationalization (i18n)

### Setup
- Translation files: `src/component/i18next/locales/`
- Supported languages: English (`en`), Arabic (`ar`)
- Auto-detection based on browser language

### Usage
```typescript
import { useTranslation } from 'react-i18next';

const Component = () => {
  const { t, i18n } = useTranslation();
  
  return (
    <div dir={i18n.dir()}>
      <h1>{t('HEADER.WELCOME')}</h1>
      <button onClick={() => i18n.changeLanguage('ar')}>
        Switch to Arabic
      </button>
    </div>
  );
};
```

### RTL Support
- Automatic direction switching
- RTL-aware components
- Mirrored layouts for Arabic

---

## 🔐 Authentication & Authorization

### Authentication Flow
1. User submits credentials
2. `useSignIn` hook calls API
3. On success, user data stored in Redux
4. Redux Persist saves to localStorage
5. Subsequent requests include auth token (via Axios interceptor)

### Protected Routes
```typescript
// src/component/guarded-route/guarded-route.component.tsx
const GuardedRoute: FC<Props> = ({ children }) => {
  const currentUser = useAppSelector(selectCurrentUser);
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
};
```

### User Types
- **Students**: Can browse, book sessions, rate instructors
- **Tutors**: Can manage profile, availability, view bookings

---

## 📱 Responsive Design

### Breakpoints
```scss
// src/assets/styles/variables.scss
$breakpoint-xs: 576px;   // Extra small devices
$breakpoint-sm: 768px;   // Small devices
$breakpoint-md: 992px;   // Medium devices
$breakpoint-lg: 1200px;  // Large devices
$breakpoint-xl: 1400px;  // Extra large devices
```

### Strategy
- Mobile-first approach
- Responsive grid system
- Collapsible navigation
- Touch-friendly interactions

---

## ⚡ Performance Optimizations

### Code Splitting
- Route-based code splitting with `React.lazy()`
- Dynamic imports for large libraries
- Separate vendor bundles

### Caching Strategy
- TanStack Query automatic caching (5 min default)
- Service worker for PWA (if enabled)
- Browser caching via headers

### Bundle Optimization
- Tree-shaking unused code
- Minification and compression
- Asset optimization (images, fonts)

### Runtime Performance
- `useMemo` for expensive calculations
- `useCallback` for callback optimization
- Virtual scrolling for long lists (where applicable)

---

## 🧪 Testing Strategy

### Unit Tests
- Component testing with React Testing Library
- Hook testing with `@testing-library/react-hooks`
- Utility function testing with Jest

### Integration Tests
- User flow testing
- API integration testing
- Form submission testing

### E2E Tests
- Critical user journeys
- Cross-browser testing
- Accessibility testing

---

## 🚀 Deployment

### Build Process
```bash
npm run build
```
- TypeScript compilation
- Asset optimization
- Bundle generation in `dist/`

### Environment Configuration
- Development: `.env.development`
- Production: `.env.production`
- Local: `.env.local` (overrides all)

### Deployment Platform
- **Current**: Render.com
- Auto-deploy from `main` branch
- Environment variables configured in platform

---

## 📊 Monitoring & Analytics

### Error Tracking
- Consider: Sentry integration
- Error boundaries in React

### Performance Monitoring
- Web Vitals tracking via `reportWebVitals`
- Optional: Google Analytics integration

---

## 🔍 Code Quality

### Linting
- ESLint with React and TypeScript rules
- Custom rules for React Hooks
- Pre-commit hooks (optional)

### Formatting
- Prettier for consistent code style
- Auto-format on save (IDE config)

### Type Safety
- Strict TypeScript configuration
- No implicit `any`
- Comprehensive type definitions

---

## 📚 Learning Resources

### Official Documentation
- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Material-UI](https://mui.com/)
- [Vite](https://vitejs.dev/)

### Internal Docs
- Component docs in `src/component/README.md`
- Hook docs in `src/hooks/README.md`
- More in each feature folder

---

## 🤝 Contributing

### Development Workflow
1. Pull latest from `development` branch
2. Create feature branch: `feature/your-feature-name`
3. Make changes following existing patterns
4. Run linter and formatter
5. Test thoroughly
6. Create merge request to `development`

### Code Standards
- Follow existing folder structure
- Write TypeScript (no `any` types)
- Document complex logic
- Add JSDoc comments for exported functions
- Use semantic commit messages

---

## 📝 Maintenance

### Regular Tasks
- Update dependencies monthly
- Review and update documentation
- Monitor bundle size
- Check and fix deprecation warnings

### Version Control
- Use semantic versioning
- Tag releases
- Maintain changelog

---

**Last Updated**: October 31, 2025  
**Architecture Version**: 2.0 (Post-TanStack Query Migration)  
**Status**: ✅ Production Ready

