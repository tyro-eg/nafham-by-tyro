import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Button, InputLabel, TextField as MuiTextField } from '@mui/material';
import { WhatsApp } from '@mui/icons-material';
import LanguageSelector from '../../../component/i18next/LanguageSelector';
import logo from '../../../assets/images/logo.png';
import { get, post } from '../../../assets/utils/api';
import { useSignIn } from '../../../hooks/useAuth';
import { useAppDispatch } from '../../../redux/store';
import { clearCurrentUser } from '../../../redux/user/user.slice';
import { clearAuthStorage } from '../../../lib/auth-storage';
import { setActiveChildId } from '../../../lib/family-child';
import { getHomePath } from '../../../assets/utils/home-path';
import { useRtlClass } from '../../../assets/utils/utils';
import {
  RESEND_SECONDS,
  activationFailure,
  codeAskedAt,
  forgetCodeAsked,
  rememberCodeAsked,
  resendWait,
  type ActivationProblem,
} from './activate.utils';
import '../signin/signin.styles.scss';
import '../../../component/login/login.styles.scss';

/**
 * Activate an account sales made (22 Nov 2026): the WhatsApp message brings
 * the family here (/activate/<token>). A one-time code goes to that phone on
 * WhatsApp; with the code and a password of their own the account is active
 * and they are signed in. Until then the account cannot sign in.
 *
 * Teachers made in Nafham System (23 Nov 2026) come here from an email
 * (channel "email"): the link proves the email, so there is no code, only
 * a password of their own.
 */
type Info = {
  first_name: string;
  phone: string;
  state: 'pending' | 'active';
  email: string | null;
  channel?: 'whatsapp' | 'email';
};

