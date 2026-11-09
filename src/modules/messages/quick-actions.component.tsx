import { FC, useState, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Chip,
  CircularProgress,
  ListSubheader,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  EventBusyRounded,
  EventRepeatRounded,
  PauseCircleOutlineRounded,
  ScheduleRounded,
  SupportAgentRounded,
} from '@mui/icons-material';

import {
  useChatAction,
  useChatConversationActions,
  useOpenScreen,
  type ChatUpcomingSession,
} from '../../hooks/useChatAction';
import { changeErrorMessage } from '../../hooks/useSessionChanges';
import { formatSlot } from '../trial/trial.types';

interface QuickActionsProps {
  channelId: string;
}

/**
 * Shortcuts under a lesson conversation's header: can't make a lesson
 * (cancel or move it), pause lessons and change the weekly times (the
 * family side), and talk to a person. Each opens the existing modal; the
 * row hides itself when there is nothing to do or the call fails.
 */
const QuickActions: FC<QuickActionsProps> = ({ channelId }) => {
  const { t, i18n } = useTranslation();
  const locale = `${i18n.language}-u-nu-latn`;
  const query = useChatConversationActions(channelId);
  const openScreen = useOpenScreen();
  const handoff = useChatAction(channelId);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [picked, setPicked] = useState<ChatUpcomingSession | null>(null);

  const data = query.data;
  if (!data || query.isError || !openScreen) return null;

  const tutorSide = data.viewer_role === 'tutor';
  const lessons = data.upcoming_sessions.filter(
    (s) => s.can_cancel || s.can_propose_move,
  );
  const pkg = tutorSide ? null : data.package;
  const canPause = !!pkg?.can_freeze;
  const canWeekly = !!pkg?.can_propose_schedule_change;
  const handoffAction = data.awaiting_support
    ? undefined
    : data.actions.find((a) => a.id === 'talk_to_person');

  if (!lessons.length && !canPause && !canWeekly && !handoffAction) {
    return null;
  }

  const people = {
    subject: { student_id: data.student_id, tutor_id: data.tutor_id },
  };
  const lesson = picked ?? (lessons.length === 1 ? lessons[0] : null);

  const openMenu = (event: MouseEvent<HTMLElement>) => {
    setPicked(null);
    setAnchor(event.currentTarget);
  };
  const closeMenu = () => {
    setAnchor(null);
    setPicked(null);
  };
  const choose = (screen: 'cancel_session' | 'propose_move') => {
    if (!lesson) return;
    closeMenu();
    openScreen(screen, { session_id: lesson.id, tutor_id: data.tutor_id });
  };

  return (
    <div className="quick-actions" role="group">
      {lessons.length > 0 && (
        <>
          <Chip
            className="quick-actions__chip"
            icon={<EventBusyRounded />}
            label={t('SESSION_CHANGES.CHAT.QUICK.CANT_MAKE')}
            variant="outlined"
            onClick={openMenu}
            aria-haspopup="menu"
            aria-expanded={!!anchor}
          />
          <Menu anchorEl={anchor} open={!!anchor} onClose={closeMenu}>
            {lesson
              ? [
                  lessons.length > 1 && (
                    <ListSubheader key="when">
                      {formatSlot(lesson.start_time, locale)}
                    </ListSubheader>
                  ),
                  lesson.can_propose_move && (
                    <MenuItem key="move" onClick={() => choose('propose_move')}>
                      <EventRepeatRounded
                        fontSize="small"
                        className="quick-actions__menu-icon"
                      />
                      {t('SESSION_CHANGES.CHAT.QUICK.MOVE')}
                    </MenuItem>
                  ),
                  lesson.can_cancel && (
                    <MenuItem
                      key="cancel"
                      onClick={() => choose('cancel_session')}
                    >
                      <EventBusyRounded
                        fontSize="small"
                        className="quick-actions__menu-icon"
                      />
                      {t('SESSION_CHANGES.CHAT.QUICK.CANCEL')}
                    </MenuItem>
                  ),
                ]
              : [
                  <ListSubheader key="pick">
                    {t('SESSION_CHANGES.CHAT.QUICK.PICK_LESSON')}
                  </ListSubheader>,
                  ...lessons.map((s) => (
                    <MenuItem key={s.id} onClick={() => setPicked(s)}>
                      {formatSlot(s.start_time, locale)}
                    </MenuItem>
                  )),
                ]}
          </Menu>
        </>
      )}

      {canPause && pkg && (
        <Chip
          className="quick-actions__chip"
          icon={<PauseCircleOutlineRounded />}
          label={t('SESSION_CHANGES.CHAT.QUICK.PAUSE')}
          variant="outlined"
          onClick={() => openScreen('freeze_package', { package_id: pkg.id })}
        />
      )}

      {canWeekly && pkg && (
        <Chip
          className="quick-actions__chip"
          icon={<ScheduleRounded />}
          label={t('SESSION_CHANGES.CHAT.QUICK.WEEKLY')}
          variant="outlined"
          onClick={() =>
            openScreen('propose_schedule_change', { package_id: pkg.id })
          }
        />
      )}

      {handoffAction && (
        <Chip
          className="quick-actions__chip quick-actions__chip--handoff"
          icon={
            handoff.pendingActionId ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <SupportAgentRounded />
            )
          }
          label={t('SESSION_CHANGES.CHAT.QUICK.HANDOFF')}
          variant="outlined"
          disabled={!!handoff.pendingActionId}
          onClick={() => handoff.run(handoffAction, people)}
        />
      )}

      {handoff.error && (
        <Alert severity="error" className="quick-actions__error">
          {changeErrorMessage(handoff.error, t('SESSION_CHANGES.CHAT.ERROR'))}
        </Alert>
      )}
    </div>
  );
};

export default QuickActions;
