import { createContext, useContext } from 'react';

/**
 * The assistant's step-by-step flows inside a lesson chat: starting one
 * shows a local bubble above the composer (never a Stream message) that
 * asks the viewer what they need, chip by chip, and only the last tap
 * calls the server. The thread provides the context; the quick actions and
 * the bot's "open" buttons start flows through it.
 */
export type PromptFlow = 'change' | 'pause' | 'weekly';

export interface PromptParams {
  /** The lesson a change is about, when known */
  session_id?: number;
  /** Skip the "move or cancel" question */
  what?: 'cancel' | 'move';
  package_id?: number;
}

export interface PromptRequest {
  flow: PromptFlow;
  params: PromptParams;
  /** Changes on every start so a flow restarts from its first step */
  key: number;
}

export interface ChatPromptValue {
  prompt: PromptRequest | null;
  start: (flow: PromptFlow, params?: PromptParams) => void;
  close: () => void;
}

export const ChatPromptContext = createContext<ChatPromptValue | null>(null);

export const useChatPrompt = () => useContext(ChatPromptContext);
