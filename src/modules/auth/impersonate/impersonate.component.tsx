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

    // Execute impersonation
    impersonateMutation.mutate(
      { token },
      {
        onSuccess: () => {
          navigate('/');
        },
        onError: () => {
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
