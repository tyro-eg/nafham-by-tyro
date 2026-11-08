import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  ArrowForwardRounded,
  CampaignRounded,
  ShieldRounded,
} from '@mui/icons-material';
import {
  MessageUI,
  useMessageContext,
  type MessageUIComponentProps,
} from 'stream-chat-react';

import { isAdminUser } from '../../lib/streamChat';

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
 * button to where they point when they carry a path.
 */
const NafhamMessageUI: FC<MessageUIComponentProps> = (props) => {
  const { t } = useTranslation();
  const { message } = useMessageContext();
  const fromAdmin = isAdminUser(message?.user?.id);
  const announcement = fromAdmin && message?.system === true;
  const path = announcement ? message?.path : undefined;
  const template = (message?.template as string | undefined) ?? '';
  const pathLabel =
    PATH_LABELS[template] ??
    (path === '/requests'
      ? 'SESSION_CHANGES.CHAT.ANSWER'
      : path === '/my_packages'
        ? 'SESSION_CHANGES.CHAT.PACKAGES'
        : 'SESSION_CHANGES.CHAT.SESSIONS');

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
