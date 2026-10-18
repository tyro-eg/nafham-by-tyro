import { useState, FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Dialog, Rating } from '@mui/material';

import './trail-modal-card.styles.scss';
import RequestSessionsModal from '../../modals/request-sessions-modal/request-sessions-modal.component';
import { Instructor } from '../../assets/types';
import { getNameInitials } from '../../assets/utils/utils';
import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';

interface TrailModalCardProps {
  instructor: Instructor;
}

/**
 * Instructor card inside the "free trial" modal. Students cannot book the
 * trial themselves: signed-in students send a request to support, visitors
 * are sent to register first.
 */
const TrailModalCard: FC<TrailModalCardProps> = ({ instructor }) => {
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectCurrentUser);
  const [openRequestModal, setOpenRequestModal] = useState(false);

  const openRequest = () => {
    if (!currentUser) {
      navigate('/register');
      return;
    }
    setOpenRequestModal(true);
  };
  const closeRequest = () => setOpenRequestModal(false);

  return (
    <>
      <Button onClick={openRequest} className="trail-modal-card__button">
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
            <h3 className="trail-modal-card__body-name">
              {instructor.first_name} {instructor.last_name}
            </h3>
            {instructor.instructor_fields?.map((instructorField) => (
              <h4
                key={instructorField}
                className="trail-modal-card__body-field"
              >
                {instructorField}
              </h4>
            ))}
            {instructor.average_rating && (
              <div className="trail-modal-card__body-stars">
                <Rating
                  name="instructor-rating"
                  value={+Number(instructor.average_rating).toPrecision(2)}
                  precision={0.1}
                  size="small"
                  readOnly
                />
              </div>
            )}
            <div className="trail-modal-card__body-separator"></div>
            <div className="trail-modal-card__body-about" dir="auto">
              {(instructor?.bio?.length ?? 0) > 100
                ? `${instructor?.bio?.substring(0, 100)}...`
                : instructor?.bio}
            </div>
          </div>
        </div>
      </Button>

      {openRequestModal && (
        <Dialog
          maxWidth="sm"
          fullWidth
          onClose={closeRequest}
          aria-labelledby="request-sessions-dialog"
          open={openRequestModal}
        >
          <RequestSessionsModal
            instructor={instructor}
            defaultKind="trial"
            handleClose={closeRequest}
          />
        </Dialog>
      )}
    </>
  );
};

export default TrailModalCard;
