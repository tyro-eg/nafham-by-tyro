import { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Button,
  CircularProgress,
  TextField,
  type ButtonProps,
} from '@mui/material';
import {
  CheckCircleRounded,
  HistoryToggleOffRounded,
} from '@mui/icons-material';

import {
  acceptTimeOf,
  pickLabel,
  sameTime,
  viewerRole,
  visibleActions,
  type AssistantCard,
  type BotAction,
} from '../../lib/chat-actions';
import {
  clearAnsweredHere,
  useAnsweredHere,
  useChatAction,
} from '../../hooks/useChatAction';
import {
  changeErrorMessage,
  remainingOptions,
  type TimeWindow,
} from '../../hooks/useSessionChanges';

const REASON_LENGTH = 500;

/** Server style → MUI button */
const BUTTON_PROPS: Record<BotAction['style'], ButtonProps> = {
  primary: { variant: 'contained', color: 'primary' },
  secondary: { variant: 'outlined', color: 'secondary' },
  danger: { variant: 'outlined', color: 'error' },
  link: { variant: 'text', color: 'primary' },
};

interface BotActionRowProps {
  card: AssistantCard;
  messageId: string;
  channelId?: string;
  userId?: number;
}

/**
 * The buttons of a Nafham Assistant card, for the viewer's side: one tap
 * runs the call the server put on the button; a decline (or any danger or
 * reason button) asks again first, with an optional reason. The server's
 * outcome line shows whenever the card has one, above any next-step buttons;
 * once answered the server updates the message and only that line stays.
 */
