import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import { CheckRounded, ShoppingBasketRounded } from '@mui/icons-material';

import type { Step } from './buy.types';

interface BuyRailProps {
  steps: readonly Step[];
  stepIndex: number;
  icons: Record<Step, JSX.Element>;
  labels: Record<Step, string>;
  /** What the payer picked at each step, shown under its label */
  chosen: Record<Step, string | undefined>;
  basketCount: number;
  /** The basket's running total, already formatted */
  basketAmount: string;
  onGo: (step: Step) => void;
}

/**
 * The summary rail beside the step card: every step with what was picked,
 * the done ones clickable to go back, and a shortcut to the basket once it
 * holds something.
 */
const BuyRail: FC<BuyRailProps> = ({
  steps,
  stepIndex,
  icons,
  labels,
  chosen,
  basketCount,
  basketAmount,
  onGo,
}) => {
  const { t } = useTranslation();
  const current = steps[stepIndex];
  return (
    <aside className="trial__rail">
      <p className="trial__rail-title">{t('BUY.SUMMARY')}</p>
      <ol className="trial__progress">
        {steps.map((step, index) => {
          const state =
            index < stepIndex
              ? 'done'
              : index === stepIndex
                ? 'active'
                : 'todo';
          const reachable =
            index < stepIndex || (step === 'basket' && basketCount > 0);
          return (
            <li key={step} className={`trial__progress-item is-${state}`}>
              <button
                type="button"
                className="trial__progress-btn"
                disabled={!reachable || index === stepIndex}
                onClick={() => onGo(step)}
              >
                <span className="trial__progress-icon">
                  {state === 'done' ? <CheckRounded /> : icons[step]}
                </span>
                <span className="trial__progress-text">
                  <span className="trial__progress-label">{labels[step]}</span>
                  <span className="trial__progress-value">
                    {chosen[step] ?? t('BUY.PENDING')}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      {basketCount > 0 && current !== 'basket' && (
        <Button
          className="buy-rail__basket"
          variant="outlined"
          startIcon={<ShoppingBasketRounded />}
          onClick={() => onGo('basket')}
        >
          {t('BUY.BASKET.OPEN', { count: basketCount, amount: basketAmount })}
        </Button>
      )}
    </aside>
  );
};

export default BuyRail;
