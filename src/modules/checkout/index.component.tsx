import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Dialog } from '@mui/material';
import AvailablePackages from './available-packages/available-packages.component';

import './index.styles.scss';
import RegisterModal from '../../modals/register-modal/register-modal.component';
import LoginModal from '../../modals/login-modal/login-modal.component';
import CheckoutDiscount from './checkout-discount/checkout-discount.component';
import { useInstructor } from '../../hooks/useInstructors';

const course = {
  id: 176,
  name: 'General English Course (March)',
  course_img:
    'https://s3-eu-west-1.amazonaws.com/tyro-app/tyro-app/courses/imgs/176/original/1_jynaXA2u6CTEP0N5ZD6rXw.png?1616065555',
  course_cover_img:
    'https://s3-eu-west-1.amazonaws.com/tyro-app/tyro-app/courses/cover_imgs/176/original/overhead-people-studying.jpeg?1616065555',
  course_video: '',
  price: 1500,
  content:
    '\u003cp\u003e\u003cspan style="color: rgb(65, 65, 65); font-family: sans-serif; font-size: 14px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: normal; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; display: inline !important; float: none;"\u003e7 PM to 9 PM\u003c/span\u003e \u003c/p\u003e\u003cp data-f-id="pbf" style="text-align: center; font-size: 14px; margin-top: 30px; opacity: 0.65; font-family: sans-serif;"\u003ePowered by \u003ca href="https://www.froala.com/wysiwyg-editor?pb=1" title="Froala Editor"\u003eFroala Editor\u003c/a\u003e\u003c/p\u003e',
  old_price: 3750,
  description: '\u003cp dir="ltr" ',
  language_level: 'A2',
  course_type: 'group_course',
  start_time: '2021-03-14T19:00:00.000+02:00',
  end_time: '2021-03-14T21:00:00.000+02:00',
  session_duration: 2,
  course_duration: 36,
  active: true,
  number_of_students: 0,
  tutor_id: 78233,
  tutor_name: 'Abdullah Ramadan',
  tutor_fields: ['Conversation English', 'English ', 'IELTS '],
  tutor_reviews: 76,
  tutor_average_rating: 5,
  tutor_bio:
    'Hello, my name is Mr. Abdullah Ramadan. \r\nI have been teaching English for more than 5 years for different levels, starting from the basics till the IELTS \u0026 TOEFL preparation .',
  tutor_img:
    'https://s3-eu-west-1.amazonaws.com/tyro-app/tyro-app/users/imgs/78233/thumb/data?1613562818',
  tutor_rate: 160.0,
  user_purchased_course: false,
  time_slots: [],
  course_reviews: [],
};

export interface TutorField {
  id: number;
  name: string;
}

export interface TutorPackage {
  id: number;
  type: string;
  time_in_hours: number;
  rate: number;
}

export interface PromoCode {
  valueNum?: number;
  errors?: string;
}

const Checkout = () => {
  const { t } = useTranslation();
  const { search } = useLocation();

  const isCourse = new URLSearchParams(search).get('course') === 'true';
  const instructorId = new URLSearchParams(search).get('id');

  const { data: instructor } = useInstructor(
    instructorId || '',
    !!instructorId,
  );

  const [tutorFields, setTutorFields] = useState<TutorField[]>([]);
  const [tutorPackages, setTutorPackages] = useState<TutorPackage[]>([]);
  const [promoCode, setPromoCode] = useState<PromoCode>();
  const [openRegisterModal, setOpenRegisterModal] = useState<boolean>(false);
  const [openLoginModal, setOpenLoginModal] = useState<boolean>(false);

  useEffect(() => {
    if (instructor) {
      if (isCourse) {
      } else {
        initTutorPackages();
        initTutorFields();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instructor]);

  const initTutorPackages = () => {
    const filteredPackages = instructor?.tutor_packages?.filter(
      (pkg: any) => pkg.type !== 'TrialPackage',
    );
    setTutorPackages(filteredPackages || []);
  };

  const initTutorFields = () => {
    const mappedTutorFields = instructor?.tutor_fields?.map((field: any) => ({
      id: field[0],
      name: field[1],
    }));
    setTutorFields(mappedTutorFields || []);
  };

  const checkPromoCode = (code: string) => {
    const codeObj = {
      id: 87,
      campaign_name: 'free238',
      start_date: '2021-08-23T14:32:00.000+02:00',
      end_date: '2021-08-26T14:32:00.000+02:00',
      value: '250',
      created_at: '2021-08-23T14:32:48.000+02:00',
      updated_at: '2021-08-23T14:32:48.000+02:00',
      code: 'free238',
      valueNum: parseInt('250', 10),
    };
    if (code === '123') {
      setPromoCode(codeObj);
    } else if (code === '456') {
      setPromoCode({ errors: 'Code has been already used' });
    } else {
      setPromoCode({ errors: 'The code is wrong' });
    }
  };

  return (
    <div className="checkout">
      <div className="container checkout-container">
        <header className="checkout__header">
          <h1 className="title">{t('CHECKOUT.TITLE')}</h1>
          {isCourse ? (
            <h4 className="sub-title">{t('CHECKOUT.SUBTITLE.COURSE')}!</h4>
          ) : (
            <h4 className="sub-title">{t('CHECKOUT.SUBTITLE.PRIVATE')}!</h4>
          )}
        </header>
        <AvailablePackages
          tutorFields={tutorFields}
          tutorPackages={tutorPackages}
        />
        <div className="checkout__payment-details">
          <p className="title">{t('CHECKOUT.PAYMENT_DETAILS.TITLE')}</p>
          <div className="checkout__payment-details__container">
            <div className="block">
              <CheckoutDiscount
                promoCodeOut={checkPromoCode}
                promoCode={promoCode}
                loginModelOut={() => setOpenRegisterModal(true)}
              />
            </div>
          </div>
        </div>
        <Dialog maxWidth="sm" fullWidth open={openRegisterModal}>
          <RegisterModal
            modalData={
              isCourse
                ? { fromCheckout: true, courseItem: course }
                : { fromCheckout: true }
            }
            onClose={() => setOpenRegisterModal(false)}
            openLoginModal={() => setOpenLoginModal(true)}
          />
        </Dialog>
        <Dialog maxWidth="sm" fullWidth open={openLoginModal}>
          <LoginModal
            onClose={() => setOpenLoginModal(false)}
            openRegisterModal={() => setOpenRegisterModal(true)}
            modalData={
              isCourse
                ? { fromCheckout: true, courseItem: course }
                : { fromCheckout: true }
            }
          />
        </Dialog>
      </div>
    </div>
  );
};

export default Checkout;
