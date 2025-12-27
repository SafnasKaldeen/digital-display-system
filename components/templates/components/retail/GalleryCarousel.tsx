import React, { useState, useEffect } from "react";

// Gallery Carousel Component
interface GalleryCarouselProps {
  images: string[];
  transitionSpeed?: number;
  accentColor?: string;
  isAdShowing?: boolean;
}

export default function GalleryCarousel({
  images,
  transitionSpeed = 6000,
  accentColor = "#f59e0b",
  isAdShowing = false,
}: GalleryCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (images.length <= 1 || isAdShowing) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setIsTransitioning(false);
      }, 500);
    }, transitionSpeed);

    return () => clearInterval(interval);
  }, [images.length, transitionSpeed, isAdShowing]);

  const goToSlide = (index: number) => {
    if (index !== currentIndex) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(index);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  };

  const goToNext = () => {
    const newIndex = (currentIndex + 1) % images.length;
    goToSlide(newIndex);
  };

  if (images.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl">
        <div className="text-center p-8">
          <div className="text-4xl text-white/50 mb-4">🖼️</div>
          <div className="text-2xl text-white/70 font-medium">
            No Gallery Images
          </div>
          <div className="text-sm text-white/50 mt-2">
            Upload images in the editor
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      {/* 1:1 Aspect Ratio Container - Maximum size within parent */}
      <div className="relative w-full h-full max-w-full max-h-full aspect-square">
        <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="absolute inset-0 transition-all duration-700"
              style={{
                opacity: idx === currentIndex && !isTransitioning ? 1 : 0,
                transform:
                  idx === currentIndex && !isTransitioning
                    ? "scale(1)"
                    : "scale(1.1)",
                zIndex: idx === currentIndex ? 10 : 0,
              }}
            >
              <img
                src={img}
                alt={`Gallery ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          ))}
        </div>

        <div className="absolute top-6 left-6 z-20">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: accentColor }}
            />
            <span className="text-white font-bold text-lg">
              GALLERY
            </span>
          </div>
        </div>

        {/* {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110"
              aria-label="Previous image"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110"
              aria-label="Next image"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )} */}

        {images.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
            <div className="flex items-center justify-between">
              <div className="text-white/90 font-medium">
                Gallery Image {currentIndex + 1} of {images.length}
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1 w-32 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${((currentIndex + 1) / images.length) * 100}%`,
                      backgroundColor: accentColor,
                      boxShadow: `0 0 8px ${accentColor}`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2 z-30">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className="rounded-full transition-all duration-300 hover:scale-125"
                style={{
                  backgroundColor:
                    idx === currentIndex
                      ? accentColor
                      : "rgba(255,255,255,0.4)",
                  width: idx === currentIndex ? "20px" : "8px",
                  height: "8px",
                  boxShadow:
                    idx === currentIndex ? `0 0 12px ${accentColor}` : "none",
                }}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
