import { FC, FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Chip, Switch, TextField } from '@mui/material';
import { ArrowBackRounded, PersonAddRounded } from '@mui/icons-material';
import {
  familyErrorMessage,
  useAcceptTerms,
  useAddChild,
  useChildConsent,
  useFamily,
  useInviteChildLogin,
  useRemoveChildLogin,
  useUpdateFamily,
  type FamilyChild,
} from '../../hooks/useFamily';
import { useRtlClass } from '../../assets/utils/utils';
import { snackActions } from '../../assets/utils/toaster';
import { formatDateTime } from '../homework/homework.utils';
import './family.styles.scss';

const useReport = () => {
  const { t } = useTranslation();
  return (err: unknown) =>
    snackActions.error(familyErrorMessage(err, t('FAMILY.ERROR')));
};

/** One child's login and consent settings */
const ChildSettings: FC<{ child: FamilyChild }> = ({ child }) => {
  const { t, i18n } = useTranslation();
  const report = useReport();
  const invite = useInviteChildLogin();
  const removeLogin = useRemoveChildLogin();
  const consent = useChildConsent();
  const [email, setEmail] = useState('');

  const sendInvite = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await invite.mutateAsync({ childId: child.id, email: email.trim() });
      snackActions.success(
        t('FAMILY.SETTINGS.LOGIN_SENT', { name: child.first_name }),
      );
      setEmail('');
    } catch (err) {
      report(err);
    }
  };

  const drop = async () => {
    try {
      await removeLogin.mutateAsync(child.id);
      snackActions.success(
        t('FAMILY.SETTINGS.LOGIN_REMOVED', { name: child.first_name }),
      );
    } catch (err) {
      report(err);
    }
  };

  const toggleConsent = async (packageId: number, value: boolean) => {
    try {
      await consent.mutateAsync({
        childId: child.id,
        packageId,
        consent: value,
      });
    } catch (err) {
      report(err);
    }
  };

  return (
    <li className="family__section">
      <div className="family__row">
        <h3 className="family__section-title">
          {child.first_name} {child.last_name}
        </h3>
        <Chip
          size="small"
          variant="outlined"
          label={
            child.login_enabled
              ? t('FAMILY.SETTINGS.OWN_LOGIN')
              : t('FAMILY.SETTINGS.THROUGH_YOU')
          }
        />
      </div>

      {child.login_enabled ? (
        <div className="family__row">
          <span className="family__muted">{child.email}</span>
          <Button
            size="small"
            color="error"
            onClick={drop}
            disabled={removeLogin.isPending}
          >
            {t('FAMILY.SETTINGS.REMOVE_LOGIN')}
          </Button>
        </div>
      ) : (
        <form className="family__row" onSubmit={sendInvite}>
          <TextField
            size="small"
            type="email"
            label={t('FAMILY.SETTINGS.CHILD_EMAIL')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="outlined"
            size="small"
            disabled={invite.isPending}
          >
            {t('FAMILY.SETTINGS.GIVE_LOGIN')}
          </Button>
          <span className="family__muted">
            {t('FAMILY.SETTINGS.LOGIN_HINT')}
          </span>
        </form>
      )}

      {child.packages.length > 0 && (
        <div>
          <p className="family__muted">{t('FAMILY.SETTINGS.CONSENT_TEXT')}</p>
          <ul className="family__list">
            {child.packages.map((pkg) => (
              <li key={pkg.id} className="family__row">
                <Switch
                  checked={!!pkg.recording_consented_at}
                  onChange={(e) => toggleConsent(pkg.id, e.target.checked)}
                  inputProps={{
                    'aria-label': t('FAMILY.SETTINGS.CONSENT_FOR', {
                      course: pkg.course_name,
                    }),
                  }}
                  disabled={consent.isPending}
                />
                <span>
                  {pkg.course_name} · {pkg.tutor_name}
                </span>
                <span className="family__muted">
                  {pkg.recording_consented_at
                    ? t('FAMILY.SETTINGS.CONSENTED', {
                        date: formatDateTime(
                          pkg.recording_consented_at,
                          i18n.language,
                        ),
                      })
                    : t('FAMILY.SETTINGS.NOT_CONSENTED')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
};

/**
 * Family settings: name and phone, terms, the children with their logins,
 * and recording consent per package.
 */
const FamilySettings: FC = () => {
  const { t, i18n } = useTranslation();
  const rtlClass = useRtlClass();
  const report = useReport();
  const family = useFamily();
  const update = useUpdateFamily();
  const acceptTerms = useAcceptTerms();
  const addChild = useAddChild();
  const [name, setName] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [newChild, setNewChild] = useState({ first_name: '', last_name: '' });

  const data = family.data;

  const saveContacts = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await update.mutateAsync({
        name: name ?? data?.name ?? undefined,
        phone_number: phone ?? data?.phone_number ?? undefined,
      });
      snackActions.success(t('FAMILY.SETTINGS.SAVED'));
    } catch (err) {
      report(err);
    }
  };

  const createChild = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await addChild.mutateAsync(newChild);
      snackActions.success(
        t('FAMILY.SETTINGS.CHILD_ADDED', { name: newChild.first_name }),
      );
      setNewChild({ first_name: '', last_name: data?.name ?? '' });
    } catch (err) {
      report(err);
    }
  };

  const accept = async () => {
    try {
      await acceptTerms.mutateAsync();
      snackActions.success(t('FAMILY.TERMS.ACCEPTED'));
    } catch (err) {
      report(err);
    }
  };

  return (
    <div className={`family ${rtlClass}`}>
      <div className="container">
        <Link to="/family" className="family__back">
          <ArrowBackRounded aria-hidden="true" />
          {t('FAMILY.BACK')}
        </Link>
        <header className="family__header">
          <div>
            <h1 className="family__title">{t('FAMILY.SETTINGS.TITLE')}</h1>
            <p className="family__subtitle">{t('FAMILY.SETTINGS.SUBTITLE')}</p>
          </div>
        </header>

        {data && (
          <>
            <form className="family__section" onSubmit={saveContacts}>
              <h2 className="family__section-title">
                {t('FAMILY.SETTINGS.CONTACTS')}
              </h2>
              <div className="family__row">
                <TextField
                  size="small"
                  label={t('FAMILY.SETTINGS.FAMILY_NAME')}
                  value={name ?? data.name}
                  onChange={(e) => setName(e.target.value)}
                />
                <TextField
                  size="small"
                  label={t('FAMILY.SETTINGS.PHONE')}
                  value={phone ?? data.phone_number ?? ''}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <TextField
                  size="small"
                  label={t('FAMILY.SETTINGS.EMAIL')}
                  value={data.email ?? ''}
                  disabled
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={update.isPending}
                >
                  {t('FAMILY.SETTINGS.SAVE')}
                </Button>
              </div>
            </form>

            <section className="family__section">
              <h2 className="family__section-title">
                {t('FAMILY.TERMS.TITLE')}
              </h2>
              {data.terms.accepted ? (
                <p className="family__muted">
                  {t('FAMILY.TERMS.ACCEPTED_ON', {
                    date: data.terms.accepted_at
                      ? formatDateTime(data.terms.accepted_at, i18n.language)
                      : '',
                  })}
                </p>
              ) : (
                <div className="family__row">
                  <span>{t('FAMILY.TERMS.TEXT')}</span>
                  <Button
                    component={Link}
                    to="/terms"
                    variant="text"
                    size="small"
                  >
                    {t('FAMILY.TERMS.READ')}
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={accept}
                    disabled={acceptTerms.isPending}
                  >
                    {t('FAMILY.TERMS.ACCEPT')}
                  </Button>
                </div>
              )}
            </section>

            <section>
              <h2
                className="family__section-title"
                style={{ marginBottom: '0.75rem' }}
              >
                {t('FAMILY.SETTINGS.CHILDREN')}
              </h2>
              <ul className="family__list">
                {data.children.map((child) => (
                  <ChildSettings key={child.id} child={child} />
                ))}
              </ul>
              <form
                className="family__section"
                onSubmit={createChild}
                style={{ marginTop: '0.75rem' }}
              >
                <h3 className="family__section-title">
                  {t('FAMILY.SETTINGS.ADD_CHILD')}
                </h3>
                <div className="family__row">
                  <TextField
                    size="small"
                    label={t('FAMILY.SETTINGS.FIRST_NAME')}
                    value={newChild.first_name}
                    onChange={(e) =>
                      setNewChild({ ...newChild, first_name: e.target.value })
                    }
                    required
                  />
                  <TextField
                    size="small"
                    label={t('FAMILY.SETTINGS.LAST_NAME')}
                    value={newChild.last_name}
                    onChange={(e) =>
                      setNewChild({ ...newChild, last_name: e.target.value })
                    }
                    required
                  />
                  <Button
                    type="submit"
                    variant="outlined"
                    startIcon={<PersonAddRounded />}
                    disabled={addChild.isPending}
                  >
                    {t('FAMILY.SETTINGS.ADD')}
                  </Button>
                </div>
                <p className="family__muted">{t('FAMILY.SETTINGS.ADD_HINT')}</p>
              </form>
            </section>
          </>
        )}
        {family.isError && <Alert severity="error">{t('FAMILY.ERROR')}</Alert>}
      </div>
    </div>
  );
};

export default FamilySettings;
