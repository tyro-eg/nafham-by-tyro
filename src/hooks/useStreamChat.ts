import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useStreamChatContext } from '../component/stream-chat/stream-chat-provider';
import { findOrCreateConversation } from '../lib/streamChat';
import { snackActions } from '../assets/utils/toaster';

/**
 * Stream Chat connection state and the total unread count.
 * Chat is unavailable (client null) when VITE_STREAM_API_KEY is not set.
 */
export const useStreamChat = () => useStreamChatContext();

/**
 * Opens (or creates) the conversation with another user and navigates
 * to it. The Nafham admin is always added as the third member.
 */
export function useStartConversation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { client, isConnected } = useStreamChatContext();
  const [isStarting, setIsStarting] = useState(false);

  const startConversation = useCallback(
    async (otherUserId: number | string, subject?: string) => {
      if (!client || !isConnected) {
        snackActions.error(t('MESSAGES.ERRORS.NOT_CONNECTED'));
        return;
      }
      setIsStarting(true);
      try {
        const channel = await findOrCreateConversation(otherUserId, {
          subject,
        });
        navigate(`/messages/${channel.id}`);
      } catch (err) {
        console.error('Could not start conversation', err);
        snackActions.error(t('MESSAGES.ERRORS.START_FAILED'));
      } finally {
        setIsStarting(false);
      }
    },
    [client, isConnected, navigate, t],
  );

  return { startConversation, isStarting, isAvailable: !!client };
}
