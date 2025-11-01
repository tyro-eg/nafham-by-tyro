# Modules Directory

This directory contains the main page modules and layout components of the Tyro application. Each module represents a distinct feature or page section with its own components, styles, and logic.

## 📂 Directory Structure

```
modules/
├── 404/                     # 404 Not Found page
├── auth/                    # Authentication pages (login, register)
├── checkout/                # Checkout and payment flow
├── courses/                 # Group sessions/courses pages
├── footer/                  # Application footer component
├── header/                  # Application header and navigation
│   ├── main-header/        # Desktop header
│   └── mobile-header/      # Mobile responsive header
├── home/                    # Landing and home pages
├── private-sessions/        # Private sessions/instructors directory
├── sessions/                # My Sessions page and management
├── terms/                   # Terms and conditions page
└── user/                    # User profile and settings pages
```

---

## 🔍 Module Details

### 1. **404 Module** (`src/modules/404/`)

**Purpose**: Displays a user-friendly 404 error page when users navigate to non-existent routes.

#### Files:
- **`index.component.tsx`**: Not Found component
- **`index.styles.scss`**: Styling for 404 page

#### Features:
- ✅ Large 404 display with custom styling
- ✅ Informative error message
- ✅ "Back Home" navigation link
- ✅ Responsive design for all screen sizes
- ✅ Internationalization support

#### Usage:
```typescript
import NotFound404 from '@/modules/404/index.component';

// In Routes
<Route path="*" element={<NotFound404 />} />
```

#### Key Components:
```typescript
const NotFound404 = () => {
  const { t } = useTranslation();
  return (
    <div className="not-found">
      <div className="not-found__content">
        <p className="not-found__404">404</p>
        <h3 className="not-found__info">{t('404.NOT_FOUND')}</h3>
        <Link className="custom-button" to="/">
          {t('404.BACK_HOME')}
        </Link>
      </div>
    </div>
  );
};
```

#### Styling:
- Uses SCSS with BEM methodology
- Responsive breakpoints via mixins
- Primary color theming
- Centered layout with flexbox

---

### 2. **Header Module** (`src/modules/header/`)

**Purpose**: Provides the main navigation header for the application with responsive design for both desktop and mobile views.

#### Structure:
```
header/
├── index.component.tsx          # Main header wrapper
├── index.styles.scss            # Shared header styles
├── main-header/                 # Desktop header
│   ├── main-header.component.tsx
│   └── main-header.styles.scss
└── mobile-header/               # Mobile header
    ├── mobile-header.component.tsx
    └── mobile-header.styles.scss
```

#### Features:
- ✅ Responsive design (desktop/mobile)
- ✅ Email confirmation banner for unverified users
- ✅ User authentication state handling
- ✅ Profile dropdown with settings and logout
- ✅ Language selector integration
- ✅ Dynamic navigation based on user role
- ✅ Free trial CTA for guests
- ✅ Contact information in desktop header
- ✅ Mobile menu with slide-in navigation

#### Main Header Component (`index.component.tsx`)

**Responsibilities:**
- Renders appropriate header based on screen size
- Manages modal states (register, login, email confirmation)
- Provides header props to child components
- Displays email confirmation banner for unverified users

```typescript
const Header = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const currentUser = useAppSelector(selectCurrentUser);

  const [openRegisterModal, setOpenRegisterModal] = useState(false);
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [openEmailConfirmModal, setOpenEmailConfirmModal] = useState(false);

  // Conditional rendering based on screen size
  return (
    <div className={`header ${currentUser && !currentUser.email_confirmed ? 'header__withBanner' : ''}`}>
      {!isXs && <MainHeader {...props} />}
      {isXs && <MobileHeader {...props} />}
      {/* Modals */}
    </div>
  );
};
```

#### Desktop Header (`main-header/`)

**Features:**
- Top bar with contact info (phone, email)
- Login/Register links for guests
- Language selector
- User profile dropdown with avatar
- Navigation menu
- Free trial button for guests
- Email confirmation banner

**Props Interface:**
```typescript
export interface HeaderProps {
  openFreeTrail: () => void;
  openEmailConfirm?: () => void;
}
```

**Key Sections:**
1. **Top Bar** (`app-header__top`):
   - Contact information (phone/email)
   - Login/Register links (for guests)
   - Language selector

