"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Plus,
  Calendar,
  Clock,
  Image as ImageIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "./ImageUploader";
import CollapsibleSection from "./CollapsibleSection";
import { DoctorCarouselEditor } from "./DoctorCarouselEditor";

interface HospitalEditorProps {
  config: any;
  onConfigChange: (config: any) => void;
  displayId: string;
  displayName: string;
  templateType: string;
  userId?: string;
  environment?: "preview" | "production";
  layout?: "Advanced" | "Authentic";
}

type FrequencyOption = {
  value: number;
  label: string;
  description: string;
};

const frequencyOptions: FrequencyOption[] = [
  { value: 60, label: "Every 1 minute", description: "Every minute" },
  { value: 300, label: "Every 5 minutes", description: "5-minute intervals" },
  { value: 600, label: "Every 10 minutes", description: "10-minute intervals" },
  { value: 900, label: "Every 15 minutes", description: "15-minute intervals" },
  {
    value: 1800,
    label: "Every 30 minutes",
    description: "30-minute intervals",
  },
  { value: 3600, label: "Every 1 hour", description: "Hourly intervals" },
  { value: 7200, label: "Every 2 hours", description: "2-hour intervals" },
  { value: 14400, label: "Every 4 hours", description: "4-hour intervals" },
  { value: 43200, label: "Every 12 hours", description: "12-hour intervals" },
  { value: 86400, label: "Every 24 hours", description: "Daily intervals" },
  {
    value: "custom",
    label: "Custom interval",
    description: "Set custom seconds",
  },
];

