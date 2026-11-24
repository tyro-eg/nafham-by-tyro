import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import type { WaitInfo } from '../../lib/request-wait';
import { formatSlot } from '../trial/trial.types';

interface WaitLineProps {
  wait: WaitInfo;
  /** The other person's first name, when the request waits for them */
  name?: string;
}

/**
 * One line on every open request: who it is waiting for, until when, and
 * what happens with no answer. Amber when it is waiting for the viewer.
 */
const WaitLine: FC<WaitLineProps> = ({ wait, name }) => {
  const { t, i18n } = useTranslation();
  const locale = `${i18n.language}-u-nu-latn`;
  const who =
    wait.who === 'other' && name
      ? t('REQUEST_WAIT.WHO.NAME', { name })
      : t(`REQUEST_WAIT.WHO.${wait.who.toUpperCase()}`);

  return (
    <p className={`wait-line${wait.who === 'you' ? ' wait-line--you' : ''}`}>
      <span className="wait-line__who">
        <span className="wait-line__dot" aria-hidden="true" />
        {t('REQUEST_WAIT.FOR', { who })}
      </span>
      {wait.until && (
        <span>
          {t(
            wait.who === 'you' ? 'REQUEST_WAIT.BY_YOU' : 'REQUEST_WAIT.UNTIL',
            { time: formatSlot(wait.until, locale) },
          )}
        </span>
      )}
      <span>{t(`REQUEST_WAIT.NOTE.${wait.note}`)}</span>
    </p>
  );
};

export default WaitLine;
