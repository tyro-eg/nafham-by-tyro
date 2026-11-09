import { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { Avatar, Button, Skeleton } from '@mui/material';
import { AddShoppingCartRounded, Inventory } from '@mui/icons-material';

import { useInfinitePackages } from '../../../hooks/usePackages';
import { useFamily } from '../../../hooks/useFamily';
import { useAppSelector } from '../../../redux/store';
import { selectCurrentUser } from '../../../redux/user/user.selectors';
import { childColor } from '../../../lib/family-child';
import type { Package } from '../../../assets/types';

import PackageListCard from './packages-list-card/packages-list-card.component';
import RenewDialog from '../../payments/renew-dialog.component';
import RenewAllSheet from '../../payments/renew-all-sheet.component';
import RenewAllBanner from '../../payments/renew-all-banner.component';
import OpenPaymentBanner from '../../payments/open-payment-banner.component';
import RequestSessionsModal from '../../../modals/request-sessions-modal/request-sessions-modal.component';

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

  // Who renews: a parent or an adult student pays; a child with a login asks the parent
  const renewal: 'renew' | 'ask_parent' | undefined = isParent
    ? 'renew'
    : currentUser?.type === 'Student'
      ? currentUser.family_id
        ? 'ask_parent'
        : 'renew'
      : undefined;
  // `?renew=<package id>` (the return page's "Try again") opens the dialog at
  // once; `?renew=all` opens the renew-all sheet
  const [searchParams, setSearchParams] = useSearchParams();
  const [renewing, setRenewing] = useState<number | null>(() => {
    const id = Number(searchParams.get('renew'));
    return id > 0 ? id : null;
  });
  const [renewingAll, setRenewingAll] = useState(
    () => searchParams.get('renew') === 'all' && renewal === 'renew',
  );
  const [requesting, setRequesting] = useState(false);
  const dropParam = () => {
    if (searchParams.has('renew')) {
      searchParams.delete('renew');
      setSearchParams(searchParams, { replace: true });
    }
  };
  const closeRenew = () => {
    setRenewing(null);
    dropParam();
  };
  const closeRenewAll = () => {
    setRenewingAll(false);
    dropParam();
  };
  const sheet = renewal === 'renew' && (
    <>
      <OpenPaymentBanner />
      <RenewAllBanner onOpen={() => setRenewingAll(true)} />
      {renewingAll && (
        <RenewAllSheet
          onClose={closeRenewAll}
          onRequestInstead={() => {
            closeRenewAll();
            setRequesting(true);
          }}
        />
      )}
    </>
  );
  const cardProps = {
    renewal,
    onRenew: (pkg: Package) => setRenewing(pkg.id),
  };

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
        {renewal === 'renew' && (
          <Button
            component={Link}
            to="/buy"
            variant="contained"
            startIcon={<AddShoppingCartRounded />}
          >
            {t('BUY.FIRST_COURSE')}
          </Button>
        )}
      </div>
    );
  }

  if (groups && groups.length > 1) {
    return (
      <div className="pk-groups">
        {sheet}
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
                  {...cardProps}
                />
              ))}
            </div>
          </section>
        ))}
        {renewing !== null && (
          <RenewDialog
            packageId={renewing}
            onClose={closeRenew}
            onRequestInstead={() => {
              closeRenew();
              setRequesting(true);
            }}
          />
        )}
        {requesting && (
          <RequestSessionsModal
            handleClose={() => setRequesting(false)}
            defaultKind="more_hours"
          />
        )}
      </div>
    );
  }

  const color = groups?.[0]?.color;
  return (
    <>
      {sheet}
      <div className="pk-grid">
        {packages.map((pkg) => (
          <PackageListCard
            key={pkg.id}
            packageData={pkg}
            color={color}
            {...cardProps}
          />
        ))}
      </div>
      {renewing !== null && (
        <RenewDialog
          packageId={renewing}
          onClose={closeRenew}
          onRequestInstead={() => {
            closeRenew();
            setRequesting(true);
          }}
        />
      )}
      {requesting && (
        <RequestSessionsModal
          handleClose={() => setRequesting(false)}
          defaultKind="more_hours"
        />
      )}
    </>
  );
};

export default PackagesList;
