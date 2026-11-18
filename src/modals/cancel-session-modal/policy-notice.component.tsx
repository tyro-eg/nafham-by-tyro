import { FC } from 'react';
import { Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { SessionType } from '../../assets/types';

interface PolicyNoticeProps {
  session: SessionType;
  /** What the viewer is about to do: the policy is the same, the words differ */
  change: 'cancel' | 'move';
}

const hoursText = (hours: number) =>
  Number.isInteger(hours)
    ? String(hours)
    : String(Math.round(hours * 100) / 100);

/**
 * The cancellation policy, as it applies if the viewer confirms now (the
 * backend works it out: session.change_terms). The family sees what share of
 * the lesson would be taken from the package; the tutor sees the free time
 * the student would get. Shown before they confirm.
 */
const PolicyNotice: FC<PolicyNoticeProps> = ({ session, change }) => {
  const { t } = useTranslation();
  const terms = session.change_terms;
  if (!terms || session.session_type === 'trial') return null;

  const values = {
    notice: hoursText(terms.notice_hours),
    hours: hoursText(terms.hours),
    percent: terms.percent,
  };
  const action = change === 'move' ? 'MOVE' : 'CANCEL';

  if (terms.side === 'family') {
    return (
      <Alert
        severity={terms.charge ? 'warning' : 'info'}
        className="policy-notice"
      >
        {terms.charge
          ? t(`SESSION_CHANGES.POLICY.FAMILY_CHARGE_${action}`, values)
          : t(`SESSION_CHANGES.POLICY.FAMILY_FREE_${action}`)}
        <br />
        <small>{t('SESSION_CHANGES.POLICY.FAMILY_RULES')}</small>
      </Alert>
    );
  }

  if (!terms.compensation) return null;
  return (
    <Alert severity="warning" className="policy-notice">
      {t(`SESSION_CHANGES.POLICY.TUTOR_COMPENSATION_${action}`, values)}
      <br />
      <small>{t('SESSION_CHANGES.POLICY.TUTOR_RULES')}</small>
    </Alert>
  );
};

export default PolicyNotice;
