import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface LazyImageProps {
  src: string;
  alt: string;
  webpSrc?: string;
  className?: string;
  containerClassName?: string;
  blurDataURL?: string;
  priority?: boolean;
}

export const LazyImage = ({
  src,
  alt,
  webpSrc,
  className,
  containerClassName,
  blurDataURL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3C/filter%3E%3Crect fill='%238B5CF6' width='400' height='400' filter='url(%23b)'/%3E%3C/svg%3E",
  priority = false,
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "50px",
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  const imgClasses = cn(
    "w-full h-full object-cover transition-opacity duration-500",
    isLoaded ? "opacity-100" : "opacity-0",
    className
  );

  const renderImage = () => {
    const actualSrc = isInView ? src : blurDataURL;
    const actualWebpSrc = isInView ? webpSrc : undefined;

    if (actualWebpSrc) {
      return (
        <picture>
          <source srcSet={actualWebpSrc} type="image/webp" />
          <img
            src={actualSrc}
            alt={alt}
            className={imgClasses}
            onLoad={() => setIsLoaded(true)}
            loading={priority ? "eager" : "lazy"}
          />
        </picture>
      );
    }

    return (
      <img
        src={actualSrc}
        alt={alt}
        className={imgClasses}
        onLoad={() => setIsLoaded(true)}
        loading={priority ? "eager" : "lazy"}
      />
    );
  };

  return (
    <div ref={imgRef} className={cn("relative overflow-hidden", containerClassName)}>
      {/* Blur placeholder */}
      <img
        src={blurDataURL}
        alt=""
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
          isLoaded ? "opacity-0" : "opacity-100"
        )}
        aria-hidden="true"
      />
      
      {/* Actual image */}
      {renderImage()}
    </div>
  );
};
