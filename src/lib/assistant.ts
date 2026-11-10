import type { LocalMessage, MessageResponse } from 'stream-chat';

import { post } from '../assets/utils/api';
import { localTimeZone } from '../modules/trial/trial.types';

/**
 * The Nafham Assistant: a bot in the support conversation that books free
 * trials, sells courses and renews packages. Messages travel through
 * Stream as usual; every one the person sends in that conversation (typed,
 * or an option tapped) is also posted here, and the assistant answers
 * inside the conversation as Nafham Support with `assistant: true` on the
 * message.
 */

export interface AssistantTurn {
  /** The words typed, or the label of the option tapped */
  text?: string;
  /** The id of the option tapped */
  choice?: string;
  /** The support thread was opened: greet when due, else nothing */
  open?: boolean;
  /** The app's language ("en" | "ar") */
  locale: string;
}

export interface AssistantTurnResult {
  handled: boolean;
}

export const sendAssistantTurn = async (
  turn: AssistantTurn,
): Promise<AssistantTurnResult> => {
  const response = await post('/assistant/turns', {
    ...turn,
    time_zone: localTimeZone(),
    client: 'web',
  });
  return (response.data?.data ?? { handled: false }) as AssistantTurnResult;
};

export const isAssistantMessage = (
  message?: LocalMessage | MessageResponse | null,
): boolean => message?.assistant === true;
