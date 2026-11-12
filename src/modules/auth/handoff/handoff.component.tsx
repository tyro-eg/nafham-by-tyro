import { useEffect, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Button, CircularProgress, Typography } from '@mui/material';

import { useHandoff } from '../../../hooks/useAuth';
import { readHandoffCode } from '../../../lib/from-app';

import '../impersonate/impersonate.styles.scss';
import './handoff.styles.scss';

/**
 * Handoff Component
 *
 * The mobile app's way into the website to pay:
 * 1. Reads the single-use code from the URL fragment (never sent to servers
 *    or kept in history) and wipes it
 * 2. Trades it for a session with POST /web_handoffs/redeem
 * 3. Moves to the page the app asked for (a renewal, /buy, a payment)
 *
 * @example
 * /handoff#code=SINGLE_USE_CODE
 */
// Codes already being traded. Signing the previous user out swaps the
// layout, which remounts this route after the code has left the URL; the
// remounted copy waits on the first exchange instead of starting another.
const started = new Set<string>();

// Whether the exchange failed, outside React for the same reason: the copy
// on screen may not be the one that started it
let failed = false;
const listeners = new Set<() => void>();
const setFailed = (value: boolean) => {
  failed = value;
  listeners.forEach((listener) => listener());
};
const fail = () => setFailed(true);
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const getFailed = () => failed;

const Handoff = () => {
  const { t } = useTranslation();
  const handoff = useHandoff();
  const error = useSyncExternalStore(subscribe, getFailed);

  useEffect(() => {
    const code = readHandoffCode(window.location.hash);
    if (!code) {
      // Nothing to trade, unless an exchange is already under way
      if (started.size === 0) fail();
      return;
    }
    // Out of the address bar and history before anything else runs
    window.history.replaceState(
      window.history.state,
      '',
      window.location.pathname + window.location.search,
    );
    if (started.has(code)) return;
    started.add(code);
    setFailed(false);

    // The hook itself moves on when it succeeds (a remounted copy of this
    // component never sees its own callbacks)
    handoff.mutateAsync({ code }).catch(fail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <Box className="impersonate-container handoff-container">
        <Typography variant="h6" className="impersonate-text">
          {t('HANDOFF.FAILED')}
        </Typography>
        <Typography className="handoff-hint">
          {t('HANDOFF.FAILED_TEXT')}
        </Typography>
        <Button component={Link} to="/login" variant="contained">
          {t('HANDOFF.SIGN_IN')}
        </Button>
      </Box>
    );
  }

  return (
    <Box className="impersonate-container handoff-container">
      <CircularProgress size={60} thickness={4} />
      <Typography variant="h6" className="impersonate-text">
        {t('HANDOFF.LOADING')}
      </Typography>
    </Box>
  );
};

export default Handoff;
