import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { useRtlClass } from '../../assets/utils/utils';
import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import ChildTabs from '../family/child-tabs.component';

import PackagesList from './packages-list/packages-list.component';

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

  return (
    <section className={`packages ${rtlClass}`}>
      <div className="packages__container container">
        <header className="packages__header">
          <h1 className="packages__title">{t('MYPACKAGES.TITLE')}</h1>
          <p className="packages__subtitle">{t('MYPACKAGES.SUBTITLE')}</p>
        </header>
        {currentUser?.type === 'Parent' && <ChildTabs />}
        <PackagesList />
      </div>
    </section>
  );
};

export default Packages;
