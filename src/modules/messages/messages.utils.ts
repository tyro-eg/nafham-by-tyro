import { isSameDay, isSameWeek, isSameYear, subDays } from 'date-fns';

type T = (key: string, opts?: Record<string, unknown>) => string;

/** Western digits in Arabic too, as on the rest of the site */
export const localeOf = (language: string): string =>
  language.startsWith('ar') ? 'ar-EG-u-nu-latn' : 'en-GB';

/** A message's clock time, "14:05" */
export const clockTime = (
  date: Date | string | undefined,
  language: string,
): string =>
  date
    ? new Date(date).toLocaleTimeString(localeOf(language), {
        hour: 'numeric',
        minute: '2-digit',
      })
    : '';

/**
 * Day pill between messages: "Today", "Yesterday", the weekday within
 * the week, otherwise a date (with the year when it is not this year).
 */
export const dayLabel = (
  date: Date,
  language: string,
  t: T,
  now: Date = new Date(),
): string => {
  const locale = localeOf(language);
  if (isSameDay(date, now)) return t('MESSAGES.TODAY');
  if (isSameDay(date, subDays(now, 1))) return t('MESSAGES.YESTERDAY');
  if (isSameWeek(date, now, { weekStartsOn: 6 }) && date <= now) {
    return date.toLocaleDateString(locale, { weekday: 'long' });
  }
  return date.toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: isSameYear(date, now) ? undefined : 'numeric',
  });
};

/**
 * Time label for a conversation row: the clock time today, "Yesterday",
 * the weekday within the week, otherwise a short date.
 */
export const formatConversationTime = (
  date: Date,
  language: string,
  t: T,
  now: Date = new Date(),
): string => {
  const locale = localeOf(language);
  if (isSameDay(date, now)) {
    return date.toLocaleTimeString(locale, {
      hour: 'numeric',
      minute: '2-digit',
    });
  }
  if (isSameDay(date, subDays(now, 1))) {
    return t('MESSAGES.YESTERDAY');
  }
  if (isSameWeek(date, now, { weekStartsOn: 6 })) {
    return date.toLocaleDateString(locale, { weekday: 'short' });
  }
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: isSameYear(date, now) ? undefined : 'numeric',
  });
};

const ARABIC = /[؀-ۿ]/g;
const LATIN = /[A-Za-z]/g;

const isArabicParagraph = (paragraph: string): boolean =>
  (paragraph.match(ARABIC)?.length ?? 0) >
  (paragraph.match(LATIN)?.length ?? 0);

/**
 * Nafham's own messages (notices, the welcome, the assistant) carry the
 * English and the Arabic text one after the other. Keep the paragraphs in
 * the reader's language; text in one language only is left as it is.
 */
export const textInLanguage = (text: string, language: string): string => {
  const paragraphs = text.split(/\n\s*\n/);
  const arabic = paragraphs.filter(isArabicParagraph);
  if (arabic.length === 0 || arabic.length === paragraphs.length) return text;
  const wanted = language.startsWith('ar')
    ? arabic
    : paragraphs.filter((p) => !isArabicParagraph(p));
  return wanted.join('\n\n');
};

export type ListFilter = 'all' | 'unread' | 'nafham';

/** What the list filter needs to know about a conversation */
export interface ListRow {
  unread: number;
  support: boolean;
  /** Names and subject the search box matches */
  searchable: ReadonlyArray<string | undefined>;
}

/** Whether a conversation passes the pill filter and the search box */
export const matchesListFilter = (
  row: ListRow,
  filter: ListFilter,
  query: string,
): boolean => {
  if (filter === 'unread' && row.unread === 0) return false;
  if (filter === 'nafham' && !row.support) return false;
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return row.searchable.some((value) => value?.toLowerCase().includes(q));
};

/** "Sara is typing…" for one person, a general line for several */
export const typingLabelOf = (
  names: ReadonlyArray<string | undefined>,
  t: T,
): string => {
  if (names.length === 0) return '';
  if (names.length > 1) return t('MESSAGES.TYPING_MANY');
  return t('MESSAGES.TYPING_ONE', { name: names[0]?.split(' ')[0] ?? '' });
};
