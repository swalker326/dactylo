import React, { ImgHTMLAttributes } from "react";
import { useInView } from "react-intersection-observer";

type ImageWithPlaceholderProps = {
  src: string;
  alt?: string;
  className?: string;
} & ImgHTMLAttributes<HTMLImageElement>;

const ImageWithPlaceholder: React.FC<ImageWithPlaceholderProps> = ({
  src,
  alt,
  className,
  ...props
}) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.01 // Trigger as soon as even 1% of the image is in view
  });

  const placeholderSrc = src.replace("gif-", "placeholder-");
  return (
    <div className={`relative ${className}`} ref={ref}>
      {/* Placeholder Image */}
      <img
        src={placeholderSrc}
        alt={alt}
        loading="lazy"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${
          inView ? "opacity-0" : "opacity-100"
        }`}
        {...props}
      />
      {/* Actual Image */}
      {inView && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${
            inView ? "opacity-100" : "opacity-0"
          }`}
          {...props}
        />
      )}
    </div>
  );
};

export default ImageWithPlaceholder;
