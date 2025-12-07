import React, { useState, useEffect } from "react";
import FlipClockWrapper from "./components/masjid/FlipClockWrapper";
import { PrayerInstructions } from "./components/masjid/PrayerInstructions";
import { IshraqCountdown } from "./components/masjid/IshraqCountdown";

interface PrayerTimes {
  fajr: string;
  sunrise: string; // ADD THIS LINE
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

interface IqamahOffsets {
  fajr: number;
  sunrise: number; // ADD THIS LINE
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
}

interface Colors {
  primary: string;
  secondary: string;
  text: string;
  accent: string;
}

interface Announcement {
  text: string;
  duration: number;
}

interface MasjidCustomization {
  template: string;
  layout: string;
  masjidName: string;
  prayerTimes: PrayerTimes;
  iqamahOffsets: IqamahOffsets;
  colors: Colors;
  backgroundType: string;
  backgroundImage: string[];
  slideshowDuration: number;
  announcements: Announcement[];
  showHijriDate: boolean;
  font: string;
  prayerInstructionImage: string;
  prayerInstructionDuration: number;
}

interface MasjidTemplateProps {
  customization: MasjidCustomization;
  backgroundStyle: React.CSSProperties;
}

export function MasjidTemplateAuthentic({
  customization,
  backgroundStyle,
}: MasjidTemplateProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
  const [hijriDate, setHijriDate] = useState("");
  const [showInstructions, setShowInstructions] = useState(true);
  const [instructionsPrayer, setInstructionsPrayer] = useState("");
  const [prayerInstructionImage, setPrayerInstructionImage] = useState("");

  const [prayerInstructionDuration, setPrayerInstructionDuration] =
    useState(10);

  const [instructionsRemainingTime, setInstructionsRemainingTime] = useState(0);
  // Add these state variables with your other useState declarations:
  const [showIshraqCountdown, setShowIshraqCountdown] = useState(false);
  const [ishraqRemainingSeconds, setIshraqRemainingSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (customization.announcements && customization.announcements.length > 0) {
      const interval = setInterval(() => {
        setCurrentAnnouncement(
          (prev) => (prev + 1) % customization.announcements.length
        );
      }, (customization.announcements[currentAnnouncement]?.duration || 5) * 1000);

      return () => clearInterval(interval);
    }
    if (customization.prayerInstructionImage) {
      setPrayerInstructionImage(customization.prayerInstructionImage);
    }
    if (customization.prayerInstructionDuration) {
      setPrayerInstructionDuration(customization.prayerInstructionDuration);
    }
  }, [
    customization.announcements,
    currentAnnouncement,
    customization.prayerInstructionImage,
    customization.prayerInstructionDuration,
  ]);

  useEffect(() => {
    fetchHijriDate();
  }, []);

  useEffect(() => {
    const checkInstructions = () => {
      // Only check if image is provided and duration is greater than 0
      if (
        !customization.prayerInstructionImage ||
        customization.prayerInstructionDuration <= 0
      ) {
        setShowInstructions(false);
        setInstructionsPrayer("");
        setInstructionsRemainingTime(0); // Reset the remaining time
        return;
      }

      const now = new Date();
      const currentMinutes =
        now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

      const prayers = [
        {
          name: "fajr",
          time: customization.prayerTimes.fajr,
          offset: customization.iqamahOffsets.fajr,
        },
        {
          name: "dhuhr",
          time: customization.prayerTimes.dhuhr,
          offset: customization.iqamahOffsets.dhuhr,
        },
        {
          name: "asr",
          time: customization.prayerTimes.asr,
          offset: customization.iqamahOffsets.asr,
        },
        {
          name: "maghrib",
          time: customization.prayerTimes.maghrib,
          offset: customization.iqamahOffsets.maghrib,
        },
        {
          name: "isha",
          time: customization.prayerTimes.isha,
          offset: customization.iqamahOffsets.isha,
        },
      ];

      for (const prayer of prayers) {
        const [hours, minutes] = prayer.time.split(":").map(Number);
        const adhanMinutes = hours * 60 + minutes;
        const iqamahMinutes = adhanMinutes + prayer.offset;

        const timeSinceIqamah = currentMinutes - iqamahMinutes;

        // Convert duration from seconds to minutes for comparison
        const durationInMinutes = customization.prayerInstructionDuration / 60;

        if (timeSinceIqamah >= 0 && timeSinceIqamah <= durationInMinutes) {
          // Calculate remaining time in milliseconds
          const remainingTimeInMs =
            (durationInMinutes - timeSinceIqamah) * 60 * 1000;

          setShowInstructions(true);
          setInstructionsPrayer(prayer.name);
          setInstructionsRemainingTime(Math.max(0, remainingTimeInMs));
          return;
        }
      }

      setShowInstructions(false);
      setInstructionsPrayer("");
      setInstructionsRemainingTime(0);
    };

    checkInstructions();
    const interval = setInterval(checkInstructions, 1000);
    return () => clearInterval(interval);
  }, [customization]);

