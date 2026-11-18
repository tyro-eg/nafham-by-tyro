import { FC, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, CircularProgress, IconButton } from '@mui/material';
import {
  CheckCircleRounded,
  Close,
  SmartToyRounded,
} from '@mui/icons-material';
import { useQueryClient } from '@tanstack/react-query';

import { useChatPrompt } from '../../../hooks/useChatPrompt';
import { useChatConversationActions } from '../../../hooks/useChatAction';
import { childHeaderFor } from '../../../lib/chat-actions';
import { queryKeys } from '../../../lib/queryKeys';
import { useAppSelector } from '../../../redux/store';
import { selectCurrentUser } from '../../../redux/user/user.selectors';
import ChangeFlow from './change-flow';
import PauseFlow from './pause-flow';
import WeeklyFlow from './weekly-flow';
import { DONE_MS } from './primitives';

interface AssistantPromptProps {
  channelId: string;
}

/**
 * The assistant's local bubble above the composer: a step-by-step flow
 * for the viewer only (nothing is posted until the last tap). On success
 * it says so briefly and goes; the bot's real notice then arrives.
 */
const AssistantPrompt: FC<AssistantPromptProps> = ({ channelId }) => {
  const { t, i18n } = useTranslation();
  const locale = `${i18n.language}-u-nu-latn`;
  const prompt = useChatPrompt();
  const queryClient = useQueryClient();
  const userId = useAppSelector(selectCurrentUser)?.id;
  const actions = useChatConversationActions(channelId);
  const [done, setDone] = useState<string | null>(null);

  const request = prompt?.prompt ?? null;
  const key = request?.key;
  const refresh = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.chat.actions(channelId),
      }),
    [channelId, queryClient],
  );
  // A fresh start: forget the last done line and re-read what the chat
  // offers, so the chips never show a lesson changed meanwhile
  useEffect(() => {
    setDone(null);
    if (key !== undefined) refresh();
  }, [key, refresh]);
  useEffect(() => {
    if (!done || !prompt) return undefined;
    const timer = window.setTimeout(prompt.close, DONE_MS);
    return () => window.clearTimeout(timer);
  }, [done, prompt]);

  if (!prompt || !request) return null;

  const onDone = (message: string) => {
    setDone(message);
    refresh();
  };
  const data = actions.data;
  // A parent in the child's chat acts for the child on every call
  const headers = data
    ? childHeaderFor(
        { subject: { student_id: data.student_id, tutor_id: data.tutor_id } },
        userId,
      )
    : undefined;
  const pkg = data?.package ?? null;
  const packageMissing =
    request.flow !== 'change' &&
    (!pkg ||
      (request.params.package_id && request.params.package_id !== pkg.id));
  const nothing = (
    <Alert severity="info" className="assistant-prompt__alert">
      {t('SESSION_CHANGES.CHAT.PROMPT.NOTHING')}
    </Alert>
  );

  return (
    <section className="assistant-prompt" aria-live="polite">
      <header className="assistant-prompt__header">
        <SmartToyRounded aria-hidden="true" />
        <span>{t('MESSAGES.ASSISTANT.NAME')}</span>
        <IconButton
          size="small"
          className="assistant-prompt__close"
          aria-label={t('SESSION_CHANGES.CHAT.PROMPT.CLOSE')}
          onClick={prompt.close}
        >
          <Close fontSize="small" />
        </IconButton>
      </header>
      <div className="assistant-prompt__body" key={request.key}>
        {done ? (
          <p className="assistant-prompt__done">
            <CheckCircleRounded aria-hidden="true" />
            {done}
          </p>
        ) : actions.isError ? (
          nothing
        ) : !data ? (
          <CircularProgress size={22} />
        ) : request.flow === 'change' ? (
          <ChangeFlow
            data={data}
            params={request.params}
            locale={locale}
            headers={headers}
            onDone={onDone}
            onRefused={refresh}
          />
        ) : packageMissing || !pkg ? (
          nothing
        ) : request.flow === 'pause' ? (
          <PauseFlow
            data={data}
            pkg={pkg}
            params={request.params}
            locale={locale}
            headers={headers}
            onDone={onDone}
            onRefused={refresh}
          />
        ) : (
          <WeeklyFlow
            data={data}
            pkg={pkg}
            params={request.params}
            locale={locale}
            headers={headers}
            onDone={onDone}
            onRefused={refresh}
          />
        )}
      </div>
    </section>
  );
};

export default AssistantPrompt;