export function HospitalEditor({
  displayId,
  displayName,
  templateType,
  config,
  onConfigChange,
  userId,
  environment = "preview",
  layout = "Advanced",
}: HospitalEditorProps) {
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(
    userId
  );
  const [customFrequency, setCustomFrequency] = useState<{
    [key: string]: string;
  }>({});

  // Helper functions for date/time conversion
  const localToISO = (localDatetimeString: string) => {
    const [date, time] = localDatetimeString.split("T");
    const [year, month, day] = date.split("-");
    const [hours, minutes] = time.split(":");

    const localDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes)
    );

    return localDate.toISOString();
  };

  const isoToLocal = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

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

  // Extract config values with defaults
  const hospitalName = config.hospitalName || "MediTech Hospital";
  const tagline = config.tagline || "Excellence in Healthcare Since 1995";
  const hospitalLogo = config.hospitalLogo || "";
  const backgroundImage = config.backgroundImage || "";
  const primaryColor = config.primaryColor || "#06b6d4";
  const secondaryColor = config.secondaryColor || "#14b8a6";
  const accentColor = config.accentColor || "#f59e0b";
  const slideSpeed = config.slideSpeed || 20;
  const tickerMessage =
    config.tickerMessage ||
    "⚕️ Quality Healthcare • Compassionate Service • Advanced Technology";
  const tickerRightMessage =
    config.tickerRightMessage || "Your Health, Our Priority";
  const doctorRotationSpeed =
    config.doctors && config.doctors.length
      ? (3 * config.slideshowSpeed) / config.doctors.length
      : 6000;

  const departmentInfo = config.departmentInfo || "Emergency Department";
  const emergencyContact = config.emergencyContact || "911";
  const doctorSchedules = config.doctorSchedules || [];
  const doctors = config.doctors || [];
  const appointments = config.appointments || [];
  const leftComponent = config.leftComponent || "doctors";
  const rightComponent = config.rightComponent || "appointments";
  const enableSlideshow = config.enableSlideshow || false;
  const slideshowSpeed = config.slideshowSpeed || 10000;
  const layoutConfig = config.layout || layout || "Advanced";

  // Gallery and Ads (completely separate)
  const galleryImages = config.galleryImages || []; // Simple array of image URLs for 1:1 gallery
  const advertisements = config.advertisements || []; // Array of ad objects with full scheduling

  // Handle basic field updates
  const handleFieldChange = (field: string, value: any) => {
    onConfigChange({ ...config, [field]: value });
  };

  // Format seconds to human-readable time
  const formatSeconds = (seconds: number): string => {
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`;
    return `${Math.floor(seconds / 86400)} days`;
  };

  // Find the selected frequency option
  const getSelectedFrequencyOption = (frequency: number) => {
    return (
      frequencyOptions.find((opt) => opt.value === frequency) ||
      frequencyOptions.find((opt) => opt.value === "custom")
    );
  };

  // Handle frequency change
  const handleFrequencyChange = (idx: number, value: string | number) => {
    if (value === "custom") {
      // Keep the current value but mark as custom
      const currentFreq = advertisements[idx].frequency || 300;
      setCustomFrequency((prev) => ({
        ...prev,
        [idx]: currentFreq.toString(),
      }));
      handleUpdateAdvertisement(idx, "frequency", currentFreq);
    } else {
      handleUpdateAdvertisement(idx, "frequency", Number(value));
      // Clear custom frequency if not custom
      setCustomFrequency((prev) => {
        const newFreq = { ...prev };
        delete newFreq[idx];
        return newFreq;
      });
    }
  };

  // Handle custom frequency input
  const handleCustomFrequencyChange = (idx: number, value: string) => {
    const numValue = parseInt(value) || 300;
    setCustomFrequency((prev) => ({
      ...prev,
      [idx]: value,
    }));
    handleUpdateAdvertisement(idx, "frequency", numValue);
  };

  // ==============================
  // GALLERY MANAGEMENT (1:1 Simple)
  // ==============================
  const handleGalleryImagesChange = (imgs: string[]) => {
    onConfigChange({ ...config, galleryImages: imgs });
  };

  const removeGalleryImage = (index: number) => {
    const updated = galleryImages.filter((_: string, i: number) => i !== index);
    handleFieldChange("galleryImages", updated);
  };

  // ==============================
  // ADVERTISEMENT MANAGEMENT (16:9 with Scheduling)
  // ==============================
  const handleAddAdvertisement = () => {
    const defaultStartDate = new Date();
    const defaultEndDate = new Date();
    defaultEndDate.setDate(defaultEndDate.getDate() + 7);

    onConfigChange({
      ...config,
      advertisements: [
        ...advertisements,
        {
          id: `ad-${Date.now()}`,
          enabled: true,
          title: "",
          image: "",
          caption: "",
          frequency: 300, // 5 minutes (how often to show)
          duration: 30, // 30 seconds (how long to display)
          dateRange: {
            start: defaultStartDate.toISOString(),
            end: defaultEndDate.toISOString(),
          },
          timeRange: {
            start: "09:00",
            end: "17:00",
          },
          daysOfWeek: [1, 2, 3, 4, 5], // Weekdays
        },
      ],
    });
  };

  const handleUpdateAdvertisement = (
    idx: number,
    field: string,
    value: any
  ) => {
    const updated = [...advertisements];

    if (field.startsWith("dateRange.")) {
      const subField = field.split(".")[1];
      updated[idx] = {
        ...updated[idx],
        dateRange: {
          ...updated[idx].dateRange,
          [subField]: value,
        },
      };
    } else if (field.startsWith("timeRange.")) {
      const subField = field.split(".")[1];
      updated[idx] = {
        ...updated[idx],
        timeRange: {
          ...updated[idx].timeRange,
          [subField]: value,
        },
      };
    } else {
      updated[idx] = { ...updated[idx], [field]: value };
    }

    onConfigChange({ ...config, advertisements: updated });
  };

  const handleUpdateAdDays = (idx: number, day: number, checked: boolean) => {
    const updated = [...advertisements];
    const currentDays = updated[idx].daysOfWeek || [];

    if (checked) {
      updated[idx] = {
        ...updated[idx],
        daysOfWeek: [...currentDays, day],
      };
    } else {
      updated[idx] = {
        ...updated[idx],
        daysOfWeek: currentDays.filter((d) => d !== day),
      };
    }

    onConfigChange({ ...config, advertisements: updated });
  };

  const handleRemoveAdvertisement = (idx: number) => {
    const updated = advertisements.filter((_: any, i: number) => i !== idx);
    onConfigChange({ ...config, advertisements: updated });
  };

  // Days of week labels
  const daysOfWeek = [
    { id: 0, label: "Sun", full: "Sunday" },
    { id: 1, label: "Mon", full: "Monday" },
    { id: 2, label: "Tue", full: "Tuesday" },
    { id: 3, label: "Wed", full: "Wednesday" },
    { id: 4, label: "Thu", full: "Thursday" },
    { id: 5, label: "Fri", full: "Friday" },
    { id: 6, label: "Sat", full: "Saturday" },
  ];

  // Doctor Schedule Management
  const handleAddSchedule = () => {
    const defaultDate = new Date();
    defaultDate.setHours(9, 0, 0, 0);

    onConfigChange({
      ...config,
      doctorSchedules: [
        ...doctorSchedules,
        {
          name: "",
          specialty: "",
          room: "",
          appointmentDate: defaultDate.toISOString(),
        },
      ],
    });
  };

  const handleUpdateSchedule = (idx: number, field: string, value: any) => {
    const updated = [...doctorSchedules];

    if (field === "time") {
      const [hours, minutes] = value.split(":").map(Number);
      const date = updated[idx].appointmentDate
        ? new Date(updated[idx].appointmentDate)
        : new Date();
      date.setHours(hours, minutes, 0, 0);
      updated[idx] = {
        ...updated[idx],
        appointmentDate: date.toISOString(),
      };
    } else {
      updated[idx] = { ...updated[idx], [field]: value };
    }

    onConfigChange({ ...config, doctorSchedules: updated });
  };

  const handleRemoveSchedule = (idx: number) => {
    const updated = doctorSchedules.filter((_: any, i: number) => i !== idx);
    onConfigChange({ ...config, doctorSchedules: updated });
  };

  // Featured Doctors Management
  const handleAddDoctor = () => {
    onConfigChange({
      ...config,
      doctors: [
        ...doctors,
        {
          name: "",
          specialty: "",
          experience: "",
          image:
            "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop",
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

  // Appointment Management
  const handleAddAppointment = () => {
    const defaultDate = new Date(Date.now() + 60 * 60000);

    onConfigChange({
      ...config,
      appointments: [
        ...appointments,
        {
          id: `apt-${Date.now()}`,
          patientName: "",
          doctorName: "",
          specialty: "",
          room: "",
          appointmentDate: defaultDate.toISOString(),
          priority: "normal",
        },
      ],
    });
  };

  const handleUpdateAppointment = (idx: number, field: string, value: any) => {
    const updated = [...appointments];
    updated[idx] = { ...updated[idx], [field]: value };
    onConfigChange({ ...config, appointments: updated });
  };

  const handleRemoveAppointment = (idx: number) => {
    const updated = appointments.filter((_: any, i: number) => i !== idx);
    onConfigChange({ ...config, appointments: updated });
  };

  return (
    <div className="space-y-8">
      {/* Layout Configuration */}
      <CollapsibleSection title="🎛️ Layout Configuration">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              Display Layout
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "Authentic", icon: "🩺", label: "Authentic" },
                { value: "Advanced", icon: "🏥", label: "Advanced" },
              ].map((layoutOption) => (
                <button
                  key={layoutOption.value}
                  onClick={() =>
                    handleFieldChange("layout", layoutOption.value)
                  }
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    layoutConfig === layoutOption.value
                      ? "border-green-500 bg-green-500/20 text-green-400"
                      : "border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-700/50"
                  }`}
                >
                  <div className="text-xl mb-1">{layoutOption.icon}</div>
                  <div className="text-xs">{layoutOption.label}</div>
                </button>
              ))}
            </div>
          </div>

          {layoutConfig !== "Authentic" && (
            <>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">
                  Left Panel Component
                </label>
                <Select
                  value={leftComponent}
                  onValueChange={(val) =>
                    handleFieldChange("leftComponent", val)
                  }
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctors">👨‍⚕️ Featured Doctors</SelectItem>
                    <SelectItem value="appointments">
                      📅 Appointments
                    </SelectItem>
                    <SelectItem value="schedules">
                      🗓️ Doctor Schedules
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">
                  Right Panel Component
                </label>
                <Select
                  value={rightComponent}
                  onValueChange={(val) =>
                    handleFieldChange("rightComponent", val)
                  }
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctors">👨‍⚕️ Featured Doctors</SelectItem>
                    <SelectItem value="appointments">
                      📅 Appointments
                    </SelectItem>
                    <SelectItem value="schedules">
                      🗓️ Doctor Schedules
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-700/50 rounded-lg">
                <input
                  type="checkbox"
                  checked={enableSlideshow}
                  onChange={(e) =>
                    handleFieldChange("enableSlideshow", e.target.checked)
                  }
                  className="w-4 h-4"
                />
                <label className="text-sm text-slate-300">
                  Enable Slideshow (Auto-rotate components)
                </label>
              </div>

              {enableSlideshow && (
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Slideshow Speed (milliseconds)
                  </label>
                  <Input
                    type="number"
                    value={slideshowSpeed}
                    onChange={(e) =>
                      handleFieldChange(
                        "slideshowSpeed",
                        parseInt(e.target.value)
                      )
                    }
                    min="5000"
                    max="60000"
                    step="1000"
                    className="bg-slate-700 border-slate-600 text-slate-50"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Current: {slideshowSpeed / 1000} seconds per component
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </CollapsibleSection>

      {/* Hospital Branding */}
      <CollapsibleSection title="🏥 Hospital Branding">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              Hospital Name
            </label>
            <Input
              value={hospitalName}
              onChange={(e) =>
                handleFieldChange("hospitalName", e.target.value)
              }
              placeholder="MediTech Hospital"
              className="bg-slate-700 border-slate-600 text-slate-50"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Tagline</label>
            <Input
              value={tagline}
              onChange={(e) => handleFieldChange("tagline", e.target.value)}
              placeholder="Excellence in Healthcare Since 1995"
              className="bg-slate-700 border-slate-600 text-slate-50"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              Hospital Logo
            </label>
            <ImageUploader
              images={hospitalLogo ? [hospitalLogo] : []}
              onChange={(imgs) =>
                handleFieldChange("hospitalLogo", imgs[0] || "")
              }
              maxImages={1}
              userId={currentUserId}
              displayId={displayId}
              imageType="logo"
              environment={environment}
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Visual & Theme Settings */}
      <CollapsibleSection title="🎨 Visual & Theme Settings">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              Primary Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) =>
                  handleFieldChange("primaryColor", e.target.value)
                }
                className="w-10 h-10 cursor-pointer rounded border border-slate-600"
              />
              <Input
                value={primaryColor}
                onChange={(e) =>
                  handleFieldChange("primaryColor", e.target.value)
                }
                placeholder="#06b6d4"
                className="bg-slate-700 border-slate-600 text-slate-50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              Secondary Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) =>
                  handleFieldChange("secondaryColor", e.target.value)
                }
                className="w-10 h-10 cursor-pointer rounded border border-slate-600"
              />
              <Input
                value={secondaryColor}
                onChange={(e) =>
                  handleFieldChange("secondaryColor", e.target.value)
                }
                placeholder="#14b8a6"
                className="bg-slate-700 border-slate-600 text-slate-50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              Accent Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={accentColor}
                onChange={(e) =>
                  handleFieldChange("accentColor", e.target.value)
                }
                className="w-10 h-10 cursor-pointer rounded border border-slate-600"
              />
              <Input
                value={accentColor}
                onChange={(e) =>
                  handleFieldChange("accentColor", e.target.value)
                }
                placeholder="#f59e0b"
                className="bg-slate-700 border-slate-600 text-slate-50"
              />
            </div>
          </div>

          <div className="p-2 bg-slate-700/30 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: primaryColor }}
              />
              <span className="text-xs text-slate-300">Primary</span>
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: secondaryColor }}
              />
              <span className="text-xs text-slate-300">Secondary</span>
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: accentColor }}
              />
              <span className="text-xs text-slate-300">Accent</span>
            </div>
            <p className="text-xs text-slate-500">
              Primary: Main background | Secondary: Highlights | Accent: UI
              elements
            </p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Background Images */}
      <CollapsibleSection title="🏞️ Background Images">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              Main Background Image
            </label>
            <ImageUploader
              images={backgroundImage ? [backgroundImage] : []}
              onChange={(imgs) =>
                handleFieldChange("backgroundImage", imgs[0] || "")
              }
              maxImages={1}
              userId={currentUserId}
              displayId={displayId}
              imageType="background"
              environment={environment}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-slate-400 font-medium">
                Slideshow Images ({config.backgroundImages?.length || 0})
              </label>
              <button
                onClick={() =>
                  handleFieldChange("enableSlideshow", !enableSlideshow)
                }
                className={`text-xs px-2 py-1 rounded ${
                  enableSlideshow
                    ? "bg-green-500/20 text-green-400"
                    : "bg-slate-700 text-slate-400"
                }`}
              >
                {enableSlideshow ? "✓ Slideshow ON" : "Slideshow OFF"}
              </button>
            </div>

            {enableSlideshow && (
              <div className="space-y-3">
                <ImageUploader
                  images={config.backgroundImages || []}
                  onChange={(imgs) =>
                    handleFieldChange("backgroundImages", imgs)
                  }
                  maxImages={10}
                  userId={currentUserId}
                  displayId={displayId}
                  imageType="slideshow"
                  environment={environment}
                />

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Slideshow Speed (seconds)
                  </label>
                  <Input
                    type="range"
                    min="5"
                    max="30"
                    step="1"
                    value={slideshowSpeed / 1000}
                    onChange={(e) =>
                      handleFieldChange(
                        "slideshowSpeed",
                        parseInt(e.target.value) * 1000
                      )
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>5s</span>
                    <span>{slideshowSpeed / 1000}s</span>
                    <span>30s</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {enableSlideshow && config.backgroundImages?.length > 0 && (
            <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-400">
                Slideshow rotation: {slideshowSpeed / 1000} seconds per image
                {config.backgroundImages?.length > 0 &&
                  ` | Full cycle: ${(
                    (config.backgroundImages.length * slideshowSpeed) /
                    1000
                  ).toFixed(0)}s`}
              </p>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Advertisement Schedules Section - 16:9 Full Screen with Scheduling */}
      <CollapsibleSection
        title="📺 Advertisement Schedules (16:9 Fullscreen)"
        defaultOpen={true}
      >
        <div className="space-y-4">
          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <p className="text-sm text-purple-400">
              <strong>Full Screen Advertisements:</strong> Schedule 16:9 ads to
              display in fullscreen mode with complete scheduling controls. Ads
              will only show when enabled and within their schedule range.
            </p>
          </div>

          <div className="flex justify-end mb-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddAdvertisement}
              className="border-purple-500 text-purple-400 h-7 bg-transparent hover:bg-purple-500/10"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Advertisement
            </Button>
          </div>

          {advertisements.map((ad: any, idx: number) => {
            const isCustomFrequency = !frequencyOptions.some(
              (opt) => opt.value === ad.frequency
            );
            const selectedValue = isCustomFrequency ? "custom" : ad.frequency;

            return (
              <div
                key={ad.id}
                className="bg-slate-700/50 p-4 rounded-lg space-y-4 border border-slate-600"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={ad.enabled}
                        onChange={(e) =>
                          handleUpdateAdvertisement(
                            idx,
                            "enabled",
                            e.target.checked
                          )
                        }
                        className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-green-500"
                      />
                      <span className="text-sm font-medium text-slate-300">
                        Ad #{idx + 1} {ad.enabled ? "✓" : "✗"}
                      </span>
                    </div>
                    <div className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-400">
                      16:9 Fullscreen
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveAdvertisement(idx)}
                    className="text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <Input
                    value={ad.title}
                    onChange={(e) =>
                      handleUpdateAdvertisement(idx, "title", e.target.value)
                    }
                    placeholder="Advertisement Title"
                    className="bg-slate-700 border-slate-600 text-slate-50"
                  />

                  <Input
                    value={ad.caption}
                    onChange={(e) =>
                      handleUpdateAdvertisement(idx, "caption", e.target.value)
                    }
                    placeholder="Advertisement Description"
                    className="bg-slate-700 border-slate-600 text-slate-50"
                  />

                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">
                      Advertisement Image (16:9 recommended)
                    </label>
                    <ImageUploader
                      images={ad.image ? [ad.image] : []}
                      onChange={(imgs) =>
                        handleUpdateAdvertisement(idx, "image", imgs[0] || "")
                      }
                      maxImages={1}
                      userId={currentUserId}
                      displayId={displayId}
                      imageType="advertisement"
                      environment={environment}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">
                        Display Frequency
                      </label>
                      <Select
                        value={selectedValue.toString()}
                        onValueChange={(value) =>
                          handleFrequencyChange(
                            idx,
                            value === "custom" ? "custom" : parseInt(value)
                          )
                        }
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                          <SelectValue>
                            {isCustomFrequency
                              ? `Custom (${formatSeconds(ad.frequency)})`
                              : frequencyOptions.find(
                                  (opt) => opt.value === ad.frequency
                                )?.label || "Select frequency"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {frequencyOptions.map((option) => (
                            <SelectItem
                              key={option.value.toString()}
                              value={option.value.toString()}
                              className="text-slate-200 hover:bg-slate-700"
                            >
                              <div>
                                <div className="font-medium">
                                  {option.label}
                                </div>
                                {option.description && (
                                  <div className="text-xs text-slate-400">
                                    {option.description}
                                  </div>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {selectedValue === "custom" && (
                        <div className="mt-2">
                          <label className="text-xs text-slate-400 mb-1 block">
                            Custom Interval (seconds)
                          </label>
                          <Input
                            type="number"
                            value={customFrequency[idx] || ad.frequency}
                            onChange={(e) =>
                              handleCustomFrequencyChange(idx, e.target.value)
                            }
                            min="30"
                            max="2592000"
                            className="bg-slate-700 border-slate-600 text-slate-50"
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            Current: {formatSeconds(ad.frequency)} (
                            {ad.frequency}s)
                          </p>
                        </div>
                      )}

                      {selectedValue !== "custom" && (
                        <p className="text-xs text-slate-500 mt-1">
                          Show every {formatSeconds(ad.frequency)}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">
                        Duration (seconds)
                      </label>
                      <Input
                        type="number"
                        value={ad.duration}
                        onChange={(e) =>
                          handleUpdateAdvertisement(
                            idx,
                            "duration",
                            parseInt(e.target.value) || 30
                          )
                        }
                        min="5"
                        max="300"
                        className="bg-slate-700 border-slate-600 text-slate-50"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Display for {ad.duration}s
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Start Date
                      </label>
                      <Input
                        type="date"
                        value={
                          ad.dateRange.start
                            ? ad.dateRange.start.split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          handleUpdateAdvertisement(
                            idx,
                            "dateRange.start",
                            new Date(e.target.value).toISOString()
                          )
                        }
                        className="bg-slate-700 border-slate-600 text-slate-50"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        End Date
                      </label>
                      <Input
                        type="date"
                        value={
                          ad.dateRange.end ? ad.dateRange.end.split("T")[0] : ""
                        }
                        onChange={(e) =>
                          handleUpdateAdvertisement(
                            idx,
                            "dateRange.end",
                            new Date(e.target.value).toISOString()
                          )
                        }
                        className="bg-slate-700 border-slate-600 text-slate-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Start Time
                      </label>
                      <Input
                        type="time"
                        value={ad.timeRange.start || "09:00"}
                        onChange={(e) =>
                          handleUpdateAdvertisement(
                            idx,
                            "timeRange.start",
                            e.target.value
                          )
                        }
                        className="bg-slate-700 border-slate-600 text-slate-50"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        End Time
                      </label>
                      <Input
                        type="time"
                        value={ad.timeRange.end || "17:00"}
                        onChange={(e) =>
                          handleUpdateAdvertisement(
                            idx,
                            "timeRange.end",
                            e.target.value
                          )
                        }
                        className="bg-slate-700 border-slate-600 text-slate-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 mb-2 block">
                      Active Days
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {daysOfWeek.map((day) => (
                        <label
                          key={day.id}
                          className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            ad.daysOfWeek?.includes(day.id)
                              ? "bg-purple-500 text-white"
                              : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={ad.daysOfWeek?.includes(day.id) || false}
                            onChange={(e) =>
                              handleUpdateAdDays(idx, day.id, e.target.checked)
                            }
                            className="hidden"
                          />
                          {day.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {advertisements.length === 0 && (
            <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-700 rounded-lg">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-sm mb-2">No advertisements configured</p>
              <p className="text-xs text-slate-500">
                Add fullscreen 16:9 ads with custom schedules
              </p>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Gallery Images Section - Simple 1:1 Images */}
      <CollapsibleSection title="🖼️ Gallery Images (1:1 Ratio)">
        <div className="space-y-3">
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-400">
              <strong>1:1 Square Gallery:</strong> Upload square images (1:1
              ratio) for the hospital gallery. Images will cover the entire
              display area and rotate automatically. No scheduling or fullscreen
              options.
            </p>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium block mb-2">
              Gallery Images ({galleryImages.length})
            </label>
            <ImageUploader
              images={galleryImages}
              onChange={handleGalleryImagesChange}
              maxImages={20}
              userId={currentUserId}
              displayId={displayId}
              imageType="gallery"
              environment={environment}
            />
          </div>

          {galleryImages.length > 0 && (
            <div className="mt-4 space-y-2">
              <label className="text-xs text-slate-400 font-medium block">
                Gallery Images ({galleryImages.length})
              </label>
              <div className="grid grid-cols-4 gap-2">
                {galleryImages.map((img: string, idx: number) => (
                  <div key={idx} className="relative group">
                    <img
                      src={img}
                      alt={`Gallery ${idx + 1}`}
                      className="w-full aspect-square object-cover rounded border-2 border-slate-600"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        Image #{idx + 1}
                      </span>
                    </div>
                    <button
                      onClick={() => removeGalleryImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Ticker Messages */}
      <CollapsibleSection title="📰 Ticker Messages">
        <div className="space-y-3">
          <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg mb-2">
            <p className="text-xs text-amber-400">
              Note: Ticker messages are only shown in the Advanced layout. The
              Authentic layout shows doctors on the left and gallery on the
              right.
            </p>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              Left Ticker Message
            </label>
            <Input
              value={tickerMessage}
              onChange={(e) =>
                handleFieldChange("tickerMessage", e.target.value)
              }
              placeholder="⚕️ Quality Healthcare • Compassionate Service"
              className="bg-slate-700 border-slate-600 text-slate-50"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              Right Ticker Message
            </label>
            <Input
              value={tickerRightMessage}
              onChange={(e) =>
                handleFieldChange("tickerRightMessage", e.target.value)
              }
              placeholder="Your Health, Our Priority"
              className="bg-slate-700 border-slate-600 text-slate-50"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Featured Doctors (Carousel) */}
      <DoctorCarouselEditor
        config={config}
        onConfigChange={onConfigChange}
        displayId={displayId}
        userId={currentUserId}
        environment={environment}
        layoutConfig={layoutConfig}
      />

      {/* Appointments Section */}
      {layoutConfig !== "Authentic" && (
        <CollapsibleSection title="📅 Appointments">
          <div className="space-y-3">
            <div className="flex justify-end mb-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddAppointment}
                className="border-slate-600 text-slate-300 h-7 bg-transparent hover:bg-slate-700"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Appointment
              </Button>
            </div>
            {appointments.map((appointment: any, idx: number) => (
              <div
                key={idx}
                className="bg-slate-700/50 p-4 rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">
                    Appointment #{idx + 1}
                  </span>
                  <Select
                    value={appointment.priority}
                    onValueChange={(val) =>
                      handleUpdateAppointment(idx, "priority", val)
                    }
                  >
                    <SelectTrigger className="w-28 h-6 text-xs bg-slate-700 border-slate-600 text-slate-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={appointment.patientName}
                    onChange={(e) =>
                      handleUpdateAppointment(
                        idx,
                        "patientName",
                        e.target.value
                      )
                    }
                    placeholder="Patient Name"
                    className="bg-slate-700 border-slate-600 text-slate-50 text-sm"
                  />
                  <Input
                    value={appointment.doctorName}
                    onChange={(e) =>
                      handleUpdateAppointment(idx, "doctorName", e.target.value)
                    }
                    placeholder="Doctor Name"
                    className="bg-slate-700 border-slate-600 text-slate-50 text-sm"
                  />
                </div>
                <Input
                  value={appointment.specialty}
                  onChange={(e) =>
                    handleUpdateAppointment(idx, "specialty", e.target.value)
                  }
                  placeholder="Specialty"
                  className="bg-slate-700 border-slate-600 text-slate-50 text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={appointment.room}
                    onChange={(e) =>
                      handleUpdateAppointment(idx, "room", e.target.value)
                    }
                    placeholder="Room Number"
                    className="bg-slate-700 border-slate-600 text-slate-50 text-sm"
                  />
                  <Input
                    type="datetime-local"
                    value={isoToLocal(appointment.appointmentDate)}
                    onChange={(e) =>
                      handleUpdateAppointment(
                        idx,
                        "appointmentDate",
                        localToISO(e.target.value)
                      )
                    }
                    className="bg-slate-700 border-slate-600 text-slate-50 text-sm"
                  />
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveAppointment(idx)}
                  className="w-full text-red-400 hover:bg-red-500/10 text-sm"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Remove Appointment
                </Button>
              </div>
            ))}
            {appointments.length === 0 && (
              <div className="text-center py-6 text-slate-500 text-sm">
                No appointments added yet. Click "Add Appointment" to start.
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Doctor Schedules */}
      {layoutConfig !== "Authentic" && (
        <CollapsibleSection title="🗓️ Doctor Schedules">
          <div className="space-y-3">
            <div className="flex justify-end mb-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddSchedule}
                className="border-slate-600 text-slate-300 h-7 bg-transparent hover:bg-slate-700"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Schedule
              </Button>
            </div>
            {doctorSchedules.map((schedule: any, idx: number) => (
              <div
                key={idx}
                className="bg-slate-700/50 p-4 rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">
                    Schedule #{idx + 1}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={schedule.name}
                    onChange={(e) =>
                      handleUpdateSchedule(idx, "name", e.target.value)
                    }
                    placeholder="Doctor Name"
                    className="bg-slate-700 border-slate-600 text-slate-50 text-sm"
                  />
                  <Input
                    value={schedule.specialty}
                    onChange={(e) =>
                      handleUpdateSchedule(idx, "specialty", e.target.value)
                    }
                    placeholder="Specialty"
                    className="bg-slate-700 border-slate-600 text-slate-50 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={schedule.room}
                    onChange={(e) =>
                      handleUpdateSchedule(idx, "room", e.target.value)
                    }
                    placeholder="Room Number"
                    className="bg-slate-700 border-slate-600 text-slate-50 text-sm"
                  />
                  <Input
                    type="time"
                    value={schedule.time || "09:00"}
                    onChange={(e) =>
                      handleUpdateSchedule(idx, "time", e.target.value)
                    }
                    className="bg-slate-700 border-slate-600 text-slate-50 text-sm"
                  />
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveSchedule(idx)}
                  className="w-full text-red-400 hover:bg-red-500/10 text-sm"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Remove Schedule
                </Button>
              </div>
            ))}
            {doctorSchedules.length === 0 && (
              <div className="text-center py-6 text-slate-500 text-sm">
                No doctor schedules added yet. Click "Add Schedule" to start.
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}
