"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ShoppingBag } from "lucide-react";
import GalleryCarousel from "./components/restaurant/GalleryCarousel";
import FullScreenAd from "./components/restaurant/FullScreenAd";
import { MenuCarousel } from "./components/restaurant/MenuCarousel";

// Main Retail Shop Template Component
interface ProductItem {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  image: string;
  available: boolean;
  isSpecial?: boolean;
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

interface RetailShopCustomization {
  shopName: string;
  tagline: string;
  shopLogo: string;
  backgroundImage: string;
  backgroundImages: string[];
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  tickerMessage: string;
  tickerRightMessage: string;
  enableSlideshow: boolean;
  slideshowSpeed: number;
  productItems: ProductItem[];
  galleryImages: string[];
  advertisements: AdSchedule[];
  layout: "Authentic" | "Advanced";
  slideSpeed: number;
  productRotationSpeed: number;
  carouselTitle: string;
}

interface RetailTemplateProps {
  customization?: Partial<RetailShopCustomization>;
  backgroundStyle?: React.CSSProperties;
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
    for (let i = 0; i < 60; i++) {
      schedule.push(i.toString().padStart(2, "0"));
    }
  } else if (frequencyInMinutes === 5) {
    for (let i = 0; i < 60; i += 5) {
      schedule.push(i.toString().padStart(2, "0"));
    }
  } else if (frequencyInMinutes === 10) {
    for (let i = 0; i < 60; i += 10) {
      schedule.push(i.toString().padStart(2, "0"));
    }
  } else if (frequencyInMinutes === 15) {
    for (let i = 0; i < 60; i += 15) {
      schedule.push(i.toString().padStart(2, "0"));
    }
  } else if (frequencyInMinutes === 20) {
    for (let i = 0; i < 60; i += 20) {
      schedule.push(i.toString().padStart(2, "0"));
    }
  } else if (frequencyInMinutes === 30) {
    for (let i = 0; i < 60; i += 30) {
      schedule.push(i.toString().padStart(2, "0"));
    }
  } else if (frequencyInMinutes > 0) {
    for (let i = 0; i < 60; i += frequencyInMinutes) {
      schedule.push(i.toString().padStart(2, "0"));
    }
  }

  return schedule;
};