const BotActionRow: FC<BotActionRowProps> = ({
  card,
  messageId,
  channelId,
  userId,
}) => {
  const { t, i18n } = useTranslation();
  const role = viewerRole(card, userId);
  const answeredHere = useAnsweredHere(messageId);
  const { run, pendingActionId, error, remaining, reset } =
    useChatAction(channelId);
  const [confirming, setConfirming] = useState<BotAction | null>(null);
  const [reason, setReason] = useState('');
  // The times still open after a taken one, until the server re-posts the card
  const [stillOpen, setStillOpen] = useState<TimeWindow[] | null>(null);

  useEffect(() => {
    const left = remainingOptions(error);
    if (left) setStillOpen(left);
  }, [error]);

  // The server replaced or settled the card: the local narrowing and the
  // refusal it came with are history
  useEffect(() => {
    if (card.state === 'open') return;
    setStillOpen(null);
    reset();
  }, [card.state, reset]);

  // The server's update landed: forget the local "answered" mark (also
  // when the mark arrives after the update, the call being slower than
  // Stream's event)
  useEffect(() => {
    if (card.state !== 'open' && answeredHere) clearAnsweredHere(messageId);
  }, [answeredHere, card.state, messageId]);

  // Every time was taken: the server closes the request as expired and
  // replaces the card; until then nothing here may be pressed
  const allTaken = stillOpen !== null && stillOpen.length === 0;

  const actions = useMemo(() => {
    const all = visibleActions(card, role);
    if (!stillOpen) return all;
    if (!stillOpen.length) return [];
    // A time was just taken: keep only the accept buttons still open
    return all.filter((action) => {
      const start = acceptTimeOf(action);
      return !start || stillOpen.some((w) => sameTime(w.start_time, start));
    });
  }, [card, role, stillOpen]);

  // Pressed here: the buttons hide until the server updates the card
  const pressedHere = answeredHere && card.state === 'open';
  const fallbackKey = (() => {
    if (allTaken && card.state === 'open')
      return 'SESSION_CHANGES.CHAT.EXPIRED';
    if (card.kind === 'result') return null;
    if (card.state === 'answered') {
      return card.answered?.by_role === role
        ? 'SESSION_CHANGES.CHAT.YOU_ANSWERED'
        : 'SESSION_CHANGES.CHAT.ANSWERED';
    }
    if (card.state === 'expired') return 'SESSION_CHANGES.CHAT.EXPIRED';
    if (card.state === 'superseded') return 'SESSION_CHANGES.CHAT.SUPERSEDED';
    return null;
  })();
  // The server's outcome line first (it can sit on an open card that
  // offers a next step), the local wording only as a fallback
  const outcomeText = pressedHere
    ? t('SESSION_CHANGES.CHAT.YOU_ANSWERED')
    : pickLabel(card.outcome ?? undefined, i18n.language) ||
      (fallbackKey ? t(fallbackKey) : '');
  const settled = pressedHere || !!card.answered;
  const showButtons =
    card.state === 'open' && !pressedHere && actions.length > 0;
  // A taken time with others still open is a warning; with none left the
  // server's own sentence says what happened
  const errorText = error
    ? remaining?.length
      ? t('SESSION_CHANGES.CHAT.OPTION_TAKEN')
      : changeErrorMessage(error, t('SESSION_CHANGES.CHAT.ERROR'))
    : null;
  const errorLine = errorText ? (
    <Alert
      severity={remaining?.length ? 'warning' : 'error'}
      className="bot-actions__error"
    >
      {errorText}
    </Alert>
  ) : null;

  const outcomeLine = outcomeText ? (
    <p className="bot-actions__outcome" dir="auto">
      {settled ? (
        <CheckCircleRounded aria-hidden="true" />
      ) : (
        <HistoryToggleOffRounded aria-hidden="true" />
      )}
      {outcomeText}
    </p>
  ) : null;

  if (!showButtons) {
    return (
      <>
        {outcomeLine}
        {allTaken && errorLine && (
          <div className="bot-actions">{errorLine}</div>
        )}
      </>
    );
  }

  const busy = pendingActionId !== null;
  const people = card;

  const press = async (action: BotAction, withReason?: string) => {
    const ok = await run(action, people, { messageId, reason: withReason });
    if (ok) {
      setConfirming(null);
      setReason('');
    }
  };

  const onClick = (action: BotAction) => {
    reset();
    if (
      action.call.kind === 'api' &&
      (action.reason || action.style === 'danger')
    ) {
      setConfirming(action);
      return;
    }
    press(action);
  };

  return (
    <>
      {outcomeLine}
      <div className="bot-actions">
        {confirming ? (
          <div className="bot-actions__confirm">
            {confirming.reason && (
              <TextField
                className="bot-actions__reason"
                size="small"
                fullWidth
                multiline
                minRows={2}
                label={t('SESSION_CHANGES.CHAT.REASON_OPTIONAL')}
                value={reason}
                onChange={(event) =>
                  setReason(event.target.value.slice(0, REASON_LENGTH))
                }
                inputProps={{ maxLength: REASON_LENGTH, dir: 'auto' }}
              />
            )}
            <div className="bot-actions__buttons">
              <Button
                size="small"
                variant="contained"
                color={confirming.style === 'danger' ? 'error' : 'primary'}
                disabled={busy}
                startIcon={
                  pendingActionId === confirming.id ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : undefined
                }
                onClick={() => press(confirming, reason)}
              >
                {t('SESSION_CHANGES.CHAT.CONFIRM', {
                  action: pickLabel(confirming.label, i18n.language),
                })}
              </Button>
              <Button
                size="small"
                variant="text"
                disabled={busy}
                onClick={() => {
                  reset();
                  setConfirming(null);
                  setReason('');
                }}
              >
                {t('TRIAL_OFFERS.BACK')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="bot-actions__buttons">
            {actions.map((action) => (
              <Button
                key={action.id}
                size="small"
                {...BUTTON_PROPS[action.style]}
                className={`bot-actions__button bot-actions__button--${action.style}`}
                disabled={busy}
                startIcon={
                  pendingActionId === action.id ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : undefined
                }
                onClick={() => onClick(action)}
              >
                <span dir="auto">{pickLabel(action.label, i18n.language)}</span>
              </Button>
            ))}
          </div>
        )}

        {errorLine}
      </div>
    </>
  );
};

export default BotActionRow;
