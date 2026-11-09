import { FC, ReactNode, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';

import { get } from '../../assets/utils/api';
import { queryKeys } from '../../lib/queryKeys';
import type { Package, SessionType } from '../../assets/types';
import {
  ChatScreenContext,
  useChatConversationActions,
  type ChatPackage,
  type ChatUpcomingSession,
  type OpenScreen,
} from '../../hooks/useChatAction';
import CancelSessionModal from '../../modals/cancel-session-modal/cancel-session-modal.component';
import RescheduleSessionModal from '../../modals/reschedule-session-modal/reschedule-session-modal.component';
import FreezePackageModal from '../../modals/freeze-package-modal/freeze-package-modal.component';
import ScheduleChangeModal from '../../modals/schedule-change-modal/schedule-change-modal.component';

type Open =
  | { kind: 'cancel' | 'move'; session: SessionType }
  | { kind: 'freeze' | 'weekly'; packageData: Package };

/**
 * The modals read only the lesson's id, start time and kind: the chat's
 * upcoming lessons carry exactly those.
 */
export const sessionForModal = (session: ChatUpcomingSession): SessionType =>
  ({
    id: session.id,
    slug: session.slug,
    start_time: session.start_time,
    end_time: session.end_time,
    session_type: session.session_type,
    can_cancel: session.can_cancel,
    can_propose_move: session.can_propose_move,
  }) as unknown as SessionType;

/**
 * The package modals read its id, course name and tutor (id, first name):
 * the chat's package carries those.
 */
export const packageForModal = (pkg: ChatPackage): Package =>
  ({
    id: pkg.id,
    slug: pkg.slug,
    remaining_hours: pkg.remaining_hours,
    grade_subject: pkg.grade_subject,
    tutor: pkg.tutor,
    freeze: pkg.freeze,
    pending_schedule_change: pkg.pending_schedule_change,
  }) as unknown as Package;

interface ChatScreensProviderProps {
  channelId: string;
  isTutor: boolean;
  children: ReactNode;
}

/**
 * Wraps the open thread: bot buttons and the quick actions open the
 * existing cancel / move / pause / weekly-times modals through
 * ChatScreenContext; booking goes to the tutor's page.
 */
const ChatScreensProvider: FC<ChatScreensProviderProps> = ({
  channelId,
  isTutor,
  children,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const actions = useChatConversationActions(channelId);
  const [open, setOpen] = useState<Open | null>(null);
  // The modals refresh the lesson lists; the chat's own actions follow
  const close = () => {
    setOpen(null);
    queryClient.invalidateQueries({
      queryKey: queryKeys.chat.actions(channelId),
    });
  };

  const openScreen = useCallback<OpenScreen>(
    (screen, params) => {
      const data = actions.data;
      if (screen === 'book_session') {
        const tutorId = params.tutor_id ?? data?.tutor_id;
        if (tutorId) navigate(`/profile/${tutorId}`);
        return;
      }
      if (screen === 'propose_move' || screen === 'cancel_session') {
        const kind = screen === 'propose_move' ? 'move' : 'cancel';
        const id = params.session_id;
        if (!id) return;
        const known = data?.upcoming_sessions.find((s) => s.id === id);
        if (known) {
          setOpen({ kind, session: sessionForModal(known) });
          return;
        }
        // Not among the next lessons the chat knows: read it
        get(`/sessions/${id}`, {
          config: params.child_headers ? { headers: params.child_headers } : {},
        })
          .then((response) =>
            setOpen({ kind, session: response.data.data as SessionType }),
          )
          .catch(() => navigate('/my_sessions'));
        return;
      }
      // freeze_package / propose_schedule_change
      const pkg = data?.package;
      if (pkg && (!params.package_id || params.package_id === pkg.id)) {
        setOpen({
          kind: screen === 'freeze_package' ? 'freeze' : 'weekly',
          packageData: packageForModal(pkg),
        });
      } else {
        navigate('/my_packages');
      }
    },
    [actions.data, navigate],
  );

  return (
    <ChatScreenContext.Provider value={openScreen}>
      {children}
      <Dialog
        open={open?.kind === 'cancel'}
        onClose={close}
        maxWidth="sm"
        fullWidth
      >
        {open?.kind === 'cancel' && (
          <CancelSessionModal
            session={open.session}
            isInstructor={isTutor}
            handleClose={close}
          />
        )}
      </Dialog>
      <Dialog
        open={open?.kind === 'move'}
        onClose={close}
        maxWidth="sm"
        fullWidth
      >
        {open?.kind === 'move' && (
          <RescheduleSessionModal session={open.session} handleClose={close} />
        )}
      </Dialog>
      <Dialog
        open={open?.kind === 'freeze'}
        onClose={close}
        maxWidth="sm"
        fullWidth
      >
        {open?.kind === 'freeze' && (
          <FreezePackageModal
            packageData={open.packageData}
            handleClose={close}
          />
        )}
      </Dialog>
      <Dialog
        open={open?.kind === 'weekly'}
        onClose={close}
        maxWidth="sm"
        fullWidth
      >
        {open?.kind === 'weekly' && (
          <ScheduleChangeModal
            packageData={open.packageData}
            handleClose={close}
          />
        )}
      </Dialog>
    </ChatScreenContext.Provider>
  );
};

export default ChatScreensProvider;
