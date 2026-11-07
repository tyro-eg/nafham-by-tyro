import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button } from '@mui/material';

import type { FamilyPackage } from '../../hooks/useFamily';

interface AlreadyLearningNoticeProps {
  studentName: string;
  pkg: FamilyPackage;
  onRenew: () => void;
}

/**
 * Under the course step's dropdowns: the child already learns this subject,
 * here is the package and a one-tap renewal, or carry on to buy it with
 * another tutor (the server has the final say on that).
 */
const AlreadyLearningNotice: FC<AlreadyLearningNoticeProps> = ({
  studentName,
  pkg,
  onRenew,
}) => {
  const { t } = useTranslation();
  return (
    <Alert
      severity="info"
      className="buy-already"
      action={
        <Button size="small" onClick={onRenew}>
          {t('BUY.WHAT.RENEW', { tutor: pkg.tutor_name })}
        </Button>
      }
    >
      {t('BUY.WHAT.ALREADY', {
        name: studentName,
        tutor: pkg.tutor_name,
        hours: pkg.hours_left,
      })}
    </Alert>
  );
};

export default AlreadyLearningNotice;
