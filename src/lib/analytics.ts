/**
 * Google Analytics Configuration
 *
 * Configures Google Analytics 4 (GA4) for tracking user interactions
 * and page views throughout the application.
 *
 * Features:
 * - Page view tracking
 * - Custom event tracking
 * - User property tracking
 * - E-commerce tracking
 *
 * @see https://developers.google.com/analytics/devguides/collection/ga4
 */

import ReactGA from 'react-ga4';

/**
 * Initialize Google Analytics
 *
 * Sets up GA4 with the provided measurement ID from environment variables.
 * Only initializes if a valid measurement ID is provided.
 *
 * @example
 * // In index.tsx
 * initAnalytics();
 */
export const initAnalytics = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  const isAnalyticsEnabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';

  if (!measurementId || !isAnalyticsEnabled) {
    console.warn(
      'Google Analytics not initialized. Missing VITE_GA_MEASUREMENT_ID or analytics disabled.',
    );
    return;
  }

  // Only initialize in production or when explicitly enabled
  if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_ANALYTICS) {
    ReactGA.initialize(measurementId, {
      gtagOptions: {
        // Anonymize IP addresses for privacy
        anonymize_ip: true,
        // Respect Do Not Track browser settings
        send_page_view: false, // We'll manually send page views for better control
      },
    });

    console.log('Google Analytics initialized');
  }
};

/**
 * Track Page View
 *
 * Sends a page view event to GA4. Should be called on route changes.
 *
 * @param path - The page path (e.g., '/sessions', '/profile')
 * @param title - Optional page title
 *
 * @example
 * trackPageView('/sessions', 'My Sessions');
 */
export const trackPageView = (path: string, title?: string) => {
  if (!import.meta.env.VITE_ENABLE_ANALYTICS) return;

  ReactGA.send({
    hitType: 'pageview',
    page: path,
    title: title || document.title,
  });
};

/**
 * Track Custom Event
 *
 * Sends a custom event to GA4 with optional parameters.
 *
 * @param category - Event category (e.g., 'User', 'Session', 'Payment')
 * @param action - Event action (e.g., 'login', 'book_session', 'purchase')
 * @param label - Optional event label for additional context
 * @param value - Optional numeric value
 * @param params - Additional custom parameters
 *
 * @example
 * trackEvent('Session', 'book_trial', 'Instructor_123');
 * trackEvent('Payment', 'purchase_package', 'Package_10h', 100);
 */
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number,
  params?: Record<string, unknown>,
) => {
  if (!import.meta.env.VITE_ENABLE_ANALYTICS) return;

  ReactGA.event({
    category,
    action,
    label,
    value,
    ...params,
  });
};

/**
 * Track User Properties
 *
 * Sets user properties in GA4 for better segmentation and analysis.
 *
 * @param userId - Unique user identifier
 * @param properties - User properties object
 *
 * @example
 * trackUser('user_123', {
 *   user_type: 'student',
 *   language: 'en',
 *   subscription: 'premium',
 * });
 */
export const trackUser = (
  userId: string,
  properties?: Record<string, unknown>,
) => {
  if (!import.meta.env.VITE_ENABLE_ANALYTICS) return;

  ReactGA.set({
    userId,
    ...properties,
  });
};

/**
 * Track E-commerce Purchase
 *
 * Tracks purchase events for packages, sessions, and courses.
 *
 * @param transactionId - Unique transaction identifier
 * @param value - Transaction value
 * @param currency - Currency code (default: 'EGP')
 * @param items - Array of purchased items
 *
 * @example
 * trackPurchase('TXN_12345', 500, 'EGP', [
 *   { item_id: 'PKG_10H', item_name: '10 Hours Package', price: 500, quantity: 1 }
 * ]);
 */
export const trackPurchase = (
  transactionId: string,
  value: number,
  currency: string = 'EGP',
  items: Array<{
    item_id: string;
    item_name: string;
    price: number;
    quantity: number;
    item_category?: string;
  }>,
) => {
  if (!import.meta.env.VITE_ENABLE_ANALYTICS) return;

  ReactGA.event('purchase', {
    transaction_id: transactionId,
    value,
    currency,
    items,
  });
};

/**
 * Track Session Booking
 *
 * Tracks when a user books a session (trial or private).
 *
 * @param sessionType - Type of session ('trial' | 'private' | 'group')
 * @param instructorId - Instructor ID
 * @param instructorName - Instructor name
 * @param value - Session value (optional)
 *
 * @example
 * trackSessionBooking('trial', 'INS_123', 'John Doe');
 * trackSessionBooking('private', 'INS_456', 'Jane Smith', 50);
 */
export const trackSessionBooking = (
  sessionType: 'trial' | 'private' | 'group',
  instructorId: string,
  instructorName: string,
  value?: number,
) => {
  if (!import.meta.env.VITE_ENABLE_ANALYTICS) return;

  trackEvent(
    'Session',
    'book_session',
    `${sessionType}_${instructorId}`,
    value,
    {
      session_type: sessionType,
      instructor_id: instructorId,
      instructor_name: instructorName,
    },
  );
};

/**
 * Track Profile Update
 *
 * Tracks when a user updates their profile information.
 *
 * @param updateType - Type of profile update (e.g., 'contact_details', 'password', 'avatar')
 *
 * @example
 * trackProfileUpdate('contact_details');
 */
export const trackProfileUpdate = (updateType: string) => {
  if (!import.meta.env.VITE_ENABLE_ANALYTICS) return;

  trackEvent('User', 'update_profile', updateType);
};

/**
 * Track Search
 *
 * Tracks search queries and filters applied.
 *
 * @param searchTerm - The search query
 * @param category - Search category (e.g., 'instructors', 'courses')
 * @param filters - Applied filters
 *
 * @example
 * trackSearch('english teacher', 'instructors', { field: 'English', category: 'Languages' });
 */
export const trackSearch = (
  searchTerm: string,
  category: string,
  filters?: Record<string, string>,
) => {
  if (!import.meta.env.VITE_ENABLE_ANALYTICS) return;

  trackEvent('Search', 'search', searchTerm, undefined, {
    search_category: category,
    filters: JSON.stringify(filters),
  });
};

/**
 * Track Instructor View
 *
 * Tracks when a user views an instructor's profile.
 *
 * @param instructorId - Instructor ID
 * @param instructorName - Instructor name
 *
 * @example
 * trackInstructorView('INS_123', 'John Doe');
 */
export const trackInstructorView = (
  instructorId: string,
  instructorName: string,
) => {
  if (!import.meta.env.VITE_ENABLE_ANALYTICS) return;

  trackEvent('Instructor', 'view_profile', instructorId, undefined, {
    instructor_name: instructorName,
  });
};

// Export ReactGA for advanced usage
export { ReactGA };
