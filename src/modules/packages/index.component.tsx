import { FC } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import { AddShoppingCartRounded } from '@mui/icons-material';

import { useRtlClass } from '../../assets/utils/utils';
import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import ChildTabs from '../family/child-tabs.component';

import PackagesList from './packages-list/packages-list.component';
import TrialFollowUps from '../buy/trial-follow-ups.component';

import './index.styles.scss';

/**
 * Packages Page Component
 *
 * Main packages page that displays all user packages in a list format.
 *
 * @example
 * <Packages />
 */
const Packages: FC = () => {
  const { t } = useTranslation();
  const rtlClass = useRtlClass();
  const currentUser = useAppSelector(selectCurrentUser);
  // A parent or an adult student buys; a child with a login asks the parent
  const canBuy =
    currentUser?.type === 'Parent' ||
    (currentUser?.type === 'Student' && !currentUser.family_id);

  return (
    <section className={`packages ${rtlClass}`}>
      <div className="packages__container container">
        <header className="packages__header">
          <div className="packages__heading">
            <h1 className="packages__title">{t('MYPACKAGES.TITLE')}</h1>
            <p className="packages__subtitle">{t('MYPACKAGES.SUBTITLE')}</p>
          </div>
          {canBuy && (
            <Button
              component={Link}
              to="/buy"
              variant="contained"
              size="large"
              className="packages__buy"
              startIcon={<AddShoppingCartRounded />}
            >
              {t('BUY.ENTRY')}
            </Button>
          )}
        </header>
        {currentUser?.type === 'Parent' && <ChildTabs />}
        <TrialFollowUps enabled={canBuy} />
        <PackagesList />
      </div>
    </section>
  );
};

export default Packages;
