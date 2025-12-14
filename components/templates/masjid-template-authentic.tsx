"use client";

import React, { useState, useEffect, useRef } from "react";
import FlipClockWrapper from "./components/masjid/FlipClockWrapper";
import { PrayerInstructions } from "./components/masjid/PrayerInstructions";
import { IshraqCountdown } from "./components/masjid/IshraqCountdown";

interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

interface PrayerNames {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

interface IqamahOffsets {
  fajr: number;
  sunrise: number;
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

interface AnnouncementImage {
  id: string;
  url: string;
  duration: number;
  frequency?: number;
  schedule?: string[];
  name?: string;
}

interface MasjidCustomization {
  template: string;
  layout: string;
  masjidName: string;
  prayerTimes: PrayerTimes;
  prayerNames: PrayerNames;
  iqamahOffsets: IqamahOffsets;
  colors: Colors;
  backgroundType: string;
  backgroundImage: string[];
  slideshowDuration: number;
  announcements: Announcement[];
  announcementImages: AnnouncementImage[];
  showHijriDate: boolean;
  showArabic: boolean;
  font: string;
  prayerInstructionImage: string;
  prayerInstructionDuration: number;
  language?: string; // 'en' or 'ta'
}

interface MasjidTemplateProps {
  customization: MasjidCustomization;
  backgroundStyle: React.CSSProperties;
}

// Translations for labels only
const translations = {
  en: {
    adhan: "ADHAN",
    iqamah: "IQAMAH",
    adhanIn: "ADHAN IN",
    iqamahIn: "IQAMAH IN",
  },
  ta: {
    adhan: "அதான்",
    iqamah: "இகாமத்",
    adhanIn: "அதான் வரும் நேரம்",
    iqamahIn: "இகாமத் வரும் நேரம்",
  },
};

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

export function MasjidTemplateAuthentic({
  customization,
  backgroundStyle,
}: MasjidTemplateProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
  const [hijriDate, setHijriDate] = useState("");
  const [showArabic, setShowArabic] = useState(customization.showArabic);

  // Get language from config, default to 'en'
  const language = customization.language || "ta";
  const t =
    translations[language as keyof typeof translations] || translations.en;

  // Advertisement slideshow states
  const [activeAdvertisements, setActiveAdvertisements] = useState<
    AnnouncementImage[]
  >([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [adRemainingTime, setAdRemainingTime] = useState(0);
  const adTimerRef = useRef<NodeJS.Timeout | null>(null);
  const adCheckRef = useRef<NodeJS.Timeout | null>(null);
  const adCountdownRef = useRef<NodeJS.Timeout | null>(null);

  // Use refs to track state that needs to be accessed in callbacks
  const currentAdIndexRef = useRef(0);
  const activeAdsRef = useRef<AnnouncementImage[]>([]);
  const slideshowStartedRef = useRef(false);
  const slideshowStartTimeRef = useRef<number | null>(null);
  const isFirstAdRef = useRef(true);

  // Prayer instruction state (always overwrites ads)
  const [showInstructions, setShowInstructions] = useState(false);
  const [instructionsPrayer, setInstructionsPrayer] = useState("");
  const [instructionsRemainingTime, setInstructionsRemainingTime] = useState(0);

  // Ishraq countdown states
  const [showIshraqCountdown, setShowIshraqCountdown] = useState(false);
  const [ishraqRemainingSeconds, setIshraqRemainingSeconds] = useState(0);

  // Keep refs in sync with state
  useEffect(() => {
    currentAdIndexRef.current = currentAdIndex;
  }, [currentAdIndex]);

  useEffect(() => {
    activeAdsRef.current = activeAdvertisements;
  }, [activeAdvertisements]);

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
          name: customization.prayerNames.fajr || "fajr",
          key: "fajr",
          time: customization.prayerTimes.fajr,
          offset: customization.iqamahOffsets.fajr,
        },
        {
          name: getPrayerDisplayName(
            customization.prayerNames.dhuhr || "dhuhr",
            language
          ),
          key: "dhuhr",
          time: customization.prayerTimes.dhuhr,
          offset: customization.iqamahOffsets.dhuhr,
        },
        {
          name: customization.prayerNames.asr || "asr",
          key: "asr",
          time: customization.prayerTimes.asr,
          offset: customization.iqamahOffsets.asr,
        },
        {
          name: customization.prayerNames.maghrib || "maghrib",
          key: "maghrib",
          time: customization.prayerTimes.maghrib,
          offset: customization.iqamahOffsets.maghrib,
        },
        {
          name: customization.prayerNames.isha || "isha",
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

  // Ishraq Countdown Check (HIGH PRIORITY)
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

  // Advertisement Slideshow Check (LOWEST PRIORITY)
  useEffect(() => {
    const checkAdvertisements = () => {
      // Don't show ads if prayer instructions or Ishraq countdown are showing
      if (showInstructions || showIshraqCountdown) {
        // Clear any active ad slideshow
        clearAllAdTimers();
        resetSlideshowState();
        return;
      }

      // If we already showed ads in this minute, don't start again
      if (slideshowStartedRef.current) {
        // Check if we should stop (after showing all ads once)
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

      // Check if we're at a scheduled minute mark (first 5 seconds of the minute)
      if (currentSecond > 5) {
        return;
      }

      // Helper function to get schedule from announcement
      const getScheduleFromAnnouncement = (ad: AnnouncementImage): string[] => {
        if (ad.schedule && ad.schedule.length > 0) {
          return ad.schedule;
        }
        return ["00", "10", "20", "30", "40", "50"];
      };

      // Find ALL ads scheduled for this minute
      const scheduledAds = customization.announcementImages.filter((ad) => {
        const schedule = getScheduleFromAnnouncement(ad);
        return schedule.includes(currentMinute);
      });

      if (scheduledAds.length === 0) {
        // No ads scheduled for this minute
        return;
      }

      // Start the slideshow with all ads
      startAdvertisementSlideshow(scheduledAds);
    };

    adCheckRef.current = setInterval(checkAdvertisements, 1000);

    return () => {
      clearAllAdTimers();
      if (adCheckRef.current) {
        clearInterval(adCheckRef.current);
      }
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
    slideshowStartTimeRef.current = null;
    isFirstAdRef.current = true;
    activeAdsRef.current = [];
    currentAdIndexRef.current = 0;
  };

  const shouldStopSlideshow = (): boolean => {
    // Check if we've shown all ads at least once
    const ads = activeAdsRef.current;
    const currentIdx = currentAdIndexRef.current;

    // If we're at the last ad and it's not the first time through
    if (
      !isFirstAdRef.current &&
      ads.length > 0 &&
      currentIdx === ads.length - 1
    ) {
      return true;
    }

    return false;
  };

  const startAdvertisementSlideshow = (ads: AnnouncementImage[]) => {
    if (ads.length === 0) return;

    // Clear any existing timers
    clearAllAdTimers();

    // Reset state
    slideshowStartedRef.current = true;
    slideshowStartTimeRef.current = Date.now();
    isFirstAdRef.current = true;

    // Set active ads
    setActiveAdvertisements(ads);
    setCurrentAdIndex(0);
    currentAdIndexRef.current = 0;
    activeAdsRef.current = ads;

    // Set first ad duration
    const firstAdDuration = ads[0].duration * 1000;
    setAdRemainingTime(firstAdDuration);

    // Start countdown timer for current ad
    adTimerRef.current = setTimeout(() => {
      goToNextAdvertisement();
    }, firstAdDuration);

    // Start interval to update countdown display
    adCountdownRef.current = setInterval(() => {
      setAdRemainingTime((prev) => {
        const newTime = prev - 1000;
        if (newTime <= 0) {
          // Time's up, move to next ad
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

    // Mark that we're no longer on the first ad
    if (isFirstAdRef.current) {
      isFirstAdRef.current = false;
    }

    // Check if we've shown all ads once
    if (currentIdx === currentAds.length - 1) {
      // This was the last ad, end slideshow
      endSlideshow();
      return;
    }

    // Move to next ad
    const nextIndex = currentIdx + 1;

    // Update state
    setCurrentAdIndex(nextIndex);
    currentAdIndexRef.current = nextIndex;

    const nextAdDuration = currentAds[nextIndex].duration * 1000;
    setAdRemainingTime(nextAdDuration);

    // Clear previous timer and set new one
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

  // Function to manually go to next ad (for the Next button)
  const handleNextAdvertisement = () => {
    const currentAds = activeAdsRef.current;
    if (currentAds.length === 0) return;

    const currentIdx = currentAdIndexRef.current;

    // Mark that we're no longer on the first ad
    if (isFirstAdRef.current) {
      isFirstAdRef.current = false;
    }

    // Check if this is the last ad
    if (currentIdx === currentAds.length - 1) {
      // This is the last ad, end slideshow
      endSlideshow();
      return;
    }

    // Move to next ad
    const nextIndex = currentIdx + 1;

    // Update state
    setCurrentAdIndex(nextIndex);
    currentAdIndexRef.current = nextIndex;

    const nextAdDuration = currentAds[nextIndex].duration * 1000;
    setAdRemainingTime(nextAdDuration);

    // Clear previous timer and set new one
    if (adTimerRef.current) {
      clearTimeout(adTimerRef.current);
    }

    adTimerRef.current = setTimeout(() => {
      goToNextAdvertisement();
    }, nextAdDuration);
  };

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

    const prayers = [
      {
        name: customization.prayerNames.fajr || "Fajr",
        key: "fajr",
        time: customization.prayerTimes.fajr,
        offset: customization.iqamahOffsets.fajr,
      },
      {
        name: getPrayerDisplayName(
          customization.prayerNames.dhuhr || "Dhuhr",
          language
        ),
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
      const prayerTime = hours * 60 + minutes;
      const iqamahTime = prayerTime + prayer.offset;

      if (iqamahTime > currentMinutes) {
        const targetDate = new Date();
        targetDate.setHours(Math.floor(iqamahTime / 60), iqamahTime % 60, 0, 0);

        return {
          name: prayer.name,
          key: prayer.key,
          time: targetDate,
          adhan: to12Hour(prayer.time),
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
      name: customization.prayerNames.fajr || "Fajr",
      key: "fajr",
      time: targetDate,
      adhan: to12Hour(customization.prayerTimes.fajr),
      offset: customization.iqamahOffsets.fajr,
    };
  };

  const calculateIqamahTime = (adhanTime: string, offset: number) => {
    const [hours, minutes] = adhanTime.split(":").map(Number);

    const totalMinutes = hours * 60 + minutes + offset;
    const iqamahHours24 = Math.floor(totalMinutes / 60) % 24;
    const iqamahMinutes = totalMinutes % 60;

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
        name: customization.prayerNames.fajr || "Fajr",
        key: "fajr",
        time: customization.prayerTimes.fajr,
        offset: customization.iqamahOffsets.fajr,
      },
      {
        name: getPrayerDisplayName(
          customization.prayerNames.dhuhr || "Dhuhr",
          language
        ),
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

      const minutesUntilAdhan = adhanMinutes - currentMinutes;
      const minutesUntilIqamah = iqamahMinutes - currentMinutes;

      if (minutesUntilAdhan > 0 && minutesUntilAdhan <= 10) {
        const seconds = Math.floor(minutesUntilAdhan * 60);
        return {
          type: "adhan",
          seconds,
          prayerName: prayer.name,
          prayerKey: prayer.key,
          adhanTime: prayer.time,
          iqamahTime: calculateIqamahTime(prayer.time, prayer.offset),
        };
      }

      if (minutesUntilAdhan <= 0 && minutesUntilIqamah > 0) {
        const seconds = Math.floor(minutesUntilIqamah * 60);
        return {
          type: "iqamah",
          seconds,
          prayerName: prayer.name,
          prayerKey: prayer.key,
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

    return `${weekday} - ${day}${getSuffix(day)} ${month} ${year}`;
  };

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

  const nextPrayer = getNextPrayer();
  const nextPrayerKey = nextPrayer.key;
  const countdownState = getCountdownState();

  const prayers = [
    {
      name: customization.prayerNames.fajr || "Fajr",
      nameAr: "الفجر",
      adhan: to12Hour(customization.prayerTimes.fajr),
      offset: customization.iqamahOffsets.fajr,
      icon: "🌙",
    },
    {
      name: customization.prayerNames.sunrise || "Sunrise",
      nameAr: "الشروق",
      adhan: to12Hour(calculateSunriseTime()),
      offset: 0,
      icon: "🌅",
    },
    {
      name: getPrayerDisplayName(
        customization.prayerNames.dhuhr || "Dhuhr",
        language
      ),
      nameAr: "الظهر",
      adhan: to12Hour(customization.prayerTimes.dhuhr),
      offset: customization.iqamahOffsets.dhuhr,
      icon: "☀️",
    },
    {
      name: customization.prayerNames.asr || "Asr",
      nameAr: "العصر",
      adhan: to12Hour(customization.prayerTimes.asr),
      offset: customization.iqamahOffsets.asr,
      icon: "🌤️",
    },
    {
      name: customization.prayerNames.maghrib || "Maghrib",
      nameAr: "المغرب",
      adhan: to12Hour(customization.prayerTimes.maghrib),
      offset: customization.iqamahOffsets.maghrib,
      icon: "🌆",
    },
    {
      name: customization.prayerNames.isha || "Isha",
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

  // PRIORITY 1: Show Ishraq countdown if it's time
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

  // PRIORITY 2: Show Prayer Instructions (overwrites ads)
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
            style={{
              backgroundImage: `url(${currentAd.url})`,
            }}
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

  // NORMAL DISPLAY
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
                    {t.iqamah}
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
                      {t.adhan}
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
                      {t.iqamah}
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
                          ? "#10B981"
                          : countdownState.seconds > 60
                          ? "#F59E0B"
                          : countdownState.seconds > 30
                          ? "#F97316"
                          : countdownState.seconds > 10
                          ? "#EF4444"
                          : "#DC2626",
                      animation: "subtlePulse 2s ease-in-out infinite",
                    }}
                  >
                    {countdownState.prayerName.toUpperCase()}{" "}
                    {countdownState.type === "adhan" ? t.adhanIn : t.iqamahIn}
                  </h3>
                  <div
                    className="text-[15rem] font-black leading-none"
                    style={{
                      fontFamily: "'Oxanium', monospace",
                      fontWeight: 1000,
                      color:
                        countdownState.seconds > 300
                          ? "#10B981"
                          : countdownState.seconds > 60
                          ? "#F59E0B"
                          : countdownState.seconds > 30
                          ? "#F97316"
                          : countdownState.seconds > 10
                          ? "#EF4444"
                          : "#DC2626",
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
              const prayerKeyMap = {
                fajr: customization.prayerNames.fajr || "Fajr",
                sunrise: customization.prayerNames.sunrise || "Sunrise",
                dhuhr: getPrayerDisplayName(
                  customization.prayerNames.dhuhr || "Dhuhr",
                  language
                ),
                asr: customization.prayerNames.asr || "Asr",
                maghrib: customization.prayerNames.maghrib || "Maghrib",
                isha: customization.prayerNames.isha || "Isha",
              };

              const isNextPrayer = prayerKeyMap[nextPrayerKey] === prayer.name;

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

                  <div className="relative px-0 pt-1 pb-0 text-center">
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
