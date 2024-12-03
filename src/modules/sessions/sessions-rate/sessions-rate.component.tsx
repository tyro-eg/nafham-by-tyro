import React, { useState, useEffect } from 'react';
import SessionsRateCard from './sessions-rate-card/sessions-rate-card.component';
import './sessions-rate.styles.scss';

export type RateSession = {
  id: number;
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  student: {
    data: {
      full_name: string;
      image: string; // URL string
      id: number;
    };
  };
  tutor: {
    data: {
      full_name: string;
      image: string; // URL string
      id: number;
      rating: number;
      reviews: number;
    };
  };
  state: string;
  offline: boolean;
  external_link: string; // URL string
  is_session_trial: boolean;
  type: string;
  course: {
    data: {
      course_id: number | null;
      course_name: string | null;
      course_description: string | null;
      course_instructor_name: string | null;
      course_students: number | null;
      course_image: string | null; // URL string or null
      course_instructor_fields: string[] | null;
      course_type: string | null;
    };
  };
  should_record: boolean;
  mirokey: string | null;
  field: {
    data: {
      name: string;
    };
  };
  show_feedback: boolean | null;
  opentok_room_id: string;
  firebase_key: string;
};

interface SessionsRateProps {
  unratedSessions: RateSession[];
}

const SessionsRate: React.FC<SessionsRateProps> = ({ unratedSessions }) => {
  const [sessions, setSessions] = useState<RateSession[]>([]);

  useEffect(() => {
    setSessions(
      unratedSessions
        .sort((a, b) => (a.start_date > b.start_date ? -1 : 1))
        .slice(0, 3),
    );
  }, [unratedSessions]);

  return (
    <div className="sessions-rate-container">
      <section className="sessions-rate">
        <div className="sessions-rate__container">
          {sessions.map((session) => (
            <SessionsRateCard key={session.id} session={session} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default SessionsRate;
