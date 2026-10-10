/**
 * Local demo mode (development server only).
 *
 * Lets you browse the logged-in pages with sample data and no account:
 *   http://localhost:4200/?demo=student   sign in as a sample student
 *   http://localhost:4200/?demo=tutor     sign in as a sample tutor
 *   http://localhost:4200/?demo=off       leave demo mode
 *
 * While active, every API request is answered locally from
 * `demo-fixtures.ts`; nothing is sent to the backend. This module is
 * only imported behind `import.meta.env.DEV` in `src/index.tsx`, so it
 * is never part of a production build.
 */
import axios, { AxiosAdapter, AxiosResponse } from 'axios';

import store, { persistor } from '../redux/store';
import { clearCurrentUser, setCurrentUser } from '../redux/user/user.slice';
import { queryClient } from '../lib/queryClient';
import {
  DEMO_EMAIL_DOMAIN,
  demoUsers,
  resolveDemoRequest,
} from './demo-fixtures';

export type DemoRole = 'student' | 'tutor';

const SESSION_KEY = 'tyro.demo';
const TOKEN_KEYS = [
  'tyro.token',
  'tyro.refreshToken',
  'tyro.expireAt',
  'tyro.type',
  'tyro.id',
];

const readRoleFromUrl = (): DemoRole | 'off' | null => {
  const value = new URLSearchParams(window.location.search).get('demo');
  if (value === 'student' || value === 'tutor' || value === 'off') {
    return value;
  }
  return null;
};

const stripDemoParam = () => {
  const url = new URL(window.location.href);
  url.searchParams.delete('demo');
  window.history.replaceState(null, '', url.toString());
};

const waitForRehydration = () =>
  new Promise<void>((resolve) => {
    if (persistor.getState().bootstrapped) {
      resolve();
      return;
    }
    const unsubscribe = persistor.subscribe(() => {
      if (persistor.getState().bootstrapped) {
        unsubscribe();
        resolve();
      }
    });
  });

const isDemoUserStored = () =>
  !!store.getState().user.currentUser?.email.endsWith(DEMO_EMAIL_DOMAIN);

const clearDemoUser = () => {
  TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
  store.dispatch(clearCurrentUser());
  queryClient.clear();
};

const demoAdapter: AxiosAdapter = async (config) => {
  const method = (config.method || 'get').toUpperCase();
  const url = new URL(axios.getUri(config));
  const role = sessionStorage.getItem(SESSION_KEY) as DemoRole;
  const {
    status = 200,
    data = {},
    headers = {},
  } = resolveDemoRequest(
    method,
    url.pathname.replace(/^.*\/api\/v1/, ''),
    url.searchParams,
    role,
    config.data,
  );
  // Small delay so loading states look natural
  await new Promise((r) => setTimeout(r, 150));
  const response: AxiosResponse = {
    data,
    status,
    statusText: String(status),
    headers,
    config,
    request: {},
  };
  if (status >= 400) {
    // eslint-disable-next-line no-console
    console.warn(`[demo] ${method} ${url.pathname} -> ${status}`);
    return Promise.reject(
      Object.assign(new Error(`Demo request failed (${status})`), {
        isAxiosError: true,
        config,
        response,
      }),
    );
  }
  return response;
};

const showBadge = (role: DemoRole) => {
  const badge = document.createElement('a');
  badge.href = '/?demo=off';
  badge.title = 'Sample data only. Click to leave demo mode.';
  badge.textContent = `Demo mode: ${role} (sample data) · exit`;
  Object.assign(badge.style, {
    position: 'fixed',
    insetInlineStart: '16px',
    bottom: '16px',
    zIndex: '2000',
    padding: '8px 14px',
    borderRadius: '999px',
    background: '#161c2d',
    color: '#fff',
    font: '600 13px/1.2 Inter, Arial, sans-serif',
    textDecoration: 'none',
    boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
  });
  document.body.appendChild(badge);
};

/**
 * Applies demo mode before the app renders. Resolves once the store
 * holds the right user (or none), so guarded routes don't bounce.
 */
export async function setupDemoMode(): Promise<void> {
  await waitForRehydration();

  const fromUrl = readRoleFromUrl();
  if (fromUrl) {
    stripDemoParam();
    if (fromUrl === 'off') {
      sessionStorage.removeItem(SESSION_KEY);
      if (isDemoUserStored()) clearDemoUser();
      return;
    }
    sessionStorage.setItem(SESSION_KEY, fromUrl);
  }

  const role = sessionStorage.getItem(SESSION_KEY) as DemoRole | null;
  if (!role) {
    // A demo user left over from another tab must not hit the real API
    if (isDemoUserStored()) clearDemoUser();
    return;
  }

  axios.defaults.adapter = demoAdapter;

  const user = demoUsers[role];
  const current = store.getState().user.currentUser;
  if (current?.id !== user.id || current?.type !== user.type) {
    queryClient.clear();
  }
  localStorage.setItem('tyro.token', 'demo-token');
  localStorage.setItem('tyro.refreshToken', 'demo-refresh');
  localStorage.setItem('tyro.type', user.type);
  localStorage.setItem('tyro.id', String(user.id));
  store.dispatch(setCurrentUser(user));

  if (document.body) showBadge(role);
  else window.addEventListener('DOMContentLoaded', () => showBadge(role));
}
