import React, { useState, useEffect } from "react";
import { FlipClockWrapper } from "./components/masjid/FlipClockWrapper";

interface PrayerTimes {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

interface IqamahOffsets {
  fajr: number;
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
  }, [customization.announcements, currentAnnouncement]);

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
        setHijriDate(
          `${hijri.day}th - ${hijri.month.en} ( ${hijri.month.number}th month ) - ${hijri.year}`
        );
      }
    } catch (error) {
      console.error("Error fetching Hijri date:", error);
    }
  };

  const getNextPrayer = () => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

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
      const prayerTime = hours * 60 + minutes;
      const iqamahTime = prayerTime + prayer.offset;

      if (iqamahTime > currentMinutes) {
        const targetDate = new Date();
        targetDate.setHours(Math.floor(iqamahTime / 60), iqamahTime % 60, 0, 0);
        return {
          name: prayer.name,
          time: targetDate,
          adhan: prayer.time,
          offset: prayer.offset,
        };
      }
    }

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
      adhan: customization.prayerTimes.fajr,
      offset: customization.iqamahOffsets.fajr,
    };
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

    return `${day}${getSuffix(day)} , ${weekday} - ${month} - ${year}`;
  };

  const nextPrayer = getNextPrayer();

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
      adhan: customization.prayerTimes.fajr,
      offset: customization.iqamahOffsets.fajr,
      icon: "🌙",
    },
    {
      name: "Sunrise",
      nameAr: "الشروق",
      adhan: calculateSunriseTime(),
      offset: 0,
      icon: "🌅",
    },
    {
      name: "Dhuhr",
      nameAr: "الظهر",
      adhan: customization.prayerTimes.dhuhr,
      offset: customization.iqamahOffsets.dhuhr,
      icon: "☀️",
    },
    {
      name: "Asr",
      nameAr: "العصر",
      adhan: customization.prayerTimes.asr,
      offset: customization.iqamahOffsets.asr,
      icon: "🌤️",
    },
    {
      name: "Maghrib",
      nameAr: "المغرب",
      adhan: customization.prayerTimes.maghrib,
      offset: customization.iqamahOffsets.maghrib,
      icon: "🌆",
    },
    {
      name: "Isha",
      nameAr: "العشاء",
      adhan: customization.prayerTimes.isha,
      offset: customization.iqamahOffsets.isha,
      icon: "✨",
    },
  ];

  const textStyle = {
    color: customization.colors.text,
    fontFamily: `'${customization.font}', 'Amiri', 'Scheherazade New', serif`,
    textShadow: "2px 2px 8px rgba(0,0,0,0.9)",
  };

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
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Amiri:wght@400;700&family=Scheherazade+New:wght@400;700&family=Roboto:wght@400;700&family=Open+Sans:wght@400;700&family=Lato:wght@400;700&family=Inter:wght@400;700&display=swap"
          rel="stylesheet"
        />

        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%23ffffff' fill-opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: "30px 30px",
          }}
        ></div>

        <div className="relative z-10 flex flex-col items-center p-8 pb-4 bg-gradient-to-b from-black/40 to-transparent">
          <div className="text-center mb-2">
            <span
              className="text-3xl font-bold tracking-wide"
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

          <div className="flex items-center gap-3">
            <span className="text-5xl">🕌</span>
            <h1
              className="text-6xl mt-2 font-bold tracking-wide uppercase"
              style={textStyle}
            >
              {customization.masjidName}
            </h1>
          </div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 py-12">
          <FlipClockWrapper targetTime={nextPrayer.time} />

          <div className="w-full max-w-7xl grid grid-cols-2 gap-12">
            <div className="flex flex-col items-center justify-center py-2 px-8">
              <h3
                className="text-8xl font-black tracking-tight mb-8"
                style={{ ...textStyle, color: customization.colors.secondary }}
              >
                ADHAN
              </h3>
              <div
                className="text-[9rem] font-black leading-none"
                style={{
                  fontFamily: "'Orbitron', monospace",
                  fontWeight: 900,
                  color: customization.colors.secondary,
                  textShadow: `
                    0 0 10px ${customization.colors.secondary}80,
                    0 0 20px ${customization.colors.secondary}60,
                    0 0 30px ${customization.colors.secondary}40,
                    4px 4px 16px rgba(0,0,0,0.8)
                  `,
                  letterSpacing: "0.1em",
                }}
              >
                {nextPrayer.adhan}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center py-2 px-8">
              <h3
                className="text-8xl font-black tracking-tight mb-8"
                style={{ ...textStyle, color: customization.colors.accent }}
              >
                IQAMATH
              </h3>
              <div
                className="text-[9rem] font-black leading-none"
                style={{
                  fontFamily: "'Orbitron', monospace",
                  fontWeight: 900,
                  color: customization.colors.accent,
                  textShadow: `
                    0 0 10px ${customization.colors.accent}80,
                    0 0 20px ${customization.colors.accent}60,
                    0 0 30px ${customization.colors.accent}40,
                    4px 4px 16px rgba(0,0,0,0.8)
                  `,
                  letterSpacing: "0.1em",
                }}
              >
                {calculateIqamahTime(nextPrayer.adhan, nextPrayer.offset)}
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 px-0 pb-4">
          <div className="grid grid-cols-6 gap-6 max-w-[95%] mx-auto">
            {prayers.map((prayer, index) => (
              <div
                key={index}
                className={`relative overflow-hidden rounded-3xl transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  index === 5
                    ? "bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 shadow-xl shadow-yellow-500/50"
                    : "bg-gradient-to-br from-teal-600/90 to-cyan-700/90 backdrop-blur-sm"
                }`}
                style={{
                  border:
                    index === 5
                      ? "3px solid rgba(251, 191, 36, 0.6)"
                      : "2px solid rgba(255, 255, 255, 0.15)",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0"></div>

                <div className="relative p-6 text-center">
                  <div
                    className="text-4xl font-bold mb-3 tracking-wide"
                    style={{
                      ...textStyle,
                      color: index === 5 ? "#1e293b" : "#ffffff",
                    }}
                  >
                    {prayer.name}{" "}
                    <span className="text-2xl">({prayer.nameAr})</span>
                  </div>
                  <div
                    className="text-6xl font-black"
                    style={{
                      ...textStyle,
                      color: index === 5 ? "#1e293b" : "#fbbf24",
                      textShadow:
                        index === 5
                          ? "2px 2px 4px rgba(0,0,0,0.2)"
                          : "2px 2px 8px rgba(0,0,0,0.9)",
                    }}
                  >
                    {prayer.adhan}
                  </div>
                </div>

                <div
                  className={`absolute bottom-0 left-0 right-0 h-1.5 ${
                    index === 5
                      ? "bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300"
                      : "bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400"
                  }`}
                ></div>
              </div>
            ))}
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
