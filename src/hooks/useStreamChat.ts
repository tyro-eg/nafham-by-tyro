import { useCallback, useState } from 'react';
import type { Channel } from 'stream-chat';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useStreamChatContext } from '../component/stream-chat/stream-chat-provider';
import {
  findOrCreateConversation,
  openSupportConversation,
} from '../lib/streamChat';
import { snackActions } from '../assets/utils/toaster';
import { useAppSelector } from '../redux/store';
import { selectCurrentUser } from '../redux/user/user.selectors';
import { useMyInstructors } from './useInstructors';

/**
 * Stream Chat connection state and the total unread count.
 * Chat is unavailable (client null) when VITE_STREAM_API_KEY is not set.
 */
export const useStreamChat = () => useStreamChatContext();

/**
 * Runs an opener (a function that returns a Stream channel) and navigates
 * to the channel, with the shared connection check, busy flag and toasts.
 */
function useConversationOpener<Args extends unknown[]>(
  opener: (...args: Args) => Promise<Channel>,
) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { client, isConnected } = useStreamChatContext();
  const [isStarting, setIsStarting] = useState(false);

  const open = useCallback(
    async (...args: Args) => {
      if (!client || !isConnected) {
        snackActions.error(t('MESSAGES.ERRORS.NOT_CONNECTED'));
        return;
      }
      setIsStarting(true);
      try {
        const channel = await opener(...args);
        navigate(`/messages/${channel.id}`);
      } catch (err) {
        console.error('Could not open the conversation', err);
        snackActions.error(t('MESSAGES.ERRORS.START_FAILED'));
      } finally {
        setIsStarting(false);
      }
    },
    [client, isConnected, navigate, opener, t],
  );

  return { open, isStarting, isAvailable: !!client };
}

/**
 * Opens (or creates) the conversation with another user and navigates
 * to it. The backend adds Nafham Support as the third member.
 */
export function useStartConversation() {
  const opener = useCallback(
    (otherUserId: number | string, subject?: string) =>
      findOrCreateConversation(otherUserId, { subject }),
    [],
  );
  const { open, isStarting, isAvailable } = useConversationOpener(opener);
  return { startConversation: open, isStarting, isAvailable };
}

/**
 * Opens the conversation with Nafham Support and navigates to it.
 */
export function useOpenSupportConversation() {
  return useConversationOpener(openSupportConversation);
}

/**
 * Whether the current user may open a conversation with another user.
 * Chat must be configured, and a student may only message instructors
 * they have a package with (the backend refuses anything else with 403).
 * Tutors reach their students through pages that already list package
 * students only.
 */
export function useCanMessage(userId?: number | string): boolean {
  const currentUser = useAppSelector(selectCurrentUser);
  const { client } = useStreamChatContext();
  const isStudent = currentUser?.type === 'Student';
  const myInstructors = useMyInstructors(undefined, {
    enabled: !!client && isStudent && !!userId,
  });

  if (!client || !currentUser || !userId) return false;
  if (!isStudent) return true;
  return (myInstructors.data?.data ?? []).some(
    (instructor) => String(instructor.id) === String(userId),
  );
}
