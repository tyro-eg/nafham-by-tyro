import { FC } from 'react';

import Login from '../../../component/login/login.component';
import main from '../../../assets/images/auth/sign.png';

import './signin.styles.scss';

const SignIn: FC = () => {
  return (
    <div className="login">
      <div className="container login__container">
        <div className="first-section">
          <img src={main} alt="sign" />
        </div>
        <div className="second-section">
          <Login />
        </div>
      </div>
    </div>
  );
};

export default SignIn;