const Activate: FC = () => {
  const { t } = useTranslation();
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const rtlClass = useRtlClass();
  const signIn = useSignIn();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const [info, setInfo] = useState<Info | null>(null);
  // Kept as a key, so the sentence follows the language switch
  const [problem, setProblem] = useState<ActivationProblem | null>(null);
  // The first load failed for a reason other than the link: offer it again
  const [canRetry, setCanRetry] = useState(false);
  const [attempt, setAttempt] = useState(0);
  // A code asked for before a reload: the code step again, not "Send code"
  const [step, setStep] = useState<'intro' | 'code'>(() =>
    codeAskedAt(token) === null ? 'intro' : 'code',
  );
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  // Where the code just went; unknown after a reload
  const [sent, setSent] = useState<{ phone: string; minutes: number } | null>(
    null,
  );
  const [wait, setWait] = useState(() => resendWait(codeAskedAt(token)));

  useEffect(() => {
    let stale = false;
    setProblem(null);
    setCanRetry(false);
    get(`/activations/${encodeURIComponent(token)}`)
      .then((res) => {
        if (!stale) setInfo(res.data.data);
      })
      .catch((err) => {
        if (stale) return;
        // "Bad link" only when the server says so; a dropped connection is
        // "could not load, try again"
        const failure = activationFailure(err, 'load');
        setProblem(failure.problem);
        setCanRetry(failure.retry);
      });
    return () => {
      stale = true;
    };
  }, [token, attempt]);

  // A minute before another code can be asked for
  useEffect(() => {
    if (wait <= 0) return undefined;
    const timer = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  // The server says the account is active: the page offers sign in
  const showActive = () => {
    forgetCodeAsked(token);
    setInfo((known) => (known ? { ...known, state: 'active' } : known));
  };

  const sendCode = async () => {
    setBusy(true);
    setProblem(null);
    try {
      const res = await post(
        `/activations/${encodeURIComponent(token)}/code`,
        {},
      );
      rememberCodeAsked(token);
      setSent({
        phone: res.data.data.sent_to,
        minutes: res.data.data.expires_in_minutes,
      });
      setStep('code');
      setWait(RESEND_SECONDS);
    } catch (err) {
      const failure = activationFailure(err, 'action');
      if (failure.code === 'active') return showActive();
      if (failure.code === 'too_soon') {
        // A code is on its way or already there (asked from another tab):
        // show where to type it
        if (codeAskedAt(token) === null) rememberCodeAsked(token);
        setStep('code');
        setWait(resendWait(codeAskedAt(token)) || RESEND_SECONDS);
      }
      setProblem(failure.problem);
    } finally {
      setBusy(false);
    }
  };

  const byEmail = info?.channel === 'email';

  const activate = async () => {
    setProblem(null);
    if (!byEmail && !/^\d{6}$/.test(code.replace(/\D/g, '')))
      return setProblem({ key: 'ACTIVATE.CODE_FORMAT' });
    if (password.length < 6)
      return setProblem({ key: 'ACTIVATE.PASSWORD_SHORT' });
    if (password !== confirm)
      return setProblem({ key: 'ACTIVATE.PASSWORD_MISMATCH' });
    setBusy(true);
    try {
      const res = await post(`/activations/${encodeURIComponent(token)}`, {
        code: byEmail ? undefined : code.replace(/\D/g, ''),
        password,
        password_confirmation: confirm,
      });
      forgetCodeAsked(token);
      // The link can be opened on a browser where someone else is signed in
      // (a parent's other account, or staff viewing as a customer). They
      // are not who this link is for: their session, the child they had
      // picked (sent as X-Child-Id on every request) and what was loaded
      // for them go before the new session starts.
      clearAuthStorage();
      setActiveChildId(null);
      dispatch(clearCurrentUser());
      queryClient.clear();
      const user = await signIn.mutateAsync({
        email: res.data.data.email,
        password,
      });
      navigate(getHomePath(user));
    } catch (err) {
      const failure = activationFailure(err, 'action');
      if (failure.code === 'active') return showActive();
      setProblem(failure.problem);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="signin">
      <aside className="signin__panel">
        <span className="signin__ring signin__ring--a" aria-hidden="true" />
        <span className="signin__ring signin__ring--b" aria-hidden="true" />
        <span className="signin__ring signin__ring--c" aria-hidden="true" />
        <Link to="/" className="signin__logo" aria-label="Nafham">
          <img src={logo} alt="" />
        </Link>
        <div className="signin__panel-copy">
          <h2 className="signin__headline">{t('ACTIVATE.PANEL_TITLE')}</h2>
          <p className="signin__sub">{t('ACTIVATE.PANEL_SUBTITLE')}</p>
        </div>
      </aside>

      <main className="signin__form">
        <div className="signin__top">
          <LanguageSelector />
        </div>
        <div className="signin__form-inner">
          <div className="login-container">
            <div className="login-container__header">
              <h1 className="title">
                {info
                  ? t('ACTIVATE.TITLE', { name: info.first_name })
                  : t('ACTIVATE.TITLE_PLAIN')}
              </h1>
              {info?.state === 'pending' && (
                <p className="sub-title">
                  {byEmail
                    ? t('ACTIVATE.SUBTITLE_EMAIL', { email: info.email || '' })
                    : t('ACTIVATE.SUBTITLE', { phone: info.phone })}
                </p>
              )}
            </div>

            {!info && !problem && (
              <p className="sub-title">{t('ACTIVATE.LOADING')}</p>
            )}

            {info?.state === 'active' && (
              <div className={`login-container__form ${rtlClass}`}>
                <p className="sub-title">{t('ACTIVATE.ALREADY_ACTIVE')}</p>
                <Button
                  variant="contained"
                  className="btn-custom-style"
                  onClick={() => navigate('/login')}
                  data-testid="button-go-sign-in"
                >
                  {t('ACTIVATE.GO_SIGN_IN')}
                </Button>
              </div>
            )}

            {info?.state === 'pending' && !byEmail && step === 'intro' && (
              <div className={`login-container__form ${rtlClass}`}>
                <Button
                  variant="contained"
                  className="btn-custom-style"
                  onClick={sendCode}
                  disabled={busy}
                  startIcon={<WhatsApp />}
                  data-testid="button-send-code"
                >
                  {busy ? t('ACTIVATE.SENDING') : t('ACTIVATE.SEND_CODE')}
                </Button>
              </div>
            )}

            {info?.state === 'pending' && (byEmail || step === 'code') && (
              <form
                className={`login-container__form ${rtlClass}`}
                onSubmit={(e) => {
                  e.preventDefault();
                  activate();
                }}
              >
                {!byEmail && (
                  <p className="sub-title">
                    {sent
                      ? t('ACTIVATE.CODE_SENT', sent)
                      : t('ACTIVATE.CODE_SENT_EARLIER', { phone: info.phone })}
                  </p>
                )}
                {!byEmail && (
                  <div className="auth-field">
                    <InputLabel htmlFor="code">{t('ACTIVATE.CODE')}</InputLabel>
                    <MuiTextField
                      id="code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="123456"
                      inputProps={{
                        inputMode: 'numeric',
                        autoComplete: 'one-time-code',
                        maxLength: 7,
                      }}
                      variant="outlined"
                      className="custom-input-style"
                      fullWidth
                      data-testid="input-activation-code"
                    />
                  </div>
                )}
                <div className="auth-field">
                  <InputLabel htmlFor="new-password">
                    {t('ACTIVATE.PASSWORD')}
                  </InputLabel>
                  <MuiTextField
                    id="new-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    inputProps={{ autoComplete: 'new-password' }}
                    variant="outlined"
                    className="custom-input-style"
                    fullWidth
                    data-testid="input-activation-password"
                  />
                </div>
                <div className="auth-field">
                  <InputLabel htmlFor="confirm-password">
                    {t('ACTIVATE.CONFIRM')}
                  </InputLabel>
                  <MuiTextField
                    id="confirm-password"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    inputProps={{ autoComplete: 'new-password' }}
                    variant="outlined"
                    className="custom-input-style"
                    fullWidth
                    data-testid="input-activation-confirm"
                  />
                </div>
                <Button
                  type="submit"
                  variant="contained"
                  className="btn-custom-style"
                  disabled={busy}
                  data-testid="button-activate"
                >
                  {busy
                    ? t('ACTIVATE.ACTIVATING')
                    : byEmail
                      ? t('ACTIVATE.SET_PASSWORD')
                      : t('ACTIVATE.ACTIVATE')}
                </Button>
                {!byEmail && (
                  <Button
                    variant="text"
                    onClick={sendCode}
                    disabled={busy || wait > 0}
                    data-testid="button-new-code"
                  >
                    {wait > 0
                      ? t('ACTIVATE.NEW_CODE_IN', { seconds: wait })
                      : t('ACTIVATE.NEW_CODE')}
                  </Button>
                )}
              </form>
            )}

            {problem && (
              <p
                className="sub-title"
                role="alert"
                style={{ color: '#c62828' }}
                data-testid="text-activation-problem"
              >
                {'key' in problem ? t(problem.key) : problem.text}
              </p>
            )}

            {!info && canRetry && (
              <div className={`login-container__form ${rtlClass}`}>
                <Button
                  variant="contained"
                  className="btn-custom-style"
                  onClick={() => setAttempt((count) => count + 1)}
                  data-testid="button-activation-retry"
                >
                  {t('ACTIVATE.RETRY')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Activate;
