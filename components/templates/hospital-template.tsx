import React, { useState, useEffect, useRef } from "react";
import { Heart, Award, Calendar } from "lucide-react";
import AppointmentReminders from "./components/hospital/AppointmentReminders";
import { ScheduleSlider } from "./components/hospital/ScheduleSlider";
import HospitalTemplateAuthentic from "./hospital-template-authentic";
import Image from "next/image";

interface Doctor {
  name: string;
  specialty: string;
  experience: string;
  image: string;
  available: string;
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
  galleryImages: string[];
}

interface HospitalTemplateProps {
  customization: HospitalCustomization;
  backgroundStyle: React.CSSProperties;
}

// Advanced Template Component (the original one)
function HospitalTemplateAdvanced({
  customization,
  backgroundStyle,
}: HospitalTemplateProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentDoctor, setCurrentDoctor] = useState(0);
  const [currentLeftSlide, setCurrentLeftSlide] = useState(0);
  const [currentRightSlide, setCurrentRightSlide] = useState(0);

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
    leftComponent: customization.leftComponent || "doctors",
    rightComponent: customization.rightComponent || "appointments",
    enableSlideshow: customization.enableSlideshow || false,
    slideshowSpeed: customization.slideshowSpeed || 10000,
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

  const appointments = customization.appointments || [
    {
      id: "1",
      patientName: "John Smith",
      doctorName: "Dr. Sarah Johnson",
      specialty: "Cardiology",
      time: "10:30 AM",
      room: "101",
      appointmentDate: new Date(Date.now() + 15 * 60000),
      priority: "urgent" as const,
    },
    {
      id: "2",
      patientName: "Emma Wilson",
      doctorName: "Dr. Michael Chen",
      specialty: "Neurology",
      time: "11:00 AM",
      room: "202",
      appointmentDate: new Date(Date.now() + 45 * 60000),
      priority: "normal" as const,
    },
  ];

  const doctorSchedules = customization.doctorSchedules || [];

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

  // Slideshow for left component
  useEffect(() => {
    if (!settings.enableSlideshow) return;
    const components = ["doctors", "appointments", "schedules"];
    const interval = setInterval(() => {
      setCurrentLeftSlide((prev) => (prev + 1) % components.length);
    }, settings.slideshowSpeed);
    return () => clearInterval(interval);
  }, [settings.enableSlideshow, settings.slideshowSpeed]);

  // Slideshow for right component
  useEffect(() => {
    if (!settings.enableSlideshow) return;
    const components = ["doctors", "appointments", "schedules"];
    const interval = setInterval(() => {
      setCurrentRightSlide((prev) => (prev + 1) % components.length);
    }, settings.slideshowSpeed);
    return () => clearInterval(interval);
  }, [settings.enableSlideshow, settings.slideshowSpeed]);

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

  const dynamicBackgroundStyle = settings.backgroundImage
    ? {
        ...backgroundStyle,
        backgroundImage: `url(${settings.backgroundImage})`,
      }
    : backgroundStyle;

  // Doctor Carousel Component
  const DoctorCarousel = () => (
    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/20 shadow-2xl h-full flex flex-col justify-center">
      <div className="relative p-8">
        <div
          className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 -mr-20 -mt-20"
          style={{ backgroundColor: settings.primaryColor }}
        ></div>
        <div
          className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10 -ml-16 -mb-16"
          style={{ backgroundColor: settings.secondaryColor }}
        ></div>

        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div
                className="absolute -inset-3 rounded-full opacity-50 blur-2xl animate-pulse"
                style={{
                  background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})`,
                }}
              ></div>

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

              <div
                className="absolute bottom-2 right-2 w-12 h-12 rounded-full border-4 border-black/30 flex items-center justify-center shadow-lg"
                style={{ backgroundColor: "#10b981" }}
              >
                <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

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
                    idx === currentDoctor ? settings.primaryColor : "#64748b",
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Get component based on type
  const getComponent = (type: string) => {
    switch (type) {
      case "doctors":
        return doctors.length > 0 ? <DoctorCarousel /> : null;
      case "appointments":
        return (
          <AppointmentReminders
            appointments={appointments}
            primaryColor={settings.primaryColor}
            secondaryColor={settings.secondaryColor}
            accentColor={settings.accentColor}
          />
        );
      case "schedules":
        return (
          <ScheduleSlider schedules={doctorSchedules} settings={settings} />
        );
      default:
        return null;
    }
  };

  // Determine which component to show
  const leftComponentToShow = settings.enableSlideshow
    ? ["doctors", "appointments", "schedules"][currentLeftSlide]
    : settings.leftComponent;

  const rightComponentToShow = settings.enableSlideshow
    ? ["doctors", "appointments", "schedules"][currentRightSlide]
    : settings.rightComponent;

  return (
    <div
      className="w-full h-full relative overflow-hidden"
      style={dynamicBackgroundStyle}
    >
      {settings.backgroundImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-800/60 to-slate-900/70"></div>
      )}
      {!settings.backgroundImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      )}

      <div className="relative z-10 h-full flex flex-col">
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

        <div className="flex-1 grid grid-cols-2 gap-6 p-6 overflow-hidden min-h-0">
          <div className="flex flex-col justify-center">
            {getComponent(leftComponentToShow)}
          </div>

          <div className="flex flex-col justify-center">
            {!settings.enableSlideshow && getComponent(rightComponentToShow)}
          </div>
        </div>

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

// Main HospitalTemplate component that switches between layouts
export function HospitalTemplate({
  customization,
  backgroundStyle,
}: HospitalTemplateProps) {
  const layout = customization.layout || "Authentic";

  if (layout === "Authentic") {
    // Transform galleryImages to galleryItems if needed (backward compatibility)
    let galleryItems = customization.galleryItems || [];

    // If galleryItems is empty but galleryImages exists, convert it WITHOUT captions
    if (
      galleryItems.length === 0 &&
      customization.galleryImages &&
      customization.galleryImages.length > 0
    ) {
      galleryItems = customization.galleryImages.map((image) => ({
        image,
        caption: "", // Empty caption - won't show overlay
      }));
    }

    const authenticCustomization = {
      ...customization,
      galleryItems,
    };

    return (
      <div>
        {/* <pre>{JSON.stringify(authenticCustomization, null, 2)}</pre> */}
        <HospitalTemplateAuthentic
          customization={authenticCustomization}
          backgroundStyle={backgroundStyle}
        />
      </div>
    );
  }

  return (
    <HospitalTemplateAdvanced
      customization={customization}
      backgroundStyle={backgroundStyle}
    />
  );
}
