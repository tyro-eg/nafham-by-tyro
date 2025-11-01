import { FC, useEffect, useState } from 'react';
import { differenceInMinutes, format, parseISO } from 'date-fns';

import './session-view-calendar-modal.styles.scss';
import SessionListCard from '../../modules/sessions/sessions-info/sessions-list/sessions-list-card/sessions-list-card.component';
import { SessionType } from '../../assets/types';

interface SessionViewCalendarModalProps {
  sessions: SessionType[];
  handleClose: () => void;
}

const SessionViewCalendarModal: FC<SessionViewCalendarModalProps> = ({
  sessions,
}) => {
  const [sessionsArr, setSessionsArr] = useState<SessionType[]>([]);

  useEffect(() => {
    if (sessions && sessions.length > 0) {
      const sortedSessions = [...sessions]
        .sort((a, b) =>
          differenceInMinutes(parseISO(a.start_time!), new Date()) >
          differenceInMinutes(parseISO(b.start_time!), new Date())
            ? 1
            : -1,
        )
        .sort((a) => (a.status === 'open' ? -1 : 1));

      setSessionsArr(sortedSessions);
    }
  }, [sessions]);

  const myDateFormatter = (dateStr: string) =>
    format(parseISO(dateStr), 'EEEE LLLL d, y');

  return (
    <div className="session-view-calendar-modal">
      <div className="session-view-calendar-modal__head u-center-text">
        <h2 className="u-color-title u-font-size-18 u-font-weight-bold">
          Your Sessions on
        </h2>
        {sessionsArr.length > 0 && (
          <h4 className="u-color-body u-font-size-14">
            {myDateFormatter(sessionsArr[0].start_time!)}
          </h4>
        )}
      </div>

      {sessionsArr.length > 0 && (
        <div className="session-view-calendar-modal__wrapper">
          {sessionsArr.map(
            (session) =>
              session?.id && (
                <SessionListCard key={session.id} session={session} />
              ),
          )}
        </div>
      )}
    </div>
  );
};

export default SessionViewCalendarModal;
