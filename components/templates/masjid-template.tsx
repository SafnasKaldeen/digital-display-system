"use client";

import React, { useState, useEffect, useRef } from "react";
import { MasjidTemplateAuthentic } from "./masjid-template-authentic";

interface MasjidCustomization {
  template: string;
  layout: string;
  masjidName: string;
  prayerTimes: {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
  prayerNames: {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
  iqamahOffsets: {
    fajr: number;
    sunrise: number;
    dhuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
  };
  colors: {
    primary: string;
    secondary: string;
    text: string;
    accent: string;
  };
  backgroundType: string;
  backgroundImage: string[];
  slideshowDuration: number;
  announcements: Array<{ text: string; duration: number }>;
  announcementImages: Array<{
    id: string;
    url: string;
    duration: number;
    frequency?: number;
    schedule?: string[];
    name?: string;
  }>;
  showHijriDate: boolean;
  showArabic?: boolean;
  font: string;
  prayerInstructionImage: string;
  prayerInstructionDuration: number;
  language?: string;
}

interface MasjidTemplateProps {
  customization: MasjidCustomization;
  backgroundStyle: React.CSSProperties;
}

// Helper function to get display name for prayer (show Jummah instead of Dhuhr on Friday)
const getPrayerDisplayName = (prayerName: string, language: string) => {
  const now = new Date();
  const isFriday = now.getDay() === 5; // 5 = Friday

  // Check for various forms of Dhuhr/Zuhr
  const isDhuhr =
    prayerName.toLowerCase().includes("dhuhr") ||
    prayerName.toLowerCase().includes("zuhr") ||
    prayerName.toLowerCase() === "ழுஹர்" ||
    prayerName === "Dhuhr" ||
    prayerName === "Zuhr";
  prayerName.toLowerCase().includes("noon prayer") ||
    prayerName.toLowerCase().includes("ظهر");

  if (isFriday && isDhuhr) {
    if (language === "ta") {
      return "ஜும்மா";
    }
    return "Jummah";
  }
  return prayerName;
};

// Translations for labels
const translations = {
  en: {
    adhan: "ADHAN",
    iqamah: "IQAMAH",
    adhanIn: "ADHAN IN",
    iqamahIn: "IQAMAH IN",
    nextAdhan: "Next Adhan",
    nextIqamah: "Iqamah",
    currentTime: "Current Time",
    islamicDate: "Islamic Date",
    ishraqTime: "ISHRAQ PRAYER",
    ishraqSubtitle: "Time for Ishraq prayer",
    ishraqRemaining: "Time Remaining",
    current: "CURRENT",
    next: "NEXT",
  },
  ta: {
    adhan: "அதான்",
    iqamah: "இகாமத்",
    adhanIn: "அதான் நேரம்",
    iqamahIn: "இகாமத் நேரம்",
    nextAdhan: "அடுத்த அதான்",
    nextIqamah: "இகாமத்",
    currentTime: "தற்போதைய நேரம்",
    islamicDate: "இஸ்லாமிய தேதி",
    ishraqTime: "இஷ்ராக் தொழுகை",
    ishraqSubtitle: "இஷ்ராக் தொழுகைக்கான நேரம்",
    ishraqRemaining: "மீதமுள்ள நேரம்",
    current: "தற்போதைய",
    next: "அடுத்து",
  },
};

interface PrayerInstructionsProps {
  totalDuration: number; // Full duration in milliseconds
  imageUrl: string;
  accentColor: string;
  duration: number; // Remaining time in milliseconds
  onClose: () => void;
}

export const PrayerInstructions: React.FC<PrayerInstructionsProps> = ({
  totalDuration,
  imageUrl,
  accentColor,
  duration,
  onClose,
}) => {
  const [remainingTime, setRemainingTime] = useState(duration);

  // Format time for display
  const formatTime = (ms: number) => {
    if (ms <= 0) return "0:00";
    const seconds = Math.ceil(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate progress percentage
  const progressPercentage =
    totalDuration > 0
      ? Math.max(
          0,
          Math.min(100, ((totalDuration - remainingTime) / totalDuration) * 100)
        )
      : 0;

  // Update remaining time and handle auto-close
  useEffect(() => {
    setRemainingTime(duration);
  }, [duration]);

  useEffect(() => {
    if (duration <= 0) {
      onClose();
    }
  }, [duration, onClose]);

  // Countdown in seconds for the timer
  const countdownSeconds = Math.ceil(remainingTime / 1000);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Fullscreen background image */}
      <div className="relative w-full h-full">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
        >
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        {/* Top right corner countdown timer */}
        <div className="absolute top-6 right-6 z-10">
          <CountdownTimer
            remainingTime={remainingTime}
            countdownSeconds={countdownSeconds}
            accentColor={accentColor}
            progressPercentage={progressPercentage}
            formatTime={formatTime}
          />
        </div>
      </div>
    </div>
  );
};

// Separate Countdown Timer Component
interface CountdownTimerProps {
  remainingTime: number;
  countdownSeconds: number;
  accentColor: string;
  progressPercentage: number;
  formatTime: (ms: number) => string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  remainingTime,
  countdownSeconds,
  accentColor,
  progressPercentage,
  formatTime,
}) => {
  return (
    <div className="flex flex-col items-end">
      {/* Timer container */}
      <div
        className="relative px-5 py-3 rounded-xl mb-3 backdrop-blur-md"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          border: `2px solid ${accentColor}`,
          boxShadow: `0 0 20px ${accentColor}40`,
        }}
      >
        <div className="flex flex-col items-center">
          {/* Title */}
          <div className="text-white/80 text-sm font-medium mb-1">
            Prayer Instructions
          </div>

          {/* Time display */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div
              className="text-3xl font-bold font-mono tracking-tight"
              style={{ color: accentColor }}
            >
              {formatTime(remainingTime)}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mt-2">
            <div
              className="h-full transition-all duration-300 ease-out rounded-full"
              style={{
                width: `${progressPercentage}%`,
                backgroundColor: accentColor,
                boxShadow: `0 0 8px ${accentColor}`,
              }}
            />
          </div>
        </div>

        {/* Corner accent */}
        <div
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
      </div>
    </div>
  );
};

