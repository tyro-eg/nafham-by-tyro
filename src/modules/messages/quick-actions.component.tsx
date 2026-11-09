import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Chip, CircularProgress } from '@mui/material';
import {
  EventBusyRounded,
  PauseCircleOutlineRounded,
  ScheduleRounded,
  SupportAgentRounded,
} from '@mui/icons-material';

import {
  useChatAction,
  useChatConversationActions,
} from '../../hooks/useChatAction';
import { useChatPrompt } from '../../hooks/useChatPrompt';
import { changeErrorMessage } from '../../hooks/useSessionChanges';

interface QuickActionsProps {
  channelId: string;
}

/**
 * Shortcuts under a lesson conversation's header: can't make a lesson
 * (cancel or move it), pause lessons and change the weekly times (the
 * family side), and talk to a person. Each starts one of the assistant's
 * in-chat flows; the row hides itself when there is nothing to do.
 */
const QuickActions: FC<QuickActionsProps> = ({ channelId }) => {
  const { t } = useTranslation();
  const query = useChatConversationActions(channelId);
  const prompt = useChatPrompt();
  const handoff = useChatAction(channelId);

  const data = query.data;
  if (!data || query.isError || !prompt) return null;

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

  return (
    <div className="quick-actions" role="group">
      {lessons.length > 0 && (
        <Chip
          className="quick-actions__chip"
          icon={<EventBusyRounded />}
          label={t('SESSION_CHANGES.CHAT.QUICK.CANT_MAKE')}
          variant="outlined"
          onClick={() => prompt.start('change')}
        />
      )}

      {canPause && pkg && (
        <Chip
          className="quick-actions__chip"
          icon={<PauseCircleOutlineRounded />}
          label={t('SESSION_CHANGES.CHAT.QUICK.PAUSE')}
          variant="outlined"
          onClick={() => prompt.start('pause', { package_id: pkg.id })}
        />
      )}

      {canWeekly && pkg && (
        <Chip
          className="quick-actions__chip"
          icon={<ScheduleRounded />}
          label={t('SESSION_CHANGES.CHAT.QUICK.WEEKLY')}
          variant="outlined"
          onClick={() => prompt.start('weekly', { package_id: pkg.id })}
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
