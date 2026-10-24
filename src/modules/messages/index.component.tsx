import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, CircularProgress, InputBase } from '@mui/material';
import {
  ChatBubbleOutlineRounded,
  PersonSearchRounded,
  SearchRounded,
} from '@mui/icons-material';
import type {
  Channel as StreamChannel,
  ChannelFilters,
  ChannelSort,
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
import { useStreamChat } from '../../hooks/useStreamChat';
import {
  CHANNEL_TYPE,
  getCounterpart,
  isAdminUser,
  toStreamUserId,
} from '../../lib/streamChat';
import { useRtlClass } from '../../assets/utils/utils';
import ConversationItem from './conversation-item.component';
import ThreadHeader from './thread-header.component';
import NafhamMessageUI from './nafham-message-ui.component';
import { getStreamI18n } from './stream-i18n';

import 'stream-chat-react/dist/css/index.css';
import './index.styles.scss';

type ListFilter = 'all' | 'unread' | 'nafham';

const sort: ChannelSort = { last_message_at: -1 };
// The page has its own title and filters; hide Stream's "Chats" header
const NoHeader = () => null;
const options = { limit: 20, state: true, watch: true, presence: false };

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
      const q = query.trim().toLowerCase();
      return channels.filter((channel) => {
        if (filter === 'unread' && channel.countUnread() === 0) return false;
        if (filter === 'nafham') {
          const last = channel.state.latestMessages.at(-1);
          if (!isAdminUser(last?.user?.id)) return false;
        }
        if (!q) return true;
        const other = getCounterpart(channel, userId);
        const haystack = `${other?.user?.name ?? ''} ${
          (channel.data?.subject as string | undefined) ?? ''
        }`.toLowerCase();
        return haystack.includes(q);
      });
    },
    [filter, query, userId],
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
          }}
        >
          <section className="messages__list" aria-label={t('MESSAGES.TITLE')}>
            <div className="messages__list-head">
              <h1 className="messages__title">{t('MESSAGES.TITLE')}</h1>
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
              <div className="messages__pills" role="group">
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
  const { t } = useTranslation();
  const { client } = useStreamChat();
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!client || !channelId) {
      setChannel(null);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    const next = client.channel(CHANNEL_TYPE, channelId);
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
          <CircularProgress size={28} />
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
    <Channel channel={channel} key={channel.cid}>
      <Window>
        <ThreadHeader
          channel={channel}
          currentUserId={currentUserId}
          isTutor={isTutor}
          onBack={onBack}
        />
        <MessageList />
        <MessageComposer
          focus
          maxRows={6}
          audioRecordingEnabled
          asyncMessagesMultiSendEnabled
          additionalTextareaProps={{
            placeholder: t('MESSAGES.COMPOSER.PLACEHOLDER'),
          }}
        />
        <p className="messages__hint">{t('MESSAGES.COMPOSER.HINT')}</p>
      </Window>
    </Channel>
  );
};

export default Messages;
