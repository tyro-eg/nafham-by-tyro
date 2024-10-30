import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button, Dialog, Box, Rating } from '@mui/material';
import { ArrowRightAlt } from '@mui/icons-material';

import ReadMore from '../read-more/read-more.component';
import InstructorCalendar from '../instructor-calendar/instructor-calendar.component';

import UAE from '../../assets/images/landing/united-arab-emirates-round.png';
import SAT from '../../assets/images/landing/sat-round.png';
import EGYPT from '../../assets/images/landing/egypt-round.png';
import SAUDI from '../../assets/images/landing/saudi-arabia-round.png';

import { rtlClass } from '../../assets/utils/utils';
import './instructor-card.styles.scss';
import { Instructor } from '../../assets/types';
import CalendarStepperModal from '../../modals/calendar-stepper-modal/calendar-stepper-modal';

const InstructorCard: React.FC<{ instructor: Instructor }> = ({
  instructor,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [openCalendarStepperModal, setOpenCalendarStepperModal] =
    useState(false);

  const videoHtml = `
    <style>
      * { padding: 0; margin: 0; overflow: hidden }
      html, body { height: 100% }
      img, span { position: absolute; width: 100%; top: 0; bottom: 0; margin: auto }
      span { height: 1.5em; text-align: center; font: 48px/1.5 sans-serif; color: white; text-shadow: 0 0 0.5em black }
    </style>
    <a href=https://www.youtube.com/embed/${instructor.video}?autoplay=1>
      <img src=https://i.ytimg.com/vi_webp/${instructor.video}/hqdefault.webp>
      <span>&#x25BA;</span>
    </a>`;

  const goToProfile = () => navigate(`/profile/${instructor.id}`);
  const openTrialModal = () => setOpenCalendarStepperModal(true);
  const navigateToCheckout = () =>
    navigate(`/checkout?id=${instructor.id}&course=false`);
  const handleCloseCalendarStepperModal = () =>
    setOpenCalendarStepperModal(false);

  const isTrialAvailable = () =>
    instructor.free_trial?.enabled && !instructor.free_trial.claimed;

  return (
    <div className="instructor-card">
      <div className="instructor-card__video">
        <iframe
          title="youtube-video"
          src={instructor.video}
          loading="lazy"
          frameBorder="0"
          srcDoc={videoHtml}
        ></iframe>
      </div>

      <div className="instructor-card__body">
        <Box
          className={`card-details ${rtlClass()}`}
          sx={{ display: 'flex', flexDirection: 'column' }}
        >
          <Box
            className={`card-details__container ${rtlClass()}`}
            sx={{ display: 'flex' }}
          >
            <Box className={`image ${rtlClass()}`} sx={{ marginRight: '16px' }}>
              <img
                src={
                  instructor.profile_picture_medium ||
                  'https://s3-eu-west-1.amazonaws.com/tyroeg/staging-tyro/users/imgs/5899/thumb/data?1598099301'
                }
                alt="Instructor"
              />
            </Box>

            <Button onClick={goToProfile} className="info">
              <h6>{instructor.full_name}</h6>
              <Box
                className="review"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <Rating
                  name="instructor rating"
                  value={+Number(instructor.average_rating).toPrecision(2)}
                  precision={0.1}
                  readOnly
                />
                <span className="review-numbers">
                  {instructor.average_rating
                    ? +Number(instructor.average_rating).toPrecision(2)
                    : 0}{' '}
                  (5.0)
                </span>
              </Box>
            </Button>
          </Box>

          <div className="instructor-card__fields">
            {instructor.fields?.map((field) => (
              <div key={field.id} className="instructor-card__field">
                {field.name}
              </div>
            ))}
          </div>

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
            text={instructor.about || ''}
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
        <InstructorCalendar />

        {isTrialAvailable() ? (
          <Button
            className="book-now-btn"
            variant="contained"
            color="primary"
            onClick={openTrialModal}
          >
            {t('DIRECTORY.FREETRIAL')}
          </Button>
        ) : (
          <Button
            endIcon={<ArrowRightAlt />}
            className="book-now-btn"
            onClick={navigateToCheckout}
          >
            {t('DIRECTORY.BOOKNOW')}
          </Button>
        )}
      </div>

      {openCalendarStepperModal && (
        <Dialog
          maxWidth="lg"
          fullWidth
          onClose={handleCloseCalendarStepperModal}
          open={openCalendarStepperModal}
        >
          <CalendarStepperModal
            instructor={instructor}
            handleClose={handleCloseCalendarStepperModal}
          />
        </Dialog>
      )}
    </div>
  );
};

export default InstructorCard;
