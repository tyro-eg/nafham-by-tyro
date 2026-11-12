import { FC, FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { Alert, Button, TextField } from '@mui/material';

import { post } from '@/assets/utils/api';

import './index.styles.scss';

/**
 * Public page the App Store and Google Play listings link to for account
 * deletion: how to delete from the app, and a request form for people who
 * no longer have it (POST /account_deletion_requests emails support).
 */
const DeleteAccount: FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  // Hidden from people; form-filling bots fill it and are dropped
  const [website, setWebsite] = useState('');

  const send = useMutation({
    mutationFn: () =>
      post('/account_deletion_requests', { email, message, website }),
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    send.mutate();
  };

  const s = (key: string) => t(`DELETE_ACCOUNT.${key}`);

  return (
    <div className="delete-account-page">
      <article className="delete-account-container">
        <h1 className="delete-account-title">{s('TITLE')}</h1>
        <p>{s('INTRO')}</p>

        <h2>{s('IN_APP_TITLE')}</h2>
        <ol>
          <li>{s('IN_APP_STEP_1')}</li>
          <li>{s('IN_APP_STEP_2')}</li>
          <li>{s('IN_APP_STEP_3')}</li>
        </ol>

        <h2>{s('WHAT_TITLE')}</h2>
        <ul>
          <li>{s('WHAT_PROFILE')}</li>
          <li>{s('WHAT_MESSAGES')}</li>
          <li>{s('WHAT_SESSIONS')}</li>
          <li>{s('WHAT_RECORDS')}</li>
        </ul>

        <h2>{s('FORM_TITLE')}</h2>
        <p>{s('FORM_TEXT')}</p>

        {send.isSuccess ? (
          <Alert severity="success">{s('SENT')}</Alert>
        ) : (
          <form className="delete-account-form" onSubmit={onSubmit}>
            <TextField
              label={s('EMAIL')}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              fullWidth
            />
            <TextField
              label={s('MESSAGE')}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              multiline
              minRows={3}
              inputProps={{ maxLength: 2000 }}
              fullWidth
            />
            <input
              className="delete-account-form__trap"
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
            {send.isError && <Alert severity="error">{s('FAILED')}</Alert>}
            <Button
              type="submit"
              variant="contained"
              color="error"
              size="large"
              disabled={send.isPending}
            >
              {s('SUBMIT')}
            </Button>
          </form>
        )}

        <p className="delete-account-contact">
          {s('CONTACT')}{' '}
          <a href="mailto:learn@nafhambytyro.com">learn@nafhambytyro.com</a>
        </p>
      </article>
    </div>
  );
};

export default DeleteAccount;
