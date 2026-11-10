import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Avatar } from '@mui/material';
import {
  ArrowForwardRounded,
  CampaignRounded,
  DoneAllRounded,
  DoneRounded,
  ErrorOutlineRounded,
  ScheduleRounded,
  ShieldRounded,
  SmartToyRounded,
} from '@mui/icons-material';
import type { Channel, LocalMessage } from 'stream-chat';
import {
  Attachment,
  MessageActions,
  MessageReactions,
  MessageRepliesCountButton,
  MessageText,
  QuotedMessage,
  isDateSeparatorMessage,
  isMessageDeleted,
  isMessageEdited,
  isMessageErrorRetryable,
  messageHasReactions,
  useChannelStateContext,
  useMessageContext,
} from 'stream-chat-react';

import { initialsOf, isAdminUser } from '../../lib/streamChat';
import { assistantCardOf, isBotMessage } from '../../lib/chat-actions';
import { isAssistantMessage } from '../../lib/assistant';
import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import AssistantOptions from './assistant-options.component';
import { textInLanguage } from './messages.utils';
import BotActionRow from './bot-action-row.component';

type Role = 'student' | 'instructor' | 'support';

/** Announcements that point somewhere in the app, by template */
const PATH_LABELS: Record<string, string> = {
  move_proposed: 'SESSION_CHANGES.CHAT.ANSWER',
  schedule_change_proposed: 'SESSION_CHANGES.CHAT.ANSWER',
  freeze_created: 'SESSION_CHANGES.CHAT.PACKAGES',
  freeze_resumed: 'SESSION_CHANGES.CHAT.SESSIONS',
  freeze_cancelled: 'SESSION_CHANGES.CHAT.PACKAGES',
};

/** The button label for an announcement's path */
const pathLabelOf = (path: string, template: string): string =>
  path.startsWith('/messages/')
    ? 'SESSION_CHANGES.CHAT.OPEN_CHAT'
    : (PATH_LABELS[template] ??
      (path === '/requests'
        ? 'SESSION_CHANGES.CHAT.ANSWER'
        : path === '/my_packages'
          ? 'SESSION_CHANGES.CHAT.PACKAGES'
          : 'SESSION_CHANGES.CHAT.SESSIONS'));

/** Who sent a message in a lesson conversation, for the name line. */
const roleOf = (channel: Channel, userId?: string): Role | undefined => {
  if (!userId) return undefined;
  if (isAdminUser(userId)) return 'support';
  if (String(channel.data?.tutor_id ?? '') === userId) return 'instructor';
  if (String(channel.data?.student_id ?? '') === userId) return 'student';
  return undefined;
};

const clockTime = (date: Date | string | undefined, language: string) =>
  date
    ? new Date(date).toLocaleTimeString(
        language.startsWith('ar') ? 'ar-EG-u-nu-latn' : 'en-GB',
        { hour: 'numeric', minute: '2-digit' },
      )
    : '';

/**
 * One message, drawn by us rather than Stream's default UI so the thread
 * reads like a modern messenger: consecutive messages from one person
 * stack into a group, the avatar sits by the last bubble, the name (and
 * role) above the first, and the time and read ticks ride inside the
 * bubble. Nafham's announcements (the welcome and hours-left notes) are
 * centred cards rather than bubbles, with a button to where they point.
 * The Nafham Assistant (the lesson bot with its card's buttons, and the
 * support chat's assistant with its options and links) writes as itself,
 * with its own avatar and name. Stream still provides the parts:
 * attachments and voice notes, quotes, reactions and the actions menu.
 */
