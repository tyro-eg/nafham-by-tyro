import React, { useState } from 'react';
import { Dialog, IconButton, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Close } from '@mui/icons-material';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import MainHeader from './main-header/main-header.component';
import MobileHeader from './mobile-header/mobile-header.component';
// import FreeTrailModal from '../../components/modals/free-trail-modal/free-trail-modal.component';

import './index.styles.scss';
import { useAppSelector } from '../../redux/store';
import EmailConfirmationModal from '../../modals/email-confirmation-modal/email-confirmation-modal.component';
import FreeTrailModal from '../../modals/free-trail-modal/free-trail-modal.component';

const Header = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));

  const currentUser = useAppSelector(selectCurrentUser);

  const [openFreeTrailModal, setOpenFreeTrailModal] = useState(false);
  const [openEmailConfirmModal, setOpenEmailConfirmModal] = useState(false);

  const triggerOpenFreeTrailModal = () => {
    setOpenFreeTrailModal(true);
  };

  const handleCloseFreeTrailModal = () => {
    setOpenFreeTrailModal(false);
  };

  const handleCloseEmailConfirmModal = () => {
    setOpenEmailConfirmModal(false);
  };

  const triggerOpenEmailConfirmModal = () => {
    setOpenEmailConfirmModal(true);
  };

  return (
    <div
      className={`header ${
        !!currentUser && !!currentUser.id && !currentUser.email_confirmed
          ? 'header__withBanner'
          : ''
      }`}
    >
      {!isXs && (
        <MainHeader
          openFreeTrail={triggerOpenFreeTrailModal}
          openEmailConfirm={triggerOpenEmailConfirmModal}
        />
      )}
      {isXs && (
        <MobileHeader
          openFreeTrail={triggerOpenFreeTrailModal}
          openEmailConfirm={triggerOpenEmailConfirmModal}
        />
      )}
      {openFreeTrailModal && (
        <Dialog
          maxWidth="md"
          fullWidth
          onClose={handleCloseFreeTrailModal}
          aria-labelledby="free-trail-dialog"
          open={openFreeTrailModal}
          sx={{
            '.MuiDialog-paper': {
              width: '100%',
              margin: 0,
              borderRadius: '16px',
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
      {openEmailConfirmModal && currentUser && currentUser.email && (
        <Dialog
          maxWidth="sm"
          fullWidth
          onClose={handleCloseEmailConfirmModal}
          aria-labelledby="email-confirmation-dialog"
          open={openEmailConfirmModal}
          sx={{
            '.MuiDialog-paper': {
              width: '100%',
              margin: 0,
              borderRadius: '16px',
            },
          }}
        >
          <EmailConfirmationModal
            email={currentUser.email}
            onClose={handleCloseEmailConfirmModal}
          />
        </Dialog>
      )}
    </div>
  );
};

export default Header;