// Ishraq Countdown Component - Sleek Modern Design
const IshraqCountdown = ({
  accentColor,
  secondaryColor,
  remainingSeconds,
  language,
  showElapsed,
  onClose,
}) => {
  const [timeLeft, setTimeLeft] = useState(remainingSeconds);
  const t = translations[language] || translations.en;

  useEffect(() => {
    setTimeLeft(remainingSeconds);
  }, [remainingSeconds]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return {
      minutes: mins.toString().padStart(2, "0"),
      seconds: secs.toString().padStart(2, "0"),
    };
  };

  const { minutes, seconds } = formatTime(timeLeft);
  const totalIshraqSeconds = 20 * 60;
  const progressPercentage =
    ((totalIshraqSeconds - timeLeft) / totalIshraqSeconds) * 100;

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

      {/* Main content container */}
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
              <h1
                className="text-8xl font-black tracking-wider"
                style={{
                  color: accentColor,
                  textShadow: `0 0 30px ${accentColor}80, 0 0 60px ${accentColor}60, 6px 6px 12px rgba(0,0,0,0.8)`,
                  fontFamily: "'Oxanium', sans-serif",
                }}
              >
                {t.ishraqTime.toUpperCase()}
              </h1>
            </div>
            <p
              className="text-5xl font-semibold"
              style={{
                color: secondaryColor,
                textShadow: `0 0 20px ${secondaryColor}60, 3px 3px 6px rgba(0,0,0,0.8)`,
              }}
            >
              {t.ishraqRemaining}
            </p>
          </div>

          {/* Countdown timer */}
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

            {/* Separator */}
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

          {/* Progress bar */}
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

          {/* Corner decorative elements */}
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

export function MasjidTemplate({
  customization,
  backgroundStyle,
}: MasjidTemplateProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextEvent, setNextEvent] = useState<{
    name: string;
    type: "adhan" | "iqamah";
    timeUntil: string;
  } | null>(null);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hijriDate, setHijriDate] = useState("");

  // Get language from config
  const language = customization.language || "en";
  const t =
    translations[language as keyof typeof translations] || translations.en;

  // Advertisement slideshow states
  const [activeAdvertisements, setActiveAdvertisements] = useState<any[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [adRemainingTime, setAdRemainingTime] = useState(0);
  const adTimerRef = useRef<NodeJS.Timeout | null>(null);
  const adCheckRef = useRef<NodeJS.Timeout | null>(null);
  const adCountdownRef = useRef<NodeJS.Timeout | null>(null);

  const currentAdIndexRef = useRef(0);
  const activeAdsRef = useRef<any[]>([]);
  const slideshowStartedRef = useRef(false);
  const isFirstAdRef = useRef(true);

  // Prayer instruction state
  const [showInstructions, setShowInstructions] = useState(false);
  const [instructionsPrayer, setInstructionsPrayer] = useState("");
  const [instructionsRemainingTime, setInstructionsRemainingTime] = useState(0);

  // Ishraq countdown states
  const [showIshraqCountdown, setShowIshraqCountdown] = useState(false);
  const [ishraqRemainingSeconds, setIshraqRemainingSeconds] = useState(0);

  // Keep refs in sync
  useEffect(() => {
    currentAdIndexRef.current = currentAdIndex;
  }, [currentAdIndex]);

  useEffect(() => {
    activeAdsRef.current = activeAdvertisements;
  }, [activeAdvertisements]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Hijri date
  useEffect(() => {
    fetchHijriDate();
  }, []);

  const fetchHijriDate = async () => {
    try {
      const today = new Date();
      const response = await fetch(
        `https://api.aladhan.com/v1/gToH/${today.getDate()}-${
          today.getMonth() + 1
        }-${today.getFullYear()}`
      );
      const data = await response.json();
      if (data.code === 200) {
        const hijri = data.data.hijri;
        setHijriDate(`${hijri.day}th - ${hijri.month.en} - ${hijri.year}`);
      }
    } catch (error) {
      console.error("Error fetching Hijri date:", error);
    }
  };

  // Prayer Instructions Check (HIGHEST PRIORITY)
  useEffect(() => {
    const checkInstructions = () => {
      if (
        !customization.prayerInstructionImage ||
        customization.prayerInstructionDuration <= 0
      ) {
        setShowInstructions(false);
        setInstructionsPrayer("");
        setInstructionsRemainingTime(0);
        return;
      }

      const now = new Date();
      const currentMinutes =
        now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

      const prayers = [
        {
          name: customization.prayerNames.fajr || "Fajr",
          key: "fajr",
          time: customization.prayerTimes.fajr,
          offset: customization.iqamahOffsets.fajr,
        },
        {
          name: customization.prayerNames.dhuhr || "Dhuhr",
          key: "dhuhr",
          time: customization.prayerTimes.dhuhr,
          offset: customization.iqamahOffsets.dhuhr,
        },
        {
          name: customization.prayerNames.asr || "Asr",
          key: "asr",
          time: customization.prayerTimes.asr,
          offset: customization.iqamahOffsets.asr,
        },
        {
          name: customization.prayerNames.maghrib || "Maghrib",
          key: "maghrib",
          time: customization.prayerTimes.maghrib,
          offset: customization.iqamahOffsets.maghrib,
        },
        {
          name: customization.prayerNames.isha || "Isha",
          key: "isha",
          time: customization.prayerTimes.isha,
          offset: customization.iqamahOffsets.isha,
        },
      ];

      let shouldShowInstructions = false;
      let prayerName = "";
      let remainingMs = 0;

      for (const prayer of prayers) {
        const [hours, minutes] = prayer.time.split(":").map(Number);
        const adhanMinutes = hours * 60 + minutes;
        const iqamahMinutes = adhanMinutes + prayer.offset;

        const timeSinceIqamah = currentMinutes - iqamahMinutes;
        const durationInMinutes = customization.prayerInstructionDuration / 60;

        // Show instructions AFTER Iqamah (not Adhan)
        if (timeSinceIqamah >= 0 && timeSinceIqamah <= durationInMinutes) {
          shouldShowInstructions = true;
          prayerName = getPrayerDisplayName(
            prayer.name,
            customization.language
          );

          // Calculate remaining time in milliseconds
          const remainingMinutes = durationInMinutes - timeSinceIqamah;
          remainingMs = Math.max(0, remainingMinutes * 60 * 1000);
          break;
        }
      }

      // Only update state if there's a change
      if (shouldShowInstructions) {
        setShowInstructions(true);
        setInstructionsPrayer(prayerName);
        // This will trigger the component to update its internal timer
        setInstructionsRemainingTime(remainingMs);
      } else if (showInstructions) {
        // Only hide if currently showing
        setShowInstructions(false);
        setInstructionsPrayer("");
        setInstructionsRemainingTime(0);
      }
    };

    checkInstructions();
    const interval = setInterval(checkInstructions, 1000);
    return () => clearInterval(interval);
  }, [customization, showInstructions]);

  // Ishraq Countdown Check
  useEffect(() => {
    const checkIshraqTime = () => {
      const now = new Date();
      const currentMinutes =
        now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

      const [sunriseHours, sunriseMinutes] = customization.prayerTimes.sunrise
        .split(":")
        .map(Number);
      const sunriseMinutesTotal = sunriseHours * 60 + sunriseMinutes;

      const timeSinceSunrise = currentMinutes - sunriseMinutesTotal;

      if (timeSinceSunrise >= 0 && timeSinceSunrise <= 20) {
        const remainingMinutes = 20 - timeSinceSunrise;
        const remainingSeconds = Math.max(0, Math.floor(remainingMinutes * 60));
        setShowIshraqCountdown(true);
        setIshraqRemainingSeconds(remainingSeconds);
        return;
      }

      setShowIshraqCountdown(false);
      setIshraqRemainingSeconds(0);
    };

    checkIshraqTime();
    const interval = setInterval(checkIshraqTime, 1000);
    return () => clearInterval(interval);
  }, [customization.prayerTimes.sunrise]);

  // Advertisement Slideshow Check
  useEffect(() => {
    const checkAdvertisements = () => {
      if (showInstructions || showIshraqCountdown) {
        clearAllAdTimers();
        resetSlideshowState();
        return;
      }

      if (slideshowStartedRef.current) {
        if (shouldStopSlideshow()) {
          clearAllAdTimers();
          resetSlideshowState();
        }
        return;
      }

      if (
        !customization.announcementImages ||
        customization.announcementImages.length === 0
      ) {
        return;
      }

      const now = new Date();
      const currentMinute = now.getMinutes().toString().padStart(2, "0");
      const currentSecond = now.getSeconds();

      if (currentSecond > 5) return;

      const getScheduleFromAnnouncement = (ad: any): string[] => {
        if (ad.schedule && ad.schedule.length > 0) {
          return ad.schedule;
        }
        return ["00", "10", "20", "30", "40", "50"];
      };

      const scheduledAds = customization.announcementImages.filter((ad) => {
        const schedule = getScheduleFromAnnouncement(ad);
        return schedule.includes(currentMinute);
      });

      if (scheduledAds.length === 0) return;

      startAdvertisementSlideshow(scheduledAds);
    };

    adCheckRef.current = setInterval(checkAdvertisements, 1000);

    return () => {
      clearAllAdTimers();
      if (adCheckRef.current) clearInterval(adCheckRef.current);
    };
  }, [customization.announcementImages, showInstructions, showIshraqCountdown]);

  const clearAllAdTimers = () => {
    if (adTimerRef.current) {
      clearTimeout(adTimerRef.current);
      adTimerRef.current = null;
    }
    if (adCountdownRef.current) {
      clearInterval(adCountdownRef.current);
      adCountdownRef.current = null;
    }
  };

  const resetSlideshowState = () => {
    setActiveAdvertisements([]);
    setCurrentAdIndex(0);
    setAdRemainingTime(0);
    slideshowStartedRef.current = false;
    isFirstAdRef.current = true;
    activeAdsRef.current = [];
    currentAdIndexRef.current = 0;
  };

  const shouldStopSlideshow = (): boolean => {
    const ads = activeAdsRef.current;
    const currentIdx = currentAdIndexRef.current;
    if (
      !isFirstAdRef.current &&
      ads.length > 0 &&
      currentIdx === ads.length - 1
    ) {
      return true;
    }
    return false;
  };

  const startAdvertisementSlideshow = (ads: any[]) => {
    if (ads.length === 0) return;

    clearAllAdTimers();
    slideshowStartedRef.current = true;
    isFirstAdRef.current = true;

    setActiveAdvertisements(ads);
    setCurrentAdIndex(0);
    currentAdIndexRef.current = 0;
    activeAdsRef.current = ads;

    const firstAdDuration = ads[0].duration * 1000;
    setAdRemainingTime(firstAdDuration);

    adTimerRef.current = setTimeout(() => {
      goToNextAdvertisement();
    }, firstAdDuration);

    adCountdownRef.current = setInterval(() => {
      setAdRemainingTime((prev) => {
        const newTime = prev - 1000;
        if (newTime <= 0) {
          goToNextAdvertisement();
          return 0;
        }
        return newTime;
      });
    }, 1000);
  };

  const goToNextAdvertisement = () => {
    const currentAds = activeAdsRef.current;
    if (currentAds.length === 0) {
      endSlideshow();
      return;
    }

    const currentIdx = currentAdIndexRef.current;

    if (isFirstAdRef.current) {
      isFirstAdRef.current = false;
    }

    if (currentIdx === currentAds.length - 1) {
      endSlideshow();
      return;
    }

    const nextIndex = currentIdx + 1;
    setCurrentAdIndex(nextIndex);
    currentAdIndexRef.current = nextIndex;

    const nextAdDuration = currentAds[nextIndex].duration * 1000;
    setAdRemainingTime(nextAdDuration);

    if (adTimerRef.current) {
      clearTimeout(adTimerRef.current);
    }

    adTimerRef.current = setTimeout(() => {
      goToNextAdvertisement();
    }, nextAdDuration);
  };

  const endSlideshow = () => {
    clearAllAdTimers();
    resetSlideshowState();
  };

  const handleNextAdvertisement = () => {
    const currentAds = activeAdsRef.current;
    if (currentAds.length === 0) return;

    const currentIdx = currentAdIndexRef.current;

    if (isFirstAdRef.current) {
      isFirstAdRef.current = false;
    }

    if (currentIdx === currentAds.length - 1) {
      endSlideshow();
      return;
    }

    const nextIndex = currentIdx + 1;
    setCurrentAdIndex(nextIndex);
    currentAdIndexRef.current = nextIndex;

    const nextAdDuration = currentAds[nextIndex].duration * 1000;
    setAdRemainingTime(nextAdDuration);

    if (adTimerRef.current) {
      clearTimeout(adTimerRef.current);
    }

    adTimerRef.current = setTimeout(() => {
      goToNextAdvertisement();
    }, nextAdDuration);
  };

  // Calculate next event (Adhan or Iqamah)
  useEffect(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const currentSeconds = now.getSeconds();

    const prayers = [
      {
        name: customization.prayerNames.fajr || "Fajr",
        adhan: customization.prayerTimes.fajr,
        offset: customization.iqamahOffsets.fajr,
      },
      {
        name: customization.prayerNames.dhuhr || "Dhuhr",
        adhan: customization.prayerTimes.dhuhr,
        offset: customization.iqamahOffsets.dhuhr,
      },
      {
        name: customization.prayerNames.asr || "Asr",
        adhan: customization.prayerTimes.asr,
        offset: customization.iqamahOffsets.asr,
      },
      {
        name: customization.prayerNames.maghrib || "Maghrib",
        adhan: customization.prayerTimes.maghrib,
        offset: customization.iqamahOffsets.maghrib,
      },
      {
        name: customization.prayerNames.isha || "Isha",
        adhan: customization.prayerTimes.isha,
        offset: customization.iqamahOffsets.isha,
      },
    ];

    let foundNext = false;

    for (const prayer of prayers) {
      const [adhanHours, adhanMinutes] = prayer.adhan.split(":").map(Number);
      const adhanTime = adhanHours * 60 + adhanMinutes;
      const iqamahTime = adhanTime + prayer.offset;

      const currentTotalMinutes = currentMinutes + currentSeconds / 60;

      if (adhanTime > currentTotalMinutes) {
        const diffInMinutes = adhanTime - currentTotalMinutes;
        const totalSecondsUntil = Math.floor(diffInMinutes * 60);

        const hours = Math.floor(totalSecondsUntil / 3600);
        const minutes = Math.floor((totalSecondsUntil % 3600) / 60);
        const seconds = totalSecondsUntil % 60;

        setNextEvent({
          name: getPrayerDisplayName(prayer.name, customization.language),
          type: "adhan",
          timeUntil: `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
        });
        foundNext = true;
        break;
      }

      if (
        adhanTime <= currentTotalMinutes &&
        iqamahTime > currentTotalMinutes
      ) {
        const diffInMinutes = iqamahTime - currentTotalMinutes;
        const totalSecondsUntil = Math.floor(diffInMinutes * 60);

        const hours = Math.floor(totalSecondsUntil / 3600);
        const minutes = Math.floor((totalSecondsUntil % 3600) / 60);
        const seconds = totalSecondsUntil % 60;

        setNextEvent({
          name: getPrayerDisplayName(prayer.name, customization.language),
          type: "iqamah",
          timeUntil: `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
        });
        foundNext = true;
        break;
      }
    }

    if (!foundNext) {
      const [hours, minutes] = prayers[0].adhan.split(":").map(Number);
      const fajrMinutes = hours * 60 + minutes;

      const minutesLeftToday = 24 * 60 - (currentMinutes + currentSeconds / 60);
      const totalDiffInMinutes = minutesLeftToday + fajrMinutes;
      const totalSecondsUntil = Math.floor(totalDiffInMinutes * 60);

      const displayHours = Math.floor(totalSecondsUntil / 3600);
      const displayMinutes = Math.floor((totalSecondsUntil % 3600) / 60);
      const displaySeconds = totalSecondsUntil % 60;

      setNextEvent({
        name: getPrayerDisplayName(prayers[0].name, customization.language),
        type: "adhan",
        timeUntil: `${displayHours.toString().padStart(2, "0")}:${displayMinutes
          .toString()
          .padStart(2, "0")}:${displaySeconds.toString().padStart(2, "0")}`,
      });
    }
  }, [
    currentTime,
    customization.prayerTimes,
    customization.prayerNames,
    customization.iqamahOffsets,
  ]);

  // Announcement rotation
  useEffect(() => {
    if (customization.announcements.length === 0) return;

    const interval = setInterval(() => {
      setCurrentAnnouncement(
        (prev) => (prev + 1) % customization.announcements.length
      );
    }, (customization.announcements[currentAnnouncement]?.duration || 5) * 1000);

    return () => clearInterval(interval);
  }, [customization.announcements, currentAnnouncement]);

  // Slideshow rotation
  useEffect(() => {
    if (
      customization.backgroundType === "slideshow" &&
      customization.backgroundImage &&
      customization.backgroundImage.length > 1
    ) {
      const interval = setInterval(() => {
        setCurrentImageIndex(
          (prev) => (prev + 1) % customization.backgroundImage.length
        );
      }, customization.slideshowDuration * 1000);

      return () => clearInterval(interval);
    }
  }, [
    customization.backgroundType,
    customization.backgroundImage,
    customization.slideshowDuration,
  ]);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = Number.parseInt(hours);
    const isAM = hour < 12;
    const displayHour = hour % 12 || 12;
    return `${displayHour.toString().padStart(2, "0")}:${minutes} ${
      isAM ? "AM" : "PM"
    }`;
  };

  const calculateIqamahTime = (adhanTime: string, offset: number) => {
    const [hours, minutes] = adhanTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + offset;
    const iqamahHours = Math.floor(totalMinutes / 60) % 24;
    const iqamahMinutes = totalMinutes % 60;
    return `${iqamahHours.toString().padStart(2, "0")}:${iqamahMinutes
      .toString()
      .padStart(2, "0")}`;
  };

  const textStyle = {
    color: customization.colors.text,
    fontFamily: customization.font,
    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
  };

  const prayers = [
    {
      name: customization.prayerNames.fajr || "Fajr",
      time: customization.prayerTimes.fajr,
      offset: customization.iqamahOffsets.fajr,
    },
    {
      name: customization.prayerNames.dhuhr || "Dhuhr",
      time: customization.prayerTimes.dhuhr,
      offset: customization.iqamahOffsets.dhuhr,
    },
    {
      name: customization.prayerNames.asr || "Asr",
      time: customization.prayerTimes.asr,
      offset: customization.iqamahOffsets.asr,
    },
    {
      name: customization.prayerNames.maghrib || "Maghrib",
      time: customization.prayerTimes.maghrib,
      offset: customization.iqamahOffsets.maghrib,
    },
    {
      name: customization.prayerNames.isha || "Isha",
      time: customization.prayerTimes.isha,
      offset: customization.iqamahOffsets.isha,
    },
  ];

  const getDynamicBackgroundStyle = () => {
    if (
      customization.backgroundType === "slideshow" &&
      customization.backgroundImage &&
      customization.backgroundImage.length > 0
    ) {
      return {
        ...backgroundStyle,
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${customization.backgroundImage[currentImageIndex]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        transition: "background-image 1s ease-in-out",
      };
    }
    return {
      ...backgroundStyle,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    };
  };

  const dynamicBackgroundStyle = getDynamicBackgroundStyle();

  const isCloseToAdhan = () => {
    if (!nextEvent || nextEvent.type !== "adhan") return false;
    const [hours, minutes] = nextEvent.timeUntil.split(":").map(Number);
    return hours === 0 && minutes <= 10;
  };

  // AUTHENTIC LAYOUT - Use imported component
  if (customization.layout === "authentic") {
    return (
      <MasjidTemplateAuthentic
        customization={customization}
        backgroundStyle={dynamicBackgroundStyle}
      />
    );
  }

  // PRIORITY 1: Show Ishraq countdown
  if (showIshraqCountdown) {
    return (
      <IshraqCountdown
        showElapsed={true}
        accentColor={customization.colors.accent}
        secondaryColor={customization.colors.secondary}
        remainingSeconds={ishraqRemainingSeconds}
        language={language}
        onClose={() => {
          setShowIshraqCountdown(false);
          setIshraqRemainingSeconds(0);
        }}
      />
    );
  }

  // PRIORITY 2: Show Prayer Instructions
  if (showInstructions && customization.prayerInstructionImage) {
    const totalDurationMs = customization.prayerInstructionDuration * 1000;

    return (
      <PrayerInstructions
        totalDuration={totalDurationMs}
        imageUrl={customization.prayerInstructionImage}
        accentColor={customization.colors.accent}
        duration={instructionsRemainingTime}
        onClose={() => {
          setShowInstructions(false);
          setInstructionsPrayer("");
          setInstructionsRemainingTime(0);
        }}
      />
    );
  }

  // PRIORITY 3: Show Advertisement Slideshow
  if (
    activeAdvertisements.length > 0 &&
    !showInstructions &&
    !showIshraqCountdown
  ) {
    const currentAd = activeAdvertisements[currentAdIndex];

    return (
      <div className="fixed inset-0 z-50 bg-black">
        <div className="relative w-full h-full">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${currentAd.url})` }}
          >
            <div className="absolute inset-0 bg-black/40"></div>
          </div>

          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="text-white text-lg font-semibold bg-black/50 px-4 py-2 rounded-lg">
              {currentAd.name || "Advertisement"} ({currentAdIndex + 1}/
              {activeAdvertisements.length})
            </div>

            <button
              onClick={handleNextAdvertisement}
              className="text-white hover:text-gray-300 text-sm font-medium px-4 py-1.5 rounded-lg bg-black/50 hover:bg-black/70 transition-colors"
            >
              Next Ad
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-2">
                <div className="text-white text-lg font-semibold">
                  Changes in: {Math.ceil(adRemainingTime / 1000)}s
                </div>
              </div>

              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-100 ease-linear"
                  style={{
                    width: `${
                      (adRemainingTime / (currentAd.duration * 1000)) * 100
                    }%`,
                    backgroundColor: customization.colors.accent,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const MasjidHeader = () => (
    <div className="text-center mb-6">
      <h1
        className="text-6xl font-bold leading-tight mb-3"
        style={{
          ...textStyle,
          color: customization.colors.accent,
          textShadow: "3px 3px 6px rgba(0, 0, 0, 0.9)",
        }}
      >
        {customization.masjidName}
      </h1>
      <div
        className="w-64 h-1.5 mx-auto rounded-full"
        style={{ backgroundColor: customization.colors.accent }}
      ></div>
    </div>
  );

  // VERTICAL LAYOUT - ENHANCED WITH NEXT PRAYER HIGHLIGHTING
  const renderVerticalLayout = () => {
    const formatTimeNoAMPM = (time: string) => {
      const [hours, minutes] = time.split(":");
      const hour = Number.parseInt(hours);
      const displayHour = hour % 12 || 12;
      return `${displayHour.toString().padStart(2, "0")}:${minutes}`;
    };

    // Determine which prayer is currently active (between Adhan and Iqamah)
    const getCurrentPrayer = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const currentSeconds = now.getSeconds();
      const currentTotalMinutes = currentMinutes + currentSeconds / 60;

      for (const prayer of prayers) {
        const [hours, minutes] = prayer.time.split(":").map(Number);
        const adhanTime = hours * 60 + minutes;
        const iqamahTime = adhanTime + prayer.offset;

        if (
          currentTotalMinutes >= adhanTime &&
          currentTotalMinutes < iqamahTime
        ) {
          // Calculate countdown to Iqamah
          const iqamahDiff = iqamahTime - currentTotalMinutes;
          const iqamahSeconds = Math.floor(iqamahDiff * 60);
          const iqamahMins = Math.floor(iqamahSeconds / 60);
          const iqamahSecs = iqamahSeconds % 60;

          return {
            prayer,
            isActive: true,
            countdownMins: iqamahMins.toString().padStart(2, "0"),
            countdownSecs: iqamahSecs.toString().padStart(2, "0"),
          };
        }
      }
      return { prayer: null, isActive: false };
    };

    // NEW: Get next upcoming prayer and time until it
    const getNextUpcomingPrayer = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const currentSeconds = now.getSeconds();
      const currentTotalMinutes = currentMinutes + currentSeconds / 60;

      // Find the next prayer that hasn't started yet (Adhan hasn't occurred)
      for (const prayer of prayers) {
        const [hours, minutes] = prayer.time.split(":").map(Number);
        const adhanTime = hours * 60 + minutes;

        if (adhanTime > currentTotalMinutes) {
          const diffInMinutes = adhanTime - currentTotalMinutes;
          return {
            prayer,
            minutesUntil: diffInMinutes,
            isWithin10Minutes: diffInMinutes <= 10,
            isWithin5Minutes: diffInMinutes <= 5,
            isWithin2Minutes: diffInMinutes <= 2,
            isWithin1Minute: diffInMinutes <= 1,
          };
        }
      }

      // If no prayer found today, return tomorrow's Fajr
      return {
        prayer: prayers[0],
        minutesUntil: 999,
        isWithin10Minutes: false,
        isWithin5Minutes: false,
        isWithin2Minutes: false,
        isWithin1Minute: false,
      };
    };

    const currentPrayerInfo = getCurrentPrayer();
    const nextPrayerInfo = getNextUpcomingPrayer();

    return (
      <div className="w-full h-full flex flex-col p-8 relative overflow-hidden">
        <style>
          {`  
            @keyframes glowPulse {
              0%, 100% {
                box-shadow: 
                  0 0 40px ${customization.colors.accent}60,
                  0 0 80px ${customization.colors.accent}40,
                  0 25px 50px rgba(0, 0, 0, 0.6);
              }
              50% {
                box-shadow: 
                  0 0 60px ${customization.colors.accent}90,
                  0 0 120px ${customization.colors.accent}70,
                  0 25px 50px rgba(0, 0, 0, 0.8);
              }
            }
            
            @keyframes shimmer {
              0% { background-position: -200% center; }
              100% { background-position: 200% center; }
            }

            @keyframes urgentBlink {
              0%, 100% { 
                opacity: 1;
                transform: scale(1);
              }
              50% { 
                opacity: 0.4;
                transform: scale(1.02);
              }
            }
            
            @keyframes moderateBlink {
              0%, 100% { 
                opacity: 1;
                transform: scale(1);
              }
              50% { 
                opacity: 0.6;
                transform: scale(1.01);
              }
            }
            
            @keyframes gentleBlink {
              0%, 100% { 
                opacity: 1;
                transform: scale(1);
              }
              50% { 
                opacity: 0.8;
                transform: scale(1.005);
              }
            }
            
            @keyframes pulse {
              0%, 100% {
                transform: scale(1);
              }
              50% {
                transform: scale(1.1);
              }
            }
            
            @keyframes glowPulse {
              0%, 100% {
                filter: brightness(1);
              }
              50% {
                filter: brightness(1.3);
              }
            }
          `}
        </style>

        {/* Top: Masjid Header with config-based design */}
        <div className="mb-12 text-center relative z-10">
          <div className="inline-block px-12 py-4 mb-6 rounded-full">
            <h1
              className="text-6xl font-bold leading-none tracking-wider"
              style={{
                color: customization.colors.text,
                textShadow: `
                0 2px 10px rgba(0, 0, 0, 0.8),
                0 4px 20px ${customization.colors.primary}40,
                0 8px 30px ${customization.colors.primary}20
              `,
                fontFamily: customization.font,
                letterSpacing: "0.1em",
              }}
            >
              {customization.masjidName}
            </h1>
          </div>
          <div
            className="h-1 w-48 mx-auto rounded-full"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${customization.colors.accent} 50%, transparent 100%)`,
              boxShadow: `0 0 20px ${customization.colors.accent}40`,
            }}
          ></div>
        </div>

        <div className="flex-1 grid grid-cols-[45%_55%] gap-8 min-h-0 relative z-10">
          {/* Left Section: Prayer Times */}
          <div
            className="flex flex-col rounded-3xl p-6 backdrop-blur-sm"
            style={{
              background: `
              linear-gradient(165deg, 
                ${customization.colors.primary}20 0%, 
                ${customization.colors.primary}10 30%,
                ${customization.colors.primary}05 70%,
                ${customization.colors.primary}02 100%
              )
            `,
              border: `2px solid ${customization.colors.primary}40`,
              boxShadow: `
              0 25px 50px -12px rgba(0, 0, 0, 0.6),
              inset 0 1px 0 ${customization.colors.primary}20,
              inset 0 -1px 0 ${customization.colors.primary}10
            `,
            }}
          >
            {/* ADHAN IQAMAH Header */}
            <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 mb-10 mt-4 px-3">
              <div></div>
              <div className="relative">
                <div
                  className="text-center text-4xl font-bold italic tracking-wider relative"
                  style={{
                    color: customization.colors.text,
                    textShadow: `
                    2px 2px 8px rgba(0, 0, 0, 0.8),
                    0 0 30px ${customization.colors.primary}40
                  `,
                    fontFamily: customization.font,
                  }}
                >
                  {t.adhan}
                  <div
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 rounded-full"
                    style={{
                      background: `linear-gradient(90deg, transparent 0%, ${customization.colors.primary} 50%, transparent 100%)`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="relative">
                <div
                  className="text-center text-4xl font-bold italic tracking-wider"
                  style={{
                    color: customization.colors.text,
                    textShadow: `
                    2px 2px 8px rgba(0, 0, 0, 0.8),
                    0 0 30px ${customization.colors.secondary}40
                  `,
                    fontFamily: customization.font,
                  }}
                >
                  {t.iqamah}
                  <div
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 rounded-full"
                    style={{
                      background: `linear-gradient(90deg, transparent 0%, ${customization.colors.secondary} 50%, transparent 100%)`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Prayer Times Grid */}
            <div className="flex-1 flex flex-col justify-between gap-4">
              {prayers.map((prayer, index) => {
                const isCurrentPrayer =
                  currentPrayerInfo.isActive &&
                  currentPrayerInfo.prayer?.name === prayer.name;

                const isNextPrayer =
                  nextPrayerInfo.prayer?.name === prayer.name;

                // New: Determine urgency levels
                const isUpcomingSoon =
                  isNextPrayer && nextPrayerInfo.isWithin10Minutes;
                const isVeryClose =
                  isNextPrayer && nextPrayerInfo.isWithin5Minutes;
                const isExtremelyClose =
                  isNextPrayer && nextPrayerInfo.isWithin2Minutes;
                const isCritical =
                  isNextPrayer && nextPrayerInfo.isWithin1Minute;

                // Determine animation style based on urgency
                let blinkAnimation = "";
                let blinkSpeed = "";
                let glowIntensity = "";

                if (isCritical) {
                  blinkAnimation = "urgentBlink 0.3s ease-in-out infinite";
                  glowIntensity = "0 0 50px rgba(255, 0, 0, 0.8)";
                } else if (isExtremelyClose) {
                  blinkAnimation = "urgentBlink 0.5s ease-in-out infinite";
                  glowIntensity = "0 0 40px rgba(255, 100, 0, 0.8)";
                } else if (isVeryClose) {
                  blinkAnimation = "moderateBlink 0.8s ease-in-out infinite";
                  glowIntensity = "0 0 35px rgba(255, 200, 0, 0.7)";
                } else if (isUpcomingSoon) {
                  blinkAnimation = "gentleBlink 1.2s ease-in-out infinite";
                  glowIntensity = "0 0 30px rgba(255, 255, 0, 0.6)";
                } else if (isNextPrayer) {
                  // Always highlight next prayer, even if far away
                  blinkAnimation = "";
                  glowIntensity = "0 0 25px rgba(0, 255, 255, 0.4)";
                }

                return (
                  <div
                    key={getPrayerDisplayName(
                      prayer.name,
                      customization.language
                    )}
                    className={`relative group transition-all duration-500 ${
                      isCurrentPrayer
                        ? "scale-[1.02]"
                        : isNextPrayer
                        ? "scale-[1.01]"
                        : ""
                    }`}
                    style={{
                      animation: blinkAnimation,
                    }}
                  >
                    {/* Enhanced glow effect for next prayer */}
                    {isNextPrayer && (
                      <div
                        className="absolute inset-0 rounded-2xl blur-xl -inset-2"
                        style={{
                          background: isCritical
                            ? `radial-gradient(ellipse at center, rgba(255, 0, 0, 0.4) 0%, transparent 70%)`
                            : isExtremelyClose
                            ? `radial-gradient(ellipse at center, rgba(255, 100, 0, 0.35) 0%, transparent 70%)`
                            : isVeryClose
                            ? `radial-gradient(ellipse at center, rgba(255, 200, 0, 0.3) 0%, transparent 70%)`
                            : isUpcomingSoon
                            ? `radial-gradient(ellipse at center, rgba(255, 255, 0, 0.25) 0%, transparent 70%)`
                            : `radial-gradient(ellipse at center, rgba(0, 255, 255, 0.2) 0%, transparent 70%)`,
                          animation: isNextPrayer
                            ? "glowPulse 2s ease-in-out infinite"
                            : "",
                        }}
                      ></div>
                    )}

                    <div
                      className={`grid grid-cols-[2fr_1fr_1fr] items-stretch gap-3 relative transition-all duration-300 ${
                        isNextPrayer ? "z-10" : ""
                      }`}
                      style={{
                        boxShadow: glowIntensity,
                      }}
                    >
                      {/* Prayer Name - Enhanced for next prayer */}
                      <div
                        className="relative py-2 overflow-hidden rounded-2xl flex items-center transition-all duration-500 group-hover:brightness-110"
                        style={{
                          background: isCurrentPrayer
                            ? `linear-gradient(135deg, 
                                ${customization.colors.accent}60 0%,
                                ${customization.colors.accent}40 50%,
                                ${customization.colors.accent}25 100%
                              )`
                            : isNextPrayer
                            ? `linear-gradient(135deg, 
                          ${
                            isCritical
                              ? "rgba(255, 0, 0, 0.3)"
                              : isExtremelyClose
                              ? "rgba(255, 100, 0, 0.25)"
                              : isVeryClose
                              ? "rgba(255, 200, 0, 0.2)"
                              : isUpcomingSoon
                              ? "rgba(255, 255, 0, 0.15)"
                              : `${customization.colors.accent}45`
                          } 0%,
                          ${
                            isCritical
                              ? "rgba(255, 0, 0, 0.2)"
                              : isExtremelyClose
                              ? "rgba(255, 100, 0, 0.15)"
                              : isVeryClose
                              ? "rgba(255, 200, 0, 0.12)"
                              : isUpcomingSoon
                              ? "rgba(255, 255, 0, 0.1)"
                              : `${customization.colors.accent}10`
                          } 50%,
                          ${
                            isCritical
                              ? "rgba(255, 0, 0, 0.1)"
                              : isExtremelyClose
                              ? "rgba(255, 100, 0, 0.08)"
                              : isVeryClose
                              ? "rgba(255, 200, 0, 0.06)"
                              : isUpcomingSoon
                              ? "rgba(255, 255, 0, 0.05)"
                              : `${customization.colors.accent}05`
                          } 100%
                        )`
                            : `linear-gradient(135deg, 
                ${customization.colors.primary}30 0%,
                ${customization.colors.primary}15 50%,
                ${customization.colors.primary}08 100%
              )`,
                          boxShadow: isCurrentPrayer
                            ? `
                0 20px 40px ${customization.colors.accent}30,
                inset 0 1px 0 rgba(255, 255, 255, 0.2),
                inset 0 -1px 0 rgba(0, 0, 0, 0.2)
              `
                            : isNextPrayer
                            ? `
                0 15px 35px ${
                  isCritical
                    ? "rgba(255, 0, 0, 0.4)"
                    : isExtremelyClose
                    ? "rgba(255, 100, 0, 0.35)"
                    : isVeryClose
                    ? "rgba(255, 200, 0, 0.3)"
                    : isUpcomingSoon
                    ? "rgba(255, 255, 0, 0.25)"
                    : `${customization.colors.accent}20`
                },
                inset 0 1px 0 rgba(255, 255, 255, 0.15),
                inset 0 -1px 0 rgba(0, 0, 0, 0.2)
              `
                            : `
                0 10px 30px rgba(0, 0, 0, 0.4),
                inset 0 1px 0 rgba(255, 255, 255, 0.1),
                inset 0 -1px 0 rgba(0, 0, 0, 0.2)
              `,
                          border: `1.5px solid ${
                            isCurrentPrayer
                              ? customization.colors.accent + "60"
                              : isNextPrayer
                              ? isCritical
                                ? "rgba(255, 0, 0, 0.6)"
                                : isExtremelyClose
                                ? "rgba(255, 100, 0, 0.5)"
                                : isVeryClose
                                ? "rgba(255, 200, 0, 0.4)"
                                : isUpcomingSoon
                                ? "rgba(255, 255, 0, 0.3)"
                                : customization.colors.accent + "30"
                              : customization.colors.primary + "40"
                          }`,
                        }}
                      >
                        {/* Animated gradient overlay for next prayer */}
                        {isNextPrayer && (
                          <div
                            className="absolute inset-0 opacity-30"
                            style={{
                              background: `linear-gradient(90deg, 
                transparent 0%, 
                ${
                  isCritical
                    ? "rgba(255, 0, 0, 0.4)"
                    : isExtremelyClose
                    ? "rgba(255, 100, 0, 0.3)"
                    : isVeryClose
                    ? "rgba(255, 200, 0, 0.2)"
                    : isUpcomingSoon
                    ? "rgba(255, 255, 0, 0.15)"
                    : `${customization.colors.accent}20`
                } 50%, 
                transparent 100%
              )`,
                              animation: "shimmer 2s ease-in-out infinite",
                            }}
                          ></div>
                        )}

                        <div className="relative px-8 py-6 flex items-center w-full">
                          {/* Decorative left accent - Color changes based on urgency */}
                          <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-4/5 rounded-r-full"
                            style={{
                              background: `linear-gradient(180deg, 
                                ${
                                  isCurrentPrayer
                                    ? customization.colors.accent
                                    : isNextPrayer
                                    ? isCritical
                                      ? "rgb(255, 0, 0)"
                                      : isExtremelyClose
                                      ? "rgb(255, 100, 0)"
                                      : isVeryClose
                                      ? "rgb(255, 200, 0)"
                                      : isUpcomingSoon
                                      ? "rgb(255, 255, 0)"
                                      : customization.colors.accent
                                    : customization.colors.secondary
                                } 0%,
                                ${
                                  isCurrentPrayer
                                    ? customization.colors.accent + "80"
                                    : isNextPrayer
                                    ? isCritical
                                      ? "rgba(255, 0, 0, 0.8)"
                                      : isExtremelyClose
                                      ? "rgba(255, 100, 0, 0.8)"
                                      : isVeryClose
                                      ? "rgba(255, 200, 0, 0.8)"
                                      : isUpcomingSoon
                                      ? "rgba(255, 255, 0, 0.8)"
                                      : customization.colors.accent + "80"
                                    : customization.colors.secondary + "80"
                                } 100%
                              )`,
                              boxShadow:
                                isCurrentPrayer || isNextPrayer
                                  ? isCritical
                                    ? "0 0 40px rgba(255, 0, 0, 0.8)"
                                    : isExtremelyClose
                                    ? "0 0 35px rgba(255, 100, 0, 0.8)"
                                    : isVeryClose
                                    ? "0 0 30px rgba(255, 200, 0, 0.8)"
                                    : isUpcomingSoon
                                    ? "0 0 25px rgba(255, 255, 0, 0.8)"
                                    : `0 0 30px ${customization.colors.accent}80`
                                  : `0 0 15px ${customization.colors.secondary}40`,
                            }}
                          ></div>

                          <h3
                            className="text-6xl font-bold uppercase tracking-wider ml-4 relative"
                            style={{
                              color:
                                isCurrentPrayer || isNextPrayer
                                  ? customization.colors.text
                                  : customization.colors.text,
                              textShadow: isCurrentPrayer
                                ? `
                    0 0 30px ${customization.colors.accent}60,
                    2px 2px 12px rgba(0, 0, 0, 0.9)
                  `
                                : isNextPrayer
                                ? `
                    0 0 25px ${
                      isCritical
                        ? "rgba(255, 0, 0, 0.6)"
                        : isExtremelyClose
                        ? "rgba(255, 100, 0, 0.5)"
                        : isVeryClose
                        ? "rgba(255, 200, 0, 0.4)"
                        : isUpcomingSoon
                        ? "rgba(255, 255, 0, 0.3)"
                        : customization.colors.accent + "60"
                    },
                    2px 2px 12px rgba(0, 0, 0, 0.9)
                  `
                                : "2px 2px 12px rgba(0, 0, 0, 0.9)",
                              fontFamily: customization.font,
                              letterSpacing: "0.05em",
                            }}
                          >
                            {getPrayerDisplayName(
                              prayer.name,
                              customization.language
                            )}
                          </h3>
                        </div>
                      </div>

                      {/* Adhan Time */}
                      <div
                        className="relative overflow-hidden rounded-2xl text-center flex items-center justify-center transition-all duration-500 group-hover:brightness-110"
                        style={{
                          background: `linear-gradient(135deg, 
                          ${customization.colors.text}F8 0%,
                          ${customization.colors.text}E0 100%
                        )`,
                          boxShadow: `
                          0 12px 32px rgba(0, 0, 0, 0.5),
                          inset 0 1px 0 rgba(255, 255, 255, 0.3),
                          inset 0 -1px 0 rgba(0, 0, 0, 0.2)
                        `,
                          border: `1.5px solid ${customization.colors.text}60`,
                        }}
                      >
                        <div className="relative px-4 py-4">
                          <p
                            className="text-6xl font-black leading-none tracking-tighter"
                            style={{
                              color: customization.colors.primary,
                              textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                              fontFamily: "'Orbitron', " + customization.font,
                              letterSpacing: "-0.02em",
                            }}
                          >
                            {formatTimeNoAMPM(prayer.time)}
                          </p>
                          <div
                            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 rounded-full"
                            style={{
                              background: `linear-gradient(90deg, transparent 0%, ${customization.colors.primary} 50%, transparent 100%)`,
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Iqamah Time */}
                      <div
                        className="relative overflow-hidden rounded-2xl text-center flex items-center justify-center transition-all duration-500 group-hover:brightness-110"
                        style={{
                          background: `linear-gradient(135deg, 
                          ${customization.colors.secondary} 0%,
                          ${customization.colors.secondary}DD 50%,
                          ${customization.colors.secondary}BB 100%
                        )`,
                          boxShadow: `
                          0 15px 35px rgba(0, 0, 0, 0.5),
                          inset 0 1px 0 rgba(255, 255, 255, 0.2),
                          inset 0 -1px 0 rgba(0, 0, 0, 0.3)
                        `,
                          border: `1.5px solid ${customization.colors.secondary}80`,
                        }}
                      >
                        <div className="relative px-4 py-4">
                          <p
                            className="text-6xl font-black leading-none tracking-tighter"
                            style={{
                              color: customization.colors.text,
                              textShadow: "2px 2px 8px rgba(0, 0, 0, 0.9)",
                              fontFamily: "'Orbitron', " + customization.font,
                              letterSpacing: "-0.02em",
                            }}
                          >
                            {formatTimeNoAMPM(
                              calculateIqamahTime(prayer.time, prayer.offset)
                            )}
                          </p>
                          <div
                            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 rounded-full"
                            style={{
                              background: `linear-gradient(90deg, transparent 0%, ${customization.colors.text}40 50%, transparent 100%)`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Section: Time, Date, and Countdown */}
          <div className="flex flex-col gap-6 h-full pr-8">
            {/* Current Time and Date Card */}
            <div
              className="px-10 pb-10 rounded-3xl relative backdrop-blur-sm"
              style={{
                background: `linear-gradient(165deg, 
                ${customization.colors.primary}20 0%,
                ${customization.colors.primary}10 30%,
                ${customization.colors.primary}05 70%,
                ${customization.colors.primary}02 100%
              )`,
                border: `2px solid ${customization.colors.primary}40`,
                boxShadow: `
                0 25px 50px -12px rgba(0, 0, 0, 0.6),
                inset 0 1px 0 ${customization.colors.primary}30,
                inset 0 -1px 0 ${customization.colors.primary}15
              `,
              }}
            >
              <div className="relative text-center flex flex-col justify-center">
                {/* Time with enhanced typography */}
                <div className="mb-6 mt-4">
                  <p
                    className="text-[11rem] font-black leading-none tracking-tighter font-mono"
                    style={{
                      color: customization.colors.text,
                      textShadow: `
                      0 2px 20px ${customization.colors.primary}30,
                      0 4px 30px rgba(0, 0, 0, 0.8),
                      0 8px 40px rgba(0, 0, 0, 0.6)
                    `,
                      fontFamily: "'Orbitron', 'Rajdhani', monospace",
                    }}
                  >
                    {currentTime
                      .toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true,
                      })
                      .replace(/\s?(AM|PM)/i, "")}
                  </p>
                  <div className="flex justify-center items-center gap-4 mt-0">
                    <div
                      className="h-0.5 flex-1"
                      style={{
                        background: `linear-gradient(90deg, transparent 0%, ${customization.colors.text}20 50%, transparent 100%)`,
                      }}
                    ></div>
                    <span
                      className="text-5xl font-bold px-4 py-2 rounded-full"
                      style={{
                        color: customization.colors.text,
                        textShadow: "0 2px 8px rgba(0, 0, 0, 0.8)",
                      }}
                    >
                      {currentTime.getHours() >= 12 ? "PM" : "AM"}
                    </span>
                    <div
                      className="h-0.5 flex-1"
                      style={{
                        background: `linear-gradient(90deg, transparent 0%, ${customization.colors.text}20 50%, transparent 100%)`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Date with enhanced styling */}
                <div className="mt-2">
                  <div className="inline-block px-8 py-1 rounded-full mb-0">
                    <p
                      className="text-5xl font-semibold"
                      style={{
                        color: customization.colors.text,
                        textShadow: `
                        0 2px 10px rgba(0, 0, 0, 0.8),
                        0 0 20px ${customization.colors.primary}20
                      `,
                        fontFamily: customization.font,
                        opacity: 0.95,
                        letterSpacing: "0.05em",
                      }}
                    >
                      {currentTime.toLocaleDateString("en-US", {
                        weekday: "long",
                        day: "numeric",
                      })}
                      <span className="mx-2">•</span>
                      {currentTime.toLocaleDateString("en-US", {
                        month: "long",
                      })}
                      <span className="mx-2">•</span>
                      {currentTime.getFullYear()}
                    </p>
                  </div>
                </div>

                {/* Hijri Date */}
                {hijriDate && customization.showHijriDate && (
                  <div className="mt-6">
                    <div
                      className="inline-block px-6 py-2 rounded-full"
                      style={{
                        background: `linear-gradient(135deg, ${customization.colors.secondary}25 0%, transparent 100%)`,
                        border: `1px solid ${customization.colors.secondary}40`,
                      }}
                    >
                      <p
                        className="text-3xl font-medium"
                        style={{
                          color: customization.colors.text,
                          textShadow: `
                          0 2px 8px rgba(0, 0, 0, 0.8),
                          0 0 20px ${customization.colors.secondary}20
                        `,
                          fontFamily: customization.font,
                          opacity: 0.9,
                        }}
                      >
                        {hijriDate}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Iqamah Countdown or Peace Be Upon Him */}
            {currentPrayerInfo.isActive ? (
              <div
                className="flex-1 p-10 rounded-3xl relative overflow-hidden backdrop-blur-sm"
                style={{
                  background: `linear-gradient(165deg, 
                  ${customization.colors.accent}50 0%,
                  ${customization.colors.accent}30 50%,
                  ${customization.colors.accent}15 100%
                )`,
                  border: `2px solid ${customization.colors.accent}80`,
                  boxShadow: `
                  0 30px 60px ${customization.colors.accent}40,
                  inset 0 1px 0 rgba(255, 255, 255, 0.3),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.3)
                `,
                }}
              >
                <div className="relative text-center flex flex-col justify-center h-full">
                  <div className="mb-8 flex items-baseline justify-center gap-6">
                    <p
                      className="text-7xl font-bold leading-none"
                      style={{
                        color: customization.colors.secondary,
                        textShadow: `
        3px 3px 12px rgba(0, 0, 0, 0.9),
        0 0 30px ${customization.colors.accent}60
      `,
                        fontFamily: customization.font,
                        letterSpacing: "0.05em",
                      }}
                    >
                      {getPrayerDisplayName(
                        currentPrayerInfo.prayer.name,
                        customization.language
                      )}
                    </p>
                    <p
                      className="text-6xl font-bold leading-none"
                      style={{
                        color: customization.colors.accent,
                        textShadow: `
        2px 2px 8px rgba(0, 0, 0, 0.8),
        0 0 20px ${customization.colors.accent}60
      `,
                        fontFamily: customization.font,
                      }}
                    >
                      {t.iqamahIn}
                    </p>
                  </div>

                  <div className="relative">
                    <p
                      className="text-[12rem] font-black leading-none tracking-tighter relative"
                      style={{
                        color: customization.colors.text,
                        textShadow: `
                        0 5px 30px ${customization.colors.accent}60,
                        0 10px 40px rgba(0, 0, 0, 0.8)
                      `,
                        fontFamily: "'Orbitron', 'Oxanium', monospace",
                        animation: "pulse 1.5s ease-in-out infinite",
                      }}
                    >
                      {currentPrayerInfo.countdownMins}:
                      {currentPrayerInfo.countdownSecs}
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-8 w-3/4 mx-auto">
                    <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: "100%",
                          background: `linear-gradient(90deg, 
                          ${customization.colors.accent}80 0%,
                          ${customization.colors.accent} 50%,
                          ${customization.colors.accent}80 100%
                        )`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                {/* Empty space when no countdown */}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // HORIZONTAL LAYOUT (keeping existing implementation)
  const renderHorizontalLayout = () => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const currentSeconds = now.getSeconds();
    const currentTotalMinutes = currentMinutes + currentSeconds / 60;

    const getNextPrayerInfo = () => {
      const prayerList = prayers.filter(
        (p) => p.name.toLowerCase() !== "sunrise"
      );

      for (let i = 0; i < prayerList.length; i++) {
        const [prayerHours, prayerMinutes] = prayerList[i].time
          .split(":")
          .map(Number);
        const prayerTime = prayerHours * 60 + prayerMinutes;
        const iqamahTime = prayerTime + prayerList[i].offset;

        if (
          currentTotalMinutes >= prayerTime &&
          currentTotalMinutes < iqamahTime
        ) {
          const iqamahDiff = iqamahTime - currentTotalMinutes;
          const iqamahSeconds = Math.floor(iqamahDiff * 60);
          const iqamahMins = Math.floor(iqamahSeconds / 60);
          const iqamahSecs = iqamahSeconds % 60;

          return {
            prayer: prayerList[i],
            isAdhanTime: true,
            iqamahCountdownMins: iqamahMins.toString().padStart(2, "0"),
            iqamahCountdownSecs: iqamahSecs.toString().padStart(2, "0"),
          };
        }

        if (currentTotalMinutes < prayerTime) {
          const formatTimeNoAMPM = (time: string) => {
            const [hours, minutes] = time.split(":");
            const hour = Number.parseInt(hours);
            const displayHour = hour % 12 || 12;
            return `${displayHour.toString().padStart(2, "0")}:${minutes}`;
          };

          return {
            prayer: prayerList[i],
            isAdhanTime: false,
            adhanTime: formatTimeNoAMPM(prayerList[i].time),
            iqamahTime: formatTimeNoAMPM(
              calculateIqamahTime(prayerList[i].time, prayerList[i].offset)
            ),
          };
        }
      }

      const fajr = prayerList[0];
      const formatTimeNoAMPM = (time: string) => {
        const [hours, minutes] = time.split(":");
        const hour = Number.parseInt(hours);
        const displayHour = hour % 12 || 12;
        return `${displayHour.toString().padStart(2, "0")}:${minutes}`;
      };

      return {
        prayer: fajr,
        isAdhanTime: false,
        adhanTime: formatTimeNoAMPM(fajr.time),
        iqamahTime: formatTimeNoAMPM(
          calculateIqamahTime(fajr.time, fajr.offset)
        ),
      };
    };

    const nextPrayerInfo = getNextPrayerInfo();

    return (
      <div className="w-full h-full flex flex-col justify-between px-12 py-8 overflow-hidden">
        {/* Top Section - Current Time & Date - Full Width Card */}
        <div className="mb-12">
          <div
            className="px-12 py-2 rounded-[4rem] backdrop-blur-sm relative overflow-hidden"
            style={{
              backgroundColor: `${customization.colors.primary}40`,
              border: `3px solid ${customization.colors.accent}80`,
              boxShadow: `0 8px 32px ${customization.colors.primary}60, inset 0 0 40px ${customization.colors.accent}20`,
            }}
          >
            <div className="flex items-start relative">
              <div className="flex-1">
                <div className="flex items-start leading-none relative">
                  {/* Hours & Minutes */}
                  <span
                    className="text-[22rem] px-4 font-extrabold font-mono tracking-wide"
                    style={{
                      color: customization.colors.text,
                      textShadow: `0 0 30px ${customization.colors.text}, 4px 4px 12px rgba(0, 0, 0, 0.9)`,
                      fontFamily: customization.font,
                      width: "fit-content",
                    }}
                  >
                    {`${(currentTime.getHours() % 12 || 12)
                      .toString()
                      .padStart(2, "0")}:${String(
                      currentTime.getMinutes()
                    ).padStart(2, "0")}`}
                  </span>

                  {/* Right side - Seconds, AM/PM, and Date stacked - Fixed position */}
                  <div
                    className="flex flex-col pl-56 absolute"
                    style={{ height: "22rem", left: "58rem" }}
                  >
                    {/* Top Half - Date */}
                    <div
                      className="flex items-center mt-10"
                      style={{ height: "90%" }}
                    >
                      <p
                        className="text-[5rem] font-bold tracking-wide whitespace-nowrap"
                        style={{
                          color: "#FF4444",
                          textShadow:
                            "0 0 25px rgba(255, 68, 68, 0.6), 4px 4px 12px rgba(0, 0, 0, 0.9)",
                          fontFamily: customization.font,
                        }}
                      >
                        {currentTime.toLocaleDateString("en-US", {
                          day: "numeric",
                        })}
                        {" - "}
                        {currentTime.toLocaleDateString("en-US", {
                          month: "long",
                        })}
                      </p>
                    </div>

                    {/* Bottom Half - Seconds and AM/PM */}
                    <div
                      className="flex items-center mb-4"
                      style={{ height: "90%" }}
                    >
                      {/* Seconds */}
                      <span
                        className="inline-block w-32 text-right text-[7rem] font-extrabold font-mono tracking-tighter"
                        style={{
                          color: customization.colors.text,
                          textShadow: `0 0 30px ${customization.colors.text}, 4px 4px 12px rgba(0, 0, 0, 0.9)`,
                          fontFamily: customization.font,
                        }}
                      >
                        {String(currentTime.getSeconds()).padStart(2, "0")}
                      </span>
                      {/* AM/PM */}
                      <span
                        className="inline-block w-32 text-left text-[7rem] font-extrabold font-mono tracking-tighter ml-10"
                        style={{
                          color: customization.colors.text,
                          textShadow: `0 0 30px ${customization.colors.text}, 4px 4px 12px rgba(0, 0, 0, 0.9)`,
                          fontFamily: customization.font,
                        }}
                      >
                        {currentTime
                          .toLocaleTimeString("en-US", {
                            hour12: true,
                          })
                          .slice(-2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section - Prayer Times or Iqamah Countdown */}
        {nextPrayerInfo.isAdhanTime ? (
          <div className="mb-2">
            <div
              className="p-12 rounded-[4rem] backdrop-blur-sm text-center relative overflow-hidden animate-pulse"
              style={{
                backgroundColor: `${customization.colors.accent}60`,
                border: `5px solid ${customization.colors.accent}`,
                boxShadow: `0 0 60px ${customization.colors.accent}80, 0 12px 40px rgba(0, 0, 0, 0.6)`,
              }}
            >
              <div
                className="text-6xl font-bold mb-4 px-12 py-2 rounded-full inline-block"
                style={{
                  backgroundColor: `${customization.colors.accent}DD`,
                  color: "#FFFFFF",
                  textShadow: "3px 3px 8px rgba(0, 0, 0, 0.9)",
                  fontFamily: customization.font,
                  border: "3px solid rgba(255, 255, 255, 0.4)",
                }}
              >
                <div className="p-2">
                  {getPrayerDisplayName(
                    nextPrayerInfo.prayer.name,
                    customization.language
                  )}{" "}
                  - {t.iqamahIn}
                </div>
              </div>
              <div className="flex items-center justify-center mt-0">
                <span
                  className="text-[16rem] font-extrabold font-mono leading-none"
                  style={{
                    color: customization.colors.secondary,
                    textShadow:
                      "0 0 50px rgba(255, 255, 0, 0.8), 6px 6px 20px rgba(0, 0, 0, 0.9)",
                    fontFamily: customization.font,
                  }}
                >
                  {nextPrayerInfo.iqamahCountdownMins}:
                  {nextPrayerInfo.iqamahCountdownSecs}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-12 mb-2">
            <div
              className="p-8 rounded-[4rem] backdrop-blur-sm text-center relative overflow-hidden"
              style={{
                backgroundColor: `${customization.colors.primary}40`,
                border: `3px solid ${customization.colors.accent}80`,
                boxShadow: `0 8px 32px ${customization.colors.primary}60, inset 0 0 40px ${customization.colors.accent}20`,
              }}
            >
              <div
                className="text-7xl font-bold mb-4 px-10 py-0 rounded-full inline-block"
                style={{
                  backgroundColor: `${customization.colors.accent}CC`,
                  color: "#FFFFFF",
                  textShadow: "2px 2px 6px rgba(0, 0, 0, 0.8)",
                  fontFamily: customization.font,
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                }}
              >
                <div className="p-4">
                  {getPrayerDisplayName(
                    nextPrayerInfo.prayer.name,
                    customization.language
                  )}{" "}
                </div>
              </div>
              <div className="flex items-center justify-center mt-0">
                <span
                  className="text-[18rem] font-extrabold font-mono leading-none"
                  style={{
                    color: customization.colors.secondary,
                    textShadow: "5px 5px 15px rgba(0, 0, 0, 0.9)",
                    fontFamily: customization.font,
                  }}
                >
                  {nextPrayerInfo.adhanTime}
                </span>
              </div>
            </div>

            {/* Next Iqamah Time */}
            <div
              className="p-4 rounded-[4rem] backdrop-blur-sm text-center relative overflow-hidden"
              style={{
                backgroundColor: `${customization.colors.primary}40`,
                border: `3px solid ${customization.colors.accent}80`,
                boxShadow: `0 8px 32px ${customization.colors.primary}60, inset 0 0 40px ${customization.colors.accent}20`,
              }}
            >
              <div
                className="text-6xl font-bold mb-4 px-10 py-0 rounded-full inline-block"
                style={{
                  backgroundColor: `${customization.colors.accent}CC`,
                  color: "#FFFFFF",
                  textShadow: "2px 2px 6px rgba(0, 0, 0, 0.8)",
                  fontFamily: customization.font,
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                }}
              >
                <div className="p-4">{t.iqamah}</div>
              </div>
              <div className="flex items-center justify-center mt-0">
                <span
                  className="text-[18rem] font-extrabold font-mono leading-none"
                  style={{
                    color: customization.colors.accent,
                    textShadow: "5px 5px 15px rgba(0, 0, 0, 0.9)",
                    fontFamily: customization.font,
                  }}
                >
                  {nextPrayerInfo.iqamahTime}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Section - Masjid Name & Hijri Date */}
        <div className="p-8 mt-0 rounded-3xl backdrop-blur-md text-center">
          <p
            className="text-6xl font-bold tracking-wide"
            style={{
              color: customization.colors.text,
              textShadow:
                "0 0 20px rgba(0, 255, 0, 0.4), 3px 3px 8px rgba(0, 0, 0, 0.8)",
              fontFamily: customization.font,
            }}
          >
            {customization.masjidName}
            {customization.showHijriDate && hijriDate && (
              <>
                <span className="mx-6 opacity-60">~</span>
                <span className="text-5xl">{hijriDate}</span>
              </>
            )}
          </p>
        </div>
      </div>
    );
  };

  // CENTERED LAYOUT
  const renderCenteredLayout = () => {
    const formatTimeNoAMPM = (time: string) => {
      const [hours, minutes] = time.split(":");
      const hour = Number.parseInt(hours);
      const displayHour = hour % 12 || 12;
      return `${displayHour.toString().padStart(2, "0")}:${minutes}`;
    };

    // Function to determine the next prayer
    const getNextPrayer = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const currentSeconds = now.getSeconds();
      const currentTotalMinutes = currentMinutes + currentSeconds / 60;

      for (let i = 0; i < prayers.length; i++) {
        const prayer = prayers[i];
        const [hours, minutes] = prayer.time.split(":").map(Number);
        const adhanTime = hours * 60 + minutes;

        if (adhanTime > currentTotalMinutes) {
          return { prayer, index: i };
        }
      }
      // If all prayers passed for today, return first prayer of next day
      return { prayer: prayers[0], index: 0 };
    };

    const nextPrayer = getNextPrayer();

    // Check if ANY prayer is currently active (between Adhan and Iqamah)
    const isAnyPrayerActive = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const currentSeconds = now.getSeconds();
      const currentTotalMinutes = currentMinutes + currentSeconds / 60;

      for (const prayer of prayers) {
        const [hours, minutes] = prayer.time.split(":").map(Number);
        const adhanTime = hours * 60 + minutes;
        const iqamahTime = adhanTime + prayer.offset;

        if (
          currentTotalMinutes >= adhanTime &&
          currentTotalMinutes < iqamahTime
        ) {
          // Calculate countdown to Iqamah
          const iqamahDiff = iqamahTime - currentTotalMinutes;
          const iqamahSeconds = Math.floor(iqamahDiff * 60);
          const iqamahMins = Math.floor(iqamahSeconds / 60);
          const iqamahSecs = iqamahSeconds % 60;

          return {
            prayer,
            isActive: true,
            countdownMins: iqamahMins.toString().padStart(2, "0"),
            countdownSecs: iqamahSecs.toString().padStart(2, "0"),
          };
        }
      }
      return { prayer: null, isActive: false };
    };

    const activePrayerInfo = isAnyPrayerActive();
    const shouldShowCountdown = activePrayerInfo.isActive;

    return (
      <div className="w-full h-full flex flex-col items-center justify-center px-24 py-8 overflow-hidden">
        <div className="mb-8">
          <MasjidHeader />
        </div>

        <div className="flex-1 w-full max-w-8xl space-y-12">
          {/* Current Time Display - Reduced digit gap */}
          <div
            className="flex flex-col items-center justify-center p-8 rounded-3xl backdrop-blur-sm transition-all text-center"
            style={{
              backgroundColor: `${customization.colors.primary}30`,
              border: `4px solid ${customization.colors.accent}`,
              boxShadow: `0 10px 30px rgba(0, 0, 0, 0.4)`,
            }}
          >
            {/* Time with reduced spacing */}
            <div className="min-w-[85rem]">
              <div
                className="text-[16rem] font-bold font-mono leading-none whitespace-nowrap inline-block"
                style={{
                  ...textStyle,
                  color: customization.colors.text,
                  textShadow: "4px 4px 8px rgba(0, 0, 0, 0.9)",
                  fontVariantNumeric: "tabular-nums",
                  fontFeatureSettings: '"tnum"',
                  letterSpacing: "0.05em", // Reduced from 0.15em
                }}
              >
                {
                  currentTime
                    .toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    })
                    .replace(" ", "")
                    .replace(/(AM|PM)/i, "")
                  // Remove space entirely and AM PM
                }
              </div>
            </div>

            {/* Date section */}
            <div className="flex items-center justify-center gap-12 mt-4">
              <div className="text-center">
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-semibold" style={textStyle}>
                    {currentTime.toLocaleDateString("en-US", {
                      weekday: "long",
                    })}
                  </span>

                  <span
                    className="text-6xl font-semibold opacity-70"
                    style={textStyle}
                  >
                    –
                  </span>

                  <span className="text-6xl font-semibold" style={textStyle}>
                    {currentTime.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {hijriDate && customization.showHijriDate && (
                <>
                  <div
                    className="h-12 w-1"
                    style={{ backgroundColor: customization.colors.accent }}
                  ></div>
                  <div className="text-center">
                    <p className="text-3xl opacity-80" style={textStyle}>
                      {t.islamicDate}
                    </p>
                    <p
                      className="text-4xl font-semibold mt-1"
                      style={textStyle}
                    >
                      {hijriDate}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Conditional: Show either Prayer Cards OR Iqamah Countdown */}
          {shouldShowCountdown ? (
            /* IQAMAH COUNTDOWN DISPLAY - Takes full width */
            <div
              className="p-2 rounded-3xl backdrop-blur-sm text-center animate-pulse"
              style={{
                backgroundColor: `${customization.colors.accent}40`,
                border: `6px solid ${customization.colors.accent}`,
                boxShadow: `0 0 80px ${customization.colors.accent}60, 0 15px 50px rgba(0, 0, 0, 0.7)`,
              }}
            >
              <div className="mb-0">
                <div className="text-6xl font-bold mb-0 px-12 py-3 rounded-full inline-block">
                  <div className="p-2">
                    {getPrayerDisplayName(
                      activePrayerInfo.prayer.name,
                      customization.language
                    )}{" "}
                    - {t.iqamah} {t.iqamahIn}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center mt-0">
                <span
                  className="text-[18rem] font-extrabold font-mono leading-none tracking-tight"
                  style={{
                    color: customization.colors.secondary,
                    textShadow: `
                    0 0 60px ${customization.colors.accent}80,
                    0 0 100px ${customization.colors.accent}60,
                    6px 6px 20px rgba(0, 0, 0, 0.9)
                  `,
                    fontFamily: "'Orbitron', monospace",
                  }}
                >
                  {activePrayerInfo.countdownMins}:
                  {activePrayerInfo.countdownSecs}
                </span>
              </div>
            </div>
          ) : (
            /* PRAYER CARD GRID - Shows when no active Iqamah */
            <div className="grid grid-cols-5 gap-6">
              {prayers.map((prayer, index) => {
                const isNextPrayer =
                  getPrayerDisplayName(
                    nextPrayer.prayer.name,
                    customization.language
                  ) ===
                  getPrayerDisplayName(prayer.name, customization.language);

                // Check if this specific prayer is active
                const isCurrentActive = () => {
                  const now = new Date();
                  const currentMinutes = now.getHours() * 60 + now.getMinutes();
                  const currentSeconds = now.getSeconds();
                  const currentTotalMinutes =
                    currentMinutes + currentSeconds / 60;

                  const [hours, minutes] = prayer.time.split(":").map(Number);
                  const adhanTime = hours * 60 + minutes;
                  const iqamahTime = adhanTime + prayer.offset;

                  return (
                    adhanTime <= currentTotalMinutes &&
                    currentTotalMinutes < iqamahTime
                  );
                };

                const isActive = isCurrentActive();

                // Determine card style based on prayer status
                let cardStyle = {
                  backgroundColor: `${customization.colors.primary}30`,
                  border: `4px solid ${customization.colors.accent}`,
                  boxShadow: `0 10px 30px rgba(0, 0, 0, 0.4)`,
                };

                if (isActive) {
                  cardStyle = {
                    backgroundColor: `${customization.colors.accent}40`,
                    border: `4px solid #FFD700`,
                    boxShadow: `0 0 40px rgba(255, 215, 0, 0.5), 0 10px 30px rgba(0, 0, 0, 0.6)`,
                  };
                } else if (isNextPrayer) {
                  cardStyle = {
                    backgroundColor: `${customization.colors.accent}20`,
                    border: `4px solid ${customization.colors.accent}`,
                    boxShadow: `0 0 30px ${customization.colors.accent}40, 0 10px 30px rgba(0, 0, 0, 0.5)`,
                  };
                }

                return (
                  <div
                    key={getPrayerDisplayName(
                      prayer.name,
                      customization.language
                    )}
                    className={`p-6 rounded-3xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
                      isActive ? "animate-pulse" : ""
                    } ${isNextPrayer ? "ring-4 ring-inset" : ""}`}
                    style={cardStyle}
                  >
                    {/* Prayer Name with Status Badge */}
                    <div className="relative">
                      <h3
                        className={`text-6xl font-extrabold text-center mb-4 leading-tight ${
                          isActive || isNextPrayer ? "text-shadow-glow" : ""
                        }`}
                        style={{
                          ...textStyle,
                          color: isActive
                            ? "#FFD700"
                            : isNextPrayer
                            ? customization.colors.accent
                            : `${customization.colors.accent}CC`,
                          textShadow: isActive
                            ? "0 0 20px rgba(255, 215, 0, 0.8), 2px 2px 6px rgba(0, 0, 0, 0.9)"
                            : isNextPrayer
                            ? "0 0 15px rgba(255, 255, 255, 0.5), 2px 2px 6px rgba(0, 0, 0, 0.9)"
                            : "2px 2px 6px rgba(0, 0, 0, 0.9)",
                        }}
                      >
                        {getPrayerDisplayName(
                          prayer.name,
                          customization.language
                        )}
                      </h3>

                      {/* Status Indicator */}
                      <div className="absolute -top-2 right-0 flex gap-2">
                        {isNextPrayer && !isActive && (
                          <span className="px-0 py-0 text-sm font-bold rounded-full bg-gradient-to-r from-blue-400 to-purple-600 text-white">
                            {t.next}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Prayer Times */}
                    <div className="space-y-6">
                      {/* Adhan Time */}
                      <div className="text-center">
                        <p
                          className="text-7xl font-bold font-mono"
                          style={{
                            ...textStyle,
                            color: isActive
                              ? customization.colors.accent
                              : isNextPrayer
                              ? `${customization.colors.accent}`
                              : `${customization.colors.accent}AA`,
                            fontWeight:
                              isActive || isNextPrayer ? "900" : "700",
                            textShadow: isActive
                              ? `0 0 15px ${customization.colors.accent}80`
                              : isNextPrayer
                              ? `0 0 10px ${customization.colors.accent}60`
                              : "none",
                          }}
                        >
                          {formatTimeNoAMPM(prayer.time)}
                        </p>
                      </div>

                      {/* Separator with offset */}
                      <div className="flex items-center justify-center my-3">
                        <div
                          className="h-1 flex-1"
                          style={{
                            backgroundColor: isActive
                              ? "#FFD700"
                              : isNextPrayer
                              ? `${customization.colors.accent}CC`
                              : `${customization.colors.accent}30`,
                          }}
                        ></div>
                        <div className="mx-4">
                          <p
                            className={`text-sm font-semibold px-2 py-1 rounded ${
                              isActive
                                ? "bg-yellow-500/20"
                                : isNextPrayer
                                ? "bg-blue-500/20"
                                : ""
                            }`}
                            style={{
                              color: isActive
                                ? "#FFD700"
                                : isNextPrayer
                                ? customization.colors.accent
                                : `${customization.colors.accent}CC`,
                            }}
                          >
                            +{prayer.offset} min
                          </p>
                        </div>
                        <div
                          className="h-1 flex-1"
                          style={{
                            backgroundColor: isActive
                              ? "#FFD700"
                              : isNextPrayer
                              ? `${customization.colors.accent}CC`
                              : `${customization.colors.accent}80`,
                          }}
                        ></div>
                      </div>

                      {/* Iqamah Time */}
                      <div className="text-center">
                        <p
                          className={`text-2xl mb-2 ${
                            isNextPrayer ? "opacity-100" : "opacity-90"
                          }`}
                          style={textStyle}
                        >
                          {t.iqamah}
                        </p>
                        <p
                          className="text-7xl font-semibold font-mono"
                          style={{
                            ...textStyle,
                            color: isActive
                              ? customization.colors.secondary
                              : isNextPrayer
                              ? `${customization.colors.secondary}`
                              : `${customization.colors.secondary}AA`,
                            fontWeight:
                              isActive || isNextPrayer ? "900" : "700",
                            textShadow: isActive
                              ? `0 0 15px ${customization.colors.secondary}80`
                              : isNextPrayer
                              ? `0 0 10px ${customization.colors.secondary}60`
                              : "none",
                          }}
                        >
                          {formatTimeNoAMPM(
                            calculateIqamahTime(prayer.time, prayer.offset)
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="w-full h-full relative overflow-hidden flex items-center justify-center"
      style={dynamicBackgroundStyle}
    >
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {customization.layout === "vertical" && renderVerticalLayout()}
        {customization.layout === "horizontal" && renderHorizontalLayout()}
        {customization.layout === "centered" && renderCenteredLayout()}
      </div>

      {customization.announcements &&
        customization.announcements.length > 0 && (
          <div
            className="fixed bottom-0 left-0 right-0 py-8 overflow-hidden z-20"
            style={{ backgroundColor: `${customization.colors.primary}DD` }}
          >
            <div
              className="whitespace-nowrap text-4xl font-semibold px-16"
              style={textStyle}
            >
              📢 {customization.announcements[currentAnnouncement].text}
            </div>
          </div>
        )}
    </div>
  );
}

export default MasjidTemplate;
