import { FC, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Alert,
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
  AddRounded,
  MenuBookRounded,
  SettingsRounded,
  SupportAgentRounded,
} from '@mui/icons-material';
import {
  familyErrorMessage,
  useActiveChild,
  useFamily,
  useRequestTopUp,
  type FamilyChild,
} from '../../hooks/useFamily';
import { useRtlClass } from '../../assets/utils/utils';
import { snackActions } from '../../assets/utils/toaster';
import { formatDateTime, formatRelative } from '../homework/homework.utils';
import './family.styles.scss';

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

/**
 * The parent's home: one card per child with where they stand, a way into
 * that child's pages, a top-up request and the family's settings.
 */
const FamilyHome: FC = () => {
  const { t, i18n } = useTranslation();
  const rtlClass = useRtlClass();
  const navigate = useNavigate();
  const family = useFamily();
  const children = family.data?.children;
  const { choose } = useActiveChild(children);
  const [topUpFor, setTopUpFor] = useState<FamilyChild | null>(null);

  const open = (child: FamilyChild, path: string) => {
    choose(child.id);
    navigate(path);
  };

  return (
    <div className={`family ${rtlClass}`}>
      <div className="container">
        <header className="family__header">
          <div>
            <h1 className="family__title">
              {t('FAMILY.TITLE', { name: family.data?.name ?? '' })}
            </h1>
            <p className="family__subtitle">{t('FAMILY.SUBTITLE')}</p>
          </div>
          <div className="family__actions">
            <Button
              component={Link}
              to="/family/notes"
              variant="outlined"
              startIcon={<MenuBookRounded />}
            >
              {t('FAMILY.NOTES.TITLE')}
            </Button>
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
              variant="contained"
              startIcon={<SettingsRounded />}
            >
              {t('FAMILY.SETTINGS.TITLE')}
            </Button>
          </div>
        </header>

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

        {family.isLoading && (
          <div className="family__grid">
            {[0, 1].map((i) => (
              <Skeleton key={i} variant="rounded" height={240} />
            ))}
          </div>
        )}

        {children && children.length === 0 && (
          <div className="family__section family__empty">
            <p>{t('FAMILY.EMPTY')}</p>
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
          <ul className="family__grid">
            {children.map((child) => (
              <li key={child.id} className="family__card">
                <div className="family__card-head">
                  <h2 className="family__name">{child.first_name}</h2>
                  {child.latest_note_at && (
                    <span className="family__chip">
                      {t('FAMILY.CARD.NEW_NOTE')}
                    </span>
                  )}
                </div>
                <dl className="family__facts">
                  <div>
                    <dt>{t('FAMILY.CARD.NEXT_LESSON')}</dt>
                    <dd>
                      {child.next_session
                        ? `${formatRelative(child.next_session.start_time, i18n.language)} · ${child.next_session.tutor_name}`
                        : t('FAMILY.CARD.NO_LESSON')}
                    </dd>
                  </div>
                  <div>
                    <dt>{t('FAMILY.CARD.HOURS_LEFT')}</dt>
                    <dd>
                      {t('FAMILY.CARD.HOURS', { count: child.hours_left })}
                    </dd>
                  </div>
                  <div>
                    <dt>{t('FAMILY.CARD.HOMEWORK_DUE')}</dt>
                    <dd>{child.homework_due}</dd>
                  </div>
                  <div>
                    <dt>{t('FAMILY.CARD.LESSONS')}</dt>
                    <dd>{child.lessons_completed}</dd>
                  </div>
                </dl>
                {child.next_session && (
                  <p className="family__muted">
                    {formatDateTime(
                      child.next_session.start_time,
                      i18n.language,
                    )}{' '}
                    · {child.next_session.course_name}
                  </p>
                )}
                <div className="family__card-actions">
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => open(child, '/my_sessions')}
                  >
                    {t('FAMILY.CARD.OPEN')}
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => open(child, '/homework')}
                  >
                    {t('NAVIGATION.HOMEWORK')}
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => setTopUpFor(child)}
                  >
                    {t('FAMILY.TOP_UP.BUTTON')}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {topUpFor && (
        <TopUpDialog child={topUpFor} onClose={() => setTopUpFor(null)} />
      )}
    </div>
  );
};

export default FamilyHome;
