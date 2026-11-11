/**
 * Imported first by the entry point, before the store rehydrates. On
 * /handoff the app is about to sign someone in, so whatever session this
 * browser kept (often long expired: the app's sign-in browser shares
 * Safari's site data) is dropped now. Otherwise its /me and token refresh
 * fail mid-handoff and the logout that follows wipes the new session.
 */
export const HANDOFF_PATH = '/handoff';

export const onHandoffPage = () =>
  window.location.pathname.replace(/\/+$/, '') === HANDOFF_PATH;

if (onHandoffPage()) {
  try {
    [
      'tyro.token',
      'tyro.refreshToken',
      'tyro.expireAt',
      'tyro.type',
      'tyro.id',
      'persist:root',
    ].forEach((key) => localStorage.removeItem(key));
  } catch {
    // storage unavailable: nothing was kept to get in the way
  }
}
