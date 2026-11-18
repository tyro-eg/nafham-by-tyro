import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Rating from '@mui/material/Rating';
import { Button } from '@mui/material';

import defaultProfileImage from '../../../../assets/images/videoSession/people/profile.png';

import './sessions-schedule-card.styles.scss';

interface UserData {
  user_id: number;
  user_image: string;
  user_name: string;
  user_rating: number;
  user_reviews: number;
  total_hours: number;
}

interface SessionsScheduleCardProps {
  data: UserData;
}

const SessionsScheduleCard: FC<SessionsScheduleCardProps> = ({ data }) => {
  const { t } = useTranslation();
  // Sessions are booked by the back office from a request (no booking here)

  const gotoInstructorProfile = () => {
    // Logic for navigating to the instructor profile
  };

  return (
    <div className="schedule-card">
      <Button
        className="schedule-card__img-container"
        onClick={gotoInstructorProfile}
      >
        <img
          src={data.user_image || defaultProfileImage}
          alt={`${data.user_name}'s profile`}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = defaultProfileImage;
          }}
        />
      </Button>
      <div className="schedule-card__container">
        <div className="schedule-card__info">
          <div className="instructor-info">
            <h3 className="name">{data.user_name}</h3>
            {data.user_rating && (
              <div className="review">
                <Rating
                  name="sessions-schedule-card-rating"
                  value={Math.round(data.user_rating)}
                  size="small"
                  readOnly
                />
              </div>
            )}
          </div>
        </div>
        <div className="unscheduled">
          <p>{t('MYSESSIONS.SCHEDULE.CARD.UNSCHEDULED')}</p>
          <p className="hours">{data.total_hours}</p>
        </div>
      </div>
    </div>
  );
};

export default SessionsScheduleCard;
