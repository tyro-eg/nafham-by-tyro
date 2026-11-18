import { FC, ReactNode, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ChatScreenContext,
  useChatConversationActions,
  type OpenScreen,
} from '../../hooks/useChatAction';
import {
  ChatPromptContext,
  type ChatPromptValue,
  type PromptFlow,
  type PromptParams,
  type PromptRequest,
} from '../../hooks/useChatPrompt';

interface ChatScreensProviderProps {
  channelId: string;
  children: ReactNode;
}

/**
 * Wraps the open thread. The bot's "open" buttons and the quick actions
 * start one of the assistant's in-chat flows (cancel or move a lesson,
 * pause, change the weekly times) through ChatPromptContext; booking a
 * replacement goes to the tutor's page.
 */
const ChatScreensProvider: FC<ChatScreensProviderProps> = ({
  channelId,
  children,
}) => {
  const navigate = useNavigate();
  const actions = useChatConversationActions(channelId);
  const [prompt, setPrompt] = useState<PromptRequest | null>(null);

  const start = useCallback((flow: PromptFlow, params: PromptParams = {}) => {
    setPrompt((current) => ({ flow, params, key: (current?.key ?? 0) + 1 }));
  }, []);
  const close = useCallback(() => setPrompt(null), []);
  const promptValue = useMemo<ChatPromptValue>(
    () => ({ prompt, start, close }),
    [prompt, start, close],
  );

  const openScreen = useCallback<OpenScreen>(
    (screen, params) => {
      switch (screen) {
        case 'book_session': {
          const tutorId = params.tutor_id ?? actions.data?.tutor_id;
          if (tutorId) navigate(`/profile/${tutorId}`);
          return;
        }
        case 'propose_move':
          start('change', { session_id: params.session_id, what: 'move' });
          return;
        case 'cancel_session':
          start('change', { session_id: params.session_id, what: 'cancel' });
          return;
        case 'freeze_package':
          start('pause', { package_id: params.package_id });
          return;
        case 'propose_schedule_change':
          start('weekly', { package_id: params.package_id });
          return;
        default:
          return;
      }
    },
    [actions.data?.tutor_id, navigate, start],
  );

  return (
    <ChatScreenContext.Provider value={openScreen}>
      <ChatPromptContext.Provider value={promptValue}>
        {children}
      </ChatPromptContext.Provider>
    </ChatScreenContext.Provider>
  );
};

export default ChatScreensProvider;
