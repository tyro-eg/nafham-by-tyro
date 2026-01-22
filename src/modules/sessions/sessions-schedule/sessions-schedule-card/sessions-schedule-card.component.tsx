import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Rating from '@mui/material/Rating';
import { Button, Dialog, DialogContent } from '@mui/material';

import MySessionCalendar from '../../../../modals/mysession-calendar/mysession-calendar.component';
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

const cardImageStyles = {
  width: '100%',
  height: 'auto',
  borderRadius: 10,
  cursor: 'pointer',
};

const SessionsScheduleCard: FC<SessionsScheduleCardProps> = ({ data }) => {
  const { t } = useTranslation();
  const [openScheduleSessionModal, setOpenScheduleSessionModal] =
    useState(false);

  // const handleOpenScheduleModal = () => setOpenScheduleSessionModal(true);
  const handleCloseScheduleModal = () => setOpenScheduleSessionModal(false);

  const gotoInstructorProfile = () => {
    // Logic for navigating to the instructor profile
  };

  return (
    <div className="schedule-card">
      <Button sx={{ padding: 0 }} onClick={gotoInstructorProfile}>
        <img
          src={data.user_image || defaultProfileImage}
          alt={`${data.user_name}'s profile`}
          style={{ ...cardImageStyles }}
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
                  readOnly
                />
              </div>
            )}
          </div>
          {/* <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            className="last_button"
            onClick={handleOpenScheduleModal}
          >
            {t('MYSESSIONS.SCHEDULE.CARD.SCHEDULE')}
          </Button> */}
        </div>
        <div className="unscheduled">
          <p>{t('MYSESSIONS.SCHEDULE.CARD.UNSCHEDULED')}</p>
          <p className="hours">{data.total_hours}</p>
        </div>
      </div>
      <Dialog
        maxWidth="md"
        fullWidth
        open={openScheduleSessionModal}
        onClose={handleCloseScheduleModal}
      >
        <DialogContent>
          <MySessionCalendar
            unscheduledHours={data.total_hours}
            handleClose={handleCloseScheduleModal}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SessionsScheduleCard;
