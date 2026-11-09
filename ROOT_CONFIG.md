# Root Configuration Documentation

This document provides comprehensive documentation for all **root-level configuration files** in the Tyro application.

---

## 📂 Project Structure

```
tyro-by-nafham-app/
├── index.html              # Main HTML entry point
├── .eslintrc.json          # ESLint configuration
├── .prettierrc             # Prettier code formatter config
├── .prettierignore         # Files to exclude from Prettier
├── .gitignore              # Git ignore rules
├── .env*                   # Environment variables (gitignored)
├── tsconfig.json           # TypeScript compiler config
├── vite.config.ts          # Vite build tool config
├── package.json            # Dependencies and scripts
├── src/
│   ├── index.tsx           # React application entry point
│   ├── App.tsx             # Main application component
│   ├── App.scss            # Global application styles
│   ├── index.css           # Root CSS styles
│   ├── vite-env.d.ts       # Vite environment types
│   └── global.d.ts         # Global TypeScript declarations
└── public/                 # Static assets
```

---

## 🌐 HTML Entry Point (`index.html`)

**Purpose**: Main HTML file that loads the React application.

### Key Features:

1. **Semantic HTML Structure**

   - Proper meta tags for SEO
   - Accessibility attributes (ARIA)
   - Performance optimizations

2. **Font Loading**

   - Preconnect to Google Fonts for performance
   - Inter font for English (LTR)
   - Tajawal font for Arabic (RTL)
   - Material Icons for UI elements

3. **Progressive Web App (PWA) Support**

   - Manifest file link
   - Apple touch icon
   - Theme color

4. **Loading Spinner**
   - Custom loader (`#tyro-page-loader`)
   - Displays while React app initializes

### Important Attributes:

```html
<html id="direction" lang="en"></html>
```

- `id="direction"`: Modified by i18n for RTL/LTR switching
- `lang="en"`: Default language (updated dynamically)

### Performance Optimizations:

- ✅ `preconnect` to Google Fonts
- ✅ `crossorigin` on font preconnect
- ✅ `display=swap` on font loading
- ✅ Vite module script for fast loading

---

## 🎨 Code Formatting (`.prettierrc`)

**Purpose**: Enforces consistent code style across the project.

### Configuration:

```json
{
  "semi": true, // Require semicolons
  "singleQuote": true, // Use single quotes
  "trailingComma": "all", // Trailing commas everywhere
  "tabWidth": 2, // 2 spaces per indent
  "printWidth": 80, // Max line length
  "arrowParens": "always", // Always wrap arrow function params
  "endOfLine": "lf" // Unix-style line endings
}
```

### Usage:

```bash
# Format all files
npm run format

# Check formatting without fixing
npm run format:check
```

### Prettier Ignore (`.prettierignore`):

Files excluded from formatting:

- Build outputs (`build/`, `dist/`)
- Dependencies (`node_modules/`)
- Public assets (`public/`)
- Minified files (`*.min.js`, `*.min.css`)
- Lock files (`package-lock.json`, etc.)

---

## 🔍 Linting (`.eslintrc.json`)

**Purpose**: Catches code quality issues and enforces best practices.

### Configuration:

```json
{
  "extends": ["react-app", "react-app/jest"],
  "rules": {
    "react-hooks/exhaustive-deps": "warn",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

### Rules Explained:

1. **`react-hooks/exhaustive-deps: "warn"`**

   - Warns about missing dependencies in React hooks
   - Helps prevent stale closures and bugs

2. **`no-console: ["warn", { "allow": ["warn", "error"] }]`**
   - Warns about console.log statements
   - Allows console.warn and console.error for debugging

### Usage:

```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

---

## 🚫 Git Ignore (`.gitignore`)

**Purpose**: Prevents committing unnecessary or sensitive files.

### Categories:

#### 1. Dependencies

```
/node_modules
/.pnp
.pnp.js
/.yarn
```

#### 2. Build Outputs

```
/build
/dist
```

#### 3. Environment Variables (Sensitive!)

```
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

#### 4. IDE Files

```
.vscode/
.idea/
*.swp
*.swo
*~
```

#### 5. OS Files

```
.DS_Store      # macOS
Thumbs.db      # Windows
```

#### 6. Logs

```
npm-debug.log*
yarn-debug.log*
*.log
```

#### 7. TypeScript

```
*.tsbuildinfo  # TypeScript build cache
```

---

## 🔐 Environment Variables (`.env*`)

**Purpose**: Store configuration and secrets separately from code.

### Files (all gitignored):

- `.env` - Shared variables across all environments
- `.env.local` - Local overrides (highest priority)
- `.env.development` - Development environment
- `.env.production` - Production environment

### Usage with Vite:

```env
# .env
VITE_API_BASE_URL=https://api.example.com
```

```typescript
// In code
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

