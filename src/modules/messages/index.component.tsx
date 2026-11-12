import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Button,
  CircularProgress,
  IconButton,
  InputBase,
  Skeleton,
  Tooltip,
} from '@mui/material';
import {
  ChatBubbleOutlineRounded,
  PersonSearchRounded,
  SearchRounded,
  SupportAgentRounded,
} from '@mui/icons-material';
import type {
  Channel as StreamChannel,
  ChannelFilters,
  ChannelSort,
  Message,
  SendMessageOptions,
} from 'stream-chat';
import {
  Channel,
  ChannelList,
  Chat,
  MessageComposer,
  MessageList,
  Window,
  WithComponents,
} from 'stream-chat-react';

import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import {
  useOpenSupportConversation,
  useStreamChat,
} from '../../hooks/useStreamChat';
import {
  CHANNEL_TYPE,
  getCounterpart,
  isSupportConversation,
  toStreamUserId,
} from '../../lib/streamChat';
import { useRtlClass } from '../../assets/utils/utils';
import { snackActions } from '../../assets/utils/toaster';
import { sendAssistantTurn } from '../../lib/assistant';
import ConversationItem from './conversation-item.component';
import ThreadHeader from './thread-header.component';
import NafhamMessageUI from './nafham-message-ui.component';
import ThreadEmptyState from './thread-empty-state.component';
import ChatScreensProvider from './chat-screens.component';
import AssistantPrompt from './assistant-prompt';
import {
  DaySeparator,
  NewMessagesSeparator,
} from './thread-separators.component';
import { getStreamI18n } from './stream-i18n';
import { matchesListFilter, type ListFilter } from './messages.utils';

import 'stream-chat-react/dist/css/index.css';
import './index.styles.scss';

const sort: ChannelSort = { last_message_at: -1 };
// The page has its own title and filters; hide Stream's "Chats" header
const NoHeader = () => null;
const options = { limit: 20, state: true, watch: true, presence: false };
// Messages from one person this close together share a group
const GROUP_WINDOW_MS = 5 * 60 * 1000;

