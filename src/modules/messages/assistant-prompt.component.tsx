import { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Button,
  CircularProgress,
  IconButton,
  TextField,
} from '@mui/material';
import {
  ArrowBackRounded,
  CheckCircleRounded,
  Close,
  LockClockRounded,
  SmartToyRounded,
} from '@mui/icons-material';
import { useQueryClient } from '@tanstack/react-query';

import { useChatPrompt, type PromptParams } from '../../hooks/useChatPrompt';
import {
  useChatConversationActions,
  type ChatConversationActions,
  type ChatPackage,
  type ChatUpcomingSession,
} from '../../hooks/useChatAction';
import {
  MAX_MOVE_OPTIONS,
  STUDENT_CANCEL_REASONS,
  TUTOR_CANCEL_REASONS,
  changeErrorMessage,
  useCancelSession,
  useMoveOptions,
  useProposeMove,
  type CancelReason,
  type MoveOption,
  type TimeWindow,
} from '../../hooks/useSessionChanges';
import {
  FREEZE_REASONS,
  useCreateFreeze,
  useFreezeOptions,
  type FreezeReason,
  type WeeklyEntry,
} from '../../hooks/useFreezes';
import {
  MAX_WEEKLY_ENTRIES,
  useProposeScheduleChange,
  useWeeklyOpenings,
  weeklyEntryLabel,
  weeklyHoursOf,
  weeklyPatternLabel,
  type WeeklyOpening,
} from '../../hooks/useScheduleChanges';
import { queryKeys } from '../../lib/queryKeys';
import {
  addDays,
  dayOf,
  formatDate,
  formatSlot,
  formatTime,
  localTimeZone,
  today,
} from '../trial/trial.types';

const NOTE_LENGTH = 500;
const DURATIONS = [30, 60, 90, 120];
const WEEKS = [1, 2, 3, 4];
/** The first day new weekly times can apply (ScheduleChangeRequest::MIN_LEAD) */
const MIN_LEAD_DAYS = 2;
/** How long the done line stays before the bubble goes */
const DONE_MS = 1800;

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------

const Question: FC<{ children: ReactNode }> = ({ children }) => (
  <p className="assistant-prompt__question">{children}</p>
);

interface ChipProps {
  selected?: boolean;
  disabled?: boolean;
  danger?: boolean;
  onClick: () => void;
  children: ReactNode;
  title?: string;
}

const Chip: FC<ChipProps> = ({
  selected,
  disabled,
  danger,
  onClick,
  children,
  title,
}) => (
  <button
    type="button"
    className={`assistant-prompt__chip${selected ? ' is-selected' : ''}${danger ? ' is-danger' : ''}`}
    aria-pressed={selected}
    disabled={disabled}
    title={title}
    onClick={onClick}
  >
    {children}
  </button>
);

const Chips: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="assistant-prompt__chips">{children}</div>
);

/** An answered step, folded into a pill that reopens it (unless there was no choice) */
const Answer: FC<{
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}> = ({ onClick, disabled, children }) => (
  <button
    type="button"
    className="assistant-prompt__answer"
    disabled={disabled}
    onClick={onClick}
  >
    <CheckCircleRounded aria-hidden="true" />
    {children}
  </button>
);

interface NoteFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const NoteField: FC<NoteFieldProps> = ({ value, onChange }) => {
  const { t } = useTranslation();
  return (
    <TextField
      className="assistant-prompt__note"
      size="small"
      fullWidth
      multiline
      minRows={1}
      maxRows={3}
      placeholder={t('SESSION_CHANGES.CHAT.PROMPT.NOTE')}
      value={value}
      onChange={(event) => onChange(event.target.value.slice(0, NOTE_LENGTH))}
      inputProps={{ maxLength: NOTE_LENGTH, dir: 'auto' }}
    />
  );
};

interface SubmitRowProps {
  label: string;
  onSubmit: () => void;
  pending: boolean;
  disabled?: boolean;
  danger?: boolean;
  onBack?: () => void;
}

