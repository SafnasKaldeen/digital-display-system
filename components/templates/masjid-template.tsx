"use client";

import type React from "react";
import { useState, useEffect } from "react";
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
  iqamahOffsets: {
    fajr: number;
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
  showHijriDate: boolean;
  font: string;
  prayerInstructionImage: string;
  prayerInstructionDuration: number;
}

interface MasjidTemplateProps {
  customization: MasjidCustomization;
  backgroundStyle: React.CSSProperties;
}

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

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate next event (Adhan or Iqamah)
  useEffect(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const currentSeconds = now.getSeconds();

    const prayers = [
      {
        name: "Fajr",
        adhan: customization.prayerTimes.fajr,
        offset: customization.iqamahOffsets.fajr,
      },
      {
        name: "Dhuhr",
        adhan: customization.prayerTimes.dhuhr,
        offset: customization.iqamahOffsets.dhuhr,
      },
      {
        name: "Asr",
        adhan: customization.prayerTimes.asr,
        offset: customization.iqamahOffsets.asr,
      },
      {
        name: "Maghrib",
        adhan: customization.prayerTimes.maghrib,
        offset: customization.iqamahOffsets.maghrib,
      },
      {
        name: "Isha",
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
          name: prayer.name,
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
          name: prayer.name,
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
        name: prayers[0].name,
        type: "adhan",
        timeUntil: `${displayHours.toString().padStart(2, "0")}:${displayMinutes
          .toString()
          .padStart(2, "0")}:${displaySeconds.toString().padStart(2, "0")}`,
      });
    }
  }, [currentTime, customization.prayerTimes, customization.iqamahOffsets]);

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

  // Slideshow rotation - FIXED
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

  const getHijriDate = () => {
    const date = new Date();
    return date.toLocaleDateString("en-US-u-ca-islamic", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const hijriDate = customization.showHijriDate ? getHijriDate() : null;

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
      name: "Fajr",
      time: customization.prayerTimes.fajr,
      offset: customization.iqamahOffsets.fajr,
    },
    {
      name: "Dhuhr",
      time: customization.prayerTimes.dhuhr,
      offset: customization.iqamahOffsets.dhuhr,
    },
    {
      name: "Asr",
      time: customization.prayerTimes.asr,
      offset: customization.iqamahOffsets.asr,
    },
    {
      name: "Maghrib",
      time: customization.prayerTimes.maghrib,
      offset: customization.iqamahOffsets.maghrib,
    },
    {
      name: "Isha",
      time: customization.prayerTimes.isha,
      offset: customization.iqamahOffsets.isha,
    },
  ];

  // FIXED: Dynamic background style that handles slideshow
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

  // AUTHENTIC LAYOUT - Use imported component
  if (customization.layout === "authentic") {
    return (
      <MasjidTemplateAuthentic
        customization={customization}
        backgroundStyle={dynamicBackgroundStyle}
      />
    );
  }

  // VERTICAL LAYOUT
  const renderVerticalLayout = () => {
    const isAdhanSoon = isCloseToAdhan();

    return (
      <div className="w-full h-[100%] flex flex-col p-10 overflow-hidden">
        <MasjidHeader />
        <div className="flex-1 grid grid-cols-2 gap-10">
          <div className="flex flex-col justify-center space-y-6">
            {prayers.map((prayer) => (
              <div
                key={prayer.name}
                className="flex items-center justify-between p-7 rounded-xl backdrop-blur-sm"
                style={{
                  backgroundColor: `${customization.colors.primary}40`,
                  borderLeft: `7px solid ${customization.colors.accent}`,
                }}
              >
                <div className="flex-1">
                  <h3
                    className="text-5xl font-extrabold leading-tight"
                    style={textStyle}
                  >
                    {prayer.name}
                  </h3>
                  <p
                    className="text-3xl opacity-85 leading-tight mt-1"
                    style={textStyle}
                  >
                    Iqamah:{" "}
                    {formatTime(
                      calculateIqamahTime(prayer.time, prayer.offset)
                    )}
                  </p>
                </div>
                <div
                  className="text-6xl font-bold"
                  style={{ ...textStyle, color: customization.colors.accent }}
                >
                  {formatTime(prayer.time)}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col justify-between h-full">
            {nextEvent && (
              <div
                className="rounded-3xl backdrop-blur-sm text-center transition-all flex-1 flex flex-col justify-center p-8"
                style={{ backgroundColor: `${customization.colors.accent}DD` }}
              >
                <p
                  className={`mb-3 ${isAdhanSoon ? "text-4xl" : "text-3xl"}`}
                  style={textStyle}
                >
                  {nextEvent.type === "adhan"
                    ? `Next Adhan: ${nextEvent.name}`
                    : `${nextEvent.name} Iqamah`}
                </p>
                <p
                  className={`font-extrabold font-mono ${
                    isAdhanSoon ? "text-[8rem]" : "text-7xl"
                  }`}
                  style={textStyle}
                >
                  {nextEvent.timeUntil}
                </p>
                {isAdhanSoon && (
                  <p className="text-3xl mt-3 animate-pulse" style={textStyle}>
                    🕌 Adhan Time Approaching
                  </p>
                )}
              </div>
            )}

            <div
              className="p-8 rounded-3xl backdrop-blur-sm text-center flex-1 flex flex-col justify-center mt-6"
              style={{ backgroundColor: `${customization.colors.primary}60` }}
            >
              <p className="text-2xl opacity-80 mb-2" style={textStyle}>
                Current Time
              </p>
              <p
                className="text-7xl font-bold font-mono mb-2"
                style={textStyle}
              >
                {currentTime.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
              <p className="text-3xl opacity-90" style={textStyle}>
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            {hijriDate && customization.showHijriDate && (
              <div
                className="p-6 rounded-3xl backdrop-blur-sm text-center mt-6"
                style={{ backgroundColor: `${customization.colors.primary}50` }}
              >
                <p className="text-2xl opacity-80 mb-2" style={textStyle}>
                  Islamic Date
                </p>
                <p className="text-3xl font-semibold" style={textStyle}>
                  {hijriDate}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // HORIZONTAL LAYOUT
  const renderHorizontalLayout = () => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const isAdhanSoon = isCloseToAdhan();

    return (
      <div className="w-full h-full flex flex-col justify-center px-20 py-8 space-y-12 overflow-hidden">
        <div className="mb-4">
          <MasjidHeader />
        </div>

        <div className="grid grid-cols-3 gap-12">
          <div
            className="col-span-2 p-14 rounded-3xl backdrop-blur-sm"
            style={{ backgroundColor: `${customization.colors.primary}60` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl opacity-80 mb-6" style={textStyle}>
                  Current Time
                </p>
                <p
                  className="text-[6rem] font-extrabold font-mono leading-none"
                  style={textStyle}
                >
                  {currentTime.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-5xl" style={textStyle}>
                  {currentTime.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                {hijriDate && customization.showHijriDate && (
                  <p className="text-3xl opacity-80 mt-5" style={textStyle}>
                    {hijriDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {nextEvent && (
            <div
              className={`rounded-3xl backdrop-blur-sm flex flex-col justify-center items-center transition-all ${
                isAdhanSoon ? "p-12 animate-pulse" : "p-12"
              }`}
              style={{ backgroundColor: `${customization.colors.accent}DD` }}
            >
              <p
                className={`mb-5 ${isAdhanSoon ? "text-4xl" : "text-3xl"}`}
                style={textStyle}
              >
                {nextEvent.type === "adhan" ? "Next Adhan" : "Iqamah"}
              </p>
              <p
                className={`font-bold mb-5 ${
                  isAdhanSoon ? "text-6xl" : "text-5xl"
                }`}
                style={textStyle}
              >
                {nextEvent.name}
              </p>
              <p
                className={`font-extrabold font-mono ${
                  isAdhanSoon ? "text-8xl" : "text-7xl"
                }`}
                style={textStyle}
              >
                {nextEvent.timeUntil}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-5 gap-10">
          {prayers.map((prayer) => {
            const [prayerHours, prayerMinutes] = prayer.time
              .split(":")
              .map(Number);
            const prayerTime = prayerHours * 60 + prayerMinutes;
            const isPassed = currentMinutes > prayerTime;

            return (
              <div
                key={prayer.name}
                className="p-10 rounded-3xl backdrop-blur-sm text-center transition-all"
                style={{
                  backgroundColor: isPassed
                    ? `${customization.colors.primary}30`
                    : `${customization.colors.primary}60`,
                  border: `6px solid ${
                    isPassed
                      ? customization.colors.primary
                      : customization.colors.accent
                  }`,
                  opacity: isPassed ? 0.7 : 1,
                }}
              >
                <h3 className="text-4xl font-bold mb-5" style={textStyle}>
                  {prayer.name}
                </h3>
                <div
                  className="text-7xl font-extrabold mb-6"
                  style={{ ...textStyle, color: customization.colors.accent }}
                >
                  {formatTime(prayer.time)}
                </div>
                <div className="pt-5 border-t-2 border-white/30">
                  <p className="text-2xl opacity-80 mb-3" style={textStyle}>
                    Iqamah
                  </p>
                  <p className="text-3xl font-semibold" style={textStyle}>
                    {formatTime(
                      calculateIqamahTime(prayer.time, prayer.offset)
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // CENTERED LAYOUT
  const renderCenteredLayout = () => {
    const isAdhanSoon = isCloseToAdhan();

    return (
      <div className="w-full h-full flex flex-col items-center justify-center px-24 py-8 overflow-hidden">
        <div className="mb-8">
          <MasjidHeader />
        </div>

        <div className="flex-1 w-full max-w-8xl space-y-12">
          <div className="flex justify-between items-end px-4">
            <div className="text-left">
              <p className="text-3xl opacity-80" style={textStyle}>
                Current Time
              </p>
              <p
                className="text-7xl font-bold font-mono mt-2"
                style={textStyle}
              >
                {currentTime.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
            </div>

            {hijriDate && customization.showHijriDate && (
              <div className="text-right">
                <p className="text-3xl opacity-80" style={textStyle}>
                  Islamic Date
                </p>
                <p className="text-4xl font-semibold mt-2" style={textStyle}>
                  {hijriDate}
                </p>
              </div>
            )}
          </div>

          {nextEvent && (
            <div
              className={`rounded-3xl backdrop-blur-sm transition-all ${
                isAdhanSoon ? "p-10 animate-pulse" : "p-16"
              }`}
              style={{ backgroundColor: `${customization.colors.accent}DD` }}
            >
              <p
                className={`mb-8 ${isAdhanSoon ? "text-5xl" : "text-4xl"}`}
                style={textStyle}
              >
                {nextEvent.type === "adhan"
                  ? `${nextEvent.name} Adhan`
                  : `${nextEvent.name} Iqamah`}
              </p>
              <p
                className={`font-extrabold font-mono leading-none ${
                  isAdhanSoon ? "text-[11rem]" : "text-[9rem]"
                }`}
                style={textStyle}
              >
                {nextEvent.timeUntil}
              </p>
              {isAdhanSoon && (
                <p className="text-4xl mt-4" style={textStyle}>
                  🕌 Adhan Time Approaching
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-5 gap-10">
            {prayers.map((prayer) => (
              <div
                key={prayer.name}
                className="p-6 rounded-3xl backdrop-blur-sm"
                style={{
                  backgroundColor: `${customization.colors.primary}50`,
                  border: `6px solid ${customization.colors.accent}`,
                }}
              >
                <h4 className="text-5xl font-bold mb-6" style={textStyle}>
                  {prayer.name}
                </h4>
                <p
                  className="text-5xl font-extrabold mb-6"
                  style={{ ...textStyle, color: customization.colors.accent }}
                >
                  {formatTime(prayer.time)}
                </p>
                <p className="text-2xl opacity-80" style={textStyle}>
                  +{prayer.offset} min Iqamah
                </p>
              </div>
            ))}
          </div>
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
