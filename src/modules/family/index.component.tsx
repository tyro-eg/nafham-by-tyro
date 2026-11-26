import { FC, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Skeleton,
  TextField,
} from '@mui/material';
import {
  AccessTimeRounded,
  AddRounded,
  AddShoppingCartRounded,
  ArrowForwardRounded,
  AssignmentRounded,
  AutorenewRounded,
  EventAvailableRounded,
  EventNoteRounded,
  MenuBookRounded,
  SettingsRounded,
  SupportAgentRounded,
} from '@mui/icons-material';
import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import {
  familyErrorMessage,
  useActiveChild,
  useFamily,
  useRequestTopUp,
  type FamilyChild,
  type FamilyPackage,
} from '../../hooks/useFamily';
import { useRtlClass } from '../../assets/utils/utils';
import { snackActions } from '../../assets/utils/toaster';
import { formatRelative } from '../homework/homework.utils';
import { subjectName } from '../dashboard/dashboard.utils';
import { childColor, findChildPackage } from '../../lib/family-child';
import RenewDialog from '../payments/renew-dialog.component';
import RenewAllSheet from '../payments/renew-all-sheet.component';
import RenewAllBanner from '../payments/renew-all-banner.component';
import OpenPaymentBanner from '../payments/open-payment-banner.component';
import TrialFollowUps from '../buy/trial-follow-ups.component';
import TrialRequestsCard from '../trial/trial-requests-card.component';
import RequestSessionsModal from '../../modals/request-sessions-modal/request-sessions-modal.component';
import {
  greetingKey,
  hoursText,
  LOW_HOURS,
  splitPackages,
} from './family-home.utils';
import '../dashboard/dashboard.styles.scss';
import './family.styles.scss';

const DAY_MS = 24 * 60 * 60 * 1000;
const TONES = ['sky', 'mint', 'sun', 'lilac', 'coral'] as const;
/** One colour per subject, the same on every row (19 Nov 2026) */
const SUBJECT_TONES: Record<string, (typeof TONES)[number]> = {};
const subjectTone = (subject: string) => {
  if (!SUBJECT_TONES[subject]) {
    SUBJECT_TONES[subject] =
      TONES[Object.keys(SUBJECT_TONES).length % TONES.length];
  }
  return SUBJECT_TONES[subject];
};
const UPCOMING_SHOWN = 8;

