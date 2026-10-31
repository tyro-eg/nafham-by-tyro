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
  AutoStoriesRounded,
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
  type FamilySessionSummary,
} from '../../hooks/useFamily';
import { useRtlClass } from '../../assets/utils/utils';
import { snackActions } from '../../assets/utils/toaster';
import { formatRelative } from '../homework/homework.utils';
import { subjectName } from '../dashboard/dashboard.utils';
import '../dashboard/dashboard.styles.scss';
import './family.styles.scss';

const DAY_MS = 24 * 60 * 60 * 1000;
const TONES = ['sky', 'mint', 'sun', 'lilac', 'coral'] as const;

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
 * One child's dashboard: the next lesson, what follows, hours left per
 * package, homework and notes, and the way into that child's pages.
 */
const ChildDashboard: FC<{
  child: FamilyChild;
  onOpen: (path: string) => void;
  onTopUp: () => void;
}> = ({ child, onOpen, onTopUp }) => {
  const { t, i18n } = useTranslation();
  const locale = `${i18n.language}-u-nu-latn`;
  const next = child.upcoming[0] ?? null;
  const later = child.upcoming.slice(1);
  const live = next?.status === 'open';

  const day = (iso: string, opts: Intl.DateTimeFormatOptions) =>
    new Date(iso).toLocaleDateString(locale, opts);
  const time = (iso: string) =>
    new Date(iso).toLocaleTimeString(locale, {
      hour: 'numeric',
      minute: '2-digit',
    });
  const startsIn = (session: FamilySessionSummary) =>
    session.status === 'open'
      ? t('FAMILY.CARD.LIVE')
      : formatRelative(session.start_time, i18n.language);

  return (
    <section className="sd-card fam-kid">
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
          endIcon={<ArrowForwardRounded className="sd-flip" />}
          onClick={() => onOpen('/my_sessions')}
        >
          {t('FAMILY.CARD.OPEN_AS', { name: child.first_name })}
        </Button>
      </header>

      <div className="fam-kid__grid">
        <div className="fam-kid__col">
          <h3 className="sd-subheading">{t('FAMILY.CARD.NEXT_LESSON')}</h3>
          {!next && <p className="sd-muted">{t('FAMILY.CARD.NO_LESSON')}</p>}
          {next && (
            <div className={`sd-next${live ? ' sd-next--live' : ''}`}>
              <div className="sd-next__date" aria-hidden="true">
                <span className="sd-next__month">
                  {day(next.start_time, { month: 'short' })}
                </span>
                <span className="sd-next__daynum">
                  {day(next.start_time, { day: 'numeric' })}
                </span>
              </div>
              <div className="sd-next__body">
                <span className="sd-next__chip">
                  {live && <span className="sd-next__pulse" />}
                  {startsIn(next)}
                </span>
                <h3 className="sd-next__subject" dir="auto">
                  {subjectName(next.course_name)}
                </h3>
                <p className="sd-next__when">
                  {day(next.start_time, {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}{' '}
                  · {time(next.start_time)} – {time(next.end_time)}
                </p>
                <span className="sd-next__tutor">{next.tutor_name}</span>
              </div>
            </div>
          )}
          {later.length > 0 && (
            <>
              <h3 className="sd-subheading">{t('FAMILY.CARD.COMING_UP')}</h3>
              <ol className="sd-timeline">
                {later.map((s) => (
                  <li key={s.id} className="sd-timeline__item">
                    <span className="sd-timeline__dot" />
                    <div className="sd-timeline__card">
                      <div className="sd-timeline__main">
                        <span className="sd-timeline__subject" dir="auto">
                          {subjectName(s.course_name)}
                        </span>
                        <span className="sd-timeline__meta">
                          {day(s.start_time, {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}{' '}
                          · {time(s.start_time)} · {s.tutor_name}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>

        <div className="fam-kid__col">
          <h3 className="sd-subheading">{t('FAMILY.CARD.PACKAGES')}</h3>
          {child.packages.length === 0 && (
            <p className="sd-muted">{t('FAMILY.CARD.NO_PACKAGES')}</p>
          )}
          <ul className="fam-kid__packages">
            {child.packages.map((pkg, i) => (
              <li key={pkg.id} className="fam-kid__package">
                <Ring
                  value={
                    pkg.original_hours
                      ? pkg.remaining_hours / pkg.original_hours
                      : 0
                  }
                  label={`${pkg.remaining_hours}h`}
                  tone={TONES[i % TONES.length]}
                />
                <div className="fam-kid__package-text">
                  <span className="fam-kid__package-course" dir="auto">
                    {subjectName(pkg.course_name)}
                  </span>
                  <span className="fam-kid__package-meta">
                    {pkg.tutor_name} ·{' '}
                    {t('FAMILY.CARD.HOURS_OF', {
                      left: pkg.remaining_hours,
                      total: pkg.original_hours,
                    })}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <dl className="fam-kid__facts">
            <div>
              <dt>{t('FAMILY.CARD.HOMEWORK_DUE')}</dt>
              <dd>{child.homework_due}</dd>
            </div>
            <div>
              <dt>{t('FAMILY.CARD.LESSONS')}</dt>
              <dd>{child.lessons_completed}</dd>
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
        </div>
      </div>
    </section>
  );
};

/**
 * The parent's home: a welcome with the family's next lesson, the numbers
 * across the children, then one dashboard per child.
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

  const open = (child: FamilyChild, path: string) => {
    choose(child.id);
    navigate(path);
  };

  // Across the family
  const totals = useMemo(() => {
    const kids = children ?? [];
    const now = Date.now();
    const weekAhead = now + 7 * DAY_MS;
    return {
      hours: kids.reduce((sum, c) => sum + c.hours_left, 0),
      lessonsThisWeek: kids.reduce(
        (sum, c) =>
          sum +
          c.upcoming.filter((s) => new Date(s.start_time).getTime() < weekAhead)
            .length,
        0,
      ),
      homework: kids.reduce((sum, c) => sum + c.homework_due, 0),
      newNotes: kids.filter(
        (c) =>
          c.latest_note_at &&
          now - new Date(c.latest_note_at).getTime() < 7 * DAY_MS,
      ).length,
    };
  }, [children]);

  // The family's very next lesson, for the welcome line
  const nextAcross = useMemo(() => {
    const all = (children ?? []).flatMap((c) =>
      c.next_session ? [{ child: c, session: c.next_session }] : [],
    );
    all.sort((a, b) =>
      a.session.start_time.localeCompare(b.session.start_time),
    );
    return all[0] ?? null;
  }, [children]);

  const stats = [
    {
      key: 'hours',
      tone: 'sky',
      icon: <AccessTimeRounded />,
      value: String(totals.hours),
      label: t('FAMILY.STATS.HOURS'),
    },
    {
      key: 'week',
      tone: 'mint',
      icon: <EventNoteRounded />,
      value: String(totals.lessonsThisWeek),
      label: t('FAMILY.STATS.LESSONS_WEEK'),
    },
    {
      key: 'homework',
      tone: 'sun',
      icon: <AssignmentRounded />,
      value: String(totals.homework),
      label: t('FAMILY.STATS.HOMEWORK'),
    },
    {
      key: 'notes',
      tone: 'lilac',
      icon: <AutoStoriesRounded />,
      value: String(totals.newNotes),
      label: t('FAMILY.STATS.NOTES'),
    },
  ];

  const heroMessage = nextAcross
    ? t('FAMILY.HERO.NEXT', {
        child: nextAcross.child.first_name,
        subject: subjectName(nextAcross.session.course_name),
        tutor: nextAcross.session.tutor_name,
        when: formatRelative(nextAcross.session.start_time, i18n.language),
      })
    : t('FAMILY.HERO.NO_NEXT');

  return (
    <div className={`student-dashboard family-home ${rtlClass}`}>
      <div className="container sd-container">
        <section className="sd-hero">
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
            <div className="sd-hero__actions">
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

        <div className="sd-stats">
          {stats.map((stat) => (
            <div key={stat.key} className={`sd-stat sd-stat--${stat.tone}`}>
              <span className="sd-stat__icon" aria-hidden="true">
                {stat.icon}
              </span>
              {loading ? (
                <Skeleton width={56} height={44} />
              ) : (
                <span className="sd-stat__value">{stat.value}</span>
              )}
              <span className="sd-stat__label">{stat.label}</span>
            </div>
          ))}
        </div>

        {loading && <Skeleton variant="rounded" height={280} />}

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

        {children?.map((child) => (
          <ChildDashboard
            key={child.id}
            child={child}
            onOpen={(path) => open(child, path)}
            onTopUp={() => setTopUpFor(child)}
          />
        ))}
      </div>
      {topUpFor && (
        <TopUpDialog child={topUpFor} onClose={() => setTopUpFor(null)} />
      )}
    </div>
  );
};

export default FamilyHome;
