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

/** The people a card is about: enough to know the viewer's side */
export type CardPeople = {
  subject: Pick<BotSubject, 'student_id' | 'tutor_id'>;
};

type AnyMessage = Pick<
  LocalMessage | MessageResponse,
  'user' | 'bot' | 'assistant'
>;

/** A message the bot posted (as the Nafham Support member) */
export const isBotMessage = (message?: AnyMessage | null): boolean =>
  !!message && message.bot === true && isAdminUser(message.user?.id);

/** The card on a bot message, when it carries a version we understand */
export const assistantCardOf = (
  message?: AnyMessage | null,
): AssistantCard | null => {
  if (!isBotMessage(message)) return null;
  const card = message?.assistant;
  if (!card || card.v !== 1 || !card.subject) return null;
  return { ...card, actions: Array.isArray(card.actions) ? card.actions : [] };
};

/** Arabic label when the UI is in Arabic, English otherwise */
export const pickLabel = (label: BotLabel | undefined, lang: string): string =>
  (lang.startsWith('ar') ? label?.ar : label?.en) || label?.en || '';

/** The viewer's side: the tutor by id, anyone else (student, parent) is the student side */
export const viewerRole = (
  card: CardPeople,
  userId: number | string | undefined,
): BotRole =>
  userId !== undefined && Number(userId) === card.subject.tutor_id
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
  const id = Number(userId);
  if (id === card.subject.student_id || id === card.subject.tutor_id) {
    return undefined;
  }
  return { 'X-Child-Id': String(card.subject.student_id) };
};

/** The hand-off to a person: the card stays open after it */
export const isHandoff = (action: BotAction): boolean =>
  action.id === 'talk_to_person' ||
  (action.call.kind === 'api' && action.call.path.endsWith('/handoff'));

/** The time an accept button picks, when it is one */
export const acceptTimeOf = (action: BotAction): string | null => {
  if (action.call.kind !== 'api') return null;
  const start = (action.call as BotApiCall).body?.start_time;
  return typeof start === 'string' ? start : null;
};

/** Stream's channel id without the "messaging:" type prefix */
export const channelIdOf = (cidOrId: string): string =>
  cidOrId.includes(':') ? cidOrId.slice(cidOrId.indexOf(':') + 1) : cidOrId;
