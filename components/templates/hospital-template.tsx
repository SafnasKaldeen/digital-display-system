import React, { useState, useEffect } from "react";

// Configuration JSON - Edit this to customize the display
const CONFIG = {
  hospital: {
    name: "OLIVIA MEDICAL CENTER",
    tagline: "Excellence in Healthcare Since 1995",
    address: "123 Medical Plaza, Healthcare District, City 12345",
    emergencyNumber: "911",
    website: "www.oliviamedical.com",
    email: "info@oliviamedical.com",
    phone: "+1 (555) 123-4567",
  },

  theme: {
    primaryColor: "#2563eb",
    secondaryColor: "#7c3aed",
    accentColor: "#f59e0b",
    textColor: "#ffffff",
    backgroundColor: "#1e293b",
    font: "Inter, system-ui, sans-serif",
  },

  features: {
    showDoctorProfiles: true,
    showQueueNumbers: true,
    showWeather: true,
    showTestimonials: true,
    showHealthTips: true,
    showNewsticker: true,
    showFacilities: true,
    enableParticles: true,
    enableVideoBackground: false,
    showLanguageToggle: true,
    showQRCodes: true,
  },

  animations: {
    healthTipInterval: 8000,
    doctorProfileInterval: 10000,
    testimonialInterval: 10000,
    particleCount: 30,
    enableGlowEffects: true,
    enableParallax: true,
  },

  visitingHours: {
    morning: "8:00 AM - 11:00 AM",
    evening: "4:00 PM - 7:00 PM",
  },
};

