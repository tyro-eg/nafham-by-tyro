import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Inventory } from '@mui/icons-material';

import { useInfinitePackages } from '../../../hooks/usePackages';

import PackageListCard from './packages-list-card/packages-list-card.component';

import './packages-list.styles.scss';

/**
 * PackagesList Component
 *
 * Displays paginated list of packages with infinite scroll.
 *
 * @example
 * <PackagesList />
 */
const PackagesList: FC = () => {
  const { t } = useTranslation();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfinitePackages(10);

  // Flatten all pages into a single array
  const packages = data?.pages.flatMap((page) => page.data) ?? [];

  if (isError) {
    return (
      <div className="packages-list-container">
        <div className="no-packages">
          <Inventory />
          <p className="title">{t('MYPACKAGES.ERROR_TITLE')}</p>
          <p className="subtitle">{t('MYPACKAGES.ERROR_SUBTITLE')}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="packages-list-container">
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px',
          }}
        >
          <p>{t('MYPACKAGES.LOADING_PACKAGES')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="packages-list-container">
      {packages.length > 0 ? (
        <InfiniteScroll
          dataLength={packages.length}
          next={fetchNextPage}
          hasMore={!!hasNextPage}
          loader={
            <div style={{ textAlign: 'center', padding: '10px' }}>
              {isFetchingNextPage ? t('MYPACKAGES.LOADING_MORE') : ''}
            </div>
          }
        >
          <div className="packages-list">
            {packages.map((pkg) =>
              pkg && pkg.id ? (
                <PackageListCard key={pkg.id} packageData={pkg} />
              ) : null,
            )}
          </div>
        </InfiniteScroll>
      ) : (
        <div className="no-packages">
          <Inventory />
          <p className="title">{t('MYPACKAGES.NO_PACKAGES_TITLE')}</p>
          <p className="subtitle">{t('MYPACKAGES.NO_PACKAGES_SUBTITLE')}</p>
        </div>
      )}
    </div>
  );
};

export default PackagesList;
