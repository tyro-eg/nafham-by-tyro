import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InputLabel, TextField } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useAppSelector } from '../../../redux/store';
import { selectCurrentUser } from '../../../redux/user/user.selectors';
import { rtlClass } from '../../../assets/utils/utils';
import { PromoCode } from '../index.component';

import './checkout-discount.styles.scss';

interface CheckoutDiscountProps {
  promoCode: PromoCode | undefined;
  promoCodeOut: (discount: string) => void;
  loginModelOut: () => void;
}

interface DiscountFormData {
  discount: string;
}

const CheckoutDiscount: React.FC<CheckoutDiscountProps> = ({
  promoCode,
  promoCodeOut,
  loginModelOut,
}) => {
  const { t } = useTranslation();
  const currentUser = useAppSelector(selectCurrentUser);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<DiscountFormData>({
    defaultValues: {
      discount: '',
    },
  });

  const onSubmit = (values: DiscountFormData) => {
    if (currentUser) {
      if (values.discount) {
        promoCodeOut(values.discount);
      }
    } else {
      loginModelOut();
    }
  };

  return (
    <section className="discount">
      <form onSubmit={handleSubmit(onSubmit)} className="discount__form">
        <InputLabel htmlFor="discount">
          {t('CHECKOUT.DISCOUNT.FORM.LABEL')}
        </InputLabel>
        <div className={`discount__input-group ${rtlClass()}`}>
          <Controller
            name="discount"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id="discount"
                placeholder={t('CHECKOUT.DISCOUNT.FORM.LABEL')}
                variant="outlined"
                className="discount__input"
              />
            )}
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
          type="submit"
          className="discount__submit"
        >
          {t('CHECKOUT.DISCOUNT.FORM.APPLY')}
        </Button>
      </form>
    </section>
  );
};

export default CheckoutDiscount;