/** Placeholder rows while the conversation list loads. */
const ListSkeleton = () => (
  <div className="messages__skeleton" aria-hidden="true">
    {[0, 1, 2, 3, 4].map((i) => (
      <div key={i} className="messages__skeleton-row">
        <Skeleton variant="circular" width={44} height={44} />
        <div>
          <Skeleton variant="text" width="55%" height={18} />
          <Skeleton variant="text" width="85%" height={16} />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Messages page: conversations on one side, the open thread on the other.
 * Every conversation has three members (student, instructor, Nafham
 * Support). Messages, voice notes and attachments are handled by Stream;
 * this page lays out and themes the SDK components.
 */
const Messages: FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const rtlClass = useRtlClass();
  const { channelId } = useParams<{ channelId?: string }>();
  const currentUser = useAppSelector(selectCurrentUser);
  const { client, isConnected, error } = useStreamChat();
  const support = useOpenSupportConversation();

  const [filter, setFilter] = useState<ListFilter>('all');
  const [query, setQuery] = useState('');

  const userId = currentUser ? toStreamUserId(currentUser.id) : '';
  const isTutor = currentUser?.type === 'Tutor';
  const i18nInstance = useMemo(
    () => getStreamI18n(i18n.language),
    [i18n.language],
  );

  const filters: ChannelFilters = useMemo(
    () => ({ type: CHANNEL_TYPE, members: { $in: [userId] } }),
    [userId],
  );

  // Keep only the rows matching the pill filter and the search box
  const channelRenderFilterFn = useCallback(
    (channels: StreamChannel[]) => {
      return channels.filter((channel) => {
        const support = isSupportConversation(channel);
        return matchesListFilter(
          {
            unread: channel.countUnread(),
            support,
            searchable: [
              support
                ? t('MESSAGES.NAFHAM_SUPPORT')
                : getCounterpart(channel, userId)?.user?.name,
              channel.data?.subject as string | undefined,
            ],
          },
          filter,
          query,
        );
      });
    },
    [filter, query, t, userId],
  );

  if (!client) {
    return (
      <div className={`messages messages--state ${rtlClass}`}>
        <div className="messages__state">
          <ChatBubbleOutlineRounded aria-hidden="true" />
          <h1>{t('MESSAGES.TITLE')}</h1>
          <p>{t('MESSAGES.NOT_CONFIGURED')}</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className={`messages messages--state ${rtlClass}`}>
        <div className="messages__state" role="status">
          {error ? (
            <>
              <ChatBubbleOutlineRounded aria-hidden="true" />
              <h1>{t('MESSAGES.TITLE')}</h1>
              <p>{t('MESSAGES.CONNECTION_FAILED')}</p>
            </>
          ) : (
            <>
              <CircularProgress size={28} />
              <p>{t('MESSAGES.CONNECTING')}</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`messages ${rtlClass}${
        channelId ? ' messages--thread-open' : ''
      }`}
    >
      <Chat client={client} i18nInstance={i18nInstance}>
        <WithComponents
          overrides={{
            MessageUI: NafhamMessageUI,
            ChannelListHeader: NoHeader,
            EmptyStateIndicator: ThreadEmptyState,
            DateSeparator: DaySeparator,
            UnreadMessagesSeparator: NewMessagesSeparator,
          }}
        >
          <section className="messages__list" aria-label={t('MESSAGES.TITLE')}>
            <div className="messages__list-head">
              <div className="messages__title-row">
                <h1 className="messages__title">{t('MESSAGES.TITLE')}</h1>
                <Tooltip title={t('MESSAGES.SUPPORT.BUTTON')}>
                  <span>
                    <IconButton
                      className="messages__support"
                      aria-label={t('MESSAGES.SUPPORT.BUTTON')}
                      disabled={support.isStarting}
                      onClick={() => support.open()}
                    >
                      <SupportAgentRounded />
                    </IconButton>
                  </span>
                </Tooltip>
              </div>
              <label className="messages__search">
                <SearchRounded aria-hidden="true" />
                <InputBase
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('MESSAGES.SEARCH')}
                  inputProps={{ 'aria-label': t('MESSAGES.SEARCH') }}
                />
              </label>
              <div
                className="messages__pills"
                role="group"
                aria-label={t('MESSAGES.FILTER.LABEL')}
              >
                {(['all', 'unread', 'nafham'] as ListFilter[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={`messages__pill${
                      filter === key ? ' messages__pill--on' : ''
                    }`}
                    aria-pressed={filter === key}
                    onClick={() => setFilter(key)}
                  >
                    {t(`MESSAGES.FILTER.${key.toUpperCase()}`)}
                  </button>
                ))}
              </div>
            </div>

            <WithComponents overrides={{ LoadingIndicator: ListSkeleton }}>
              <ChannelList
                filters={filters}
                sort={sort}
                options={options}
                setActiveChannelOnMount={false}
                channelRenderFilterFn={channelRenderFilterFn}
                EmptyStateIndicator={() => (
                  <div className="messages__empty">
                    <ChatBubbleOutlineRounded aria-hidden="true" />
                    <p className="messages__empty-title">
                      {t('MESSAGES.EMPTY.TITLE')}
                    </p>
                    <p className="messages__empty-text">
                      {isTutor
                        ? t('MESSAGES.EMPTY.TUTOR_TEXT')
                        : t('MESSAGES.EMPTY.STUDENT_TEXT')}
                    </p>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<SupportAgentRounded />}
                      disabled={support.isStarting}
                      onClick={() => support.open()}
                    >
                      {t('MESSAGES.SUPPORT.BUTTON')}
                    </Button>
                    {!isTutor && (
                      <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        startIcon={<PersonSearchRounded />}
                        onClick={() => navigate('/home')}
                      >
                        {t('NAVIGATION.BROWSE_INSTRUCTORS')}
                      </Button>
                    )}
                  </div>
                )}
                renderChannels={(channels) =>
                  channels.map((channel) => (
                    <ConversationItem
                      key={channel.cid}
                      channel={channel}
                      currentUserId={userId}
                      active={channel.id === channelId}
                      onSelect={(c) => navigate(`/messages/${c.id}`)}
                    />
                  ))
                }
              />
            </WithComponents>
          </section>

          <section className="messages__thread">
            <ActiveThread
              channelId={channelId}
              currentUserId={userId}
              isTutor={isTutor}
              onBack={() => navigate('/messages')}
            />
          </section>
        </WithComponents>
      </Chat>
    </div>
  );
};

interface ActiveThreadProps {
  channelId?: string;
  currentUserId: string;
  isTutor: boolean;
  onBack: () => void;
}

/**
 * Loads the channel named in the URL and renders it with Stream's
 * message list and composer (voice notes and attachments enabled).
 */
const ActiveThread: FC<ActiveThreadProps> = ({
  channelId,
  currentUserId,
  isTutor,
  onBack,
}) => {
  const { t, i18n } = useTranslation();
  const { client } = useStreamChat();
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [loading, setLoading] = useState(false);
  const locale = i18n.language;

  useEffect(() => {
    if (!client || !channelId) {
      setChannel(null);
      return undefined;
    }
    let cancelled = false;
    const next = client.channel(CHANNEL_TYPE, channelId);
    // The list already watches its conversations: open those at once
    if (next.initialized) {
      setChannel(next);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    next
      .watch()
      .then(() => {
        if (!cancelled) setChannel(next);
      })
      .catch((err: unknown) => {
        console.error('Could not open conversation', err);
        if (!cancelled) setChannel(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [client, channelId]);

  // The Nafham Assistant lives in a parent's or student's support
  // conversation: opening it greets when due, and every message sent
  // there is also handed to the assistant (after Stream has it)
  const assistantOn = Boolean(
    channel && isSupportConversation(channel) && !isTutor,
  );
  const assistantCid = assistantOn ? channel?.cid : undefined;

  useEffect(() => {
    if (!assistantCid) return;
    sendAssistantTurn({ open: true, locale }).catch((err: unknown) => {
      console.error('The assistant could not greet', err);
    });
  }, [assistantCid, locale]);

  const sendWithAssistant = useCallback(
    async (
      target: StreamChannel,
      message: Message,
      options?: SendMessageOptions,
    ) => {
      const response = await target.sendMessage(message, options);
      const text = message.text?.trim();
      if (text) {
        sendAssistantTurn({ text, locale }).catch((err: unknown) => {
          console.error('The assistant could not read the message', err);
          snackActions.error(t('MESSAGES.ASSISTANT.UNAVAILABLE'));
        });
      }
      return response;
    },
    [locale, t],
  );

  if (!channelId) {
    return (
      <div className="messages__placeholder">
        <ChatBubbleOutlineRounded aria-hidden="true" />
        <p className="messages__placeholder-title">
          {t('MESSAGES.PICK.TITLE')}
        </p>
        <p className="messages__placeholder-text">{t('MESSAGES.PICK.TEXT')}</p>
      </div>
    );
  }

  if (loading || !channel) {
    return (
      <div className="messages__placeholder" role="status">
        {loading ? (
          <ThreadSkeleton />
        ) : (
          <>
            <ChatBubbleOutlineRounded aria-hidden="true" />
            <p className="messages__placeholder-title">
              {t('MESSAGES.NOT_FOUND')}
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <Channel
      channel={channel}
      key={channel.cid}
      doSendMessageRequest={assistantOn ? sendWithAssistant : undefined}
    >
      <ChatScreensProvider channelId={channel.id ?? channelId}>
        <Window>
          <ThreadHeader
            channel={channel}
            currentUserId={currentUserId}
            isTutor={isTutor}
            onBack={onBack}
          />
          {/* Stream marks the first unread message with a second day
              separator; our "New messages" rule does that job instead */}
          <MessageList
            hideNewMessageSeparator
            returnAllReadData
            maxTimeBetweenGroupedMessages={GROUP_WINDOW_MS}
          />
          <AssistantPrompt channelId={channel.id ?? channelId} />
          <MessageComposer
            focus
            maxRows={6}
            audioRecordingEnabled
            asyncMessagesMultiSendEnabled
            additionalTextareaProps={{
              placeholder: t('MESSAGES.COMPOSER.PLACEHOLDER'),
              'aria-describedby': 'messages-composer-hint',
            }}
          />
          <p id="messages-composer-hint" className="messages__hint">
            {t('MESSAGES.COMPOSER.HINT')}
          </p>
        </Window>
      </ChatScreensProvider>
    </Channel>
  );
};

/** Placeholder bubbles while a conversation opens. */
const ThreadSkeleton = () => (
  <div className="messages__thread-skeleton" aria-hidden="true">
    {['62%', '40%', '55%', '30%'].map((width, i) => (
      <Skeleton
        key={width + i}
        variant="rounded"
        width={width}
        height={i % 2 ? 36 : 52}
        className={i % 2 ? 'is-mine' : undefined}
      />
    ))}
  </div>
);

export default Messages;
