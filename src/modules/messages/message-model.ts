import type { LocalMessage } from 'stream-chat';

import { isAdminUser } from '../../lib/streamChat';
import {
  assistantCardOf,
  isBotMessage,
  type AssistantCard,
} from '../../lib/chat-actions';
import { isAssistantMessage } from '../../lib/assistant';

/**
 * What the Messages page decides about a message before drawing it: who
 * wrote it, whether it is a bubble or a notice card, where a notice
 * points, how the ticks read. Kept free of React so it can be tested on
 * its own.
 */

type Message = Pick<
  LocalMessage,
  | 'id'
  | 'user'
  | 'text'
  | 'type'
  | 'status'
  | 'attachments'
  | 'quoted_message'
  | 'system'
  | 'path'
  | 'template'
  | 'bot'
  | 'assistant'
>;

export interface MessageKind {
  /** Written as the Nafham Support member (a person, a bot or a notice) */
  fromAdmin: boolean;
  /** The support chat's assistant (options and links) */
  helper: boolean;
  /** Either assistant: the lesson bot or the support chat's helper */
  bot: boolean;
  /** A notice from Nafham drawn as a centred card, not a bubble */
  announcement: boolean;
  /** The lesson bot's card, when the message carries a valid one */
  card: AssistantCard | null;
}

export const messageKindOf = (message: Message): MessageKind => {
  const fromAdmin = isAdminUser(message.user?.id);
  const helper = fromAdmin && isAssistantMessage(message as LocalMessage);
  const bot = isBotMessage(message) || helper;
  return {
    fromAdmin,
    helper,
    bot,
    announcement: fromAdmin && !bot && message.system === true,
    card: assistantCardOf(message),
  };
};

/**
 * Where a Nafham notice points, if it should show a button: only app
 * paths, never the chat being read, and not while the bot's card still
 * has buttons that answer here.
 */
export const noticePathOf = (
  message: Message,
  card: AssistantCard | null,
  channelId?: string,
): string | undefined => {
  if (!isAdminUser(message.user?.id) || message.system !== true) return;
  const path = message.path;
  if (typeof path !== 'string' || !path.startsWith('/')) return;
  if (path.startsWith('//')) return; // protocol-relative: another site
  if (card?.state === 'open') return;
  if (channelId && path === `/messages/${channelId}`) return;
  return path;
};

/** Announcements that point somewhere in the app, by template */
const PATH_LABELS: Record<string, string> = {
  move_proposed: 'SESSION_CHANGES.CHAT.ANSWER',
  schedule_change_proposed: 'SESSION_CHANGES.CHAT.ANSWER',
  freeze_created: 'SESSION_CHANGES.CHAT.PACKAGES',
  freeze_resumed: 'SESSION_CHANGES.CHAT.SESSIONS',
  freeze_cancelled: 'SESSION_CHANGES.CHAT.PACKAGES',
};

/** The translation key for a notice's button */
export const pathLabelOf = (path: string, template = ''): string => {
  if (path.startsWith('/messages/')) return 'SESSION_CHANGES.CHAT.OPEN_CHAT';
  if (PATH_LABELS[template]) return PATH_LABELS[template];
  if (path === '/requests') return 'SESSION_CHANGES.CHAT.ANSWER';
  if (path === '/my_packages') return 'SESSION_CHANGES.CHAT.PACKAGES';
  return 'SESSION_CHANGES.CHAT.SESSIONS';
};

export type Role = 'student' | 'instructor' | 'support';

/** Who sent a message in a lesson conversation, for the name line. */
export const roleOf = (
  channelData: { tutor_id?: unknown; student_id?: unknown } | undefined,
  userId?: string,
): Role | undefined => {
  if (!userId) return undefined;
  if (isAdminUser(userId)) return 'support';
  const tutorId = channelData?.tutor_id;
  const studentId = channelData?.student_id;
  if (tutorId != null && String(tutorId) === userId) return 'instructor';
  if (studentId != null && String(studentId) === userId) return 'student';
  return undefined;
};

/**
 * The support assistant's options stay on its last message until Nafham
 * (the bot or a person) says something newer; the person's own replies in
 * between do not take them away.
 */
