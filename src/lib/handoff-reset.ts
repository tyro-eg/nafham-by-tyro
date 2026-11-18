import { clearAuthStorage } from './auth-storage';

/**
 * Imported first by the entry point, before the store rehydrates. On
 * /handoff the app is about to sign someone in, so whatever session this
 * browser kept (often long expired: the app's sign-in browser shares
 * Safari's site data) is dropped now. Otherwise its /me and token refresh
 * fail mid-handoff and the logout that follows wipes the new session.
 */
export const HANDOFF_PATH = '/handoff';

export const isHandoffPath = (pathname: string) =>
  pathname.replace(/\/+$/, '') === HANDOFF_PATH;

export const onHandoffPage = () => isHandoffPath(window.location.pathname);

if (typeof window !== 'undefined' && onHandoffPage()) {
  clearAuthStorage({ persistedUser: true });
}
