import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

import MainHeader from './main-header/main-header.component';
import MobileHeader from './mobile-header/mobile-header.component';
// TODO: email confirmation banner and modal, once the backend is ready

import './index.styles.scss';

/** The public header; "Free trial" leads into the booking wizard */
const Header = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const openFreeTrial = () => navigate('/trial');

  return (
    <div className="header">
      {!isXs && <MainHeader openFreeTrail={openFreeTrial} />}
      {isXs && <MobileHeader openFreeTrail={openFreeTrial} />}
    </div>
  );
};

export default Header;
