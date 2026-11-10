import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { isSameDay, isSameYear, isThisWeek, subDays } from 'date-fns';
import type {
  DateSeparatorProps,
  UnreadMessagesSeparatorProps,
} from 'stream-chat-react';

/**
 * Day label between messages: "Today", "Yesterday", the weekday within
 * the week, otherwise a date. The floating copy (pinned to the top while
 * scrolling) is the same pill, raised above the messages.
 */
export const DaySeparator: FC<DateSeparatorProps> = ({ date, floating }) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('ar') ? 'ar-EG-u-nu-latn' : 'en-GB';
  const now = new Date();

  let label: string;
  if (isSameDay(date, now)) label = t('MESSAGES.TODAY');
  else if (isSameDay(date, subDays(now, 1))) label = t('MESSAGES.YESTERDAY');
  else if (isThisWeek(date, { weekStartsOn: 6 }))
    label = date.toLocaleDateString(locale, { weekday: 'long' });
  else
    label = date.toLocaleDateString(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: isSameYear(date, now) ? undefined : 'numeric',
    });

  return (
    <div
      className={`nf-day${floating ? ' nf-day--floating' : ''}`}
      data-date={date.toISOString()}
      aria-hidden={floating ? 'true' : undefined}
    >
      <span className="nf-day__pill">{label}</span>
    </div>
  );
};

/** "New messages" rule above the first unread message. */
export const NewMessagesSeparator: FC<UnreadMessagesSeparatorProps> = () => {
  const { t } = useTranslation();
  return (
    <div className="nf-unread" role="separator">
      <span>{t('MESSAGES.NEW_MESSAGES')}</span>
    </div>
  );
};
