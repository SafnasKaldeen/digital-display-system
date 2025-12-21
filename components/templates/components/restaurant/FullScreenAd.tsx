import React, { useEffect, useState, useRef, useCallback } from "react";
import { X, Play, Loader2, Download } from "lucide-react";

// Video Cache Manager (inline for convenience - can be separate file)
const DB_NAME = "VideoCache";
const STORE_NAME = "videos";
const DB_VERSION = 1;

interface CachedVideo {
  id: string;
  blob: Blob;
  url: string;
  size: number;
  cachedAt: number;
}

interface DownloadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

class VideoCacheManager {
  private db: IDBDatabase | null = null;

  async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          store.createIndex("cachedAt", "cachedAt", { unique: false });
        }
      };
    });
  }

  async downloadVideo(
    url: string,
    id: string,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<Blob> {
    console.log(`📥 Downloading video: ${id}`);

    const response = await fetch(url, {
      headers: {
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.statusText}`);
    }

    const contentLength = response.headers.get("content-length");
    const total = contentLength ? parseInt(contentLength, 10) : 0;

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const chunks: Uint8Array[] = [];
    let loaded = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      loaded += value.length;

      if (onProgress && total > 0) {
        onProgress({
          loaded,
          total,
          percentage: Math.round((loaded / total) * 100),
        });
      }
    }

    console.log(`✓ Download complete: ${id} (${loaded} bytes)`);
    return new Blob(chunks, { type: "video/mp4" });
  }

  async saveVideo(id: string, blob: Blob, url: string): Promise<void> {
    const db = await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      const video: CachedVideo = {
        id,
        blob,
        url,
        size: blob.size,
        cachedAt: Date.now(),
      };

      const request = store.put(video);

      request.onsuccess = () => {
        console.log(`💾 Saved to cache: ${id}`);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getVideo(id: string): Promise<CachedVideo | null> {
    const db = await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result as CachedVideo | undefined;
        resolve(result || null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async isCached(id: string): Promise<boolean> {
    const video = await this.getVideo(id);
    return video !== null;
  }

  async getBlobUrl(id: string): Promise<string | null> {
    const video = await this.getVideo(id);
    if (!video) return null;

    return URL.createObjectURL(video.blob);
  }

  async ensureCached(
    url: string,
    id: string,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<string> {
    const cached = await this.getVideo(id);
    if (cached) {
      console.log(`✓ Video already cached: ${id}`);
      return URL.createObjectURL(cached.blob);
    }

    const blob = await this.downloadVideo(url, id, onProgress);
    await this.saveVideo(id, blob, url);

    return URL.createObjectURL(blob);
  }
}

const videoCacheManager = new VideoCacheManager();

// FullScreenAd Component
interface FullScreenAdProps {
  title?: string;
  caption: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaType: "image" | "video";
  playCount?: number;
  animation?: string;
  accentColor: string;
  primaryColor: string;
  secondaryColor: string;
  duration: number;
  showTimer?: boolean;
  showScheduleInfo?: boolean;
  scheduleInfo?: {
    timeRange: { start: string; end: string };
    frequency: number;
    daysOfWeek: number[];
  };
  onClose?: () => void;
  onDurationEnd?: () => void;
}

const getAnimationClass = (animation: string) => {
  const animations: { [key: string]: string } = {
    fade: "animate-fadeIn",
    "slide-left": "animate-slideInLeft",
    "slide-right": "animate-slideInRight",
    "slide-up": "animate-slideInUp",
    "slide-down": "animate-slideInDown",
    zoom: "animate-zoomIn",
    "zoom-out": "animate-zoomOut",
    flip: "animate-flip",
    bounce: "animate-bounceIn",
    rotate: "animate-rotateIn",
  };
  return animations[animation] || "animate-fadeIn";
};

export default function FullScreenAd({
  title,
  caption,
  imageUrl,
  videoUrl,
  mediaType = "image",
  playCount = 1,
  animation = "fade",
  accentColor,
  primaryColor,
  secondaryColor,
  duration,
  showTimer = false,
  showScheduleInfo = false,
  scheduleInfo,
  onClose,
  onDurationEnd,
}: FullScreenAdProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [currentPlayCount, setCurrentPlayCount] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);

  // Video caching states
  const [isCaching, setIsCaching] = useState(false);
  const [cacheProgress, setCacheProgress] = useState<DownloadProgress | null>(
    null
  );
  const [cachedVideoUrl, setCachedVideoUrl] = useState<string | null>(null);
  const [cacheError, setCacheError] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const animationClass = getAnimationClass(animation);

  const onDurationEndRef = useRef(onDurationEnd);
  const hasCalledEndRef = useRef(false);

  useEffect(() => {
    onDurationEndRef.current = onDurationEnd;
  }, [onDurationEnd]);

  const callOnDurationEnd = useCallback(() => {
    if (!hasCalledEndRef.current && onDurationEndRef.current) {
      hasCalledEndRef.current = true;
      console.log("📢 Scheduling onDurationEnd callback");
      setTimeout(() => {
        console.log("✓ Executing onDurationEnd");
        onDurationEndRef.current?.();
      }, 0);
    }
  }, []);

  // Generate stable video ID from URL
  const getVideoId = (url: string) => {
    return btoa(url)
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, 50);
  };

  // Cache video before playing
  useEffect(() => {
    if (mediaType !== "video" || !videoUrl) return;

    let isMounted = true;
    const videoId = getVideoId(videoUrl);

    const cacheVideo = async () => {
      try {
        console.log("🎬 Checking video cache...");
        setIsCaching(true);
        setCacheError(false);

        const isCached = await videoCacheManager.isCached(videoId);

        if (isCached) {
          console.log("✓ Video found in cache");
          const blobUrl = await videoCacheManager.getBlobUrl(videoId);
          if (isMounted && blobUrl) {
            setCachedVideoUrl(blobUrl);
            setIsCaching(false);
          }
        } else {
          console.log("📥 Downloading video to cache...");
          const blobUrl = await videoCacheManager.ensureCached(
            videoUrl,
            videoId,
            (progress) => {
              if (isMounted) {
                setCacheProgress(progress);
              }
            }
          );

          if (isMounted) {
            setCachedVideoUrl(blobUrl);
            setIsCaching(false);
            setCacheProgress(null);
          }
        }
      } catch (error) {
        console.error("❌ Error caching video:", error);
        if (isMounted) {
          setCacheError(true);
          setIsCaching(false);
          setCachedVideoUrl(videoUrl);
        }
      }
    };

    cacheVideo();

    return () => {
      isMounted = false;
      if (cachedVideoUrl && cachedVideoUrl.startsWith("blob:")) {
        URL.revokeObjectURL(cachedVideoUrl);
      }
    };
  }, [mediaType, videoUrl]);

  // Image timer functionality
  useEffect(() => {
    if (mediaType === "image" && showTimer && duration > 0) {
      hasCalledEndRef.current = false;
      setTimeRemaining(duration);

      const safetyTimeout = setTimeout(() => {
        console.warn("⏱️ Image timer safety timeout triggered");
        callOnDurationEnd();
      }, duration + 5000);

      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 100) {
            clearInterval(interval);
            clearTimeout(safetyTimeout);
            callOnDurationEnd();
            return 0;
          }
          return prev - 100;
        });
      }, 100);

      return () => {
        clearInterval(interval);
        clearTimeout(safetyTimeout);
      };
    }
  }, [mediaType, showTimer, duration, callOnDurationEnd]);

  // Video initialization with cached URL
  useEffect(() => {
    if (mediaType !== "video" || !cachedVideoUrl || !videoRef.current) {
      return;
    }

    const video = videoRef.current;
    let isMounted = true;
    let cleanupTimeout: NodeJS.Timeout;
    let loadingTimeout: NodeJS.Timeout;
    let stallTimeout: NodeJS.Timeout;
    let playAttemptTimeout: NodeJS.Timeout;
    let progressCheckInterval: NodeJS.Timeout;
    let retryPlayTimeout: NodeJS.Timeout;
    let lastProgressTime = 0;
    let playAttempts = 0;
    const MAX_PLAY_ATTEMPTS = 5;

    console.log(
      `🎥 Setting up video: ${cachedVideoUrl.substring(
        0,
        50
      )}... (playCount: ${playCount})`
    );

    hasCalledEndRef.current = false;

    loadingTimeout = setTimeout(() => {
      if (isMounted && !isVideoReady && !hasVideoError) {
        console.error("⏱️ Video loading timeout - taking too long to load");
        setHasVideoError(true);
        setIsVideoLoading(false);
        setTimeout(() => {
          if (isMounted) {
            console.log("⏭️ Auto-skipping failed video");
            callOnDurationEnd();
          }
        }, 2000);
      }
    }, 20000);

    const handleCanPlay = () => {
      if (!isMounted) return;
      console.log("✓ Video ready to play (canplay event)");
      setIsVideoReady(true);
      setIsVideoLoading(false);
      clearTimeout(loadingTimeout);
    };

    const handleLoadedData = () => {
      if (!isMounted) return;
      console.log("✓ Video data loaded (loadeddata event)");
      setIsVideoReady(true);
      setIsVideoLoading(false);
      clearTimeout(loadingTimeout);
    };

    const handlePlaying = () => {
      if (!isMounted) return;
      console.log("▶️ Video is playing");
      setIsPlaying(true);
      setIsVideoLoading(false);
      setShowPlayButton(false);
      clearTimeout(loadingTimeout);
      clearTimeout(stallTimeout);
      clearTimeout(retryPlayTimeout);

      lastProgressTime = video.currentTime;
      progressCheckInterval = setInterval(() => {
        if (!isMounted || !video) return;

        const currentProgress = video.currentTime;
        const hasProgressed = currentProgress > lastProgressTime;

        if (!hasProgressed && !video.paused && !video.ended) {
          console.warn("⚠️ Video appears stalled (no progress detected)");
          if (video.buffered.length > 0) {
            const bufferedEnd = video.buffered.end(video.buffered.length - 1);
            if (currentProgress < bufferedEnd - 0.5) {
              console.log("🔄 Attempting to recover stalled video");
              video
                .play()
                .catch((err) => console.error("Recovery play failed:", err));
            }
          }
        }

        lastProgressTime = currentProgress;
      }, 3000);

      const maxDuration = 600000;
      stallTimeout = setTimeout(() => {
        if (isMounted && !video.ended) {
          console.error("⏱️ Video exceeded maximum duration");
          setHasVideoError(true);
          setTimeout(() => {
            if (isMounted) {
              console.log("⏭️ Auto-skipping long video");
              callOnDurationEnd();
            }
          }, 2000);
        }
      }, maxDuration);
    };

    const handleWaiting = () => {
      if (!isMounted) return;
      console.log("⏳ Video buffering");
      setIsVideoLoading(true);

      const bufferTimeout = setTimeout(() => {
        if (isMounted && isVideoLoading) {
          console.error("⏱️ Video buffering timeout");
          if (video && video.buffered.length > 0) {
            const bufferedEnd = video.buffered.end(video.buffered.length - 1);
            if (video.currentTime < bufferedEnd - 1) {
              console.log("🔄 Attempting to skip buffering issue");
              video.currentTime = Math.min(
                video.currentTime + 1,
                bufferedEnd - 0.5
              );
              video
                .play()
                .catch((err) => console.error("Skip play failed:", err));
              return;
            }
          }

          setHasVideoError(true);
          setTimeout(() => {
            if (isMounted) {
              console.log("⏭️ Auto-skipping buffering video");
              callOnDurationEnd();
            }
          }, 2000);
        }
      }, 15000);

      const handleResumed = () => {
        clearTimeout(bufferTimeout);
        setIsVideoLoading(false);
        video.removeEventListener("playing", handleResumed);
      };
      video.addEventListener("playing", handleResumed, { once: true });
    };

    const handleEnded = () => {
      if (!isMounted) return;
      console.log("🏁 Video ended");

      clearInterval(progressCheckInterval);
      clearTimeout(stallTimeout);

      setCurrentPlayCount((prev) => {
        const newCount = prev + 1;
        console.log(`✓ Completed play ${newCount} of ${playCount}`);

        if (newCount >= playCount) {
          console.log(
            `✅ All ${playCount} plays completed - calling onDurationEnd`
          );
          setIsPlaying(false);
          callOnDurationEnd();
        } else {
          console.log(`🔄 Replaying video (${newCount + 1}/${playCount})`);
          if (video) {
            video.currentTime = 0;
            setTimeout(() => {
              video.play().catch((error) => {
                console.error("Error replaying video:", error);
                setShowPlayButton(true);
              });
            }, 100);
          }
        }
        return newCount;
      });
    };

    const handleError = (e: Event) => {
      if (!isMounted) return;
      const videoElement = e.target as HTMLVideoElement;
      console.error("❌ Video error:", videoElement.error);
      setIsVideoLoading(false);
      setHasVideoError(true);
      setIsVideoReady(false);
      clearTimeout(loadingTimeout);
      clearTimeout(stallTimeout);
      clearInterval(progressCheckInterval);

      setTimeout(() => {
        if (isMounted) {
          console.log("⏭️ Auto-skipping failed video");
          callOnDurationEnd();
        }
      }, 2000);
    };

    const handleStalled = () => {
      if (!isMounted) return;
      console.warn("⚠️ Video stalled event");
      setIsVideoLoading(true);

      setTimeout(() => {
        if (isMounted && video && video.readyState < 3) {
          console.log("🔄 Attempting to recover from stall");
          video.load();
          setTimeout(() => {
            if (isMounted) {
              attemptPlay();
            }
          }, 1000);
        }
      }, 3000);
    };

    const handleSuspend = () => {
      if (!isMounted) return;
      console.log("⏸️ Video suspended");
    };

    const attemptPlay = async () => {
      if (!isMounted || !video || playAttempts >= MAX_PLAY_ATTEMPTS) {
        if (playAttempts >= MAX_PLAY_ATTEMPTS) {
          console.error("❌ Max play attempts reached");
          // For TV boxes, don't show play button - just try to skip after delay
          setTimeout(() => {
            if (isMounted) {
              console.log("⏭️ Auto-skipping unplayable video");
              callOnDurationEnd();
            }
          }, 3000);
        }
        return;
      }

      playAttempts++;
      console.log(`🎬 Play attempt ${playAttempts}/${MAX_PLAY_ATTEMPTS}`);

      try {
        // Reset video state before attempting play
        if (video.paused) {
          setIsVideoLoading(true);

          // Ensure video is at the start
          if (video.currentTime > 0) {
            video.currentTime = 0;
          }

          await video.play();
          console.log("✓ Play successful");
          setIsPlaying(true);
          setShowPlayButton(false);
          setIsVideoLoading(false);
          playAttempts = 0;
        }
      } catch (error: any) {
        console.log(`⚠️ Play attempt ${playAttempts} failed:`, error.message);

        if (error.name === "NotAllowedError") {
          console.log("🔒 Autoplay blocked by browser");
          // For TV boxes, try a few more times before giving up
          if (playAttempts < 3) {
            const delay = 1000;
            console.log(`🔄 Retrying in ${delay}ms...`);
            retryPlayTimeout = setTimeout(() => {
              if (isMounted) {
                attemptPlay();
              }
            }, delay);
          } else {
            // Last resort - skip the video instead of showing play button
            console.log("⏭️ Skipping unplayable video on TV box");
            setTimeout(() => {
              if (isMounted) {
                callOnDurationEnd();
              }
            }, 2000);
          }
        } else if (playAttempts < MAX_PLAY_ATTEMPTS) {
          const delay = Math.min(500 * playAttempts, 2000);
          console.log(`🔄 Retrying in ${delay}ms...`);
          retryPlayTimeout = setTimeout(() => {
            if (isMounted) {
              attemptPlay();
            }
          }, delay);
        } else {
          console.error("❌ All play attempts failed - skipping");
          setTimeout(() => {
            if (isMounted) {
              callOnDurationEnd();
            }
          }, 2000);
        }
      }
    };

    setIsVideoReady(false);
    setIsPlaying(false);
    setIsVideoLoading(true);
    setHasVideoError(false);
    setShowPlayButton(false);
    setCurrentPlayCount(0);
    playAttempts = 0;

    video.src = cachedVideoUrl;
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";
    video.loop = false;
    video.autoplay = true; // Enable autoplay attribute for TV boxes

    // Set additional attributes for better compatibility
    video.setAttribute("webkit-playsinline", "true");
    video.setAttribute("x5-playsinline", "true");
    video.setAttribute("x5-video-player-type", "h5");
    video.setAttribute("x5-video-player-fullscreen", "false");

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);
    video.addEventListener("stalled", handleStalled);
    video.addEventListener("suspend", handleSuspend);

    video.load();

    // Aggressive autoplay attempts for TV boxes
    const tryAutoplay = () => {
      if (!isMounted || !video) return;

      // Try immediately if video is ready
      if (video.readyState >= 2) {
        attemptPlay();
      }
    };

    // Multiple autoplay triggers
    cleanupTimeout = setTimeout(tryAutoplay, 500);
    const autoplay1 = setTimeout(tryAutoplay, 1000);
    const autoplay2 = setTimeout(tryAutoplay, 1500);
    const autoplay3 = setTimeout(tryAutoplay, 2500);

    // Also try on any user interaction (for browsers that need it)
    const interactionHandler = () => {
      if (!isPlaying && isMounted) {
        attemptPlay();
      }
    };
    document.addEventListener("click", interactionHandler, { once: true });
    document.addEventListener("touchstart", interactionHandler, { once: true });
    document.addEventListener("keydown", interactionHandler, { once: true });

    // Override cleanup to clear all timeouts
    const originalCleanupTimeout = cleanupTimeout;
    cleanupTimeout = (() => {
      clearTimeout(originalCleanupTimeout);
      clearTimeout(autoplay1);
      clearTimeout(autoplay2);
      clearTimeout(autoplay3);
      document.removeEventListener("click", interactionHandler);
      document.removeEventListener("touchstart", interactionHandler);
      document.removeEventListener("keydown", interactionHandler);
    }) as any;

    return () => {
      console.log("🧹 Cleaning up video player");
      isMounted = false;
      clearTimeout(cleanupTimeout);
      clearTimeout(loadingTimeout);
      clearTimeout(stallTimeout);
      clearTimeout(playAttemptTimeout);
      clearTimeout(retryPlayTimeout);
      clearInterval(progressCheckInterval);

      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
      video.removeEventListener("stalled", handleStalled);
      video.removeEventListener("suspend", handleSuspend);

      if (video) {
        video.pause();
        video.src = "";
        video.load();
      }
    };
  }, [mediaType, cachedVideoUrl, playCount, callOnDurationEnd]);

  const handleManualPlay = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      setIsVideoLoading(true);
      await videoRef.current.play();
      setIsPlaying(true);
      setShowPlayButton(false);
      setIsVideoLoading(false);
    } catch (error) {
      console.error("Manual play failed:", error);
      setIsVideoLoading(false);
    }
  }, []);

  const handleSkipVideo = useCallback(() => {
    console.log("⏩ User skipped video");
    callOnDurationEnd();
  }, [callOnDurationEnd]);

  const progressPercentage =
    mediaType === "image" && duration > 0
      ? ((duration - timeRemaining) / duration) * 100
      : 0;

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  const daysOfWeekLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideInUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes slideInDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes zoomIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes zoomOut {
          from {
            transform: scale(2);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes flip {
          from {
            transform: perspective(400px) rotateY(90deg);
            opacity: 0;
          }
          to {
            transform: perspective(400px) rotateY(0deg);
            opacity: 1;
          }
        }
        @keyframes bounceIn {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes rotateIn {
          from {
            transform: rotate(-200deg) scale(0);
            opacity: 0;
          }
          to {
            transform: rotate(0) scale(1);
            opacity: 1;
          }
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.8s ease-out;
        }
        .animate-slideInRight {
          animation: slideInRight 0.8s ease-out;
        }
        .animate-slideInUp {
          animation: slideInUp 0.8s ease-out;
        }
        .animate-slideInDown {
          animation: slideInDown 0.8s ease-out;
        }
        .animate-zoomIn {
          animation: zoomIn 0.8s ease-out;
        }
        .animate-zoomOut {
          animation: zoomOut 0.8s ease-out;
        }
        .animate-flip {
          animation: flip 0.8s ease-out;
        }
        .animate-bounceIn {
          animation: bounceIn 0.8s ease-out;
        }
        .animate-rotateIn {
          animation: rotateIn 0.8s ease-out;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>

      <div
        className={`relative w-full h-full bg-black/95 backdrop-blur-lg rounded-2xl overflow-hidden shadow-2xl ${animationClass}`}
      >
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center transition-all group"
            style={{ borderColor: accentColor, borderWidth: "2px" }}
            aria-label="Close ad"
          >
            <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform" />
          </button>
        )}

        {mediaType === "video" && onDurationEnd && (
          <button
            onClick={handleSkipVideo}
            className="absolute top-6 left-6 z-50 px-4 py-2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center transition-all text-white text-sm font-medium"
            style={{ borderColor: accentColor, borderWidth: "2px" }}
          >
            Skip Video
          </button>
        )}

        <div className="absolute inset-0 flex items-center justify-center">
          {mediaType === "video" && videoUrl ? (
            <>
              {isCaching && cacheProgress && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-40">
                  <div className="flex flex-col items-center gap-6 max-w-md w-full px-8">
                    <Download
                      className="w-16 h-16 animate-bounce"
                      style={{ color: accentColor }}
                    />
                    <div className="w-full">
                      <div className="flex justify-between text-white mb-2">
                        <span className="text-lg font-semibold">
                          Preparing video...
                        </span>
                        <span className="text-lg font-bold">
                          {cacheProgress.percentage}%
                        </span>
                      </div>
                      <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-300 rounded-full"
                          style={{
                            width: `${cacheProgress.percentage}%`,
                            background: `linear-gradient(90deg, ${primaryColor}, ${accentColor})`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-white/70 text-sm mt-2">
                        <span>
                          {(cacheProgress.loaded / 1024 / 1024).toFixed(1)} MB
                        </span>
                        <span>
                          {(cacheProgress.total / 1024 / 1024).toFixed(1)} MB
                        </span>
                      </div>
                    </div>
                    <p className="text-white/80 text-center">
                      Downloading to memory for smooth, buffer-free playback
                    </p>
                  </div>
                </div>
              )}

              {cacheError && (
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-500/90 text-black px-4 py-2 rounded-lg text-sm">
                  Failed to cache. Playing from cloud (may buffer)
                </div>
              )}

              <video
                ref={videoRef}
                className={`w-full h-full object-cover ${
                  isVideoLoading || isCaching ? "opacity-50" : "opacity-100"
                } transition-opacity duration-300`}
                muted
                playsInline
                preload="auto"
                crossOrigin="anonymous"
                aria-label={title ? `Video ad: ${title}` : "Video ad"}
              >
                {cachedVideoUrl && (
                  <source src={cachedVideoUrl} type="video/mp4" />
                )}
                Your browser does not support the video tag.
              </video>

              {(isVideoLoading || !isVideoReady) &&
                !hasVideoError &&
                !showPlayButton &&
                !isCaching && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2
                        className="w-10 h-10 text-white animate-spin"
                        style={{ color: accentColor }}
                      />
                      <span className="text-white text-lg">
                        Loading video...
                      </span>
                    </div>
                  </div>
                )}

              {showPlayButton && !hasVideoError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                  <button
                    onClick={handleManualPlay}
                    className="px-10 py-6 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-lg transition-all duration-300 hover:scale-105 flex flex-col items-center gap-4"
                    style={{ border: `2px solid ${accentColor}` }}
                    aria-label="Play video"
                  >
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                      <Play className="w-12 h-12 text-white ml-2" />
                    </div>
                    <span className="text-white text-xl font-semibold">
                      Click to Play Video
                    </span>
                    <span className="text-white/70 text-sm">
                      {playCount > 1
                        ? `Will play ${playCount} time${
                            playCount > 1 ? "s" : ""
                          }`
                        : "Autoplay was blocked by your browser"}
                    </span>
                  </button>
                </div>
              )}

              {hasVideoError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                  <div className="text-center p-8 max-w-md">
                    <div
                      className="text-5xl mb-4"
                      style={{ color: accentColor }}
                    >
                      ⚠️
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Video Failed to Load
                    </h3>
                    <p className="text-white/70 mb-6">
                      Unable to load the video content. Skipping to next...
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                      <span className="text-white/70 text-sm">
                        Auto-skipping in 2s
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            imageUrl && (
              <img
                src={imageUrl}
                alt={title || "Advertisement"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error("Failed to load image:", imageUrl);
                  e.currentTarget.style.display = "none";
                }}
              />
            )
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
          <div className="max-w-4xl mx-auto">
            {title && (
              <h2
                className="text-5xl font-bold mb-4 drop-shadow-lg"
                style={{ color: accentColor }}
              >
                {title}
              </h2>
            )}
            <p className="text-2xl text-white/90 mb-6 drop-shadow-lg">
              {caption}
            </p>

            {mediaType === "image" && showTimer && duration > 0 && (
              <div className="mb-4">
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-100 ease-linear rounded-full"
                    style={{
                      width: `${Math.min(progressPercentage, 100)}%`,
                      background: `linear-gradient(90deg, ${primaryColor}, ${accentColor})`,
                    }}
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-white/70 text-sm">
                    Time remaining: {formatTime(timeRemaining)}
                  </span>
                </div>
              </div>
            )}

            {mediaType === "video" && (
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-white/70 text-sm">
                      {isCaching
                        ? "Caching..."
                        : isVideoLoading
                        ? "Loading..."
                        : isPlaying
                        ? "Now playing"
                        : showPlayButton
                        ? "Click to play"
                        : hasVideoError
                        ? "Error loading video"
                        : "Ready"}
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: playCount }).map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                            idx < currentPlayCount ? "bg-white" : "bg-white/30"
                          }`}
                        />
                      ))}
                    </div>
                    {(isVideoLoading || isCaching) && (
                      <Loader2 className="w-3 h-3 text-white animate-spin ml-2" />
                    )}
                  </div>
                  <div className="text-white/70 text-sm font-medium">
                    Play {Math.min(currentPlayCount + 1, playCount)} of{" "}
                    {playCount}
                    {playCount > 1 ? " times" : " time"}
                  </div>
                </div>
              </div>
            )}

            {showScheduleInfo && scheduleInfo && (
              <div className="flex flex-wrap gap-3 text-sm">
                <div
                  className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border"
                  style={{ borderColor: `${primaryColor}40` }}
                >
                  <span className="text-white/70">
                    📅{" "}
                    {scheduleInfo.daysOfWeek
                      .map((day) => daysOfWeekLabels[day])
                      .join(", ")}
                  </span>
                </div>
                <div
                  className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border"
                  style={{ borderColor: `${primaryColor}40` }}
                >
                  <span className="text-white/70">
                    🔄 Every {scheduleInfo.frequency / 60} min
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className="absolute top-0 left-0 w-32 h-32 opacity-20"
          style={{
            background: `radial-gradient(circle at top left, ${accentColor}, transparent)`,
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-32 h-32 opacity-20"
          style={{
            background: `radial-gradient(circle at bottom right, ${secondaryColor}, transparent)`,
          }}
        />
      </div>
    </>
  );
}
