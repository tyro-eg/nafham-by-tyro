/**
 * What the activation page (/activate/<token>) works out for itself.
 *
 * The code step is remembered per link for as long as the tab lives: a
 * family asks for the code, switches to WhatsApp to read it, and the browser
 * often reloads the page when they come back. Without the memory the page
 * offered only "Send code" again, which the server refuses for a minute and
 * which then replaces the code they already hold.
 */
const ASKED_PREFIX = 'nafham.activateCode.';
/** The server sends another code a minute after the last (RESEND_AFTER) */
export const RESEND_SECONDS = 60;

/** The link's end is enough to tell links apart; the token is not copied */
const askedKey = (token: string) => ASKED_PREFIX + token.slice(-24);

/** A code was asked for with this link, now */
export const rememberCodeAsked = (token: string, now = Date.now()): void => {
  try {
    sessionStorage.setItem(askedKey(token), String(now));
  } catch {
    // No storage: a reload starts from "Send code", as before
  }
};

/** When a code was last asked for with this link in this tab, or null */
export const codeAskedAt = (token: string): number | null => {
  try {
    const at = Number(sessionStorage.getItem(askedKey(token)));
    return Number.isFinite(at) && at > 0 ? at : null;
  } catch {
    return null;
  }
};

/** The account is active: nothing left to remember */
export const forgetCodeAsked = (token: string): void => {
  try {
    sessionStorage.removeItem(askedKey(token));
  } catch {
    // Nothing to forget
  }
};

/** Seconds until another code may be asked for (0 = now) */
export const resendWait = (
  askedAt: number | null,
  now = Date.now(),
): number => {
  if (askedAt === null) return 0;
  const left = RESEND_SECONDS - Math.floor((now - askedAt) / 1000);
  return Math.min(RESEND_SECONDS, Math.max(0, left));
};

/**
 * Why the server refused (Accounts::Activation's `code`). Each has a
 * sentence of ours in both languages (ACTIVATE.ERRORS.<CODE>): the server's
 * own words are English only.
 */
export const ACTIVATION_CODES = [
  'active',
  'no_code_needed',
  'too_soon',
  'too_many',
  'undelivered',
  'no_code',
  'expired',
  'locked',
  'wrong_code',
  'invalid',
] as const;
export type ActivationCode = (typeof ACTIVATION_CODES)[number];

/** What the page says: a sentence of ours (its key), or the server's words */
export type ActivationProblem = { key: string } | { text: string };

export interface ActivationFailure {
  /** The server's reason, when it is one the page knows */
  code: ActivationCode | null;
  problem: ActivationProblem;
  /** Nothing is wrong with the link or what was typed: asking again may work */
  retry: boolean;
}

/**
 * What went wrong with a request of the activation page. `during`: the
 * first load of the link, or something the person pressed.
 */
export const activationFailure = (
  err: unknown,
  during: 'load' | 'action',
): ActivationFailure => {
  const general = {
    key: during === 'load' ? 'ACTIVATE.LOAD_FAILED' : 'ACTIVATE.TRY_AGAIN',
  };
  const response = (
    err as {
      response?: {
        status?: number;
        data?: { errors?: unknown; code?: unknown } | null;
      };
    } | null
  )?.response;
  // No answer at all (offline, timed out): the link itself may be fine
  if (!response) {
    return {
      code: null,
      problem: {
        key:
          during === 'load'
            ? 'ACTIVATE.LOAD_FAILED'
            : 'ACTIVATE.ERRORS.NETWORK',
      },
      retry: true,
    };
  }

  const code = ACTIVATION_CODES.find((known) => known === response.data?.code);
  if (code) {
    return {
      code,
      problem: { key: `ACTIVATE.ERRORS.${code.toUpperCase()}` },
      retry: false,
    };
  }
  // The link is wrong or too old
  if (response.status === 404) {
    return { code: null, problem: { key: 'ACTIVATE.BAD_LINK' }, retry: false };
  }

  const errors = response.data?.errors;
  const first = Array.isArray(errors) ? errors[0] : null;
  const retry = (response.status ?? 0) >= 500;
  // A reason this page does not know yet: the server's words beat none
  if (typeof first === 'string' && first.trim()) {
    return { code: null, problem: { text: first.trim() }, retry };
  }
  return { code: null, problem: general, retry };
};
