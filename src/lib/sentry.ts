/**
 * Sentry Configuration
 *
 * Configures Sentry for error tracking and performance monitoring.
 *
 * Features:
 * - Error tracking with stack traces
 * - Performance monitoring
 * - User feedback integration
 * - Release tracking
 * - Environment-based configuration
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/react/
 */

import * as Sentry from '@sentry/react';
import { useEffect } from 'react';
import {
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
} from 'react-router-dom';

/**
 * Initialize Sentry
 *
 * Sets up Sentry with React integration, React Router integration,
 * and performance monitoring.
 *
 * Only initializes if VITE_SENTRY_DSN is provided in environment variables.
 *
 * @example
 * // In index.tsx
 * initSentry();
 */
export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment =
    import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE;
  const release = import.meta.env.VITE_APP_VERSION || 'unknown';

  // Only initialize Sentry if DSN is provided
  if (!dsn) {
    console.warn('Sentry DSN not provided. Error tracking is disabled.');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    release: `tyro-app@${release}`,

    // Integrations
    integrations: [
      // React integration
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
      // Replay for session recording (optional)
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Performance Monitoring
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0, // 10% in production, 100% in development

    // Session Replay
    replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 0, // 10% in production, 0% in development
    replaysOnErrorSampleRate: 1.0, // 100% when errors occur

    // Ignore specific errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      // Network errors
      'Network request failed',
      'NetworkError',
      // Cancelled requests
      'canceled',
      'AbortError',
    ],

    // Filter out sensitive data
    beforeSend(event, hint) {
      // Don't send events in development unless explicitly enabled
      if (import.meta.env.DEV && !import.meta.env.VITE_SENTRY_DEV_ENABLED) {
        return null;
      }

      // Filter out known non-critical errors
      const error = hint.originalException;
      if (error && typeof error === 'object' && 'message' in error) {
        const message = String(error.message).toLowerCase();
        if (
          message.includes('loading chunk') ||
          message.includes('dynamically imported module')
        ) {
          // These are usually caused by deployments while users are browsing
          return null;
        }
      }

      return event;
    },
  });
};

/**
 * Set User Context
 *
 * Associates user information with Sentry events for better debugging.
 *
 * @param user - Current user object
 *
 * @example
 * setSentryUser(currentUser);
 */
export const setSentryUser = (
  user: {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
  } | null,
) => {
  if (!user) {
    Sentry.setUser(null);
    return;
  }

  Sentry.setUser({
    id: String(user.id),
    email: user.email,
    username: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
  });
};

/**
 * Capture Custom Error
 *
 * Manually report an error to Sentry with additional context.
 *
 * @param error - Error object or message
 * @param context - Additional context data
 *
 * @example
 * captureSentryError(new Error('Payment failed'), {
 *   paymentId: '123',
 *   amount: 100,
 * });
 */
export const captureSentryError = (
  error: Error | string,
  context?: Record<string, unknown>,
) => {
  Sentry.captureException(error, {
    extra: context,
  });
};

/**
 * Capture Custom Message
 *
 * Send a custom message to Sentry (for non-error events).
 *
 * @param message - Message to send
 * @param level - Severity level
 * @param context - Additional context data
 *
 * @example
 * captureSentryMessage('User completed onboarding', 'info', {
 *   userId: 123,
 *   timestamp: Date.now(),
 * });
 */
export const captureSentryMessage = (
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: Record<string, unknown>,
) => {
  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
};

// Export Sentry for advanced usage
export { Sentry };
