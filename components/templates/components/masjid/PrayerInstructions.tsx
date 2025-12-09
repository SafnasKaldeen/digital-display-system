// PrayerInstructions.tsx
import React, { useState, useEffect } from "react";

interface PrayerInstructionsProps {
  imageUrl: string;
  accentColor: string;
  duration: number;
  onClose?: () => void;
}

export const PrayerInstructions: React.FC<PrayerInstructionsProps> = ({
  imageUrl,
  accentColor,
  duration,
  onClose,
}) => {
  const [remainingTime, setRemainingTime] = useState(duration);

  useEffect(() => {
    setRemainingTime(duration);
  }, [duration]);

  useEffect(() => {
    if (remainingTime <= 0) return;

    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        const newTime = prev - 1000;
        if (newTime <= 0 && onClose) {
          onClose();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingTime, onClose]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
      <style>
        {`
          @keyframes fadeInScale {
            0% {
              opacity: 0;
              transform: scale(0.95);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes glowPulse {
            0%, 100% {
              box-shadow: 
                0 0 40px ${accentColor}60,
                0 0 80px ${accentColor}40,
                0 0 120px ${accentColor}20,
                inset 0 0 40px ${accentColor}30;
            }
            50% {
              box-shadow: 
                0 0 60px ${accentColor}80,
                0 0 120px ${accentColor}60,
                0 0 180px ${accentColor}40,
                inset 0 0 60px ${accentColor}50;
            }
          }

          // @keyframes shimmer {
          //   0% {
          //     background-position: -200% center;
          //   }
          //   100% {
          //     background-position: 200% center;
          //   }
          // }

          @keyframes timerPulse {
            0%, 100% {
              transform: scale(1);
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            }
            50% {
              transform: scale(1.05);
              box-shadow: 0 6px 30px rgba(0, 0, 0, 0.7);
            }
          }
        `}
      </style>

      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-40" />

      {/* Image container with border and glow - FULLSCREEN */}
      <div
        className="absolute inset-0 m-0"
        style={{
          border: `12px solid ${accentColor}`,
          animation:
            "fadeInScale 0.8s ease-out, glowPulse 3s ease-in-out infinite",
          boxShadow: `0 0 60px ${accentColor}40`,
        }}
      >
        {/* Shimmer overlay effect */}
        {/* <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: `linear-gradient(
              90deg,
              transparent 0%,
              ${accentColor}15 50%,
              transparent 100%
            )`,
            backgroundSize: "200% 100%",
            animation: "shimmer 3s infinite",
          }}
        /> */}

        {/* Main image - fullscreen background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${imageUrl})`,
          }}
        />

        {/* Corner decorative elements */}
        <div
          className="absolute top-0 left-0 w-16 h-16"
          style={{
            background: `linear-gradient(135deg, ${accentColor}40 0%, transparent 100%)`,
          }}
        />
        <div
          className="absolute top-0 right-0 w-16 h-16"
          style={{
            background: `linear-gradient(225deg, ${accentColor}40 0%, transparent 100%)`,
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-16 h-16"
          style={{
            background: `linear-gradient(45deg, ${accentColor}40 0%, transparent 100%)`,
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-16 h-16"
          style={{
            background: `linear-gradient(315deg, ${accentColor}40 0%, transparent 100%)`,
          }}
        />
      </div>

      {/* Countdown timer */}
      {remainingTime > 0 && (
        <div
          className="absolute top-8 right-8 px-8 py-4 rounded-2xl z-20"
          style={{
            background: `linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 100%)`,
            border: `2px solid ${accentColor}`,
            animation: "timerPulse 2s ease-in-out infinite",
            boxShadow: `0 0 20px ${accentColor}40`,
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏱️</span>
            <span
              className="text-4xl font-black font-mono tracking-wider"
              style={{
                color: accentColor,
                textShadow: `0 0 10px ${accentColor}80`,
              }}
            >
              {Math.ceil(remainingTime / 1000)}s
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
