// sessions-rate-card.component.tsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Rating from '@mui/material/Rating';
import { Button, Dialog } from '@mui/material';
import { parseISO, format, differenceInMinutes } from 'date-fns';
import {
  CalendarToday,
  Group,
  Person,
  Schedule,
  TimerTwoTone,
} from '@mui/icons-material';
import { selectCurrentUser } from '../../../../redux/user/user.selectors';
import { rtlClass } from '../../../../assets/utils/utils';
import './sessions-rate-card.styles.scss';
import { arSA } from 'date-fns/locale/ar-SA';
import { enUS } from 'date-fns/locale/en-US';
import { useAppSelector } from '../../../../redux/store';
import { RateSession } from '../sessions-rate.component';
import SessionsStudentRate from './sessions-student-rate/sessions-student-rate.component';
import SessionsInstructorRate from './sessions-instructor-rate/sessions-instructor-rate.component';

interface SessionsRateCardProps {
  session: RateSession;
}

type Student = {
  id: number;
  student_full_name: string;
};

export type InstructorRateData = {
  sessionId?: number;
  startTime?: string;
  endTime?: string;
  students?: Student[];
  isSessionTrial?: boolean;
  isSessionGroup?: boolean;
  isProgressReport?: boolean;
};

const SessionsRateCard: React.FC<SessionsRateCardProps> = ({ session }) => {
  const { t, i18n } = useTranslation();
  const locales = { ar: arSA, en: enUS };
  const currentUser = useAppSelector(selectCurrentUser);
  const [isInstructor, setIsInstructor] = useState(false);
  const [instructorModalData, setInstructorModalData] =
    useState<InstructorRateData>({});
  const [sessionName, setSessionName] = useState('');
  const [openStudentModal, setOpenStudentModal] = useState(false);
  const [openInstructorModal, setOpenInstructorModal] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);

  useEffect(() => {
    setIsInstructor(session?.tutor?.data?.id === Number(currentUser?.id));
    updateSessionInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, session]);

  useEffect(() => {
    updateSessionInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  const updateSessionInfo = () => {
    setSessionDuration(
      differenceInMinutes(
        parseISO(session.end_date),
        parseISO(session.start_date),
      ),
    );
    const sessionType = session.type;
    setSessionName(
      sessionType === 'TrialSession'
        ? t('MYSESSIONS.FILTERS.FREETRIALSESSION')
        : sessionType === 'PrivateSession'
          ? t('MYSESSIONS.FILTERS.1TO1SESSION')
          : t('MYSESSIONS.FILTERS.GROUPSESSION'),
    );
  };

  const myDateFormatter = (dateStr: string) => {
    const locale = locales[i18n.language as keyof typeof locales];
    return format(parseISO(dateStr), 'EEEE LLL d, y', { locale });
  };

  const myTimeFormatter = (dateStr: string) => {
    const locale = locales[i18n.language as keyof typeof locales];
    return format(parseISO(dateStr), 'h:mm aa', { locale });
  };

  const openFeedbackModal = () => {
    if (isInstructor) {
      const studentsArr =
        session.type === 'GroupSession'
          ? session?.course?.data?.course_students || []
          : [
              {
                student_full_name: session?.student?.data?.full_name,
                id: session?.student?.data?.id,
              },
            ];
      const groupFlag = session.type === 'GroupSession';

      setInstructorModalData({
        sessionId: session.id,
        startTime: session.start_date,
        endTime: session.end_date,
        students: studentsArr as {
          student_full_name: string;
          id: number;
        }[],
        isSessionTrial: session.type === 'TrialSession',
        isSessionGroup: groupFlag,
        // isProgressReport: true,
      });
      setOpenInstructorModal(true);
    } else {
      setOpenStudentModal(true);
    }
  };

  return (
    <div className="session-rate">
      <div className="session-rate__content">
        <div className="session-rate__content-top">
          <div className="session-rate__img-container">
            {isInstructor && session.type !== 'GroupSession' ? (
              <div className="card-img">
                <img src={session.student?.data?.image || ''} alt="student" />
              </div>
            ) : (
              <Button className="card-img session-rate__instructor-img">
                <img src={session.tutor?.data?.image || ''} alt="instructor" />
              </Button>
            )}
            <div className="user-info">
              <p className="name">
                {isInstructor && session.type !== 'GroupSession'
                  ? session.student?.data?.full_name || ''
                  : session.tutor?.data?.full_name || ''}
              </p>
              {session.type === 'GroupSession' ? (
                <p className="u-color-body u-font-size-12">
                  {session.course?.data?.course_name || ''}
                </p>
              ) : (
                <div className="review">
                  <div className="review-stars">
                    <Rating
                      name="instructor rating"
                      value={session.tutor?.data?.rating || 0}
                      precision={0.1}
                      readOnly
                    />
                    <span className="review-numbers">
                      {session.tutor?.data?.rating || 0} (5.0)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className={`session-rate__actions ${rtlClass()}`}>
            <Button
              color="primary"
              variant="contained"
              className="last_button"
              onClick={openFeedbackModal}
            >
              {isInstructor
                ? t('MYSESSIONS.RATE.GIVEFEEDBACK')
                : t('MYSESSIONS.RATE.RATE')}
            </Button>
          </div>
        </div>
        <div className="session-rate__content-middle">
          <div className={`prop-card ${rtlClass()}`}>
            <p className="title">{t('MYSESSIONS.MAIN.CARD.TYPE')}</p>
            <p className="value">
              {session.course?.data?.course_id ? <Group /> : <Person />}
              {sessionName}
            </p>
          </div>
          <div className={`prop-card ${rtlClass()}`}>
            <p className="title">{t('MYSESSIONS.MAIN.CARD.DURATION')}</p>
            <p className="value">
              <TimerTwoTone />
              {sessionDuration}-{t('MYSESSIONS.MAIN.CARD.MINUTE')}
            </p>
          </div>
          <div className={`prop-card ${rtlClass()}`}>
            <p className="title">{t('MYSESSIONS.MAIN.CARD.TIME')}</p>
            <p className="value">
              <Schedule />
              {myTimeFormatter(session.start_date)}
            </p>
          </div>
          <div className={`prop-card ${rtlClass()}`}>
            <p className="title">{t('MYSESSIONS.MAIN.CARD.SUBJECT')}</p>
            <p className="value field">{session.field?.data?.name || ''}</p>
          </div>
          <div className={`prop-card ${rtlClass()}`}>
            <p className="title">{t('MYSESSIONS.MAIN.CARD.DATE')}</p>
            <p className="value">
              <CalendarToday />
              {myDateFormatter(session.start_date)}
            </p>
          </div>
        </div>
      </div>
      {openStudentModal && (
        <Dialog
          maxWidth="sm"
          fullWidth
          onClose={() => setOpenStudentModal(false)}
          aria-labelledby="student-dialog"
          open={openStudentModal}
        >
          <SessionsStudentRate onClose={() => setOpenStudentModal(false)} />
        </Dialog>
      )}
      {openInstructorModal && (
        <Dialog
          maxWidth="sm"
          fullWidth
          onClose={() => setOpenInstructorModal(false)}
          aria-labelledby="instructor-dialog"
          open={openInstructorModal}
          scroll="body"
        >
          <SessionsInstructorRate
            instructorData={instructorModalData}
            onClose={() => setOpenInstructorModal(false)}
          />
        </Dialog>
      )}
    </div>
  );
};

export default SessionsRateCard;