const SubmitRow: FC<SubmitRowProps> = ({
  label,
  onSubmit,
  pending,
  disabled,
  danger,
  onBack,
}) => {
  const { t } = useTranslation();
  return (
    <div className="assistant-prompt__submit">
      <Button
        size="small"
        variant="contained"
        color={danger ? 'error' : 'primary'}
        disabled={disabled || pending}
        startIcon={
          pending ? <CircularProgress size={16} color="inherit" /> : undefined
        }
        onClick={onSubmit}
      >
        {label}
      </Button>
      {onBack && (
        <Button
          size="small"
          variant="text"
          disabled={pending}
          startIcon={
            <ArrowBackRounded className="assistant-prompt__back-icon" />
          }
          onClick={onBack}
        >
          {t('SESSION_CHANGES.CHAT.PROMPT.BACK')}
        </Button>
      )}
    </div>
  );
};

/** The first allowed day and the six after it, as "Wed 11 Nov" chips */
const dayChips = (first: string) =>
  Array.from({ length: 7 }, (_, index) => addDays(first, index));

interface FlowProps {
  data: ChatConversationActions;
  params: PromptParams;
  locale: string;
  onDone: (message: string) => void;
}

// ---------------------------------------------------------------------------
// Can't make a lesson: which one, move or cancel, then the details
// ---------------------------------------------------------------------------

const ChangeFlow: FC<FlowProps> = ({ data, params, locale, onDone }) => {
  const { t } = useTranslation();
  const eligible = useMemo(
    () =>
      data.upcoming_sessions.filter((s) => s.can_cancel || s.can_propose_move),
    [data.upcoming_sessions],
  );
  const [lessonId, setLessonId] = useState<number | undefined>(
    () =>
      params.session_id ?? (eligible.length === 1 ? eligible[0].id : undefined),
  );
  const [what, setWhat] = useState<'cancel' | 'move' | undefined>(params.what);

  const lesson = eligible.find((s) => s.id === lessonId);
  const allowed = (s: ChatUpcomingSession) =>
    [
      s.can_propose_move ? ('move' as const) : null,
      s.can_cancel ? ('cancel' as const) : null,
    ].filter((x): x is 'move' | 'cancel' => x !== null);
  const choices = lesson ? allowed(lesson) : [];
  const step = !lesson
    ? 'lesson'
    : (what ?? (choices.length === 1 ? choices[0] : undefined));

  if (eligible.length === 0) {
    return (
      <Alert severity="info" className="assistant-prompt__alert">
        {t('SESSION_CHANGES.CHAT.PROMPT.NOTHING')}
      </Alert>
    );
  }

  return (
    <>
      {lesson && (
        <Answer
          disabled={eligible.length === 1}
          onClick={() => {
            setLessonId(undefined);
            setWhat(params.what);
          }}
        >
          {formatSlot(lesson.start_time, locale)}
        </Answer>
      )}
      {lesson && step && choices.length > 1 && (
        <Answer onClick={() => setWhat(undefined)}>
          {t(
            step === 'move'
              ? 'SESSION_CHANGES.CHAT.PROMPT.MOVE_IT'
              : 'SESSION_CHANGES.CHAT.PROMPT.CANCEL_IT',
          )}
        </Answer>
      )}

      {step === 'lesson' && (
        <>
          <Question>{t('SESSION_CHANGES.CHAT.PROMPT.WHICH_LESSON')}</Question>
          <Chips>
            {eligible.map((s) => (
              <Chip key={s.id} onClick={() => setLessonId(s.id)}>
                {formatSlot(s.start_time, locale)}
              </Chip>
            ))}
          </Chips>
        </>
      )}

      {lesson && !step && (
        <>
          <Question>{t('SESSION_CHANGES.CHAT.PROMPT.WHAT')}</Question>
          <Chips>
            {choices.map((choice) => (
              <Chip key={choice} onClick={() => setWhat(choice)}>
                {t(
                  choice === 'move'
                    ? 'SESSION_CHANGES.CHAT.PROMPT.MOVE_IT'
                    : 'SESSION_CHANGES.CHAT.PROMPT.CANCEL_IT',
                )}
              </Chip>
            ))}
          </Chips>
        </>
      )}

      {lesson && step === 'cancel' && (
        <CancelStep
          lesson={lesson}
          isTutor={data.viewer_role === 'tutor'}
          onDone={onDone}
        />
      )}
      {lesson && step === 'move' && (
        <MoveStep lesson={lesson} locale={locale} onDone={onDone} />
      )}
    </>
  );
};

