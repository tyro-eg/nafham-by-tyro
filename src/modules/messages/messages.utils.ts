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