/** Ask ops for more hours on one of the child's packages */
const TopUpDialog: FC<{ child: FamilyChild; onClose: () => void }> = ({
  child,
  onClose,
}) => {
  const { t } = useTranslation();
  const request = useRequestTopUp();
  const [packageId, setPackageId] = useState<number | ''>(
    child.packages[0]?.id ?? '',
  );
  const [hours, setHours] = useState(10);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    setError(null);
    try {
      await request.mutateAsync({
        childId: child.id,
        packageId: packageId === '' ? undefined : packageId,
        hours,
        note: note.trim() || undefined,
      });
      snackActions.success(t('FAMILY.TOP_UP.SENT'));
      onClose();
    } catch (err) {
      setError(familyErrorMessage(err, t('FAMILY.ERROR')));
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        {t('FAMILY.TOP_UP.TITLE', { name: child.first_name })}
      </DialogTitle>
      <DialogContent sx={{ display: 'grid', gap: 2, pt: '8px !important' }}>
        <p className="family__muted">{t('FAMILY.TOP_UP.TEXT')}</p>
        {child.packages.length > 0 && (
          <TextField
            select
            size="small"
            label={t('FAMILY.TOP_UP.PACKAGE')}
            value={packageId}
            onChange={(e) => setPackageId(Number(e.target.value))}
          >
            {child.packages.map((pkg) => (
              <MenuItem key={pkg.id} value={pkg.id}>
                {pkg.course_name} · {pkg.tutor_name}
              </MenuItem>
            ))}
          </TextField>
        )}
        <TextField
          type="number"
          size="small"
          label={t('FAMILY.TOP_UP.HOURS')}
          value={hours}
          onChange={(e) => setHours(Math.max(1, Number(e.target.value)))}
          inputProps={{ min: 1, max: 100 }}
        />
        <TextField
          size="small"
          multiline
          minRows={2}
          label={t('FAMILY.TOP_UP.NOTE')}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          inputProps={{ maxLength: 2000, dir: 'auto' }}
        />
        {error && <Alert severity="error">{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('FAMILY.CANCEL')}</Button>
        <Button variant="contained" onClick={send} disabled={request.isPending}>
          {t('FAMILY.TOP_UP.SEND')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/** Circular hours-left ring, as on the student's dashboard */
const Ring: FC<{ value: number; label: string; tone: string }> = ({
  value,
  label,
  tone,
}) => {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, value));
  return (
    <span className={`sd-ring sd-ring--${tone}`}>
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle className="sd-ring__track" cx="32" cy="32" r={radius} />
        <circle
          className="sd-ring__value"
          cx="32"
          cy="32"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
        />
      </svg>
      <span className="sd-ring__label">{label}</span>
    </span>
  );
};

/** One package row: ring, subject, tutor and hours, and Renew when low */
const PackageRow: FC<{
  pkg: FamilyPackage;
  onRenew: (pkg: FamilyPackage) => void;
}> = ({ pkg, onRenew }) => {
  const { t } = useTranslation();
  const subject = subjectName(pkg.course_name);
  const left = pkg.hours_left;
  const low = left > 0 && left <= LOW_HOURS;
  return (
    <li className={`fam-pk${left > 0 ? '' : ' fam-pk--done'}`}>
      <Ring
        value={pkg.original_hours ? left / pkg.original_hours : 0}
        label={hoursText(left)}
        tone={subjectTone(subject)}
      />
      <div className="fam-pk__text">
        <span className="fam-pk__course" dir="auto">
          {subject}
        </span>
        <span className="fam-pk__meta">
          {pkg.tutor_name} ·{' '}
          {t('FAMILY.CARD.HOURS_OF', {
            left: hoursText(left),
            total: hoursText(pkg.original_hours),
          })}
        </span>
      </div>
      {low && (
        <button
          type="button"
          className="fam-pk__low"
          onClick={() => onRenew(pkg)}
        >
          {t('FAMILY.CARD.LOW')}
        </button>
      )}
      {left <= 0 && (
        <button
          type="button"
          className="fam-pk__renew"
          onClick={() => onRenew(pkg)}
        >
          <AutorenewRounded fontSize="inherit" aria-hidden="true" />
          {t('PAYMENTS.RENEW.BUTTON')}
        </button>
      )}
    </li>
  );
};

/**
 * One child, at a glance: the numbers, the packages that still have hours
 * (used-up ones behind "Show all"), Renew on the low ones, and the way into
 * that child's pages. No "renew all low" button: the renew-all sheet offers
 * only what the server can renew online (1 of 6 low ones for one family),
 * and its own banner appears when that applies.
 */
const ChildCard: FC<{
  child: FamilyChild;
  color: string;
  onOpen: (path: string) => void;
  onRenew: (pkg: FamilyPackage) => void;
}> = ({ child, color, onOpen, onRenew }) => {
  const { t, i18n } = useTranslation();
  const [showAll, setShowAll] = useState(false);
  const split = splitPackages(child.packages);
  const rows = showAll ? [...split.withHours, ...split.usedUp] : split.shown;
  const hidden = split.moreLeft + split.usedUp.length;

  return (
    <section
      className="fam-card fam-kid"
      style={{ '--kid': color } as React.CSSProperties}
    >
      <header className="fam-kid__head">
        <Avatar className="fam-kid__avatar">{child.first_name[0]}</Avatar>
        <div className="fam-kid__who">
          <h2 className="fam-kid__name">{child.first_name}</h2>
          <span className="fam-kid__login">
            {child.login_enabled
              ? t('FAMILY.SETTINGS.OWN_LOGIN')
              : t('FAMILY.SETTINGS.THROUGH_YOU')}
          </span>
        </div>
        <div className="fam-kid__head-actions">
          <Button
            variant="outlined"
            size="small"
            endIcon={<ArrowForwardRounded className="sd-flip" />}
            onClick={() => onOpen('/my_sessions')}
          >
            {t('FAMILY.CARD.OPEN_AS', { name: child.first_name })}
          </Button>
        </div>
      </header>

      <dl className="fam-kid__facts">
        <div>
          <dt>{t('FAMILY.CARD.HOURS_LEFT')}</dt>
          <dd>{hoursText(child.hours_left)}</dd>
        </div>
        <div>
          <dt>{t('FAMILY.CARD.LESSONS')}</dt>
          <dd>{child.lessons_completed}</dd>
        </div>
        <div>
          <dt>{t('FAMILY.CARD.HOMEWORK_DUE')}</dt>
          <dd>{child.homework_due}</dd>
        </div>
        <div>
          <dt>{t('FAMILY.CARD.LATEST_NOTE')}</dt>
          <dd>
            {child.latest_note_at
              ? formatRelative(child.latest_note_at, i18n.language)
              : t('FAMILY.CARD.NO_NOTE')}
          </dd>
        </div>
      </dl>

      <div className="fam-card__header">
        <h3 className="fam-card__title">{t('FAMILY.CARD.WITH_HOURS')}</h3>
        <button
          type="button"
          className="fam-card__link"
          onClick={() => onOpen('/my_packages')}
        >
          {t('NAVIGATION.PACKAGES')}
          <ArrowForwardRounded className="sd-flip" />
        </button>
      </div>
      {child.packages.length === 0 && (
        <p className="fam-muted">{t('FAMILY.CARD.NO_PACKAGES')}</p>
      )}
      {child.packages.length > 0 &&
        split.withHours.length === 0 &&
        !showAll && <p className="fam-muted">{t('FAMILY.CARD.NONE_LEFT')}</p>}
      <ul className="fam-pks">
        {rows.map((pkg) => (
          <PackageRow key={pkg.id} pkg={pkg} onRenew={onRenew} />
        ))}
      </ul>
      {hidden > 0 && (
        <div className="fam-kid__more">
          <span>
            {[
              split.moreLeft > 0 &&
                t('FAMILY.CARD.MORE_LEFT', { count: split.moreLeft }),
              split.usedUp.length > 0 &&
                t('FAMILY.CARD.USED_UP', { count: split.usedUp.length }),
            ]
              .filter(Boolean)
              .join(' · ')}
          </span>
          <button
            type="button"
            className="fam-card__link"
            aria-expanded={showAll}
            onClick={() => setShowAll((all) => !all)}
          >
            {showAll ? t('FAMILY.CARD.SHOW_LESS') : t('FAMILY.CARD.SHOW_ALL')}
          </button>
        </div>
      )}
    </section>
  );
};

/**
 * The parent's home (19 Nov 2026): a calm header with one main action,
 * three clickable tiles, each child's card, and a side column with the
 * coming sessions and the latest notes.
 */
const FamilyHome: FC = () => {
  const { t, i18n } = useTranslation();
  const rtlClass = useRtlClass();
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectCurrentUser);
  const family = useFamily();
  const children = family.data?.children;
  const { choose } = useActiveChild(children);
  const [topUpFor, setTopUpFor] = useState<FamilyChild | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [renewing, setRenewing] = useState<{
    pkg: FamilyPackage;
    child: FamilyChild;
  } | null>(null);
  // `?renew=all` (the nudge's link) opens the renew-all sheet at once;
  // `?renew=<package id>` (the app's handoff) opens that package's dialog
  // once the family has loaded and the child owning it is known
  const [searchParams, setSearchParams] = useSearchParams();
  const [renewingAll, setRenewingAll] = useState(
    () => searchParams.get('renew') === 'all',
  );
  const dropRenewParam = () => {
    if (searchParams.has('renew')) {
      searchParams.delete('renew');
      setSearchParams(searchParams, { replace: true });
    }
  };
  const closeRenewAll = () => {
    setRenewingAll(false);
    dropRenewParam();
  };
  useEffect(() => {
    const packageId = Number(searchParams.get('renew'));
    if (!(packageId > 0) || !children) return;
    const found = findChildPackage(children, packageId);
    if (found) setRenewing(found);
    dropRenewParam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);
  const loading = family.isLoading;
  const locale = `${i18n.language}-u-nu-latn`;

  const open = (child: FamilyChild, path: string) => {
    choose(child.id);
    navigate(path);
  };

  // Every child's coming lessons, soonest first, with the child they belong to
  const upcoming = useMemo(() => {
    const rows = (children ?? []).flatMap((child, index) =>
      (child.upcoming ?? []).map((session) => ({
        child,
        color: childColor(index),
        session,
      })),
    );
    rows.sort((a, b) =>
      a.session.start_time.localeCompare(b.session.start_time),
    );
    return rows.slice(0, UPCOMING_SHOWN);
  }, [children]);

  const totals = useMemo(() => {
    const kids = children ?? [];
    const weekAhead = Date.now() + 7 * DAY_MS;
    return {
      hours: kids.reduce((sum, c) => sum + c.hours_left, 0),
      packagesWithHours: kids.reduce(
        (sum, c) => sum + c.packages.filter((p) => p.hours_left > 0).length,
        0,
      ),
      lessonsThisWeek: kids.reduce(
        (sum, c) =>
          sum +
          (c.upcoming ?? []).filter(
            (s) => new Date(s.start_time).getTime() < weekAhead,
          ).length,
        0,
      ),
      homework: kids.reduce((sum, c) => sum + c.homework_due, 0),
    };
  }, [children]);

  const next = upcoming[0];
  const greeting = t(`FAMILY.HERO.${greetingKey(new Date().getHours())}`, {
    name: currentUser?.first_name ?? '',
  });
  const latestNotes = (children ?? []).filter((c) => c.latest_note_at);

  const tiles = [
    {
      key: 'hours',
      tone: 'sky',
      icon: <AccessTimeRounded />,
      value: t('FAMILY.TILES.HOURS_UNIT', { count: hoursText(totals.hours) }),
      label: t('FAMILY.TILES.HOURS', { count: totals.packagesWithHours }),
      to: '/my_packages',
    },
    {
      key: 'next',
      tone: 'mint',
      icon: <EventNoteRounded />,
      value: next
        ? next.session.status === 'open'
          ? t('FAMILY.CARD.LIVE')
          : formatRelative(next.session.start_time, i18n.language)
        : t('FAMILY.TILES.NONE'),
      label: next
        ? t('FAMILY.TILES.NEXT', {
            subject: subjectName(next.session.course_name),
            child: next.child.first_name,
          })
        : t('FAMILY.TILES.COMING_UP'),
      to: '/calendar',
    },
    {
      key: 'homework',
      tone: 'sun',
      icon: <AssignmentRounded />,
      value: String(totals.homework),
      label: t('FAMILY.TILES.HOMEWORK'),
      to: '/homework',
    },
  ];

  return (
    <div className={`family-home ${rtlClass}`}>
      <div className="container fam-container">
        <header className="fam-head">
          <div>
            <h1 className="fam-head__title">{greeting}</h1>
            <p className="fam-head__sub">
              {family.data?.name
                ? t('FAMILY.HERO.EYEBROW', { name: family.data.name })
                : ''}
              {children && children.length > 0 && (
                <> · {t('FAMILY.HERO.CHILDREN', { count: children.length })}</>
              )}
            </p>
          </div>
          <div className="fam-head__actions">
            <Button
              component={Link}
              to="/messages"
              variant="outlined"
              startIcon={<SupportAgentRounded />}
            >
              {t('FAMILY.SUPPORT')}
            </Button>
            <Button
              component={Link}
              to="/family/settings"
              variant="outlined"
              startIcon={<SettingsRounded />}
            >
              {t('FAMILY.SETTINGS.TITLE')}
            </Button>
            <Button
              variant="contained"
              startIcon={<EventAvailableRounded />}
              onClick={() => setRequesting(true)}
              disabled={!children || children.length === 0}
            >
              {t('FAMILY.HERO.REQUEST')}
            </Button>
          </div>
        </header>

        {family.data && !family.data.terms.accepted && (
          <Alert
            severity="warning"
            className="fam-notice"
            action={
              <Button component={Link} to="/family/settings" color="inherit">
                {t('FAMILY.TERMS.REVIEW')}
              </Button>
            }
          >
            {t('FAMILY.TERMS.PENDING')}
          </Alert>
        )}
        <OpenPaymentBanner />
        <TrialFollowUps />
        <RenewAllBanner onOpen={() => setRenewingAll(true)} />
        {renewingAll && (
          <RenewAllSheet
            onClose={closeRenewAll}
            onRequestInstead={(packageId) => {
              closeRenewAll();
              const found = findChildPackage(children, packageId);
              if (found) setTopUpFor(found.child);
            }}
          />
        )}

        <div className="fam-tiles">
          {tiles.map((tile) => (
            <Link
              key={tile.key}
              to={tile.to}
              className={`fam-tile fam-tile--${tile.tone}`}
              onClick={() => choose('all')}
            >
              <span className="fam-tile__icon" aria-hidden="true">
                {tile.icon}
              </span>
              <span className="fam-tile__text">
                {loading ? (
                  <Skeleton width={72} height={32} />
                ) : (
                  <strong className="fam-tile__value">{tile.value}</strong>
                )}
                <span className="fam-tile__label" dir="auto">
                  {loading ? '' : tile.label}
                </span>
              </span>
              <ArrowForwardRounded
                className="fam-tile__go sd-flip"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>

        {/* Free trials waiting for an instructor, for every child */}
        {children && children.length > 0 && (
          <TrialRequestsCard allChildren showStudent={children.length > 1} />
        )}

        <div className="fam-cols">
          <div className="fam-main">
            {loading && <Skeleton variant="rounded" height={360} />}

            {children && children.length === 0 && (
              <div className="fam-card fam-empty">
                <p className="fam-empty__title">{t('FAMILY.EMPTY')}</p>
                <div className="fam-empty__actions">
                  <Button
                    component={Link}
                    to="/buy"
                    variant="contained"
                    startIcon={<AddShoppingCartRounded />}
                  >
                    {t('BUY.FIRST_COURSE')}
                  </Button>
                  <Button
                    component={Link}
                    to="/family/settings"
                    variant="text"
                    startIcon={<AddRounded />}
                  >
                    {t('FAMILY.SETTINGS.ADD_CHILD')}
                  </Button>
                </div>
              </div>
            )}

            {children?.map((child, index) => (
              <ChildCard
                key={child.id}
                child={child}
                color={childColor(index)}
                onOpen={(path) => open(child, path)}
                onRenew={(pkg) => setRenewing({ pkg, child })}
              />
            ))}
          </div>

          {children && children.length > 0 && (
            <aside className="fam-side">
              <section className="fam-card fam-upcoming">
                <div className="fam-card__header">
                  <h2 className="fam-card__title">
                    {t('FAMILY.CARD.COMING_UP')}
                  </h2>
                  <Link
                    className="fam-card__link"
                    to="/calendar"
                    onClick={() => choose('all')}
                  >
                    {t('NAVIGATION.CALENDAR')}
                    <ArrowForwardRounded className="sd-flip" />
                  </Link>
                </div>
                {upcoming.length === 0 && (
                  <div className="fam-empty-state">
                    <span className="fam-empty-state__icon" aria-hidden="true">
                      <EventAvailableRounded />
                    </span>
                    <strong>{t('FAMILY.UPCOMING.NONE')}</strong>
                    <p>{t('FAMILY.UPCOMING.NONE_TEXT')}</p>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => setRequesting(true)}
                    >
                      {t('FAMILY.HERO.REQUEST')}
                    </Button>
                  </div>
                )}
                <ol className="fam-upcoming__list">
                  {upcoming.map(({ child, color, session }) => (
                    <li
                      key={session.id}
                      className="fam-upcoming__item"
                      style={{ '--kid': color } as React.CSSProperties}
                    >
                      <div className="fam-upcoming__date" aria-hidden="true">
                        <span className="fam-upcoming__day">
                          {new Date(session.start_time).toLocaleDateString(
                            locale,
                            { day: 'numeric' },
                          )}
                        </span>
                        <span className="fam-upcoming__month">
                          {new Date(session.start_time).toLocaleDateString(
                            locale,
                            { month: 'short' },
                          )}
                        </span>
                      </div>
                      <div className="fam-upcoming__main">
                        <span className="fam-upcoming__subject" dir="auto">
                          {subjectName(session.course_name)}
                          {session.status === 'open' && (
                            <span className="fam-upcoming__live">
                              {t('FAMILY.CARD.LIVE')}
                            </span>
                          )}
                        </span>
                        <span className="fam-upcoming__meta">
                          {children.length > 1 && (
                            <>
                              <span className="fam-upcoming__dot" />
                              {child.first_name} ·{' '}
                            </>
                          )}
                          {new Date(session.start_time).toLocaleString(locale, {
                            weekday: 'short',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                          {' · '}
                          {session.tutor_name}
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              <section className="fam-card fam-notes">
                <div className="fam-card__header">
                  <h2 className="fam-card__title">{t('FAMILY.NOTES.TITLE')}</h2>
                  <Link className="fam-card__link" to="/family/notes">
                    {t('FAMILY.CARD.SHOW_ALL')}
                    <ArrowForwardRounded className="sd-flip" />
                  </Link>
                </div>
                {latestNotes.length === 0 ? (
                  <p className="fam-muted">{t('FAMILY.NOTES_CARD.EMPTY')}</p>
                ) : (
                  <ul className="fam-notes__list">
                    {latestNotes.map((child) => (
                      <li key={child.id}>
                        <MenuBookRounded aria-hidden="true" />
                        <Link to="/family/notes">{child.first_name}</Link>
                        <span>
                          {formatRelative(
                            child.latest_note_at as string,
                            i18n.language,
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </aside>
          )}
        </div>

        {renewing && (
          <RenewDialog
            packageId={renewing.pkg.id}
            packageType={renewing.pkg.package_type}
            hoursLeft={renewing.pkg.hours_left}
            onClose={() => setRenewing(null)}
            onRequestInstead={() => {
              const { child } = renewing;
              setRenewing(null);
              setTopUpFor(child);
            }}
          />
        )}
      </div>
      {topUpFor && (
        <TopUpDialog child={topUpFor} onClose={() => setTopUpFor(null)} />
      )}
      {requesting && (
        <Dialog
          maxWidth="sm"
          fullWidth
          open
          onClose={() => setRequesting(false)}
          aria-labelledby="request-sessions-dialog"
        >
          <RequestSessionsModal handleClose={() => setRequesting(false)} />
        </Dialog>
      )}
    </div>
  );
};

export default FamilyHome;
