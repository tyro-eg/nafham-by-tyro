import React from 'react';
import { Field, Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { Button, InputLabel, TextField } from '@mui/material';
import * as Yup from 'yup';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { rtlClass } from '../../../assets/utils/utils';
import { PromoCode } from '../index.component';

import './checkout-discount.styles.scss';

interface CheckoutDiscountProps {
  promoCode: PromoCode | undefined;
  promoCodeOut: (discount: string) => void;
  loginModelOut: () => void;
}

const CheckoutDiscount: React.FC<CheckoutDiscountProps> = ({
  promoCode,
  promoCodeOut,
  loginModelOut,
}) => {
  const { t } = useTranslation();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  const discountSchema = Yup.object().shape({
    discount: Yup.string(),
  });

  const checkPromoCode = (discount: string) => {
    if (currentUser) {
      if (discount) {
        promoCodeOut(discount);
      }
    } else {
      loginModelOut();
    }
  };

  return (
    <section className="discount">
      <Formik
        initialValues={{ discount: '' }}
        validationSchema={discountSchema}
        onSubmit={(values, { setSubmitting }) => {
          setSubmitting(false);
          checkPromoCode(values.discount);
        }}
      >
        {({ submitForm, isSubmitting }) => (
          <Form className="discount__form">
            <InputLabel htmlFor="discount">
              {t('CHECKOUT.DISCOUNT.FORM.LABEL')}
            </InputLabel>
            <div className={`discount__input-group ${rtlClass()}`}>
              <Field
                as={TextField}
                name="discount"
                id="discount"
                placeholder={t('CHECKOUT.DISCOUNT.FORM.LABEL')}
                variant="outlined"
                className="discount__input"
              />
              {promoCode?.valueNum && (
                <div className="discount__applied">
                  <span className="u-font-size-14">
                    {t('CHECKOUT.DISCOUNT.FORM.APPLIED')}
                  </span>
                </div>
              )}
              {promoCode?.errors === 'The code is wrong' && (
                <div className="discount__invalid">
                  <span className="u-font-size-14">
                    {t('CHECKOUT.DISCOUNT.FORM.INVALID')}
                  </span>
                </div>
              )}
              {promoCode?.errors === 'Code has been already used' && (
                <div className="discount__invalid">
                  <span className="u-font-size-14">
                    {t('CHECKOUT.DISCOUNT.FORM.USED')}
                  </span>
                </div>
              )}
            </div>
            <Button
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              onClick={submitForm}
              className="discount__submit"
            >
              {t('CHECKOUT.DISCOUNT.FORM.APPLY')}
            </Button>
          </Form>
        )}
      </Formik>
    </section>
  );
};

export default CheckoutDiscount;