interface CancelStepProps {
  lesson: ChatUpcomingSession;
  isTutor: boolean;
  onDone: (message: string) => void;
}

const CancelStep: FC<CancelStepProps> = ({ lesson, isTutor, onDone }) => {
  const { t } = useTranslation();
  const cancel = useCancelSession();
  const reasons = isTutor ? TUTOR_CANCEL_REASONS : STUDENT_CANCEL_REASONS;
  const [reason, setReason] = useState<CancelReason | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!reason) return;
    setError(null);
    try {
      await cancel.mutateAsync({ sessionId: lesson.id, reason, note });
      onDone(t('SESSION_CHANGES.CHAT.PROMPT.DONE_CANCEL'));
    } catch (err) {
      setError(changeErrorMessage(err, t('SESSION_CHANGES.CANCEL.ERROR')));
    }
  };

  return (
    <>
      <Question>{t('SESSION_CHANGES.CHAT.PROMPT.WHY')}</Question>
      <Chips>
        {reasons.map((key) => (
          <Chip
            key={key}
            selected={reason === key}
            onClick={() => setReason(key)}
          >
            {t(`SESSION_CHANGES.REASONS.${key.toUpperCase()}`)}
          </Chip>
        ))}
      </Chips>
      <NoteField value={note} onChange={setNote} />
      {error && <Alert severity="error">{error}</Alert>}
      <SubmitRow
        label={t('SESSION_CHANGES.CHAT.PROMPT.SEND_CANCEL')}
        onSubmit={submit}
        pending={cancel.isPending}
        disabled={!reason}
        danger
      />
    </>
  );
};

interface MoveStepProps {
  lesson: ChatUpcomingSession;
  locale: string;
  onDone: (message: string) => void;
}

