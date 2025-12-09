import React, { useState, useEffect, useRef } from "react";
import { Heart, X } from "lucide-react";

interface Doctor {
  name: string;
  specialty: string;
  experience: string;
  image: string;
  available: string;
}

interface GalleryItem {
  image: string;
  caption: string;
  fullScreen?: boolean;
}

interface AdSchedule {
  id: string;
  enabled: boolean;
  title: string;
  image: string;
  caption: string;
  fullScreen: boolean;
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
  galleryItems: GalleryItem[];
  adSchedules: AdSchedule[];
  layout: "Authentic" | "Advanced";
  enableFullscreen: boolean;
  fullscreenDuration: number;
  doctorRotationSpeed: number;
}

function HospitalTemplateAuthentic({
  customization = {},
  backgroundStyle = {},
}: any) {
  // Use all settings from customization with defaults
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
        experience: "15+ Years",
        image:
          "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop",
        available: "Mon-Fri, 9 AM - 5 PM",
      },
    ],
    galleryItems: customization.galleryItems || [
      {
        image:
          "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1920&h=1080&fit=crop",
        caption: "State-of-the-Art Facilities",
        fullScreen: true,
      },
      {
        image:
          "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1920&h=1080&fit=crop",
        caption: "Expert Patient Care",
        fullScreen: false,
      },
      {
        image:
          "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920&h=1080&fit=crop",
        caption: "Dedicated Team",
        fullScreen: true,
      },
    ],
    adSchedules: customization.adSchedules || [],
    layout: customization.layout || "Authentic",
    enableFullscreen: customization.enableFullscreen || false,
    fullscreenDuration: customization.fullscreenDuration || 10000,
    doctorRotationSpeed: customization.doctorRotationSpeed || 6000,
  };

  const [currentTime, setCurrentTime] = useState(new Date());
  const [scrollPosition, setScrollPosition] = useState(0);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [currentDoctorIndex, setCurrentDoctorIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeAd, setActiveAd] = useState<AdSchedule | null>(null);
  const [adTimer, setAdTimer] = useState<number>(0);
  const [showAd, setShowAd] = useState(false);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const adIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const adDurationRef = useRef<NodeJS.Timeout | null>(null);
  const doctorRotationRef = useRef<NodeJS.Timeout | null>(null);

  const defaultDoctorImage =
    "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop";

  const bgImages =
    settings.enableSlideshow &&
    settings.backgroundImages &&
    settings.backgroundImages.length > 0
      ? settings.backgroundImages
      : [settings.backgroundImage];

  const currentGalleryItem = settings.galleryItems[currentGalleryIndex];
  const isFullScreen = currentGalleryItem?.fullScreen || false;

  // Check if current time is within schedule
  const isWithinSchedule = (schedule: AdSchedule): boolean => {
    const now = new Date();
    const scheduleStartDate = new Date(schedule.dateRange.start);
    const scheduleEndDate = new Date(schedule.dateRange.end);
    const currentDay = now.getDay();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeStr = `${currentHour
      .toString()
      .padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;

    if (!schedule.enabled) return false;

    // Check date range
    if (now < scheduleStartDate || now > scheduleEndDate) {
      return false;
    }

    // Check day of week
    if (!schedule.daysOfWeek.includes(currentDay)) {
      return false;
    }

    // Check time range
    if (
      currentTimeStr < schedule.timeRange.start ||
      currentTimeStr > schedule.timeRange.end
    ) {
      return false;
    }

    return true;
  };

  // Find active ad schedule
  const findActiveAdSchedule = (): AdSchedule | null => {
    for (const schedule of settings.adSchedules) {
      if (isWithinSchedule(schedule)) {
        return schedule;
      }
    }
    return null;
  };

  // Initialize ad system
  useEffect(() => {
    const activeSchedule = findActiveAdSchedule();

    if (activeSchedule && !showAd) {
      // Start showing ad
      setActiveAd(activeSchedule);
      setAdTimer(activeSchedule.duration);
      setShowAd(true);

      // Set up duration timer
      if (adDurationRef.current) clearTimeout(adDurationRef.current);
      adDurationRef.current = setTimeout(() => {
        setShowAd(false);
        setActiveAd(null);
      }, activeSchedule.duration * 1000);

      // Set up frequency interval
      if (adIntervalRef.current) clearInterval(adIntervalRef.current);
      adIntervalRef.current = setInterval(() => {
        const currentActiveSchedule = findActiveAdSchedule();
        if (
          currentActiveSchedule &&
          currentActiveSchedule.id !== activeSchedule?.id
        ) {
          setActiveAd(currentActiveSchedule);
          setAdTimer(currentActiveSchedule.duration);
          setShowAd(true);

          // Reset duration timer
          if (adDurationRef.current) clearTimeout(adDurationRef.current);
          adDurationRef.current = setTimeout(() => {
            setShowAd(false);
            setActiveAd(null);
          }, currentActiveSchedule.duration * 1000);
        }
      }, activeSchedule.frequency * 1000);
    } else if (!activeSchedule && showAd) {
      // Clear ad if no active schedule
      setShowAd(false);
      setActiveAd(null);
      if (adIntervalRef.current) clearInterval(adIntervalRef.current);
      if (adDurationRef.current) clearTimeout(adDurationRef.current);
    }

    return () => {
      if (adIntervalRef.current) clearInterval(adIntervalRef.current);
      if (adDurationRef.current) clearTimeout(adDurationRef.current);
    };
  }, [settings.adSchedules, showAd, currentTime]);

  // Update ad timer
  useEffect(() => {
    if (!showAd || !activeAd) return;

    const timer = setInterval(() => {
      setAdTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showAd, activeAd]);

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Doctor carousel animation
  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      setScrollPosition((prev) => {
        const speed = settings.slideSpeed / 80;
        const newPosition = prev + (speed * delta) / 16.67;
        return newPosition;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [settings.slideSpeed]);

  // Background slideshow
  useEffect(() => {
    if (!settings.enableSlideshow || bgImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % bgImages.length);
    }, settings.slideshowSpeed);

    return () => clearInterval(interval);
  }, [settings.enableSlideshow, bgImages.length, settings.slideshowSpeed]);

  // Doctor rotation for advanced layout
  useEffect(() => {
    if (settings.layout === "Advanced" && settings.doctors.length > 1) {
      if (doctorRotationRef.current) clearInterval(doctorRotationRef.current);

      doctorRotationRef.current = setInterval(() => {
        setCurrentDoctorIndex((prev) => (prev + 1) % settings.doctors.length);
      }, settings.doctorRotationSpeed);

      return () => {
        if (doctorRotationRef.current) clearInterval(doctorRotationRef.current);
      };
    }
  }, [settings.layout, settings.doctors.length, settings.doctorRotationSpeed]);

  // Gallery carousel with transition
  useEffect(() => {
    if (settings.galleryItems.length <= 1 || showAd) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentGalleryIndex(
          (prev) => (prev + 1) % settings.galleryItems.length
        );
        setIsTransitioning(false);
      }, 500);
    }, settings.galleryTransitionSpeed);

    return () => clearInterval(interval);
  }, [settings.galleryItems.length, settings.galleryTransitionSpeed, showAd]);

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

  const duplicatedDoctors = [
    ...settings.doctors,
    ...settings.doctors,
    ...settings.doctors,
    ...settings.doctors,
  ];
  const itemHeight = 220;
  const totalHeight = settings.doctors.length * itemHeight;

  // Get current doctor based on layout
  const getCurrentDoctor = () => {
    if (settings.layout === "Advanced" && settings.doctors.length > 0) {
      return settings.doctors[currentDoctorIndex];
    }
    return settings.doctors[0];
  };

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

        {/* Content Area */}
        <div className="flex-1 flex gap-8 px-8 pb-8 pt-8 overflow-hidden relative z-20">
          {/* Left Side - Doctors Display */}
          <div
            className={`flex flex-col overflow-hidden transition-all duration-500 ${
              isFullScreen ? "flex-[0.3]" : "flex-1"
            }`}
          >
            {settings.layout === "Authentic" ? (
              // Authentic Layout: Scrolling Carousel
              <div
                className="relative flex-1 overflow-hidden rounded-3xl shadow-2xl border-2"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.75)",
                  backdropFilter: "blur(20px)",
                  borderColor: `${settings.accentColor}40`,
                  maskImage:
                    "linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)",
                }}
              >
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})`,
                  }}
                />

                <div
                  className="absolute z-10 w-full px-6"
                  style={{
                    transform: `translateY(-${
                      scrollPosition % (totalHeight * 3)
                    }px)`,
                    willChange: "transform",
                  }}
                >
                  {duplicatedDoctors.map((doctor, index) => (
                    <div
                      key={index}
                      className="mb-5"
                      style={{ height: `${itemHeight}px` }}
                    >
                      <div
                        className="h-full rounded-2xl p-5 shadow-xl border-2 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group"
                        style={{
                          background: `linear-gradient(135deg, ${settings.primaryColor}20, ${settings.secondaryColor}20)`,
                          borderColor: `${settings.accentColor}60`,
                        }}
                      >
                        <div className="flex items-center h-full gap-6">
                          <div className="relative flex-shrink-0">
                            <div className="relative w-40 h-40 rounded-2xl overflow-hidden shadow-2xl group-hover:shadow-3xl transition-all duration-500">
                              <div
                                className="absolute inset-0 opacity-60 blur-sm"
                                style={{
                                  background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})`,
                                }}
                              />

                              <img
                                src={doctor.image || defaultDoctorImage}
                                alt={doctor.name}
                                className="relative w-full h-full object-cover rounded-2xl border-4 border-white/40 group-hover:border-white/60 transition-all duration-500 group-hover:scale-105"
                                onError={(e) => {
                                  e.currentTarget.src = defaultDoctorImage;
                                }}
                              />

                              <div
                                className="absolute inset-0 rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"
                                style={{
                                  background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})`,
                                }}
                              />

                              {doctor.experience && (
                                <div
                                  className="absolute bottom-3 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full text-sm font-bold shadow-2xl whitespace-nowrap z-20"
                                  style={{
                                    background: `linear-gradient(135deg, ${settings.accentColor}, ${settings.secondaryColor})`,
                                    color: "white",
                                    border: `2px solid white`,
                                    minWidth: "120px",
                                    textAlign: "center",
                                  }}
                                >
                                  {doctor.experience}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex-1 space-y-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-2 h-10 rounded-full"
                                  style={{
                                    backgroundColor: settings.accentColor,
                                    boxShadow: `0 0 15px ${settings.accentColor}`,
                                  }}
                                />
                                <p
                                  className="text-4xl font-black tracking-tight leading-tight"
                                  style={{
                                    color: "white",
                                    textShadow: `0 3px 20px ${settings.accentColor}80`,
                                  }}
                                >
                                  {doctor.name}
                                </p>
                              </div>
                            </div>

                            {doctor.specialty && (
                              <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                                    style={{
                                      backgroundColor: settings.primaryColor,
                                    }}
                                  >
                                    <span className="text-white text-lg">
                                      🩺
                                    </span>
                                  </div>
                                  <p
                                    className="text-2xl font-bold italic"
                                    style={{
                                      color: `${settings.accentColor}EE`,
                                      textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                                    }}
                                  >
                                    {doctor.specialty}
                                  </p>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center gap-2 pt-2">
                              <div
                                className="flex-1 h-0.5 rounded-full opacity-40"
                                style={{
                                  backgroundColor: settings.accentColor,
                                }}
                              />
                              <div
                                className="w-3 h-3 rounded-full animate-pulse"
                                style={{
                                  backgroundColor: settings.accentColor,
                                  boxShadow: `0 0 10px ${settings.accentColor}`,
                                }}
                              />
                              <div
                                className="flex-1 h-0.5 rounded-full opacity-40"
                                style={{
                                  backgroundColor: settings.accentColor,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="absolute top-0 left-0 right-0 h-20 pointer-events-none z-20"
                  style={{
                    background: `linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, transparent 100%)`,
                  }}
                />
                <div
                  className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none z-20"
                  style={{
                    background: `linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)`,
                  }}
                />
                <div
                  className="absolute top-0 left-0 bottom-0 w-16 pointer-events-none z-20"
                  style={{
                    background: `linear-gradient(to right, rgba(0,0,0,0.9) 0%, transparent 100%)`,
                  }}
                />
                <div
                  className="absolute top-0 right-0 bottom-0 w-16 pointer-events-none z-20"
                  style={{
                    background: `linear-gradient(to left, rgba(0,0,0,0.9) 0%, transparent 100%)`,
                  }}
                />
              </div>
            ) : (
              // Advanced Layout: Single Doctor with Rotation
              <div
                className="relative flex-1 overflow-hidden rounded-3xl shadow-2xl border-2"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.75)",
                  backdropFilter: "blur(20px)",
                  borderColor: `${settings.accentColor}40`,
                }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                  {settings.doctors.length > 0 ? (
                    <div className="w-full max-w-4xl">
                      <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="relative">
                          <div className="relative w-64 h-64 rounded-3xl overflow-hidden shadow-2xl">
                            <img
                              src={
                                getCurrentDoctor().image || defaultDoctorImage
                              }
                              alt={getCurrentDoctor().name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = defaultDoctorImage;
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          </div>
                          {settings.doctors.length > 1 && (
                            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                              {settings.doctors.map((_, idx) => (
                                <div
                                  key={idx}
                                  className="w-3 h-3 rounded-full transition-all"
                                  style={{
                                    backgroundColor:
                                      idx === currentDoctorIndex
                                        ? settings.accentColor
                                        : "rgba(255,255,255,0.3)",
                                    width:
                                      idx === currentDoctorIndex
                                        ? "20px"
                                        : "12px",
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 text-center md:text-left">
                          <h3 className="text-5xl font-bold text-white mb-3">
                            {getCurrentDoctor().name}
                          </h3>
                          <p className="text-2xl text-gray-300 mb-4">
                            {getCurrentDoctor().specialty}
                          </p>
                          <div className="space-y-2">
                            <p className="text-xl text-gray-400">
                              Experience: {getCurrentDoctor().experience}
                            </p>
                            <p className="text-xl text-gray-400">
                              Available: {getCurrentDoctor().available}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <p className="text-2xl">No doctors configured</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Gallery Carousel */}
          <div
            className={`flex flex-col overflow-hidden transition-all duration-500 ${
              isFullScreen ? "flex-[0.7]" : "flex-1"
            }`}
          >
            <div
              className="relative h-full rounded-3xl overflow-hidden shadow-2xl border-2"
              style={{ borderColor: `${settings.accentColor}40` }}
            >
              {settings.galleryItems.map((item, idx) => (
                <div
                  key={idx}
                  className="absolute inset-0 transition-all duration-700"
                  style={{
                    opacity:
                      idx === currentGalleryIndex && !isTransitioning ? 1 : 0,
                    transform:
                      idx === currentGalleryIndex && !isTransitioning
                        ? "scale(1)"
                        : "scale(1.1)",
                    zIndex: idx === currentGalleryIndex ? 10 : 0,
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.caption}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                    <h3 className="text-5xl font-black text-white mb-3 drop-shadow-2xl">
                      {item.caption}
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white rounded-full transition-all"
                          style={{
                            width: `${
                              ((currentGalleryIndex + 1) /
                                settings.galleryItems.length) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-white/80 text-lg font-bold">
                        {currentGalleryIndex + 1} /{" "}
                        {settings.galleryItems.length}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination Dots */}
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-3 z-30">
                {settings.galleryItems.map((_, idx) => (
                  <div
                    key={idx}
                    className="rounded-full transition-all duration-300"
                    style={{
                      backgroundColor:
                        idx === currentGalleryIndex
                          ? settings.accentColor
                          : "rgba(255,255,255,0.4)",
                      width: idx === currentGalleryIndex ? "32px" : "12px",
                      height: "12px",
                      boxShadow:
                        idx === currentGalleryIndex
                          ? `0 0 20px ${settings.accentColor}`
                          : "none",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
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

      {/* Full-Screen Gallery Overlay */}
      {isFullScreen && !isTransitioning && !showAd && (
        <div className="fixed inset-0 z-[9999]">
          <style>
            {`
              @keyframes glowPulse {
                0%, 100% {
                  box-shadow: 
                    0 0 40px ${settings.accentColor}60,
                    0 0 80px ${settings.accentColor}40,
                    0 0 120px ${settings.accentColor}20;
                }
                50% {
                  box-shadow: 
                    0 0 60px ${settings.accentColor}80,
                    0 0 120px ${settings.accentColor}60,
                    0 0 180px ${settings.accentColor}40;
                }
              }
            `}
          </style>

          {/* Black background */}
          <div className="absolute inset-0 bg-black" />

          {/* Image container with border and glow - FULLSCREEN */}
          <div
            className="absolute inset-0 m-0"
            style={{
              border: `12px solid ${settings.accentColor}`,
              animation: "glowPulse 3s ease-in-out infinite",
              boxShadow: `0 0 60px ${settings.accentColor}40`,
            }}
          >
            {/* Corner decorative elements */}
            <div
              className="absolute top-0 left-0 w-16 h-16"
              style={{
                background: `linear-gradient(135deg, ${settings.accentColor}40 0%, transparent 100%)`,
              }}
            />
            <div
              className="absolute top-0 right-0 w-16 h-16"
              style={{
                background: `linear-gradient(225deg, ${settings.accentColor}40 0%, transparent 100%)`,
              }}
            />
            <div
              className="absolute bottom-0 left-0 w-16 h-16"
              style={{
                background: `linear-gradient(45deg, ${settings.accentColor}40 0%, transparent 100%)`,
              }}
            />
            <div
              className="absolute bottom-0 right-0 w-16 h-16"
              style={{
                background: `linear-gradient(315deg, ${settings.accentColor}40 0%, transparent 100%)`,
              }}
            />

            {/* Main image - fullscreen background */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${currentGalleryItem.image})`,
              }}
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

            {/* Full-Screen Caption */}
            <div className="absolute bottom-24 left-0 right-0 px-16 z-20">
              <h2 className="text-8xl font-black text-white mb-6 drop-shadow-2xl text-center">
                {currentGalleryItem.caption}
              </h2>
              <div className="flex items-center justify-center gap-4">
                <div className="h-2 w-64 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        ((currentGalleryIndex + 1) /
                          settings.galleryItems.length) *
                        100
                      }%`,
                      backgroundColor: settings.accentColor,
                      boxShadow: `0 0 20px ${settings.accentColor}`,
                    }}
                  />
                </div>
                <span className="text-white text-2xl font-bold">
                  {currentGalleryIndex + 1} / {settings.galleryItems.length}
                </span>
              </div>
            </div>
          </div>

          {/* Full-Screen Indicator */}
          <div className="absolute top-8 right-8 z-50">
            <div
              className="px-6 py-3 rounded-full backdrop-blur-md border-2 flex items-center gap-3"
              style={{
                backgroundColor: "rgba(0,0,0,0.6)",
                borderColor: settings.accentColor,
              }}
            >
              <div
                className="w-3 h-3 rounded-full animate-pulse"
                style={{
                  backgroundColor: settings.accentColor,
                  boxShadow: `0 0 15px ${settings.accentColor}`,
                }}
              />
              <span className="text-white font-bold text-lg">
                FULL SCREEN AD
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Schedule-Based Ad Overlay */}
      {showAd && activeAd && (
        <div className="fixed inset-0 z-[10000]">
          <style>
            {`
              @keyframes adGlowPulse {
                0%, 100% {
                  box-shadow: 
                    0 0 40px ${settings.primaryColor}60,
                    0 0 80px ${settings.primaryColor}40,
                    0 0 120px ${settings.primaryColor}20;
                }
                50% {
                  box-shadow: 
                    0 0 60px ${settings.primaryColor}80,
                    0 0 120px ${settings.primaryColor}60,
                    0 0 180px ${settings.primaryColor}40;
                }
              }
            `}
          </style>

          {/* Background with blur effect */}
          <div className="absolute inset-0 bg-black/90 backdrop-blur-lg" />

          {/* Ad Container */}
          <div
            className="absolute inset-0 m-0 flex items-center justify-center"
            style={{
              border: `8px solid ${settings.primaryColor}`,
              animation: "adGlowPulse 3s ease-in-out infinite",
            }}
          >
            {/* Ad Image */}
            <div className="relative w-4/5 h-4/5">
              <img
                src={activeAd.image}
                alt={activeAd.title}
                className="w-full h-full object-contain rounded-xl"
              />

              {/* Ad Overlay Content */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-8">
                <div className="text-center">
                  <h2 className="text-6xl font-bold text-white mb-4">
                    {activeAd.title}
                  </h2>
                  <p className="text-3xl text-gray-200 mb-6">
                    {activeAd.caption}
                  </p>

                  {/* Timer */}
                  <div className="inline-flex items-center gap-4 px-6 py-3 bg-black/50 rounded-full">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-white text-xl">
                        Scheduled Ad - {adTimer}s remaining
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ad Info Panel */}
            <div className="absolute top-8 left-8 bg-black/70 backdrop-blur-md rounded-xl p-4 border-2 border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-white font-bold text-lg">
                  SCHEDULED ADVERTISEMENT
                </span>
              </div>
              <div className="text-white/80 text-sm space-y-1">
                <div>
                  Schedule: {activeAd.timeRange.start} -{" "}
                  {activeAd.timeRange.end}
                </div>
                <div>Frequency: Every {activeAd.frequency}s</div>
                <div>Duration: {activeAd.duration}s</div>
              </div>
            </div>

            {/* Close Button (for testing) */}
            <button
              onClick={() => {
                setShowAd(false);
                setActiveAd(null);
                if (adIntervalRef.current) clearInterval(adIntervalRef.current);
                if (adDurationRef.current) clearTimeout(adDurationRef.current);
              }}
              className="absolute top-8 right-8 w-12 h-12 bg-red-500/20 border-2 border-red-500/30 rounded-full flex items-center justify-center hover:bg-red-500/30 transition-colors"
            >
              <X className="w-6 h-6 text-red-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HospitalTemplateAuthentic;
