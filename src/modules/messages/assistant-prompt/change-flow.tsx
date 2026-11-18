import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, CircularProgress } from '@mui/material';
import { Close, LockClockRounded } from '@mui/icons-material';

import type { ChatUpcomingSession } from '../../../hooks/useChatAction';
import {
  MAX_MOVE_OPTIONS,
  STUDENT_CANCEL_REASONS,
  TUTOR_CANCEL_REASONS,
  changeErrorMessage,
  useCancelSession,
  useMoveOptions,
  useProposeMove,
  type CancelReason,
  type ChangeHeaders,
  type MoveOption,
  type TimeWindow,
} from '../../../hooks/useSessionChanges';
import {
  dayOf,
  formatDate,
  formatSlot,
  formatTime,
} from '../../trial/trial.types';
import {
  Answer,
  Chip,
  Chips,
  NoteField,
  Question,
  SubmitRow,
  type FlowProps,
} from './primitives';

/**
 * Can't make a lesson: which one, move or cancel, then the details (a
 * reason for a cancel, up to three new times for a move).
 */
const ChangeFlow: FC<FlowProps> = ({
  data,
  params,
  locale,
  headers,
  onDone,
  onRefused,
}) => {
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
  // A preset answer the lesson no longer allows is dropped, not sent
  const wanted = what && choices.includes(what) ? what : undefined;
  const step = !lesson
    ? 'lesson'
    : (wanted ?? (choices.length === 1 ? choices[0] : undefined));

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
          headers={headers}
          onDone={onDone}
          onRefused={onRefused}
        />
      )}
      {lesson && step === 'move' && (
        <MoveStep
          lesson={lesson}
          locale={locale}
          headers={headers}
          onDone={onDone}
          onRefused={onRefused}
        />
      )}
    </>
  );
};

interface StepProps {
  lesson: ChatUpcomingSession;
  headers?: ChangeHeaders;
  onDone: (message: string) => void;
  onRefused: () => void;
}

const CancelStep: FC<StepProps & { isTutor: boolean }> = ({
  lesson,
  isTutor,
  headers,
  onDone,
  onRefused,
}) => {
  const { t } = useTranslation();
  const cancel = useCancelSession();
  const reasons = isTutor ? TUTOR_CANCEL_REASONS : STUDENT_CANCEL_REASONS;
  const [reason, setReason] = useState<CancelReason | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!reason || cancel.isPending) return;
    setError(null);
    try {
      await cancel.mutateAsync({
        sessionId: lesson.id,
        reason,
        note,
        headers,
      });
      onDone(t('SESSION_CHANGES.CHAT.PROMPT.DONE_CANCEL'));
    } catch (err) {
      setError(changeErrorMessage(err, t('SESSION_CHANGES.CANCEL.ERROR')));
      onRefused();
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

const MoveStep: FC<StepProps & { locale: string }> = ({
  lesson,
  locale,
  headers,
  onDone,
  onRefused,
}) => {
  const { t } = useTranslation();
  const options = useMoveOptions(lesson.id, true, headers);
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
  const unpick = (start: string) =>
    setPicked(picked.filter((p) => p.start_time !== start));
  const toggle = (item: MoveOption) => {
    setError(null);
    if (isPicked(item.start_time)) {
      unpick(item.start_time);
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
    if (!picked.length || propose.isPending) return;
    setError(null);
    try {
      await propose.mutateAsync({
        sessionId: lesson.id,
        options: picked,
        note,
        headers,
      });
      onDone(t('SESSION_CHANGES.CHAT.PROMPT.DONE_MOVE'));
    } catch (err) {
      setError(changeErrorMessage(err, t('SESSION_CHANGES.MOVE.ERROR')));
      onRefused();
      options.refetch();
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
          {picked.map((item) => {
            const label = formatSlot(item.start_time, locale);
            return (
              <button
                key={item.start_time}
                type="button"
                className="assistant-prompt__pill"
                aria-label={`${t('SESSION_CHANGES.MOVE.REMOVE')}: ${label}`}
                onClick={() => unpick(item.start_time)}
              >
                {label}
                <Close aria-hidden="true" />
              </button>
            );
          })}
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

export default ChangeFlow;
