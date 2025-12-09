// Editor component for managing ad schedules
"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Calendar, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GalleryMediaLibrary } from "./GalleryMediaLibrary";
import { ImageUploader } from "./ImageUploader";
import CollapsibleSection from "./CollapsibleSection";

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
  const galleryItems = config.galleryItems || [];
  const backgroundImages = config.backgroundImages || [];
  const enableFullscreen = config.enableFullscreen || false;
  const fullscreenDuration = config.fullscreenDuration || 10000;
  const adSchedules = config.adSchedules || [];

  // Handle basic field updates
  const handleFieldChange = (field: string, value: any) => {
    onConfigChange({ ...config, [field]: value });
  };

  // Ad Schedule Management
  const handleAddAdSchedule = () => {
    const defaultStartDate = new Date();
    const defaultEndDate = new Date();
    defaultEndDate.setDate(defaultEndDate.getDate() + 7);

    onConfigChange({
      ...config,
      adSchedules: [
        ...adSchedules,
        {
          id: `ad-${Date.now()}`,
          enabled: true,
          title: "",
          image: "",
          caption: "",
          fullScreen: true,
          frequency: 300, // 5 minutes
          duration: 30, // 30 seconds
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

  const handleUpdateAdSchedule = (idx: number, field: string, value: any) => {
    const updated = [...adSchedules];

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

    onConfigChange({ ...config, adSchedules: updated });
  };

  const handleUpdateAdDays = (idx: number, day: number, checked: boolean) => {
    const updated = [...adSchedules];
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

    onConfigChange({ ...config, adSchedules: updated });
  };

  const handleRemoveAdSchedule = (idx: number) => {
    const updated = adSchedules.filter((_: any, i: number) => i !== idx);
    onConfigChange({ ...config, adSchedules: updated });
  };

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

  // Gallery Items Management
  const handleGalleryItemsChange = (items: any[]) => {
    onConfigChange({ ...config, galleryItems: items });
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

  return (
    <div className="space-y-8">
      {/* Ad Schedules Section */}
      <CollapsibleSection title="📅 Ad Schedules" defaultOpen={true}>
        <div className="space-y-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-400">
              <strong>Schedule-Based Ads:</strong> Ads will only display when
              the schedule is enabled and within the specified date/time range.
              The ad will show according to the frequency and duration settings.
            </p>
          </div>

          <div className="flex justify-end mb-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddAdSchedule}
              className="border-blue-500 text-blue-400 h-7 bg-transparent hover:bg-blue-500/10"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Ad Schedule
            </Button>
          </div>

          {adSchedules.map((schedule: any, idx: number) => (
            <div
              key={schedule.id}
              className="bg-slate-700/50 p-4 rounded-lg space-y-4 border border-slate-600"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={schedule.enabled}
                      onChange={(e) =>
                        handleUpdateAdSchedule(idx, "enabled", e.target.checked)
                      }
                      className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-green-500"
                    />
                    <span className="text-sm font-medium text-slate-300">
                      Schedule #{idx + 1} {schedule.enabled ? "✓" : "✗"}
                    </span>
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-xs ${
                      schedule.fullScreen
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-slate-600/50 text-slate-400"
                    }`}
                  >
                    {schedule.fullScreen ? "Full Screen" : "Normal"}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveAdSchedule(idx)}
                  className="text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>

              <div className="space-y-3">
                <Input
                  value={schedule.title}
                  onChange={(e) =>
                    handleUpdateAdSchedule(idx, "title", e.target.value)
                  }
                  placeholder="Ad Title"
                  className="bg-slate-700 border-slate-600 text-slate-50"
                />

                <Input
                  value={schedule.caption}
                  onChange={(e) =>
                    handleUpdateAdSchedule(idx, "caption", e.target.value)
                  }
                  placeholder="Ad Caption/Description"
                  className="bg-slate-700 border-slate-600 text-slate-50"
                />

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Ad Image
                  </label>
                  <ImageUploader
                    images={schedule.image ? [schedule.image] : []}
                    onChange={(imgs) =>
                      handleUpdateAdSchedule(idx, "image", imgs[0] || "")
                    }
                    maxImages={1}
                    userId={currentUserId}
                    displayId={displayId}
                    imageType="ad"
                    environment={environment}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">
                      Frequency (seconds)
                    </label>
                    <Input
                      type="number"
                      value={schedule.frequency}
                      onChange={(e) =>
                        handleUpdateAdSchedule(
                          idx,
                          "frequency",
                          parseInt(e.target.value) || 300
                        )
                      }
                      min="60"
                      max="3600"
                      className="bg-slate-700 border-slate-600 text-slate-50"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      How often to show this ad
                    </p>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">
                      Duration (seconds)
                    </label>
                    <Input
                      type="number"
                      value={schedule.duration}
                      onChange={(e) =>
                        handleUpdateAdSchedule(
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
                      How long to display the ad
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
                        schedule.dateRange.start
                          ? schedule.dateRange.start.split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        handleUpdateAdSchedule(
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
                        schedule.dateRange.end
                          ? schedule.dateRange.end.split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        handleUpdateAdSchedule(
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
                      value={schedule.timeRange.start || "09:00"}
                      onChange={(e) =>
                        handleUpdateAdSchedule(
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
                      value={schedule.timeRange.end || "17:00"}
                      onChange={(e) =>
                        handleUpdateAdSchedule(
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
                    Days of Week
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map((day) => (
                      <label
                        key={day.id}
                        className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          schedule.daysOfWeek?.includes(day.id)
                            ? "bg-blue-500 text-white"
                            : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={
                            schedule.daysOfWeek?.includes(day.id) || false
                          }
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

                <div className="pt-2 border-t border-slate-600/50">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`fullscreen-${idx}`}
                      checked={schedule.fullScreen}
                      onChange={(e) =>
                        handleUpdateAdSchedule(
                          idx,
                          "fullScreen",
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-purple-500"
                    />
                    <label
                      htmlFor={`fullscreen-${idx}`}
                      className="text-xs text-slate-300 cursor-pointer"
                    >
                      Display as fullscreen overlay
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {adSchedules.length === 0 && (
            <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-700 rounded-lg">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-sm mb-2">No ad schedules configured</p>
              <p className="text-xs text-slate-500">
                Ads will only display when enabled and within schedule ranges
              </p>
            </div>
          )}
        </div>
      </CollapsibleSection>

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
                Slideshow Images ({backgroundImages.length})
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
                  images={backgroundImages}
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

          {enableSlideshow && backgroundImages.length > 0 && (
            <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-400">
                Slideshow rotation: {slideshowSpeed / 1000} seconds per image
                {backgroundImages.length > 0 &&
                  ` | Full cycle: ${(
                    (backgroundImages.length * slideshowSpeed) /
                    1000
                  ).toFixed(0)}s`}
              </p>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Gallery Images */}
      {layoutConfig !== "Advanced" && (
        <CollapsibleSection title="🖼️ Hospital Gallery Images">
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="text-xs text-slate-400 font-medium">
                  Gallery Images ({galleryItems.length})
                </label>
                <p className="text-xs text-slate-500">
                  Images are stored securely and cannot be edited directly
                </p>
              </div>
            </div>

            {/* Gallery Media Library */}
            <GalleryMediaLibrary
              selectedItems={galleryItems}
              onItemsChange={handleGalleryItemsChange}
              userId={currentUserId}
              displayId={displayId}
              environment={environment}
              enableFullscreen={enableFullscreen}
            />

            {/* Display existing gallery items */}
            {galleryItems.length > 0 && (
              <div className="mt-4 space-y-3">
                <label className="text-xs text-slate-400 font-medium block">
                  Gallery Items ({galleryItems.length})
                </label>
                <div className="space-y-2">
                  {galleryItems.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-slate-700/30 p-3 rounded-lg space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="relative">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={`Gallery ${idx + 1}`}
                                className="w-16 h-16 object-cover rounded border border-slate-600"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-slate-600/50 rounded border border-slate-600 flex items-center justify-center">
                                <span className="text-xs text-slate-400">
                                  Image #{idx + 1}
                                </span>
                              </div>
                            )}
                            {item.fullScreen && (
                              <div className="absolute -top-1 -right-1">
                                <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                  <span className="text-xs text-white font-bold">
                                    F
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <Input
                              value={item.caption || ""}
                              onChange={(e) => {
                                const updated = [...galleryItems];
                                updated[idx] = {
                                  ...updated[idx],
                                  caption: e.target.value,
                                };
                                handleFieldChange("galleryItems", updated);
                              }}
                              placeholder="Image caption..."
                              className="bg-slate-700 border-slate-600 text-slate-50 text-sm"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const updated = galleryItems.filter(
                              (_: any, i: number) => i !== idx
                            );
                            handleFieldChange("galleryItems", updated);
                          }}
                          className="ml-2 px-3 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded text-sm hover:bg-red-500/30 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Fullscreen Toggle */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-600/50">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`fullscreen-${idx}`}
                            checked={item.fullScreen || false}
                            onChange={(e) => {
                              const updated = [...galleryItems];
                              updated[idx] = {
                                ...updated[idx],
                                fullScreen: e.target.checked,
                              };
                              handleFieldChange("galleryItems", updated);
                            }}
                            className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-purple-500"
                          />
                          <label
                            htmlFor={`fullscreen-${idx}`}
                            className="text-xs text-slate-300 cursor-pointer"
                          >
                            Display as fullscreen overlay ad
                          </label>
                        </div>
                        <div
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            item.fullScreen
                              ? "bg-purple-500/20 text-purple-400"
                              : "bg-slate-600/50 text-slate-400"
                          }`}
                        >
                          {item.fullScreen ? "Fullscreen" : "Normal"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

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
            <div key={idx} className="bg-slate-700/50 p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">
                  Doctor #{idx + 1}
                </span>
              </div>
              <Input
                value={doctor.name}
                onChange={(e) =>
                  handleUpdateDoctor(idx, "name", e.target.value)
                }
                placeholder="Dr. Name"
                className="bg-slate-700 border-slate-600 text-slate-50 text-sm"
              />
              <Input
                value={doctor.specialty}
                onChange={(e) =>
                  handleUpdateDoctor(idx, "specialty", e.target.value)
                }
                placeholder="Specialty (e.g., Cardiology)"
                className="bg-slate-700 border-slate-600 text-slate-50 text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={doctor.experience}
                  onChange={(e) =>
                    handleUpdateDoctor(idx, "experience", e.target.value)
                  }
                  placeholder="Experience (e.g., 15+ Years)"
                  className="bg-slate-700 border-slate-600 text-slate-50 text-sm"
                />
                <Input
                  value={doctor.available}
                  onChange={(e) =>
                    handleUpdateDoctor(idx, "available", e.target.value)
                  }
                  placeholder="Availability"
                  className="bg-slate-700 border-slate-600 text-slate-50 text-sm"
                />
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRemoveDoctor(idx)}
                className="w-full text-red-400 hover:bg-red-500/10 text-sm"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Remove Doctor
              </Button>
            </div>
          ))}
          {doctors.length === 0 && (
            <div className="text-center py-6 text-slate-500 text-sm">
              No featured doctors added yet. Click "Add Doctor" to start.
            </div>
          )}
          {layoutConfig !== "Authentic" && doctors.length > 0 && (
            <div className="mt-3">
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
              </p>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Animation & Speed Settings */}
      {layoutConfig === "Authentic" && (
        <CollapsibleSection title="⚡ Animation & Speed Settings">
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">
                Doctor Carousel Speed
              </label>
              <div className="space-y-2">
                <Input
                  type="range"
                  min="5"
                  max="100"
                  step="1"
                  value={slideSpeed}
                  onChange={(e) =>
                    handleFieldChange("slideSpeed", parseInt(e.target.value))
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Slow (5)</span>
                  <span>Current: {slideSpeed}</span>
                  <span>Fast (100)</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Controls how fast doctors scroll in the carousel (higher =
                faster)
              </p>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">
                Gallery Rotation Speed
              </label>
              <div className="p-2 bg-slate-700/30 rounded">
                <p className="text-xs text-slate-300">
                  {enableFullscreen
                    ? `Fullscreen mode: ${fullscreenDuration / 1000}s per image`
                    : galleryItems.length > 3
                    ? "6 seconds per image (auto-rotates when 4+ images)"
                    : galleryItems.length === 3
                    ? "Static display (Large + 2 small layout)"
                    : galleryItems.length === 2
                    ? "Static display (Stacked vertically)"
                    : galleryItems.length === 1
                    ? "Static display (Full screen)"
                    : "No gallery images configured"}
                </p>
              </div>
            </div>
          </div>
        </CollapsibleSection>
      )}

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
