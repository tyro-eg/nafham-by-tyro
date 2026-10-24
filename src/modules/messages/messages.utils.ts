import { isSameDay, isSameYear, isThisWeek, subDays } from 'date-fns';

type T = (key: string, opts?: Record<string, unknown>) => string;

/**
 * Time label for a conversation row: the clock time today, "Yesterday",
 * the weekday within the week, otherwise a short date.
 */
export const formatConversationTime = (
  date: Date,
  language: string,
  t: T,
): string => {
  const now = new Date();
  const locale = language.startsWith('ar') ? 'ar-EG-u-nu-latn' : 'en-GB';
  if (isSameDay(date, now)) {
    return date.toLocaleTimeString(locale, {
      hour: 'numeric',
      minute: '2-digit',
    });
  }
  if (isSameDay(date, subDays(now, 1))) {
    return t('MESSAGES.YESTERDAY');
  }
  if (isThisWeek(date, { weekStartsOn: 6 })) {
    return date.toLocaleDateString(locale, { weekday: 'short' });
  }
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: isSameYear(date, now) ? undefined : 'numeric',
  });
};
