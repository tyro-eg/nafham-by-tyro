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

import { initialsOf } from '../../lib/streamChat';
import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import AssistantOptions from './assistant-options.component';
import { clockTime, textInLanguage } from './messages.utils';
import {
  groupPositionOf,
  isLatestFromNafham,
  isMediaOnly,
  messageKindOf,
  noticePathOf,
  pathLabelOf,
  roleOf,
  seenByOthers,
  ticksOf,
  type Ticks as TickState,
} from './message-model';
import BotActionRow from './bot-action-row.component';

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
  const { fromAdmin, helper, bot, announcement, card } = messageKindOf(message);
  const path = noticePathOf(message, card, channel?.id);
  const cta = path && (
    <Link to={path} className="nf-cta">
      {t(pathLabelOf(path, message.template as string | undefined))}
      <ArrowForwardRounded aria-hidden="true" />
    </Link>
  );
  const latest = helper && isLatestFromNafham(messages, message.id);
  const deleted = isMessageDeleted(message);
  const {
    group,
    first: firstOfGroup,
    last: lastOfGroup,
  } = groupPositionOf(groupStyles?.[0]);
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
  const role = bot ? undefined : roleOf(channel?.data, message.user?.id);
  const showName = !mine && firstOfGroup && (memberCount > 2 || bot);
  const mediaOnly = !deleted && isMediaOnly(message, attachments);
  const failed = message.status === 'failed';
  const canRetry = failed && isMessageErrorRetryable(message);
  const ticks = ticksOf(
    message.status,
    seenByOthers(readBy, message.user?.id),
    seenByOthers(deliveredTo, message.user?.id),
  );
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
              {mine && !deleted && <Ticks state={ticks} t={t} />}
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

const TICK_ICONS: Record<Exclude<TickState, 'failed'>, typeof DoneRounded> = {
  sending: ScheduleRounded,
  sent: DoneRounded,
  delivered: DoneAllRounded,
  read: DoneAllRounded,
};

/** Sending clock, then one tick (sent), two ticks (delivered), blue (read). */
const Ticks: FC<{ state: TickState; t: (key: string) => string }> = ({
  state,
  t,
}) => {
  if (state === 'failed') return null;
  const Icon = TICK_ICONS[state];
  return (
    <Icon
      className={`nf-msg__tick${state === 'read' ? ' nf-msg__tick--read' : ''}`}
      aria-label={t(`MESSAGES.STATUS.${state.toUpperCase()}`)}
    />
  );
};

export default NafhamMessageUI;