2. **Bottom Bar** (`app-header__bottom`):
   - Logo
   - Navigation links (Home, Find Instructor, My Sessions)
   - Free Trial button (for guests)
   - User profile dropdown (for authenticated users)

**Profile Dropdown:**
- User name and email display
- Profile link (for tutors only)
- Account settings link (for tutors only)
- Logout button
- Styled with `PaperProps` for custom shadow/border

#### Mobile Header (`mobile-header/`)

**Features:**
- Hamburger menu icon
- Slide-in navigation drawer
- User info display
- Language selector
- Navigation links
- Login/Register links
- Free trial button
- Logout button
- Overlay for drawer
- Email confirmation banner

**Menu Structure:**
```typescript
// Mobile header state
const [mobileHeader, toggleMobileHeader] = useState(false);

// Drawer body sections:
1. User info (if authenticated)
2. Language selector
3. Login/Register links (for guests)
4. Free trial button (for guests)
5. Profile/Settings links (for tutors)
6. Navigation menu
7. Logout button (for authenticated users)
```

#### Authentication Integration:
- Uses `useAppSelector(selectCurrentUser)` for user state
- Uses `useSignOut` hook for logout functionality
- Handles tutor-specific navigation (profile, settings)
- Shows/hides elements based on authentication state

#### Email Confirmation Banner:
- Displayed when user is logged in but email is not confirmed
- Shows user's email address
- Provides "Resend Confirmation Email" button
- Opens email confirmation modal on click
- Automatically adjusts header margin when visible

#### Styling:
- **Desktop**: Fixed `AppBar` with two-tier layout
- **Mobile**: Slide-in drawer with overlay
- **Banner**: Full-width primary color bar with action button
- **RTL Support**: Uses `useRtlClass` hook for directional styling
- **Responsive**: Breakpoints via MUI `useMediaQuery`

#### Dependencies:
- **State Management**: Redux (`useAppSelector`, `selectCurrentUser`)
- **Routing**: React Router (`Link`, `NavLink`)
- **UI Components**: MUI (`AppBar`, `Toolbar`, `Button`, `Popover`, `IconButton`)
- **Authentication**: `useSignOut` hook from `@/hooks/useAuth`
- **Internationalization**: `useTranslation` from `react-i18next`
- **Utilities**: `useRtlClass` for RTL support

---

### 3. **Home Module** (`src/modules/home/`)

**Purpose**: Landing page showcasing the platform's value proposition, features, instructors, and testimonials to convert visitors into registered users.

#### Files:
- **`index.tsx`**: Main home page component orchestrating all sections
- **`index.scss`**: Shared home page styles and utilities
- **9 section components**: Each with dedicated component and styles files

#### Features:
- ✅ Hero section with primary CTA
- ✅ Educational fields showcase
- ✅ Best instructors gallery
- ✅ Platform statistics
- ✅ Customer testimonials carousel
- ✅ How it works explanation
- ✅ Why choose us section
- ✅ Secondary CTA section
- ✅ Featured press coverage
- ✅ Modal flows for registration/login/free trial
- ✅ RTL support across all sections
- ✅ Responsive design
- ✅ Internationalization

#### Section Breakdown:

1. **Home Intro** - Hero section with MacBook mockup and "Book Free Trial" CTA
2. **Home Fields** - Grid of educational systems (UAE National, IGCSE, SAT, IB, American, British)
3. **Home Instructors** - Gallery showcasing platform instructors
4. **Home Statistics** - Key metrics and achievements with parallelogram styling
5. **Home Testimonial** - Bilingual carousel of customer reviews (9 English + 9 Arabic)
6. **Home How It Work** - 3-step process explanation (Chat, Schedule, Learn)
7. **Why Us** - 3 value propositions with color-coded cards
8. **Home Ready For Learning** - Secondary CTA with engaging imagery
9. **Home Features** - Clickable media logos (CNBC, Wamda, BBC, Dubai)

#### Component Structure:

