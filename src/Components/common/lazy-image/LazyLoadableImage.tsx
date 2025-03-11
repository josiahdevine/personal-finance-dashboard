import React, { useState, useRef, useEffect } from 'react';
import './LazyLoadableImage.css';

export interface LazyLoadableImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  placeholderSrc?: string;
  threshold?: number;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
}

const LazyLoadableImage: React.FC<LazyLoadableImageProps> = ({
  src,
  alt,
  width,
  height,
  placeholderSrc,
  threshold = 0.1,
  className = '',
  style = {},
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use intersection observer to detect when the image is in the viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once visible, disconnect the observer
          if (imgRef.current) {
            observer.unobserve(imgRef.current);
          }
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [threshold]);

  // Handle image load
  const handleImageLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  // Handle image error
  const handleImageError = () => {
    setError(true);
    if (onError) onError();
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: width || 'auto',
    height: height || 'auto',
    overflow: 'hidden',
    ...style,
  };

  // Define a default placeholder if none is provided
  const _defaultPlaceholder = 'data:image/svg+xml,...';

  return (
    <div
      ref={containerRef}
      className={`lazy-loadable-image-container ${className}`}
      style={containerStyle}
    >
      {!isLoaded && !error && (
        <div className="lazy-loadable-image-placeholder">
          {placeholderSrc ? (
            <img
              src={placeholderSrc}
              alt={`${alt} placeholder`}
              className="lazy-loadable-image-placeholder-img"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div 
              className="lazy-loadable-image-blur-placeholder"
              style={{ 
                backgroundColor: '#e2e8f0',
                width: '100%',
                height: '100%'
              }}
            />
          )}
        </div>
      )}

      {isVisible && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={`lazy-loadable-image ${isLoaded ? 'loaded' : 'loading'}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      )}

      {error && (
        <div className="lazy-loadable-image-error">
          <span role="img" aria-label="error">❌</span>
          <p>Failed to load image</p>
        </div>
      )}
    </div>
  );
};

export default React.memo(LazyLoadableImage); 