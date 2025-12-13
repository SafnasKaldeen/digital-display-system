// components/DisplayWithAdQueue.tsx
import React, { useState } from "react";
import FullScreenAd from "./FullScreenAd";
import { useAdQueueManager, Advertisement } from "@/hooks/useAdQueueManager";

interface DisplayWithAdQueueProps {
  advertisements: Advertisement[];
  accentColor: string;
  primaryColor: string;
  secondaryColor: string;
  children: React.ReactNode; // Normal display content
}

export function DisplayWithAdQueue({
  advertisements,
  accentColor,
  primaryColor,
  secondaryColor,
  children,
}: DisplayWithAdQueueProps) {
  const [showNormalDisplay, setShowNormalDisplay] = useState(true);

  const { currentAd, isPlaying, queueLength, currentPosition, onAdComplete } =
    useAdQueueManager({
      advertisements,
      onReturnToNormalDisplay: () => {
        console.log("🏠 Returning to normal display");
        setShowNormalDisplay(true);
      },
    });

  // Hide normal display when ad starts playing
  React.useEffect(() => {
    if (isPlaying && currentAd) {
      setShowNormalDisplay(false);
    }
  }, [isPlaying, currentAd]);

  return (
    <div className="relative w-full h-full">
      {/* Normal Display Content */}
      <div
        className={`w-full h-full transition-opacity duration-300 ${
          showNormalDisplay ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {children}
      </div>

      {/* Ad Display Overlay */}
      {currentAd && isPlaying && (
        <div className="absolute inset-0 z-50">
          <FullScreenAd
            title={currentAd.title}
            caption={currentAd.caption}
            imageUrl={
              currentAd.mediaType === "image" ? currentAd.mediaUrl : undefined
            }
            videoUrl={
              currentAd.mediaType === "video" ? currentAd.mediaUrl : undefined
            }
            mediaType={currentAd.mediaType}
            playCount={currentAd.playCount}
            animation={currentAd.animation}
            accentColor={accentColor}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            duration={currentAd.duration}
            showTimer={currentAd.mediaType === "image"}
            showScheduleInfo={false}
            onDurationEnd={onAdComplete}
          />

          {/* Queue Progress Indicator */}
          {queueLength > 1 && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
              <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium">
                    Ad {currentPosition} of {queueLength}
                  </span>
                  <div className="flex gap-1">
                    {Array.from({ length: queueLength }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          idx < currentPosition
                            ? "bg-white"
                            : idx === currentPosition - 1
                            ? "bg-white/80 scale-125"
                            : "bg-white/30"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DisplayWithAdQueue;