export const isLatestFromNafham = (
  messages: ReadonlyArray<Pick<LocalMessage, 'id' | 'user'>> | undefined,
  messageId: string | undefined,
): boolean => {
  if (!messages || !messageId) return false;
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (isAdminUser(messages[i].user?.id)) return messages[i].id === messageId;
  }
  return false;
};

export type Ticks = 'sending' | 'failed' | 'sent' | 'delivered' | 'read';

/** Clock while sending, then one tick, two ticks, and blue once read. */
export const ticksOf = (
  status: string | undefined,
  read: boolean,
  delivered: boolean,
): Ticks => {
  if (status === 'sending') return 'sending';
  if (status === 'failed') return 'failed';
  if (read) return 'read';
  return delivered ? 'delivered' : 'sent';
};

/** Whether anyone other than the author is in a read or delivered list */
export const seenByOthers = (
  users: ReadonlyArray<{ id: string }> | undefined,
  authorId: string | undefined,
): boolean => (users ?? []).some((u) => u.id !== authorId);

/** Stream's group style as the two facts the bubble needs */
export const groupPositionOf = (style: string | undefined) => {
  const group = style || 'single';
  return {
    group,
    first: group === 'top' || group === 'single',
    last: group === 'bottom' || group === 'single',
  };
};

type AttachmentLike = { type?: string } | object;

/** Photos or videos with no text: drawn edge to edge, time over the image */
export const isMediaOnly = (
  message: Pick<Message, 'text' | 'quoted_message'>,
  attachments: ReadonlyArray<AttachmentLike>,
): boolean =>
  !message.text &&
  !message.quoted_message &&
  attachments.length > 0 &&
  attachments.every(
    (a) => 'type' in a && (a.type === 'image' || a.type === 'video'),
  );

export type PreviewKind = 'voice' | 'photo' | 'file' | null;

/** The latest message as the conversation list shows it */
export interface Preview {
  kind: PreviewKind;
  /** A translation key, or the message's own text when `literal` */
  text: string;
  literal: boolean;
  /** A voice note's length, "m:ss" */
  duration?: string;
}

export const previewOf = (
  message: Message | undefined,
  textInReaderLanguage: (text: string) => string,
): Preview => {
  if (!message) {
    return { kind: null, text: 'MESSAGES.NO_MESSAGES_YET', literal: false };
  }
  if (message.type === 'deleted') {
    return { kind: null, text: 'MESSAGES.DELETED_MESSAGE', literal: false };
  }
  const attachments = message.attachments ?? [];
  const voice = attachments.find((a) => a.type === 'voiceRecording');
  if (voice) {
    const seconds = Math.max(0, Math.round(Number(voice.duration) || 0));
    const duration = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
    return {
      kind: 'voice',
      text: 'MESSAGES.VOICE_NOTE',
      literal: false,
      duration,
    };
  }
  const text = message.text?.trim();
  if (text) {
    // Nafham's notices carry both languages: preview the reader's one
    const shown = isAdminUser(message.user?.id)
      ? textInReaderLanguage(text)
      : text;
    return { kind: null, text: shown.replace(/\s+/g, ' '), literal: true };
  }
  if (attachments.some((a) => a.type === 'image')) {
    return { kind: 'photo', text: 'MESSAGES.PHOTO', literal: false };
  }
  if (attachments.length) {
    const title = attachments[0].title;
    return title
      ? { kind: 'file', text: title, literal: true }
      : { kind: 'file', text: 'MESSAGES.FILE', literal: false };
  }
  return { kind: null, text: '', literal: true };
};

export type Author = 'none' | 'you' | 'assistant' | 'support' | 'person';

/** Who wrote the latest message, for the "Name: …" prefix in the list */
export const authorOf = (
  message: Message | undefined,
  currentUserId: string,
): Author => {
  if (!message) return 'none';
  if (message.user?.id === currentUserId) return 'you';
  const kind = messageKindOf(message);
  if (kind.bot) return 'assistant';
  if (kind.fromAdmin) return 'support';
  return 'person';
};
