import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Button } from '@mui/material';
import {
  ArrowForwardRounded,
  ChatBubbleOutlineRounded,
  ScheduleRounded,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { arSA } from 'date-fns/locale/ar-SA';
import { enUS } from 'date-fns/locale/en-US';

import { useSessions } from '../../../hooks/useSessions';
import {
  useCanMessage,
  useStartConversation,
} from '../../../hooks/useStreamChat';
import { useAppSelector } from '../../../redux/store';
import { selectCurrentUser } from '../../../redux/user/user.selectors';
import { SessionFilters } from '../../../lib/queryKeys';
import {
  canJoin,
  minutesSinceStart,
  sessionPhase,
  useNow,
} from '../session-state';

import './next-up.styles.scss';

const ACTIVE = ['live', 'starting_soon', 'upcoming'];

/**
 * The lesson that matters right now, large at the top of the page: the live
 * one if there is one, else the next to start, with Join and Message.
 */
const NextUp: FC<{ filters?: SessionFilters }> = ({ filters }) => {
  const { t, i18n } = useTranslation();
  const currentUser = useAppSelector(selectCurrentUser);
  const now = useNow();
  const locale = i18n.language === 'ar' ? arSA : enUS;

  // The API sorts sessions still to come first, nearest first
  const { data } = useSessions(1, 10, {
    tutor_id: filters?.tutor_id,
    grade_subject_id: filters?.grade_subject_id,
  });

  const session = useMemo(() => {
    const active = (data?.data ?? []).filter((s) =>
      ACTIVE.includes(sessionPhase(s, now)),
    );
    return (
      active.find((s) => sessionPhase(s, now) === 'live') ??
      [...active].sort(
        (a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
      )[0]
    );
  }, [data, now]);

  const isInstructor = !!session && session.tutor?.id === currentUser?.id;
  const counterpart = isInstructor ? session?.student : session?.tutor;
  const canMessage = useCanMessage(counterpart?.id);
  const chat = useStartConversation();

  if (!session) return null;

  const phase = sessionPhase(session, now);
  const start = parseISO(session.start_time);
  const end = parseISO(session.end_time);
  const minutesUntil = Math.max(
    0,
    Math.round((start.getTime() - now.getTime()) / 60_000),
  );
  const until =
    minutesUntil < 60
      ? t('MYSESSIONS.MAIN.CARD.RELATIVE_MINUTES', { count: minutesUntil })
      : minutesUntil < 24 * 60
        ? t('MYSESSIONS.MAIN.CARD.RELATIVE_HOURS', {
            count: Math.round(minutesUntil / 60),
          })
        : t('MYSESSIONS.MAIN.CARD.RELATIVE_DAYS', {
            count: Math.round(minutesUntil / (24 * 60)),
          });
  const name = [counterpart?.first_name, counterpart?.last_name]
    .filter(Boolean)
    .join(' ');
  const initials = [counterpart?.first_name, counterpart?.last_name]
    .map((part) => part?.[0] ?? '')
    .join('');

  return (
    <section className={`next-up next-up--${phase}`}>
      <div className="next-up__body">
        <p className="next-up__eyebrow">
          {phase === 'live' ? (
            <>
              <span className="next-up__pulse" aria-hidden="true" />
              {t('MYSESSIONS.MAIN.CARD.LIVE_NOW')}
              {minutesSinceStart(session, now) > 0 &&
                ` · ${t('MYSESSIONS.MAIN.CARD.STARTED_AGO', {
                  count: minutesSinceStart(session, now),
                })}`}
            </>
          ) : (
            <>
              {t('MYSESSIONS.NEXT_UP.LABEL')} ·{' '}
              {minutesUntil > 0
                ? t('MYSESSIONS.NEXT_UP.STARTS_IN', { time: until })
                : t('MYSESSIONS.MAIN.CARD.STARTING_NOW')}
            </>
          )}
        </p>
        <h2 className="next-up__title">
          {session.grade_subject?.full_course_name}
        </h2>
        <div className="next-up__meta">
          <span className="next-up__person">
            <Avatar
              src={counterpart?.image || undefined}
              alt=""
              className="next-up__avatar"
            >
              {initials}
            </Avatar>
            {name}
          </span>
          <span className="next-up__when">
            <ScheduleRounded aria-hidden="true" />
            {format(start, 'EEE d MMM · p', { locale })} –{' '}
            {format(end, 'p', { locale })}
          </span>
        </div>
      </div>

      <div className="next-up__actions">
        {canMessage && counterpart?.id && (
          <Button
            className="next-up__btn next-up__btn--ghost"
            startIcon={<ChatBubbleOutlineRounded />}
            disabled={chat.isStarting}
            onClick={() => chat.startConversation(counterpart.id, name)}
          >
            {t('MESSAGES.MESSAGE_BUTTON')}
          </Button>
        )}
        {(phase === 'live' || phase === 'starting_soon') && (
          <Button
            className="next-up__btn next-up__btn--join"
            endIcon={<ArrowForwardRounded />}
            disabled={!canJoin(session, now, isInstructor)}
            onClick={() =>
              session.session_link && window.open(session.session_link, '_blank')
            }
          >
            {t('MYSESSIONS.MAIN.CARD.GOTO')}
          </Button>
        )}
      </div>
    </section>
  );
};

export default NextUp;
