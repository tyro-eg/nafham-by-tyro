import { FC, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Skeleton } from '@mui/material';
import { Inventory } from '@mui/icons-material';

import { useInfinitePackages } from '../../../hooks/usePackages';
import { useFamily } from '../../../hooks/useFamily';
import { useAppSelector } from '../../../redux/store';
import { selectCurrentUser } from '../../../redux/user/user.selectors';
import { childColor } from '../../../lib/family-child';
import type { Package } from '../../../assets/types';

import PackageListCard from './packages-list-card/packages-list-card.component';

import './packages-list.styles.scss';

const PAGE = 50;

/** Hours still owned on a package: bought less moved out and taught */
const hoursLeft = (pkg: Package) => {
  const hours = pkg.hours;
  if (!hours) return pkg.remaining_hours ?? 0;
  return Math.max(hours.bought - hours.moved_out - hours.used, 0);
};

/**
 * Every package of the viewer, loaded in full. A parent looking at all the
 * children sees one group per child, in the family's colours.
 */
const PackagesList: FC = () => {
  const { t } = useTranslation();
  const currentUser = useAppSelector(selectCurrentUser);
  const isParent = currentUser?.type === 'Parent';
  const family = useFamily(isParent);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfinitePackages(PAGE);

  // Pull every page: the groups need the whole list
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const packages = useMemo(
    () =>
      (data?.pages.flatMap((page) => page.data) ?? []).filter(
        (pkg) => pkg && pkg.id,
      ),
    [data],
  );

  // A parent's groups follow the family's order, so the colours match the calendar
  const groups = useMemo(() => {
    if (!isParent) return null;
    const children = family.data?.children ?? [];
    const byStudent = new Map<number, Package[]>();
    packages.forEach((pkg) => {
      const id = pkg.student?.id;
      if (id === undefined) return;
      byStudent.set(id, [...(byStudent.get(id) ?? []), pkg]);
    });
    const known = children
      .map((child, index) => ({
        id: child.id,
        name: child.first_name,
        color: childColor(index),
        packages: byStudent.get(child.id) ?? [],
      }))
      .filter((group) => group.packages.length > 0);
    const extra = [...byStudent.entries()]
      .filter(([id]) => !children.some((child) => child.id === id))
      .map(([id, list]) => ({
        id,
        name: list[0].student?.first_name ?? '',
        color: childColor(children.length),
        packages: list,
      }));
    return [...known, ...extra];
  }, [isParent, family.data, packages]);

  if (isError) {
    return (
      <div className="no-packages">
        <Inventory />
        <p className="title">{t('MYPACKAGES.ERROR_TITLE')}</p>
        <p className="subtitle">{t('MYPACKAGES.ERROR_SUBTITLE')}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="pk-grid">
        {[0, 1, 2].map((i) => (
          <Skeleton
            key={i}
            variant="rounded"
            height={360}
            sx={{ borderRadius: '2rem' }}
          />
        ))}
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="no-packages">
        <Inventory />
        <p className="title">{t('MYPACKAGES.NO_PACKAGES_TITLE')}</p>
        <p className="subtitle">{t('MYPACKAGES.NO_PACKAGES_SUBTITLE')}</p>
      </div>
    );
  }

  if (groups && groups.length > 1) {
    return (
      <div className="pk-groups">
        {groups.map((group) => (
          <section
            key={group.id}
            className="pk-group"
            style={{ '--kid': group.color } as React.CSSProperties}
          >
            <header className="pk-group__head">
              <Avatar className="pk-group__avatar">{group.name[0]}</Avatar>
              <h2 className="pk-group__name">{group.name}</h2>
              <span className="pk-group__sum">
                {t('MYPACKAGES.GROUP.SUMMARY', {
                  count: group.packages.length,
                  hours: group.packages.reduce(
                    (sum, pkg) => sum + hoursLeft(pkg),
                    0,
                  ),
                })}
              </span>
            </header>
            <div className="pk-grid">
              {group.packages.map((pkg) => (
                <PackageListCard
                  key={pkg.id}
                  packageData={pkg}
                  color={group.color}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  const color = groups?.[0]?.color;
  return (
    <div className="pk-grid">
      {packages.map((pkg) => (
        <PackageListCard key={pkg.id} packageData={pkg} color={color} />
      ))}
    </div>
  );
};

export default PackagesList;
