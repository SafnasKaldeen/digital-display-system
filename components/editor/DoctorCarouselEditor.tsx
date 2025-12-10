"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Upload, Calendar, Clock } from "lucide-react";
import { ImageUploader } from "./ImageUploader";
import CollapsibleSection from "./CollapsibleSection";

interface DoctorCarouselEditorProps {
  config: any;
  onConfigChange: (config: any) => void;
  displayId: string;
  userId?: string;
  environment?: "preview" | "production";
  layoutConfig?: "Advanced" | "Authentic";
}

export function DoctorCarouselEditor({
  config,
  onConfigChange,
  displayId,
  userId,
  environment = "preview",
  layoutConfig = "Advanced",
}: DoctorCarouselEditorProps) {
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(
    userId
  );
  const [uploadingDoctorIndex, setUploadingDoctorIndex] = useState<
    number | null
  >(null);

  const doctors = config.doctors || [];
  const doctorRotationSpeed =
    config.doctors && config.doctors.length
      ? (3 * config.slideshowSpeed) / config.doctors.length
      : 6000;

  // Fetch user ID if not provided
  useEffect(() => {
    const fetchUserId = async () => {
      if (userId) {
        setCurrentUserId(userId);
        return;
      }

      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user?.id) {
            setCurrentUserId(data.user.id);
          }
        }
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };

    fetchUserId();
  }, [userId]);

  // Handle basic field updates
  const handleFieldChange = (field: string, value: any) => {
    onConfigChange({ ...config, [field]: value });
  };

  // Doctor Management
  const handleAddDoctor = () => {
    onConfigChange({
      ...config,
      doctors: [
        ...doctors,
        {
          id: `doctor-${Date.now()}`,
          name: "",
          specialty: "",
          qualifications: "",
          consultationDays: "",
          consultationTime: "",
          image: "",
          available: "",
        },
      ],
    });
  };

  const handleUpdateDoctor = (idx: number, field: string, value: any) => {
    const updated = [...doctors];
    updated[idx] = { ...updated[idx], [field]: value };
    onConfigChange({ ...config, doctors: updated });
  };

  const handleRemoveDoctor = (idx: number) => {
    const updated = doctors.filter((_: any, i: number) => i !== idx);
    onConfigChange({ ...config, doctors: updated });
  };

  // Handle doctor image upload
  const handleDoctorImageUpload = (idx: number, imageUrl: string) => {
    handleUpdateDoctor(idx, "image", imageUrl);
    setUploadingDoctorIndex(null); // Close the uploader
  };

  return (
    <CollapsibleSection title="👨‍⚕️ Featured Doctors (Carousel)">
      <div className="space-y-3">
        <div className="flex justify-end mb-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddDoctor}
            className="border-slate-600 text-slate-300 h-7 bg-transparent hover:bg-slate-700"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Doctor
          </Button>
        </div>

        {doctors.map((doctor: any, idx: number) => (
          <div
            key={doctor.id}
            className="bg-slate-700/50 p-4 rounded-lg space-y-4 border border-slate-600"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">
                Doctor #{idx + 1}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRemoveDoctor(idx)}
                className="text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>

            <div className="flex gap-4">
              {/* Doctor Profile Picture Upload Area */}
              <div className="flex-shrink-0">
                <div className="relative group">
                  <div
                    className="w-24 h-24 rounded-full border-2 border-slate-600 flex items-center justify-center cursor-pointer bg-slate-700/50 overflow-hidden"
                    onClick={() =>
                      setUploadingDoctorIndex(
                        uploadingDoctorIndex === idx ? null : idx
                      )
                    }
                  >
                    {doctor.image ? (
                      <img
                        src={doctor.image}
                        alt={doctor.name || `Doctor ${idx + 1}`}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <Upload className="w-8 h-8 mb-1" />
                        <span className="text-xs">Upload Profile</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {doctor.image ? "Change" : "Upload"}
                      </span>
                    </div>
                  </div>

                  {/* Image Uploader for this specific doctor */}
                  {uploadingDoctorIndex === idx && (
                    <div className="absolute left-0 mt-2 z-10 bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-3 w-64">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-300 font-medium">
                          Doctor Profile Picture
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setUploadingDoctorIndex(null)}
                          className="h-5 px-2 text-xs text-slate-400 hover:text-slate-300"
                        >
                          ✕
                        </Button>
                      </div>
                      <ImageUploader
                        images={doctor.image ? [doctor.image] : []}
                        onChange={(imgs) =>
                          handleDoctorImageUpload(idx, imgs[0] || "")
                        }
                        maxImages={1}
                        userId={currentUserId}
                        displayId={displayId}
                        imageType="doctors" // Changed from "doctor" to "doctors"
                        environment={environment}
                        customFolder={`doctors/${doctor.id || `doctor-${idx}`}`}
                      />
                      <p className="text-xs text-slate-500 mt-2">
                        Recommended: Square image (1:1 ratio)
                      </p>
                    </div>
                  )}
                </div>

                {/* Image URL Display (hidden but in config) */}
                {doctor.image && (
                  <div className="mt-2">
                    <p className="text-xs text-slate-500 truncate">
                      Image URL saved in config
                    </p>
                  </div>
                )}
              </div>

              {/* Doctor Details Form */}
              <div className="flex-1 space-y-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Doctor's Name
                  </label>
                  <Input
                    value={doctor.name}
                    onChange={(e) =>
                      handleUpdateDoctor(idx, "name", e.target.value)
                    }
                    placeholder="Dr. John Smith"
                    className="bg-slate-700 border-slate-600 text-slate-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">
                      Speciality
                    </label>
                    <Input
                      value={doctor.specialty}
                      onChange={(e) =>
                        handleUpdateDoctor(idx, "specialty", e.target.value)
                      }
                      placeholder="Cardiology"
                      className="bg-slate-700 border-slate-600 text-slate-50 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">
                      Qualifications
                    </label>
                    <Input
                      value={doctor.qualifications || ""}
                      onChange={(e) =>
                        handleUpdateDoctor(
                          idx,
                          "qualifications",
                          e.target.value
                        )
                      }
                      placeholder="MD, PhD, FRCP"
                      className="bg-slate-700 border-slate-600 text-slate-50 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Consultation Days
                    </label>
                    <Input
                      value={doctor.consultationDays || ""}
                      onChange={(e) =>
                        handleUpdateDoctor(
                          idx,
                          "consultationDays",
                          e.target.value
                        )
                      }
                      placeholder="Mon, Wed, Fri"
                      className="bg-slate-700 border-slate-600 text-slate-50 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Consultation Time
                    </label>
                    <Input
                      value={doctor.consultationTime || ""}
                      onChange={(e) =>
                        handleUpdateDoctor(
                          idx,
                          "consultationTime",
                          e.target.value
                        )
                      }
                      placeholder="9:00 AM - 5:00 PM"
                      className="bg-slate-700 border-slate-600 text-slate-50 text-sm"
                    />
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Additional Information
                  </label>
                  <Input
                    value={doctor.available || ""}
                    onChange={(e) =>
                      handleUpdateDoctor(idx, "available", e.target.value)
                    }
                    placeholder="Languages spoken, special certifications, etc."
                    className="bg-slate-700 border-slate-600 text-slate-50 text-sm"
                  />
                </div>

                {/* Hidden fields that store image data in config */}
                <div className="hidden">
                  <input
                    type="hidden"
                    name={`doctor-${idx}-image-url`}
                    value={doctor.image || ""}
                  />
                  <input
                    type="hidden"
                    name={`doctor-${idx}-id`}
                    value={doctor.id || `doctor-${idx}`}
                  />
                </div>
              </div>
            </div>

            {/* Configuration Summary */}
            <div className="p-2 bg-slate-800/50 rounded text-xs text-slate-400">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-slate-500">ID:</span>
                  <span className="ml-1 font-mono">{doctor.id}</span>
                </div>
                <div>
                  <span className="text-slate-500">Image:</span>
                  <span className="ml-1 truncate">
                    {doctor.image ? "✓ Uploaded" : "✗ Not set"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Fields:</span>
                  <span className="ml-1">
                    {
                      [
                        doctor.name,
                        doctor.specialty,
                        doctor.qualifications,
                        doctor.consultationDays,
                        doctor.consultationTime,
                      ].filter(Boolean).length
                    }
                    /5 filled
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {doctors.length === 0 && (
          <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-700 rounded-lg">
            <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-3">
              <Plus className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-sm mb-2">No doctors added yet</p>
            <p className="text-xs text-slate-500">
              Click "Add Doctor" to create a new doctor profile
            </p>
          </div>
        )}

        {layoutConfig !== "Authentic" && doctors.length > 0 && (
          <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
            <label className="text-xs text-slate-400 mb-1 block">
              Carousel Rotation Speed (milliseconds)
            </label>
            <Input
              type="number"
              value={doctorRotationSpeed}
              onChange={(e) =>
                handleFieldChange(
                  "doctorRotationSpeed",
                  parseInt(e.target.value)
                )
              }
              min="2000"
              max="20000"
              step="1000"
              className="bg-slate-700 border-slate-600 text-slate-50"
            />
            <p className="text-xs text-slate-500 mt-1">
              Current: {doctorRotationSpeed / 1000} seconds per doctor
              {doctors.length > 0 && (
                <span className="ml-2 text-slate-600">
                  | Full cycle: {(doctorRotationSpeed * doctors.length) / 1000}s
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
}
