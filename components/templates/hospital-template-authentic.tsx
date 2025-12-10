"use client";

import React, { useState, useEffect, useRef } from "react";
import { Heart } from "lucide-react";
import { GalleryCarousel } from "./components/hospital/GalleryCarousel";
import { FullScreenAd } from "./components/hospital/FullScreenAd";
import { DoctorCarousel } from "./components/hospital/DoctorCarousel.tsx";

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
  caption: string;
  frequency: number;
  duration: number;
  dateRange: {
    start: string;
    end: string;
  };
  timeRange: {
    start: string;
    end: string;
  };
  daysOfWeek: number[];
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

const getNextRoundedInterval = (frequencySeconds: number): Date => {
  const now = new Date();
  const currentSeconds = now.getSeconds();
  const currentMinutes = now.getMinutes();
  const currentHours = now.getHours();
  const frequencyMinutes = frequencySeconds / 60;

  if (frequencyMinutes < 1) {
    const totalSeconds = currentMinutes * 60 + currentSeconds;
    const nextRoundedSeconds =
      Math.ceil(totalSeconds / frequencySeconds) * frequencySeconds;
    const nextMinutes = Math.floor(nextRoundedSeconds / 60) % 60;
    const nextSeconds = nextRoundedSeconds % 60;
    const extraHours = Math.floor(nextRoundedSeconds / 3600);

    const nextTime = new Date(now);
    nextTime.setHours(currentHours + extraHours);
    nextTime.setMinutes(nextMinutes);
    nextTime.setSeconds(nextSeconds);
    nextTime.setMilliseconds(0);

    if (nextTime <= now) {
      nextTime.setSeconds(nextTime.getSeconds() + frequencySeconds);
    }

    return nextTime;
  }

  const totalMinutes = currentHours * 60 + currentMinutes;
  const nextRoundedMinutes =
    Math.ceil(totalMinutes / frequencyMinutes) * frequencyMinutes;

  const nextHours = Math.floor(nextRoundedMinutes / 60) % 24;
  const nextMinutes = nextRoundedMinutes % 60;

  const nextTime = new Date(now);
  nextTime.setHours(nextHours);
  nextTime.setMinutes(nextMinutes);
  nextTime.setSeconds(0);
  nextTime.setMilliseconds(0);

  if (nextTime <= now) {
    nextTime.setMinutes(nextTime.getMinutes() + frequencyMinutes);
  }

  return nextTime;
};