```typescript
const Home: FC = () => {
  const rtlClass = useRtlClass();
  const [openFreeTrailModal, setOpenFreeTrailModal] = useState(false);
  const [openRegisterModal, setOpenRegisterModal] = useState(false);
  const [openLoginModal, setOpenLoginModal] = useState(false);

  const currentUser = useAppSelector(selectCurrentUser);

  const triggerOpenFreeTrailModal = () => {
    if (currentUser) {
      setOpenFreeTrailModal(true);  // Show instructor selection
      return;
    }
    setOpenRegisterModal(true);       // Require registration first
  };

  return (
    <div className={`home ${rtlClass}`}>
      <HomeIntro openFreeTrail={triggerOpenFreeTrailModal} />
      <HomeFields />
      <HomeInstructors />
      <HomeStatistics />
      <HomeTestimonial />
      <HomeHowItWork />
      <HomeWhyUs />
      <HomeReadyForLearning openFreeTrail={triggerOpenFreeTrailModal} />
      <HomeFeatures />
      {/* Modals for Free Trial, Register, Login */}
    </div>
  );
};
```

#### Shared Utilities:

**`.custom-button`** - Standard CTA button styling:
```scss
.custom-button {
  padding: 1.2rem 3rem;
  border-radius: 0.4rem;
  background-color: $color-gold;
  color: $color-white;
  font-size: 1.6rem;
  font-weight: 500;
}
```

**`.parallelogram`** - Diagonal clipped highlight background:
```scss
.parallelogram {
  white-space: nowrap;
  color: $color-white;
  padding: 0 4px;
  background-color: $color-primary;
  clip-path: polygon(2% 0%, 100% 0%, 99% 100%, 0% 100%);

  &.gold {
    background-color: $color-gold;
  }

  &.rtl {
    clip-path: unset;  // Remove diagonal for RTL languages
  }
}
```

#### Modal Flow Logic:

1. **User clicks "Book Free Trial" or "Start Learning"**
   - If authenticated → Show `FreeTrailModal` (instructor selection)
   - If not authenticated → Show `RegisterModal`

2. **Register Modal**:
   - Can switch to `LoginModal` via "Already have account?"
   - On success: User can book trial

3. **Login Modal**:
   - Can switch to `RegisterModal` via "Don't have account?"
   - On success: User can book trial

#### Key Technologies:
- **Carousel**: Uses `react-slick` for testimonials
- **Images**: WebP format for photos, SVG for icons
- **Data**: Testimonials hardcoded (9 English + 9 Arabic versions)
- **External Links**: Featured media logos open in new tabs

#### Content Strategy:
- **Clear value proposition** in hero section
- **Social proof** through statistics and testimonials
- **Feature highlights** in educational fields and instructor gallery
- **Process explanation** in "How It Works"
- **Trust signals** in "Featured In" section
- **Multiple CTAs** (primary and secondary)

#### Internationalization:
All content uses translation keys under `LANDING.BLOCK1` through `LANDING.BLOCK8`:
- `LANDING.BLOCK1.*` - Hero section
- `LANDING.BLOCK2.*` - Educational fields
- `LANDING.BLOCK3.*` - Instructors
- `LANDING.BLOCK4.*` - Statistics
- `LANDING.BLOCK5.*` - Testimonials
- `LANDING.BLOCK6.*` - Ready for learning CTA
- `LANDING.BLOCK7.*` - Why us
- `LANDING.BLOCK8.*` - How it works

#### Responsive Design:
- **Desktop**: Multi-column layouts with side-by-side content
- **Tablet**: Adjusted grid columns
- **Mobile**: Stacked single-column layout
- **Images**: Responsive sizing via CSS
- **Carousel**: Adjusts slide count based on breakpoint

For detailed documentation of each section component, see: [Home Module README](./home/README.md)

---

### 4. **Private Sessions Module** (`src/modules/private-sessions/`)

**Purpose**: Instructor directory page where users can browse, search, and filter available tutors for one-on-one private tutoring sessions.

#### Files:
- **`index.component.tsx`**: Main private sessions page with instructor list
- **`index.styles.scss`**: Main page styling
- **`private-sessions-filter/`**: Filter component for searching/filtering instructors

#### Features:
- ✅ Paginated instructor list (10 per page)
- ✅ Category filter dropdown
- ✅ Field filter dropdown (dependent on category)
- ✅ Search input for keyword search
- ✅ Empty state with helpful messaging
- ✅ Smooth scroll to top on page change
- ✅ Responsive grid layout
- ✅ Collapsible filters on mobile
- ✅ RTL support
- ✅ Internationalization

#### Component Structure:

