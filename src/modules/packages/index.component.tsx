import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { useRtlClass } from '../../assets/utils/utils';

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

  return (
    <section className={`packages ${rtlClass}`}>
      <div className="packages__container container">
        <h1 className="packages__title">{t('MYPACKAGES.TITLE')}</h1>
        <PackagesList />
      </div>
    </section>
  );
};

export default Packages;
