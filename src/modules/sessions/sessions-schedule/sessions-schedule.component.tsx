import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SessionsScheduleCard from './sessions-schedule-card/sessions-schedule-card.component';
import './sessions-schedule.styles.scss';
import Carousel from '../../../component/carousel/carousel';

interface UnscheduledSession {
  instructor_id: number;
  instructor_image: string;
  instructor_name: string;
  package_clone_field: string;
  package_clone_field_id: number;
  instructor_rating: number;
  instructor_reviews: number;
  package_clone_id: number;
  minutes: number;
  original_minutes: number;
}

interface PackageClone {
  id: number;
  minutes: number;
  original_minutes: number;
}

interface PackageData {
  user_id: number;
  user_image: string;
  user_name: string;
  field: string;
  field_id: number;
  total_minutes: number;
  package_clones: PackageClone[];
  instructor_rating: number;
  instructor_reviews: number;
}

interface SessionsScheduleProps {
  unscheduledSessionsData: UnscheduledSession[];
}

const SessionsSchedule: React.FC<SessionsScheduleProps> = ({
  unscheduledSessionsData,
}) => {
  const { t } = useTranslation();
  const [packageData, setPackageData] = useState<PackageData[]>([]);

  useEffect(() => {
    const unscheduled: Record<number, PackageData> = {};

    unscheduledSessionsData.forEach((session) => {
      const instructorId = session.instructor_id;

      if (!unscheduled[instructorId]) {
        unscheduled[instructorId] = {
          user_id: session.instructor_id,
          user_image: session.instructor_image,
          user_name: session.instructor_name,
          field: session.package_clone_field,
          field_id: session.package_clone_field_id,
          total_minutes: 0,
          package_clones: [],
          instructor_rating: session.instructor_rating,
          instructor_reviews: session.instructor_reviews,
        };
      }

      unscheduled[instructorId].package_clones.push({
        id: session.package_clone_id,
        minutes: session.minutes,
        original_minutes: session.original_minutes,
      });

      unscheduled[instructorId].total_minutes += session.minutes;
    });

    setPackageData(Object.values(unscheduled));
  }, [unscheduledSessionsData]);

  return (
    <section className="sessions-schedule">
      <h2 className="sessions-schedule__title">
        {t('MYSESSIONS.SCHEDULE.TITLE')}
      </h2>
      <div className="sessions-schedule__container">
        <Carousel small>
          {packageData.map((unscheduledSession) => (
            <div key={unscheduledSession.user_id} className="unscheduled-card">
              <SessionsScheduleCard data={unscheduledSession} />
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
};

export default SessionsSchedule;