```typescript
const PrivateSessions: FC = () => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch instructors with TanStack Query
  const { data } = useInstructors(currentPage, pageSize);
  const instructors = data?.data || [];
  const instructorsPagination = data?.pagination;

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    setCurrentPage(value);
    scrollToTop();
  };

  return (
    <div>
      <PrivateSessionsFilter />
      <section className="instructor-list">
        <div className="instructor-list__container container">
          {instructors?.map((instructor) => (
            <InstructorCard key={instructor.id} instructor={instructor} />
          ))}
        </div>
        {/* Empty state */}
        {/* Pagination */}
      </section>
    </div>
  );
};
```

#### Filter Component:

**Features:**
- **Category Dropdown**: 14 hardcoded categories (Languages, Business, Math, etc.)
- **Field Dropdown**: Dependent on selected category, disabled when no category
- **Search Input**: Text search with icon button
- **Mobile Toggle**: Collapsible filter section on small screens
- **Responsive**: Auto-adjusts visibility based on screen size

**State Management:**
```typescript
const PrivateSessionsFilter: FC = () => {
  const [category, setCategory] = useState('');
  const [field, setField] = useState('');
  const [listBody, setListBody] = useState(!isSmallScreen);

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    if (event.target.value === '') setField('');  // Reset field
    setCategory(event.target.value);
  };

  const toggleListBody = () => setListBody((prev) => !prev);
  // ...
};
```

**Available Categories:**
1. Languages
2. Business
3. Exam Preparation
4. Math
5. Science
6. Soft Skills
7. IG- (IGCSE)
8. National-English
9. Programming
10. SEO
11. Arabic
12. ACT English
13. IG Arabic
14. Primary

**Note**: Categories are currently hardcoded with a TODO to fetch from API.

#### Data Flow:

1. **Instructor Fetching**:
   - Uses `useInstructors(pageNumber, pageSize)` hook
   - Returns paginated data with `data` and `pagination` metadata
   - Automatic refetch on page change

2. **Pagination**:
   - MUI `Pagination` component
   - Displays current page and total pages
   - Smooth scroll to top on page change

3. **Empty State**:
   - SVG illustration (`EmptyImg`)
   - Two-line message from translations
   - Displayed when no instructors or empty results

#### Layout:

**Desktop (>1200px)**:
- Filters always visible horizontally
- Toggle button hidden
- Multi-column instructor grid (auto-fill, min 280px)

**Tablet (768px - 1199px)**:
- Filters collapsible via toggle button
- 2-column instructor grid
- Vertical filter stacking

**Mobile (<768px)**:
- Filters collapsed by default
- Toggle button visible with icon
- Single-column instructor grid
- Full-width search and filters

#### Integration:

**TanStack Query Hook:**
```typescript
import { useInstructors } from '@/hooks/useInstructors';

const { data, isLoading, error } = useInstructors(currentPage, pageSize);
```

**Responsive Design:**
```typescript
import { useMediaQuery, useTheme } from '@mui/material';

const theme = useTheme();
const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
```

**RTL Support:**
```typescript
import { useRtlClass } from '@/assets/utils/utils';

const rtlClass = useRtlClass();
```

#### Known Limitations:

1. **Filter Not Connected**: Filter state changes but doesn't trigger API calls
2. **Hardcoded Categories**: Should be fetched from API
3. **No Loading States**: No skeleton screens or loading indicators
4. **Search Not Implemented**: Search input doesn't perform actual search
5. **Field Dropdown**: Contains only placeholder data

#### Future Improvements:

1. **API Integration**:
   - Connect filters to query parameters
   - Implement debounced search
   - Fetch categories dynamically
   - Add loading and error states

2. **UX Enhancements**:
   - Add filter chips showing active filters
   - "Clear All" button
   - Sort options (rating, price, experience)
   - Infinite scroll option
   - Grid/list view toggle

3. **Performance**:
   - Virtual scrolling for long lists
   - Lazy load images
   - Prefetch next page

For detailed documentation, see: [Private Sessions Module README](./private-sessions/README.md)

---

### 5. **Footer Module** (`src/modules/footer/`)

**Purpose**: Provides the application footer with navigation, social media links, and copyright information.

#### Files:
- **`footer.component.tsx`**: Footer component
- **`footer.styles.scss`**: Footer styling

#### Features:
- ✅ Logo display
- ✅ Navigation links (Home, Find Instructor, My Sessions, Terms)
- ✅ Conditional navigation based on auth state
- ✅ Social media links (Google Play, Facebook, Twitter, Instagram)
- ✅ Copyright information with dynamic year
- ✅ Responsive design
- ✅ RTL support
- ✅ Internationalization

