import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { get, patch, post } from '../assets/utils/api';
import { queryKeys } from '../lib/queryKeys';
import {
  childHeaderFor,
  isHandoff,
  isSafeApiPath,
  type BotAction,
  type BotScreen,
  type CardPeople,
} from '../lib/chat-actions';
import { useAppSelector } from '../redux/store';
import { selectCurrentUser } from '../redux/user/user.selectors';
import { remainingOptions } from './useSessionChanges';
import type { WeeklyEntry } from './useFreezes';

/**
 * Pressing a Nafham Assistant button: an `api` button runs its call
 * through the app's api client (a parent names the child), an `open`
 * button opens one of the existing modals through the thread's
 * ChatScreenContext. The backend keeps every rule; this stays silent and
 * the button row surfaces errors.
 */

// ---------------------------------------------------------------------------
// Opening an app screen from the chat
// ---------------------------------------------------------------------------

export interface OpenScreenParams {
  session_id?: number;
  package_id?: number;
  /** The lesson's tutor, for booking a replacement */
  tutor_id?: number;
  grade_subject_id?: number;
  /** A parent names the child on the lookups the opener makes */
  child_headers?: Record<string, string>;
}

export type OpenScreen = (screen: BotScreen, params: OpenScreenParams) => void;

/** Provided by the open thread (ChatScreensProvider) */
export const ChatScreenContext = createContext<OpenScreen | null>(null);

export const useOpenScreen = () => useContext(ChatScreenContext);

// ---------------------------------------------------------------------------
// Messages answered here, until Stream's message.updated replaces the card
// ---------------------------------------------------------------------------

const answeredHere = new Set<string>();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const markAnsweredHere = (messageId: string) => {
  if (answeredHere.has(messageId)) return;
  answeredHere.add(messageId);
  emit();
};

export const clearAnsweredHere = (messageId: string) => {
  if (!answeredHere.delete(messageId)) return;
  emit();
};

/** True while this viewer pressed a button and the server has not updated the card yet */
export const useAnsweredHere = (messageId: string | undefined) =>
  useSyncExternalStore(subscribe, () =>
    messageId ? answeredHere.has(messageId) : false,
  );

// ---------------------------------------------------------------------------
// Running a button
// ---------------------------------------------------------------------------

interface RunOptions {
  /** The bot message the button is on: hidden as answered on success */
  messageId?: string;
  reason?: string;
}

interface ApiInput {
  action: BotAction;
  people: CardPeople;
  reason?: string;
}

/** Every list a lesson change can touch, plus the chat's own actions */
const invalidateAll = (
  queryClient: ReturnType<typeof useQueryClient>,
  channelId?: string,
) => {
  [
    queryKeys.sessions.all,
    queryKeys.calendar.all,
    queryKeys.packages.all,
    queryKeys.rescheduleRequests.all,
    queryKeys.freezes.all,
    queryKeys.scheduleChanges.all,
  ].forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
  queryClient.invalidateQueries({
    queryKey: channelId
      ? queryKeys.chat.actions(channelId)
      : queryKeys.chat.all,
  });
};

export function useChatAction(channelId: string | undefined) {
  const queryClient = useQueryClient();
  const openScreen = useOpenScreen();
  const userId = useAppSelector(selectCurrentUser)?.id;
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  // A second tap while the first call runs is dropped, whatever React has rendered
  const inFlight = useRef(false);

  const mutation = useMutation({
    mutationFn: async ({ action, people, reason }: ApiInput) => {
      if (action.call.kind !== 'api') throw new Error('Not an API action');
      const { method, path, body } = action.call;
      if ((method !== 'POST' && method !== 'PATCH') || !isSafeApiPath(path)) {
        throw new Error(`Unsupported assistant action ${action.id}`);
      }
      const data: Record<string, unknown> = { ...(body ?? {}) };
      if (action.reason) data.reason = reason?.trim() || undefined;
      const headers = childHeaderFor(people, userId);
      const config = headers ? { headers } : {};
      const response =
        method === 'POST'
          ? await post(path, data, config)
          : await patch(path, data, config);
      return response.data;
    },
    // The button row shows the refusal inline: no global toast
    onError: () => undefined,
    onSettled: () => invalidateAll(queryClient, channelId),
  });

  /** Press a button; resolves true when it went through (or opened a screen) */
  const run = useCallback(
    async (
      action: BotAction,
      people: CardPeople,
      options: RunOptions = {},
    ): Promise<boolean> => {
      if (action.call.kind === 'open') {
        // The card's own subject fills in what the button leaves out
        const params = action.call.params ?? {};
        openScreen?.(action.call.screen, {
          ...params,
          session_id: params.session_id ?? people.subject.session_id,
          package_id: params.package_id ?? people.subject.package_id,
          tutor_id: params.tutor_id ?? people.subject.tutor_id,
          child_headers: childHeaderFor(people, userId),
        });
        return true;
      }
      if (inFlight.current) return false;
      inFlight.current = true;
      setPendingActionId(action.id);
      try {
        await mutation.mutateAsync({ action, people, reason: options.reason });
        if (options.messageId && !isHandoff(action)) {
          markAnsweredHere(options.messageId);
        }
        return true;
      } catch {
        return false;
      } finally {
        inFlight.current = false;
        setPendingActionId(null);
      }
    },
    [mutation, openScreen, userId],
  );

  return {
    run,
    pendingActionId,
    error: mutation.error,
    /** The times still open after a refused accept (option_taken), else null */
    remaining: mutation.error ? remainingOptions(mutation.error) : null,
    reset: mutation.reset,
  };
}

// ---------------------------------------------------------------------------
// What the viewer can do from a lesson chat (GET /chat/conversations/:id/actions)
// ---------------------------------------------------------------------------

export interface ChatUpcomingSession {
  id: number;
  slug: string;
  start_time: string;
  end_time: string;
  session_type: 'regular' | 'trial' | 'group';
  can_cancel: boolean;
  can_propose_move: boolean;
  pending_reschedule_request: unknown | null;
}

export interface ChatPackage {
  id: number;
  slug: string;
  remaining_hours: number;
  freeze: unknown | null;
  pending_schedule_change: {
    id: number;
    slug: string;
    pattern?: WeeklyEntry[];
  } | null;
  grade_subject?: { full_course_name: string };
  tutor?: { id: number; first_name: string };
  can_freeze: boolean;
  can_propose_schedule_change: boolean;
}

export interface ChatConversationActions {
  viewer_role: 'student' | 'tutor';
  student_id: number;
  tutor_id: number;
  awaiting_support: boolean;
  upcoming_sessions: ChatUpcomingSession[];
  package: ChatPackage | null;
  actions: BotAction[];
}

/** 404: not a lesson conversation; 403: the viewer is not a member. Nothing to offer either way */
export const isMissingConversation = (error: unknown): boolean => {
  const status = (error as { response?: { status?: number } })?.response
    ?.status;
  return status === 404 || status === 403;
};

export function useChatConversationActions(channelId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.chat.actions(channelId ?? ''),
    queryFn: async () => {
      const response = await get(
        `/chat/conversations/${encodeURIComponent(channelId ?? '')}/actions`,
      );
      return response.data.data as ChatConversationActions;
    },
    enabled: !!channelId,
    // A 404 (not a lesson conversation) or 403 is final and just hides the
    // row; anything else is tried once more
    retry: (count, error) => !isMissingConversation(error) && count < 1,
    staleTime: 30 * 1000,
  });
}
