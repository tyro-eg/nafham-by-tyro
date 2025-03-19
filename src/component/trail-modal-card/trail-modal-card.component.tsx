import { useState, FC } from 'react';
import { Button, Dialog, Rating } from '@mui/material';

import './trail-modal-card.styles.scss';
import CalendarStepperModal from '../../modals/calendar-stepper-modal/calendar-stepper-modal';
import { Instructor } from '../../assets/types';
import { getNameInitials } from '../../assets/utils/utils';

interface TrailModalCardProps {
  instructor: Instructor;
}

const TrailModalCard: FC<TrailModalCardProps> = ({ instructor }) => {
  const [openCalendarStepperModal, setOpenCalendarStepperModal] =
    useState(false);

  const openTrialModal = () => setOpenCalendarStepperModal(true);
  const handleCloseCalendarStepperModal = () =>
    setOpenCalendarStepperModal(false);

  return (
    <>
      <Button onClick={openTrialModal}>
        <div className="trail-modal-card">
          <div
            className="trail-modal-card__image"
            style={{
              backgroundImage: `url(${instructor.avatar})`,
            }}
          >
            {instructor.avatar
              ? null
              : getNameInitials(
                  `${instructor.first_name} ${instructor.last_name}`,
                )}
          </div>
          <div className="trail-modal-card__body">
            <h3 className="trail-modal-card__body-name u-font-size-16 u-font-weight-bold">
              {instructor.first_name} {instructor.last_name}
            </h3>
            {instructor.instructor_fields?.map((instructorField) => (
              <h4 className="trail-modal-card__body-field u-font-size-14 u-font-weight-500">
                {instructorField}
              </h4>
            ))}
            <div className="trail-modal-card__body-stars">
              <Rating
                name="instructor-rating"
                value={Math.round(instructor?.average_rating!)}
                readOnly
              />
            </div>
            <div className="trail-modal-card__body-separator"></div>
            <div className="trail-modal-card__body-about">
              {(instructor?.bio?.length ?? 0) > 100
                ? `${instructor?.bio?.substring(0, 100)}...`
                : instructor?.bio}
            </div>
          </div>
        </div>
      </Button>

      {openCalendarStepperModal && (
        <Dialog
          maxWidth="lg"
          fullWidth
          onClose={handleCloseCalendarStepperModal}
          aria-labelledby="calendar-stepper-dialog"
          open={openCalendarStepperModal}
          sx={{
            '& .MuiDialog-paper': {
              width: '100%',
              margin: 0,
              borderRadius: '16px',
            },
          }}
        >
          <CalendarStepperModal
            instructor={instructor}
            fromTrailModal
            handleClose={handleCloseCalendarStepperModal}
          />
        </Dialog>
      )}
    </>
  );
};

export default TrailModalCard;
