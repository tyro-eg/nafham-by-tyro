import { useCallback, useEffect, useRef, useState } from 'react';
import {
  GENERATING_POLL_MS,
  GENERATING_TIMEOUT_MS,
  type CoachStudentRow,
} from '../../hooks/useCoach';

export type AssistantTab = 'insights' | 'plan' | 'homework' | 'coach';
export const TABS: AssistantTab[] = ['insights', 'plan', 'homework', 'coach'];

export const isTab = (value: string | null): value is AssistantTab =>
  TABS.includes(value as AssistantTab);

export const fullName = (user: { first_name: string; last_name: string }) =>
  `${user.first_name} ${user.last_name}`.trim();

export const subjectName = (course?: string) =>
  (course ?? '').split(' - ').pop()?.trim() || course || '';

export const formatDate = (iso: string | null | undefined, language: string) =>
  iso
    ? new Date(iso).toLocaleDateString(`${language}-u-nu-latn`, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      })
    : '';

export const formatDateTime = (
  iso: string | null | undefined,
  language: string,
) =>
  iso
    ? new Date(iso).toLocaleString(`${language}-u-nu-latn`, {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '';

export const percent = (ratio: number | null | undefined) =>
  ratio == null ? '–' : `${Math.round(ratio * 100)}%`;

/** One list item per line, blank lines dropped */
export const linesToList = (text: string): string[] =>
  text
    .split('\n')
    .map((line) => line.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);

export const listToLines = (items: string[] | undefined): string =>
  (items ?? []).join('\n');

/** The row's key in the student list and the URL */
export const pairKey = (row: CoachStudentRow) =>
  `${row.student.id}-${row.grade_subject.id}`;

/**
 * Polling state for "generate" / "refresh" actions: the API answers 202 and
 * the result lands later. `start(baseline)` remembers the current
 * `generated_at`; the owner polls while `active` and calls `settle(value)`
 * with each fresh `generated_at`, which stops the poll once it changed.
 * Gives up after GENERATING_TIMEOUT_MS.
 */
export const useGenerating = () => {
  const [active, setActive] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const baseline = useRef<string | null | undefined>(undefined);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setActive(false);
  }, []);

  const start = useCallback(
    (current: string | null | undefined) => {
      baseline.current = current ?? null;
      setTimedOut(false);
      setActive(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setTimedOut(true);
        stop();
      }, GENERATING_TIMEOUT_MS);
    },
    [stop],
  );

  const settle = useCallback(
    (current: string | null | undefined) => {
      if (!active) return;
      if ((current ?? null) !== baseline.current) stop();
    },
    [active, stop],
  );

  useEffect(() => () => stop(), [stop]);

  return {
    active,
    timedOut,
    start,
    stop,
    settle,
    interval: active ? GENERATING_POLL_MS : (false as const),
  };
};
