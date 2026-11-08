/**
 * Custom fields the backend stores on Stream Chat objects (module
 * augmentation). See https://getstream.io/chat/docs/sdk/react/ → "Custom
 * data types".
 */
import 'stream-chat';

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
  }
}
