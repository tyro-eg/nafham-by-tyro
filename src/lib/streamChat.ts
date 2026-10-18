import {
  StreamChat,
  type Channel,
  type ChannelMemberResponse,
} from 'stream-chat';

import { post } from '../assets/utils/api';
import type { CurrentUser } from '../assets/types';

/**
 * Stream Chat integration (getstream.io).
 *
 * Every conversation is a `messaging` channel with three members: the
 * student, the instructor and the shared Nafham admin user
 * ("Nafham Support"). Stream stores the messages, attachments and voice
 * notes; the backend only vouches for who the user is by signing a token
 * at POST /chat/token (see tokenProvider below).
 */

export const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY || '';
export const STREAM_ADMIN_USER_ID =
  import.meta.env.VITE_STREAM_ADMIN_USER_ID || 'nafham-support';
const STREAM_DEV_TOKENS = import.meta.env.VITE_STREAM_DEV_TOKENS === 'true';

export const CHANNEL_TYPE = 'messaging';

/** Chat is only available when the public API key is configured. */
export const isStreamConfigured = (): boolean => STREAM_API_KEY.length > 0;

/** Stream user ids are strings; the app's numeric user id is reused. */
export const toStreamUserId = (id: number | string): string => String(id);

let client: StreamChat | null = null;

/** Lazily created singleton; one WebSocket for the whole app. */
export const getStreamClient = (): StreamChat => {
  if (!client) {
    client = StreamChat.getInstance(STREAM_API_KEY, {
      enableInsights: false,
      enableWSFallback: true,
    });
  }
  return client;
};

/**
 * Ask the backend for a Stream user token. The API secret never leaves
 * the server. In development, with VITE_STREAM_DEV_TOKENS=true and
 * "Disable Auth Checks" on in the Stream dashboard, the token is signed
 * in the browser instead so the UI can be built before the endpoint
 * exists.
 */
export const tokenProvider = async (userId: string): Promise<string> => {
  if (STREAM_DEV_TOKENS) {
    return getStreamClient().devToken(userId);
  }
  const response = await post('/chat/token', {});
  const body = response.data?.data ?? response.data;
  const token = body?.token ?? body?.attributes?.token;
  if (!token) {
    throw new Error('POST /chat/token returned no token');
  }
  return token;
};

/** Display name and avatar the app shows for a Stream user. */
export const streamUserFromCurrentUser = (user: CurrentUser) => ({
  id: toStreamUserId(user.id),
  name: `${user.first_name} ${user.last_name}`.trim(),
  image: user.avatar || undefined,
  nafham_role: user.type === 'Tutor' ? 'instructor' : 'student',
});

/**
 * Connect the current app user. Safe to call again for the same user;
 * a different user disconnects the previous one first.
 */
export const connectStreamUser = async (user: CurrentUser) => {
  const chat = getStreamClient();
  const streamUser = streamUserFromCurrentUser(user);

  if (chat.userID && chat.userID !== streamUser.id) {
    await chat.disconnectUser();
  }
  if (chat.userID === streamUser.id) {
    return chat;
  }

  await chat.connectUser(streamUser, () => tokenProvider(streamUser.id));
  return chat;
};

export const disconnectStreamUser = async () => {
  if (client?.userID) {
    await client.disconnectUser();
  }
};

/**
 * The person the current user is talking to: the member who is neither
 * the current user nor the Nafham admin.
 */
export const getCounterpart = (
  channel: Channel,
  currentUserId: string,
): ChannelMemberResponse | undefined => {
  const members = Object.values(channel.state.members);
  return (
    members.find(
      (m) => m.user_id !== currentUserId && m.user_id !== STREAM_ADMIN_USER_ID,
    ) ?? members.find((m) => m.user_id !== currentUserId)
  );
};

export const hasAdminMember = (channel: Channel): boolean =>
  Boolean(channel.state.members[STREAM_ADMIN_USER_ID]);

export const isAdminUser = (userId?: string): boolean =>
  userId === STREAM_ADMIN_USER_ID;

/**
 * Find or create the conversation between the current user and another
 * user. Channels without an id are "distinct": Stream returns the same
 * channel for the same set of members, so this is idempotent.
 */
export const findOrCreateConversation = async (
  otherUserId: number | string,
  data: { subject?: string } = {},
): Promise<Channel> => {
  const chat = getStreamClient();
  if (!chat.userID) {
    throw new Error('Stream user is not connected');
  }
  const members = Array.from(
    new Set([chat.userID, toStreamUserId(otherUserId), STREAM_ADMIN_USER_ID]),
  );
  const channel = chat.channel(CHANNEL_TYPE, { members, ...data });
  await channel.watch();
  return channel;
};

/** Initials for a member without an avatar image. */
export const initialsOf = (name?: string): string =>
  (name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
