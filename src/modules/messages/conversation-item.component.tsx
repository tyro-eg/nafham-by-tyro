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
  getStudentMember,
  hasAdminMember,
  initialsOf,
  isSupportConversation,
} from '../../lib/streamChat';
import {
  formatConversationTime,
  textInLanguage,
  typingLabelOf,
} from './messages.utils';
import { authorOf, previewOf, type PreviewKind } from './message-model';

/** The small icon before a preview that is not text */
const KIND_ICONS: Record<Exclude<PreviewKind, null>, typeof MicRounded> = {
  voice: MicRounded,
  photo: AttachFileRounded,
  file: AttachFileRounded,
};

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
      'typing.start',
      'typing.stop',
    ] as const;
    const subs = events.map((type) => channel.on(type, rerender));
    return () => subs.forEach((s) => s.unsubscribe());
  }, [channel]);

  const support = isSupportConversation(channel);
  const other = getCounterpart(channel, currentUserId);
  // A parent in a child's conversation: say whose it is
  const student = getStudentMember(channel, currentUserId);
  const forChild =
    student && student.user_id !== other?.user_id
      ? student.user?.name
      : undefined;
  const name = support
    ? t('MESSAGES.NAFHAM_SUPPORT')
    : other?.user?.name || t('MESSAGES.UNKNOWN_USER');
  const subject = support
    ? t('MESSAGES.SUPPORT.META')
    : [
        (channel.data?.subject as string | undefined) || '',
        forChild ? t('FAMILY.FOR', { name: forChild }) : '',
      ]
        .filter(Boolean)
        .join(' · ');
  const unread = channel.countUnread();
  const latest: LocalMessage | undefined =
    channel.state.latestMessages[channel.state.latestMessages.length - 1];

  const lastAt = latest?.created_at ?? channel.data?.last_message_at;
  const time = lastAt
    ? formatConversationTime(new Date(lastAt), i18n.language, t)
    : '';

  const typer = Object.values(channel.state.typing ?? {}).find(
    (event) => event.user?.id && event.user.id !== currentUserId,
  );
  const author = authorOf(latest, currentUserId);
  const mine = author === 'you';
  const preview = previewOf(latest, (text) =>
    textInLanguage(text, i18n.language),
  );
  const previewText = preview.literal
    ? preview.text
    : `${t(preview.text)}${preview.duration ? ` · ${preview.duration}` : ''}`;
  const KindIcon = preview.kind ? KIND_ICONS[preview.kind] : null;
  const who = {
    none: '',
    you: t('MESSAGES.YOU'),
    assistant: t('MESSAGES.ASSISTANT.NAME'),
    support: t('MESSAGES.NAFHAM_SUPPORT'),
    person: latest?.user?.name?.split(' ')[0] || '',
  }[author];

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
          {typer ? (
            <span className="conv-item__preview conv-item__preview--typing">
              {typingLabelOf([typer.user?.name], t)}
            </span>
          ) : (
            <span className="conv-item__preview" dir="auto">
              {mine && (
                <DoneAllRounded
                  className="conv-item__seen"
                  aria-hidden="true"
                />
              )}
              {KindIcon && (
                <KindIcon className="conv-item__kind" aria-hidden="true" />
              )}
              <span className="conv-item__preview-text">
                {who ? `${who}: ` : ''}
                {previewText}
              </span>
            </span>
          )}
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

export default ConversationItem;
