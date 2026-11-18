/**
 * Where the signed-in session lives in this browser. Kept free of the store
 * and the API client, so the entry point can clear it before either loads.
 */
export const AUTH_KEYS = {
  TOKEN: 'tyro.token',
  REFRESH_TOKEN: 'tyro.refreshToken',
  EXPIRE_AT: 'tyro.expireAt',
  TYPE: 'tyro.type',
  ID: 'tyro.id',
} as const;

/** The redux-persist entry holding the signed-in user */
export const PERSISTED_USER_KEY = 'persist:root';

export interface SessionTokens {
  accessToken?: string | null;
  refreshToken?: string | null;
  expireAt?: string | null;
}

/** Saves whichever tokens came back; a missing one keeps its stored value */
export const saveTokens = ({
  accessToken,
  refreshToken,
  expireAt,
}: SessionTokens) => {
  if (accessToken) localStorage.setItem(AUTH_KEYS.TOKEN, accessToken);
  if (refreshToken) localStorage.setItem(AUTH_KEYS.REFRESH_TOKEN, refreshToken);
  if (expireAt) localStorage.setItem(AUTH_KEYS.EXPIRE_AT, expireAt);
};

/** Forgets the session; with `persistedUser`, the stored user too */
export const clearAuthStorage = ({ persistedUser = false } = {}) => {
  try {
    Object.values(AUTH_KEYS).forEach((key) => localStorage.removeItem(key));
    if (persistedUser) localStorage.removeItem(PERSISTED_USER_KEY);
  } catch {
    // storage unavailable: nothing was kept
  }
};
