import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChatBubbleOutlineRounded,
  SupportAgentRounded,
} from '@mui/icons-material';
import {
  EmptyStateIndicator,
  useChannelStateContext,
  useChatContext,
  type EmptyStateIndicatorProps,
} from 'stream-chat-react';

import { getCounterpart, isSupportConversation } from '../../lib/streamChat';

/**
 * What an empty thread says: who you are talking to and what the chat is
 * for, instead of Stream's generic "send a message" line.
 */
const ThreadEmptyState: FC<EmptyStateIndicatorProps> = (props) => {
  const { t } = useTranslation();
  const { channel } = useChannelStateContext();
  const { client } = useChatContext();
  if (props.listType !== 'message') return <EmptyStateIndicator {...props} />;

  const support = isSupportConversation(channel);
  const other = getCounterpart(channel, client.userID ?? '');
  const name = other?.user?.name?.split(' ')[0] || t('MESSAGES.UNKNOWN_USER');

  return (
    <div className="thread-empty" role="status">
      {support ? (
        <SupportAgentRounded aria-hidden="true" />
      ) : (
        <ChatBubbleOutlineRounded aria-hidden="true" />
      )}
      <p className="thread-empty__title">
        {support
          ? t('MESSAGES.THREAD_EMPTY.SUPPORT_TITLE')
          : t('MESSAGES.THREAD_EMPTY.LESSON_TITLE', { name })}
      </p>
      <p className="thread-empty__text">
        {support
          ? t('MESSAGES.THREAD_EMPTY.SUPPORT_TEXT')
          : t('MESSAGES.THREAD_EMPTY.LESSON_TEXT')}
      </p>
    </div>
  );
};

export default ThreadEmptyState;
