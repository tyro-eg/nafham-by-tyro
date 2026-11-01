import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, CircularProgress, Typography } from '@mui/material';

import { useImpersonate } from '../../../hooks/useAuth';

import './impersonate.styles.scss';

/**
 * Impersonate Component
 *
 * Handles admin impersonation flow:
 * 1. Extracts token from URL params
 * 2. Calls /api/v1/me with the token
 * 3. Replaces current user with impersonated user
 * 4. Redirects to home
 *
 * @example
 * /impersonate?token=JWT_TOKEN&impersonator_email=admin@example.com
 */
// Tokens already being exchanged. Signing in swaps the current user, which
// remounts this route, which ran the exchange again before the first one had
// finished: hundreds of /me calls and never a redirect.
const started = new Set<string>();

const Impersonate = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const impersonateMutation = useImpersonate();

  useEffect(() => {
    const token = searchParams.get('token');

    // Validate required params
    if (!token) {
      console.error('Missing token parameter');
      navigate('/login');
      return;
    }
    if (started.has(token)) return;
    started.add(token);

    // The hook itself moves to the dashboard on success (a remounted copy of
    // this component never sees its own callbacks); failure comes back here.
    impersonateMutation.mutate(
      { token },
      {
        onError: () => {
          started.delete(token);
          navigate('/login');
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box className="impersonate-container">
      <CircularProgress size={60} thickness={4} />
      <Typography variant="h6" className="impersonate-text">
        {t('IMPERSONATE.LOADING')}
      </Typography>
    </Box>
  );
};

export default Impersonate;
