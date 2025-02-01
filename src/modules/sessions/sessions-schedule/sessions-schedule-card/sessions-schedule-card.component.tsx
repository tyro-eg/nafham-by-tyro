import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Rating from '@mui/material/Rating';
import { Button, Dialog, DialogContent } from '@mui/material';
// import AddIcon from '@mui/icons-material/Add';

import './sessions-schedule-card.styles.scss';
import MySessionCalendar from '../../../../modals/mysession-calendar/mysession-calendar.component';

interface SessionData {
  user_image: string;
  user_name: string;
  instructor_rating: number;
  total_minutes: number;
}

interface SessionsScheduleCardProps {
  data: SessionData;
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
          src={data.user_image}
          alt={`${data.user_name}'s profile`}
          style={{ ...cardImageStyles }}
        />
      </Button>
      <div className="schedule-card__container">
        <div className="schedule-card__info">
          <div className="instructor-info">
            <h3 className="name">{data.user_name}</h3>
            <div className="review">
              <Rating
                name="sessions-schedule-card-rating"
                value={Math.round(data.instructor_rating)}
                readOnly
              />
            </div>
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
          <p className="hours">{data.total_minutes / 60}</p>
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
            unscheduledHours={data.total_minutes / 60}
            handleClose={handleCloseScheduleModal}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SessionsScheduleCard;
