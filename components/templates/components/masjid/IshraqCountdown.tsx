// IshraqCountdown.tsx
import React, { useState, useEffect } from "react";

interface IshraqCountdownProps {
  accentColor: string;
  secondaryColor: string;
  remainingSeconds: number;
  onClose?: () => void;
}

export const IshraqCountdown: React.FC<IshraqCountdownProps> = ({
  accentColor,
  secondaryColor,
  remainingSeconds,
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

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
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
                0 0 40px ${accentColor}60,
                0 0 80px ${accentColor}40,
                0 0 120px ${accentColor}20;
            }
            50% {
              box-shadow: 
                0 0 60px ${accentColor}80,
                0 0 120px ${accentColor}60,
                0 0 180px ${accentColor}40;
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

          @keyframes rotate {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
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

      {/* Main content container */}
      <div
        className="relative"
        style={{
          animation: "fadeInScale 0.8s ease-out",
        }}
      >
        {/* Decorative top border */}
        <div
          className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-64 h-1"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${accentColor} 50%, transparent 100%)`,
            boxShadow: `0 0 20px ${accentColor}`,
          }}
        />

        {/* Main card */}
        <div
          className="relative px-20 py-16 rounded-3xl"
          style={{
            background: "rgba(0, 0, 0, 0.8)",
            border: `3px solid ${accentColor}`,
            animation: "glowPulse 3s ease-in-out infinite",
            backdropFilter: "blur(10px)",
          }}
        >
          {/* Shimmer effect */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
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
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="text-6xl">🌅</span>
              <h1
                className="text-7xl font-black tracking-wider"
                style={{
                  color: accentColor,
                  textShadow: `0 0 20px ${accentColor}80, 4px 4px 8px rgba(0,0,0,0.8)`,
                  fontFamily: "'Oxanium', sans-serif",
                }}
              >
                ISHRAQ PRAYER
              </h1>
              <span className="text-6xl">🌅</span>
            </div>
            <p
              className="text-4xl font-semibold"
              style={{
                color: secondaryColor,
                textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
              }}
            >
              Time Remaining Until Ishraq
            </p>
          </div>

          {/* Countdown timer */}
          <div className="flex items-center justify-center gap-8 mb-8">
            {/* Minutes */}
            <div className="text-center">
              <div
                className="relative inline-block"
                style={{
                  animation:
                    timeLeft <= 60 ? "pulse 1s ease-in-out infinite" : "none",
                }}
              >
                <div
                  className="text-[12rem] font-black leading-none"
                  style={{
                    fontFamily: "'Oxanium', monospace",
                    fontWeight: 1000,
                    color: timeLeft <= 60 ? "#EF4444" : accentColor,
                    textShadow:
                      timeLeft <= 60
                        ? `0 0 30px #EF444480, 0 0 60px #EF444460, 6px 6px 20px rgba(0,0,0,0.9)`
                        : `0 0 30px ${accentColor}80, 0 0 60px ${accentColor}60, 6px 6px 20px rgba(0,0,0,0.9)`,
                    letterSpacing: "0.1em",
                  }}
                >
                  {minutes}
                </div>
              </div>
              <div
                className="text-3xl font-bold mt-2"
                style={{
                  color: secondaryColor,
                  textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                }}
              >
                MINUTES
              </div>
            </div>

            {/* Separator */}
            <div
              className="text-[8rem] font-black leading-none"
              style={{
                color: accentColor,
                textShadow: `0 0 20px ${accentColor}60`,
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
                    timeLeft <= 60 ? "pulse 1s ease-in-out infinite" : "none",
                }}
              >
                <div
                  className="text-[12rem] font-black leading-none"
                  style={{
                    fontFamily: "'Oxanium', monospace",
                    fontWeight: 1000,
                    color: timeLeft <= 60 ? "#EF4444" : accentColor,
                    textShadow:
                      timeLeft <= 60
                        ? `0 0 30px #EF444480, 0 0 60px #EF444460, 6px 6px 20px rgba(0,0,0,0.9)`
                        : `0 0 30px ${accentColor}80, 0 0 60px ${accentColor}60, 6px 6px 20px rgba(0,0,0,0.9)`,
                    letterSpacing: "0.1em",
                  }}
                >
                  {seconds}
                </div>
              </div>
              <div
                className="text-3xl font-bold mt-2"
                style={{
                  color: secondaryColor,
                  textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                }}
              >
                SECONDS
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-4xl mx-auto">
            <div
              className="h-4 rounded-full overflow-hidden"
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: `1px solid ${accentColor}40`,
              }}
            >
              <div
                className="h-full transition-all duration-1000 ease-linear rounded-full"
                style={{
                  width: `${progressPercentage}%`,
                  background: `linear-gradient(90deg, ${secondaryColor} 0%, ${accentColor} 100%)`,
                  boxShadow: `0 0 20px ${accentColor}60`,
                }}
              />
            </div>
          </div>

          {/* Info text */}
          <div className="text-center mt-8">
            <p
              className="text-3xl font-semibold"
              style={{
                color: "#94a3b8",
                textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
              }}
            >
              Ishraq prayer begins 20 minutes after sunrise ☀️
            </p>
          </div>

          {/* Corner decorative elements */}
          <div
            className="absolute top-0 left-0 w-20 h-20 rounded-tl-3xl"
            style={{
              background: `linear-gradient(135deg, ${accentColor}30 0%, transparent 100%)`,
            }}
          />
          <div
            className="absolute top-0 right-0 w-20 h-20 rounded-tr-3xl"
            style={{
              background: `linear-gradient(225deg, ${accentColor}30 0%, transparent 100%)`,
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-20 h-20 rounded-bl-3xl"
            style={{
              background: `linear-gradient(45deg, ${accentColor}30 0%, transparent 100%)`,
            }}
          />
          <div
            className="absolute bottom-0 right-0 w-20 h-20 rounded-br-3xl"
            style={{
              background: `linear-gradient(315deg, ${accentColor}30 0%, transparent 100%)`,
            }}
          />
        </div>

        {/* Decorative bottom border */}
        <div
          className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 w-64 h-1"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${secondaryColor} 50%, transparent 100%)`,
            boxShadow: `0 0 20px ${secondaryColor}`,
          }}
        />
      </div>
    </div>
  );
};