const MoveStep: FC<MoveStepProps> = ({ lesson, locale, onDone }) => {
  const { t } = useTranslation();
  const options = useMoveOptions(lesson.id);
  const propose = useProposeMove();
  const [dayChoice, setDayChoice] = useState<string | undefined>();
  const [picked, setPicked] = useState<TimeWindow[]>([]);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const days = useMemo(() => {
    const map = new Map<string, MoveOption[]>();
    (options.data ?? []).forEach((item) => {
      const key = dayOf(item.start_time);
      map.set(key, [...(map.get(key) ?? []), item]);
    });
    return Array.from(map.entries());
  }, [options.data]);
  const day = dayChoice ?? days[0]?.[0];
  const times = days.find(([key]) => key === day)?.[1] ?? [];
  const isPicked = (start: string) =>
    picked.some((item) => item.start_time === start);
  const toggle = (item: MoveOption) => {
    setError(null);
    if (isPicked(item.start_time)) {
      setPicked(picked.filter((p) => p.start_time !== item.start_time));
    } else if (picked.length < MAX_MOVE_OPTIONS) {
      setPicked(
        [
          ...picked,
          { start_time: item.start_time, end_time: item.end_time },
        ].sort((a, b) => a.start_time.localeCompare(b.start_time)),
      );
    }
  };

  const submit = async () => {
    setError(null);
    try {
      await propose.mutateAsync({
        sessionId: lesson.id,
        options: picked,
        note,
      });
      onDone(t('SESSION_CHANGES.CHAT.PROMPT.DONE_MOVE'));
    } catch (err) {
      setError(changeErrorMessage(err, t('SESSION_CHANGES.MOVE.ERROR')));
    }
  };

  if (options.isLoading) return <CircularProgress size={22} />;
  if (options.isError) {
    return (
      <Alert severity="error">{t('SESSION_CHANGES.MOVE.ERROR_LOADING')}</Alert>
    );
  }
  if (days.length === 0) {
    return <Alert severity="info">{t('SESSION_CHANGES.MOVE.NO_TIMES')}</Alert>;
  }

  return (
    <>
      <Question>{t('SESSION_CHANGES.CHAT.PROMPT.PICK_DAY')}</Question>
      <Chips>
        {days.map(([key, list]) => {
          const pickedHere = list.filter((o) => isPicked(o.start_time)).length;
          return (
            <Chip
              key={key}
              selected={key === day}
              onClick={() => setDayChoice(key)}
            >
              {formatDate(key, locale)}
              {pickedHere > 0 && (
                <span className="assistant-prompt__count">{pickedHere}</span>
              )}
            </Chip>
          );
        })}
      </Chips>
      <Question>
        {t('SESSION_CHANGES.CHAT.PROMPT.PICK_TIMES', { max: MAX_MOVE_OPTIONS })}
      </Question>
      <Chips>
        {times.map((item) => {
          const selected = isPicked(item.start_time);
          return (
            <Chip
              key={item.start_time}
              selected={selected}
              disabled={!selected && picked.length >= MAX_MOVE_OPTIONS}
              onClick={() => toggle(item)}
              title={
                item.held_for_you
                  ? t('SESSION_CHANGES.MOVE.HELD_FOR_YOU')
                  : undefined
              }
            >
              {formatTime(item.start_time, locale)}
              {item.held_for_you && (
                <LockClockRounded className="assistant-prompt__held" />
              )}
            </Chip>
          );
        })}
      </Chips>
      {picked.length > 0 && (
        <div className="assistant-prompt__picked">
          <span>
            {t('SESSION_CHANGES.CHAT.PROMPT.PICKED', {
              count: picked.length,
              max: MAX_MOVE_OPTIONS,
            })}
          </span>
          {picked.map((item) => (
            <button
              key={item.start_time}
              type="button"
              className="assistant-prompt__pill"
              aria-label={t('SESSION_CHANGES.MOVE.REMOVE')}
              onClick={() =>
                setPicked(
                  picked.filter((p) => p.start_time !== item.start_time),
                )
              }
            >
              {formatSlot(item.start_time, locale)}
              <Close aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
      <NoteField value={note} onChange={setNote} />
      {error && <Alert severity="error">{error}</Alert>}
      <SubmitRow
        label={t('SESSION_CHANGES.CHAT.PROMPT.SEND_MOVE')}
        onSubmit={submit}
        pending={propose.isPending}
        disabled={picked.length === 0}
      />
    </>
  );
};

// ---------------------------------------------------------------------------
// Pause the lessons: from when, for how long, why
// ---------------------------------------------------------------------------

interface PackageFlowProps extends FlowProps {
  pkg: ChatPackage;
}

const PauseFlow: FC<PackageFlowProps> = ({ pkg, locale, onDone }) => {
  const { t } = useTranslation();
  const limits = useFreezeOptions(pkg.id, {});
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
  );
  const minutes = (count: number) =>
    t('MYSESSIONS.MAIN.CARD.MINUTES_COUNT', { count });

  const submit = async () => {
    if (!startsOn || !endsOn || !reason) return;
    setError(null);
    try {
      await create.mutateAsync({
        packageId: pkg.id,
        starts_on: startsOn,
        ends_on: endsOn,
        reason,
        note,
      });
      onDone(t('SESSION_CHANGES.CHAT.PROMPT.DONE_PAUSE'));
    } catch (err) {
      setError(changeErrorMessage(err, t('SESSION_CHANGES.FREEZE.ERROR')));
    }
  };

  if (limits.isLoading || !limits.data) return <CircularProgress size={22} />;
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
              inputProps={{ min: earliest }}
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

// ---------------------------------------------------------------------------
// Change the weekly times: lesson length, the times, from when
// ---------------------------------------------------------------------------

const sameEntry = (a: WeeklyEntry, b: WeeklyEntry) =>
  a.wday === b.wday &&
  a.minute_of_day === b.minute_of_day &&
  a.duration_minutes === b.duration_minutes;

const WeeklyFlow: FC<PackageFlowProps> = ({ pkg, locale, onDone }) => {
  const { t } = useTranslation();
  const propose = useProposeScheduleChange();
  const [duration, setDuration] = useState(60);
  const [picked, setPicked] = useState<WeeklyEntry[]>([]);
  const [timesDone, setTimesDone] = useState(false);
  const [effectiveFrom, setEffectiveFrom] = useState<string | undefined>();
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const openings = useWeeklyOpenings(pkg.tutor.id, duration);

  const byDay = useMemo(() => {
    const map = new Map<number, WeeklyOpening[]>();
    (openings.data ?? [])
      .slice()
      .sort((a, b) => a.wday - b.wday || a.minute_of_day - b.minute_of_day)
      .forEach((item) =>
        map.set(item.wday, [...(map.get(item.wday) ?? []), item]),
      );
    return Array.from(map.entries());
  }, [openings.data]);
  const isPicked = (entry: WeeklyEntry) =>
    picked.some((p) => sameEntry(p, entry));
  const toggle = (entry: WeeklyEntry) => {
    setError(null);
    if (isPicked(entry)) setPicked(picked.filter((p) => !sameEntry(p, entry)));
    else if (picked.length < MAX_WEEKLY_ENTRIES) setPicked([...picked, entry]);
  };
  const dayName = (wday: number) =>
    weeklyEntryLabel(
      { wday, minute_of_day: 0, duration_minutes: 30 },
      locale,
      true,
    ).split(' ')[0];
  const timeOnly = (entry: WeeklyEntry) =>
    weeklyEntryLabel(entry, locale).split(' ').slice(1).join(' ');

  const submit = async () => {
    if (!effectiveFrom) return;
    setError(null);
    try {
      await propose.mutateAsync({
        packageId: pkg.id,
        pattern: picked,
        effective_from: effectiveFrom,
        time_zone: localTimeZone(),
        note,
      });
      onDone(t('SESSION_CHANGES.CHAT.PROMPT.DONE_WEEKLY'));
    } catch (err) {
      setError(changeErrorMessage(err, t('SESSION_CHANGES.WEEKLY.ERROR')));
    }
  };

  const earliest = addDays(today(), MIN_LEAD_DAYS);

  return (
    <>
      {timesDone && (
        <Answer onClick={() => setTimesDone(false)}>
          {weeklyPatternLabel(picked, locale, (count) =>
            t('MYSESSIONS.MAIN.CARD.MINUTES_COUNT', { count }),
          )}
        </Answer>
      )}

      {!timesDone && (
        <>
          <Question>{t('SESSION_CHANGES.CHAT.PROMPT.LESSON_LENGTH')}</Question>
          <Chips>
            {DURATIONS.map((value) => (
              <Chip
                key={value}
                selected={duration === value}
                onClick={() => {
                  setDuration(value);
                  setPicked([]);
                }}
              >
                {t('MYSESSIONS.MAIN.CARD.MINUTES_COUNT', { count: value })}
              </Chip>
            ))}
          </Chips>
          <Question>
            {t('SESSION_CHANGES.CHAT.PROMPT.PICK_WEEKLY', {
              max: MAX_WEEKLY_ENTRIES,
            })}
          </Question>
          {openings.isLoading && <CircularProgress size={22} />}
          {openings.isError && (
            <Alert severity="error">
              {t('SESSION_CHANGES.WEEKLY.ERROR_LOADING')}
            </Alert>
          )}
          {openings.data && openings.data.length === 0 && (
            <Alert severity="info">
              {t('SESSION_CHANGES.WEEKLY.NO_TIMES')}
            </Alert>
          )}
          {byDay.map(([wday, list]) => (
            <div key={wday} className="assistant-prompt__day">
              <span className="assistant-prompt__day-name">
                {dayName(wday)}
              </span>
              <Chips>
                {list.map((item) => {
                  const selected = isPicked(item);
                  return (
                    <Chip
                      key={item.minute_of_day}
                      selected={selected}
                      disabled={
                        !selected && picked.length >= MAX_WEEKLY_ENTRIES
                      }
                      onClick={() => toggle(item)}
                      title={t('SESSION_CHANGES.WEEKLY.OPEN_WEEKS', {
                        open: item.open_weeks,
                        total: item.published_weeks,
                      })}
                    >
                      {timeOnly(item)}
                    </Chip>
                  );
                })}
              </Chips>
            </div>
          ))}
          {picked.length > 0 && (
            <p className="assistant-prompt__preview">
              {t('SESSION_CHANGES.WEEKLY.HOURS', {
                count: weeklyHoursOf(picked),
              })}
            </p>
          )}
          <SubmitRow
            label={t('SESSION_CHANGES.CHAT.PROMPT.NEXT')}
            onSubmit={() => setTimesDone(true)}
            pending={false}
            disabled={picked.length === 0}
          />
        </>
      )}

      {timesDone && (
        <>
          <Question>{t('SESSION_CHANGES.CHAT.PROMPT.FROM_WHEN')}</Question>
          <Chips>
            {dayChips(earliest).map((day) => (
              <Chip
                key={day}
                selected={effectiveFrom === day}
                onClick={() => setEffectiveFrom(day)}
              >
                {formatDate(day, locale)}
              </Chip>
            ))}
          </Chips>
          <NoteField value={note} onChange={setNote} />
          {error && <Alert severity="error">{error}</Alert>}
          <SubmitRow
            label={t('SESSION_CHANGES.CHAT.PROMPT.SEND_WEEKLY')}
            onSubmit={submit}
            pending={propose.isPending}
            disabled={!effectiveFrom}
          />
        </>
      )}
    </>
  );
};

// ---------------------------------------------------------------------------
// The bubble
// ---------------------------------------------------------------------------

interface AssistantPromptProps {
  channelId: string;
}

/**
 * The assistant's local bubble above the composer: a step-by-step flow
 * for the viewer only (nothing is posted until the last tap). On success
 * it says so briefly and goes; the bot's real notice then arrives.
 */
const AssistantPrompt: FC<AssistantPromptProps> = ({ channelId }) => {
  const { t, i18n } = useTranslation();
  const locale = `${i18n.language}-u-nu-latn`;
  const prompt = useChatPrompt();
  const queryClient = useQueryClient();
  const actions = useChatConversationActions(channelId);
  const [done, setDone] = useState<string | null>(null);

  const request = prompt?.prompt ?? null;
  const key = request?.key;
  useEffect(() => setDone(null), [key]);
  useEffect(() => {
    if (!done || !prompt) return undefined;
    const timer = window.setTimeout(prompt.close, DONE_MS);
    return () => window.clearTimeout(timer);
  }, [done, prompt]);

  if (!prompt || !request) return null;

  const onDone = (message: string) => {
    setDone(message);
    queryClient.invalidateQueries({
      queryKey: queryKeys.chat.actions(channelId),
    });
  };
  const data = actions.data;
  const pkg = data?.package ?? null;
  const packageMissing =
    request.flow !== 'change' &&
    (!pkg ||
      (request.params.package_id && request.params.package_id !== pkg.id));

  return (
    <section className="assistant-prompt" aria-live="polite">
      <header className="assistant-prompt__header">
        <SmartToyRounded aria-hidden="true" />
        <span>{t('MESSAGES.ASSISTANT')}</span>
        <IconButton
          size="small"
          className="assistant-prompt__close"
          aria-label={t('SESSION_CHANGES.CHAT.PROMPT.CLOSE')}
          onClick={prompt.close}
        >
          <Close fontSize="small" />
        </IconButton>
      </header>
      <div className="assistant-prompt__body" key={request.key}>
        {done ? (
          <p className="assistant-prompt__done">
            <CheckCircleRounded aria-hidden="true" />
            {done}
          </p>
        ) : !data ? (
          <CircularProgress size={22} />
        ) : request.flow === 'change' ? (
          <ChangeFlow
            data={data}
            params={request.params}
            locale={locale}
            onDone={onDone}
          />
        ) : packageMissing || !pkg ? (
          <Alert severity="info" className="assistant-prompt__alert">
            {t('SESSION_CHANGES.CHAT.PROMPT.NOTHING')}
          </Alert>
        ) : request.flow === 'pause' ? (
          <PauseFlow
            data={data}
            pkg={pkg}
            params={request.params}
            locale={locale}
            onDone={onDone}
          />
        ) : (
          <WeeklyFlow
            data={data}
            pkg={pkg}
            params={request.params}
            locale={locale}
            onDone={onDone}
          />
        )}
      </div>
    </section>
  );
};

export default AssistantPrompt;
