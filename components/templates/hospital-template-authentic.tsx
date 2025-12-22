"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Heart } from "lucide-react";
import { GalleryCarousel } from "./components/hospital/GalleryCarousel";
import FullScreenAd from "./components/hospital/FullScreenAd";
import { DoctorCarousel } from "./components/hospital/DoctorCarousel.tsx";
import Image from "next/image";

interface Doctor {
  id?: string;
  name: string;
  specialty: string;
  qualifications?: string;
  consultationDays?: string;
  consultationTime?: string;
  experience?: string;
  image: string;
  available?: string;
}

interface AdSchedule {
  id: string;
  enabled: boolean;
  title: string;
  image: string;
  video: string;
  mediaType: "image" | "video";
  caption: string;
  frequency: number;
  duration: number;
  playCount: number;
  dateRange: {
    start: string;
    end: string;
  };
  timeRange: {
    start: string;
    end: string;
  };
  daysOfWeek: number[];
  animation?: string;
  priority?: number;
}

interface HospitalCustomization {
  hospitalName: string;
  tagline: string;
  hospitalLogo: string;
  backgroundImage: string;
  backgroundImages: string[];
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  tickerMessage: string;
  tickerRightMessage: string;
  slideSpeed: number;
  slideshowSpeed: number;
  enableSlideshow: boolean;
  galleryTransitionSpeed: number;
  doctors: Doctor[];
  galleryImages: string[];
  advertisements: AdSchedule[];
  layout: "Authentic" | "Advanced";
  doctorRotationSpeed: number;
}

interface AdQueueState {
  queue: AdSchedule[];
  currentAd: AdSchedule | null;
  isPlaying: boolean;
  currentIndex: number;
  isTransitioning: boolean;
}

// Helper function to generate schedule based on frequency (in seconds)
const generateScheduleFromFrequency = (frequency: number): string[] => {
  const schedule: string[] = [];
  const frequencyInMinutes = Math.floor(frequency / 60);

  if (frequencyInMinutes === 1) {
    // Every 1 minute: 00, 01, 02, ..., 59
    for (let i = 0; i < 60; i++) {
      schedule.push(i.toString().padStart(2, "0"));
    }
  } else if (frequencyInMinutes === 5) {
    // Every 5 minutes: 00, 05, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55
    for (let i = 0; i < 60; i += 5) {
      schedule.push(i.toString().padStart(2, "0"));
    }
  } else if (frequencyInMinutes === 10) {
    // Every 10 minutes: 00, 10, 20, 30, 40, 50
    for (let i = 0; i < 60; i += 10) {
      schedule.push(i.toString().padStart(2, "0"));
    }
  } else if (frequencyInMinutes === 15) {
    // Every 15 minutes: 00, 15, 30, 45
    for (let i = 0; i < 60; i += 15) {
      schedule.push(i.toString().padStart(2, "0"));
    }
  } else if (frequencyInMinutes === 20) {
    // Every 20 minutes: 00, 20, 40
    for (let i = 0; i < 60; i += 20) {
      schedule.push(i.toString().padStart(2, "0"));
    }
  } else if (frequencyInMinutes === 30) {
    // Every 30 minutes: 00, 30
    for (let i = 0; i < 60; i += 30) {
      schedule.push(i.toString().padStart(2, "0"));
    }
  } else if (frequencyInMinutes > 0) {
    // Custom interval
    for (let i = 0; i < 60; i += frequencyInMinutes) {
      schedule.push(i.toString().padStart(2, "0"));
    }
  }

  return schedule;
};

