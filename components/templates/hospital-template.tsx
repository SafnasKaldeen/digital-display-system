import React, { useState, useEffect } from "react";
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  Award,
  Calendar,
  Clock,
  MapPin,
} from "lucide-react";

interface HospitalCustomization {
  hospitalName: string;
  tagline: string;
  hospitalLogo: string;
  backgroundImage: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  tickerMessage: string;
  tickerRightMessage: string;
  doctorRotationSpeed: number;
  departmentInfo: string;
  emergencyContact: string;
  doctors: Array<{
    name: string;
    specialty: string;
    experience: string;
    image: string;
    available: string;
  }>;
  doctorSchedules: Array<{
    name: string;
    specialty: string;
    time: string;
    room: string;
  }>;
}

interface HospitalTemplateProps {
  customization: HospitalCustomization;
  backgroundStyle: React.CSSProperties;
}

// Vertical Schedule Slider Component
const ScheduleSlider = ({ schedules, settings }: any) => {
  const [isHovered, setIsHovered] = useState(false);

  if (schedules.length === 0) {
    return (
      <div className="text-center text-gray-300 py-8 text-xl">
        No scheduled appointments today
      </div>
    );
  }

  // Fixed dimensions for consistency
  const visibleHeight = 520;
  const itemHeight = 140; // Increased for larger text
  const needsScroll = schedules.length > 3; // Show scroll if more than 3 items

  // Animation duration based on number of items (slower = smoother)
  const baseDuration = needsScroll ? schedules.length * 5 : 0; // 5 seconds per item
  const currentDuration = isHovered ? baseDuration * 3 : baseDuration; // 3x slower on hover

  return (
    <div
      className="relative overflow-hidden"
      style={{ height: `${visibleHeight}px` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Fade out effect at top - only show when scrolling */}
      {needsScroll && (
        <div
          className="absolute top-0 left-0 right-0 h-32 pointer-events-none z-10"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)",
          }}
        />
      )}

      {/* Fade out effect at bottom - only show when scrolling */}
      {needsScroll && (
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-10"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)",
          }}
        />
      )}

      <div
        className="flex flex-col gap-5"
        style={{
          animation: needsScroll
            ? `slideUp ${currentDuration}s linear infinite`
            : "none",
        }}
      >
        {/* First set of schedules */}
        {schedules.map((schedule: any, idx: number) => (
          <div
            key={`first-${idx}`}
            className="relative rounded-2xl p-6 border-2 border-white/30 flex-shrink-0 transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg group"
            style={{ minHeight: `${itemHeight - 20}px` }}
          >
            {/* Subtle glow effect on hover */}
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"
              style={{
                background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})`,
              }}
            />

            <div className="relative flex items-center justify-between gap-6">
              <div className="flex-1 min-w-0">
                <h4 className="text-2xl font-bold text-white mb-2 truncate">
                  {schedule.name}
                </h4>
                <div
                  className="inline-block px-5 py-2 rounded-full text-base font-semibold text-white shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})`,
                  }}
                >
                  {schedule.specialty}
                </div>
              </div>
              <div className="text-right flex-shrink-0 space-y-2">
                <div className="flex items-center justify-end gap-2">
                  <Clock
                    className="w-6 h-6"
                    style={{ color: settings.accentColor }}
                  />
                  <div
                    className="text-2xl font-bold"
                    style={{ color: settings.accentColor }}
                  >
                    {schedule.time}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <MapPin className="w-5 h-5 text-white" />
                  <div className="text-xl font-semibold text-white">
                    Room {schedule.room}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Duplicate set for seamless loop - only when scrolling */}
        {needsScroll &&
          schedules.map((schedule: any, idx: number) => (
            <div
              key={`second-${idx}`}
              className="relative rounded-2xl p-6 border-2 border-white/30 flex-shrink-0 transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg group"
              style={{ minHeight: `${itemHeight - 20}px` }}
            >
              {/* Subtle glow effect on hover */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"
                style={{
                  background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})`,
                }}
              />

              <div className="relative flex items-center justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <h4 className="text-2xl font-bold text-white mb-2 truncate">
                    {schedule.name}
                  </h4>
                  <div
                    className="inline-block px-5 py-2 rounded-full text-base font-semibold text-white shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})`,
                    }}
                  >
                    {schedule.specialty}
                  </div>
                </div>
                <div className="text-right flex-shrink-0 space-y-2">
                  <div className="flex items-center justify-end gap-2">
                    <Clock
                      className="w-6 h-6"
                      style={{ color: settings.accentColor }}
                    />
                    <div
                      className="text-2xl font-bold"
                      style={{ color: settings.accentColor }}
                    >
                      {schedule.time}
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <MapPin className="w-5 h-5 text-white" />
                    <div className="text-xl font-semibold text-white">
                      Room {schedule.room}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      <style>{`
        @keyframes slideUp {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
      `}</style>
    </div>
  );
};

