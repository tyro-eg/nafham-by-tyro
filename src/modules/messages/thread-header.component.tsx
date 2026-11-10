import { FC } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Avatar,
  AvatarGroup,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ArrowBackRounded,
  ArrowForwardRounded,
  CalendarMonthRounded,
  ShieldRounded,
} from '@mui/icons-material';
import type { Channel } from 'stream-chat';
import { useTypingContext } from 'stream-chat-react';

import {
  getCounterpart,
  getStudentMember,
  hasAdminMember,
  initialsOf,
  isSupportConversation,
} from '../../lib/streamChat';
import { useRtlClass } from '../../assets/utils/utils';
import QuickActions from './quick-actions.component';

interface ThreadHeaderProps {
  channel: Channel;
  currentUserId: string;
  isTutor: boolean;
  onBack: () => void;
}

/**
 * One compact row above the open conversation: who you are talking to,
 * the subject (or "typing…" while they type), who else is in the chat, a
 * shortcut for students to request sessions and, in a lesson
 * conversation, the quick actions (can't make a lesson, pause…).
 */
const ThreadHeader: FC<ThreadHeaderProps> = ({
  channel,
  currentUserId,
  isTutor,
  onBack,
}) => {
  const { t } = useTranslation();
  const rtl = useRtlClass() === 'rtl';
  const { typing = {} } = useTypingContext('ThreadHeader');

  const support = isSupportConversation(channel);
  const other = getCounterpart(channel, currentUserId);
  const withAdmin = !support && hasAdminMember(channel);
  // A parent in a child's conversation: say whose it is
  const student = getStudentMember(channel, currentUserId);
  const forChild =
    student && student.user_id !== other?.user_id
      ? student.user?.name
      : undefined;
  const name = support
    ? t('MESSAGES.NAFHAM_SUPPORT')
    : other?.user?.name || t('MESSAGES.UNKNOWN_USER');
  const otherRole = support
    ? t('MESSAGES.SUPPORT.REPLY_TIME')
    : isTutor
      ? t('MESSAGES.ROLE.STUDENT')
      : t('MESSAGES.ROLE.INSTRUCTOR');
  const subject = [
    support ? '' : (channel.data?.subject as string | undefined) || otherRole,
    forChild ? t('FAMILY.FOR', { name: forChild }) : '',
    support ? otherRole : '',
  ]
    .filter(Boolean)
    .join(' · ');

  const typers = Object.values(typing).filter(
    (event) => event.user?.id && event.user.id !== currentUserId,
  );
  const typingLabel =
    typers.length === 0
      ? ''
      : typers.length === 1
        ? t('MESSAGES.TYPING_ONE', {
            name: typers[0].user?.name?.split(' ')[0] ?? '',
          })
        : t('MESSAGES.TYPING_MANY');

  const members = [
    other?.user?.name || name,
    withAdmin ? t('MESSAGES.NAFHAM_SUPPORT') : '',
    t('MESSAGES.YOU'),
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <header className="thread-header">
      <IconButton
        className="thread-header__back"
        onClick={onBack}
        aria-label={t('MESSAGES.BACK')}
      >
        {rtl ? <ArrowForwardRounded /> : <ArrowBackRounded />}
      </IconButton>

      <Tooltip title={members} placement="bottom-start">
        <AvatarGroup className="thread-header__avatars" max={3}>
          {support ? (
            <Avatar className="thread-header__admin-avatar" alt="">
              <ShieldRounded />
            </Avatar>
          ) : (
            <Avatar src={other?.user?.image} alt="">
              {initialsOf(other?.user?.name)}
            </Avatar>
          )}
          {withAdmin && (
            <Avatar className="thread-header__admin-avatar" alt="">
              <ShieldRounded />
            </Avatar>
          )}
        </AvatarGroup>
      </Tooltip>

      <div className="thread-header__who">
        <h2 className="thread-header__name" dir="auto">
          {name}
        </h2>
        <p
          className={`thread-header__meta${
            typingLabel ? ' thread-header__meta--typing' : ''
          }`}
          dir="auto"
          aria-live="polite"
        >
          {typingLabel || subject}
        </p>
      </div>

      {!isTutor && !support && other?.user_id && (
        <Button
          className="thread-header__book"
          variant="contained"
          disableElevation
          size="small"
          component={Link}
          to={`/profile/${other.user_id}`}
          startIcon={<CalendarMonthRounded />}
          aria-label={t('MESSAGES.BOOK_SESSION')}
        >
          <span className="thread-header__book-label">
            {t('MESSAGES.BOOK_SESSION')}
          </span>
        </Button>
      )}

      {!support && channel.id && <QuickActions channelId={channel.id} />}
    </header>
  );
};

export default ThreadHeader;
