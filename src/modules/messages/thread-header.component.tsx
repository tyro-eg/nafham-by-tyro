import { FC } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Avatar, Button, IconButton } from '@mui/material';
import {
  ArrowBackRounded,
  ArrowForwardRounded,
  CalendarMonthRounded,
  ShieldRounded,
} from '@mui/icons-material';
import type { Channel } from 'stream-chat';

import {
  getCounterpart,
  hasAdminMember,
  initialsOf,
} from '../../lib/streamChat';
import { useRtlClass } from '../../assets/utils/utils';

interface ThreadHeaderProps {
  channel: Channel;
  currentUserId: string;
  isTutor: boolean;
  onBack: () => void;
}

/**
 * Header of the open conversation: who you are talking to, the subject,
 * the three members as chips, and a shortcut to book a session.
 */
const ThreadHeader: FC<ThreadHeaderProps> = ({
  channel,
  currentUserId,
  isTutor,
  onBack,
}) => {
  const { t } = useTranslation();
  const rtl = useRtlClass() === 'rtl';

  const other = getCounterpart(channel, currentUserId);
  const name = other?.user?.name || t('MESSAGES.UNKNOWN_USER');
  const subject = (channel.data?.subject as string | undefined) || '';
  const otherRole = isTutor
    ? t('MESSAGES.ROLE.STUDENT')
    : t('MESSAGES.ROLE.INSTRUCTOR');

  return (
    <header className="thread-header">
      <IconButton
        className="thread-header__back"
        onClick={onBack}
        aria-label={t('MESSAGES.BACK')}
      >
        {rtl ? <ArrowForwardRounded /> : <ArrowBackRounded />}
      </IconButton>

      <div className="thread-header__avatars" aria-hidden="true">
        <Avatar src={other?.user?.image} alt="">
          {initialsOf(other?.user?.name)}
        </Avatar>
        {hasAdminMember(channel) && (
          <Avatar className="thread-header__admin-avatar" alt="">
            <ShieldRounded />
          </Avatar>
        )}
      </div>

      <div className="thread-header__who">
        <h2 className="thread-header__name" dir="auto">
          {name}
        </h2>
        <p className="thread-header__meta" dir="auto">
          {subject || otherRole}
        </p>
      </div>

      <ul className="thread-header__members" aria-label={t('MESSAGES.MEMBERS')}>
        <li className="thread-header__chip">{t('MESSAGES.YOU')}</li>
        <li className="thread-header__chip" dir="auto">
          {other?.user?.name?.split(' ')[0] || name} · {otherRole}
        </li>
        {hasAdminMember(channel) && (
          <li className="thread-header__chip thread-header__chip--admin">
            <ShieldRounded aria-hidden="true" />
            {t('MESSAGES.NAFHAM_SUPPORT')} · {t('MESSAGES.ROLE.ADMIN')}
          </li>
        )}
      </ul>

      {!isTutor && other?.user_id && (
        <Button
          className="thread-header__book"
          variant="outlined"
          color="secondary"
          size="small"
          component={Link}
          to={`/profile/${other.user_id}`}
          startIcon={<CalendarMonthRounded />}
        >
          {t('MESSAGES.BOOK_SESSION')}
        </Button>
      )}
    </header>
  );
};

export default ThreadHeader;
