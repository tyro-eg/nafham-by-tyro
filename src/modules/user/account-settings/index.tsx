import ChangePassword from './change-password/change-password.component';
import ContactDetails from './contact-details/contact-details.component';

import './index.scss';

const AccountSettings = () => (
  <div className="edit-user">
    <ContactDetails />
    <ChangePassword />
  </div>
);

export default AccountSettings;
