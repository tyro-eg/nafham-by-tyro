import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
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
import { isAssistantMessage } from '../../lib/assistant';
import AssistantOptions from './assistant-options.component';

/**
 * Stream's message UI wrapped so messages from the Nafham admin get a
 * "Nafham Support · Admin" label and their own styling, the backend's
 * announcements (the welcome message) read as such, and the Nafham
 * Assistant's messages carry its label and its buttons.
 */
const NafhamMessageUI: FC<MessageUIComponentProps> = (props) => {
  const { t } = useTranslation();
  const { message } = useMessageContext();
  const { messages } = useChannelStateContext();
  const fromAdmin = isAdminUser(message?.user?.id);
  const assistant = fromAdmin && isAssistantMessage(message);
  const announcement = fromAdmin && !assistant && message?.system === true;
  // The options stay on the assistant's last message until Nafham (the bot
  // or a person) says something newer; the person's own replies in between
  // do not take them away
  const lastFromNafham = messages
    ?.slice()
    .reverse()
    .find((m) => isAdminUser(m.user?.id));
  const latest =
    lastFromNafham !== undefined && lastFromNafham.id === message?.id;

  return (
    <div
      className={`nf-msg${fromAdmin ? ' nf-msg--admin' : ''}${
        announcement ? ' nf-msg--system' : ''
      }${assistant ? ' nf-msg--assistant' : ''}`}
    >
      {fromAdmin && (
        <span className="nf-msg__admin-label">
          {assistant ? (
            <SmartToyRounded aria-hidden="true" />
          ) : announcement ? (
            <CampaignRounded aria-hidden="true" />
          ) : (
            <ShieldRounded aria-hidden="true" />
          )}
          {assistant
            ? `${t('MESSAGES.ASSISTANT.NAME')} · ${t('MESSAGES.ROLE.ASSISTANT')}`
            : `${t('MESSAGES.NAFHAM_SUPPORT')} · ${
                announcement
                  ? t('MESSAGES.ANNOUNCEMENT')
                  : t('MESSAGES.ROLE.ADMIN')
              }`}
        </span>
      )}
      <MessageUI {...props} />
      {assistant && (
        <AssistantOptions
          options={message.options ?? []}
          links={message.links ?? []}
          latest={latest}
        />
      )}
    </div>
  );
};

export default NafhamMessageUI;
