import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Phone,
  MapPin,
  Calendar,
  Award,
  GraduationCap,
  Users,
} from "lucide-react";

// ============================================================================
// QUICK NAVIGATION COMPONENT
// ============================================================================
const QuickNav = ({ doctors, activeIndex, onNavigate }) => {
  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed left-0 top-1/2 -translate-y-1/2 z-40 hidden lg:block">
        <div className="flex flex-col gap-3">
          {doctors.map((doctor, idx) => {
            const isActive = activeIndex === idx;
            const colors = [
              {
                bg: "bg-green-500",
                hover: "hover:bg-green-600",
                shadow: "shadow-green-500/50",
              },
              {
                bg: "bg-cyan-500",
                hover: "hover:bg-cyan-600",
                shadow: "shadow-cyan-500/50",
              },
              {
                bg: "bg-purple-500",
                hover: "hover:bg-purple-600",
                shadow: "shadow-purple-500/50",
              },
              {
                bg: "bg-yellow-500",
                hover: "hover:bg-yellow-600",
                shadow: "shadow-yellow-500/50",
              },
            ];
            const color = colors[idx % colors.length];

            return (
              <button
                key={idx}
                onClick={() => onNavigate(idx)}
                className="group relative"
                aria-label={`Navigate to ${doctor.name}`}
              >
                <div
                  className={`
                    relative transition-all duration-300 ease-out
                    ${
                      isActive
                        ? "translate-x-0"
                        : "-translate-x-[55%] group-hover:translate-x-0"
                    }
                  `}
                >
                  <div
                    className={`
                      relative rounded-r-lg
                      ${color.bg} ${color.hover}
                      text-white font-bold text-sm
                      shadow-lg ${isActive ? color.shadow : ""}
                      transition-all duration-300
                      flex items-center justify-center
                      ${
                        isActive
                          ? "w-14 h-32"
                          : "w-12 h-24 group-hover:w-10 group-hover:h-32"
                      }
                    `}
                  >
                    <span
                      className={`
                        transition-opacity duration-300
                        ${
                          isActive
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                        }
                      `}
                      style={{
                        writingMode: "vertical-rl",
                        textOrientation: "mixed",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Dr. {doctor.name.split(" ")[0]}
                    </span>

                    {isActive && (
                      <div className="absolute top-3 right-3 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    )}

                    {!isActive && (
                      <div className="w-1 h-8 bg-white/50 rounded-full group-hover:opacity-0 transition-opacity"></div>
                    )}
                  </div>

                  <div
                    className={`
                      absolute inset-0 rounded-r-lg -z-10
                      ${color.bg} opacity-50 blur-md
                      ${
                        isActive
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-50"
                      }
                      transition-opacity duration-300
                    `}
                  ></div>
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Navigation - Dots */}
      <nav className="fixed right-4 top-1/2 -translate-y-1/2 z-40 lg:hidden">
        <div className="flex flex-col gap-4">
          {doctors.map((doctor, idx) => {
            const isActive = activeIndex === idx;
            const colors = [
              "bg-green-500",
              "bg-cyan-500",
              "bg-purple-500",
              "bg-yellow-500",
            ];
            const color = colors[idx % colors.length];

            return (
              <button
                key={idx}
                onClick={() => onNavigate(idx)}
                className="group relative"
                aria-label={`Navigate to ${doctor.name}`}
              >
                <div
                  className={`
                    w-4 h-4 rounded-full transition-all duration-300
                    ${color}
                    ${
                      isActive
                        ? "ring-4 ring-white shadow-lg scale-125"
                        : "scale-100"
                    }
                    group-hover:scale-125
                  `}
                ></div>

                <div
                  className="absolute right-8 top-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg px-3 py-2 whitespace-nowrap text-sm font-semibold opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 border-2 border-gray-300"
                  style={{ transform: "translateY(-50%) translateX(-8px)" }}
                >
                  <span className="text-gray-700">{doctor.name}</span>
                  <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-l-[6px] border-y-[6px] border-y-transparent border-l-gray-300"></div>
                </div>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

// ============================================================================
// ENHANCED DOCTOR SLIDESHOW COMPONENT
// ============================================================================
export default function DoctorSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideIn, setSlideIn] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const doctors = [
    {
      name: "Sarah Johnson",
      specialty: "Cardiology",
      rating: 4.9,
      education: "MD, Harvard Medical School",
      experience: "15+ Years",
      patients: "5,000+",
      specializations: ["Heart Disease", "Hypertension", "Preventive Care"],
      availability: "Mon-Fri, 9 AM - 5 PM",
      phone: "+1 (555) 123-4567",
      location: "New York, NY",
      achievements: ["Top Doctor 2023", "Published 50+ Papers"],
      image:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop",
    },
    {
      name: "Michael Chen",
      specialty: "Neurology",
      rating: 4.8,
      education: "MD, Johns Hopkins University",
      experience: "12+ Years",
      patients: "4,200+",
      specializations: ["Brain Disorders", "Epilepsy", "Stroke Treatment"],
      availability: "Mon-Thu, 10 AM - 6 PM",
      phone: "+1 (555) 234-5678",
      location: "San Francisco, CA",
      achievements: ["Research Excellence Award", "Best Neurologist 2022"],
      image:
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop",
    },
    {
      name: "Emily Rodriguez",
      specialty: "Pediatrics",
      rating: 5.0,
      education: "MD, Stanford Medical School",
      experience: "10+ Years",
      patients: "6,500+",
      specializations: ["Child Care", "Immunization", "Growth Development"],
      availability: "Mon-Sat, 8 AM - 4 PM",
      phone: "+1 (555) 345-6789",
      location: "Los Angeles, CA",
      achievements: ["Excellence in Patient Care", "Community Service Award"],
      image:
        "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop",
    },
    {
      name: "David Williams",
      specialty: "Orthopedics",
      rating: 4.7,
      education: "MD, Mayo Clinic School",
      experience: "18+ Years",
      patients: "7,800+",
      specializations: ["Joint Surgery", "Sports Medicine", "Trauma Care"],
      availability: "Tue-Fri, 9 AM - 5 PM",
      phone: "+1 (555) 456-7890",
      location: "Chicago, IL",
      achievements: ["Surgical Innovation Award", "Top Orthopedic Surgeon"],
      image:
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop",
    },
  ];

  const currentDoctor = doctors[currentIndex];

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      handleNext();
    }, 8000);

    return () => clearInterval(interval);
  }, [currentIndex, isPaused]);

  const handleNavigate = (index) => {
    setSlideIn(false);
    setTimeout(() => {
      setCurrentIndex(index);
      setSlideIn(true);
    }, 300);
  };

  const handlePrevious = () => {
    setSlideIn(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === 0 ? doctors.length - 1 : prev - 1));
      setSlideIn(true);
    }, 300);
  };

  const handleNext = () => {
    setSlideIn(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % doctors.length);
      setSlideIn(true);
    }, 300);
  };

  return (
    <div
      className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <QuickNav
        doctors={doctors}
        activeIndex={currentIndex}
        onNavigate={handleNavigate}
      />

      <div
        className={`w-full max-w-7xl bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden transition-all duration-700 ${
          slideIn ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="grid lg:grid-cols-5 min-h-[600px]">
          {/* Left side - Doctor Image & Rating */}
          <div className="lg:col-span-2 bg-gradient-to-br from-white/20 to-white/5 flex flex-col items-center justify-center relative overflow-hidden p-8">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

            {/* Decorative Elements */}
            <div className="absolute top-10 left-10 w-20 h-20 border-4 border-white/20 rounded-full"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 border-4 border-yellow-400/20 rounded-full"></div>

            {/* Doctor Photo */}
            <div className="relative z-10 text-center">
              <div className="w-72 h-72 rounded-full flex items-center justify-center mb-6 mx-auto backdrop-blur-sm border-8 border-white/40 shadow-2xl overflow-hidden bg-gradient-to-br from-white/20 to-white/10 p-2">
                <div className="w-full h-full rounded-full overflow-hidden">
                  <img
                    src={currentDoctor.image}
                    alt={currentDoctor.name}
                    className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>

              {/* Rating Badge */}
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 backdrop-blur-md rounded-2xl px-8 py-4 inline-block shadow-xl">
                <div className="flex items-center justify-center gap-3">
                  <Star className="w-8 h-8 fill-white text-white" />
                  <span className="text-white text-4xl font-bold">
                    {currentDoctor.rating}
                  </span>
                  <span className="text-white/90 text-lg">/ 5.0</span>
                </div>
                <div className="text-white text-sm font-semibold mt-1">
                  Patient Rating
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Doctor Information */}
          <div className="lg:col-span-3 p-8 lg:p-12 flex flex-col justify-center bg-gradient-to-br from-black/40 to-black/60 backdrop-blur-sm">
            <div className="mb-8">
              <div className="inline-block bg-gradient-to-r from-amber-400 to-yellow-500 px-4 py-2 rounded-lg text-sm font-bold text-white mb-4 shadow-lg">
                Meet Your Doctor
              </div>

              <h2
                className="text-5xl lg:text-6xl font-bold mb-4 text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
                style={{ textShadow: "0 0 30px rgba(255,255,255,0.3)" }}
              >
                Dr. {currentDoctor.name}
              </h2>

              <div className="inline-block bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl text-2xl font-semibold mb-6 shadow-lg">
                {currentDoctor.specialty}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Education */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 hover:bg-white/20 transition-all duration-300 border border-white/20">
                <div className="flex items-center gap-3 mb-3">
                  <GraduationCap className="w-5 h-5 text-yellow-400" />
                  <div className="text-sm font-semibold text-yellow-400">
                    Education
                  </div>
                </div>
                <div className="text-lg text-white">
                  {currentDoctor.education}
                </div>
              </div>

              {/* Experience */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 hover:bg-white/20 transition-all duration-300 border border-white/20">
                <div className="flex items-center gap-3 mb-3">
                  <Award className="w-5 h-5 text-cyan-400" />
                  <div className="text-sm font-semibold text-cyan-400">
                    Experience
                  </div>
                </div>
                <div className="text-lg text-white">
                  {currentDoctor.experience}
                </div>
              </div>

              {/* Patients */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 hover:bg-white/20 transition-all duration-300 border border-white/20">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-5 h-5 text-green-400" />
                  <div className="text-sm font-semibold text-green-400">
                    Patients Treated
                  </div>
                </div>
                <div className="text-lg text-white">
                  {currentDoctor.patients}
                </div>
              </div>

              {/* Availability */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 hover:bg-white/20 transition-all duration-300 border border-white/20">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  <div className="text-sm font-semibold text-purple-400">
                    Availability
                  </div>
                </div>
                <div className="text-lg text-white">
                  {currentDoctor.availability}
                </div>
              </div>
            </div>

            {/* Specializations */}
            <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
              <div className="text-sm font-semibold mb-3 text-white flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                Specializations
              </div>
              <div className="flex flex-wrap gap-2">
                {currentDoctor.specializations.map((spec, idx) => (
                  <span
                    key={idx}
                    className="bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-sm px-4 py-2 rounded-lg text-sm text-white border border-white/20 hover:scale-105 transition-transform"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-green-400" />
                  <div className="text-xs font-semibold text-gray-300">
                    Phone
                  </div>
                </div>
                <div className="text-sm text-white font-medium">
                  {currentDoctor.phone}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-red-400" />
                  <div className="text-xs font-semibold text-gray-300">
                    Location
                  </div>
                </div>
                <div className="text-sm text-white font-medium">
                  {currentDoctor.location}
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="flex flex-wrap gap-2">
                {currentDoctor.achievements.map((achievement, idx) => (
                  <span
                    key={idx}
                    className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm px-4 py-2 rounded-lg text-xs flex items-center gap-2 text-yellow-300 border border-yellow-500/30"
                  >
                    <Award className="w-4 h-4" />
                    {achievement}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="absolute bottom-8 right-8 flex gap-3 z-20">
          <button
            onClick={handlePrevious}
            className="w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-all shadow-xl border border-white/20 hover:scale-110"
            aria-label="Previous doctor"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-all shadow-xl border border-white/20 hover:scale-110"
            aria-label="Next doctor"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Dots */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
          {doctors.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleNavigate(idx)}
              className={`h-3 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? "bg-white w-12 shadow-lg"
                  : "bg-white/40 w-3 hover:bg-white/60"
              }`}
              aria-label={`Go to doctor ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
