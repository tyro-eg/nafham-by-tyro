import React, { useState } from 'react';
import { Dialog, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';

import HomeIntro from './home-intro/home-intro.component';
import HomeFields from './home-fields/home-fields.component';
import HomeInstructors from './home-instructors/home-instructors.component';
import HomeStatistics from './home-statistics/home-statistics.component';
import HomeHowItWork from './home-how-it-work/home-how-it-work.component';
import HomeTestimonial from './home-testimonial/home-testimonial.component';
import HomeWhyUs from './why-us/why-us.component';
import HomeReadyForLearning from './home-ready-for-learning/home-ready-for-learning.component';
import HomeFeatures from './home-features/home-features.component';

import { rtlClass } from '../../assets/utils/utils';

import './index.scss';
import FreeTrailModal from '../../modals/free-trail-modal/free-trail-modal.component';

const Home: React.FC = () => {
  const [openFreeTrailModal, setOpenFreeTrailModal] = useState(false);

  const triggerOpenFreeTrailModal = () => {
    setOpenFreeTrailModal(true);
  };

  const handleCloseFreeTrailModal = () => {
    setOpenFreeTrailModal(false);
  };

  return (
    <div className={`home ${rtlClass()}`}>
      <HomeIntro openFreeTrail={triggerOpenFreeTrailModal} />
      <HomeFields />
      <HomeInstructors />
      <HomeStatistics />
      <HomeTestimonial />
      <HomeHowItWork />
      <HomeWhyUs />
      <HomeReadyForLearning openFreeTrail={triggerOpenFreeTrailModal} />
      <HomeFeatures />
      {openFreeTrailModal && (
        <Dialog
          maxWidth="md"
          fullWidth
          onClose={handleCloseFreeTrailModal}
          aria-labelledby="free-trail-dialog"
          open={openFreeTrailModal}
          sx={{
            '& .MuiPaper-root': {
              margin: 0,
              borderRadius: '16px',
              width: '100%',
            },
          }}
        >
          <IconButton
            className="modal-close-btn"
            onClick={handleCloseFreeTrailModal}
            aria-label="close"
          >
            <Close />
          </IconButton>
          <FreeTrailModal />
        </Dialog>
      )}
    </div>
  );
};

export default Home;
