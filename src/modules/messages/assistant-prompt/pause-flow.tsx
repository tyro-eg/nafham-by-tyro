import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, CircularProgress, TextField } from '@mui/material';

import type { ChatPackage } from '../../../hooks/useChatAction';
import { changeErrorMessage } from '../../../hooks/useSessionChanges';
import {
  FREEZE_REASONS,
  useCreateFreeze,
  useFreezeOptions,
  type FreezeReason,
} from '../../../hooks/useFreezes';
import { weeklyPatternLabel } from '../../../hooks/useScheduleChanges';
import { addDays, formatDate, formatSlot } from '../../trial/trial.types';
import {
  Answer,
  Chip,
  Chips,
  NoteField,
  Question,
  SubmitRow,
  WEEKS,
  dayChips,
  type FlowProps,
} from './primitives';

export interface PackageFlowProps extends FlowProps {
  pkg: ChatPackage;
}

/** Pause the lessons: from when, for how long, why */
const PauseFlow: FC<PackageFlowProps> = ({
  pkg,
  locale,
  headers,
  onDone,
  onRefused,
}) => {
  const { t } = useTranslation();
  const limits = useFreezeOptions(pkg.id, {}, true, headers);
  const create = useCreateFreeze();
  const [startsOn, setStartsOn] = useState<string | undefined>();
  const [anotherDay, setAnotherDay] = useState(false);
  const [weeks, setWeeks] = useState<number | undefined>();
  const [reason, setReason] = useState<FreezeReason | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const minDays = limits.data?.min_days ?? 7;
  const maxDays = limits.data?.max_days ?? 28;
  const endsOn =
    startsOn && weeks ? addDays(startsOn, weeks * 7 - 1) : undefined;
  const preview = useFreezeOptions(
    pkg.id,
    { starts_on: startsOn, ends_on: endsOn },
    !!startsOn && !!endsOn,
    headers,
  );
  const minutes = (count: number) =>
    t('MYSESSIONS.MAIN.CARD.MINUTES_COUNT', { count });

  const submit = async () => {
    if (!startsOn || !endsOn || !reason || create.isPending) return;
    setError(null);
    try {
      await create.mutateAsync({
        packageId: pkg.id,
        starts_on: startsOn,
        ends_on: endsOn,
        reason,
        note,
        headers,
      });
      onDone(t('SESSION_CHANGES.CHAT.PROMPT.DONE_PAUSE'));
    } catch (err) {
      setError(changeErrorMessage(err, t('SESSION_CHANGES.FREEZE.ERROR')));
      onRefused();
    }
  };

  if (limits.isError) {
    return (
      <Alert severity="error">
        {changeErrorMessage(limits.error, t('SESSION_CHANGES.FREEZE.ERROR'))}
      </Alert>
    );
  }
  if (!limits.data) return <CircularProgress size={22} />;
  const earliest = limits.data.earliest_start;

  return (
    <>
      {startsOn && (
        <Answer
          onClick={() => {
            setStartsOn(undefined);
            setWeeks(undefined);
          }}
        >
          {t('SESSION_CHANGES.CHAT.PROMPT.FROM_DAY', {
            day: formatDate(startsOn, locale),
          })}
        </Answer>
      )}
      {startsOn && weeks && (
        <Answer onClick={() => setWeeks(undefined)}>
          {t('SESSION_CHANGES.CHAT.PROMPT.WEEKS', { count: weeks })}
        </Answer>
      )}

      {!startsOn && (
        <>
          <Question>{t('SESSION_CHANGES.CHAT.PROMPT.START')}</Question>
          <Chips>
            {dayChips(earliest).map((day) => (
              <Chip key={day} onClick={() => setStartsOn(day)}>
                {formatDate(day, locale)}
              </Chip>
            ))}
            <Chip selected={anotherDay} onClick={() => setAnotherDay(true)}>
              {t('SESSION_CHANGES.CHAT.PROMPT.ANOTHER_DAY')}
            </Chip>
          </Chips>
          {anotherDay && (
            <TextField
              size="small"
              type="date"
              className="assistant-prompt__date"
              inputProps={{
                min: earliest,
                'aria-label': t('SESSION_CHANGES.CHAT.PROMPT.ANOTHER_DAY'),
              }}
              onChange={(event) => {
                if (event.target.value >= earliest) {
                  setStartsOn(event.target.value);
                }
              }}
            />
          )}
        </>
      )}

      {startsOn && !weeks && (
        <>
          <Question>{t('SESSION_CHANGES.CHAT.PROMPT.LENGTH')}</Question>
          <Chips>
            {WEEKS.filter((w) => w * 7 >= minDays && w * 7 <= maxDays).map(
              (w) => (
                <Chip key={w} onClick={() => setWeeks(w)}>
                  {t('SESSION_CHANGES.CHAT.PROMPT.WEEKS', { count: w })}
                </Chip>
              ),
            )}
          </Chips>
        </>
      )}

      {startsOn && weeks && endsOn && (
        <>
          <p className="assistant-prompt__preview">
            {preview.isFetching && <CircularProgress size={14} />}
            {preview.data && (
              <>
                {t('SESSION_CHANGES.FREEZE.CANCELS', {
                  count: preview.data.lessons.length,
                })}
                {preview.data.lessons.length > 0 &&
                  ` ${preview.data.lessons
                    .map((l) => formatSlot(l.start_time, locale))
                    .join(' · ')}.`}
                {preview.data.weekly_pattern.length > 0 &&
                  ` ${t('SESSION_CHANGES.FREEZE.KEPT', {
                    times: weeklyPatternLabel(
                      preview.data.weekly_pattern,
                      locale,
                      minutes,
                    ),
                  })}`}
                {` ${t('SESSION_CHANGES.FREEZE.LENGTH', {
                  count: weeks * 7,
                  resume: addDays(endsOn, 1),
                })}`}
              </>
            )}
          </p>
          <Question>{t('SESSION_CHANGES.FREEZE.WHY')}</Question>
          <Chips>
            {FREEZE_REASONS.map((key) => (
              <Chip
                key={key}
                selected={reason === key}
                onClick={() => setReason(key)}
              >
                {t(`SESSION_CHANGES.FREEZE.REASONS.${key.toUpperCase()}`)}
              </Chip>
            ))}
          </Chips>
          <NoteField value={note} onChange={setNote} />
          {error && <Alert severity="error">{error}</Alert>}
          <SubmitRow
            label={t('SESSION_CHANGES.CHAT.PROMPT.SEND_PAUSE')}
            onSubmit={submit}
            pending={create.isPending}
            disabled={!reason}
          />
        </>
      )}
    </>
  );
};

export default PauseFlow;