const NafhamMessageUI: FC = () => {
  const { t, i18n } = useTranslation();
  const {
    deliveredTo,
    groupStyles,
    handleAction,
    handleOpenThread,
    handleRetry,
    highlighted,
    isMyMessage,
    message,
    readBy,
    renderText,
    threadList,
  } = useMessageContext();
  const { channel, messages } = useChannelStateContext();
  const userId = useAppSelector(selectCurrentUser)?.id;
  // Touch screens have no hover: a tap on the bubble shows its actions
  const [actionsShown, setActionsShown] = useState(false);

  const mine = isMyMessage();
  const fromAdmin = isAdminUser(message.user?.id);
  const helper = fromAdmin && isAssistantMessage(message);
  const bot = isBotMessage(message) || helper;
  const card = assistantCardOf(message);
  const announcement = fromAdmin && !bot && message.system === true;
  // No link to the chat being read, nor next to buttons that answer here
  const rawPath = fromAdmin && message.system === true ? message.path : '';
  const path =
    typeof rawPath === 'string' &&
    rawPath.startsWith('/') &&
    card?.state !== 'open' &&
    rawPath !== `/messages/${channel?.id}`
      ? rawPath
      : undefined;
  const cta = path && (
    <Link to={path} className="nf-cta">
      {t(pathLabelOf(path, (message.template as string | undefined) ?? ''))}
      <ArrowForwardRounded aria-hidden="true" />
    </Link>
  );
  // The assistant's options stay on its last message until Nafham (the
  // bot or a person) says something newer; the person's own replies in
  // between do not take them away
  const lastFromNafham = helper
    ? messages
        ?.slice()
        .reverse()
        .find((m) => isAdminUser(m.user?.id))
    : undefined;
  const latest = !!lastFromNafham && lastFromNafham.id === message.id;
  const deleted = isMessageDeleted(message);
  const group = groupStyles?.[0] || 'single';
  const firstOfGroup = group === 'top' || group === 'single';
  const lastOfGroup = group === 'bottom' || group === 'single';
  const memberCount = Object.keys(channel?.state?.members ?? {}).length;
  const time = clockTime(message.created_at, i18n.language);

  const attachments = useMemo(
    () =>
      message.shared_location
        ? [message.shared_location, ...(message.attachments ?? [])]
        : (message.attachments ?? []),
    [message],
  );

  // Nafham's notices come in English and Arabic: show the reader's one
  const shown =
    fromAdmin && message.text
      ? { ...message, text: textInLanguage(message.text, i18n.language) }
      : message;

  if (isDateSeparatorMessage(message)) return null;

  if (announcement) {
    return (
      <div className="nf-note" role="note">
        <span className="nf-note__icon" aria-hidden="true">
          <CampaignRounded />
        </span>
        <div className="nf-note__body" dir="auto">
          <p className="nf-note__title">
            {t('MESSAGES.NAFHAM_SUPPORT')}
            <span className="nf-note__time">{time}</span>
          </p>
          <MessageText message={shown} renderText={renderText} />
          {cta}
        </div>
      </div>
    );
  }

  // The assistant's name says what it is; no chip beside it
  const role = bot ? undefined : roleOf(channel, message.user?.id);
  const showName = !mine && firstOfGroup && (memberCount > 2 || bot);
  const mediaOnly =
    !deleted &&
    !message.text &&
    !message.quoted_message &&
    attachments.length > 0 &&
    attachments.every(
      (a) => 'type' in a && (a.type === 'image' || a.type === 'video'),
    );
  const failed = message.status === 'failed';
  const canRetry = failed && isMessageErrorRetryable(message);
  const read = mine && (readBy ?? []).some((u) => u.id !== message.user?.id);
  const delivered =
    mine && (deliveredTo ?? []).some((u) => u.id !== message.user?.id);
  const hasReactions = !deleted && messageHasReactions(message);
  const showReplies = !threadList && !!message.reply_count;

  const className = [
    'nf-msg',
    mine ? 'nf-msg--me' : 'nf-msg--other',
    `nf-msg--${group}`,
    fromAdmin && !mine ? 'nf-msg--admin' : '',
    bot ? 'nf-msg--bot' : '',
    mediaOnly ? 'nf-msg--media' : '',
    failed ? 'nf-msg--failed' : '',
    highlighted ? 'nf-msg--highlighted' : '',
    actionsShown ? 'nf-msg--actions-shown' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className} data-message-id={message.id}>
      <div className="nf-msg__col">
        {showName && (
          <p className="nf-msg__sender" dir="auto">
            <span>
              {bot
                ? t('MESSAGES.ASSISTANT.NAME')
                : fromAdmin
                  ? t('MESSAGES.NAFHAM_SUPPORT')
                  : message.user?.name || t('MESSAGES.UNKNOWN_USER')}
            </span>
            {role && (
              <span className={`nf-msg__role nf-msg__role--${role}`}>
                {role === 'support' && <ShieldRounded aria-hidden="true" />}
                {t(`MESSAGES.ROLE.${role.toUpperCase()}`)}
              </span>
            )}
          </p>
        )}

        <div className="nf-msg__row">
          {!mine && (
            <span className="nf-msg__avatar" aria-hidden="true">
              {lastOfGroup &&
                (bot ? (
                  <Avatar className="nf-msg__avatar-bot" alt="">
                    <SmartToyRounded />
                  </Avatar>
                ) : fromAdmin ? (
                  <Avatar className="nf-msg__avatar-admin" alt="">
                    <ShieldRounded />
                  </Avatar>
                ) : (
                  <Avatar
                    src={message.user?.image as string | undefined}
                    alt=""
                  >
                    {initialsOf(message.user?.name)}
                  </Avatar>
                ))}
            </span>
          )}
          <div
            className="nf-msg__bubble"
            dir="auto"
            onClick={() => {
              if (window.matchMedia('(hover: none)').matches) {
                setActionsShown((shown) => !shown);
              }
            }}
          >
            {deleted ? (
              <p className="nf-msg__deleted">{t('MESSAGES.DELETED_MESSAGE')}</p>
            ) : (
              <>
                {message.quoted_message && <QuotedMessage />}
                {attachments.length > 0 && (
                  <Attachment
                    actionHandler={handleAction}
                    attachments={attachments}
                  />
                )}
                {message.text && (
                  <MessageText message={shown} renderText={renderText} />
                )}
              </>
            )}
            <span className="nf-msg__meta">
              {isMessageEdited(message) && !deleted && (
                <span>{t('MESSAGES.EDITED')}</span>
              )}
              <time dateTime={new Date(message.created_at).toISOString()}>
                {time}
              </time>
              {mine && !deleted && (
                <Ticks
                  message={message}
                  read={read}
                  delivered={delivered}
                  t={t}
                />
              )}
            </span>
          </div>
          {!deleted && (
            <div className="nf-msg__actions">
              <MessageActions />
            </div>
          )}
        </div>

        {(card || helper || cta) && (
          <div className="nf-msg__extras">
            {card && message.id && (
              <BotActionRow
                card={card}
                messageId={message.id}
                channelId={channel?.id}
                userId={userId}
              />
            )}

            {helper && (
              <AssistantOptions
                options={message.options ?? []}
                links={message.links ?? []}
                latest={latest}
              />
            )}

            {cta}
          </div>
        )}

        {hasReactions && (
          <div className="nf-msg__reactions">
            <MessageReactions reverse={mine} />
          </div>
        )}

        {showReplies && (
          <MessageRepliesCountButton
            onClick={handleOpenThread}
            reply_count={message.reply_count}
            thread_participants={message.thread_participants}
          />
        )}

        {failed && (
          <button
            type="button"
            className="nf-msg__retry"
            disabled={!canRetry}
            onClick={() => canRetry && handleRetry(message)}
          >
            <ErrorOutlineRounded aria-hidden="true" />
            {canRetry ? t('MESSAGES.NOT_SENT_RETRY') : t('MESSAGES.NOT_SENT')}
          </button>
        )}
      </div>
    </div>
  );
};

interface TicksProps {
  message: LocalMessage;
  read: boolean;
  delivered: boolean;
  t: (key: string) => string;
}

/** Sending clock, then one tick (sent), two ticks (delivered), blue (read). */
const Ticks: FC<TicksProps> = ({ message, read, delivered, t }) => {
  if (message.status === 'sending') {
    return (
      <ScheduleRounded
        className="nf-msg__tick"
        aria-label={t('MESSAGES.STATUS.SENDING')}
      />
    );
  }
  if (message.status === 'failed') return null;
  if (read) {
    return (
      <DoneAllRounded
        className="nf-msg__tick nf-msg__tick--read"
        aria-label={t('MESSAGES.STATUS.READ')}
      />
    );
  }
  return delivered ? (
    <DoneAllRounded
      className="nf-msg__tick"
      aria-label={t('MESSAGES.STATUS.DELIVERED')}
    />
  ) : (
    <DoneRounded
      className="nf-msg__tick"
      aria-label={t('MESSAGES.STATUS.SENT')}
    />
  );
};

export default NafhamMessageUI;
