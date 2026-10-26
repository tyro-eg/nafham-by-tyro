import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CampaignRounded, ShieldRounded } from '@mui/icons-material';
import {
  MessageUI,
  useMessageContext,
  type MessageUIComponentProps,
} from 'stream-chat-react';

import { isAdminUser } from '../../lib/streamChat';

/**
 * Stream's message UI wrapped so messages from the Nafham admin get a
 * "Nafham Support · Admin" label and their own styling, and the backend's
 * announcements (the welcome message) read as such.
 */
const NafhamMessageUI: FC<MessageUIComponentProps> = (props) => {
  const { t } = useTranslation();
  const { message } = useMessageContext();
  const fromAdmin = isAdminUser(message?.user?.id);
  const announcement = fromAdmin && message?.system === true;

  return (
    <div
      className={`nf-msg${fromAdmin ? ' nf-msg--admin' : ''}${
        announcement ? ' nf-msg--system' : ''
      }`}
    >
      {fromAdmin && (
        <span className="nf-msg__admin-label">
          {announcement ? (
            <CampaignRounded aria-hidden="true" />
          ) : (
            <ShieldRounded aria-hidden="true" />
          )}
          {t('MESSAGES.NAFHAM_SUPPORT')} ·{' '}
          {announcement ? t('MESSAGES.ANNOUNCEMENT') : t('MESSAGES.ROLE.ADMIN')}
        </span>
      )}
      <MessageUI {...props} />
    </div>
  );
};

export default NafhamMessageUI;