// Mock Data
const MOCK_DATA = {
  appointments: [
    {
      title: "Dr. Sarah Johnson - Cardiologist",
      time: "9:00 AM - 2:00 PM",
      days: "Mon, Wed, Fri",
      status: "Available",
    },
    {
      title: "Dr. Michael Chen - Neurologist",
      time: "10:00 AM - 4:00 PM",
      days: "Tue, Thu",
      status: "Busy",
    },
    {
      title: "Dr. Emily Rodriguez - Pediatrician",
      time: "8:00 AM - 6:00 PM",
      days: "Mon - Fri",
      status: "Available",
    },
    {
      title: "Dr. James Wilson - Orthopedic",
      time: "2:00 PM - 7:00 PM",
      days: "Mon - Sat",
      status: "Available",
    },
    {
      title: "Dr. Lisa Brown - Dermatologist",
      time: "11:00 AM - 5:00 PM",
      days: "Wed, Fri, Sat",
      status: "Next: 3:00 PM",
    },
    {
      title: "Dr. Robert Taylor - ENT Specialist",
      time: "9:00 AM - 3:00 PM",
      days: "Mon, Thu",
      status: "Available",
    },
    {
      title: "Dr. Maria Garcia - Gynecologist",
      time: "1:00 PM - 6:00 PM",
      days: "Tue, Wed, Fri",
      status: "Available",
    },
    {
      title: "Dr. David Lee - General Physician",
      time: "8:00 AM - 8:00 PM",
      days: "Daily",
      status: "Available",
    },
  ],

  doctors: [
    {
      name: "Dr. Jessica Joan",
      specialty: "Nephrology",
      experience: "20 years",
      education: "MD, Johns Hopkins University",
      specializations: [
        "Kidney Disease",
        "Dialysis",
        "Transplant Medicine",
        "Hypertension",
      ],
      achievements: [
        "Robert L. Nobel Price",
        "Edison Awards",
        "Canadian Cancer Society",
      ],
      availability: "Mon - Fri: 9:00 AM - 6:00 PM",
      rating: 4.9,
      patients: "3000+",
      phone: "+1 (230)-369-155-23",
      email: "jessica@joan.com",
      location: "380 Albert ST, Melbourne",
      image:
        "https://health-point-nextjs-pro.vercel.app/images/doctors/jassica.jpg",
      bgColor: "from-blue-600 to-cyan-600",
    },
    {
      name: "Dr. Alexandra",
      specialty: "Gastroenterology",
      experience: "18 years",
      education: "MD, Harvard Medical School",
      specializations: [
        "Digestive Disorders",
        "Endoscopy",
        "Liver Disease",
        "IBD Treatment",
      ],
      achievements: [
        "Gastro Excellence Award 2023",
        "500+ Procedures",
        "Research Pioneer",
      ],
      availability: "Mon, Wed, Fri: 9:00 AM - 5:00 PM",
      rating: 4.9,
      patients: "4500+",
      phone: "+1 (230)-369-155-24",
      email: "alexandra@oliviamedical.com",
      location: "123 Medical Plaza, City",
      image:
        "https://health-point-nextjs-pro.vercel.app/images/doctors/alexandra.jpg",
      bgColor: "from-red-600 to-pink-600",
    },
    {
      name: "Dr. Kimberly",
      specialty: "Neurology",
      experience: "15 years",
      education: "MD, Stanford Medical School",
      specializations: [
        "Brain Surgery",
        "Epilepsy",
        "Stroke Management",
        "Parkinson's Disease",
      ],
      achievements: [
        "Excellence in Neurology 2024",
        "Research Excellence Award",
        "Brain Health Champion",
      ],
      availability: "Tue, Thu, Sat: 10:00 AM - 4:00 PM",
      rating: 4.8,
      patients: "2800+",
      phone: "+1 (230)-369-155-25",
      email: "kimberly@oliviamedical.com",
      location: "123 Medical Plaza, City",
      image:
        "https://health-point-nextjs-pro.vercel.app/images/doctors/kimberly.jpg",
      bgColor: "from-purple-600 to-indigo-600",
    },
    {
      name: "Dr. Bella Carol",
      specialty: "Obstetrics",
      experience: "12 years",
      education: "MD, Yale School of Medicine",
      specializations: [
        "Prenatal Care",
        "High-Risk Pregnancy",
        "Labor & Delivery",
        "Maternal Health",
      ],
      achievements: [
        "Best Obstetrician 2024",
        "Maternal Care Advocate",
        "Compassionate Care Award",
      ],
      availability: "Mon - Fri: 8:00 AM - 6:00 PM",
      rating: 5.0,
      patients: "5000+",
      phone: "+1 (230)-369-155-26",
      email: "bella@oliviamedical.com",
      location: "123 Medical Plaza, City",
      image:
        "https://health-point-nextjs-pro.vercel.app/images/doctors/bella.jpg",
      bgColor: "from-green-600 to-teal-600",
    },
    {
      name: "Dr. Rebecca Rose",
      specialty: "Gynecology",
      experience: "22 years",
      education: "MD, Mayo Clinic",
      specializations: [
        "Women's Health",
        "Reproductive Medicine",
        "Minimally Invasive Surgery",
        "Cancer Screening",
      ],
      achievements: [
        "Gynecology Excellence 2023",
        "1200+ Surgeries",
        "Women's Health Champion",
      ],
      availability: "Mon - Sat: 2:00 PM - 7:00 PM",
      rating: 4.9,
      patients: "4200+",
      phone: "+1 (230)-369-155-27",
      email: "rebecca@oliviamedical.com",
      location: "123 Medical Plaza, City",
      image:
        "https://health-point-nextjs-pro.vercel.app/images/doctors/rebecca.jpg",
      bgColor: "from-orange-600 to-amber-600",
    },
    {
      name: "Dr. Stephanie Sue",
      specialty: "Haematology",
      experience: "16 years",
      education: "MD, UCLA School of Medicine",
      specializations: [
        "Blood Disorders",
        "Anemia Treatment",
        "Leukemia Care",
        "Bone Marrow",
      ],
      achievements: [
        "Blood Health Expert 2024",
        "Research Excellence",
        "Haematology Innovation Prize",
      ],
      availability: "Wed, Fri, Sat: 11:00 AM - 5:00 PM",
      rating: 4.8,
      patients: "3200+",
      phone: "+1 (230)-369-155-28",
      email: "stephanie@oliviamedical.com",
      location: "123 Medical Plaza, City",
      image:
        "https://health-point-nextjs-pro.vercel.app/images/doctors/stephanie.jpg",
      bgColor: "from-pink-600 to-rose-600",
    },
    {
      name: "Dr. Penelope",
      specialty: "Physiotherapy",
      experience: "14 years",
      education: "DPT, Columbia University",
      specializations: [
        "Sports Rehabilitation",
        "Pain Management",
        "Mobility Therapy",
        "Post-Surgery Recovery",
      ],
      achievements: [
        "Physical Therapy Excellence",
        "Recovery Specialist 2023",
        "Patient Care Award",
      ],
      availability: "Mon - Thu: 7:00 AM - 3:00 PM",
      rating: 4.9,
      patients: "5500+",
      phone: "+1 (230)-369-155-29",
      email: "penelope@oliviamedical.com",
      location: "123 Medical Plaza, City",
      image:
        "https://health-point-nextjs-pro.vercel.app/images/doctors/penelope.jpg",
      bgColor: "from-indigo-600 to-blue-600",
    },
    {
      name: "Dr. Lauren Leah",
      specialty: "Oncology",
      experience: "19 years",
      education: "MD, Duke University",
      specializations: [
        "Cancer Treatment",
        "Chemotherapy",
        "Radiation Therapy",
        "Palliative Care",
      ],
      achievements: [
        "Cancer Care Excellence 2024",
        "Hope Provider",
        "Oncology Pioneer Award",
      ],
      availability: "Tue, Thu, Sat: 9:00 AM - 4:00 PM",
      rating: 4.9,
      patients: "2900+",
      phone: "+1 (230)-369-155-30",
      email: "lauren@oliviamedical.com",
      location: "123 Medical Plaza, City",
      image:
        "https://health-point-nextjs-pro.vercel.app/images/doctors/lauren-leah.jpg",
      bgColor: "from-teal-600 to-green-600",
    },
  ],

  facilities: [
    { name: "24/7 Emergency", icon: "🚑", status: "Active" },
    { name: "ICU (12 beds)", icon: "🏥", status: "4 Available" },
    { name: "Pharmacy", icon: "💊", status: "Open" },
    { name: "Laboratory", icon: "🔬", status: "Open" },
    { name: "X-Ray & CT Scan", icon: "📷", status: "Available" },
    { name: "Ambulance", icon: "🚨", status: "3 Ready" },
    { name: "Blood Bank", icon: "🩸", status: "All Groups" },
    { name: "Dialysis", icon: "⚕️", status: "6 Machines" },
    { name: "Maternity Ward", icon: "👶", status: "Open" },
  ],

  queueNumbers: [
    { department: "General OPD", current: 47, waiting: 12 },
    { department: "Cardiology", current: 23, waiting: 5 },
    { department: "Pediatrics", current: 31, waiting: 8 },
    { department: "Orthopedics", current: 15, waiting: 3 },
  ],

  healthTips: [
    {
      icon: "💧",
      tip: "Drink 8-10 glasses of water daily to stay hydrated and support kidney function",
    },
    {
      icon: "🏃",
      tip: "30 minutes of daily exercise can reduce heart disease risk by 50%",
    },
    {
      icon: "🥗",
      tip: "Eat 5 servings of fruits and vegetables daily for optimal nutrition",
    },
    {
      icon: "😴",
      tip: "Quality sleep of 7-8 hours improves memory, immune system, and mood",
    },
    {
      icon: "🧘",
      tip: "Practice deep breathing or meditation to reduce stress and lower blood pressure",
    },
  ],

  testimonials: [
    {
      patient: "John D.",
      message:
        "Excellent care during my cardiac surgery. The staff was amazing!",
      rating: 5,
    },
    {
      patient: "Maria S.",
      message: "Best pediatric care for my daughter. Highly professional team.",
      rating: 5,
    },
    {
      patient: "Robert K.",
      message: "Quick emergency response saved my life. Forever grateful!",
      rating: 5,
    },
  ],

  newsItems: [
    "🎉 New State-of-the-Art Cardiac Care Unit Now Open",
    "🏆 Awarded 'Best Hospital 2024' by Healthcare Excellence Board",
    "💉 Free Health Checkup Camp Every Sunday 9 AM - 1 PM",
    "🩺 COVID-19, Flu & Pneumonia Vaccines Available",
    "🚑 Free Ambulance Service for Senior Citizens",
    "👶 Special Neonatal ICU with 24/7 Pediatrician",
  ],

  achievements: [
    { title: "JCI Accredited", year: "2023", icon: "🏅" },
    { title: "ISO 9001 Certified", year: "2022", icon: "✅" },
    { title: "NABH Accredited", year: "2021", icon: "⭐" },
    { title: "Green Hospital", year: "2024", icon: "🌱" },
  ],
};

