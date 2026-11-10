import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  ArrowForwardRounded,
  CampaignRounded,
  ShieldRounded,
  SmartToyRounded,
} from '@mui/icons-material';
import {
  MessageUI,
  useChannelStateContext,
  useMessageContext,
  type MessageUIComponentProps,
} from 'stream-chat-react';

import { isAdminUser } from '../../lib/streamChat';
import { assistantCardOf, isBotMessage } from '../../lib/chat-actions';
import { isAssistantMessage } from '../../lib/assistant';
import AssistantOptions from './assistant-options.component';
import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import BotActionRow from './bot-action-row.component';

/** Announcements that point somewhere in the app, by template */
const PATH_LABELS: Record<string, string> = {
  move_proposed: 'SESSION_CHANGES.CHAT.ANSWER',
  schedule_change_proposed: 'SESSION_CHANGES.CHAT.ANSWER',
  freeze_created: 'SESSION_CHANGES.CHAT.PACKAGES',
  freeze_resumed: 'SESSION_CHANGES.CHAT.SESSIONS',
  freeze_cancelled: 'SESSION_CHANGES.CHAT.PACKAGES',
};

/**
 * Stream's message UI wrapped so messages from the Nafham admin get a
 * "Nafham Support · Admin" label and their own styling, and the backend's
 * announcements (the welcome message, lesson changes) read as such, with a
 * button to where they point when they carry a path. The Nafham Assistant
 * bot's messages are labelled as such and carry their card's buttons; the
 * support chat's assistant carries its options and links.
 */
const NafhamMessageUI: FC<MessageUIComponentProps> = (props) => {
  const { t } = useTranslation();
  const { message } = useMessageContext();
  const { channel, messages } = useChannelStateContext('NafhamMessageUI');
  const userId = useAppSelector(selectCurrentUser)?.id;
  const fromAdmin = isAdminUser(message?.user?.id);
  const helper = fromAdmin && isAssistantMessage(message);
  const bot = isBotMessage(message) || helper;
  // The helper's options stay on its last message until Nafham (the bot or
  // a person) says something newer; the person's own replies in between do
  // not take them away
  const lastFromNafham = helper
    ? messages
        ?.slice()
        .reverse()
        .find((m) => isAdminUser(m.user?.id))
    : undefined;
  const latest =
    lastFromNafham !== undefined && lastFromNafham.id === message?.id;
  const card = assistantCardOf(message);
  const cardOpen = card?.state === 'open';
  const announcement = fromAdmin && !helper && message?.system === true;
  const rawPath = announcement ? message?.path : undefined;
  // No link to the chat being read, nor next to buttons that answer here
  const path =
    cardOpen || rawPath === `/messages/${channel?.id}` ? undefined : rawPath;
  const template = (message?.template as string | undefined) ?? '';
  const pathLabel = path?.startsWith('/messages/')
    ? 'SESSION_CHANGES.CHAT.OPEN_CHAT'
    : (PATH_LABELS[template] ??
      (path === '/requests'
        ? 'SESSION_CHANGES.CHAT.ANSWER'
        : path === '/my_packages'
          ? 'SESSION_CHANGES.CHAT.PACKAGES'
          : 'SESSION_CHANGES.CHAT.SESSIONS'));

  return (
    <div
      className={`nf-msg${fromAdmin ? ' nf-msg--admin' : ''}${
        announcement ? ' nf-msg--system' : ''
      }${bot ? ' nf-msg--bot' : ''}`}
    >
      {fromAdmin &&
        (bot ? (
          <span className="nf-msg__admin-label nf-msg__admin-label--bot">
            <SmartToyRounded aria-hidden="true" />
            {t('MESSAGES.ASSISTANT.NAME')}
          </span>
        ) : (
          <span className="nf-msg__admin-label">
            {announcement ? (
              <CampaignRounded aria-hidden="true" />
            ) : (
              <ShieldRounded aria-hidden="true" />
            )}
            {t('MESSAGES.NAFHAM_SUPPORT')} ·{' '}
            {announcement
              ? t('MESSAGES.ANNOUNCEMENT')
              : t('MESSAGES.ROLE.ADMIN')}
          </span>
        ))}
      <MessageUI {...props} />
      {card && message?.id && (
        <BotActionRow
          card={card}
          messageId={message.id}
          channelId={channel?.id}
          userId={userId}
        />
      )}
      {helper && (
        <AssistantOptions
          options={message.options ?? []}
          links={message.links ?? []}
          latest={latest}
        />
      )}
      {typeof path === 'string' && path.startsWith('/') && (
        <Link to={path} className="nf-msg__cta">
          {t(pathLabel)}
          <ArrowForwardRounded aria-hidden="true" />
        </Link>
      )}
    </div>
  );
};

export default NafhamMessageUI;
