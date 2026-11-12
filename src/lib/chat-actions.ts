import type { LocalMessage, MessageResponse } from 'stream-chat';

import type {
  AssistantCard,
  BotAction,
  BotApiCall,
  BotLabel,
  BotRole,
  BotSubject,
} from '../types/stream-chat-custom';
import { isAdminUser } from './streamChat';

export type {
  AssistantCard,
  BotAction,
  BotApiCall,
  BotLabel,
  BotOpenCall,
  BotRole,
  BotScreen,
  BotSubject,
} from '../types/stream-chat-custom';

/**
 * Nafham Assistant: the bot that posts lesson changes into the student–tutor
 * chat with buttons (accept a time, decline, withdraw, pause…). These pure
 * helpers decide who sees which button; useChatAction runs them.
 */

/** The people a card is about: enough to know the viewer's side (and what it is about) */
export type CardPeople = {
  subject: Pick<BotSubject, 'student_id' | 'tutor_id'> &
    Partial<Pick<BotSubject, 'session_id' | 'package_id'>>;
};

type AnyMessage = Pick<
  LocalMessage | MessageResponse,
  'user' | 'bot' | 'assistant'
>;

/** A message the bot posted (as the Nafham Support member) */
export const isBotMessage = (message?: AnyMessage | null): boolean =>
  !!message && message.bot === true && isAdminUser(message.user?.id);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/** Only a path under the API base: a message never sends the token elsewhere */
export const isSafeApiPath = (path: unknown): path is string =>
  typeof path === 'string' &&
  path.startsWith('/') &&
  !path.startsWith('//') &&
  !path.includes('://');

/** A button the app can render and run; anything else on the card is dropped */
const isWellFormedAction = (action: unknown): action is BotAction => {
  if (!isRecord(action) || typeof action.id !== 'string') return false;
  if (!isRecord(action.label)) return false;
  const call = action.call;
  if (!isRecord(call)) return false;
  if (call.kind === 'api') {
    return (
      (call.method === 'POST' || call.method === 'PATCH') &&
      isSafeApiPath(call.path) &&
      (call.body === undefined || isRecord(call.body))
    );
  }
  return call.kind === 'open' && typeof call.screen === 'string';
};

/** The card on a bot message, when it carries a version we understand */
export const assistantCardOf = (
  message?: AnyMessage | null,
): AssistantCard | null => {
  if (!isBotMessage(message)) return null;
  const card = message?.assistant;
  if (!card || card.v !== 1 || !isRecord(card.subject)) return null;
  const { student_id, tutor_id } = card.subject;
  if (
    !Number.isFinite(Number(student_id)) ||
    !Number.isFinite(Number(tutor_id))
  )
    return null;
  const actions = Array.isArray(card.actions)
    ? card.actions.filter(isWellFormedAction)
    : [];
  return { ...card, actions };
};

/** Arabic label when the UI is in Arabic, English otherwise */
export const pickLabel = (label: BotLabel | undefined, lang: string): string =>
  (lang.startsWith('ar') ? label?.ar : label?.en) || label?.en || '';

/** The viewer's side: the tutor by id, anyone else (student, parent) is the student side */
export const viewerRole = (
  card: CardPeople,
  userId: number | string | undefined,
): BotRole =>
  userId !== undefined &&
  userId !== null &&
  Number(userId) === Number(card.subject.tutor_id)
    ? 'tutor'
    : 'student';

/** The buttons this side may press on an open card */
export const visibleActions = (
  card: AssistantCard,
  role: BotRole,
): BotAction[] =>
  card.state === 'open'
    ? card.actions.filter((a) => a.for_role === 'any' || a.for_role === role)
    : [];

/**
 * A parent acting for a child names the child on the call; the student
 * and the tutor themselves send nothing extra.
 */
export const childHeaderFor = (
  card: CardPeople,
  userId: number | string | undefined,
): Record<string, string> | undefined => {
  if (userId === undefined || userId === null) return undefined;
  const id = Number(userId);
  if (
    id === Number(card.subject.student_id) ||
    id === Number(card.subject.tutor_id)
  ) {
    return undefined;
  }
  return { 'X-Child-Id': String(card.subject.student_id) };
};

/** The hand-off to a person: the card stays open after it */
export const isHandoff = (action: BotAction): boolean =>
  action.id === 'talk_to_person' ||
  (action.call?.kind === 'api' && action.call.path.endsWith('/handoff'));

/** The time an accept button picks, when it is one */
export const acceptTimeOf = (action: BotAction): string | null => {
  if (action.call?.kind !== 'api') return null;
  const start = (action.call as BotApiCall).body?.start_time;
  return typeof start === 'string' ? start : null;
};

/** Same instant, whatever the ISO spelling ("…:00Z" vs "…:00.000Z") */
export const sameTime = (a: string, b: string): boolean => {
  const left = new Date(a).getTime();
  return !Number.isNaN(left) && left === new Date(b).getTime();
};

/** Stream's channel id without the "messaging:" type prefix */
export const channelIdOf = (cidOrId: string): string =>
  cidOrId.includes(':') ? cidOrId.slice(cidOrId.indexOf(':') + 1) : cidOrId;
