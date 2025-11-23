"use client";

import type React from "react";
import { useState, useEffect } from "react";

interface MasjidCustomization {
  template: string;
  layout: string;
  prayerTimes: {
    fajr: string;
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

      if (adhanTime > currentMinutes) {
        const diff = adhanTime - currentMinutes;
        const hours = Math.floor(diff / 60);
        const minutes = diff % 60;
        const seconds = 60 - now.getSeconds();

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

      if (adhanTime <= currentMinutes && iqamahTime > currentMinutes) {
        const diff = iqamahTime - currentMinutes;
        const hours = Math.floor(diff / 60);
        const minutes = diff % 60;
        const seconds = 60 - now.getSeconds();

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
      const diff = 24 * 60 - currentMinutes + fajrMinutes;
      const displayHours = Math.floor(diff / 60);
      const displayMinutes = diff % 60;

      setNextEvent({
        name: prayers[0].name,
        type: "adhan",
        timeUntil: `${displayHours.toString().padStart(2, "0")}:${displayMinutes
          .toString()
          .padStart(2, "0")}:00`,
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

  const dynamicBackgroundStyle =
    customization.backgroundType === "slideshow" &&
    customization.backgroundImage?.[currentImageIndex]
      ? {
          ...backgroundStyle,
          backgroundImage: `url(${customization.backgroundImage[currentImageIndex]})`,
          transition: "background-image 1s ease-in-out",
        }
      : backgroundStyle;

  // Check if we're close to Adhan time (within 10 minutes)
  const isCloseToAdhan = () => {
    if (!nextEvent || nextEvent.type !== "adhan") return false;
    const [hours, minutes] = nextEvent.timeUntil.split(":").map(Number);
    return hours === 0 && minutes <= 10;
  };

  // VERTICAL LAYOUT - Split screen: prayers on left, info on right
  const renderVerticalLayout = () => {
    const isAdhanSoon = isCloseToAdhan();

    return (
      <div className="w-full h-full grid grid-cols-2 gap-3 p-3 overflow-hidden">
        {/* LEFT SIDE - All Prayer Times */}
        <div className="flex flex-col justify-center space-y-2">
          {prayers.map((prayer) => (
            <div
              key={prayer.name}
              className="flex items-center justify-between p-2 rounded backdrop-blur-sm"
              style={{
                backgroundColor: `${customization.colors.primary}40`,
                borderLeft: `3px solid ${customization.colors.accent}`,
              }}
            >
              <div className="flex-1">
                <h3
                  className="text-sm font-bold leading-tight"
                  style={textStyle}
                >
                  {prayer.name}
                </h3>
                <p
                  className="text-xs opacity-75 leading-tight"
                  style={textStyle}
                >
                  Iqamah:{" "}
                  {formatTime(calculateIqamahTime(prayer.time, prayer.offset))}
                </p>
              </div>
              <div
                className="text-lg font-bold"
                style={{ ...textStyle, color: customization.colors.accent }}
              >
                {formatTime(prayer.time)}
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT SIDE - Current Time, Countdown, Date */}
        <div className="flex flex-col justify-center space-y-2">
          {/* Next Prayer Countdown - Larger when Adhan is soon */}
          {nextEvent && (
            <div
              className={`rounded-xl backdrop-blur-sm text-center transition-all ${
                isAdhanSoon ? "p-6" : "p-4"
              }`}
              style={{ backgroundColor: `${customization.colors.accent}DD` }}
            >
              <p
                className={`mb-2 ${isAdhanSoon ? "text-lg" : "text-sm"}`}
                style={textStyle}
              >
                {nextEvent.type === "adhan"
                  ? `Next Adhan: ${nextEvent.name}`
                  : `${nextEvent.name} Iqamah`}
              </p>
              <p
                className={`font-bold font-mono ${
                  isAdhanSoon ? "text-5xl" : "text-4xl"
                }`}
                style={textStyle}
              >
                {nextEvent.timeUntil}
              </p>
              {isAdhanSoon && (
                <p className="text-base mt-2 animate-pulse" style={textStyle}>
                  🕌 Adhan Time Approaching
                </p>
              )}
            </div>
          )}

          {/* Current Time Display */}
          <div
            className="p-4 rounded-xl backdrop-blur-sm text-center"
            style={{ backgroundColor: `${customization.colors.primary}60` }}
          >
            <p className="text-xs opacity-80 mb-1" style={textStyle}>
              Current Time
            </p>
            <p className="text-4xl font-bold font-mono mb-1" style={textStyle}>
              {currentTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </p>
            <p className="text-sm opacity-90" style={textStyle}>
              {currentTime.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          {/* Hijri Date */}
          {hijriDate && customization.showHijriDate && (
            <div
              className="p-3 rounded-xl backdrop-blur-sm text-center"
              style={{ backgroundColor: `${customization.colors.primary}50` }}
            >
              <p className="text-xs opacity-80 mb-1" style={textStyle}>
                Islamic Date
              </p>
              <p className="text-sm font-semibold" style={textStyle}>
                {hijriDate}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // HORIZONTAL LAYOUT - Modern card design
  const renderHorizontalLayout = () => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const isAdhanSoon = isCloseToAdhan();

    return (
      <div className="w-full h-full flex flex-col justify-center px-4 py-3 space-y-3 overflow-hidden">
        {/* Top Section - Current Time & Date */}
        <div className="grid grid-cols-3 gap-3">
          <div
            className="col-span-2 p-4 rounded-xl backdrop-blur-sm"
            style={{ backgroundColor: `${customization.colors.primary}60` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs opacity-80 mb-1" style={textStyle}>
                  Current Time
                </p>
                <p className="text-4xl font-bold font-mono" style={textStyle}>
                  {currentTime.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-base" style={textStyle}>
                  {currentTime.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                {hijriDate && customization.showHijriDate && (
                  <p className="text-xs opacity-80 mt-1" style={textStyle}>
                    {hijriDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Countdown - Larger when Adhan is soon */}
          {nextEvent && (
            <div
              className={`rounded-xl backdrop-blur-sm flex flex-col justify-center items-center transition-all ${
                isAdhanSoon ? "p-4 animate-pulse" : "p-4"
              }`}
              style={{ backgroundColor: `${customization.colors.accent}DD` }}
            >
              <p
                className={`mb-1 ${isAdhanSoon ? "text-sm" : "text-xs"}`}
                style={textStyle}
              >
                {nextEvent.type === "adhan" ? "Next Adhan" : "Iqamah"}
              </p>
              <p
                className={`font-bold mb-1 ${
                  isAdhanSoon ? "text-lg" : "text-base"
                }`}
                style={textStyle}
              >
                {nextEvent.name}
              </p>
              <p
                className={`font-bold font-mono ${
                  isAdhanSoon ? "text-3xl" : "text-2xl"
                }`}
                style={textStyle}
              >
                {nextEvent.timeUntil}
              </p>
            </div>
          )}
        </div>

        {/* Bottom Section - Prayer Times in Cards */}
        <div className="grid grid-cols-5 gap-2">
          {prayers.map((prayer) => {
            const [prayerHours, prayerMinutes] = prayer.time
              .split(":")
              .map(Number);
            const prayerTime = prayerHours * 60 + prayerMinutes;
            const isPassed = currentMinutes > prayerTime;

            return (
              <div
                key={prayer.name}
                className="p-3 rounded-lg backdrop-blur-sm text-center transition-all"
                style={{
                  backgroundColor: isPassed
                    ? `${customization.colors.primary}30`
                    : `${customization.colors.primary}60`,
                  border: `2px solid ${
                    isPassed
                      ? customization.colors.primary
                      : customization.colors.accent
                  }`,
                  opacity: isPassed ? 0.7 : 1,
                }}
              >
                <h3 className="text-sm font-bold mb-1" style={textStyle}>
                  {prayer.name}
                </h3>
                <div
                  className="text-2xl font-bold mb-1"
                  style={{ ...textStyle, color: customization.colors.accent }}
                >
                  {formatTime(prayer.time)}
                </div>
                <div className="pt-1 border-t border-white/20">
                  <p className="text-xs opacity-80" style={textStyle}>
                    Iqamah
                  </p>
                  <p className="text-xs font-semibold" style={textStyle}>
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
      <div className="w-full h-full flex items-center justify-center px-4 py-3 overflow-hidden">
        <div className="text-center space-y-3 w-full max-w-6xl">
          {/* Hijri Date */}
          {hijriDate && customization.showHijriDate && (
            <div className="text-sm mb-2" style={textStyle}>
              📅 {hijriDate}
            </div>
          )}

          {/* Large Countdown - Extra large when Adhan is soon */}
          {nextEvent && (
            <div
              className={`rounded-xl backdrop-blur-sm transition-all ${
                isAdhanSoon ? "p-8 animate-pulse" : "p-6"
              }`}
              style={{ backgroundColor: `${customization.colors.accent}DD` }}
            >
              <p
                className={`mb-2 ${isAdhanSoon ? "text-xl" : "text-lg"}`}
                style={textStyle}
              >
                {nextEvent.type === "adhan"
                  ? `${nextEvent.name} Adhan`
                  : `${nextEvent.name} Iqamah`}
              </p>
              <p
                className={`font-bold font-mono ${
                  isAdhanSoon ? "text-6xl" : "text-5xl"
                }`}
                style={textStyle}
              >
                {nextEvent.timeUntil}
              </p>
              {isAdhanSoon && (
                <p className="text-lg mt-3" style={textStyle}>
                  🕌 Adhan Time Approaching
                </p>
              )}
            </div>
          )}

          {/* Compact Prayer Grid */}
          <div className="grid grid-cols-5 gap-2">
            {prayers.map((prayer) => (
              <div
                key={prayer.name}
                className="p-2 rounded-lg backdrop-blur-sm"
                style={{
                  backgroundColor: `${customization.colors.primary}50`,
                  border: `2px solid ${customization.colors.accent}`,
                }}
              >
                <h4 className="text-xs font-bold mb-1" style={textStyle}>
                  {prayer.name}
                </h4>
                <p
                  className="text-lg font-bold mb-0.5"
                  style={{ ...textStyle, color: customization.colors.accent }}
                >
                  {formatTime(prayer.time)}
                </p>
                <p className="text-xs opacity-70" style={textStyle}>
                  +{prayer.offset}m
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
      className="w-full h-full relative overflow-hidden"
      style={dynamicBackgroundStyle}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Content */}
      <div className="relative z-10 w-full h-full">
        {customization.layout === "vertical" && renderVerticalLayout()}
        {customization.layout === "horizontal" && renderHorizontalLayout()}
        {customization.layout === "centered" && renderCenteredLayout()}
      </div>

      {/* Announcements Ticker */}
      {customization.announcements &&
        customization.announcements.length > 0 && (
          <div
            className="fixed bottom-0 left-0 right-0 py-3 overflow-hidden z-20"
            style={{
              backgroundColor: `${customization.colors.primary}DD`,
            }}
          >
            <div
              className="whitespace-nowrap text-base font-semibold px-6"
              style={textStyle}
            >
              📢 {customization.announcements[currentAnnouncement].text}
            </div>
          </div>
        )}
    </div>
  );
}