const isAtRoundedInterval = (frequencySeconds: number): boolean => {
  const now = new Date();
  const currentSeconds = now.getSeconds();
  const currentMinutes = now.getMinutes();
  const currentHours = now.getHours();
  const frequencyMinutes = frequencySeconds / 60;

  if (frequencyMinutes < 1) {
    const totalSeconds = currentMinutes * 60 + currentSeconds;
    return totalSeconds % frequencySeconds === 0;
  }

  const totalMinutes = currentHours * 60 + currentMinutes;
  return totalMinutes % frequencyMinutes === 0 && currentSeconds === 0;
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
    doctors: customization.doctors || [
      {
        name: "Dr. Sarah Johnson",
        specialty: "Cardiology",
        qualifications: "MD, PhD",
        consultationDays: "Mon, Wed, Fri",
        consultationTime: "9:00 AM - 5:00 PM",
        experience: "15+ Years",
        image:
          "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop",
        available: "Mon-Fri, 9 AM - 5 PM",
      },
    ],
    galleryImages: customization.galleryImages || [
      "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=800&fit=crop",
    ],
    advertisements: customization.advertisements || [],
    layout: customization.layout || "Authentic",
    doctorRotationSpeed: customization.doctorRotationSpeed || 6000,
  };

  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [activeAd, setActiveAd] = useState<AdSchedule | null>(null);
  const [showAd, setShowAd] = useState(false);
  const adCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const adDurationRef = useRef<NodeJS.Timeout | null>(null);
  const lastTriggeredAdRef = useRef<Map<string, number>>(new Map());

  const bgImages =
    settings.enableSlideshow &&
    settings.backgroundImages &&
    settings.backgroundImages.length > 0
      ? settings.backgroundImages
      : [settings.backgroundImage];

  const isWithinSchedule = (schedule: AdSchedule): boolean => {
    if (!schedule.enabled) return false;

    const now = new Date();
    const scheduleStartDate = new Date(schedule.dateRange.start);
    const scheduleEndDate = new Date(schedule.dateRange.end);

    scheduleStartDate.setHours(0, 0, 0, 0);
    scheduleEndDate.setHours(23, 59, 59, 999);

    if (now < scheduleStartDate || now > scheduleEndDate) {
      return false;
    }

    const currentDay = now.getDay();
    if (!schedule.daysOfWeek.includes(currentDay)) {
      return false;
    }

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    const [startHour, startMinute] = schedule.timeRange.start
      .split(":")
      .map(Number);
    const [endHour, endMinute] = schedule.timeRange.end.split(":").map(Number);

    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = endHour * 60 + endMinute;

    return (
      currentTimeInMinutes >= startTimeInMinutes &&
      currentTimeInMinutes <= endTimeInMinutes
    );
  };

  const findActiveAdScheduleToShow = (): AdSchedule | null => {
    const now = Date.now();

    const eligibleAds = settings.advertisements.filter((schedule) => {
      if (!isWithinSchedule(schedule)) return false;
      if (!isAtRoundedInterval(schedule.frequency)) return false;

      const lastTriggered = lastTriggeredAdRef.current.get(schedule.id) || 0;
      if (now - lastTriggered < 2000) return false;

      return true;
    });

    if (eligibleAds.length === 0) return null;

    eligibleAds.sort((a, b) => a.frequency - b.frequency);
    return eligibleAds[0];
  };

  useEffect(() => {
    if (adCheckIntervalRef.current) {
      clearInterval(adCheckIntervalRef.current);
    }
    if (adDurationRef.current) {
      clearTimeout(adDurationRef.current);
    }

    const checkAndTriggerAds = () => {
      const scheduleToShow = findActiveAdScheduleToShow();

      if (scheduleToShow && !showAd) {
        console.log(
          `Triggering ad: ${
            scheduleToShow.title
          } at ${new Date().toLocaleTimeString()}`
        );

        lastTriggeredAdRef.current.set(scheduleToShow.id, Date.now());

        setActiveAd(scheduleToShow);
        setShowAd(true);

        adDurationRef.current = setTimeout(() => {
          console.log(`Ad duration finished: ${scheduleToShow.title}`);
          setShowAd(false);
          setActiveAd(null);
        }, scheduleToShow.duration * 1000);
      }
    };

    checkAndTriggerAds();
    adCheckIntervalRef.current = setInterval(checkAndTriggerAds, 1000);

    return () => {
      if (adCheckIntervalRef.current) clearInterval(adCheckIntervalRef.current);
      if (adDurationRef.current) clearTimeout(adDurationRef.current);
    };
  }, [settings.advertisements, showAd]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  const getNextAdTriggerTime = () => {
    if (!settings.advertisements || settings.advertisements.length === 0)
      return null;

    const eligibleAds = settings.advertisements.filter((schedule) =>
      isWithinSchedule(schedule)
    );

    if (eligibleAds.length === 0) return null;

    let nearestTime: Date | null = null;
    eligibleAds.forEach((schedule) => {
      const nextInterval = getNextRoundedInterval(schedule.frequency);
      if (!nearestTime || nextInterval < nearestTime) {
        nearestTime = nextInterval;
      }
    });

    return nearestTime;
  };

  const nextAdTime = getNextAdTriggerTime();

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
        ></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col">
        {settings.backgroundImage && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-800/60 to-slate-900/70"></div>
        )}
        {!settings.backgroundImage && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        )}

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
                  className="w-16 h-16 object-contain"
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})`,
                  }}
                >
                  <Heart className="w-8 h-8 text-white fill-white" />
                </div>
              )}
              <div>
                <h1 className="text-4xl font-bold text-white mb-1">
                  {settings.hospitalName}
                </h1>
                <p
                  className="text-base"
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
          {/* When ad is NOT showing: Show normal content */}
          {!showAd ? (
            <div className="flex gap-8 px-8 pb-8 pt-8 h-full overflow-hidden">
              {/* Left Side - Doctors Display using extracted component */}
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
                    isAdShowing={showAd}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {/* When ad IS showing: Show ad content */}
          {showAd && activeAd && (
            <div className="absolute inset-0 flex items-center justify-center p-8 z-40">
              <FullScreenAd
                title={activeAd.title}
                caption={activeAd.caption}
                imageUrl={activeAd.image}
                accentColor={settings.accentColor}
                primaryColor={settings.primaryColor}
                secondaryColor={settings.secondaryColor}
                duration={activeAd.duration * 1000}
                showTimer={true}
                showScheduleInfo={true}
                scheduleInfo={{
                  timeRange: activeAd.timeRange,
                  frequency: activeAd.frequency,
                  daysOfWeek: activeAd.daysOfWeek,
                }}
                onClose={() => {
                  console.log("Closing ad manually");
                  setShowAd(false);
                  setActiveAd(null);
                  if (adDurationRef.current)
                    clearTimeout(adDurationRef.current);
                }}
                onDurationEnd={() => {
                  console.log("Ad duration ended automatically");
                }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="bg-black/60 backdrop-blur-md border-t-2 px-8 py-3 relative z-30"
          style={{ borderColor: settings.primaryColor }}
        >
          <div className="flex items-center justify-between text-base">
            <div className="text-white font-semibold">
              {settings.tickerMessage}
            </div>
            <div className="font-bold" style={{ color: settings.accentColor }}>
              {settings.hospitalName} - {settings.tickerRightMessage}
            </div>
          </div>
        </div>
      </div>

      {/* Ad Status Indicator */}
      {settings.advertisements.length > 0 && !showAd && nextAdTime && (
        <div className="absolute bottom-20 right-8 z-40">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
              <span className="text-white/80 text-sm">
                Next ad at{" "}
                {nextAdTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HospitalTemplateAuthentic;
