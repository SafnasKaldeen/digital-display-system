"use client";

import React, { useEffect, useRef, useState } from "react";

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

interface DoctorCarouselProps {
  doctors: Doctor[];
  layout: "Authentic" | "Advanced";
  slideSpeed?: number;
  doctorRotationSpeed?: number;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export function DoctorCarousel({
  doctors = [],
  layout = "Authentic",
  slideSpeed = 20,
  doctorRotationSpeed = 6000,
  primaryColor,
  secondaryColor,
  accentColor,
}: DoctorCarouselProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [currentDoctorIndex, setCurrentDoctorIndex] = useState(0);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const doctorRotationRef = useRef<NodeJS.Timeout | null>(null);

  const defaultDoctorImage =
    "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop";

  // Handle scrolling animation for Authentic layout
  useEffect(() => {
    if (layout !== "Authentic") return;

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      setScrollPosition((prev) => {
        const speed = slideSpeed / 80;
        const newPosition = prev + (speed * delta) / 16.67;
        return newPosition;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [layout, slideSpeed]);

  // Handle doctor rotation for Advanced layout
  useEffect(() => {
    if (layout === "Advanced" && doctors.length > 1) {
      if (doctorRotationRef.current) clearInterval(doctorRotationRef.current);

      doctorRotationRef.current = setInterval(() => {
        setCurrentDoctorIndex((prev) => (prev + 1) % doctors.length);
      }, doctorRotationSpeed);

      return () => {
        if (doctorRotationRef.current) clearInterval(doctorRotationRef.current);
      };
    }
  }, [layout, doctors.length, doctorRotationSpeed]);

  const getCurrentDoctor = () => {
    if (layout === "Advanced" && doctors.length > 0) {
      return doctors[currentDoctorIndex];
    }
    return doctors[0];
  };

  const duplicatedDoctors = [...doctors, ...doctors, ...doctors, ...doctors];
  const itemHeight = 260; // Increased from 220
  const totalHeight = doctors.length * itemHeight;

  // Render Authentic layout (scrolling carousel)
  const renderAuthenticLayout = () => {
    return (
      <div
        className="relative flex-1 overflow-hidden rounded-3xl shadow-2xl border-2"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(20px)",
          borderColor: `${accentColor}40`,
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
          }}
        />

        <div
          className="absolute z-10 w-full px-6"
          style={{
            transform: `translateY(-${scrollPosition % (totalHeight * 3)}px)`,
            willChange: "transform",
          }}
        >
          {duplicatedDoctors.map((doctor, index) => (
            <DoctorCard
              key={`${doctor.id || doctor.name}-${index}`}
              doctor={doctor}
              itemHeight={itemHeight}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              accentColor={accentColor}
              defaultDoctorImage={defaultDoctorImage}
            />
          ))}
        </div>

        {/* Gradient overlays for fade effect */}
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
    );
  };

  // Render Advanced layout (single doctor with rotation)
  const renderAdvancedLayout = () => {
    const doctor = getCurrentDoctor();

    return (
      <div
        className="relative flex-1 overflow-hidden rounded-3xl shadow-2xl border-2"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(20px)",
          borderColor: `${accentColor}40`,
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
          {doctors.length > 0 ? (
            <div className="w-full max-w-4xl">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Doctor Image - Larger size */}
                <div className="relative">
                  <div className="relative w-80 h-80 rounded-3xl overflow-hidden shadow-2xl">
                    <img
                      src={doctor.image || defaultDoctorImage}
                      alt={doctor.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = defaultDoctorImage;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>

                  {/* Dots indicator for rotation */}
                  {doctors.length > 1 && (
                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                      {doctors.map((_, idx) => (
                        <div
                          key={idx}
                          className="w-3 h-3 rounded-full transition-all"
                          style={{
                            backgroundColor:
                              idx === currentDoctorIndex
                                ? accentColor
                                : "rgba(255,255,255,0.3)",
                            width: idx === currentDoctorIndex ? "20px" : "12px",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Doctor Details - Text sizes kept as before */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-5xl font-bold text-white mb-3">
                    {doctor.name}
                  </h3>

                  {/* Specialty with icon */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <span className="text-white text-xl">🩺</span>
                    </div>
                    <p className="text-2xl text-gray-300">{doctor.specialty}</p>
                  </div>

                  {/* Qualifications */}
                  {doctor.qualifications && (
                    <p className="text-xl text-gray-400 mb-2">
                      <strong>Qualifications:</strong> {doctor.qualifications}
                    </p>
                  )}

                  {/* Consultation Schedule */}
                  {(doctor.consultationDays || doctor.consultationTime) && (
                    <div className="mb-3">
                      <p className="text-xl text-gray-400">
                        <strong>Consultation:</strong> {doctor.consultationDays}{" "}
                        {doctor.consultationTime}
                      </p>
                    </div>
                  )}

                  {/* Experience */}
                  {doctor.experience && (
                    <p className="text-xl text-gray-400 mb-2">
                      <strong>Experience:</strong> {doctor.experience}
                    </p>
                  )}

                  {/* Availability */}
                  {doctor.available && (
                    <p className="text-xl text-gray-400">
                      <strong>Available:</strong> {doctor.available}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <p className="text-2xl">No doctors configured</p>
              <p className="text-lg mt-2">Add doctors in the editor</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {layout === "Authentic"
        ? renderAuthenticLayout()
        : renderAdvancedLayout()}
    </div>
  );
}

// Doctor Card Component for Authentic layout
function DoctorCard({
  doctor,
  itemHeight,
  primaryColor,
  secondaryColor,
  accentColor,
  defaultDoctorImage,
}: {
  doctor: Doctor;
  itemHeight: number;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  defaultDoctorImage: string;
}) {
  return (
    <div className="mb-5" style={{ height: `${itemHeight}px` }}>
      <div
        className="h-full rounded-2xl p-5 shadow-xl border-2 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)`,
          borderColor: `${accentColor}60`,
        }}
      >
        <div className="flex items-center h-full gap-6">
          {/* Doctor Image - Larger size only */}
          <div className="relative flex-shrink-0">
            <div className="relative w-56 h-56 rounded-2xl overflow-hidden shadow-2xl group-hover:shadow-3xl transition-all duration-500">
              <div
                className="absolute inset-0 opacity-60 blur-sm"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
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
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                }}
              />

              {/* Experience Badge - Same size as before */}
              {doctor.experience && (
                <div
                  className="absolute bottom-3 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full text-sm font-bold shadow-2xl whitespace-nowrap z-20"
                  style={{
                    background: `linear-gradient(135deg, ${accentColor}, ${secondaryColor})`,
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

          {/* Doctor Details - All text sizes kept as before */}
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-10 rounded-full"
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: `0 0 15px ${accentColor}`,
                  }}
                />
                <p
                  className="text-4xl font-black tracking-tight leading-tight"
                  style={{
                    color: "white",
                    textShadow: `0 3px 20px ${accentColor}80`,
                  }}
                >
                  {doctor.name}
                </p>
              </div>
            </div>

            {/* Specialty */}
            {doctor.specialty && (
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                    style={{
                      backgroundColor: primaryColor,
                    }}
                  >
                    <span className="text-white text-lg">🩺</span>
                  </div>
                  <p
                    className="text-2xl font-bold italic"
                    style={{
                      color: `${accentColor}EE`,
                      textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                    }}
                  >
                    {doctor.specialty}
                  </p>
                </div>
              </div>
            )}

            {/* Qualifications (new field) */}
            {doctor.qualifications && (
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                    style={{
                      backgroundColor: secondaryColor,
                    }}
                  >
                    <span className="text-white text-lg">📜</span>
                  </div>
                  <p
                    className="text-xl font-medium"
                    style={{
                      color: `${primaryColor}EE`,
                      textShadow: "0 1px 4px rgba(0,0,0,0.3)",
                    }}
                  >
                    {doctor.qualifications}
                  </p>
                </div>
              </div>
            )}

            {/* Consultation Days & Time (new fields) */}
            {(doctor.consultationDays || doctor.consultationTime) && (
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                    style={{
                      backgroundColor: accentColor,
                    }}
                  >
                    <span className="text-white text-lg">📅</span>
                  </div>
                  <p
                    className="text-xl font-medium"
                    style={{
                      color: `${secondaryColor}EE`,
                      textShadow: "0 1px 4px rgba(0,0,0,0.3)",
                    }}
                  >
                    {doctor.consultationDays} {doctor.consultationTime}
                  </p>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-2 pt-2">
              <div
                className="flex-1 h-0.5 rounded-full opacity-40"
                style={{
                  backgroundColor: accentColor,
                }}
              />
              <div
                className="w-3 h-3 rounded-full animate-pulse"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 0 10px ${accentColor}`,
                }}
              />
              <div
                className="flex-1 h-0.5 rounded-full opacity-40"
                style={{
                  backgroundColor: accentColor,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorCarousel;