export default function RetailTemplate({
  customization = {},
  backgroundStyle = {},
}: RetailTemplateProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
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
  const lastCompletionRef = useRef<number>(0);

  const settings = {
    shopName: customization.shopName || "Premium Retail",
    tagline: customization.tagline || "Quality Products, Exceptional Value",
    shopLogo: customization.shopLogo || "",
    backgroundImage: customization.backgroundImage || "",
    primaryColor: customization.primaryColor || "#3b82f6",
    secondaryColor: customization.secondaryColor || "#8b5cf6",
    accentColor: customization.accentColor || "#10b981",
    tickerMessage:
      customization.tickerMessage ||
      "🛍️ New Arrivals Daily • Best Prices Guaranteed • Quality You Can Trust",
    tickerRightMessage:
      customization.tickerRightMessage || "Shop with Confidence",
    enableSlideshow: customization.enableSlideshow || false,
    slideshowSpeed: customization.slideshowSpeed || 10000,
    layout: customization.layout || "Authentic",
    slideSpeed: customization.slideSpeed || 20,
    productRotationSpeed: customization.productRotationSpeed || 6000,
  };

  const productItems = customization.productItems || [];
  const galleryImages = customization.galleryImages || [];
  const backgroundImages = customization.backgroundImages || [];
  const advertisements = customization.advertisements || [];
  const carouselTitle = customization.carouselTitle || "Featured Products";

  // Time update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Background slideshow
  useEffect(() => {
    if (!settings.enableSlideshow || backgroundImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBackgroundIndex((prev) => (prev + 1) % backgroundImages.length);
    }, settings.slideshowSpeed);
    return () => clearInterval(interval);
  }, [
    settings.enableSlideshow,
    backgroundImages.length,
    settings.slideshowSpeed,
  ]);

  // Check if ad should play now based on schedule
  const isAdScheduledNow = useCallback((ad: AdSchedule, now: Date): boolean => {
    if (!ad.enabled) return false;

    const startDate = new Date(ad.dateRange.start);
    const endDate = new Date(ad.dateRange.end);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    if (now < startDate || now > endDate) {
      return false;
    }

    const currentDay = now.getDay();
    if (!ad.daysOfWeek.includes(currentDay)) {
      return false;
    }

    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [startHour, startMin] = ad.timeRange.start.split(":").map(Number);
    const [endHour, endMin] = ad.timeRange.end.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (currentTime < startMinutes || currentTime > endMinutes) {
      return false;
    }

    const currentMinute = now.getMinutes().toString().padStart(2, "0");
    const schedule = generateScheduleFromFrequency(ad.frequency);

    return schedule.includes(currentMinute);
  }, []);

  // Find all ads that should play now
  const findScheduledAds = useCallback(
    (now: Date): AdSchedule[] => {
      const matchingAds = advertisements.filter((ad) =>
        isAdScheduledNow(ad, now)
      );

      return matchingAds.sort(
        (a, b) => (a.priority || 999) - (b.priority || 999)
      );
    },
    [advertisements, isAdScheduledNow]
  );

  // Handle ad completion
  const handleAdComplete = useCallback(() => {
    console.log("✓ Ad completed, transitioning to next");

    if (adSafetyTimeoutRef.current) {
      clearTimeout(adSafetyTimeoutRef.current);
      adSafetyTimeoutRef.current = null;
    }

    const now = Date.now();
    if (now - lastCompletionRef.current < 500) {
      console.log("⚠️ Skipping duplicate completion call");
      return;
    }
    lastCompletionRef.current = now;

    setAdQueueState((prev) => {
      const nextIndex = prev.currentIndex + 1;

      console.log(
        `📊 Queue status: current=${prev.currentIndex}, next=${nextIndex}, total=${prev.queue.length}`
      );

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

    setTimeout(() => {
      setAdQueueState((prev) => {
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
    }, 1000);
  }, []);

  // Check schedule periodically
  const checkSchedule = useCallback(() => {
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

    if (currentSecond > 2) {
      return;
    }

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

      lastShownMinuteRef.current = currentMinute;

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

    checkSchedule();

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

  let dynamicBackgroundStyle = backgroundStyle;
  if (settings.enableSlideshow && backgroundImages.length > 0) {
    dynamicBackgroundStyle = {
      ...backgroundStyle,
      backgroundImage: `url(${backgroundImages[currentBackgroundIndex]})`,
    };
  } else if (settings.backgroundImage) {
    dynamicBackgroundStyle = {
      ...backgroundStyle,
      backgroundImage: `url(${settings.backgroundImage})`,
    };
  }

  const showAd = adQueueState.isPlaying && adQueueState.currentAd;

  return (
    <div
      className="fixed inset-0 w-full h-full overflow-hidden"
      style={dynamicBackgroundStyle}
    >
      {/* Background */}
      <div className="absolute inset-0">
        {(settings.backgroundImage ||
          (settings.enableSlideshow && backgroundImages.length > 0)) && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80"></div>
        )}
        {!settings.backgroundImage &&
          (!settings.enableSlideshow || backgroundImages.length === 0) && (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
          )}
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <header
          className="bg-black/60 backdrop-blur-md border-b-2 px-8 py-5 relative z-30"
          style={{ borderColor: settings.primaryColor }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {settings.shopLogo ? (
                <img
                  src={settings.shopLogo}
                  alt="Shop Logo"
                  className="w-16 h-16 object-contain"
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})`,
                  }}
                >
                  <ShoppingBag className="w-8 h-8 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-4xl font-bold text-white mb-1">
                  {settings.shopName}
                </h1>
                <p
                  className="text-xl font-bold"
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
              <div className="text-base text-gray-300">
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
              {/* Left Side - Product Carousel */}
              <MenuCarousel
                menuItems={productItems}
                layout={settings.layout}
                slideSpeed={settings.slideSpeed}
                menuRotationSpeed={settings.productRotationSpeed}
                primaryColor={settings.primaryColor}
                secondaryColor={settings.secondaryColor}
                accentColor={settings.accentColor}
                carouselTitle={carouselTitle}
              />

              {/* Right Side - Gallery Carousel */}
              <div className="flex flex-col justify-center">
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/20 shadow-2xl h-full flex flex-col relative">
                  <GalleryCarousel
                    images={galleryImages}
                    transitionSpeed={5000}
                    accentColor={settings.primaryColor}
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
                key={`${adQueueState.currentAd.id}_${adQueueState.currentIndex}`}
                adId={adQueueState.currentAd.id}
                instanceId={`${adQueueState.currentAd.id}_${adQueueState.currentIndex}`}
                title={adQueueState.currentAd.title}
                caption={adQueueState.currentAd.caption}
                imageUrl={
                  adQueueState.currentAd.mediaType === "image"
                    ? adQueueState.currentAd.image
                    : undefined
                }
                videoUrl={
                  adQueueState.currentAd.mediaType === "video"
                    ? adQueueState.currentAd.video
                    : undefined
                }
                mediaType={adQueueState.currentAd.mediaType}
                playCount={adQueueState.currentAd.playCount || 1}
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
            <div className="absolute inset-0 flex items-center justify-center z-40 bg-transparent"></div>
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
              {settings.shopName} - {settings.tickerRightMessage}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
