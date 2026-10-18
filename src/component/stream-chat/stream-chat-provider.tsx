import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { StreamChat } from 'stream-chat';

import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import {
  connectStreamUser,
  disconnectStreamUser,
  getStreamClient,
  isStreamConfigured,
} from '../../lib/streamChat';

export interface StreamChatContextValue {
  /** The shared Stream client, or null when chat is not configured. */
  client: StreamChat | null;
  /** True once the current user's WebSocket connection is up. */
  isConnected: boolean;
  /** Last connection error, if any. */
  error: string | null;
  /** Unread messages across every conversation of the current user. */
  unreadCount: number;
}

const StreamChatContext = createContext<StreamChatContextValue>({
  client: null,
  isConnected: false,
  error: null,
  unreadCount: 0,
});

/**
 * Connects the signed-in user to Stream Chat and keeps the total unread
 * count current for the sidebar badge. Does nothing when
 * VITE_STREAM_API_KEY is missing, so the rest of the app is unaffected.
 */
export const StreamChatProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const currentUser = useAppSelector(selectCurrentUser);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const configured = isStreamConfigured();
  const userId = currentUser?.id;

  useEffect(() => {
    if (!configured) return undefined;

    if (!currentUser) {
      setIsConnected(false);
      setUnreadCount(0);
      disconnectStreamUser().catch(() => undefined);
      return undefined;
    }

    let cancelled = false;
    const chat = getStreamClient();

    connectStreamUser(currentUser)
      .then(() => {
        if (cancelled) return;
        setIsConnected(true);
        setError(null);
        setUnreadCount(
          (chat.user as { total_unread_count?: number } | undefined)
            ?.total_unread_count ?? 0,
        );
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setIsConnected(false);
        setError(err instanceof Error ? err.message : 'Chat connection failed');
      });

    // Stream sends the new total on every event that changes it
    const subscription = chat.on((event) => {
      if (typeof event.total_unread_count === 'number') {
        setUnreadCount(event.total_unread_count);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
    // Reconnect only when the signed-in user changes, not on profile edits
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured, userId]);

  const value = useMemo<StreamChatContextValue>(
    () => ({
      client: configured ? getStreamClient() : null,
      isConnected,
      error,
      unreadCount,
    }),
    [configured, isConnected, error, unreadCount],
  );

  return (
    <StreamChatContext.Provider value={value}>
      {children}
    </StreamChatContext.Provider>
  );
};

export const useStreamChatContext = () => useContext(StreamChatContext);
