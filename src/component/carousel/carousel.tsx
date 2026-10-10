import { FC, ReactNode, useMemo } from 'react';
import Slider, { Settings } from 'react-slick';
import { useRtlClass } from '../../assets/utils/utils';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface CarouselProps {
  children: ReactNode[];
  small?: boolean;
  arrows?: boolean;
  autoplay?: boolean;
  /**
   * Skip react-slick's `rtl` mode (it starts on the wrong slide when
   * `infinite` is on). The caller then handles RTL itself, e.g. by mirroring.
   */
  disableRtl?: boolean;
}

const Carousel: FC<CarouselProps> = ({
  children,
  small = false,
  arrows = true,
  autoplay = true,
  disableRtl = false,
}) => {
  const pageRtlClass = useRtlClass();
  const rtlClass = disableRtl ? '' : pageRtlClass;
  const isRtl = rtlClass === 'rtl';

  const settings: Settings = useMemo(
    () => ({
      dots: true,
      arrows,
      infinite: children.length > 2,
      speed: 500,
      autoplay,
      initialSlide: 0,
      swipeToSlide: true,
      slidesToScroll: 1,
      className: rtlClass,
      rtl: isRtl,
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
    }),
    [arrows, autoplay, children.length, rtlClass, isRtl, small],
  );

  return <Slider {...settings}>{children}</Slider>;
};

export default Carousel;