  useEffect(() => {
    const checkIshraqTime = () => {
      const now = new Date();
      const currentMinutes =
        now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

      // Hardcoded sunrise time for testing
      const [sunriseHours, sunriseMinutes] = customization.prayerTimes.sunrise
        .split(":")
        .map(Number);
      const sunriseMinutesTotal = sunriseHours * 60 + sunriseMinutes;

      // Ishraq is 20 minutes after sunrise
      const ishraqMinutes = sunriseMinutesTotal + 20;

      // Calculate time difference
      const timeSinceSunrise = currentMinutes - sunriseMinutesTotal;

      // Show countdown if between sunrise and 20 minutes after (Ishraq time)
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

  // Convert 24-hour HH:MM to 12-hour format (no AM/PM)
  const to12Hour = (time: string) => {
    let [h, m] = time.split(":").map(Number);
    let hour12 = h % 12;
    if (hour12 === 0) hour12 = 12;
    return `${hour12.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}`;
  };

  const getNextPrayer = () => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Prayer list
    const prayers = [
      {
        name: "fajr",
        time: customization.prayerTimes.fajr,
        offset: customization.iqamahOffsets.fajr,
      },
      {
        name: "dhuhr",
        time: customization.prayerTimes.dhuhr,
        offset: customization.iqamahOffsets.dhuhr,
      },
      {
        name: "asr",
        time: customization.prayerTimes.asr,
        offset: customization.iqamahOffsets.asr,
      },
      {
        name: "maghrib",
        time: customization.prayerTimes.maghrib,
        offset: customization.iqamahOffsets.maghrib,
      },
      {
        name: "isha",
        time: customization.prayerTimes.isha,
        offset: customization.iqamahOffsets.isha,
      },
    ];

    // Find next prayer
    for (const prayer of prayers) {
      const [hours, minutes] = prayer.time.split(":").map(Number);
      const prayerTime = hours * 60 + minutes;
      const iqamahTime = prayerTime + prayer.offset;

      if (iqamahTime > currentMinutes) {
        const targetDate = new Date();
        targetDate.setHours(Math.floor(iqamahTime / 60), iqamahTime % 60, 0, 0);

        return {
          name: prayer.name,
          time: targetDate,
          adhan: to12Hour(prayer.time), // <-- 12-hour output
          offset: prayer.offset,
        };
      }
    }

    // No more prayers today → next day Fajr
    const [hours, minutes] = customization.prayerTimes.fajr
      .split(":")
      .map(Number);

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 1);
    targetDate.setHours(
      hours + Math.floor(customization.iqamahOffsets.fajr / 60),
      minutes + (customization.iqamahOffsets.fajr % 60),
      0,
      0
    );

    return {
      name: "fajr",
      time: targetDate,
      adhan: to12Hour(customization.prayerTimes.fajr), // <-- 12-hour output
      offset: customization.iqamahOffsets.fajr,
    };
  };

  const calculateIqamahTime = (adhanTime: string, offset: number) => {
    const [hours, minutes] = adhanTime.split(":").map(Number);

    const totalMinutes = hours * 60 + minutes + offset;
    const iqamahHours24 = Math.floor(totalMinutes / 60) % 24;
    const iqamahMinutes = totalMinutes % 60;

    // Convert 24h → 12h (1–12)
    let iqamahHours12 = iqamahHours24 % 12;
    if (iqamahHours12 === 0) iqamahHours12 = 12;

    return `${iqamahHours12.toString().padStart(2, "0")}:${iqamahMinutes
      .toString()
      .padStart(2, "0")}`;
  };

  const getCountdownState = () => {
    const now = new Date();
    const currentMinutes =
      now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

    const prayers = [
      {
        name: "fajr",
        time: customization.prayerTimes.fajr,
        offset: customization.iqamahOffsets.fajr,
      },
      {
        name: "dhuhr",
        time: customization.prayerTimes.dhuhr,
        offset: customization.iqamahOffsets.dhuhr,
      },
      {
        name: "asr",
        time: customization.prayerTimes.asr,
        offset: customization.iqamahOffsets.asr,
      },
      {
        name: "maghrib",
        time: customization.prayerTimes.maghrib,
        offset: customization.iqamahOffsets.maghrib,
      },
      {
        name: "isha",
        time: customization.prayerTimes.isha,
        offset: customization.iqamahOffsets.isha,
      },
    ];

    for (const prayer of prayers) {
      const [hours, minutes] = prayer.time.split(":").map(Number);
      const adhanMinutes = hours * 60 + minutes;
      const iqamahMinutes = adhanMinutes + prayer.offset;

      const minutesUntilAdhan = adhanMinutes - currentMinutes;
      const minutesUntilIqamah = iqamahMinutes - currentMinutes;

      // 10 minutes before Adhan
      if (minutesUntilAdhan > 0 && minutesUntilAdhan <= 10) {
        const seconds = Math.floor(minutesUntilAdhan * 60);
        return {
          type: "adhan",
          seconds,
          prayerName: prayer.name,
          adhanTime: prayer.time,
          iqamahTime: calculateIqamahTime(prayer.time, prayer.offset),
        };
      }

      // Between Adhan and Iqamah
      if (minutesUntilAdhan <= 0 && minutesUntilIqamah > 0) {
        const seconds = Math.floor(minutesUntilIqamah * 60);
        return {
          type: "iqamah",
          seconds,
          prayerName: prayer.name,
          adhanTime: prayer.time,
          iqamahTime: calculateIqamahTime(prayer.time, prayer.offset),
        };
      }
    }

    return null;
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const formatCustomDate = (date: Date) => {
    const day = date.getDate();
    const year = date.getFullYear();

    const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
    const month = date.toLocaleDateString("en-US", { month: "long" });

    const getSuffix = (n: number) => {
      if (n >= 11 && n <= 13) return "th";
      switch (n % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    return `${weekday} - ${day} ${month} ${year}`;
  };

  const nextPrayer = getNextPrayer();
  const nextPrayerName = nextPrayer.name.toLowerCase();

  const countdownState = getCountdownState();

  const calculateSunriseTime = () => {
    const [hours, minutes] = customization.prayerTimes.fajr
      .split(":")
      .map(Number);
    const sunriseMinutes = hours * 60 + minutes + 90;
    const sunriseHours = Math.floor(sunriseMinutes / 60) % 24;
    const sunriseMins = sunriseMinutes % 60;
    return `${sunriseHours.toString().padStart(2, "0")}:${sunriseMins
      .toString()
      .padStart(2, "0")}`;
  };

  const prayers = [
    {
      name: "Fajr",
      nameAr: "الفجر",
      adhan: to12Hour(customization.prayerTimes.fajr),
      offset: customization.iqamahOffsets.fajr,
      icon: "🌙",
    },
    {
      name: "Sunrise",
      nameAr: "الشروق",
      adhan: to12Hour(calculateSunriseTime()), // sunrise also converted
      offset: 0,
      icon: "🌅",
    },
    {
      name: "Dhuhr",
      nameAr: "الظهر",
      adhan: to12Hour(customization.prayerTimes.dhuhr),
      offset: customization.iqamahOffsets.dhuhr,
      icon: "☀️",
    },
    {
      name: "Asr",
      nameAr: "العصر",
      adhan: to12Hour(customization.prayerTimes.asr),
      offset: customization.iqamahOffsets.asr,
      icon: "🌤️",
    },
    {
      name: "Maghrib",
      nameAr: "المغرب",
      adhan: to12Hour(customization.prayerTimes.maghrib),
      offset: customization.iqamahOffsets.maghrib,
      icon: "🌆",
    },
    {
      name: "Isha",
      nameAr: "العشاء",
      adhan: to12Hour(customization.prayerTimes.isha),
      offset: customization.iqamahOffsets.isha,
      icon: "✨",
    },
  ];

  const textStyle = {
    color: customization.colors.text,
    fontFamily: `'${customization.font}', 'Amiri', 'Scheherazade New', serif`,
    textShadow: "2px 2px 8px rgba(0,0,0,0.9)",
  };

  // Add this check BEFORE the prayer instructions check in your render:
  // Show Ishraq countdown if it's time
  if (showIshraqCountdown) {
    // if (true) {
    return (
      <IshraqCountdown
        accentColor={customization.colors.accent}
        secondaryColor={customization.colors.secondary}
        remainingSeconds={ishraqRemainingSeconds}
        onClose={() => {
          setShowIshraqCountdown(false);
          setIshraqRemainingSeconds(0);
        }}
      />
    );
  }

  // If showing instructions, ONLY show the instructions component
  if (showInstructions && customization.prayerInstructionImage) {
    // if (true) {
    return (
      <PrayerInstructions
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

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      <div
        className="w-full h-full flex flex-col relative"
        style={{
          ...backgroundStyle,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <link
          href="https://fonts.googleapis.com/css2?family=Exo+2:ital,wght@0,100..900;1,100..900&family=Oxanium:wght@200..800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Amiri:wght@400;700&family=Scheherazade+New:wght@400;700&family=Roboto:wght@400;700&family=Open+Sans:wght@400;700&family=Lato:wght@400;700&family=Inter:wght@400;700&display=swap"
          rel="stylesheet"
        />

        <style>
          {`
            @keyframes subtlePulse {
              0%, 100% {
                opacity: 1;
                transform: scale(1);
              }
              50% {
                opacity: 0.85;
                transform: scale(1.02);
              }
            }

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

            @keyframes slideDown {
              0% {
                opacity: 0;
                transform: translateY(-30px);
              }
              100% {
                opacity: 1;
                transform: translateY(0);
              }
            }

            @keyframes glowPulse {
              0%, 100% {
                box-shadow: 0 0 30px rgba(251, 191, 36, 0.5), 0 0 60px rgba(251, 191, 36, 0.3), 0 10px 40px rgba(0, 0, 0, 0.6);
              }
              50% {
                box-shadow: 0 0 50px rgba(251, 191, 36, 0.7), 0 0 80px rgba(251, 191, 36, 0.5), 0 10px 40px rgba(0, 0, 0, 0.6);
              }
            }

            @keyframes shimmer {
              0% {
                background-position: -1000px 0;
              }
              100% {
                background-position: 1000px 0;
              }
            }
          `}
        </style>
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%23ffffff' fill-opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: "30px 30px",
          }}
        ></div>
        {/* Prayer Instructions Overlay - Full Screen, Nothing Hidden */}
        {showInstructions &&
          customization.prayerInstructionImage &&
          customization.prayerInstructionDuration > 0 && (
            <div
              className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/95"
              style={{
                animation: "fadeInScale 0.6s ease-out",
              }}
            >
              <img
                src={
                  customization.prayerInstructionImage || prayerInstructionImage
                }
                alt="Prayer Instructions"
                className="max-h-[95vh] max-w-[95vw] object-contain rounded-3xl border-8"
                style={{
                  borderColor: customization.colors.accent,
                  animation:
                    "fadeInScale 0.8s ease-out 0.2s backwards, glowPulse 3s ease-in-out infinite 0.8s",
                }}
              />
            </div>
          )}

        <div className="relative z-10 flex flex-col items-center px-0 pt-0 pb-0 bg-gradient-to-b from-black/40 to-transparent">
          <div className="flex items-center gap-3">
            <span className="text-5xl">🕌</span>
            <h1
              className="text-5xl mt-4 font-bold tracking-wide uppercase"
              style={textStyle}
            >
              {customization.masjidName}
            </h1>
          </div>

          <div className="text-center mt-6">
            <span
              className={`text-${
                customization.showHijriDate ? "6xl" : "8xl"
              } font-extrabold tracking-wider`}
              style={{ ...textStyle, color: customization.colors.accent }}
            >
              {hijriDate && customization.showHijriDate && (
                <>
                  {hijriDate} <span className="mx-3">|</span>{" "}
                </>
              )}
              {formatCustomDate(currentTime)}
            </span>
          </div>
        </div>
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center -pt-12 px-8 py-2 pt-0">
          <FlipClockWrapper />
          {/* <FlipClockWrapper currentTime={currentTime} /> */}

          <div className="w-full max-w-8xl relative mt-12">
            {!countdownState && (
              <div className="grid grid-cols-2 gap-12 -mb-12">
                <div className="flex flex-col items-center justify-center py-2 px-8">
                  <h3
                    className="text-8xl font-black tracking-tight mb-0"
                    style={{
                      ...textStyle,
                      color: customization.colors.secondary,
                    }}
                  >
                    {nextPrayer.name.toUpperCase()}
                  </h3>
                  <div
                    className="text-[15rem] font-black leading-none"
                    style={{
                      fontFamily: "'Oxanium', monospace",
                      fontWeight: 1000,
                      color: customization.colors.secondary,
                      textShadow: `
                        0 0 10px ${customization.colors.secondary}80,
                        0 0 20px ${customization.colors.secondary}60,
                        0 0 30px ${customization.colors.secondary}40,
                        4px 4px 16px rgba(0,0,0,0.8)
                      `,
                      letterSpacing: "0.1em",
                      height: "210px",
                    }}
                  >
                    {nextPrayer.adhan}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center py-2 px-8">
                  <h3
                    className="text-8xl font-black tracking-tight mb-0"
                    style={{ ...textStyle, color: customization.colors.accent }}
                  >
                    IQAMAH
                  </h3>
                  <div
                    className="text-[15rem] font-black leading-none"
                    style={{
                      fontFamily: "'Oxanium', monospace",
                      fontWeight: 1000,
                      color: customization.colors.accent,
                      textShadow: `
                        0 0 10px ${customization.colors.accent}80,
                        0 0 20px ${customization.colors.accent}60,
                        0 0 30px ${customization.colors.accent}40,
                        4px 4px 16px rgba(0,0,0,0.8)
                      `,
                      letterSpacing: "0.1em",
                      height: "210px",
                    }}
                  >
                    {calculateIqamahTime(nextPrayer.adhan, nextPrayer.offset)}
                  </div>
                </div>
              </div>
            )}

            {countdownState && (
              <div className="relative flex items-center justify-center">
                <div className="absolute left-8 opacity-20 blur-sm scale-75 transition-all duration-500">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2" style={textStyle}>
                      ADHAN
                    </div>
                    <div
                      className="text-4xl font-black"
                      style={{
                        fontFamily: "'Oxanium', monospace",
                        color: customization.colors.secondary,
                      }}
                    >
                      {countdownState.adhanTime}
                    </div>
                  </div>
                </div>

                <div className="absolute right-8 opacity-20 blur-sm scale-75 transition-all duration-500">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2" style={textStyle}>
                      IQAMAH
                    </div>
                    <div
                      className="text-4xl font-black"
                      style={{
                        fontFamily: "'Oxanium', monospace",
                        color: customization.colors.accent,
                      }}
                    >
                      {countdownState.iqamahTime}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <h3
                    className="text-7xl font-black tracking-tight mb-6 uppercase"
                    style={{
                      ...textStyle,
                      color:
                        countdownState.seconds > 300
                          ? "#10B981" // Green for >5 min
                          : countdownState.seconds > 60
                          ? "#F59E0B" // Yellow for 1-5 min
                          : countdownState.seconds > 30
                          ? "#F97316" // Orange for 30-60 sec
                          : countdownState.seconds > 10
                          ? "#EF4444" // Red for 10-30 sec
                          : "#DC2626", // Bright red for <10 sec
                      animation: "subtlePulse 2s ease-in-out infinite",
                    }}
                  >
                    {countdownState.prayerName.toUpperCase()}{" "}
                    {countdownState.type === "adhan" ? "ADHAN IN" : "IQAMAH IN"}
                  </h3>
                  <div
                    className="text-[15rem] font-black leading-none"
                    style={{
                      fontFamily: "'Oxanium', monospace",
                      fontWeight: 1000,
                      color:
                        countdownState.seconds > 300
                          ? "#10B981" // Green for >5 min
                          : countdownState.seconds > 60
                          ? "#F59E0B" // Yellow for 1-5 min
                          : countdownState.seconds > 30
                          ? "#F97316" // Orange for 30-60 sec
                          : countdownState.seconds > 10
                          ? "#EF4444" // Red for 10-30 sec
                          : "#DC2626", // Bright red for <10 sec
                      textShadow:
                        countdownState.seconds > 300
                          ? `0 0 20px #10B98180, 0 0 40px #10B98160, 0 0 60px #10B98140, 6px 6px 20px rgba(0,0,0,0.9)`
                          : countdownState.seconds > 60
                          ? `0 0 20px #F59E0B80, 0 0 40px #F59E0B60, 0 0 60px #F59E0B40, 6px 6px 20px rgba(0,0,0,0.9)`
                          : countdownState.seconds > 30
                          ? `0 0 20px #F9731680, 0 0 40px #F9731660, 0 0 60px #F9731640, 6px 6px 20px rgba(0,0,0,0.9)`
                          : countdownState.seconds > 10
                          ? `0 0 20px #EF444480, 0 0 40px #EF444460, 0 0 60px #EF444440, 6px 6px 20px rgba(0,0,0,0.9)`
                          : `0 0 20px #DC262680, 0 0 40px #DC262660, 0 0 60px #DC262640, 6px 6px 20px rgba(0,0,0,0.9)`,
                      letterSpacing: "0.1em",
                      animation:
                        countdownState.seconds > 10
                          ? "subtlePulse 2s ease-in-out infinite"
                          : "subtlePulse 1s ease-in-out infinite",
                    }}
                  >
                    {formatCountdown(countdownState.seconds)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="relative z-10 px-0 pb-0">
          <div className="grid grid-cols-6 gap-3 max-w-[95%] mx-auto">
            {prayers.map((prayer, index) => {
              // Check if this is the next prayer (excluding Sunrise as it doesn't have Iqamah)
              const isNextPrayer = prayer.name.toLowerCase() === nextPrayerName;

              return (
                <div
                  key={index}
                  className={`relative overflow-hidden rounded-3xl transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                    isNextPrayer
                      ? "bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 shadow-xl shadow-yellow-500/50"
                      : "bg-gradient-to-br from-teal-600/90 to-cyan-700/90 backdrop-blur-sm"
                  }`}
                  style={{
                    border: isNextPrayer
                      ? "3px solid rgba(251, 191, 36, 0.6)"
                      : "2px solid rgba(255, 255, 255, 0.15)",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0"></div>

                  <div className="relative px-4 pt-1 pb-0 text-center">
                    <div
                      className="text-4xl font-bold mb-2 tracking-wide"
                      style={{
                        ...textStyle,
                        color: isNextPrayer ? "#1e293b" : "#ffffff",
                      }}
                    >
                      {prayer.name}{" "}
                      <span className="text-3xl">({prayer.nameAr})</span>
                    </div>
                    <div
                      className="text-6xl font-black"
                      style={{
                        ...textStyle,
                        fontSize: "6rem",
                        color: isNextPrayer ? "#1e293b" : "#fbbf24",
                        textShadow: isNextPrayer
                          ? "2px 2px 4px rgba(0,0,0,0.2)"
                          : "2px 2px 8px rgba(0,0,0,0.9)",
                      }}
                    >
                      {prayer.adhan}
                    </div>

                    {/* Add a "NEXT" badge for the next prayer */}
                    {isNextPrayer && (
                      <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold px-4 py-1 rounded-full rotate-12 shadow-lg">
                        NEXT
                      </div>
                    )}
                  </div>

                  <div
                    className={`absolute bottom-0 left-0 right-0 h-1.5 ${
                      isNextPrayer
                        ? "bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300"
                        : "bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400"
                    }`}
                  ></div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="absolute top-0 left-0 w-32 h-32 opacity-20">
          <svg viewBox="0 0 100 100" fill="currentColor" className="text-white">
            <path d="M0,0 L100,0 L100,100 Q50,50 0,100 Z" />
          </svg>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
          <svg viewBox="0 0 100 100" fill="currentColor" className="text-white">
            <path d="M100,0 L0,0 L0,100 Q50,50 100,100 Z" />
          </svg>
        </div>
        {customization.announcements &&
          customization.announcements.length > 0 && (
            <div
              className="absolute bottom-0 left-0 right-0 py-6 overflow-hidden z-20"
              style={{ backgroundColor: `${customization.colors.primary}DD` }}
            >
              <div
                className="whitespace-nowrap text-3xl font-semibold px-16"
                style={textStyle}
              >
                📢 {customization.announcements[currentAnnouncement].text}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

export default MasjidTemplateAuthentic;