### Chat (Stream Chat)

Messaging between students, instructors and Nafham Support runs on
[Stream Chat](https://getstream.io/chat/). The backend signs the user token
(`POST /chat/token`) and creates every conversation (`POST /chat/conversations`),
adding Nafham Support as the third member. A student can only message
instructors they have a package with (`GET /me/instructors`); the Message
button is hidden elsewhere and the backend answers 403 regardless. Anyone can
open a direct conversation with Nafham Support (`POST /chat/conversations`
with `kind: "support"`, the "Chat with Nafham Support" button on Messages);
channels carry a `kind` custom field (`lesson` | `support`) the UI reads, and
Nafham Support's `system` messages render as announcements. The web app needs:

```env
# Public API key of the Stream app. Leave empty to hide chat entirely.
VITE_STREAM_API_KEY=

# Stream user id of the shared "Nafham Support" member added to every
# conversation. Create this user in the Stream dashboard (or via the backend).
VITE_STREAM_ADMIN_USER_ID=nafham-support

# Development only. "true" signs user tokens in the browser with
# client.devToken(); requires "Disable Auth Checks" in the Stream dashboard.
# In staging/production leave it unset: the app calls POST /chat/token and
# the backend signs the token with the Stream secret.
VITE_STREAM_DEV_TOKENS=false
```

Attachment size and type limits are enforced in the Stream dashboard
(App settings → File uploads). The UI copy assumes 25 MB per file.

### Important Rules:

1. ✅ All Vite env vars **MUST** start with `VITE_`
2. ✅ **NEVER** commit `.env*` files (already in .gitignore)
3. ✅ Define types in `src/vite-env.d.ts` for TypeScript safety

### Adding New Variables:

1. Add to `.env` file:

   ```env
   VITE_NEW_VARIABLE=value
   ```

2. Add type in `src/vite-env.d.ts`:

   ```typescript
   interface ImportMetaEnv {
     readonly VITE_API_BASE_URL: string;
     readonly VITE_NEW_VARIABLE: string; // Add this
   }
   ```

3. Use in code:
   ```typescript
   const value = import.meta.env.VITE_NEW_VARIABLE;
   ```

---

## ⚛️ React Entry Point (`src/index.tsx`)

**Purpose**: Initializes and mounts the React application.

### Provider Hierarchy (outermost to innermost):

```
React.StrictMode
  └─ QueryClientProvider (TanStack Query)
      └─ Provider (Redux)
          └─ BrowserRouter (React Router)
              └─ PersistGate (Redux Persist)
                  └─ App
                      └─ MaterialTheme
                          └─ NotistackProvider
                              └─ Layout
                                  └─ Routes
```

### Key Providers:

1. **React.StrictMode**

   - Development mode checks
   - Detects potential problems
   - Only active in development

2. **QueryClientProvider**

   - TanStack Query for server state
   - Caching and synchronization
   - Background refetching

3. **Provider (Redux)**

   - Client-side persisted state
   - Currently only user authentication

4. **BrowserRouter**

   - React Router for navigation
   - History management

5. **PersistGate**

   - Delays render until Redux state is rehydrated
   - Shows `loading` prop while rehydrating (currently `null`)

6. **ReactQueryDevtools**
   - Development tool for inspecting TanStack Query
   - Only visible in development
   - Toggle with button in bottom-left corner

### Performance Monitoring:

```typescript
// Optional: Log performance metrics
reportWebVitals(console.log);

// Or send to analytics
reportWebVitals(sendToAnalytics);
```

---

## 🎯 Main App Component (`src/App.tsx`)

**Purpose**: Root application component with global providers.

### Component Hierarchy:

```
App
  └─ MaterialTheme (MUI theme + RTL)
      └─ NotistackProvider (Snackbar notifications)
          └─ Layout (Header + Footer)
              └─ RoutesComponent (All routes)
```

### State Management:

- **Redux**: User authentication state (persisted via localStorage)
- **TanStack Query**: All server data (sessions, instructors, calendar)

### Why This Structure?

1. **MaterialTheme** wraps everything for consistent styling and RTL support
2. **NotistackProvider** provides snackbar notifications globally
3. **Layout** adds header/footer to all pages (except excluded routes)
4. **RoutesComponent** handles all application routing

---

## 🌍 Global Type Declarations (`src/global.d.ts`)

**Purpose**: TypeScript type definitions for third-party libraries without proper types.

### Current Declarations:

#### Redux Persist Integration

```typescript
declare module 'redux-persist/integration/react' {
  // PersistGate types
}
```

**Why needed?**: The `redux-persist` library's React integration doesn't have complete TypeScript types.

### Adding New Declarations:

```typescript
// Example: Adding types for a library without types
declare module 'some-library' {
  export function someFunction(): void;
}
```

---

## 🔧 Vite Environment Types (`src/vite-env.d.ts`)

**Purpose**: TypeScript definitions for Vite features and environment variables.

### Key Declarations:

#### 1. Vite Client Types

```typescript
/// <reference types="vite/client" />
```

Enables Vite's client-side types (HMR, import.meta, etc.)

#### 2. SVG Module Declarations

```typescript
declare module '*.svg' {
  export const ReactComponent: React.FunctionComponent<...>;
  const src: string;
  export default src;
}
```

**Usage**:

```typescript
// As React component
import { ReactComponent as Logo } from './logo.svg';
<Logo width={100} />

// As URL string
import logoUrl from './logo.svg';
<img src={logoUrl} alt="Logo" />
```

#### 3. Environment Variables Interface

```typescript
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}
```

**Type Safety**: TypeScript will error if you try to access an undefined env variable.

---

## 🎨 Global Styles

### `src/index.css`

**Purpose**: Root-level CSS for the entire application.

**Content**:

- Basic body styles
- Font families
- Font smoothing

### `src/App.scss`

**Purpose**: Application-wide SCSS styles.

**Content**:

- `.loader-div` - Full-screen loading overlay

---

## 🏗️ Build Configuration

### Vite (`vite.config.ts`)

**Key Features**:

- React plugin
- SVGR plugin for SVG imports
- Dev server configuration
- Build optimization

### TypeScript (`tsconfig.json`)

**Compiler Options**:

- Strict mode enabled
- JSX support
- Module resolution
- Path aliases

---

## 📦 Best Practices

### 1. Environment Variables

✅ **Do**:

- Prefix all Vite env vars with `VITE_`
- Define types in `vite-env.d.ts`
- Use `.env.local` for sensitive local values

❌ **Don't**:

- Commit `.env` files
- Store secrets in code
- Use env vars for dynamic runtime values

### 2. Code Quality

✅ **Do**:

- Run `npm run lint` before committing
- Run `npm run format` to auto-format
- Fix ESLint warnings

❌ **Don't**:

- Disable ESLint rules without reason
- Commit with linter errors

### 3. TypeScript

✅ **Do**:

- Define types for all environment variables
- Use proper module declarations
- Maintain strict mode

❌ **Don't**:

- Use `any` type
- Ignore TypeScript errors
- Skip type definitions

---

## 🚀 Scripts Reference

```bash
# Development
npm run dev              # Start dev server

# Build
npm run build            # Production build
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix ESLint issues
npm run format           # Format with Prettier
npm run format:check     # Check formatting without fixing

# Testing
npm run test             # Run tests
npm run test:coverage    # Run tests with coverage
```

---

## 🐛 Troubleshooting

### Issue: Environment variable not working

**Solution**:

1. Check it starts with `VITE_`
2. Restart dev server (env vars only load on startup)
3. Add type definition in `vite-env.d.ts`

### Issue: SVG import error

**Solution**:

1. Check `vite.config.ts` has SVGR plugin
2. Check `vite-env.d.ts` has SVG module declaration
3. Use correct import syntax

### Issue: Redux Persist not working

**Solution**:

1. Check `PersistGate` wraps `<App />`
2. Check `persistor` is exported from store
3. Clear localStorage: `localStorage.removeItem('persist:root')`

---

## 📚 Related Documentation

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)

---

## 📋 Configuration Checklist

When setting up a new environment:

- [ ] Copy `.env.example` to `.env.local`
- [ ] Fill in all `VITE_*` variables
- [ ] Run `npm install`
- [ ] Run `npm run dev` to verify setup
- [ ] Check Redux DevTools
- [ ] Check TanStack Query DevTools
- [ ] Test authentication flow
- [ ] Test API connections

---

**Last Updated**: October 31, 2025  
**Status**: ✅ Complete - Production Ready Configuration
