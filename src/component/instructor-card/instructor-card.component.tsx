import React, { useState, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button, Dialog, Box } from '@mui/material';
import { ArrowRightAlt, ChatBubbleOutlineRounded } from '@mui/icons-material';

import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import { useCanMessage, useStartConversation } from '../../hooks/useStreamChat';

import ReadMore from '../read-more/read-more.component';
import RatingSummary from '../rating-summary/rating-summary.component';
import InstructorCalendar from '../instructor-calendar/instructor-calendar.component';

// import UAE from '../../assets/images/landing/united-arab-emirates-round.png';
// import SAT from '../../assets/images/landing/sat-round.png';
// import EGYPT from '../../assets/images/landing/egypt-round.png';
// import SAUDI from '../../assets/images/landing/saudi-arabia-round.png';
import Profile from '../../assets/images/videoSession/people/profile.png';

import { useRtlClass } from '../../assets/utils/utils';
import './instructor-card.styles.scss';
import { Instructor } from '../../assets/types';
import RequestSessionsModal from '../../modals/request-sessions-modal/request-sessions-modal.component';

/**
 * InstructorCard Component
 *
 * Displays instructor information in a card format.
 * Memoized to prevent unnecessary re-renders when used in lists.
 *
 * @param instructor - The instructor data to display
 */
const InstructorCard: React.FC<{ instructor: Instructor }> = memo(
  ({ instructor }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const rtlClass = useRtlClass();
    const currentUser = useAppSelector(selectCurrentUser);
    const { startConversation, isStarting } = useStartConversation();
    const canMessage = useCanMessage(instructor.id);
    // Students cannot book sessions themselves; they send a request to
    // support. Visitors are sent to register first.
    const canRequest = !currentUser || currentUser.type === 'Student';
    const [openRequestModal, setOpenRequestModal] = useState(false);

    const videoHtml = `
    <style>
      * { padding: 0; margin: 0; overflow: hidden }
      html, body { height: 100% }
      img, span { position: absolute; width: 100%; top: 0; bottom: 0; margin: auto }
      span { height: 1.5em; text-align: center; font: 48px/1.5 sans-serif; color: white; text-shadow: 0 0 0.5em black }
    </style>
    <a href=https://www.youtube.com/embed/${instructor.video_url}?autoplay=1>
      <img src=https://i.ytimg.com/vi_webp/${instructor.video_url}/hqdefault.webp loading="lazy">
      <span>&#x25BA;</span>
    </a>`;

    const goToProfile = () => navigate(`/profile/${instructor.id}`);
    const openRequest = () => {
      if (!currentUser) {
        navigate('/register');
        return;
      }
      setOpenRequestModal(true);
    };
    const closeRequest = () => setOpenRequestModal(false);

    return (
      <article className="instructor-card">
        <div className="instructor-card__inner">
          <div className="instructor-card__video">
            <iframe
              title="youtube-video"
              src={instructor.video_url}
              loading="lazy"
              frameBorder="0"
              srcDoc={videoHtml}
            ></iframe>
          </div>

          <div className="instructor-card__body">
            <Box
              className={`card-details ${rtlClass}`}
              sx={{ display: 'flex', flexDirection: 'column' }}
            >
              <Box
                className={`card-details__container ${rtlClass}`}
                sx={{ display: 'flex' }}
              >
                <Box className={`image ${rtlClass}`}>
                  <img
                    src={instructor.avatar || Profile}
                    alt="Instructor"
                    loading="lazy"
                  />
                </Box>

                <Button onClick={goToProfile} className="info">
                  <h3 className="name">
                    {instructor.first_name} {instructor.last_name}
                  </h3>
                  {!!instructor.average_rating && (
                    <RatingSummary
                      className="review"
                      value={instructor.average_rating}
                      count={instructor.number_of_reviews}
                    />
                  )}
                </Button>
              </Box>

              {!!instructor.grade_subjects?.length && (
                <div className="instructor-card__fields">
                  {instructor.grade_subjects.map((subject) => (
                    <div key={subject.id} className="instructor-card__field">
                      {subject.full_course_name}
                    </div>
                  ))}
                </div>
              )}

              {/* <div className="price">
            {instructor.rate_to_display > 0 ? (
              <span className="new-price">
                {instructor.rate_to_display} {t('GENEREL.EGP_PER_HOUR')}
              </span>
            ) : (
              <span className="new-price">{t('COURSES.COURSE_CARD.FREE')}</span>
            )}
          </div> */}
            </Box>

            <div className="instructor-card__about">
              <ReadMore
                text={instructor.bio || ''}
                maxLength={95}
                readonly
                onClick={goToProfile}
              />
            </div>

            {/* <div className="instructor-card__curriculum">
          {[UAE, SAT, EGYPT, SAUDI].map((src, index) => (
            <img
              key={index}
              className={rtlClass()}
              src={src}
              alt="Curriculum Icon"
            />
          ))}
        </div> */}
          </div>

          <div className="instructor-card__footer">
            <InstructorCalendar instructorId={instructor.id} />

            {canMessage && (
              <Button
                className="instructor-card__message"
                variant="outlined"
                color="secondary"
                startIcon={<ChatBubbleOutlineRounded />}
                disabled={isStarting}
                onClick={() =>
                  startConversation(
                    instructor.id,
                    instructor.grade_subjects?.[0]?.full_course_name,
                  )
                }
              >
                {t('MESSAGES.MESSAGE_BUTTON')}
              </Button>
            )}

            {canRequest ? (
              <Button
                className="book-now-btn"
                variant="contained"
                color="primary"
                onClick={openRequest}
              >
                {t('SESSION_REQUEST.BUTTON')}
              </Button>
            ) : (
              <Button
                endIcon={<ArrowRightAlt />}
                className={`book-now-btn ${rtlClass}`}
                variant="contained"
                color="primary"
                onClick={goToProfile}
              >
                {t('DIRECTORY.OPENPROFILE')}
              </Button>
            )}
          </div>
        </div>

        {openRequestModal && (
          <Dialog
            maxWidth="sm"
            fullWidth
            onClose={closeRequest}
            open={openRequestModal}
          >
            <RequestSessionsModal
              instructor={instructor}
              handleClose={closeRequest}
            />
          </Dialog>
        )}
      </article>
    );
  },
);

InstructorCard.displayName = 'InstructorCard';

export default InstructorCard;
