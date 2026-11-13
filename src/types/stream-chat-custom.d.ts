/**
 * Custom fields the backend stores on Stream Chat objects (module
 * augmentation). See https://getstream.io/chat/docs/sdk/react/ → "Custom
 * data types".
 */
import 'stream-chat';

/**
 * Nafham Assistant cards: a bot message carries one `assistant` object
 * with the buttons each side may press. Every button holds the exact API
 * call (method + path relative to the v1 base + body) or names an app
 * screen to open; the server updates the same message once it is answered.
 * Re-exported from src/lib/chat-actions.ts.
 */
export type BotRole = 'student' | 'tutor';

export interface BotLabel {
  en: string;
  ar: string;
}

export interface BotSubject {
  type:
    | 'reschedule_request'
    | 'schedule_change_request'
    | 'package_freeze'
    | 'session'
    | 'conversation';
  id: number;
  slug: string;
  session_id?: number;
  package_id?: number;
  student_id: number;
  tutor_id: number;
}

export type BotScreen =
  | 'propose_move'
  | 'cancel_session'
  | 'freeze_package'
  | 'propose_schedule_change'
  | 'book_session';

export interface BotApiCall {
  kind: 'api';
  method: 'PATCH' | 'POST';
  path: string;
  body?: Record<string, unknown>;
}

export interface BotOpenCall {
  kind: 'open';
  screen: BotScreen;
  params: {
    session_id?: number;
    package_id?: number;
    tutor_id?: number;
    grade_subject_id?: number;
  };
}

export interface BotAction {
  id: string;
  for_role: BotRole | 'any';
  style: 'primary' | 'secondary' | 'danger' | 'link';
  label: BotLabel;
  /** Takes an optional free-text reason (body key `reason`) */
  reason?: true;
  call: BotApiCall | BotOpenCall;
}

export interface AssistantCard {
  v: 1;
  kind: 'proposal' | 'prompt' | 'result' | 'nudge';
  state: 'open' | 'answered' | 'expired' | 'superseded';
  subject: BotSubject;
  expires_at?: string;
  actions: BotAction[];
  /** Set once answered; also on an open result card that offers a next step */
  answered?: null | {
    status: string;
    by_role: BotRole | 'system';
    at: string;
  };
  /** The server's outcome line, shown under the bubble whenever present */
  outcome?: BotLabel | null;
}

declare module 'stream-chat' {
  interface CustomChannelData {
    /** "lesson" (student + instructor) or "support" (one person + Nafham Support) */
    kind?: 'lesson' | 'support';
    /** Course the conversation is about, set when it is created. */
    subject?: string;
    /** Our ids of the people in the conversation */
    student_id?: number;
    tutor_id?: number;
    user_id?: number;
  }

  interface CustomUserData {
    /** "student" | "instructor" | "admin", mirrored from the backend. */
    nafham_role?: string;
  }

  interface CustomMessageData {
    /** An announcement from Nafham Support (the welcome message, a lesson change) */
    system?: boolean;
    template?: string;
    /** Where in the app the announcement points (e.g. "/requests") */
    path?: string;
    session_id?: number;
    reschedule_request_id?: number;
    package_id?: number;
    package_freeze_id?: number;
    schedule_change_request_id?: number;
    /** Posted by the Nafham Assistant bot (as the Nafham Support member) */
    bot?: boolean;
    /**
     * The lesson bot's card (state, subject and buttons), or `true` on a
     * message from the support chat's assistant
     */
    assistant?: AssistantCard | true;
    /** The choices the assistant offers; tapping one answers it */
    options?: Array<{ id: string; label: string }>;
    /** Pages the assistant points at (a payment page, a page of the app) */
    links?: Array<{ label: string; url: string }>;
  }
}