export function HospitalTemplate({
  customization,
  backgroundStyle,
}: HospitalTemplateProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentDoctor, setCurrentDoctor] = useState(0);

  const settings = {
    hospitalName: customization.hospitalName || "MediTech Hospital",
    tagline: customization.tagline || "Excellence in Healthcare Since 1995",
    hospitalLogo: customization.hospitalLogo || "",
    backgroundImage: customization.backgroundImage || "",
    primaryColor: customization.primaryColor || "#06b6d4",
    secondaryColor: customization.secondaryColor || "#14b8a6",
    accentColor: customization.accentColor || "#f59e0b",
    tickerMessage:
      customization.tickerMessage ||
      "⚕️ Quality Healthcare • Compassionate Service • Advanced Technology",
    tickerRightMessage:
      customization.tickerRightMessage || "Your Health, Our Priority",
    doctorRotationSpeed: customization.doctorRotationSpeed || 6000,
    departmentInfo: customization.departmentInfo || "Emergency Department",
    emergencyContact: customization.emergencyContact || "911",
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
              "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop",
            available: "Mon-Fri, 9 AM - 5 PM",
          },
          {
            name: "Dr. Michael Chen",
            specialty: "Neurology",
            experience: "12+ Years",
            image:
              "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop",
            available: "Mon-Thu, 10 AM - 6 PM",
          },
          {
            name: "Dr. Emily Rodriguez",
            specialty: "Pediatrics",
            experience: "10+ Years",
            image:
              "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=300&h=300&fit=crop",
            available: "Mon-Sat, 8 AM - 4 PM",
          },
        ];

  const doctorSchedules = customization.doctorSchedules || [];

  const MockSchedules = [
    {
      name: "Dr. Sarah Johnson",
      specialty: "Cardiology",
      time: "09:00 AM",
      room: "101",
    },
    {
      name: "Dr. Michael Chen",
      specialty: "Neurology",
      time: "10:30 AM",
      room: "202",
    },
    {
      name: "Dr. Emily Rodriguez",
      specialty: "Pediatrics",
      time: "11:15 AM",
      room: "303",
    },
    {
      name: "Dr. Sarah Johnson",
      specialty: "Cardiology",
      time: "01:00 PM",
      room: "101",
    },
    {
      name: "Dr. Michael Chen",
      specialty: "Neurology",
      time: "02:30 PM",
      room: "202",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (doctors.length === 0) return;
    const interval = setInterval(() => {
      setCurrentDoctor((prev) => (prev + 1) % doctors.length);
    }, settings.doctorRotationSpeed);
    return () => clearInterval(interval);
  }, [doctors.length, settings.doctorRotationSpeed]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
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

  const nextDoctor = () => {
    if (doctors.length === 0) return;
    setCurrentDoctor((prev) => (prev + 1) % doctors.length);
  };

  const prevDoctor = () => {
    if (doctors.length === 0) return;
    setCurrentDoctor((prev) => (prev - 1 + doctors.length) % doctors.length);
  };

  const dynamicBackgroundStyle = settings.backgroundImage
    ? {
        ...backgroundStyle,
        backgroundImage: `url(${settings.backgroundImage})`,
      }
    : backgroundStyle;

  return (
    <div
      className="w-full h-full relative overflow-hidden"
      style={dynamicBackgroundStyle}
    >
      {/* Dark overlay */}
      {settings.backgroundImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-800/60 to-slate-900/70"></div>
      )}
      {!settings.backgroundImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      )}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Top Header Bar */}
        <header
          className="bg-black/60 backdrop-blur-md border-b-2 px-8 py-5"
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
              <div className="text-base text-gray-300">
                {formatDate(currentTime)}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area - 2 Columns */}
        <div className="flex-1 grid grid-cols-2 gap-6 p-6 overflow-hidden min-h-0">
          {/* Left Panel - Enhanced Doctor Carousel */}
          <div className="flex flex-col justify-center">
            {doctors.length > 0 && (
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/20 shadow-2xl">
                {/* Doctor Card */}
                <div className="relative p-8">
                  {/* Decorative Background Elements */}
                  <div
                    className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 -mr-20 -mt-20"
                    style={{ backgroundColor: settings.primaryColor }}
                  ></div>
                  <div
                    className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10 -ml-16 -mb-16"
                    style={{ backgroundColor: settings.secondaryColor }}
                  ></div>

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Avatar with Glow Effect */}
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        {/* Glow effect */}
                        <div
                          className="absolute -inset-3 rounded-full opacity-50 blur-2xl animate-pulse"
                          style={{
                            background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})`,
                          }}
                        ></div>

                        {/* Avatar container */}
                        <div
                          className="relative w-48 h-48 rounded-full p-1.5 shadow-2xl"
                          style={{
                            background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})`,
                          }}
                        >
                          <img
                            src={doctors[currentDoctor].image}
                            alt={doctors[currentDoctor].name}
                            className="w-full h-full rounded-full object-cover border-4 border-black/20"
                          />
                        </div>

                        {/* Online Status Indicator */}
                        <div
                          className="absolute bottom-2 right-2 w-12 h-12 rounded-full border-4 border-black/30 flex items-center justify-center shadow-lg"
                          style={{ backgroundColor: "#10b981" }}
                        >
                          <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>

                    {/* Doctor Info */}
                    <div className="text-center mb-6">
                      <h3 className="text-3xl font-bold text-white mb-3 tracking-wide">
                        {doctors[currentDoctor].name}
                      </h3>
                      <div
                        className="inline-block px-6 py-2.5 rounded-full text-lg font-bold text-white shadow-lg"
                        style={{
                          background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})`,
                        }}
                      >
                        {doctors[currentDoctor].specialty}
                      </div>
                    </div>

                    {/* Details with Icons */}
                    <div className="space-y-3 max-w-md mx-auto">
                      <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl py-3 px-5 border border-white/10">
                        <Award
                          className="w-6 h-6 flex-shrink-0"
                          style={{ color: settings.accentColor }}
                        />
                        <span className="font-medium text-white text-lg">
                          {doctors[currentDoctor].experience} Experience
                        </span>
                      </div>

                      <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl py-3 px-5 border border-white/10">
                        <Calendar
                          className="w-6 h-6 flex-shrink-0"
                          style={{ color: settings.primaryColor }}
                        />
                        <span className="font-medium text-white text-lg">
                          {doctors[currentDoctor].available}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dots Indicator */}
                {doctors.length > 1 && (
                  <div className="bg-black/20 backdrop-blur-sm px-8 py-5 border-t border-white/10">
                    <div className="flex justify-center gap-2.5">
                      {doctors.map((_, idx) => (
                        <div
                          key={idx}
                          className="transition-all duration-300 rounded-full"
                          style={{
                            width: idx === currentDoctor ? "32px" : "12px",
                            height: "12px",
                            backgroundColor:
                              idx === currentDoctor
                                ? settings.primaryColor
                                : "#64748b",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel - Doctor Schedules with Vertical Slider */}
          <div className="flex flex-col justify-center">
            <div className="bg-black/40 backdrop-blur-md rounded-3xl p-8 border-2 border-white/30 shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">
                Today's Schedule
              </h2>

              <div className="mb-6 text-center space-y-2">
                <div className="text-lg text-gray-300">
                  {settings.departmentInfo}
                </div>
                <div
                  className="text-xl font-semibold"
                  style={{ color: settings.accentColor }}
                >
                  Emergency: {settings.emergencyContact}
                </div>
              </div>

              <ScheduleSlider schedules={doctorSchedules} settings={settings} />
            </div>
          </div>
        </div>

        {/* Bottom Ticker */}
        <div
          className="bg-black/60 backdrop-blur-md border-t-2 px-8 py-3"
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
    </div>
  );
}
