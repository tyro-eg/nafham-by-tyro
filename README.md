# Tyro by Nafham - English Learning Platform

A modern React application for online English learning with one-to-one and group sessions.

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v18.20.0+ or v20.0.0+ (recommended: v20.18.0)
- **npm**: v9.0.0+

> 💡 **Tip**: Use [nvm](https://github.com/nvm-sh/nvm) for easy Node version management. Run `nvm use` in the project root to automatically switch to the correct version.

```bash
# Clone and install
git clone https://gitlab.com/alzizoomar/nafham-by-nafham-app.git
cd tyro-by-nafham-app

# If using nvm (recommended)
nvm use

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your API URL

# Start development server
npm run dev
# Opens at http://localhost:4200
```

## 📚 Documentation

### Getting Started

- **[Setup Guides Index](./SETUP_GUIDES_INDEX.md)** - 📑 Complete guide index and quick reference
- **[Contributing Guide](./CONTRIBUTING.md)** - Development workflow and commit conventions
- **[Coding Standards](./.cursorrules)** - Project coding standards and best practices

### Feature Setup (Optional)

- **[Sentry Setup Guide](./SENTRY_SETUP_GUIDE.md)** - 🛡️ Error tracking and monitoring (10 min setup)
- **[Google Analytics Setup](./GOOGLE_ANALYTICS_SETUP_GUIDE.md)** - 📊 User analytics and insights (10 min setup)

### Project Documentation

- **[Architecture Guide](./ARCHITECTURE.md)** - System architecture and folder structure
- **[Configuration Guide](./ROOT_CONFIG.md)** - Setup and configuration details
- **[Branch & PR Conventions](./BRANCH_AND_PR_CONVENTIONS.md)** - Branch naming and PR title rules

## 🛠️ Tech Stack

### Core

- **React 18.3** - UI library with hooks and concurrent features
- **TypeScript 5.6** - Type-safe JavaScript
- **Vite 5.4** - Lightning-fast build tool and dev server
- **SCSS** - Advanced CSS with variables and nesting

### State Management (Hybrid Approach)

- **Redux Toolkit 2.2** with Redux Persist - Authentication state only
- **TanStack Query 5.59** - All server state (auto-caching, background refetching)

### Forms & Validation

- **React Hook Form 7.53** - Performant form handling
- **Zod 3.23** - TypeScript-first schema validation

### UI & Components

- **Material-UI 6.1** - Comprehensive component library
- **FullCalendar 6.1** - Advanced calendar functionality
- **React Slick** - Carousel components
- **Notistack 3.0** - Snackbar notifications

### Internationalization

- **react-i18next 15.1** - Multi-language support (English/Arabic with RTL)

### API & Networking

- **Axios 1.7** - Promise-based HTTP client
- **Kitsu 10.1** - JSON:API client

## ✨ Key Features

### For Students

- 🔍 Browse qualified English tutors with profiles and reviews
- 📅 Book one-to-one and group sessions
- 🎁 Free trial sessions for new students
- 📊 Session history and rating system
- 🗓️ Personal calendar management

### For Tutors

- 👤 Profile and bio management
- 🕐 Availability calendar with time slots
- 📝 Session scheduling and management
- 👥 Student management and ratings
- ⭐ Review system

## 🏗️ Project Structure

```
src/
├── assets/          # Images, styles, utilities
├── component/       # Shared components (Layout, Cards, etc.)
├── hooks/           # Custom React hooks (TanStack Query)
├── lib/             # Core utilities (query client, helpers)
├── modals/          # Modal components
├── modules/         # Feature modules (pages)
│   ├── home/        # Landing page
│   ├── auth/        # Login, Register
│   ├── sessions/    # Session management
│   ├── user/        # User profile & settings
│   └── ...
├── redux/           # Redux store (auth only)
├── schemas/         # Zod validation schemas
└── vite-env.d.ts    # Vite type definitions
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation.

## 🎯 Architecture Decisions

### Why Vite over Create React App?

- ⚡ 10-20x faster dev server startup
- 🔥 Instant Hot Module Replacement (HMR)
- 📦 50%+ faster builds
- 🌳 Better tree-shaking = smaller bundles

### Why TanStack Query?

- 🗄️ Automatic caching reduces API calls
- 🔄 Request deduplication (multiple requests = single API call)
- 📡 Background refetching keeps data fresh
- ⚙️ Built-in loading/error states
- ⚡ Optimistic updates for better UX

### Why React Hook Form + Zod?

- 🚀 Better performance (less re-renders)
- 📦 Smaller bundle size
- 🎯 Excellent TypeScript support
- ✅ Type-safe validation with Zod
- 🎨 Simpler API

### Hybrid State Management Approach

- **Redux** → Authentication state only (persisted with Redux Persist)
- **TanStack Query** → All server data (instructors, sessions, calendar)
- **React State** → Local UI state

**Benefits**:

- Simple, reliable auth persistence
- Automatic server state synchronization
- Minimal Redux boilerplate
- Better performance overall

## 📝 Development Scripts

```bash
# Development
npm run dev              # Start dev server (port 4200)
npm run build            # Production build
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix ESLint issues
npm run format           # Format code with Prettier
npm run format:check     # Check formatting without fixing

# Type Checking
npm run tsc              # TypeScript type check
```

## 🔧 Environment Variables

Create a `.env.local` file:

```bash
# Required: API Base URL
VITE_API_BASE_URL=https://tyro-backend.onrender.com/api/v1

# Optional: Feature flags
# VITE_ENABLE_ANALYTICS=false
# VITE_ENABLE_DEV_TOOLS=true
```

**Important**: All Vite environment variables must be prefixed with `VITE_` to be accessible in the application.

## 📖 Usage Examples

### TanStack Query Hooks

**Fetch Instructors:**

```typescript
import { useInstructors, useInstructor } from './hooks/useInstructors';

// List with pagination
const { data, isLoading } = useInstructors(pageNumber, pageSize);

// Single instructor
const { data: instructor } = useInstructor(instructorId);
```

**Manage Sessions:**

```typescript
import { useSessions, useBookTrialSession } from './hooks/useSessions';

// Fetch sessions
const { data: sessions } = useSessions(pageNumber, pageSize);

// Book trial session
const bookTrial = useBookTrialSession();
bookTrial.mutate(sessionData);
```

**Calendar Management:**

```typescript
import { useSlots, useCreateSlots } from './hooks/useCalendar';

// Fetch availability slots
const { data: slots } = useSlots(userId, fromDate, toDate);

// Create new slots
const createSlots = useCreateSlots();
createSlots.mutate(slotsArray);
```

### Form Validation with Zod

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from './schemas/authSchemas';

const {
  control,
  handleSubmit,
  formState: { errors },
} = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
});
```

Validation schemas are located in `src/schemas/`:

- `authSchemas.ts` - Login, register, password operations
- `userSchemas.ts` - Profile updates, contact details
- `sessionSchemas.ts` - Session booking and rating forms

### Internationalization

```typescript
import { useTranslation } from 'react-i18next';

function Component() {
  const { t, i18n } = useTranslation();

  return (
    <div dir={i18n.dir()}>
      <h1>{t('HEADER.WELCOME')}</h1>
      <button onClick={() => i18n.changeLanguage('ar')}>
        العربية
      </button>
    </div>
  );
}
```

Translation files: `src/component/i18next/locales/`

## 🎨 Styling

- **SCSS** for component styles
- **Material-UI** theme with RTL support
- **Responsive design** with breakpoints
- **CSS Modules** naming: `component-name.styles.scss`

## 🚀 Performance Optimizations

1. **Code Splitting** - Lazy-loaded routes with `React.lazy()`
2. **Smart Caching** - TanStack Query caches all API responses
3. **Request Deduplication** - Multiple identical requests = one API call
4. **Optimized Builds** - Vite's efficient bundling and tree-shaking
5. **Background Refetching** - Keeps data fresh without blocking UI
6. **Memoization** - `useMemo` and `useCallback` for expensive operations

## 🌐 Browser Support

**Development**:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Production**:

- Modern browsers (>0.2% market share)
- No IE11 support

## 🤝 Contributing

1. Create a feature branch from `development`
2. Make your changes following the established patterns
3. Run `npm run lint` to ensure code quality
4. Run `npm run format` to format code
5. Create a merge request to `development`

## 📦 Deployment

The application is deployed on render.com with automatic deployments from the `main` branch.

## 📄 License

Proprietary - All rights reserved

## 💬 Support

For issues, questions, or contributions, contact the development team.

---

**Built with ❤️ using React, TypeScript, and TanStack Query**
