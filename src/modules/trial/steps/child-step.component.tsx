import { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Avatar, Button, Skeleton } from '@mui/material';
import { ArrowForward, PersonAddRounded } from '@mui/icons-material';

import { useFamily } from '../../../hooks/useFamily';
import { getActiveChildId, setActiveChildId } from '../../../lib/family-child';

interface ChildStepProps {
  childId?: number;
  onNext: (childId: number) => void;
}

/**
 * A parent's first step: which child the trial is for. The pick becomes the
 * child the rest of the wizard, and every request, is about.
 */
const ChildStep: FC<ChildStepProps> = ({ childId, onNext }) => {
  const { t } = useTranslation();
  const family = useFamily();
  const children = family.data?.children ?? [];
  const active = getActiveChildId();
  const [picked, setPicked] = useState<number | undefined>(
    childId ?? (typeof active === 'number' ? active : undefined),
  );

  const next = () => {
    if (picked === undefined) return;
    setActiveChildId(picked);
    onNext(picked);
  };

  return (
    <div className="trial__step">
      <h2 className="trial__step-title">{t('TRIAL.CHILD.TITLE')}</h2>
      <p className="trial__hint">{t('TRIAL.CHILD.TEXT')}</p>

      {family.isLoading && <Skeleton variant="rounded" height={120} />}

      {!family.isLoading && children.length === 0 && (
        <div className="trial__empty">
          <p>{t('TRIAL.CHILD.NONE')}</p>
          <Button
            component={Link}
            to="/family/settings"
            variant="contained"
            startIcon={<PersonAddRounded />}
          >
            {t('FAMILY.SETTINGS.ADD_CHILD')}
          </Button>
        </div>
      )}

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
          <Link
            to="/family/settings"
            className="trial__child trial__child--add"
          >
            <PersonAddRounded aria-hidden="true" />
            <span className="trial__child-name">{t('TRIAL.CHILD.ADD')}</span>
          </Link>
        </div>
      )}

      <div className="trial__actions">
        <span />
        <Button
          variant="contained"
          size="large"
          disabled={picked === undefined}
          color="primary"
          endIcon={<ArrowForward />}
          onClick={next}
        >
          {t('TRIAL.ACTIONS.NEXT')}
        </Button>
      </div>
    </div>
  );
};

export default ChildStep;
