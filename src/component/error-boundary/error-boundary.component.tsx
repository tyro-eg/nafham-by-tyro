/**
 * ErrorBoundary Component
 *
 * Catches JavaScript errors anywhere in the component tree,
 * logs them to Sentry, and displays a fallback UI.
 *
 * Features:
 * - Automatic error capture and reporting
 * - User-friendly fallback UI
 * - Error recovery options
 * - Internationalization support
 *
 * @example
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 */

import { FC, ReactNode } from 'react';
import { ErrorBoundary as SentryErrorBoundary } from '@sentry/react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { useRtlClass } from '../../assets/utils/utils';

import './error-boundary.styles.scss';

interface ErrorBoundaryProps {
  children: ReactNode;
}

/**
 * ErrorFallback Component
 *
 * Displays a user-friendly error page when an error is caught.
 *
 * @param error - The error that was caught
 * @param resetError - Function to reset the error boundary
 */
const ErrorFallback: FC<{
  error: Error;
  resetError: () => void;
}> = ({ error, resetError }) => {
  const { t, i18n } = useTranslation();
  const rtlClass = useRtlClass();
  const navigate = useNavigate();

  const handleGoHome = () => {
    resetError();
    navigate('/');
  };

  const handleReload = () => {
    resetError();
    window.location.reload();
  };

  return (
    <Container maxWidth="md" className={`error-boundary ${rtlClass}`}>
      <Box className="error-boundary__content" dir={i18n.dir()}>
        <Typography variant="h1" className="error-boundary__title">
          {t('ERROR.TITLE', 'Oops! Something went wrong')}
        </Typography>

        <Typography variant="body1" className="error-boundary__description">
          {t(
            'ERROR.DESCRIPTION',
            "We're sorry for the inconvenience. An unexpected error occurred.",
          )}
        </Typography>

        {import.meta.env.DEV && (
          <Box className="error-boundary__details">
            <Typography variant="h6" className="error-boundary__details-title">
              Error Details (Development Only):
            </Typography>
            <Typography
              variant="body2"
              component="pre"
              className="error-boundary__details-message"
            >
              {error.message}
            </Typography>
            {error.stack && (
              <Typography
                variant="body2"
                component="pre"
                className="error-boundary__details-stack"
              >
                {error.stack}
              </Typography>
            )}
          </Box>
        )}

        <Box className="error-boundary__actions">
          <Button
            variant="contained"
            color="primary"
            onClick={handleReload}
            className="error-boundary__button"
          >
            {t('ERROR.RELOAD', 'Reload Page')}
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleGoHome}
            className="error-boundary__button"
          >
            {t('ERROR.GO_HOME', 'Go to Home')}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

/**
 * ErrorBoundary Component
 *
 * Wraps the application with Sentry's error boundary.
 * Automatically reports errors to Sentry and displays fallback UI.
 */
const ErrorBoundary: FC<ErrorBoundaryProps> = ({ children }) => {
  return (
    <SentryErrorBoundary
      fallback={({ error, resetError }) => (
        <ErrorFallback
          error={error instanceof Error ? error : new Error(String(error))}
          resetError={resetError}
        />
      )}
      showDialog={false} // We handle our own UI
    >
      {children}
    </SentryErrorBoundary>
  );
};

export default ErrorBoundary;
