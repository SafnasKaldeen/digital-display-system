import React, { useEffect, useState, useRef, useCallback } from "react";
import { X, Play, Loader2 } from "lucide-react";

interface FullScreenAdProps {
  title?: string;
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

export default function FullScreenAd({
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
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const animationClass = getAnimationClass(animation);

  // Store callback in ref to prevent re-renders and ensure we always have latest version
  const onDurationEndRef = useRef(onDurationEnd);
  const hasCalledEndRef = useRef(false);

  // Update ref when callback changes
  useEffect(() => {
    onDurationEndRef.current = onDurationEnd;
  }, [onDurationEnd]);

  // Helper to safely call onDurationEnd outside of render
  const callOnDurationEnd = useCallback(() => {
    if (!hasCalledEndRef.current && onDurationEndRef.current) {
      hasCalledEndRef.current = true;
      console.log("📢 Scheduling onDurationEnd callback");
      // Defer to next tick to avoid calling during render
      setTimeout(() => {
        console.log("✓ Executing onDurationEnd");
        onDurationEndRef.current?.();
      }, 0);
    }
  }, []);

  // Image timer functionality
  useEffect(() => {
    if (mediaType === "image" && showTimer && duration > 0) {
      hasCalledEndRef.current = false;
      setTimeRemaining(duration);

      // Safety timeout - if timer doesn't complete naturally, force skip
      const safetyTimeout = setTimeout(() => {
        console.warn("⏱️ Image timer safety timeout triggered");
        callOnDurationEnd();
      }, duration + 5000); // Duration + 5 second buffer

      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 100) {
            clearInterval(interval);
            clearTimeout(safetyTimeout);
            callOnDurationEnd();
            return 0;
          }
          return prev - 100;
        });
      }, 100);

