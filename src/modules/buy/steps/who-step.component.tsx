import { FC, FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Avatar, Button, Skeleton, TextField } from '@mui/material';
import { ArrowForwardRounded, PersonAddRounded } from '@mui/icons-material';

import {
  familyErrorMessage,
  useAddChild,
  useFamily,
} from '../../../hooks/useFamily';
import { snackActions } from '../../../assets/utils/toaster';

interface WhoStepProps {
  childId?: number;
  onNext: (childId: number) => void;
}

/**
 * A parent's first step: which child the course is for. A new child can be
 * added right here, so "new child plus first course" is one visit.
 */
const WhoStep: FC<WhoStepProps> = ({ childId, onNext }) => {
  const { t } = useTranslation();
  const family = useFamily();
  const addChild = useAddChild();
  const children = family.data?.children ?? [];
  const [picked, setPicked] = useState<number | undefined>(childId);
  const [adding, setAdding] = useState(children.length === 0);
  const [draft, setDraft] = useState({ first_name: '', last_name: '' });
  const [error, setError] = useState<string | null>(null);

  const add = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      const child = await addChild.mutateAsync({
        first_name: draft.first_name.trim(),
        last_name: draft.last_name.trim() || (family.data?.name ?? ''),
      });
      snackActions.success(
        t('FAMILY.SETTINGS.CHILD_ADDED', { name: child.first_name }),
      );
      setDraft({ first_name: '', last_name: '' });
      setAdding(false);
      setPicked(child.id);
    } catch (err) {
      setError(familyErrorMessage(err, t('FAMILY.ERROR')));
    }
  };

  return (
    <div className="trial__step">
      <h2 className="trial__step-title">{t('BUY.WHO.TITLE')}</h2>
      <p className="trial__hint">{t('BUY.WHO.TEXT')}</p>

      {family.isLoading && <Skeleton variant="rounded" height={120} />}

      {children.length > 0 && (
        <div className="trial__children" role="radiogroup">
          {children.map((child) => (
            <button
              key={child.id}
              type="button"
              role="radio"
              aria-checked={picked === child.id}
              className={`trial__child${picked === child.id ? ' trial__child--on' : ''}`}
              onClick={() => setPicked(child.id)}
            >
              <Avatar className="trial__child-avatar">
                {child.first_name[0]}
              </Avatar>
              <span className="trial__child-name">
                {child.first_name} {child.last_name}
              </span>
            </button>
          ))}
          {!adding && (
            <button
              type="button"
              className="trial__child trial__child--add"
              onClick={() => setAdding(true)}
            >
              <PersonAddRounded aria-hidden="true" />
              <span className="trial__child-name">{t('BUY.WHO.ADD')}</span>
            </button>
          )}
        </div>
      )}

      {adding && !family.isLoading && (
        <form className="buy-add-child" onSubmit={add}>
          <p className="buy-add-child__title">
            {children.length === 0 ? t('BUY.WHO.NONE') : t('BUY.WHO.ADD')}
          </p>
          <div className="buy-add-child__fields">
            <TextField
              label={t('BUY.WHO.FIRST_NAME')}
              value={draft.first_name}
              onChange={(e) =>
                setDraft({ ...draft, first_name: e.target.value })
              }
              required
              autoFocus
              fullWidth
            />
            <TextField
              label={t('BUY.WHO.LAST_NAME')}
              value={draft.last_name}
              onChange={(e) =>
                setDraft({ ...draft, last_name: e.target.value })
              }
              fullWidth
            />
          </div>
          {error && <Alert severity="error">{error}</Alert>}
          <div className="buy-add-child__actions">
            {children.length > 0 && (
              <Button variant="text" onClick={() => setAdding(false)}>
                {t('FAMILY.CANCEL')}
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              startIcon={<PersonAddRounded />}
              disabled={addChild.isPending || !draft.first_name.trim()}
            >
              {t('BUY.WHO.SAVE')}
            </Button>
          </div>
        </form>
      )}

      <div className="trial__actions">
        <span />
        <Button
          className="trial__cta"
          variant="contained"
          size="large"
          disabled={picked === undefined}
          endIcon={<ArrowForwardRounded />}
          onClick={() => picked !== undefined && onNext(picked)}
        >
          {t('BUY.ACTIONS.NEXT')}
        </Button>
      </div>
    </div>
  );
};

export default WhoStep;
