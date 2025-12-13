// components/AdDisplayManager.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import FullScreenAd from "./FullScreenAd";

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

interface AdDisplayManagerProps {
  advertisements: AdSchedule[];
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  children: React.ReactNode;
}

interface AdQueueState {
  queue: AdSchedule[];
  currentAd: AdSchedule | null;
  isPlaying: boolean;
  currentIndex: number;
}

export default function AdDisplayManager({
  advertisements,
  primaryColor,
  secondaryColor,
  accentColor,
  children,
}: AdDisplayManagerProps) {
  const [adQueueState, setAdQueueState] = useState<AdQueueState>({
    queue: [],
    currentAd: null,
    isPlaying: false,
    currentIndex: 0,
  });

  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const scheduledAdsRef = useRef<Set<string>>(new Set());
  const lastCheckTimeRef = useRef<number>(0);
  const playNextTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    // Check frequency interval
    const totalSeconds =
      now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const isAtInterval = totalSeconds % ad.frequency === 0;

    if (!isAtInterval) return false;

    // Check if already scheduled in this frequency window
    const secondsSinceLastCheck =
      (now.getTime() - lastCheckTimeRef.current) / 1000;
    if (secondsSinceLastCheck < ad.frequency) {
      if (scheduledAdsRef.current.has(ad.id)) {
        return false;
      }
    } else {
      // New frequency window - clear scheduled ads
      scheduledAdsRef.current.clear();
    }

    return true;
  }, []);

  // Find all ads that should play now
  const findScheduledAds = useCallback(
    (now: Date): AdSchedule[] => {
      const matchingAds = advertisements.filter((ad) =>
        isAdScheduledNow(ad, now)
      );

      // Sort by priority (lower number = higher priority)
      return matchingAds.sort(
        (a, b) => (a.priority || 999) - (b.priority || 999)
      );
    },
    [advertisements, isAdScheduledNow]
  );

  // Play next ad in queue
  const playNext = useCallback(() => {
    // Clear any existing timeout
    if (playNextTimeoutRef.current) {
      clearTimeout(playNextTimeoutRef.current);
      playNextTimeoutRef.current = null;
    }

    setAdQueueState((prev) => {
      // Check if we're already at the end
      if (prev.currentIndex >= prev.queue.length) {
        console.log("✅ Ad queue completed, returning to normal display");
        return {
          queue: [],
          currentAd: null,
          isPlaying: false,
          currentIndex: 0,
        };
      }

      // Check if we're already playing an ad
      if (prev.isPlaying) {
        return prev;
      }

      const nextAd = prev.queue[prev.currentIndex];
      console.log(
        `▶️ Playing ad ${prev.currentIndex + 1}/${prev.queue.length}:`,
        {
          title: nextAd.title,
          type: nextAd.mediaType,
          duration:
            nextAd.mediaType === "image"
              ? `${nextAd.duration}s`
              : `${nextAd.playCount} plays`,
        }
      );

      return {
        ...prev,
        currentAd: nextAd,
        isPlaying: true,
      };
    });
  }, []);

  // Handle ad completion
  const handleAdComplete = useCallback(() => {
    console.log("✓ Ad completed");

    // Clear any pending playNext timeout
    if (playNextTimeoutRef.current) {
      clearTimeout(playNextTimeoutRef.current);
    }

    // Update state to mark current ad as completed
    setAdQueueState((prev) => ({
      ...prev,
      currentAd: null,
      isPlaying: false,
      currentIndex: prev.currentIndex + 1,
    }));

    // Schedule next ad to play after a short delay
    playNextTimeoutRef.current = setTimeout(() => {
      playNext();
    }, 500); // Increased delay to ensure state is updated
  }, [playNext]);

  // Check schedule periodically
  const checkSchedule = useCallback(() => {
    // Don't check if currently playing
    if (adQueueState.isPlaying) {
      return;
    }

    const now = new Date();
    const matchingAds = findScheduledAds(now);

    if (matchingAds.length > 0) {
      console.log(
        `🎬 Found ${matchingAds.length} scheduled ad(s):`,
        matchingAds.map((ad) => ({ title: ad.title, priority: ad.priority }))
      );

      // Mark these ads as scheduled for this frequency window
      matchingAds.forEach((ad) => scheduledAdsRef.current.add(ad.id));

      // Start the queue
      setAdQueueState({
        queue: matchingAds,
        currentAd: null,
        isPlaying: false,
        currentIndex: 0,
      });

      // Update last check time
      lastCheckTimeRef.current = now.getTime();

      // Start playing first ad after a short delay
      playNextTimeoutRef.current = setTimeout(() => {
        playNext();
      }, 300);
    }
  }, [adQueueState.isPlaying, findScheduledAds, playNext]);

  // Remove the problematic useEffect that auto-plays when index changes
  // This was causing the skipping issue

  // Set up periodic schedule checking
  useEffect(() => {
    console.log("🔄 Starting ad schedule checker");

    // Initial check
    const initialTimer = setTimeout(() => {
      checkSchedule();
    }, 100);

    // Check every second for precise timing
    checkIntervalRef.current = setInterval(() => {
      checkSchedule();
    }, 1000);

    return () => {
      console.log("🛑 Stopping ad schedule checker");
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      if (initialTimer) {
        clearTimeout(initialTimer);
      }
      if (playNextTimeoutRef.current) {
        clearTimeout(playNextTimeoutRef.current);
      }
    };
  }, [checkSchedule]);

  // Debug logs to track queue state
  useEffect(() => {
    console.log("📊 Queue State Update:", {
      queueLength: adQueueState.queue.length,
      currentIndex: adQueueState.currentIndex,
      isPlaying: adQueueState.isPlaying,
      currentAd: adQueueState.currentAd?.title || "None",
    });
  }, [adQueueState]);

  const showAd = adQueueState.isPlaying && adQueueState.currentAd;

  return (
    <div className="relative w-full h-full">
      {/* Normal Display Content */}
      <div
        className={`w-full h-full transition-opacity duration-300 ${
          showAd ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        {children}
      </div>

      {/* Ad Display Overlay */}
      {showAd && adQueueState.currentAd && (
        <div className="absolute inset-0 flex items-center justify-center z-40">
          <FullScreenAd
            title={adQueueState.currentAd.title}
            caption={adQueueState.currentAd.caption}
            imageUrl={adQueueState.currentAd.image}
            videoUrl={adQueueState.currentAd.video}
            mediaType={adQueueState.currentAd.mediaType}
            playCount={adQueueState.currentAd.playCount}
            animation={adQueueState.currentAd.animation || "fade"}
            accentColor={accentColor}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
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
                            idx < adQueueState.currentIndex + 1
                              ? "bg-white"
                              : idx === adQueueState.currentIndex
                              ? "bg-white/80 scale-125"
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
    </div>
  );
}
