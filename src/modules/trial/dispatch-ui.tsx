import { ComponentType } from 'react';
import {
  BoltRounded,
  PersonRounded,
  WorkspacePremiumRounded,
} from '@mui/icons-material';

import type { TrialDispatch } from '../../hooks/useTrial';

/**
 * How each way of sending a request is shown: its icon, the name of the
 * option (none for a direct pick, which shows the tutor), and the
 * "what happens next" line on the sent screen.
 */
export const DISPATCH_UI: Record<
  TrialDispatch,
  { Icon: ComponentType; label?: string; next: string }
> = {
  fastest: {
    Icon: BoltRounded,
    label: 'TRIAL.MATCH.FASTEST',
    next: 'TRIAL.SENT.NEXT_FASTEST',
  },
  best_match: {
    Icon: WorkspacePremiumRounded,
    label: 'TRIAL.MATCH.BEST',
    next: 'TRIAL.SENT.NEXT_BEST',
  },
  direct: { Icon: PersonRounded, next: 'TRIAL.SENT.NEXT_DIRECT' },
};
