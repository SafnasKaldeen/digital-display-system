"use client";

import { useEffect, useState } from "react";

interface HospitalDisplayProps {
  config: any;
}

export function HospitalDisplay({ config }: HospitalDisplayProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const doctorSchedules = config.doctorSchedules || [];
  const emergencyContact = config.emergencyContact || "911";
  const departmentInfo = config.departmentInfo || "Emergency Department";

  return (
    <div
      className="w-full h-screen flex flex-col justify-between items-center text-white p-12"
      style={{
        backgroundColor: "#0f172a",
      }}
    >
      {/* Header */}
      <div className="w-full text-center space-y-4 mb-8">
        <h1 className="text-6xl font-bold">Doctor Schedule</h1>
        <p className="text-3xl opacity-75">{departmentInfo}</p>
      </div>

      {/* Doctor Schedules Grid */}
      <div className="grid grid-cols-2 gap-6 w-full max-w-5xl flex-1 overflow-y-auto">
        {doctorSchedules.length > 0 ? (
          doctorSchedules.map((doctor: any, idx: number) => (
            <div
              key={idx}
              className="bg-gradient-to-r from-slate-800 to-slate-700 p-8 rounded-2xl flex flex-col justify-center border-2 border-cyan-500/30"
            >
              <p className="text-4xl font-bold mb-2">{doctor.name}</p>
              <p className="text-2xl opacity-75 mb-4">{doctor.specialty}</p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm opacity-50 mb-1">Time</p>
                  <p className="text-3xl font-semibold">{doctor.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-50 mb-1">Room</p>
                  <p className="text-3xl font-semibold text-cyan-400">
                    {doctor.room}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center opacity-50 py-12">
            <p className="text-2xl">No doctors scheduled</p>
          </div>
        )}
      </div>

      {/* Emergency Contact */}
      <div className="w-full max-w-5xl bg-red-600 p-8 rounded-2xl text-center mt-8">
        <p className="text-2xl mb-2">EMERGENCY</p>
        <p className="text-7xl font-bold">{emergencyContact}</p>
      </div>

      {/* Time */}
      <div className="mt-8 text-center">
        <p className="text-4xl font-bold opacity-75">
          {currentTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