export default function HospitalTemplate() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [healthTipIndex, setHealthTipIndex] = useState(0);
  const [doctorIndex, setDoctorIndex] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [particles, setParticles] = useState([]);
  const [slideIn, setSlideIn] = useState(true);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Rotate health tips
  useEffect(() => {
    const interval = setInterval(() => {
      setHealthTipIndex((prev) => (prev + 1) % MOCK_DATA.healthTips.length);
    }, CONFIG.animations.healthTipInterval);
    return () => clearInterval(interval);
  }, []);

  // Rotate doctor profiles with animation
  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIn(false);
      setTimeout(() => {
        setDoctorIndex((prev) => (prev + 1) % MOCK_DATA.doctors.length);
        setSlideIn(true);
      }, 500);
    }, CONFIG.animations.doctorProfileInterval);
    return () => clearInterval(interval);
  }, []);

  // Rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % MOCK_DATA.testimonials.length);
    }, CONFIG.animations.testimonialInterval);
    return () => clearInterval(interval);
  }, []);

  // Generate floating particles
  useEffect(() => {
    if (CONFIG.features.enableParticles) {
      const newParticles = Array.from(
        { length: CONFIG.animations.particleCount },
        (_, i) => ({
          id: i,
          left: Math.random() * 100,
          duration: 15 + Math.random() * 20,
          delay: Math.random() * 10,
          size: 10 + Math.random() * 20,
        })
      );
      setParticles(newParticles);
    }
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const currentDoctor = MOCK_DATA.doctors[doctorIndex];

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{
        backgroundColor: CONFIG.theme.backgroundColor,
        fontFamily: CONFIG.theme.font,
        minHeight: "1080px",
      }}
    >
      {/* Animated Gradient Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${currentDoctor.bgColor} transition-all duration-1000`}
      ></div>

      {/* Floating Particles */}
      {CONFIG.features.enableParticles &&
        particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full opacity-20 animate-float"
            style={{
              left: `${particle.left}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: CONFIG.theme.accentColor,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
              filter: CONFIG.animations.enableGlowEffects
                ? "blur(2px)"
                : "none",
            }}
          ></div>
        ))}

      {/* Header */}
      <header
        className="relative z-10 px-8 py-6"
        style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      >
        <div className="flex items-center justify-between">
          {/* Left - Logo & Info */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl">
              <span className="text-5xl">🏥</span>
            </div>
            <div>
              <h1
                className="text-5xl font-bold mb-2"
                style={{
                  color: CONFIG.theme.textColor,
                  textShadow: CONFIG.animations.enableGlowEffects
                    ? "0 0 20px rgba(255,255,255,0.5)"
                    : "none",
                }}
              >
                {CONFIG.hospital.name}
              </h1>
              <p
                className="text-xl opacity-90"
                style={{ color: CONFIG.theme.textColor }}
              >
                {CONFIG.hospital.tagline}
              </p>
              <p
                className="text-sm opacity-75 mt-1"
                style={{ color: CONFIG.theme.textColor }}
              >
                📍 {CONFIG.hospital.address}
              </p>
            </div>
          </div>

          {/* Right - Time & Date */}
          <div className="text-right">
            <div
              className="text-5xl font-bold mb-1"
              style={{
                color: "#ffd700",
                textShadow: "0 0 20px rgba(255,215,0,0.6)",
              }}
            >
              {formatTime(currentTime)}
            </div>
            <div className="text-lg" style={{ color: CONFIG.theme.textColor }}>
              {formatDate(currentTime)}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div
        className="relative z-10 flex gap-6 px-8 py-6"
        style={{ height: "calc(100% - 240px)" }}
      >
        {/* Left Column - Queue & Appointments */}
        <div className="w-1/5 space-y-4">
          {/* Queue Numbers */}
          {CONFIG.features.showQueueNumbers && (
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 shadow-2xl">
              <h3
                className="text-xl font-bold mb-3 text-center"
                style={{ color: CONFIG.theme.accentColor }}
              >
                🎫 Live Queue
              </h3>
              <div className="space-y-2">
                {MOCK_DATA.queueNumbers.map((queue, idx) => (
                  <div key={idx} className="bg-black/30 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: CONFIG.theme.textColor }}
                      >
                        {queue.department}
                      </span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span
                        className="text-2xl font-bold"
                        style={{ color: CONFIG.theme.accentColor }}
                      >
                        #{queue.current}
                      </span>
                      <span
                        className="text-sm opacity-75"
                        style={{ color: CONFIG.theme.textColor }}
                      >
                        Waiting: {queue.waiting}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Facilities */}
          {CONFIG.features.showFacilities && (
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 shadow-2xl">
              <h3
                className="text-lg font-bold mb-3 text-center"
                style={{ color: CONFIG.theme.accentColor }}
              >
                🏥 Facilities
              </h3>
              <div className="space-y-2">
                {MOCK_DATA.facilities.slice(0, 6).map((facility, idx) => (
                  <div
                    key={idx}
                    className="bg-black/20 rounded-lg p-2 flex items-center gap-2"
                  >
                    <div className="text-2xl">{facility.icon}</div>
                    <div className="flex-1">
                      <div
                        className="text-xs font-semibold"
                        style={{ color: CONFIG.theme.textColor }}
                      >
                        {facility.name}
                      </div>
                      <div
                        className="text-xs opacity-75"
                        style={{ color: CONFIG.theme.textColor }}
                      >
                        {facility.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center Column - Featured Doctor Profile (Large) */}
        <div className="flex-1 flex items-center justify-center">
          <div
            className={`w-full h-full bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden transition-all duration-700 ${
              slideIn ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <div className="h-full flex">
              {/* Left side - Doctor Image */}
              <div className="w-2/5 bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                {/* Doctor Photo */}
                <div className="relative z-10 text-center">
                  <div className="w-80 h-80 rounded-full flex items-center justify-center mb-6 mx-auto backdrop-blur-sm border-8 border-white/40 shadow-2xl overflow-hidden bg-white/10">
                    <img
                      src={currentDoctor.image}
                      alt={currentDoctor.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                    <div className="w-full h-full items-center justify-center hidden">
                      <span className="text-9xl">👨‍⚕️</span>
                    </div>
                  </div>
                  <div className="bg-black/50 backdrop-blur-md rounded-2xl px-6 py-3 inline-block">
                    <div className="text-white text-sm font-semibold opacity-75 mb-1">
                      YOUR LOGO HERE
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-white text-2xl font-bold">
                        {currentDoctor.rating}
                      </span>
                      <span className="text-white/75 text-sm">/ 5.0</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - Doctor Information */}
              <div className="w-3/5 p-12 flex flex-col justify-center bg-gradient-to-br from-black/40 to-black/60 backdrop-blur-sm">
                <div className="mb-8">
                  <div
                    className="text-2xl font-semibold mb-3"
                    style={{ color: CONFIG.theme.accentColor }}
                  >
                    Meet Your Doctor
                  </div>
                  <h2
                    className="text-6xl font-bold mb-4"
                    style={{
                      color: CONFIG.theme.textColor,
                      textShadow: "0 0 30px rgba(255,255,255,0.3)",
                    }}
                  >
                    {currentDoctor.name}
                  </h2>
                  <div className="bg-blue-600 text-white px-6 py-3 rounded-xl inline-block text-2xl font-semibold mb-6">
                    {currentDoctor.specialty}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div
                      className="text-sm font-semibold mb-2 opacity-75"
                      style={{ color: CONFIG.theme.textColor }}
                    >
                      📚 Education
                    </div>
                    <div
                      className="text-lg"
                      style={{ color: CONFIG.theme.textColor }}
                    >
                      {currentDoctor.education}
                    </div>
                  </div>

                  <div>
                    <div
                      className="text-sm font-semibold mb-2 opacity-75"
                      style={{ color: CONFIG.theme.textColor }}
                    >
                      🎓 Experience
                    </div>
                    <div
                      className="text-lg"
                      style={{ color: CONFIG.theme.textColor }}
                    >
                      {currentDoctor.experience} | {currentDoctor.patients}{" "}
                      Patients Treated
                    </div>
                  </div>

                  <div>
                    <div
                      className="text-sm font-semibold mb-2 opacity-75"
                      style={{ color: CONFIG.theme.textColor }}
                    >
                      🏆 Specializations
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentDoctor.specializations.map((spec, idx) => (
                        <span
                          key={idx}
                          className="bg-white/20 px-4 py-2 rounded-lg text-sm"
                          style={{ color: CONFIG.theme.textColor }}
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div
                      className="text-sm font-semibold mb-2 opacity-75"
                      style={{ color: CONFIG.theme.textColor }}
                    >
                      ⏰ Availability
                    </div>
                    <div
                      className="text-lg"
                      style={{ color: CONFIG.theme.textColor }}
                    >
                      {currentDoctor.availability}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div
                        className="text-xs font-semibold mb-1 opacity-75"
                        style={{ color: CONFIG.theme.textColor }}
                      >
                        📞 Phone
                      </div>
                      <div
                        className="text-sm"
                        style={{ color: CONFIG.theme.textColor }}
                      >
                        {currentDoctor.phone}
                      </div>
                    </div>
                    <div>
                      <div
                        className="text-xs font-semibold mb-1 opacity-75"
                        style={{ color: CONFIG.theme.textColor }}
                      >
                        📍 Location
                      </div>
                      <div
                        className="text-sm"
                        style={{ color: CONFIG.theme.textColor }}
                      >
                        {currentDoctor.location}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/20">
                    <div className="flex flex-wrap gap-2">
                      {currentDoctor.achievements
                        .slice(0, 2)
                        .map((achievement, idx) => (
                          <span
                            key={idx}
                            className="bg-yellow-500/20 px-3 py-1 rounded-lg text-xs flex items-center gap-1"
                            style={{ color: "#ffd700" }}
                          >
                            🏆 {achievement}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Info Panels */}
        <div className="w-1/5 space-y-4">
          {/* Emergency */}
          <div className="bg-red-600 rounded-2xl p-6 text-center shadow-2xl animate-pulse-glow">
            <div className="text-5xl mb-3">🚑</div>
            <div className="text-xl font-bold text-white mb-2">EMERGENCY</div>
            <div className="text-4xl font-bold text-white mb-2">
              {CONFIG.hospital.emergencyNumber}
            </div>
            <div className="text-sm text-white/90">24/7 Available</div>
          </div>

          {/* Health Tip */}
          {CONFIG.features.showHealthTips && (
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 shadow-2xl transition-all duration-700">
              <div className="text-center">
                <div className="text-5xl mb-3">
                  {MOCK_DATA.healthTips[healthTipIndex].icon}
                </div>
                <div
                  className="text-sm font-bold mb-2"
                  style={{ color: CONFIG.theme.accentColor }}
                >
                  💡 Health Tip
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: CONFIG.theme.textColor }}
                >
                  {MOCK_DATA.healthTips[healthTipIndex].tip}
                </p>
              </div>
            </div>
          )}

          {/* Testimonial */}
          {CONFIG.features.showTestimonials && (
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 shadow-2xl transition-all duration-700">
              <div className="text-center">
                <div
                  className="text-sm font-bold mb-2"
                  style={{ color: CONFIG.theme.accentColor }}
                >
                  💬 Patient Review
                </div>
                <p
                  className="text-sm italic mb-3"
                  style={{ color: CONFIG.theme.textColor }}
                >
                  "{MOCK_DATA.testimonials[testimonialIndex].message}"
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span
                    className="font-semibold text-sm"
                    style={{ color: CONFIG.theme.textColor }}
                  >
                    - {MOCK_DATA.testimonials[testimonialIndex].patient}
                  </span>
                  <span style={{ color: CONFIG.theme.accentColor }}>
                    {"⭐".repeat(
                      MOCK_DATA.testimonials[testimonialIndex].rating
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Contact Info */}
          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 shadow-2xl">
            <div
              className="text-center space-y-2 text-xs"
              style={{ color: CONFIG.theme.textColor }}
            >
              <div>📞 {CONFIG.hospital.phone}</div>
              <div>✉️ {CONFIG.hospital.email}</div>
              <div>🌐 {CONFIG.hospital.website}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer News Ticker */}
      {CONFIG.features.showNewsticker && (
        <footer
          className="relative z-10 overflow-hidden py-4"
          style={{
            backgroundColor: "rgba(0,0,0,0.7)",
            height: "80px",
          }}
        >
          <div className="flex items-center h-full">
            <div className="animate-scroll-ticker whitespace-nowrap">
              {[...MOCK_DATA.newsItems, ...MOCK_DATA.newsItems].map(
                (news, idx) => (
                  <span
                    key={idx}
                    className="inline-block px-12 text-xl font-semibold"
                    style={{ color: CONFIG.theme.textColor }}
                  >
                    {news}
                  </span>
                )
              )}
            </div>
          </div>
        </footer>
      )}

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-30px) translateX(10px);
          }
          50% {
            transform: translateY(-60px) translateX(-10px);
          }
          75% {
            transform: translateY(-30px) translateX(5px);
          }
        }

        @keyframes scroll-ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes pulse-glow {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.85;
          }
        }

        .animate-float {
          animation: float linear infinite;
        }

        .animate-scroll-ticker {
          animation: scroll-ticker 50s linear infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
