import { differenceInCalendarDays, formatDistanceToNowStrict } from 'date-fns';
import { arSA } from 'date-fns/locale/ar-SA';
import { enUS } from 'date-fns/locale/en-US';

import { isOverdue, type Assignment } from '../../hooks/useAssignments';

const DATE_FNS_LOCALES = { ar: arSA, en: enUS } as const;

/** The date-fns locale for the active language (Latin digits either way) */
export const dateFnsLocale = (language: string) =>
  DATE_FNS_LOCALES[language as keyof typeof DATE_FNS_LOCALES] ?? enUS;

export const fullName = (user: { first_name: string; last_name: string }) =>
  `${user.first_name} ${user.last_name}`.trim();

/** Absolute date + time, e.g. "Mon, 3 Nov, 6:00 PM", Latin digits in Arabic */
export const formatDateTime = (iso: string, language: string) =>
  new Date(iso).toLocaleString(`${language}-u-nu-latn`, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });

/**
 * Relative distance to now, e.g. "in 3 days" / "2 hours ago". Rounded down
 * so it agrees with the "Due in X days" chip (7 days 16 hours is "7 days").
 */
export const formatRelative = (iso: string, language: string) =>
  formatDistanceToNowStrict(new Date(iso), {
    addSuffix: true,
    roundingMethod: 'floor',
    locale: dateFnsLocale(language),
  });

export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export type StatusTone = 'sky' | 'mint' | 'sun' | 'lilac' | 'coral';

export interface StatusChip {
  /** Translation key under HOMEWORK.STATUS */
  key: string;
  /** Interpolation values for the key, if any */
  values?: Record<string, number>;
  tone: StatusTone;
}

/**
 * What the status chip says for the given viewer. Students get the
 * friendlier "Due in X days" / "Feedback ready" wording.
 */
export const statusChip = (
  assignment: Assignment,
  viewer: 'tutor' | 'student',
  now = new Date(),
): StatusChip => {
  if (assignment.status === 'reviewed') {
    return viewer === 'student'
      ? { key: 'FEEDBACK_READY', tone: 'lilac' }
      : { key: 'REVIEWED', tone: 'lilac' };
  }
  if (assignment.status === 'submitted') {
    return viewer === 'student'
      ? { key: 'SUBMITTED', tone: 'mint' }
      : { key: 'TO_REVIEW', tone: 'mint' };
  }
  if (isOverdue(assignment, now)) return { key: 'OVERDUE', tone: 'coral' };

  const days = differenceInCalendarDays(new Date(assignment.due_at), now);
  if (days <= 0) return { key: 'DUE_TODAY', tone: 'sun' };
  return { key: 'DUE_IN_DAYS', values: { count: days }, tone: 'sky' };
};
