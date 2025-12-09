import { useState } from 'react';
import { Dialog, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// import { useAppSelector } from '../../redux/store';
// import { selectCurrentUser } from '../../redux/user/user.selectors';
import MainHeader from './main-header/main-header.component';
import MobileHeader from './mobile-header/mobile-header.component';
// TODO: Uncomment when backend is ready
// import EmailConfirmationModal from '../../modals/email-confirmation-modal/email-confirmation-modal.component';
import RegisterModal from '../../modals/register-modal/register-modal.component';
import LoginModal from '../../modals/login-modal/login-modal.component';

import './index.styles.scss';

const Header = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));

  // const currentUser = useAppSelector(selectCurrentUser);

  const [openRegisterModal, setOpenRegisterModal] = useState(false);
  const [openLoginModal, setOpenLoginModal] = useState(false);
  // TODO: Uncomment when backend is ready
  // const [openEmailConfirmModal, setOpenEmailConfirmModal] = useState(false);

  const triggerOpenFreeTrailModal = () => {
    setOpenRegisterModal(true);
  };

  // TODO: Uncomment when backend is ready
  // const handleCloseEmailConfirmModal = () => {
  //   setOpenEmailConfirmModal(false);
  // };

  // const triggerOpenEmailConfirmModal = () => {
  //   setOpenEmailConfirmModal(true);
  // };

  return (
    <div
      className={`header ${
        // TODO: Uncomment when backend is ready
        // !!currentUser && !!currentUser.id && !currentUser.email_confirmed
        //   ? 'header__withBanner'
        //   : ''
        ''
      }`}
    >
      {!isXs && (
        <MainHeader
          openFreeTrail={triggerOpenFreeTrailModal}
          // TODO: Uncomment when backend is ready
          // openEmailConfirm={triggerOpenEmailConfirmModal}
        />
      )}
      {isXs && (
        <MobileHeader
          openFreeTrail={triggerOpenFreeTrailModal}
          // TODO: Uncomment when backend is ready
          // openEmailConfirm={triggerOpenEmailConfirmModal}
        />
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
      {/* TODO: Uncomment when backend is ready */}
      {/* {openEmailConfirmModal && currentUser && currentUser.email && (
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
      )} */}
    </div>
  );
};

export default Header;
