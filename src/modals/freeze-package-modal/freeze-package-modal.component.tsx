import { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Button,
  CircularProgress,
  IconButton,
  TextField,
} from '@mui/material';
import { Close, PauseCircleRounded } from '@mui/icons-material';

import {
  FREEZE_REASONS,
  useCreateFreeze,
  useFreezeOptions,
  type FreezeReason,
} from '../../hooks/useFreezes';
import { weeklyPatternLabel } from '../../hooks/useScheduleChanges';
import { changeErrorMessage } from '../../hooks/useSessionChanges';
import { addDays, formatSlot } from '../../modules/trial/trial.types';
import type { Package } from '../../assets/types';

import './freeze-package-modal.styles.scss';

interface FreezePackageModalProps {
  packageData: Package;
  handleClose: () => void;
}

const NOTE_LENGTH = 500;

/**
 * Pause a package: pick the first and last day (one to four weeks, from
 * the day after tomorrow), a reason and a note. The lessons in between are
 * cancelled with their hours back, the usual times are kept and booked
 * again from the day after the last day.
 */
const FreezePackageModal: FC<FreezePackageModalProps> = ({
  packageData,
  handleClose,
}) => {
  const { t, i18n } = useTranslation();
  const locale = `${i18n.language}-u-nu-latn`;
  const create = useCreateFreeze();
  const [startsOn, setStartsOn] = useState('');
  const [endsOn, setEndsOn] = useState('');
  const [reason, setReason] = useState<FreezeReason | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const limits = useFreezeOptions(packageData.id, {});
  const preview = useFreezeOptions(
    packageData.id,
    { starts_on: startsOn, ends_on: endsOn },
    !!startsOn && !!endsOn,
  );

  // Start at the earliest allowed day for the shortest pause
  useEffect(() => {
    if (limits.data && !startsOn) {
      setStartsOn(limits.data.earliest_start);
      setEndsOn(addDays(limits.data.earliest_start, limits.data.min_days - 1));
    }
  }, [limits.data, startsOn]);

  const days = useMemo(() => {
    if (!startsOn || !endsOn) return 0;
    const from = new Date(`${startsOn}T00:00:00`);
    const to = new Date(`${endsOn}T00:00:00`);
    return Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1;
  }, [startsOn, endsOn]);

  const minDays = limits.data?.min_days ?? 7;
  const maxDays = limits.data?.max_days ?? 28;
  const lengthOk = days >= minDays && days <= maxDays;

  const submit = async () => {
    if (!reason || !lengthOk) return;
    setError(null);
    try {
      await create.mutateAsync({
        packageId: packageData.id,
        starts_on: startsOn,
        ends_on: endsOn,
        reason,
        note,
      });
      handleClose();
    } catch (err) {
      setError(changeErrorMessage(err, t('SESSION_CHANGES.FREEZE.ERROR')));
    }
  };

  const minutes = (count: number) =>
    t('MYSESSIONS.MAIN.CARD.MINUTES_COUNT', { count });

  return (
    <div className="freeze-modal">
      <header className="freeze-modal__header">
        <div className="freeze-modal__icon">
          <PauseCircleRounded />
        </div>
        <div className="freeze-modal__heading">
          <h4 className="freeze-modal__title">
            {t('SESSION_CHANGES.FREEZE.TITLE')}
          </h4>
          <p className="freeze-modal__subtitle">
            {t('SESSION_CHANGES.FREEZE.TEXT', {
              course: packageData.grade_subject.full_course_name,
              tutor: packageData.tutor.first_name,
              min: minDays,
              max: maxDays,
            })}
          </p>
        </div>
        <IconButton
          aria-label={t('SESSION_CHANGES.CLOSE')}
          className="freeze-modal__close"
          onClick={handleClose}
        >
          <Close />
        </IconButton>
      </header>

      {limits.isLoading && (
        <div className="freeze-modal__loading">
          <CircularProgress size={28} />
        </div>
      )}

      {limits.data && (
        <>
          <div className="freeze-modal__dates">
            <TextField
              size="small"
              type="date"
              label={t('SESSION_CHANGES.FREEZE.FROM')}
              value={startsOn}
              onChange={(event) => {
                setStartsOn(event.target.value);
                if (endsOn < event.target.value) {
                  setEndsOn(addDays(event.target.value, minDays - 1));
                }
              }}
              inputProps={{ min: limits.data.earliest_start }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              size="small"
              type="date"
              label={t('SESSION_CHANGES.FREEZE.TO')}
              value={endsOn}
              onChange={(event) => setEndsOn(event.target.value)}
              inputProps={{
                min: startsOn ? addDays(startsOn, minDays - 1) : undefined,
                max: startsOn ? addDays(startsOn, maxDays - 1) : undefined,
              }}
              InputLabelProps={{ shrink: true }}
            />
          </div>
          <p className={`freeze-modal__length${lengthOk ? '' : ' is-wrong'}`}>
            {days > 0 &&
              (lengthOk
                ? t('SESSION_CHANGES.FREEZE.LENGTH', {
                    count: days,
                    resume: addDays(endsOn, 1),
                  })
                : t('SESSION_CHANGES.FREEZE.LENGTH_WRONG', {
                    min: minDays,
                    max: maxDays,
                  }))}
          </p>

          <div className="freeze-modal__preview">
            {preview.isFetching && <CircularProgress size={16} />}
            {preview.data && (
              <>
                <p className="freeze-modal__preview-title">
                  {t('SESSION_CHANGES.FREEZE.CANCELS', {
                    count: preview.data.lessons.length,
                  })}
                </p>
                {preview.data.lessons.length > 0 && (
                  <ul className="freeze-modal__lessons">
                    {preview.data.lessons.map((lesson) => (
                      <li key={lesson.id}>
                        {formatSlot(lesson.start_time, locale)}
                      </li>
                    ))}
                  </ul>
                )}
                {preview.data.weekly_pattern.length > 0 ? (
                  <p className="freeze-modal__kept">
                    {t('SESSION_CHANGES.FREEZE.KEPT', {
                      times: weeklyPatternLabel(
                        preview.data.weekly_pattern,
                        locale,
                        minutes,
                      ),
                    })}
                  </p>
                ) : (
                  <p className="freeze-modal__kept">
                    {t('SESSION_CHANGES.FREEZE.NO_PATTERN')}
                  </p>
                )}
              </>
            )}
          </div>

          <p className="freeze-modal__label">
            {t('SESSION_CHANGES.FREEZE.WHY')}
          </p>
          <div className="freeze-modal__chips" role="radiogroup">
            {FREEZE_REASONS.map((key) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={reason === key}
                className={`freeze-modal__chip${reason === key ? ' is-selected' : ''}`}
                onClick={() => setReason(key)}
              >
                {t(`SESSION_CHANGES.FREEZE.REASONS.${key.toUpperCase()}`)}
              </button>
            ))}
          </div>

          <TextField
            size="small"
            fullWidth
            multiline
            minRows={2}
            label={t('SESSION_CHANGES.FREEZE.NOTE')}
            value={note}
            onChange={(event) =>
              setNote(event.target.value.slice(0, NOTE_LENGTH))
            }
            inputProps={{ maxLength: NOTE_LENGTH, dir: 'auto' }}
          />
        </>
      )}

      {error && (
        <Alert severity="error" className="freeze-modal__error">
          {error}
        </Alert>
      )}

      <footer className="freeze-modal__footer">
        <Button
          variant="outlined"
          onClick={handleClose}
          disabled={create.isPending}
        >
          {t('SESSION_CHANGES.CLOSE')}
        </Button>
        <Button
          variant="contained"
          onClick={submit}
          disabled={!reason || !lengthOk || create.isPending || !limits.data}
        >
          {t('SESSION_CHANGES.FREEZE.SUBMIT')}
        </Button>
      </footer>
    </div>
  );
};

export default FreezePackageModal;
