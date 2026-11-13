import { FC, FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Checkbox,
  FormControlLabel,
  Switch,
  TextField,
} from '@mui/material';

import { Instructor } from '../../../../assets/types';
import { useUpdateTutorProfile } from '../../../../hooks/useInstructors';
import {
  parseTargetStudents,
  targetProgress,
  TARGET_STUDENTS_MAX,
} from '../edit-profile.utils';

import './profile-preferences.styles.scss';

interface ProfilePreferencesProps {
  instructor: Instructor;
}

/**
 * The instructor's own teaching preferences, seen only by them and ops:
 * a target number of students with progress toward it, same-day trials,
 * and whether they take new students. Each saves on its own, so it works
 * even while the rest of the profile is incomplete.
 */
const ProfilePreferences: FC<ProfilePreferencesProps> = ({ instructor }) => {
  const { t } = useTranslation();
  const update = useUpdateTutorProfile();

  const savedTarget = instructor.target_students ?? null;
  const [target, setTarget] = useState(savedTarget?.toString() ?? '');
  useEffect(() => setTarget(savedTarget?.toString() ?? ''), [savedTarget]);

  const parsedTarget = parseTargetStudents(target);
  const targetChanged = target.trim() !== (savedTarget?.toString() ?? '');
  const current = instructor.active_students_count ?? 0;
  const progress = targetProgress(current, savedTarget);

  const save = (tutor: {
    target_students?: number | '';
    accepting_new_students?: boolean;
    same_day_trials?: boolean;
  }) => update.mutate({ id: instructor.id, userData: { tutor } });

  const saveTarget = (event: FormEvent) => {
    event.preventDefault();
    if (parsedTarget === null || !targetChanged) return;
    save({ target_students: parsedTarget });
  };

  return (
    <section
      className="profile-preferences"
      aria-labelledby="profile-preferences-title"
    >
      <header className="profile-preferences__header">
        <h2 id="profile-preferences-title">
          {t('PROFILE.EDITPROFILE.PREFERENCES.TITLE')}
        </h2>
        <p>{t('PROFILE.EDITPROFILE.PREFERENCES.SUBTITLE')}</p>
      </header>

      <form className="profile-preferences__row" onSubmit={saveTarget}>
        <div className="profile-preferences__text">
          <label
            htmlFor="profile-target-students"
            className="profile-preferences__label"
          >
            {t('PROFILE.EDITPROFILE.PREFERENCES.TARGET_LABEL')}
          </label>
          <p className="profile-preferences__hint">
            {t('PROFILE.EDITPROFILE.PREFERENCES.TARGET_HINT')}
          </p>
        </div>
        <div className="profile-preferences__target">
          <TextField
            id="profile-target-students"
            size="small"
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            inputProps={{ min: 1, max: TARGET_STUDENTS_MAX, step: 1 }}
            error={parsedTarget === null}
            helperText={
              parsedTarget === null
                ? t('PROFILE.EDITPROFILE.PREFERENCES.TARGET_INVALID')
                : undefined
            }
            className="profile-preferences__target-input"
          />
          {targetChanged && (
            <Button
              type="submit"
              variant="contained"
              disabled={parsedTarget === null || update.isPending}
            >
              {t('PROFILE.EDITPROFILE.PREFERENCES.TARGET_SAVE')}
            </Button>
          )}
        </div>

        <div className="profile-preferences__progress">
          {progress ? (
            <>
              <p className="profile-preferences__progress-text">
                {t(
                  progress.reached
                    ? 'PROFILE.EDITPROFILE.PREFERENCES.PROGRESS_REACHED'
                    : 'PROFILE.EDITPROFILE.PREFERENCES.PROGRESS',
                  { current, target: savedTarget, percent: progress.percent },
                )}
              </p>
              <span
                className="profile-preferences__track"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={savedTarget ?? 0}
                aria-valuenow={current}
                aria-label={t('PROFILE.EDITPROFILE.PREFERENCES.TARGET_LABEL')}
              >
                <span
                  className={`profile-preferences__bar ${
                    progress.reached ? 'profile-preferences__bar--done' : ''
                  }`}
                  style={{ width: `${progress.width}%` }}
                />
              </span>
            </>
          ) : (
            <p className="profile-preferences__progress-text">
              {t('PROFILE.EDITPROFILE.PREFERENCES.NO_TARGET', {
                count: current,
              })}
            </p>
          )}
          <p className="profile-preferences__hint">
            {t('PROFILE.EDITPROFILE.PREFERENCES.ACTIVE_HINT')}
          </p>
        </div>
      </form>

      <div className="profile-preferences__row profile-preferences__row--toggle">
        <div className="profile-preferences__text">
          <label
            htmlFor="profile-same-day-trials"
            className="profile-preferences__label"
          >
            {t('PROFILE.EDITPROFILE.PREFERENCES.SAME_DAY_LABEL')}
          </label>
          <p className="profile-preferences__hint">
            {t('PROFILE.EDITPROFILE.PREFERENCES.SAME_DAY_HINT')}
          </p>
        </div>
        <Switch
          id="profile-same-day-trials"
          checked={instructor.same_day_trials ?? true}
          disabled={update.isPending}
          onChange={(e) => save({ same_day_trials: e.target.checked })}
        />
      </div>

      <div className="profile-preferences__row profile-preferences__row--toggle">
        <div className="profile-preferences__text">
          <FormControlLabel
            className="profile-preferences__checkbox"
            control={
              <Checkbox
                checked={instructor.accepting_new_students ?? true}
                disabled={update.isPending}
                onChange={(e) =>
                  save({ accepting_new_students: e.target.checked })
                }
              />
            }
            label={t('PROFILE.EDITPROFILE.PREFERENCES.NEW_STUDENTS_LABEL')}
          />
          <p className="profile-preferences__hint">
            {t('PROFILE.EDITPROFILE.PREFERENCES.NEW_STUDENTS_HINT')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProfilePreferences;
