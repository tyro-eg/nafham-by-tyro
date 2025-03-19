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
import { Rating } from '@mui/material';
import { selectCurrentUser } from '../../../../../redux/user/user.selectors';
import { rtlClass } from '../../../../../assets/utils/utils';

import { useAppSelector } from '../../../../../redux/store';
import { SessionType } from '../../../../../redux/session/session.actions';

import Profile from '../../../../../assets/images/videoSession/people/profile.png';

import './sessions-list-card.styles.scss';

interface SessionListCardProps {
  session: SessionType;
}

const SessionListCard: React.FC<SessionListCardProps> = ({ session }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectCurrentUser);

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

        return `${minutesDiff} ${i18n.language === 'en' ? 'Minutes' : 'دقائق'}`;
      }
      return `${hoursDiff} ${i18n.language === 'en' ? 'Hours' : 'ساعات'}`;
    }
    return `${daysDiff} ${i18n.language === 'en' ? 'Days' : 'أيام'}`;
  };

  const goToSession = () => {
    navigate(`/session-network-test/${session.id}`);
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

  return (
    <div className="sessions-card">
      <div className="sessions-card__content">
        <div className="sessions-card__content-top">
          <div className="sessions-card__img-container">
            {isInstructorAndNotGroup() && (
              <div className="card-img">
                {session.student?.image ? (
                  <img src={session.student?.image} alt="student" />
                ) : (
                  <img src={Profile} alt="student" />
                )}
              </div>
            )}
            {notInstructorOrIsGroup() && (
              <Button
                className="card-img sessions-card__instructor-img"
                onClick={() => navigate(`/profile/${session.tutor?.id}`)}
              >
                {session.tutor?.image ? (
                  <img src={session.tutor?.image} alt="instructor" />
                ) : (
                  <img src={Profile} alt="instructor" />
                )}
              </Button>
            )}
            <div className="user-info">
              {isInstructorAndNotGroup() && (
                <p className="name">
                  {session.student?.first_name
                    ? `${session.student?.first_name} ${session.student?.last_name ?? ''}`
                    : ''}
                </p>
              )}
              {notInstructorOrIsGroup() && (
                <p className="name">
                  {session.tutor?.first_name
                    ? `${session.tutor?.first_name} ${session.tutor?.last_name ?? ''}`
                    : ''}
                </p>
              )}
              {session.session_type !== 'group' && (
                <div className="review">
                  <div className="review-stars">
                    <Rating
                      name="instructor rating"
                      value={session.tutor?.rating || 0}
                      precision={0.1}
                      readOnly
                    />
                    <span className="review-numbers">
                      {session.tutor?.rating || 0} / 5.0
                    </span>
                  </div>
                </div>
              )}
              {session.session_type === 'group' && (
                <p className="u-color-body u-font-size-12">{''}</p>
              )}
            </div>
          </div>
          <div className={`sessions-card__actions ${rtlClass()}`}>
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
            {session.status === 'open' && (
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
                >
                  {t('MYSESSIONS.MAIN.CARD.GOTO')}
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="sessions-card__content-middle">
          <div className={`prop-card ${rtlClass()}`}>
            <p className="title">{t('MYSESSIONS.MAIN.CARD.TYPE')}</p>
            <p className="value">
              {session.session_type === 'group' ? <Group /> : <Person />}
              {sessionName}
            </p>
          </div>
          <div className={`prop-card ${rtlClass()}`}>
            <p className="title">{t('MYSESSIONS.MAIN.CARD.DURATION')}</p>
            <p className="value">
              <TimerTwoTone />
              {sessionDuration} {t('MYSESSIONS.MAIN.CARD.MINUTE')}
            </p>
          </div>
          <div className={`prop-card ${rtlClass()}`}>
            <p className="title">{t('MYSESSIONS.MAIN.CARD.TIME')}</p>
            <p className="value">
              <Schedule />
              {format(parseISO(session.start_time!), 'p', {
                locale: locales[i18n.language as 'en' | 'ar'],
              })}
            </p>
          </div>
          <div className={`prop-card ${rtlClass()}`}>
            <p className="title">{t('MYSESSIONS.MAIN.CARD.SUBJECT')}</p>
            <p className="value field">
              {session?.grade_subject
                ? session.grade_subject.full_course_name.split(' - ')[2]
                : ''}
            </p>
          </div>
          <div className={`prop-card ${rtlClass()}`}>
            <p className="title">{t('MYSESSIONS.MAIN.CARD.DATE')}</p>
            <p className="value">
              <CalendarToday />
              {format(parseISO(session.start_time!), 'PP', {
                locale: locales[i18n.language as 'en' | 'ar'],
              })}
            </p>
          </div>
        </div>
      </div>
      <div className="sessions-card__status u-center-text">
        <div>
          {session.status === 'scheduled' &&
            parseISO(session.start_time!) > new Date() && (
              <div className="sessions-card__status-wrapper">
                <Timer
                  className="u-color-primary u-font-size-18"
                  aria-hidden="true"
                ></Timer>
                <p className="u-color-title">
                  {t('MYSESSIONS.MAIN.CARD.WILLGOLIVE')} :{' '}
                  <span>{getRelativeSessionDate()}</span>
                </p>
              </div>
            )}

          {session.status === 'completed' && (
            <div className="sessions-card__status-wrapper">
              <CheckCircle
                className="u-color-primary u-font-size-18"
                aria-hidden="true"
              ></CheckCircle>
              <p className="u-color-title">
                {t('MYSESSIONS.MAIN.CARD.COMPLETED')}
              </p>
            </div>
          )}

          {(session.status === 'missed' ||
            (session.status === 'scheduled' &&
              parseISO(session.start_time!) < new Date())) && (
            <div className="sessions-card__status-wrapper">
              <Cancel
                className="u-color-danger u-font-size-18"
                aria-hidden="true"
              ></Cancel>
              <p className="u-color-title">
                {t('MYSESSIONS.MAIN.CARD.MISSED')}
              </p>
            </div>
          )}

          {session.status === 'canceled' && (
            <div className="sessions-card__status-wrapper">
              <Cancel
                className="u-color-danger u-font-size-18"
                aria-hidden="true"
              ></Cancel>
              <p className="u-color-title">
                {t('MYSESSIONS.MAIN.CARD.CANCELLED')}
              </p>
            </div>
          )}
        </div>
      </div>
      {/* {openCancelSessionModal && (
        <Dialog
          maxWidth="xs"
          fullWidth
          onClose={closeModal}
          open={openCancelSessionModal}
        >
          <CancelSessionModal
            type={modalType}
            sessionId={session.id}
            handleClose={closeModal}
          />
        </Dialog>
      )} */}
    </div>
  );
};

export default SessionListCard;
