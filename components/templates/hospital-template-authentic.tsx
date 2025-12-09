import React, { useState, useEffect, useRef } from "react";
import { Heart, Award, Calendar } from "lucide-react";

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
  doctorRotationSpeed: number;
  departmentInfo: string;
  emergencyContact: string;
  leftComponent: "doctors" | "appointments" | "schedules";
  rightComponent: "doctors" | "appointments" | "schedules";
  enableSlideshow: boolean;
  slideshowSpeed: number;
  slideSpeed: number;
  layout: "Advanced" | "Authentic";
  doctors: Doctor[];
  appointments: Array<{
    id: string;
    patientName: string;
    doctorName: string;
    specialty: string;
    time: string;
    room: string;
    appointmentDate: Date;
    priority: "normal" | "urgent" | "follow-up";
  }>;
  doctorSchedules: Array<{
    time: string;
    patientName: string;
    doctorName: string;
    department: string;
    room: string;
  }>;
  galleryItems: GalleryItem[];
}

interface HospitalTemplateProps {
  customization: HospitalCustomization;
  backgroundStyle: React.CSSProperties;
}

// Authentic Template Component
function HospitalTemplateAuthentic({
  customization = {},
  backgroundStyle = {},
}: any) {
  const settings = {
    hospitalName: customization.hospitalName || "OLIVIA Hospital",
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
  };

  const doctors =
    customization.doctors && customization.doctors.length > 0
      ? customization.doctors
      : [
          {
            name: "Dr. Sarah Johnson",
            specialty: "Cardiology",
            experience: "15+ Years",
            image:
              "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop",
            available: "Mon-Fri, 9 AM - 5 PM",
          },
        ];

  const galleryItems =
    customization.galleryItems && customization.galleryItems.length > 0
      ? customization.galleryItems
      : [
          {
            image:
              "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&h=600&fit=crop",
            caption: "State-of-the-Art Facilities",
          },
          {
            image:
              "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=400&h=300&fit=crop",
            caption: "Expert Patient Care",
          },
          {
            image:
              "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=300&fit=crop",
            caption: "Dedicated Team",
          },
        ];

  const [currentTime, setCurrentTime] = useState(new Date());
  const [scrollPosition, setScrollPosition] = useState(0);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const defaultDoctorImage =
    "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop";

  const bgImages =
    settings.enableSlideshow &&
    settings.backgroundImages &&
    settings.backgroundImages.length > 0
      ? settings.backgroundImages
      : [settings.backgroundImage];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  useEffect(() => {
    if (!settings.enableSlideshow || bgImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % bgImages.length);
    }, settings.slideshowSpeed);

    return () => clearInterval(interval);
  }, [settings.enableSlideshow, bgImages.length, settings.slideshowSpeed]);

  useEffect(() => {
    if (galleryItems.length <= 3) return;

    const interval = setInterval(() => {
      setCurrentGalleryIndex((prev) => (prev + 1) % galleryItems.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [galleryItems.length]);

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

  const duplicatedDoctors = [...doctors, ...doctors, ...doctors, ...doctors];
  const itemHeight = 220;
  const totalHeight = doctors.length * itemHeight;

  const renderGallery = () => {
    if (galleryItems.length === 1) {
      return (
        <div
          className="h-full relative overflow-hidden rounded-3xl shadow-2xl border-2"
          style={{ borderColor: `${settings.accentColor}40` }}
        >
          <img
            src={galleryItems[0].image}
            alt={galleryItems[0].caption}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <h3 className="text-4xl font-black text-white mb-2 drop-shadow-2xl">
              {galleryItems[0].caption}
            </h3>
            <p className="text-xl text-white/90 font-medium drop-shadow-lg">
              Excellence in healthcare
            </p>
          </div>
        </div>
      );
    } else if (galleryItems.length === 2) {
      return (
        <div className="h-full flex flex-col gap-6">
          {galleryItems.map((item, idx) => (
            <div
              key={idx}
              className="flex-1 relative overflow-hidden rounded-3xl shadow-2xl border-2"
              style={{ borderColor: `${settings.accentColor}40` }}
            >
              <img
                src={item.image}
                alt={item.caption}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-3xl font-bold text-white drop-shadow-lg">
                  {item.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      const displayItems =
        galleryItems.length === 3
          ? galleryItems
          : [
              galleryItems[currentGalleryIndex],
              galleryItems[(currentGalleryIndex + 1) % galleryItems.length],
              galleryItems[(currentGalleryIndex + 2) % galleryItems.length],
            ];

      return (
        <>
          <div
            className="h-2/3 relative overflow-hidden rounded-3xl shadow-2xl border-2"
            style={{ borderColor: `${settings.accentColor}40` }}
          >
            {galleryItems.length > 3 ? (
              galleryItems.map((item, idx) => (
                <div
                  key={idx}
                  className="absolute inset-0 transition-opacity duration-1000"
                  style={{
                    opacity: idx === currentGalleryIndex ? 1 : 0,
                    zIndex: idx === currentGalleryIndex ? 1 : 0,
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.caption}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))
            ) : (
              <img
                src={displayItems[0].image}
                alt={displayItems[0].caption}
                className="w-full h-full object-cover"
              />
            )}

            <div
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
              style={{ zIndex: 2 }}
            />
            <div
              className="absolute bottom-0 left-0 right-0 p-8"
              style={{ zIndex: 3 }}
            >
              <h3 className="text-4xl font-black text-white mb-2 drop-shadow-2xl">
                {galleryItems.length > 3
                  ? galleryItems[currentGalleryIndex].caption
                  : displayItems[0].caption}
              </h3>
              <p className="text-xl text-white/90 font-medium drop-shadow-lg">
                Modern equipment & compassionate care
              </p>
            </div>

            {galleryItems.length > 3 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                {galleryItems.map((_, idx) => (
                  <div
                    key={idx}
                    className="w-2 h-2 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor:
                        idx === currentGalleryIndex
                          ? settings.accentColor
                          : "rgba(255,255,255,0.5)",
                      width: idx === currentGalleryIndex ? "24px" : "8px",
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 flex gap-6">
            {displayItems.slice(1, 3).map((item, idx) => (
              <div
                key={idx}
                className="flex-1 relative overflow-hidden rounded-2xl shadow-xl border-2 group hover:scale-[1.02] transition-transform duration-300"
                style={{ borderColor: `${settings.accentColor}40` }}
              >
                <img
                  src={item.image}
                  alt={item.caption}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-2xl font-bold text-white drop-shadow-lg">
                    {item.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      );
    }
  };

  return (
    <div
      className="fixed inset-0 w-full h-full overflow-hidden"
      style={{ backgroundColor: settings.primaryColor }}
    >
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

      <div className="relative z-20 h-full flex flex-col">
        <div className="bg-black/50 backdrop-blur-xl border-b border-white/20 shadow-2xl">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-5">
              {settings.hospitalLogo && (
                <img
                  src={settings.hospitalLogo}
                  alt="Hospital Logo"
                  className="w-24 h-24 object-contain drop-shadow-2xl"
                />
              )}
              <div>
                <h1 className="text-6xl font-black text-white drop-shadow-2xl tracking-tight">
                  {settings.hospitalName}
                </h1>
              </div>
            </div>

            <div className="text-right">
              <div
                className="text-7xl font-black drop-shadow-2xl tracking-tight"
                style={{ color: settings.accentColor }}
              >
                {formatTime(currentTime)}
              </div>
              <div
                className="text-4xl font-semibold drop-shadow-lg mt-1 tracking-wide"
                style={{ color: settings.accentColor, opacity: 0.9 }}
              >
                {formatDate(currentTime)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex gap-8 px-8 pb-8 pt-8 overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden">
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
                                  <span className="text-white text-lg">🩺</span>
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
          </div>

          <div className="flex-1 flex flex-col gap-6 overflow-hidden">
            {renderGallery()}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component
export default function HospitalTemplate({
  customization,
}: {
  customization: HospitalCustomization;
}) {
  const layout = customization.layout || "Authentic";

  if (layout === "Authentic") {
    return <HospitalTemplateAuthentic customization={customization} />;
  }

  return <div>Advanced layout not implemented in this artifact</div>;
}
