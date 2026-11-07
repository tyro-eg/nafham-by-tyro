import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import {
  TimerTwoTone,
  CheckCircle,
  Cancel,
  Group,
  Person,
  Schedule,
  CalendarToday,
  Timer,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  parseISO,
  format,
} from 'date-fns';
import { arSA } from 'date-fns/locale/ar-SA';
import { enUS } from 'date-fns/locale/en-US';
import RatingSummary from '../../../../../component/rating-summary/rating-summary.component';
import { selectCurrentUser } from '../../../../../redux/user/user.selectors';
import { useRtlClass } from '../../../../../assets/utils/utils';

import { useAppSelector } from '../../../../../redux/store';
import { SessionType } from '../../../../../assets/types';
import {
  canJoin,
  minutesSinceStart,
  sessionPhase,
  useNow,
} from '../../../session-state';

import Profile from '../../../../../assets/images/videoSession/people/profile.png';

import './sessions-list-card.styles.scss';

interface SessionListCardProps {
  session: SessionType;
}

const SessionListCard: React.FC<SessionListCardProps> = ({ session }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectCurrentUser);
  const rtlClass = useRtlClass();

  const [isInstructor, setIsInstructor] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [sessionDuration, setSessionDuration] = useState(0);
  // const [isWithinTwelveHours, setIsWithinTwelveHours] = useState(false);
  // const [openCancelSessionModal, setOpenCancelSessionModal] = useState(false);
  // const [modalType, setModalType] = useState<'cancel' | 'end'>('cancel');

  const locales = { ar: arSA, en: enUS };

  useEffect(() => {
    setIsInstructor(session?.tutor?.id === currentUser?.id);
    calculateSessionDetails();
    // setIsWithinTwelveHours(
    //   differenceInHours(parseISO(session.start_time!), new Date()) < 12,
    // );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, currentUser]);

  useEffect(() => {
    calculateSessionDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  const calculateSessionDetails = () => {
    setSessionDuration(
      differenceInMinutes(
        parseISO(session.end_time!),
        parseISO(session.start_time!),
      ),
    );
    setSessionName(
      session.session_type === 'trial'
        ? t('MYSESSIONS.FILTERS.FREETRIALSESSION')
        : session.session_type === 'group'
          ? t('MYSESSIONS.FILTERS.GROUPSESSION')
          : t('MYSESSIONS.FILTERS.1TO1SESSION'),
    );
  };

  const getRelativeSessionDate = () => {
    if (!session.start_time) return '';
    const daysDiff = differenceInDays(parseISO(session.start_time), new Date());

    if (daysDiff === 0) {
      const hoursDiff = differenceInHours(
        parseISO(session.start_time),
        new Date(),
      );

      if (hoursDiff === 0) {
        const minutesDiff = differenceInMinutes(
          parseISO(session.start_time),
          new Date(),
        );

        return t('MYSESSIONS.MAIN.CARD.RELATIVE_MINUTES', {
          count: minutesDiff,
        });
      }
      return t('MYSESSIONS.MAIN.CARD.RELATIVE_HOURS', { count: hoursDiff });
    }
    return t('MYSESSIONS.MAIN.CARD.RELATIVE_DAYS', { count: daysDiff });
  };

  const goToSession = () => {
    if (session.session_link) {
      window.open(session.session_link, '_blank');
    }
  };

  // const openCancelModal = (type: 'cancel' | 'end') => {
  //   setModalType(type);
  //   setOpenCancelSessionModal(true);
  // };

  // const closeModal = () => {
  //   setOpenCancelSessionModal(false);
  // };

  const isInstructorAndNotGroup = () =>
    isInstructor && session.session_type !== 'group';

  const notInstructorOrIsGroup = () =>
    !isInstructor || session.session_type === 'group';

  // const triggerOpenRescheduleModal = () => {};

  const locale = locales[i18n.language as 'en' | 'ar'];
  const startDate = parseISO(session.start_time!);
  // Ticks every 30 s so countdowns and the Join button move on their own
  const now = useNow();
  const phase = sessionPhase(session, now);
  const isLive = phase === 'live';
  const isUpcoming =
    isLive || phase === 'upcoming' || phase === 'starting_soon';
  const joinable = canJoin(session, now, isInstructor);
  const typeVariant =
    session.session_type === 'group'
      ? 'group'
      : session.session_type === 'trial'
        ? 'trial'
        : 'private';

  return (
    <article
      className={`sessions-card sessions-card--${isUpcoming ? 'upcoming' : 'past'}${isLive ? ' sessions-card--live' : ''}`}
    >
      <div className="sessions-card__date">
        <span className="sessions-card__date-month">
          {format(startDate, 'MMM', { locale })}
        </span>
        <span className="sessions-card__date-day">
          {format(startDate, 'd', { locale })}
        </span>
        <span className="sessions-card__date-weekday">
          {format(startDate, 'EEE', { locale })}
        </span>
      </div>

      <div className="sessions-card__main">
        <div className="sessions-card__badges">
          {phase === 'upcoming' && (
            <span className="sessions-card__status sessions-card__status--upcoming">
              <Timer aria-hidden="true" />
              {t('MYSESSIONS.MAIN.CARD.WILLGOLIVE')} {getRelativeSessionDate()}
            </span>
          )}

          {phase === 'starting_soon' && (
            <span className="sessions-card__status sessions-card__status--soon">
              <Timer aria-hidden="true" />
              {t('MYSESSIONS.MAIN.CARD.STARTING_SOON')}{' '}
              {getRelativeSessionDate()}
            </span>
          )}

          {isLive && (
            <span className="sessions-card__status sessions-card__status--live">
              <span className="sessions-card__pulse" aria-hidden="true" />
              {t('MYSESSIONS.MAIN.CARD.LIVE_NOW')}
              {minutesSinceStart(session, now) > 0 &&
                ` · ${t('MYSESSIONS.MAIN.CARD.STARTED_AGO', {
                  count: minutesSinceStart(session, now),
                })}`}
            </span>
          )}

          {phase === 'awaiting' && (
            <span className="sessions-card__status sessions-card__status--awaiting">
              <Timer aria-hidden="true" />
              {t('MYSESSIONS.MAIN.CARD.AWAITING')}
            </span>
          )}

          {session.status === 'completed' && (
            <span className="sessions-card__status sessions-card__status--completed">
              <CheckCircle aria-hidden="true" />
              {t('MYSESSIONS.MAIN.CARD.COMPLETED')}
            </span>
          )}

          {phase === 'missed' && (
            <span className="sessions-card__status sessions-card__status--missed">
              <Cancel aria-hidden="true" />
              {t('MYSESSIONS.MAIN.CARD.MISSED')}
            </span>
          )}

          {phase === 'cancelled' && (
            <span className="sessions-card__status sessions-card__status--canceled">
              <Cancel aria-hidden="true" />
              {t('MYSESSIONS.MAIN.CARD.CANCELLED')}
            </span>
          )}

          <span
            className={`sessions-card__badge sessions-card__badge--${typeVariant}`}
          >
            {session.session_type === 'group' ? <Group /> : <Person />}
            {sessionName}
          </span>
        </div>

        {phase === 'awaiting' && (
          <p className="sessions-card__hint">
            {t(
              session.meeting_provider === 'zoom'
                ? 'MYSESSIONS.MAIN.CARD.AWAITING_HINT_ZOOM'
                : 'MYSESSIONS.MAIN.CARD.AWAITING_HINT',
            )}
          </p>
        )}
        {phase === 'starting_soon' && !isInstructor && (
          <p className="sessions-card__hint">
            {t('MYSESSIONS.MAIN.CARD.JOIN_HINT')}
          </p>
        )}

        <p className="sessions-card__time">
          <span className="sessions-card__time-item">
            <Schedule aria-hidden="true" />
            {format(startDate, 'p', { locale })}
          </span>
          <span className="sessions-card__time-item sessions-card__time-item--muted">
            <TimerTwoTone aria-hidden="true" />
            {t('MYSESSIONS.MAIN.CARD.MINUTES_COUNT', {
              count: sessionDuration,
            })}
          </span>
          <span className="sessions-card__time-item sessions-card__time-item--muted">
            <CalendarToday aria-hidden="true" />
            {format(startDate, 'PP', { locale })}
          </span>
        </p>

        {session?.grade_subject?.full_course_name && (
          <p className="sessions-card__subject">
            {session.grade_subject.full_course_name}
          </p>
        )}

        <div className="sessions-card__person">
          {isInstructorAndNotGroup() && (
            <div className="sessions-card__avatar">
              <img
                src={session.student?.image || Profile}
                alt="student"
                loading="lazy"
              />
            </div>
          )}
          {notInstructorOrIsGroup() && (
            <Button
              className="sessions-card__avatar sessions-card__instructor-img"
              onClick={() => navigate(`/profile/${session.tutor?.id}`)}
            >
              <img
                src={session.tutor?.image || Profile}
                alt="instructor"
                loading="lazy"
              />
            </Button>
          )}
          <div className="sessions-card__person-info">
            {isInstructorAndNotGroup() && (
              <p className="sessions-card__name">
                {session.student?.first_name
                  ? `${session.student?.first_name} ${session.student?.last_name ?? ''}`
                  : ''}
              </p>
            )}
            {notInstructorOrIsGroup() && (
              <p className="sessions-card__name">
                {session.tutor?.first_name
                  ? `${session.tutor?.first_name} ${session.tutor?.last_name ?? ''}`
                  : ''}
              </p>
            )}
            {/* The tutor's rating only makes sense when the counterpart is the tutor */}
            {!isInstructor &&
              session.session_type !== 'group' &&
              !!session.tutor?.rating && (
                <RatingSummary
                  className="sessions-card__rating"
                  value={session.tutor.rating}
                />
              )}
          </div>
        </div>
      </div>

      <div className={`sessions-card__actions ${rtlClass}`}>
        {/* {(session.state === 'scheduled' ||
          session.state === 'rescheduled') &&
          isWithinTwelveHours && (
            <div>
              {session.type !== 'GroupSession' && (
                <div>
                  {!isInstructor && (
                    <Button
                      className="sessions-card__actions-button"
                      color="primary"
                      variant="contained"
                      onClick={triggerOpenRescheduleModal}
                    >
                      {t('MYSESSIONS.MAIN.CARD.RESCHEDULE')}
                    </Button>
                  )}
                  <Button
                    className="sessions-card__actions-button"
                    variant="text"
                    onClick={() => openCancelModal('cancel')}
                  >
                    {t('MYSESSIONS.MAIN.CARD.CANCEL')}
                  </Button>
                </div>
              )}
              {session.type === 'GroupSession' && isInstructor && (
                <div>
                  <Button
                    className="sessions-card__actions-button"
                    color="primary"
                    variant="contained"
                    onClick={triggerOpenRescheduleModal}
                  >
                    {t('MYSESSIONS.MAIN.CARD.RESCHEDULE')}
                  </Button>
                  <Button
                    className="sessions-card__actions-button"
                    variant="outlined"
                    onClick={() => openCancelModal('cancel')}
                  >
                    {t('MYSESSIONS.MAIN.CARD.CANCEL')}
                  </Button>
                </div>
              )}
            </div>
          )} */}
        {(isLive || phase === 'starting_soon') && (
          <div className="sessions-card__status-wrapper">
            {/* {isInstructor && (
              <Button
                className="sessions-card__status-wrapper-button endSession"
                color="secondary"
                variant="contained"
                onClick={() => openCancelModal('end')}
              >
                {t('MYSESSIONS.MAIN.CARD.END')}
              </Button>
            )} */}
            <Button
              className="sessions-card__status-wrapper-button"
              color="primary"
              variant="contained"
              onClick={goToSession}
              disabled={!joinable}
            >
              {t('MYSESSIONS.MAIN.CARD.GOTO')}
            </Button>
          </div>
        )}
      </div>
    </article>
  );
};

export default SessionListCard;
