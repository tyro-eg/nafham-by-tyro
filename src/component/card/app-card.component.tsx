import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import objstr from 'obj-str';

import './app-card.component.scss';

interface PriceConfig {
  priceAfter: {
    price: number | null;
  };
  priceBefore?: {
    price: number | null;
  };
}

interface AppCardProps {
  children?: ReactNode;
  title: string;
  label?: string;
  type?: 'primary' | 'secondary' | 'disabled' | 'special';
  priceConfig?: PriceConfig;
  onClickButton?: () => void;
}

const AppCard: React.FC<AppCardProps> = ({
  children,
  title,
  label,
  type,
  priceConfig,
  onClickButton,
}) => {
  const { t } = useTranslation();

  const buttonType = () => {
    const classes = {
      card__btn: true,
      'card__btn--primary': type === 'primary' || type === 'special',
      'card__btn--secondary': type === 'secondary',
      'card__btn--disabled': type === 'disabled',
      'special-btn': type === 'special',
      'price-btn': !!priceConfig,
    };

    return classes;
  };

  return (
    <div className="card">
      <h5
        className={`card__title ${
          priceConfig ? 'card__title--course-price' : ''
        }`}
      >
        {title}
      </h5>
      {priceConfig && (
        <div className="card__prices">
          {!!priceConfig.priceAfter.price &&
          priceConfig.priceAfter.price > 0 ? (
            <div>
              <h4 className="card__prices--after u-center-text">
                <span>
                  {priceConfig.priceAfter.price}
                  <span>{t('GENEREL.EGP')}</span>
                </span>
              </h4>
              {!!priceConfig.priceBefore?.price &&
                priceConfig.priceBefore.price > 0 && (
                  <h6 className="card__prices--before">
                    <span>
                      {priceConfig.priceBefore.price}
                      <span>{t('GENEREL.EGP')}</span>
                    </span>
                  </h6>
                )}
            </div>
          ) : (
            <div>
              <h6 className="card__prices--free">
                {t('COURSES.COURSE_CARD.FREE')}
              </h6>
            </div>
          )}
        </div>
      )}
      <div className="card__description">{children}</div>
      {onClickButton && (
        <Button
          className={objstr(buttonType())}
          onClick={onClickButton}
          disabled={type === 'disabled'}
        >
          {label}
        </Button>
      )}
    </div>
  );
};

export default AppCard;