#### Component Structure:

```typescript
const Footer = () => {
  const { t } = useTranslation();
  const rtlClass = useRtlClass();
  const currentUser = useAppSelector(selectCurrentUser);

  return (
    <div className="app-footer">
      <div className="app-footer__container container">
        {/* Logo */}
        <Link to="/" className="logo">
          <img src={logo} alt="tyro logo" />
        </Link>

        {/* Navigation */}
        <div className={`footer-navbar ${rtlClass}`}>
          <NavLink to="/">{t('NAVIGATION.HOME')}</NavLink>
          {currentUser && (
            <>
              <NavLink to="/home">{t('NAVIGATION.FIND_INSTRUCTOR')}</NavLink>
              <NavLink to="/my_sessions">{t('NAVIGATION.SESSIONS')}</NavLink>
            </>
          )}
          <NavLink to="/terms">{t('NAVIGATION.TERMS')}</NavLink>
        </div>

        {/* Bottom Section */}
        <div className="app-footer__bottom">
          <p className="app-footer__rights">
            © {new Date().getFullYear()} Nafham. All rights reserved.
          </p>
          <div className="app-footer__icons">
            {/* Social media icon buttons */}
          </div>
        </div>
      </div>
    </div>
  );
};
```

#### Social Media Links:
1. **Google Play Store**: Nafham app download
2. **Facebook**: @NafhamEducation
3. **Twitter**: @NafhamEducation
4. **Instagram**: @nafhambytyro

All links open in new tab (`_blank`) using `IconButton` with `onClick` handlers.

#### Navigation Logic:
- **Always Visible**: Home, Terms & Conditions
- **Authenticated Only**: Find Instructor, My Sessions
- Uses `NavLink` with `isActive` prop for active state styling

#### Styling:
- **Layout**: Flexbox with centered alignment
- **Border**: Top border separator
- **Logo**: Fixed size (9.2rem × 5.5rem)
- **Navigation**: Horizontal on desktop, vertical on mobile
- **Active State**: Primary color with bold font
- **RTL Support**: Adjusts margins for right-to-left languages
- **Responsive**: Stacks elements vertically on mobile

#### Container:
- Uses global `.container` class for consistent width
- Mobile: 94% width with removed max-width
- Desktop: Standard container constraints

---

## 🎨 Styling Conventions

All modules follow consistent styling practices:

### SCSS Organization:
```scss
@import '../../assets/styles/variables.scss';
@import '../../assets/styles/mixins.scss';

.module-name {
  // Base styles
  
  &__element {
    // Element styles
  }
  
  &--modifier {
    // Modifier styles
  }
  
  @include respond(phone) {
    // Mobile styles
  }
}
```

### BEM Methodology:
- **Block**: `.module-name`
- **Element**: `.module-name__element`
- **Modifier**: `.module-name--modifier`

### Responsive Design:
- Uses mixins from `assets/styles/mixins.scss`
- Breakpoints: `phone`, `tab-port`, `tab-land`, `big-desktop`
- Mobile-first approach

### RTL Support:
- Uses `useRtlClass` hook for directional classes
- Applies `.rtl` class for right-to-left layouts
- Adjusts margins, padding, and alignment

---

## 🔌 Integration

### Authentication State:
All modules use Redux for authentication state management:

```typescript
import { useAppSelector } from '@/redux/store';
import { selectCurrentUser } from '@/redux/user/user.selectors';

const currentUser = useAppSelector(selectCurrentUser);
```

### Routing:
Uses React Router v6:

```typescript
import { Link, NavLink, useNavigate } from 'react-router-dom';

// Link: Simple navigation
<Link to="/path">Link Text</Link>

// NavLink: With active state styling
<NavLink
  className={({ isActive }) =>
    isActive ? 'menu-item active' : 'menu-item'
  }
  to="/path"
>
  Link Text
</NavLink>

// useNavigate: Programmatic navigation
const navigate = useNavigate();
navigate('/path');
```

### Internationalization:
Uses `react-i18next` for translations:

```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

// Usage
{t('NAVIGATION.HOME')}
```

### Material-UI Integration:
Uses MUI components with custom theming:

```typescript
import { Button, IconButton, Dialog, Popover } from '@mui/material';
import { Menu, Info, Facebook } from '@mui/icons-material';
```

