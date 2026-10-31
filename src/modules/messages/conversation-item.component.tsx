import { FC, useEffect, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar } from '@mui/material';
import {
  AttachFileRounded,
  DoneAllRounded,
  MicRounded,
  ShieldRounded,
} from '@mui/icons-material';
import type { Channel, LocalMessage } from 'stream-chat';

import {
  getCounterpart,
  hasAdminMember,
  initialsOf,
  isAdminUser,
  isSupportConversation,
} from '../../lib/streamChat';
import { formatConversationTime } from './messages.utils';

interface ConversationItemProps {
  channel: Channel;
  currentUserId: string;
  active: boolean;
  onSelect: (channel: Channel) => void;
}

/**
 * One row of the conversation list: the other person, the subject,
 * a preview of the latest message, the time and the unread count.
 */
const ConversationItem: FC<ConversationItemProps> = ({
  channel,
  currentUserId,
  active,
  onSelect,
}) => {
  const { t, i18n } = useTranslation();
  const [, rerender] = useReducer((n: number) => n + 1, 0);

  // Keep the row current while the list stays mounted
  useEffect(() => {
    const events = [
      'message.new',
      'message.read',
      'message.updated',
      'message.deleted',
      'member.added',
    ] as const;
    const subs = events.map((type) => channel.on(type, rerender));
    return () => subs.forEach((s) => s.unsubscribe());
  }, [channel]);

  const support = isSupportConversation(channel);
  const other = getCounterpart(channel, currentUserId);
  const name = support
    ? t('MESSAGES.NAFHAM_SUPPORT')
    : other?.user?.name || t('MESSAGES.UNKNOWN_USER');
  const subject = support
    ? t('MESSAGES.SUPPORT.META')
    : (channel.data?.subject as string | undefined) || '';
  const unread = channel.countUnread();
  const latest: LocalMessage | undefined =
    channel.state.latestMessages[channel.state.latestMessages.length - 1];

  const lastAt = latest?.created_at ?? channel.data?.last_message_at;
  const time = lastAt
    ? formatConversationTime(new Date(lastAt), i18n.language, t)
    : '';

  const mine = latest?.user?.id === currentUserId;
  const fromAdmin = isAdminUser(latest?.user?.id);
  const preview = previewOf(latest, t);
  const who = !latest
    ? ''
    : mine
      ? t('MESSAGES.YOU')
      : fromAdmin
        ? t('MESSAGES.NAFHAM_SUPPORT')
        : latest.user?.name?.split(' ')[0] || '';

  return (
    <button
      type="button"
      className={`conv-item${active ? ' conv-item--active' : ''}${
        unread ? ' conv-item--unread' : ''
      }`}
      aria-current={active ? 'true' : undefined}
      onClick={() => onSelect(channel)}
    >
      <span className="conv-item__avatar">
        {support ? (
          <Avatar className="conv-item__support-avatar" alt="">
            <ShieldRounded />
          </Avatar>
        ) : (
          <Avatar src={other?.user?.image} alt="">
            {initialsOf(other?.user?.name)}
          </Avatar>
        )}
        {!support && hasAdminMember(channel) && (
          <span
            className="conv-item__admin-dot"
            title={t('MESSAGES.ADMIN_IN_CHAT')}
          >
            <ShieldRounded aria-hidden="true" />
          </span>
        )}
      </span>
      <span className="conv-item__body">
        <span className="conv-item__row">
          <span className="conv-item__name" dir="auto">
            {name}
          </span>
          <span className="conv-item__time">{time}</span>
        </span>
        {subject && (
          <span className="conv-item__subject" dir="auto">
            {subject}
          </span>
        )}
        <span className="conv-item__row">
          <span className="conv-item__preview" dir="auto">
            {mine && (
              <DoneAllRounded className="conv-item__seen" aria-hidden="true" />
            )}
            {preview.icon}
            {who && <span>{who}: </span>}
            {preview.text}
          </span>
          {unread > 0 && (
            <span
              className="conv-item__unread"
              aria-label={t('MESSAGES.UNREAD_COUNT', { count: unread })}
            >
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </span>
      </span>
    </button>
  );
};

/** Short description of the latest message for the list row. */
function previewOf(
  message: LocalMessage | undefined,
  t: (key: string, opts?: Record<string, unknown>) => string,
): { icon: JSX.Element | null; text: string } {
  if (!message) return { icon: null, text: t('MESSAGES.NO_MESSAGES_YET') };
  if (message.type === 'deleted') {
    return { icon: null, text: t('MESSAGES.DELETED_MESSAGE') };
  }
  const attachments = message.attachments ?? [];
  const voice = attachments.find((a) => a.type === 'voiceRecording');
  if (voice) {
    const seconds = Math.round((voice.duration as number) || 0);
    const mm = Math.floor(seconds / 60);
    const ss = String(seconds % 60).padStart(2, '0');
    return {
      icon: <MicRounded className="conv-item__kind" aria-hidden="true" />,
      text: `${t('MESSAGES.VOICE_NOTE')} · ${mm}:${ss}`,
    };
  }
  if (message.text?.trim()) {
    return { icon: null, text: message.text.trim() };
  }
  if (attachments.some((a) => a.type === 'image')) {
    return {
      icon: (
        <AttachFileRounded className="conv-item__kind" aria-hidden="true" />
      ),
      text: t('MESSAGES.PHOTO'),
    };
  }
  if (attachments.length) {
    return {
      icon: (
        <AttachFileRounded className="conv-item__kind" aria-hidden="true" />
      ),
      text: attachments[0].title || t('MESSAGES.FILE'),
    };
  }
  return { icon: null, text: '' };
}

export default ConversationItem;
