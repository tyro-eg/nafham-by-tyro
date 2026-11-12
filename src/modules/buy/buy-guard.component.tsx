import { FC } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';

import { useRtlClass } from '../../assets/utils/utils';

/** Who cannot buy here: a child with their own login (the parent pays), a tutor */
const BuyGuard: FC<{ child: boolean }> = ({ child }) => {
  const { t } = useTranslation();
  const rtlClass = useRtlClass();
  return (
    <div className={`trial buy ${rtlClass}`}>
      <div className="trial__container container">
        <div className="trial__card trial__card--center">
          <p>{child ? t('BUY.GUARD.CHILD') : t('BUY.GUARD.TUTOR')}</p>
          <Button
            component={Link}
            to={child ? '/my_packages' : '/dashboard'}
            className="trial__cta"
            variant="contained"
          >
            {child
              ? t('PAYMENTS.RETURN.SEE_PACKAGES')
              : t('NAVIGATION.DASHBOARD')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BuyGuard;
