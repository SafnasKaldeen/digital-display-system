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
    ishraqTime: "ISHRAQ TIME",
    ishraqSubtitle: "Voluntary Prayer Time After Sunrise",
    ishraqRemaining: "Time Remaining",
  },
  ta: {
    adhan: "அதான்",
    iqamah: "இகாமத்",
    adhanIn: "அதான் வரும் நேரம்",
    iqamahIn: "இகாமத் வரும் நேரம்",
    nextAdhan: "அடுத்த அதான்",
    nextIqamah: "இகாமத்",
    currentTime: "தற்போதைய நேரம்",
    islamicDate: "இஸ்லாமிய தேதி",
    ishraqTime: "இஷ்ராக் நேரம்",
    ishraqSubtitle: "சூரிய உதயத்திற்குப் பிறகு தன்னார்வ தொழுகை நேரம்",
    ishraqRemaining: "மீதமுள்ள நேரம்",
  },
};

// Prayer Instructions Component
const PrayerInstructions = ({ imageUrl, accentColor, duration, onClose }) => {
  const [remainingTime, setRemainingTime] = useState(duration);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1000) {
          onClose();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [duration, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="relative w-full h-full">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
        >
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="text-white text-2xl font-semibold">
                Prayer Instructions
              </div>
              <div className="text-white text-xl">
                Closing in: {Math.ceil(remainingTime / 1000)}s
              </div>
            </div>

            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-100 ease-linear"
                style={{
                  width: `${(remainingTime / duration) * 100}%`,
                  backgroundColor: accentColor,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Ishraq Countdown Component
const IshraqCountdown = ({
  accentColor,
  secondaryColor,
  remainingSeconds,
  language,
  onClose,
}) => {
  const t = translations[language] || translations.en;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        <div className="text-center space-y-8">
          <div className="text-8xl mb-4">🌅</div>
          <h1
            className="text-7xl font-bold tracking-wide"
            style={{ color: accentColor }}
          >
            {t.ishraqTime}
          </h1>
          <p className="text-3xl text-white opacity-80">{t.ishraqSubtitle}</p>

          <div className="mt-12">
            <p className="text-4xl text-white mb-4">{t.ishraqRemaining}</p>
            <div
              className="text-[12rem] font-bold"
              style={{
                fontFamily: "monospace",
                color: secondaryColor,
              }}
            >
              {minutes.toString().padStart(2, "0")}:
              {seconds.toString().padStart(2, "0")}
            </div>
          </div>

          <div className="mt-12 w-96 mx-auto">
            <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-1000"
                style={{
                  width: `${((20 * 60 - remainingSeconds) / (20 * 60)) * 100}%`,
                  backgroundColor: accentColor,
                }}
              />
            </div>
          </div>
        </div>
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

      for (const prayer of prayers) {
        const [hours, minutes] = prayer.time.split(":").map(Number);
        const adhanMinutes = hours * 60 + minutes;
        const iqamahMinutes = adhanMinutes + prayer.offset;

        const timeSinceIqamah = currentMinutes - iqamahMinutes;
        const durationInMinutes = customization.prayerInstructionDuration / 60;

        if (timeSinceIqamah >= 0 && timeSinceIqamah <= durationInMinutes) {
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
                    {t.iqamah}:{" "}
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
                    ? `${t.nextAdhan}: ${nextEvent.name}`
                    : `${nextEvent.name} ${t.nextIqamah}`}
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
                    🕌 {t.adhanIn}
                  </p>
                )}
              </div>
            )}

            <div
              className="p-8 rounded-3xl backdrop-blur-sm text-center flex-1 flex flex-col justify-center mt-6"
              style={{ backgroundColor: `${customization.colors.primary}60` }}
            >
              <p className="text-2xl opacity-80 mb-2" style={textStyle}>
                {t.currentTime}
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
                  {t.islamicDate}
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
                  {t.currentTime}
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
                {nextEvent.type === "adhan" ? t.nextAdhan : t.nextIqamah}
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
                    {t.iqamah}
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
                {t.currentTime}
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
                  {t.islamicDate}
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
                  ? `${nextEvent.name} ${t.adhan}`
                  : `${nextEvent.name} ${t.iqamah}`}
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
                  🕌 {t.adhanIn}
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
                  +{prayer.offset} min {t.iqamah}
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
