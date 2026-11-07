import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, FormControlLabel, Switch } from '@mui/material';

import { useSetWantsStudents } from '../../../../hooks/useInstructors';
import { bookingErrorMessage } from '../../../../hooks/useSessions';

import './wants-students.styles.scss';

interface WantsStudentsProps {
  tutorId: number;
  value: boolean;
}

/**
 * The tutor's own switch: take free-trial requests at times outside their
 * published availability. Saved as soon as it is flipped.
 */
const WantsStudents: FC<WantsStudentsProps> = ({ tutorId, value }) => {
  const { t } = useTranslation();
  const save = useSetWantsStudents();
  const [checked, setChecked] = useState(value);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setChecked(value), [value]);

  const toggle = async (next: boolean) => {
    setError(null);
    setChecked(next);
    try {
      await save.mutateAsync({ id: tutorId, wantsStudents: next });
    } catch (err) {
      setChecked(!next);
      setError(bookingErrorMessage(err, t('PROFILE.WANTS_STUDENTS.ERROR')));
    }
  };

  return (
    <div className="wants-students">
      <FormControlLabel
        control={
          <Switch
            checked={checked}
            disabled={save.isPending}
            onChange={(event) => toggle(event.target.checked)}
          />
        }
        label={
          <span className="wants-students__text">
            <span className="wants-students__label">
              {t('PROFILE.WANTS_STUDENTS.LABEL')}
            </span>
            <span className="wants-students__hint">
              {t('PROFILE.WANTS_STUDENTS.HINT')}
            </span>
          </span>
        }
      />
      {error && <Alert severity="error">{error}</Alert>}
    </div>
  );
};

export default WantsStudents;