function HospitalTemplateAuthentic({
  customization = {},
  backgroundStyle = {},
}: any) {
  const settings: HospitalCustomization = {
    hospitalName: customization.hospitalName || "OLIVIA Hospital",
    tagline: customization.tagline || "Compassionate Care, Advanced Medicine",
    hospitalLogo: customization.hospitalLogo || "",
    backgroundImage:
      customization.backgroundImage ||
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920&h=1080&fit=crop",
    backgroundImages: customization.backgroundImages || [],
    primaryColor: customization.primaryColor || "#06b6d4",
    secondaryColor: customization.secondaryColor || "#14b8a6",
    accentColor: customization.accentColor || "#f59e0b",
    slideSpeed: customization.slideSpeed || 20,
    slideshowSpeed: customization.slideshowSpeed || 10000,
    enableSlideshow: customization.enableSlideshow || false,
    galleryTransitionSpeed: customization.galleryTransitionSpeed || 6000,
    tickerMessage:
      customization.tickerMessage ||
      "Welcome to OLIVIA Hospital - Compassionate Care, Advanced Medicine",
    tickerRightMessage:
      customization.tickerRightMessage || "Contact Us: (123) 456-7890",
    doctors: customization.doctors || [],
    galleryImages: customization.galleryImages || [],
    advertisements: customization.advertisements || [],
    layout: customization.layout || "Authentic",
    doctorRotationSpeed: customization.doctorRotationSpeed || 6000,
  };

  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [adQueueState, setAdQueueState] = useState<AdQueueState>({
    queue: [],
    currentAd: null,
    isPlaying: false,
    currentIndex: 0,
    isTransitioning: false,
  });

  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastShownMinuteRef = useRef<string>("");
  const adSafetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const bgImages =
    settings.enableSlideshow &&
    settings.backgroundImages &&
    settings.backgroundImages.length > 0
      ? settings.backgroundImages
      : [settings.backgroundImage];

  // Check if ad should play now based on schedule
  const isAdScheduledNow = useCallback((ad: AdSchedule, now: Date): boolean => {
    if (!ad.enabled) return false;

    // Check date range
    const startDate = new Date(ad.dateRange.start);
    const endDate = new Date(ad.dateRange.end);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    if (now < startDate || now > endDate) {
      return false;
    }

    // Check day of week
    const currentDay = now.getDay();
    if (!ad.daysOfWeek.includes(currentDay)) {
      return false;
    }

    // Check time range
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [startHour, startMin] = ad.timeRange.start.split(":").map(Number);
    const [endHour, endMin] = ad.timeRange.end.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (currentTime < startMinutes || currentTime > endMinutes) {
      return false;
    }

    // Check if current minute matches the frequency schedule
    const currentMinute = now.getMinutes().toString().padStart(2, "0");
    const schedule = generateScheduleFromFrequency(ad.frequency);

    return schedule.includes(currentMinute);
  }, []);

  // Find all ads that should play now
  const findScheduledAds = useCallback(
    (now: Date): AdSchedule[] => {
      const matchingAds = settings.advertisements.filter((ad) =>
        isAdScheduledNow(ad, now)
      );

      // Sort by priority (lower number = higher priority)
      return matchingAds.sort(
        (a, b) => (a.priority || 999) - (b.priority || 999)
      );
    },
    [settings.advertisements, isAdScheduledNow]
  );

  // Handle ad completion
  const handleAdComplete = useCallback(() => {
    console.log("✓ Ad completed, transitioning to next");

    // Clear any safety timeout
    if (adSafetyTimeoutRef.current) {
      clearTimeout(adSafetyTimeoutRef.current);
      adSafetyTimeoutRef.current = null;
    }

    // Move to next ad in queue
    setAdQueueState((prev) => {
      const nextIndex = prev.currentIndex + 1;

      console.log(
        `📊 Queue status: current=${prev.currentIndex}, next=${nextIndex}, total=${prev.queue.length}`
      );

      // Check if queue is finished
      if (nextIndex >= prev.queue.length) {
        console.log("✅ All ads completed, returning to normal display");
        return {
          queue: [],
          currentAd: null,
          isPlaying: false,
          currentIndex: 0,
          isTransitioning: false,
        };
      }

      // Move to transitioning state with next index
      console.log(
        `⏳ Transitioning to ad ${nextIndex + 1}/${prev.queue.length}`
      );
      return {
        ...prev,
        currentAd: null,
        isPlaying: false,
        currentIndex: nextIndex,
        isTransitioning: true,
      };
    });

    // After transition delay, play the next ad
    setTimeout(() => {
      setAdQueueState((prev) => {
        // Safety check - make sure we still have ads
        if (prev.currentIndex >= prev.queue.length) {
          console.log("⚠️ No more ads in queue");
          return {
            ...prev,
            isTransitioning: false,
          };
        }

        const nextAd = prev.queue[prev.currentIndex];
        console.log(
          `🎬 NOW PLAYING: Ad ${prev.currentIndex + 1}/${prev.queue.length} - ${
            nextAd.title
          } (${nextAd.mediaType})`
        );

        // Set safety timeout
        const maxAdDuration =
          nextAd.mediaType === "image"
            ? nextAd.duration * 1000 + 10000
            : 360000;

        adSafetyTimeoutRef.current = setTimeout(() => {
          console.error("⏱️ AD SAFETY TIMEOUT - Ad stuck, forcing skip");
          handleAdComplete();
        }, maxAdDuration);

        return {
          ...prev,
          currentAd: nextAd,
          isPlaying: true,
          isTransitioning: false,
        };
      });
    }, 10000);
  }, []);

  // Check schedule periodically
  const checkSchedule = useCallback(() => {
    // Don't check if currently playing, transitioning, OR if there's already a queue
    if (
      adQueueState.isPlaying ||
      adQueueState.isTransitioning ||
      adQueueState.queue.length > 0
    ) {
      return;
    }

    const now = new Date();
    const currentMinute = now.getMinutes().toString().padStart(2, "0");
    const currentSecond = now.getSeconds();

    // ONLY trigger at exactly :00 seconds (with 2 second tolerance)
    if (currentSecond > 2) {
      return;
    }

    // Prevent triggering multiple times in the same minute
    if (lastShownMinuteRef.current === currentMinute) {
      return;
    }

    console.log(
      `🕐 Checking ads at ${now.getHours()}:${currentMinute}:${currentSecond
        .toString()
        .padStart(2, "0")}`
    );

    const matchingAds = findScheduledAds(now);

    if (matchingAds.length > 0) {
      console.log(
        `🎬 Found ${matchingAds.length} scheduled ad(s) for minute ${currentMinute}:`,
        matchingAds.map(
          (ad, idx) => `${idx + 1}. ${ad.title} (${ad.mediaType})`
        )
      );

      // Mark this minute as processed
      lastShownMinuteRef.current = currentMinute;

      // Start the queue with first ad
      const firstAd = matchingAds[0];
      console.log(
        `▶️ Starting queue with: ${firstAd.title} (${firstAd.mediaType})`
      );

      setAdQueueState({
        queue: matchingAds,
        currentAd: firstAd,
        isPlaying: true,
        currentIndex: 0,
        isTransitioning: false,
      });
    } else {
      console.log(`✗ No ads scheduled for minute ${currentMinute}`);
    }
  }, [
    adQueueState.isPlaying,
    adQueueState.isTransitioning,
    adQueueState.queue.length,
    findScheduledAds,
  ]);

  // Set up periodic schedule checking
  useEffect(() => {
    console.log("🔄 Starting ad schedule checker");

    // Initial check
    checkSchedule();

    // Check every second for precise timing
    checkIntervalRef.current = setInterval(() => {
      checkSchedule();
    }, 1000);

    return () => {
      console.log("🛑 Stopping ad schedule checker");
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      if (adSafetyTimeoutRef.current) {
        clearTimeout(adSafetyTimeoutRef.current);
      }
    };
  }, [checkSchedule]);

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Background slideshow
  useEffect(() => {
    if (!settings.enableSlideshow || bgImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % bgImages.length);
    }, settings.slideshowSpeed);

    return () => clearInterval(interval);
  }, [settings.enableSlideshow, bgImages.length, settings.slideshowSpeed]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const showAd = adQueueState.isPlaying && adQueueState.currentAd;

  return (
    <div
      className="fixed inset-0 w-full h-full overflow-hidden"
      style={{ backgroundColor: settings.primaryColor }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        {bgImages.map((img, index) => (
          <div
            key={index}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
            style={{
              backgroundImage: `url(${img})`,
              opacity: index === currentBgIndex ? 1 : 0,
              zIndex: index === currentBgIndex ? 1 : 0,
            }}
          />
        ))}
        <div
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          style={{ zIndex: 2 }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-800/60 to-slate-900/70" />

        {/* Header */}
        <header
          className="bg-black/60 backdrop-blur-md border-b-2 px-8 py-5 relative z-30"
          style={{ borderColor: settings.primaryColor }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {settings.hospitalLogo ? (
                <img
                  src={settings.hospitalLogo}
                  alt="Hospital Logo"
                  className="w-20 h-20 object-contain"
                />
              ) : (
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})`,
                  }}
                >
                  <Heart className="w-8 h-8 text-white fill-white" />
                </div>
              )}
              <div>
                <h1 className="text-5xl font-bold text-white mb-1">
                  {settings.hospitalName}
                </h1>
                <p
                  className="text-2xl font-semibold"
                  style={{ color: settings.accentColor }}
                >
                  {settings.tagline}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div
                className="text-5xl font-bold mb-1"
                style={{ color: settings.primaryColor }}
              >
                {formatTime(currentTime)}
              </div>
              <div className="text-3xl text-gray-300">
                {formatDate(currentTime)}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 relative overflow-hidden">
          {/* Normal Display Content */}
          <div
            className={`transition-opacity duration-500 h-full ${
              showAd ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <div className="flex gap-8 px-8 pb-8 pt-8 h-full overflow-hidden">
              {/* Left Side - Doctors Display */}
              <DoctorCarousel
                doctors={settings.doctors}
                layout={settings.layout}
                slideSpeed={settings.slideSpeed}
                doctorRotationSpeed={settings.doctorRotationSpeed}
                primaryColor={settings.primaryColor}
                secondaryColor={settings.secondaryColor}
                accentColor={settings.accentColor}
              />

              {/* Right Side - Gallery Carousel */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div
                  className="relative h-full rounded-3xl overflow-hidden shadow-2xl border-2"
                  style={{
                    borderColor: `${settings.accentColor}40`,
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                  }}
                >
                  <GalleryCarousel
                    images={settings.galleryImages}
                    transitionSpeed={settings.galleryTransitionSpeed}
                    accentColor={settings.accentColor}
                    isAdShowing={!!showAd}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Ad Display Overlay */}
          {showAd && adQueueState.currentAd && (
            <div className="absolute inset-0 flex items-center justify-center z-40">
              <FullScreenAd
                adId={adQueueState.currentAd.id} // ← ADD THIS LINE
                title={adQueueState.currentAd.title}
                caption={adQueueState.currentAd.caption}
                imageUrl={adQueueState.currentAd.image}
                videoUrl={adQueueState.currentAd.video}
                mediaType={adQueueState.currentAd.mediaType}
                playCount={adQueueState.currentAd.playCount}
                animation={adQueueState.currentAd.animation || "fade"}
                accentColor={settings.accentColor}
                primaryColor={settings.primaryColor}
                secondaryColor={settings.secondaryColor}
                duration={adQueueState.currentAd.duration * 1000}
                showTimer={adQueueState.currentAd.mediaType === "image"}
                showScheduleInfo={false}
                onDurationEnd={handleAdComplete}
              />

              {/* Queue Progress Indicator */}
              {adQueueState.queue.length > 1 && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
                  <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-medium">
                        Ad {adQueueState.currentIndex + 1} of{" "}
                        {adQueueState.queue.length}
                      </span>
                      <div className="flex gap-1">
                        {Array.from({ length: adQueueState.queue.length }).map(
                          (_, idx) => (
                            <div
                              key={idx}
                              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                idx < adQueueState.currentIndex
                                  ? "bg-green-400"
                                  : idx === adQueueState.currentIndex
                                  ? "bg-white scale-125"
                                  : "bg-white/30"
                              }`}
                            />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Transition Indicator */}
          {adQueueState.isTransitioning && (
            <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/50">
              <div className="text-white text-xl font-medium">
                Loading next content...
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="bg-black/60 backdrop-blur-md border-t-2 px-8 py-1 relative z-30"
          style={{ borderColor: settings.primaryColor }}
        >
          <div className="flex items-center justify-between text-2xl">
            <div className="text-white font-semibold">
              {settings.tickerMessage}
            </div>
            <div className="font-bold" style={{ color: settings.accentColor }}>
              {settings.hospitalName} - {settings.tickerRightMessage}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HospitalTemplateAuthentic;
