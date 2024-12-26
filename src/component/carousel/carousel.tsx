import React, { FC, ReactNode } from 'react';
import Slider, { Settings } from 'react-slick';
import { useTranslation } from 'react-i18next';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface CarouselProps {
  children: ReactNode[];
  small?: boolean;
  arrows?: boolean;
}

const Carousel: FC<CarouselProps> = ({
  children,
  small = false,
  arrows = true,
}) => {
  const { i18n } = useTranslation();

  const settings: Settings = {
    dots: true,
    arrows,
    infinite: children.length > 2,
    speed: 500,
    autoplay: true,
    swipeToSlide: true,
    slidesToScroll: 1,
    className: i18n.dir() === 'rtl' ? 'rtl' : '',
    rtl: i18n.dir() === 'rtl',
    responsive: small
      ? [
          { breakpoint: 768, settings: { slidesToShow: 1 } },
          { breakpoint: 992, settings: { slidesToShow: 1 } },
          { breakpoint: 10000, settings: { slidesToShow: 1 } },
        ]
      : [
          { breakpoint: 768, settings: { slidesToShow: 1 } },
          { breakpoint: 992, settings: { slidesToShow: 2 } },
          { breakpoint: 10000, settings: { slidesToShow: 3 } },
        ],
  };

  return <Slider {...settings}>{children}</Slider>;
};

export default Carousel;
