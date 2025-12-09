// IshraqCountdown.tsx
import React, { useState, useEffect } from "react";

interface IshraqCountdownProps {
  accentColor: string;
  secondaryColor: string;
  remainingSeconds: number;
  language?: string;
  onClose?: () => void;
}

export const IshraqCountdown: React.FC<IshraqCountdownProps> = ({
  accentColor,
  secondaryColor,
  remainingSeconds,
  language = "en",
  onClose,
}) => {
  const [timeLeft, setTimeLeft] = useState(remainingSeconds);

  useEffect(() => {
    setTimeLeft(remainingSeconds);
  }, [remainingSeconds]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onClose) onClose();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0 && onClose) {
          onClose();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, onClose]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return {
      minutes: mins.toString().padStart(2, "0"),
      seconds: secs.toString().padStart(2, "0"),
    };
  };

  const { minutes, seconds } = formatTime(timeLeft);
  const progressPercentage = (timeLeft / remainingSeconds) * 100;

  const translations = {
    en: {
      ishraqPrayer: "ISHRAQ PRAYER",
      timeRemaining: "Time Remaining Until Ishraq",
      note: "Ishraq prayer begins 20 minutes after sunrise ☀️",
    },
    ta: {
      ishraqPrayer: "இஷ்ராக் பிரார்த்தனை",
      timeRemaining: "இஷ்ராக் வரை மீதமுள்ள நேரம்",
      note: "இஷ்ராக் பிரார்த்தனை சூரிய உதயத்திற்கு 20 நிமிடங்கள் பிறகு தொடங்கும் ☀️",
    },
  };

  const Language = language || "ta";

  const t =
    translations[Language as keyof typeof translations] || translations.en;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      <style>
        {`
          @keyframes fadeInScale {
            0% {
              opacity: 0;
              transform: scale(0.9);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes glowPulse {
            0%, 100% {
              box-shadow: 
                0 0 60px ${accentColor}60,
                0 0 120px ${accentColor}40,
                0 0 180px ${accentColor}20;
            }
            50% {
              box-shadow: 
                0 0 80px ${accentColor}80,
                0 0 160px ${accentColor}60,
                0 0 240px ${accentColor}40;
            }
          }

          @keyframes shimmer {
            0% {
              background-position: -200% center;
            }
            100% {
              background-position: 200% center;
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.8;
              transform: scale(1.05);
            }
          }

          @keyframes digitalGlow {
            0%, 100% {
              filter: brightness(1) drop-shadow(0 0 20px ${accentColor}60);
            }
            50% {
              filter: brightness(1.2) drop-shadow(0 0 40px ${accentColor}80);
            }
          }
        `}
      </style>

      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div
          className="absolute w-96 h-96 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${accentColor}40 0%, transparent 70%)`,
            top: "10%",
            left: "10%",
            animation: "pulse 4s ease-in-out infinite",
          }}
        />
        <div
          className="absolute w-96 h-96 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${secondaryColor}40 0%, transparent 70%)`,
            bottom: "10%",
            right: "10%",
            animation: "pulse 4s ease-in-out infinite 2s",
          }}
        />
      </div>

      {/* Main content container - 90vh height */}
      <div
        className="relative flex flex-col justify-center h-[90vh] w-full max-w-7xl"
        style={{
          animation: "fadeInScale 0.8s ease-out",
        }}
      >
        {/* Decorative top border */}
        <div
          className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-96 h-1"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${accentColor} 50%, transparent 100%)`,
            boxShadow: `0 0 30px ${accentColor}`,
          }}
        />

        {/* Main card */}
        <div
          className="relative px-12 py-12 rounded-[2rem] flex flex-col justify-center"
          style={{
            background: "rgba(0, 0, 0, 0.85)",
            border: `4px solid ${accentColor}`,
            animation: "glowPulse 3s ease-in-out infinite",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Shimmer effect */}
          <div
            className="absolute inset-0 rounded-[2rem] pointer-events-none"
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
          />

          {/* Title */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-6 mb-6">
              {/* <span className="text-7xl">🌅</span> */}
              <h1
                className={`${
                  Language === "ta" ? "text-7xl" : "text-8xl"
                } font-black tracking-wider`}
                style={{
                  color: accentColor,
                  textShadow: `0 0 30px ${accentColor}80, 0 0 60px ${accentColor}60, 6px 6px 12px rgba(0,0,0,0.8)`,
                  fontFamily: "'Oxanium', sans-serif",
                }}
              >
                {t.ishraqPrayer}
              </h1>
              {/* <span className="text-7xl">🌅</span> */}
            </div>
            <p
              className="text-5xl font-semibold"
              style={{
                color: secondaryColor,
                textShadow: `0 0 20px ${secondaryColor}60, 3px 3px 6px rgba(0,0,0,0.8)`,
              }}
            >
              {t.timeRemaining}
            </p>
          </div>

          {/* Countdown timer - MUCH BIGGER AND SLEEKER */}
          <div className="flex items-center justify-center gap-16 mb-12">
            {/* Minutes */}
            <div className="text-center">
              <div
                className="relative inline-block"
                style={{
                  animation:
                    timeLeft <= 60
                      ? "pulse 1s ease-in-out infinite"
                      : "digitalGlow 2s ease-in-out infinite",
                }}
              >
                <div
                  className="text-[20rem] font-black leading-none tracking-tight"
                  style={{
                    fontFamily: "'Orbitron', 'Oxanium', monospace",
                    fontWeight: 900,
                    color: timeLeft <= 60 ? "#EF4444" : accentColor,
                    textShadow:
                      timeLeft <= 60
                        ? `0 0 40px #EF444480, 0 0 80px #EF444460, 0 0 120px #EF444440, 8px 8px 30px rgba(0,0,0,0.9)`
                        : `0 0 40px ${accentColor}90, 0 0 80px ${accentColor}70, 0 0 120px ${accentColor}50, 8px 8px 30px rgba(0,0,0,0.9)`,
                    letterSpacing: "0.05em",
                    WebkitTextStroke: `2px ${
                      timeLeft <= 60 ? "#EF4444" : accentColor
                    }20`,
                  }}
                >
                  {minutes}
                </div>
              </div>
              <div
                className="text-4xl font-bold mt-4 uppercase tracking-widest"
                style={{
                  color: secondaryColor,
                  textShadow: `0 0 15px ${secondaryColor}60, 2px 2px 6px rgba(0,0,0,0.8)`,
                }}
              >
                MINUTES
              </div>
            </div>

            {/* Separator - sleeker colon */}
            <div
              className="text-[12rem] font-black leading-none mb-16"
              style={{
                color: accentColor,
                textShadow: `0 0 30px ${accentColor}80, 0 0 60px ${accentColor}60`,
                animation: "digitalGlow 2s ease-in-out infinite",
              }}
            >
              :
            </div>

            {/* Seconds */}
            <div className="text-center">
              <div
                className="relative inline-block"
                style={{
                  animation:
                    timeLeft <= 60
                      ? "pulse 1s ease-in-out infinite"
                      : "digitalGlow 2s ease-in-out infinite",
                }}
              >
                <div
                  className="text-[20rem] font-black leading-none tracking-tight"
                  style={{
                    fontFamily: "'Orbitron', 'Oxanium', monospace",
                    fontWeight: 900,
                    color: timeLeft <= 60 ? "#EF4444" : accentColor,
                    textShadow:
                      timeLeft <= 60
                        ? `0 0 40px #EF444480, 0 0 80px #EF444460, 0 0 120px #EF444440, 8px 8px 30px rgba(0,0,0,0.9)`
                        : `0 0 40px ${accentColor}90, 0 0 80px ${accentColor}70, 0 0 120px ${accentColor}50, 8px 8px 30px rgba(0,0,0,0.9)`,
                    letterSpacing: "0.05em",
                    WebkitTextStroke: `2px ${
                      timeLeft <= 60 ? "#EF4444" : accentColor
                    }20`,
                  }}
                >
                  {seconds}
                </div>
              </div>
              <div
                className="text-4xl font-bold mt-4 uppercase tracking-widest"
                style={{
                  color: secondaryColor,
                  textShadow: `0 0 15px ${secondaryColor}60, 2px 2px 6px rgba(0,0,0,0.8)`,
                }}
              >
                SECONDS
              </div>
            </div>
          </div>

          {/* Progress bar - sleeker design */}
          <div className="w-full max-w-5xl mx-auto mb-8">
            <div
              className="h-5 rounded-full overflow-hidden relative"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: `2px solid ${accentColor}30`,
                boxShadow: `inset 0 2px 8px rgba(0,0,0,0.6)`,
              }}
            >
              <div
                className="h-full transition-all duration-1000 ease-linear rounded-full relative overflow-hidden"
                style={{
                  width: `${progressPercentage}%`,
                  background: `linear-gradient(90deg, ${secondaryColor} 0%, ${accentColor} 100%)`,
                  boxShadow: `0 0 30px ${accentColor}80, inset 0 1px 3px rgba(255,255,255,0.3)`,
                }}
              >
                {/* Shimmer effect on progress bar */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)`,
                    backgroundSize: "200% 100%",
                    animation: "shimmer 2s infinite",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Info text */}
          <div className="text-center">
            <p
              className="text-4xl font-semibold mt-36"
              style={{
                color: "#94a3b8",
                textShadow: `0 0 15px #94a3b860, 2px 2px 6px rgba(0,0,0,0.8)`,
              }}
            >
              {t.note}
            </p>
          </div>

          {/* Corner decorative elements - larger */}
          <div
            className="absolute top-0 left-0 w-32 h-32 rounded-tl-[2rem]"
            style={{
              background: `linear-gradient(135deg, ${accentColor}25 0%, transparent 100%)`,
            }}
          />
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-tr-[2rem]"
            style={{
              background: `linear-gradient(225deg, ${accentColor}25 0%, transparent 100%)`,
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-32 h-32 rounded-bl-[2rem]"
            style={{
              background: `linear-gradient(45deg, ${accentColor}25 0%, transparent 100%)`,
            }}
          />
          <div
            className="absolute bottom-0 right-0 w-32 h-32 rounded-br-[2rem]"
            style={{
              background: `linear-gradient(315deg, ${accentColor}25 0%, transparent 100%)`,
            }}
          />
        </div>

        {/* Decorative bottom border */}
        <div
          className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 w-96 h-1"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${secondaryColor} 50%, transparent 100%)`,
            boxShadow: `0 0 30px ${secondaryColor}`,
          }}
        />
      </div>
    </div>
  );
};
