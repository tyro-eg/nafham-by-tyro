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
import FreeTrailModal from '../../modals/free-trail-modal/free-trail-modal.component';
import RegisterModal from '../../modals/register-modal/register-modal.component';
import LoginModal from '../../modals/login-modal/login-modal.component';
import { useAppSelector } from '../../redux/store';
import { selectCurrentUser } from '../../redux/user/user.selectors';

import { rtlClass } from '../../assets/utils/utils';

import './index.scss';

const Home: React.FC = () => {
  const [openFreeTrailModal, setOpenFreeTrailModal] = useState(false);
  const [openRegisterModal, setOpenRegisterModal] = useState(false);
  const [openLoginModal, setOpenLoginModal] = useState(false);

  const currentUser = useAppSelector(selectCurrentUser);

  const triggerOpenFreeTrailModal = () => {
    if (currentUser) {
      setOpenFreeTrailModal(true);
      return;
    }
    setOpenRegisterModal(true);
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
      {openRegisterModal && (
        <Dialog
          onClose={() => setOpenRegisterModal(false)}
          maxWidth="sm"
          fullWidth
          open={openRegisterModal}
        >
          <RegisterModal
            modalData={{}}
            onClose={() => setOpenRegisterModal(false)}
            openLoginModal={() => setOpenLoginModal(true)}
          />
        </Dialog>
      )}
      {openLoginModal && (
        <Dialog
          onClose={() => setOpenLoginModal(false)}
          maxWidth="sm"
          fullWidth
          open={openLoginModal}
        >
          <LoginModal
            onClose={() => setOpenLoginModal(false)}
            openRegisterModal={() => setOpenRegisterModal(true)}
            modalData={{}}
          />
        </Dialog>
      )}
    </div>
  );
};

export default Home;
