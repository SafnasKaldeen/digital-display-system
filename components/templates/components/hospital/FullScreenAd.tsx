import React, { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";

interface FullScreenAdProps {
  title: string;
  caption: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaType: "image" | "video";
  playCount?: number;
  animation?: string;
  accentColor: string;
  primaryColor: string;
  secondaryColor: string;
  duration: number;
  showTimer?: boolean;
  showScheduleInfo?: boolean;
  scheduleInfo?: {
    timeRange: { start: string; end: string };
    frequency: number;
    daysOfWeek: number[];
  };
  onClose?: () => void;
  onDurationEnd?: () => void;
}

const getAnimationClass = (animation: string) => {
  const animations: { [key: string]: string } = {
    fade: "animate-fadeIn",
    "slide-left": "animate-slideInLeft",
    "slide-right": "animate-slideInRight",
    "slide-up": "animate-slideInUp",
    "slide-down": "animate-slideInDown",
    zoom: "animate-zoomIn",
    "zoom-out": "animate-zoomOut",
    flip: "animate-flip",
    bounce: "animate-bounceIn",
    rotate: "animate-rotateIn",
  };
  return animations[animation] || "animate-fadeIn";
};

export function FullScreenAd({
  title,
  caption,
  imageUrl,
  videoUrl,
  mediaType = "image",
  playCount = 1,
  animation = "fade",
  accentColor,
  primaryColor,
  secondaryColor,
  duration,
  showTimer = false,
  showScheduleInfo = false,
  scheduleInfo,
  onClose,
  onDurationEnd,
}: FullScreenAdProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [currentPlayCount, setCurrentPlayCount] = useState(0);
  const [hasVideoEnded, setHasVideoEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationClass = getAnimationClass(animation);

  // Image timer functionality
  useEffect(() => {
    if (mediaType === "image" && showTimer) {
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 100) {
            clearInterval(interval);
            if (onDurationEnd) onDurationEnd();
            return 0;
          }
          return prev - 100;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [duration, showTimer, mediaType, onDurationEnd]);

  // Video play count and looping functionality - FIXED
  useEffect(() => {
    if (mediaType === "video" && videoRef.current) {
      const video = videoRef.current;

      // Reset video state when component mounts or playCount changes
      setCurrentPlayCount(0);
      setHasVideoEnded(false);

      const handleEnded = () => {
        setCurrentPlayCount((prev) => {
          const newCount = prev + 1;

          if (newCount >= playCount) {
            // All plays completed
            setHasVideoEnded(true);
            if (onDurationEnd) {
              onDurationEnd();
            }
          } else {
            // Restart video for next play
            if (video) {
              video.currentTime = 0;
              video.play().catch(console.error);
            }
          }
          return newCount;
        });
      };

      video.addEventListener("ended", handleEnded);

      // Play video immediately
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Video play failed:", error);
          // If auto-play fails, still count it as played
          handleEnded();
        });
      }

      return () => {
        video.removeEventListener("ended", handleEnded);
        video.pause();
        video.currentTime = 0;
      };
    }
  }, [mediaType, playCount, onDurationEnd, videoUrl]);

  // Alternative video duration handling - if video doesn't fire ended event
  useEffect(() => {
    if (
      mediaType === "video" &&
      videoRef.current &&
      duration > 0 &&
      !hasVideoEnded
    ) {
      const timeout = setTimeout(() => {
        if (videoRef.current && !hasVideoEnded) {
          setHasVideoEnded(true);
          if (onDurationEnd) {
            onDurationEnd();
          }
        }
      }, duration);

      return () => clearTimeout(timeout);
    }
  }, [mediaType, duration, hasVideoEnded, onDurationEnd]);

  const progressPercentage =
    mediaType === "image" ? ((duration - timeRemaining) / duration) * 100 : 0;

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  const daysOfWeekLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideInUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slideInDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes zoomIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes zoomOut {
          from {
            transform: scale(2);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes flip {
          from {
            transform: perspective(400px) rotateY(90deg);
            opacity: 0;
          }
          to {
            transform: perspective(400px) rotateY(0deg);
            opacity: 1;
          }
        }

        @keyframes bounceIn {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes rotateIn {
          from {
            transform: rotate(-200deg) scale(0);
            opacity: 0;
          }
          to {
            transform: rotate(0) scale(1);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.8s ease-out;
        }

        .animate-slideInRight {
          animation: slideInRight 0.8s ease-out;
        }

        .animate-slideInUp {
          animation: slideInUp 0.8s ease-out;
        }

        .animate-slideInDown {
          animation: slideInDown 0.8s ease-out;
        }

        .animate-zoomIn {
          animation: zoomIn 0.8s ease-out;
        }

        .animate-zoomOut {
          animation: zoomOut 0.8s ease-out;
        }

        .animate-flip {
          animation: flip 0.8s ease-out;
        }

        .animate-bounceIn {
          animation: bounceIn 0.8s ease-out;
        }

        .animate-rotateIn {
          animation: rotateIn 0.8s ease-out;
        }
      `}</style>

      <div
        className={`relative w-full h-full bg-black/95 backdrop-blur-lg rounded-2xl overflow-hidden shadow-2xl ${animationClass}`}
      >
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center transition-all group"
            style={{ borderColor: accentColor, borderWidth: "2px" }}
          >
            <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform" />
          </button>
        )}

        {/* Media Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          {mediaType === "video" && videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-cover"
              muted
              playsInline
              autoPlay
              loop={playCount > 1}
            />
          ) : (
            imageUrl && (
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
            )
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-5xl font-bold mb-4 drop-shadow-lg"
              style={{ color: accentColor }}
            >
              {title}
            </h2>
            <p className="text-2xl text-white/90 mb-6 drop-shadow-lg">
              {caption}
            </p>

            {/* Progress Bar for Images */}
            {mediaType === "image" && showTimer && (
              <div className="mb-4">
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-100 ease-linear rounded-full"
                    style={{
                      width: `${progressPercentage}%`,
                      background: `linear-gradient(90deg, ${primaryColor}, ${accentColor})`,
                    }}
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-white/70 text-sm">
                    Time remaining: {formatTime(timeRemaining)}
                  </span>
                </div>
              </div>
            )}

            {/* Video Play Count Indicator */}
            {mediaType === "video" && (
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <div className="text-white/70 text-sm">
                    Playing: {Math.min(currentPlayCount + 1, playCount)} of{" "}
                    {playCount}
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: playCount }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-2 h-2 rounded-full ${
                          idx < currentPlayCount ? "bg-white" : "bg-white/30"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Info */}
            {showScheduleInfo && scheduleInfo && (
              <div className="flex flex-wrap gap-3 text-sm">
                <div
                  className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border"
                  style={{ borderColor: `${primaryColor}40` }}
                >
                  <span className="text-white/70">
                    🕐 {scheduleInfo.timeRange.start} -{" "}
                    {scheduleInfo.timeRange.end}
                  </span>
                </div>
                <div
                  className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border"
                  style={{ borderColor: `${primaryColor}40` }}
                >
                  <span className="text-white/70">
                    📅{" "}
                    {scheduleInfo.daysOfWeek
                      .map((day) => daysOfWeekLabels[day])
                      .join(", ")}
                  </span>
                </div>
                <div
                  className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border"
                  style={{ borderColor: `${primaryColor}40` }}
                >
                  <span className="text-white/70">
                    🔄 Every {scheduleInfo.frequency / 60} min
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Decorative Corner Elements */}
        <div
          className="absolute top-0 left-0 w-32 h-32 opacity-20"
          style={{
            background: `radial-gradient(circle at top left, ${accentColor}, transparent)`,
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-32 h-32 opacity-20"
          style={{
            background: `radial-gradient(circle at bottom right, ${secondaryColor}, transparent)`,
          }}
        />
      </div>
    </>
  );
}
