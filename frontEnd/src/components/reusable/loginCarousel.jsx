import React from "react";
import Slider from "react-slick";

import image1 from "../../assets/loginCarousel/1.png";
import image2 from "../../assets/loginCarousel/2.png";
import image3 from "../../assets/loginCarousel/3.png";
import image4 from "../../assets/loginCarousel/4.png";
import image5 from "../../assets/loginCarousel/5.png";


const imagePaths = [
  { src: image1, alt: "ideas" },
  { src: image2, alt: "agreement" },
  { src: image3, alt: "payment" },
  { src: image4, alt: "work" },
  { src: image5, alt: "success" },
];

const LoginCarousel = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    arrows: false,
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Slider {...settings}>
        {imagePaths.map((image, index) => (
          <div key={index}>
            <img
              src={image.src}
              alt={image.alt}
              style={{
                width: "100%",
                height: "100vh",
                objectFit: "cover",
              }}
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default LoginCarousel;
