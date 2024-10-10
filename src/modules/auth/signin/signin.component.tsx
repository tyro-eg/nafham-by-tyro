import React from 'react';
import main from '../../../assets/images/auth/sign.png';
import Login from '../../../component/login/login.component';
import './signin.styles.scss';
// import { useTranslation } from 'react-i18next';
// import { AppBar, Tabs, Tab } from '@mui/material';
// import { tabsProps } from '../../../assets/utils/utils';
// import TabPanel from '../../../component/tabs/tab-banal.component';

const SignIn: React.FC = () => {
  // const { t, i18n } = useTranslation();
  // const [value, setValue] = useState<number>(0);

  // const handleChange = (event: SyntheticEvent, newValue: number) => {
  //   setValue(newValue);
  // };

  return (
    <div className="login">
      <div className="container login__container">
        <div className="first-section">
          <img src={main} alt="sign" />
        </div>
        <div className="second-section">
          <Login />
          {/* <AppBar position="static" color="transparent">
            <Tabs
              value={value}
              onChange={handleChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
              aria-label="full width tabs example"
            >
              <Tab label={t('LOGIN.TAB.STUDENT')} {...tabsProps(0)} />
              <Tab label={t('LOGIN.TAB.INSTRUCTOR')} {...tabsProps(1)} />
            </Tabs>
          </AppBar>
          <div className="tab-init">
            <TabPanel value={value} index={0} dir={i18n.dir()}>
              <Login />
            </TabPanel>
            <TabPanel value={value} index={1} dir={i18n.dir()}>
              <Login isInstructor />
            </TabPanel>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default SignIn;