      return () => {
        clearInterval(interval);
        clearTimeout(safetyTimeout);
      };
    }
  }, [mediaType, showTimer, duration, callOnDurationEnd]);

  // Video initialization
  useEffect(() => {
    if (mediaType !== "video" || !videoUrl || !videoRef.current) {
      return;
    }

    const video = videoRef.current;
    let isMounted = true;
    let cleanupTimeout: NodeJS.Timeout;
    let loadingTimeout: NodeJS.Timeout;
    let stallTimeout: NodeJS.Timeout;

    console.log(
      `🎥 Setting up video: ${videoUrl.substring(
        videoUrl.lastIndexOf("/") + 1
      )} (playCount: ${playCount})`
    );

    // Reset hasCalledEndRef when new video starts
    hasCalledEndRef.current = false;

    // Set a timeout for video loading (30 seconds)
    loadingTimeout = setTimeout(() => {
      if (isMounted && !isVideoReady && !hasVideoError) {
        console.error("⏱️ Video loading timeout - taking too long to load");
        setHasVideoError(true);
        setIsVideoLoading(false);
        // Auto-skip after showing error for 3 seconds
        setTimeout(() => {
          if (isMounted) {
            console.log("⏭️ Auto-skipping failed video");
            callOnDurationEnd();
          }
        }, 3000);
      }
    }, 30000); // 30 second timeout

    const handleCanPlay = () => {
      if (!isMounted) return;
      console.log("✓ Video ready to play");
      setIsVideoReady(true);
      setIsVideoLoading(false);
      clearTimeout(loadingTimeout); // Clear loading timeout
    };

    const handlePlaying = () => {
      if (!isMounted) return;
      console.log("▶️ Video is playing");
      setIsPlaying(true);
      setIsVideoLoading(false);
      clearTimeout(loadingTimeout); // Clear loading timeout
      clearTimeout(stallTimeout); // Clear any previous stall timeout

      // Set a stall detection timeout (if video doesn't end in reasonable time)
      const maxDuration = 300000; // 5 minutes max per video
      stallTimeout = setTimeout(() => {
        if (isMounted && isPlaying) {
          console.error("⏱️ Video appears to be stalled or too long");
          setHasVideoError(true);
          setTimeout(() => {
            if (isMounted) {
              console.log("⏭️ Auto-skipping stalled video");
              callOnDurationEnd();
            }
          }, 2000);
        }
      }, maxDuration);
    };

    const handleWaiting = () => {
      if (!isMounted) return;
      console.log("⏳ Video buffering");
      setIsVideoLoading(true);

      // If buffering takes too long, show error
      const bufferTimeout = setTimeout(() => {
        if (isMounted && isVideoLoading) {
          console.error("⏱️ Video buffering timeout");
          setHasVideoError(true);
          setTimeout(() => {
            if (isMounted) {
              console.log("⏭️ Auto-skipping buffering video");
              callOnDurationEnd();
            }
          }, 2000);
        }
      }, 15000); // 15 second buffer timeout

      // Clear this timeout when video resumes
      const handleResumed = () => {
        clearTimeout(bufferTimeout);
        video.removeEventListener("playing", handleResumed);
      };
      video.addEventListener("playing", handleResumed, { once: true });
    };

    const handleEnded = () => {
      if (!isMounted) return;
      console.log("🏁 Video ended");

      setCurrentPlayCount((prev) => {
        const newCount = prev + 1;
        console.log(`✓ Completed play ${newCount} of ${playCount}`);

        if (newCount >= playCount) {
          console.log(
            `✅ All ${playCount} plays completed - calling onDurationEnd`
          );
          setIsPlaying(false);
          callOnDurationEnd();
        } else {
          console.log(`🔄 Replaying video (${newCount + 1}/${playCount})`);
          // Restart video for next play
          if (video) {
            video.currentTime = 0;
            setTimeout(() => {
              video.play().catch((error) => {
                console.error("Error replaying video:", error);
                setShowPlayButton(true);
              });
            }, 100);
          }
        }
        return newCount;
      });
    };

    const handleError = (e: Event) => {
      if (!isMounted) return;
      const videoElement = e.target as HTMLVideoElement;
      console.error("❌ Video error:", videoElement.error);
      setIsVideoLoading(false);
      setHasVideoError(true);
      setIsVideoReady(false);
      clearTimeout(loadingTimeout);
      clearTimeout(stallTimeout);

      // Auto-skip after showing error for 3 seconds
      setTimeout(() => {
        if (isMounted) {
          console.log("⏭️ Auto-skipping failed video");
          callOnDurationEnd();
        }
      }, 3000);
    };

    // Reset states
    setIsVideoReady(false);
    setIsPlaying(false);
    setIsVideoLoading(true);
    setHasVideoError(false);
    setShowPlayButton(false);
    setCurrentPlayCount(0);

    // Setup video element
    video.src = videoUrl;
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";
    video.loop = false;

    // Add event listeners
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);

    // Try to play after a delay
    cleanupTimeout = setTimeout(() => {
      if (isMounted && video.readyState >= 2) {
        video
          .play()
          .then(() => {
            if (isMounted) {
              setIsPlaying(true);
            }
          })
          .catch((error) => {
            console.log(
              "⚠️ Autoplay blocked, showing manual play button:",
              error
            );
            if (isMounted) {
              setShowPlayButton(true);
            }
          });
      }
    }, 2000);

    // Cleanup function
    return () => {
      console.log("🧹 Cleaning up video player");
      isMounted = false;
      clearTimeout(cleanupTimeout);
      clearTimeout(loadingTimeout);
      clearTimeout(stallTimeout);

      // Remove event listeners
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);

      // Clean up video element
      if (video) {
        video.pause();
        video.src = "";
        video.load();
      }
    };
  }, [mediaType, videoUrl, playCount, callOnDurationEnd]);

  // Manual play handler
  const handleManualPlay = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      setIsVideoLoading(true);
      await videoRef.current.play();
      setIsPlaying(true);
      setShowPlayButton(false);
      setIsVideoLoading(false);
    } catch (error) {
      console.error("Manual play failed:", error);
      setIsVideoLoading(false);
    }
  }, []);

  // Skip button handler (for testing)
  const handleSkipVideo = useCallback(() => {
    console.log("⏩ Skipping video");
    callOnDurationEnd();
  }, [callOnDurationEnd]);

  const progressPercentage =
    mediaType === "image" && duration > 0
      ? ((duration - timeRemaining) / duration) * 100
      : 0;

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
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
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
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>

      <div
        className={`relative w-full h-full bg-black/95 backdrop-blur-lg rounded-2xl overflow-hidden shadow-2xl ${animationClass}`}
      >
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center transition-all group"
            style={{ borderColor: accentColor, borderWidth: "2px" }}
            aria-label="Close ad"
          >
            <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform" />
          </button>
        )}

        {/* Optional skip button for video (for testing) */}
        {mediaType === "video" && onDurationEnd && (
          <button
            onClick={handleSkipVideo}
            className="absolute top-6 left-6 z-50 px-4 py-2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center transition-all text-white text-sm font-medium"
            style={{ borderColor: accentColor, borderWidth: "2px" }}
          >
            Skip Video
          </button>
        )}

        <div className="absolute inset-0 flex items-center justify-center">
          {mediaType === "video" && videoUrl ? (
            <>
              <video
                ref={videoRef}
                className={`w-full h-full object-cover ${
                  isVideoLoading ? "opacity-50" : "opacity-100"
                } transition-opacity duration-300`}
                muted
                playsInline
                preload="auto"
                crossOrigin="anonymous"
                aria-label={title ? `Video ad: ${title}` : "Video ad"}
              >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Loading overlay */}
              {(isVideoLoading || !isVideoReady) &&
                !hasVideoError &&
                !showPlayButton && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2
                        className="w-10 h-10 text-white animate-spin"
                        style={{ color: accentColor }}
                      />
                      <span className="text-white text-lg">
                        Loading video...
                      </span>
                    </div>
                  </div>
                )}

              {/* Manual play overlay */}
              {showPlayButton && !hasVideoError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                  <button
                    onClick={handleManualPlay}
                    className="px-10 py-6 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-lg transition-all duration-300 hover:scale-105 flex flex-col items-center gap-4"
                    style={{ border: `2px solid ${accentColor}` }}
                    aria-label="Play video"
                  >
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                      <Play className="w-12 h-12 text-white ml-2" />
                    </div>
                    <span className="text-white text-xl font-semibold">
                      Click to Play Video
                    </span>
                    <span className="text-white/70 text-sm">
                      {playCount > 1
                        ? `Will play ${playCount} time${
                            playCount > 1 ? "s" : ""
                          }`
                        : "Autoplay was blocked by your browser"}
                    </span>
                  </button>
                </div>
              )}

              {/* Error overlay */}
              {hasVideoError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                  <div className="text-center p-8 max-w-md">
                    <div
                      className="text-5xl mb-4"
                      style={{ color: accentColor }}
                    >
                      ⚠️
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Video Failed to Load
                    </h3>
                    <p className="text-white/70 mb-6">
                      Unable to load the video content. Skipping to next...
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                      <span className="text-white/70 text-sm">
                        Auto-skipping in 3s
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            imageUrl && (
              <img
                src={imageUrl}
                alt={title || "Advertisement"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error("Failed to load image:", imageUrl);
                  e.currentTarget.style.display = "none";
                }}
              />
            )
          )}

          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
          <div className="max-w-4xl mx-auto">
            {title && (
              <h2
                className="text-5xl font-bold mb-4 drop-shadow-lg"
                style={{ color: accentColor }}
              >
                {title}
              </h2>
            )}
            <p className="text-2xl text-white/90 mb-6 drop-shadow-lg">
              {caption}
            </p>

            {mediaType === "image" && showTimer && duration > 0 && (
              <div className="mb-4">
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-100 ease-linear rounded-full"
                    style={{
                      width: `${Math.min(progressPercentage, 100)}%`,
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

            {mediaType === "video" && (
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-white/70 text-sm">
                      {isVideoLoading
                        ? "Loading..."
                        : isPlaying
                        ? "Now playing"
                        : showPlayButton
                        ? "Click to play"
                        : hasVideoError
                        ? "Error loading video"
                        : "Ready"}
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: playCount }).map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                            idx < currentPlayCount ? "bg-white" : "bg-white/30"
                          }`}
                        />
                      ))}
                    </div>
                    {isVideoLoading && (
                      <Loader2 className="w-3 h-3 text-white animate-spin ml-2" />
                    )}
                  </div>
                  <div className="text-white/70 text-sm font-medium">
                    Play {Math.min(currentPlayCount + 1, playCount)} of{" "}
                    {playCount}
                    {playCount > 1 ? " times" : " time"}
                  </div>
                </div>
              </div>
            )}

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
