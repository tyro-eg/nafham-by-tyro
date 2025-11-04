/**
 * AnalyticsTracker Component
 *
 * Automatically tracks page views when the route changes.
 * Should be placed inside the Router but outside of route definitions.
 *
 * @example
 * <BrowserRouter>
 *   <AnalyticsTracker />
 *   <Routes>...</Routes>
 * </BrowserRouter>
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { trackPageView } from '../../lib/analytics';

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view on route change
    trackPageView(location.pathname + location.search);
  }, [location]);

  return null; // This component doesn't render anything
};

export default AnalyticsTracker;