---

## 📝 Refactoring Notes

### ✅ Completed Improvements:

1. **Removed Unused Imports**:
   - Eliminated unused `React` imports (now using named imports like `FC`)
   - Removed unused `useNavigate` from components not using programmatic navigation

2. **Fixed `rtlClass` Usage**:
   - Changed from `rtlClass()` function call to `useRtlClass()` hook
   - Consistent usage across all header and footer components
   - Proper reactivity for RTL language switching

3. **Standardized React Component Definitions**:
   - Replaced `React.FC` with `FC` from `react`
   - Consistent functional component patterns

4. **Removed Commented-Out Code**:
   - Cleaned up old country selector code
   - Removed unused MUI Select components

5. **Fixed Popover Styling**:
   - Replaced `elevation={0}` with proper `PaperProps`
   - Consistent shadow removal pattern across app

6. **Improved Import Organization**:
   - Grouped imports by category (React, MUI, Redux, Hooks, Utils, Assets)
   - Consistent import order
   - Fixed inconsistent path aliases (`@/redux` vs `../../../redux`)

7. **Code Cleanup**:
   - Removed unnecessary variables
   - Simplified conditional rendering
   - Improved component readability

### 🔄 Consistency Patterns:

1. **Import Order**:
   ```typescript
   // 1. React and core libraries
   import { FC, useState } from 'react';
   
   // 2. Third-party UI libraries
   import { Button } from '@mui/material';
   
   // 3. Redux/State management
   import { useAppSelector } from '@/redux/store';
   
   // 4. Custom hooks
   import { useSignOut } from '@/hooks/useAuth';
   
   // 5. Utilities
   import { useRtlClass } from '@/assets/utils/utils';
   
   // 6. Components
   import LanguageSelector from '@/component/i18next/LanguageSelector';
   
   // 7. Assets (images, icons)
   import logo from '@/assets/images/logo.png';
   
   // 8. Styles (last)
   import './styles.scss';
   ```

2. **Component Structure**:
   ```typescript
   const Component: FC<Props> = ({ props }) => {
     // 1. Hooks (translation, navigation, etc.)
     const { t } = useTranslation();
     const rtlClass = useRtlClass();
     
     // 2. State
     const [state, setState] = useState();
     
     // 3. Redux selectors
     const currentUser = useAppSelector(selectCurrentUser);
     
     // 4. Event handlers
     const handleClick = () => {};
     
     // 5. Render
     return <div>...</div>;
   };
   ```

3. **Authentication Checks**:
   ```typescript
   // Consistent pattern for conditional rendering
   {currentUser && (
     <AuthenticatedContent />
   )}
   
   {!currentUser && (
     <GuestContent />
   )}
   ```

---

## 🚀 Usage Examples

### Using Header and Footer in Layout:
```typescript
import Header from '@/modules/header/index.component';
import Footer from '@/modules/footer/footer.component';

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
};
```

### Conditional Footer Display:
```typescript
const ROUTES_WITHOUT_FOOTER = ['/login', '/register', '/registered'];

const Layout = ({ children }) => {
  const location = useLocation();
  const showFooter = !ROUTES_WITHOUT_FOOTER.includes(location.pathname);

  return (
    <>
      <Header />
      {children}
      {showFooter && <Footer />}
    </>
  );
};
```

---

## 🐛 Known Issues & Future Improvements

### Current Limitations:
- Email confirmation resend functionality needs API integration
- Mobile menu doesn't close automatically on route change
- Social media links are hardcoded (could be from config)

### Potential Enhancements:
1. **Header**:
   - Add sticky header on scroll
   - Implement scroll progress indicator
   - Add notification badge for unread messages
   - Improve profile dropdown animation

2. **Footer**:
   - Add newsletter subscription
   - Include more navigation sections
   - Add accessibility links
   - Include app download badges

3. **404 Page**:
   - Add search functionality
   - Suggest popular pages
   - Include breadcrumb trail
   - Add "Report broken link" option

---

## 📚 Related Documentation

- [Assets Documentation](../assets/README.md)
- [Components Documentation](../component/README.md)
- [Hooks Documentation](../hooks/README.md)
- [Modals Documentation](../modals/README.md)

---

## 📞 Support

For questions or issues related to these modules, refer to:
- Redux state management documentation
- React Router v6 documentation
- Material-UI component documentation
- i18next internationalization documentation

