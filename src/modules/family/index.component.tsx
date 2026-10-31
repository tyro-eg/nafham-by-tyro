import { FC, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  ArrowForwardRounded,
  AssignmentRounded,
  CalendarMonthRounded,
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
} from '../../hooks/useFamily';
import { useRtlClass } from '../../assets/utils/utils';
import { snackActions } from '../../assets/utils/toaster';
import { formatRelative } from '../homework/homework.utils';
import { subjectName } from '../dashboard/dashboard.utils';
import { childColor } from '../../lib/family-child';
import '../dashboard/dashboard.styles.scss';
import './family.styles.scss';

const DAY_MS = 24 * 60 * 60 * 1000;
const TONES = ['sky', 'mint', 'sun', 'lilac', 'coral'] as const;
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

/**
 * One child, at a glance: the numbers, the packages with hours left, the
 * next lesson in one line, and the way into that child's pages.
 */
const ChildCard: FC<{
  child: FamilyChild;
  color: string;
  onOpen: (path: string) => void;
  onTopUp: () => void;
}> = ({ child, color, onOpen, onTopUp }) => {
  const { t, i18n } = useTranslation();
  const locale = `${i18n.language}-u-nu-latn`;
  const next = (child.upcoming ?? [])[0] ?? null;
  const live = next?.status === 'open';
  const when = (iso: string) =>
    new Date(iso).toLocaleString(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
    });

  return (
    <section
      className="sd-card fam-kid"
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
        <Button
          variant="contained"
          size="small"
          className="fam-kid__open"
          endIcon={<ArrowForwardRounded className="sd-flip" />}
          onClick={() => onOpen('/my_sessions')}
        >
          {t('FAMILY.CARD.OPEN_AS', { name: child.first_name })}
        </Button>
      </header>

      <dl className="fam-kid__facts">
        <div>
          <dt>{t('FAMILY.CARD.HOURS_LEFT')}</dt>
          <dd>{child.hours_left}</dd>
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

      <div className={`fam-kid__next${live ? ' fam-kid__next--live' : ''}`}>
        <EventNoteRounded aria-hidden="true" />
        {next ? (
          <span dir="auto">
            <strong>
              {live
                ? t('FAMILY.CARD.LIVE')
                : formatRelative(next.start_time, i18n.language)}
            </strong>
            {' · '}
            {subjectName(next.course_name)} · {next.tutor_name} ·{' '}
            {when(next.start_time)}
          </span>
        ) : (
          <span>{t('FAMILY.CARD.NO_LESSON')}</span>
        )}
      </div>

      <h3 className="sd-subheading">{t('FAMILY.CARD.PACKAGES')}</h3>
      {child.packages.length === 0 && (
        <p className="sd-muted">{t('FAMILY.CARD.NO_PACKAGES')}</p>
      )}
      <ul className="fam-kid__packages">
        {child.packages.map((pkg, i) => (
          <li key={pkg.id} className="fam-kid__package">
            <Ring
              value={
                pkg.original_hours ? pkg.hours_left / pkg.original_hours : 0
              }
              label={`${pkg.hours_left}h`}
              tone={TONES[i % TONES.length]}
            />
            <div className="fam-kid__package-text">
              <span className="fam-kid__package-course" dir="auto">
                {subjectName(pkg.course_name)}
              </span>
              <span className="fam-kid__package-meta">
                {pkg.tutor_name} ·{' '}
                {t('FAMILY.CARD.HOURS_OF', {
                  left: pkg.hours_left,
                  total: pkg.original_hours,
                })}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <div className="fam-kid__actions">
        <Button
          variant="outlined"
          size="small"
          startIcon={<AssignmentRounded />}
          onClick={() => onOpen('/homework')}
        >
          {t('NAVIGATION.HOMEWORK')}
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<CalendarMonthRounded />}
          onClick={() => onOpen('/calendar')}
        >
          {t('NAVIGATION.CALENDAR')}
        </Button>
        <Button
          variant="text"
          size="small"
          startIcon={<AddRounded />}
          onClick={onTopUp}
        >
          {t('FAMILY.TOP_UP.BUTTON')}
        </Button>
      </div>
    </section>
  );
};

/**
 * The parent's home: a short welcome, the children side by side with their
 * numbers and packages, then the family's upcoming lessons in one list.
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

  const heroMessage = upcoming[0]
    ? t('FAMILY.HERO.NEXT', {
        child: upcoming[0].child.first_name,
        subject: subjectName(upcoming[0].session.course_name),
        tutor: upcoming[0].session.tutor_name,
        when: formatRelative(upcoming[0].session.start_time, i18n.language),
      })
    : t('FAMILY.HERO.NO_NEXT');

  return (
    <div className={`student-dashboard family-home ${rtlClass}`}>
      <div className="container sd-container">
        <section className="sd-hero fam-hero">
          <div className="sd-hero__content">
            <span className="sd-hero__eyebrow">
              {t('FAMILY.HERO.EYEBROW', { name: family.data?.name ?? '' })}
            </span>
            <h1 className="sd-hero__title">
              {t('FAMILY.HERO.WELCOME', {
                name: currentUser?.first_name ?? '',
              })}
            </h1>
            {loading ? (
              <Skeleton className="sd-hero__skeleton" width="70%" height={28} />
            ) : (
              <p className="sd-hero__message">{heroMessage}</p>
            )}
            {!loading && (
              <ul className="fam-hero__totals">
                <li>
                  <AccessTimeRounded aria-hidden="true" />
                  {t('FAMILY.HERO.HOURS', { count: totals.hours })}
                </li>
                <li>
                  <EventNoteRounded aria-hidden="true" />
                  {t('FAMILY.HERO.LESSONS_WEEK', {
                    count: totals.lessonsThisWeek,
                  })}
                </li>
                <li>
                  <AssignmentRounded aria-hidden="true" />
                  {t('FAMILY.HERO.HOMEWORK', { count: totals.homework })}
                </li>
              </ul>
            )}
          </div>
          <div className="fam-hero__actions">
            <Button
              component={Link}
              to="/family/notes"
              className="sd-hero__primary"
              startIcon={<MenuBookRounded />}
            >
              {t('FAMILY.NOTES.TITLE')}
            </Button>
            <Button
              component={Link}
              to="/messages"
              className="sd-hero__secondary"
              startIcon={<SupportAgentRounded />}
            >
              {t('FAMILY.SUPPORT')}
            </Button>
            <Button
              component={Link}
              to="/family/settings"
              className="sd-hero__secondary"
              startIcon={<SettingsRounded />}
            >
              {t('FAMILY.SETTINGS.TITLE')}
            </Button>
          </div>
        </section>

        {family.data && !family.data.terms.accepted && (
          <Alert
            severity="info"
            sx={{ mb: 2 }}
            action={
              <Button component={Link} to="/family/settings">
                {t('FAMILY.TERMS.REVIEW')}
              </Button>
            }
          >
            {t('FAMILY.TERMS.PENDING')}
          </Alert>
        )}

        {loading && (
          <div className="fam-kids">
            <Skeleton variant="rounded" height={320} />
            <Skeleton variant="rounded" height={320} />
          </div>
        )}

        {children && children.length === 0 && (
          <div className="sd-card sd-empty">
            <p className="sd-empty__text">{t('FAMILY.EMPTY')}</p>
            <Button
              component={Link}
              to="/family/settings"
              variant="contained"
              startIcon={<AddRounded />}
            >
              {t('FAMILY.SETTINGS.ADD_CHILD')}
            </Button>
          </div>
        )}

        {children && children.length > 0 && (
          <div className="fam-kids">
            {children.map((child, index) => (
              <ChildCard
                key={child.id}
                child={child}
                color={childColor(index)}
                onOpen={(path) => open(child, path)}
                onTopUp={() => setTopUpFor(child)}
              />
            ))}
          </div>
        )}

        {children && children.length > 0 && (
          <section className="sd-card fam-upcoming">
            <header className="sd-card__header">
              <h2 className="sd-card__title">{t('FAMILY.UPCOMING.TITLE')}</h2>
              <Link
                className="sd-card__link"
                to="/calendar"
                onClick={() => choose('all')}
              >
                {t('NAVIGATION.CALENDAR')}
                <ArrowForwardRounded className="sd-flip" />
              </Link>
            </header>
            {upcoming.length === 0 && (
              <p className="sd-muted">{t('FAMILY.UPCOMING.EMPTY')}</p>
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
                      {new Date(session.start_time).toLocaleDateString(locale, {
                        day: 'numeric',
                      })}
                    </span>
                    <span className="fam-upcoming__month">
                      {new Date(session.start_time).toLocaleDateString(locale, {
                        month: 'short',
                      })}
                    </span>
                  </div>
                  <div className="fam-upcoming__main">
                    <span className="fam-upcoming__who">
                      <span className="fam-upcoming__dot" />
                      {child.first_name}
                      {session.status === 'open' && (
                        <span className="fam-upcoming__live">
                          {t('FAMILY.CARD.LIVE')}
                        </span>
                      )}
                    </span>
                    <span className="fam-upcoming__subject" dir="auto">
                      {subjectName(session.course_name)}
                    </span>
                    <span className="fam-upcoming__meta">
                      {new Date(session.start_time).toLocaleDateString(locale, {
                        weekday: 'long',
                      })}{' '}
                      ·{' '}
                      {new Date(session.start_time).toLocaleTimeString(locale, {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                      {' – '}
                      {new Date(session.end_time).toLocaleTimeString(locale, {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                      {' · '}
                      {session.tutor_name}
                    </span>
                  </div>
                  <span className="fam-upcoming__in">
                    {formatRelative(session.start_time, i18n.language)}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
      {topUpFor && (
        <TopUpDialog child={topUpFor} onClose={() => setTopUpFor(null)} />
      )}
    </div>
  );
};

export default FamilyHome;
