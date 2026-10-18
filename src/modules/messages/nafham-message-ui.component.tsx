import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldRounded } from '@mui/icons-material';
import {
  MessageUI,
  useMessageContext,
  type MessageUIComponentProps,
} from 'stream-chat-react';

import { isAdminUser } from '../../lib/streamChat';

/**
 * Stream's message UI wrapped so messages from the Nafham admin get a
 * "Nafham Support · Admin" label and their own styling.
 */
const NafhamMessageUI: FC<MessageUIComponentProps> = (props) => {
  const { t } = useTranslation();
  const { message } = useMessageContext();
  const fromAdmin = isAdminUser(message?.user?.id);

  return (
    <div className={`nf-msg${fromAdmin ? ' nf-msg--admin' : ''}`}>
      {fromAdmin && (
        <span className="nf-msg__admin-label">
          <ShieldRounded aria-hidden="true" />
          {t('MESSAGES.NAFHAM_SUPPORT')} · {t('MESSAGES.ROLE.ADMIN')}
        </span>
      )}
      <MessageUI {...props} />
    </div>
  );
};

export default NafhamMessageUI;
