/**
 * Custom fields stored on Stream Chat objects (module augmentation).
 * See https://getstream.io/chat/docs/sdk/react/ → "Custom data types".
 */
import 'stream-chat';

declare module 'stream-chat' {
  interface CustomChannelData {
    /** Course the conversation is about, set when it is created. */
    subject?: string;
  }

  interface CustomUserData {
    /** "student" | "instructor" | "admin", mirrored from the backend. */
    nafham_role?: string;
  }
}
