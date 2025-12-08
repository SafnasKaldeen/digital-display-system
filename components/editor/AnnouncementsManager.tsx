"use client";

import React, { useState } from "react";
import { Plus, Trash2, Clock, X } from "lucide-react";

// Types - UPDATED: schedule is now optional for backward compatibility
export interface AnnouncementImage {
  id: string;
  url: string;
  duration: number; // in seconds
  schedule?: string[]; // Array of minute marks (e.g., ["00", "10", "20", "30", "40", "50"])
  name?: string;
}

interface AnnouncementsManagerProps {
  announcements: AnnouncementImage[];
  onChange: (announcements: AnnouncementImage[]) => void;
  userId?: string;
  displayId?: string;
  environment?: "preview" | "production";
  ImageUploader: React.ComponentType<any>;
}

// Predefined schedule options
const SCHEDULE_OPTIONS: Array<{ label: string; value: string[] }> = [
  { label: "Every 10 minutes", value: ["00", "10", "20", "30", "40", "50"] },
  { label: "Every 15 minutes", value: ["00", "15", "30", "45"] },
  { label: "Every 20 minutes", value: ["00", "20", "40"] },
  { label: "Every 30 minutes", value: ["00", "30"] },
  { label: "Every hour", value: ["00"] },
  { label: "Twice per hour", value: ["00", "30"] },
  { label: "Three times per hour", value: ["00", "20", "40"] },
  { label: "Four times per hour", value: ["00", "15", "30", "45"] },
  { label: "Six times per hour", value: ["00", "10", "20", "30", "40", "50"] },
  { label: "Custom", value: [] },
];

// Available minute marks
const ALL_MINUTE_MARKS = [
  "00",
  "05",
  "10",
  "15",
  "20",
  "25",
  "30",
  "35",
  "40",
  "45",
  "50",
  "55",
];

// Helper to get schedule safely
const getSchedule = (announcement: AnnouncementImage): string[] => {
  return announcement.schedule || ["00", "10", "20", "30", "40", "50"];
};

export default function AnnouncementsManager({
  announcements,
  onChange,
  userId,
  displayId,
  environment = "preview",
  ImageUploader,
}: AnnouncementsManagerProps) {
  const [showAddNew, setShowAddNew] = useState(false);
  const [tempImage, setTempImage] = useState<string[]>([]);
  const [customSchedule, setCustomSchedule] = useState<string[]>([
    "00",
    "10",
    "20",
    "30",
    "40",
    "50",
  ]);

  const handleAddAnnouncement = () => {
    if (tempImage.length > 0) {
      const newAnnouncement: AnnouncementImage = {
        id: `ann-${Date.now()}`,
        url: tempImage[0],
        duration: 10,
        schedule: ["00", "10", "20", "30", "40", "50"],
      };
      onChange([...announcements, newAnnouncement]);
      setTempImage([]);
      setShowAddNew(false);
    }
  };

  const updateAnnouncement = (
    id: string,
    field: keyof AnnouncementImage,
    value: any
  ) => {
    const updated = announcements.map((ann) =>
      ann.id === id ? { ...ann, [field]: value } : ann
    );
    onChange(updated);
  };

  const removeAnnouncement = (id: string) => {
    onChange(announcements.filter((ann) => ann.id !== id));
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  };

  // FIXED: Add null check
  const formatSchedule = (schedule: string[] | undefined) => {
    if (!schedule || schedule.length === 0) return "Never";
    if (schedule.length === 1) return `Hourly at :${schedule[0]}`;
    if (schedule.length === 2)
      return `Twice/hour :${schedule[0]}, :${schedule[1]}`;
    if (schedule.length === 3) return `3x/hour :${schedule.join(", :")}`;
    if (schedule.length === 4) return `4x/hour :${schedule.join(", :")}`;
    if (schedule.length === 6) return `Every 10 min (:${schedule.join(", :")})`;
    if (schedule.length === 12) return `Every 5 min`;
    return `${schedule.length}x/hour :${schedule.slice(0, 3).join(", :")}...`;
  };

  const handlePresetScheduleChange = (
    announcementId: string,
    presetValue: string[]
  ) => {
    if (presetValue.length > 0) {
      updateAnnouncement(announcementId, "schedule", [...presetValue]);
    }
  };

  const toggleCustomMinute = (announcementId: string, minute: string) => {
    const announcement = announcements.find((a) => a.id === announcementId);
    if (!announcement) return;

    const currentSchedule = getSchedule(announcement);

    if (currentSchedule.includes(minute)) {
      const newSchedule = currentSchedule.filter((m) => m !== minute);
      updateAnnouncement(announcementId, "schedule", newSchedule);
    } else {
      const newSchedule = [...currentSchedule, minute].sort();
      updateAnnouncement(announcementId, "schedule", newSchedule);
    }
  };

  const findMatchingPreset = (announcement: AnnouncementImage): string => {
    const schedule = getSchedule(announcement);
    const scheduleString = JSON.stringify([...schedule].sort());
    const preset = SCHEDULE_OPTIONS.find(
      (opt) => JSON.stringify(opt.value.sort()) === scheduleString
    );
    return preset ? JSON.stringify(preset.value) : JSON.stringify(schedule);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-200">
            Advertisement Images
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Schedule images to display at specific times each hour
          </p>
        </div>
        <div className="text-xs text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
          {announcements.length} image{announcements.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Existing Announcements */}
      {announcements.length > 0 && (
        <div className="space-y-4">
          {announcements.map((announcement) => {
            const schedule = getSchedule(announcement);

            return (
              <div
                key={announcement.id}
                className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden hover:border-gray-600 transition-colors"
              >
                <div className="flex gap-3 p-4">
                  {/* Image Preview */}
                  <div className="flex-shrink-0">
                    <img
                      src={announcement.url}
                      alt="Announcement"
                      className="w-20 h-20 object-cover rounded border border-gray-700"
                    />
                  </div>

                  {/* Controls */}
                  <div className="flex-1 space-y-4">
                    {/* Duration Control */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Display Duration
                        </label>
                        <span className="text-xs font-medium text-pink-400">
                          {formatDuration(announcement.duration)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="120"
                        step="5"
                        value={announcement.duration}
                        onChange={(e) =>
                          updateAnnouncement(
                            announcement.id,
                            "duration",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                      />
                      <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
                        <span>5s</span>
                        <span>2m</span>
                      </div>
                    </div>

                    {/* Schedule Selection */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs text-gray-400">
                          Schedule
                        </label>
                        <span className="text-xs font-medium text-pink-400">
                          {formatSchedule(schedule)}
                        </span>
                      </div>

                      {/* Preset Schedule Options */}
                      <div className="mb-3">
                        <select
                          value={findMatchingPreset(announcement)}
                          onChange={(e) => {
                            const preset = SCHEDULE_OPTIONS.find(
                              (opt) =>
                                JSON.stringify(opt.value) === e.target.value
                            );
                            if (preset) {
                              handlePresetScheduleChange(announcement.id, [
                                ...preset.value,
                              ]);
                            }
                          }}
                          className="w-full text-xs bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-gray-100 focus:outline-none focus:ring-1 focus:ring-pink-500"
                        >
                          {SCHEDULE_OPTIONS.map((option) => (
                            <option
                              key={option.label}
                              value={JSON.stringify(option.value)}
                            >
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Custom Minute Selection */}
                      {schedule.length === 0 ||
                      !SCHEDULE_OPTIONS.some(
                        (opt) =>
                          JSON.stringify(opt.value) ===
                          JSON.stringify([...schedule].sort())
                      ) ? (
                        <div>
                          <p className="text-xs text-gray-400 mb-2">
                            Select minutes past each hour:
                          </p>
                          <div className="grid grid-cols-6 gap-1">
                            {ALL_MINUTE_MARKS.map((minute) => (
                              <button
                                key={minute}
                                onClick={() =>
                                  toggleCustomMinute(announcement.id, minute)
                                }
                                className={`text-xs py-1 rounded ${
                                  schedule.includes(minute)
                                    ? "bg-pink-500 text-white"
                                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                }`}
                              >
                                :{minute}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => removeAnnouncement(announcement.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                      title="Remove announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Info Footer */}
                <div className="px-4 py-2 bg-gray-900/50 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-gray-500">
                      Will display at {schedule.map((m) => `:${m}`).join(", ")}{" "}
                      past each hour
                    </p>
                    <div className="text-[10px] text-pink-400 font-medium">
                      {schedule.length}x/hour
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Announcement */}
      {showAddNew ? (
        <div className="bg-gray-800/30 border-2 border-dashed border-gray-700 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-300">
              Add New Advertisement
            </h4>
            <button
              onClick={() => {
                setShowAddNew(false);
                setTempImage([]);
              }}
              className="text-gray-400 hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <ImageUploader
            images={tempImage}
            onChange={setTempImage}
            maxImages={1}
            userId={userId}
            displayId={displayId}
            imageType="slideshow"
            environment={environment}
          />

          {tempImage.length > 0 && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  Display Duration
                </label>
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={10}
                  readOnly
                  className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
                  <span>5s</span>
                  <span>10s (default)</span>
                  <span>2m</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  Schedule
                </label>
                <select
                  value={JSON.stringify(customSchedule)}
                  onChange={(e) =>
                    setCustomSchedule(JSON.parse(e.target.value))
                  }
                  className="w-full text-xs bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-100 focus:outline-none focus:ring-1 focus:ring-pink-500"
                >
                  {SCHEDULE_OPTIONS.filter((opt) => opt.value.length > 0).map(
                    (option) => (
                      <option
                        key={option.label}
                        value={JSON.stringify(option.value)}
                      >
                        {option.label}
                      </option>
                    )
                  )}
                </select>
              </div>

              <button
                onClick={handleAddAnnouncement}
                className="w-full py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Add Advertisement
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setShowAddNew(true)}
          className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-700 rounded-lg hover:border-pink-500 hover:bg-gray-800/30 text-gray-400 hover:text-pink-400 transition-all group"
        >
          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Add Advertisement Image</span>
        </button>
      )}

      {/* Help Text */}
      {announcements.length === 0 && !showAddNew && (
        <div className="text-center py-6 text-gray-500 text-sm">
          <div className="w-12 h-12 mx-auto mb-2 opacity-30 flex items-center justify-center">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="w-12 h-12"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p>No scheduled advertisements yet</p>
          <p className="text-xs mt-1 max-w-xs mx-auto">
            Schedule images to display at specific times each hour (e.g., every
            10 minutes at :00, :10, :20, etc.)
          </p>
        </div>
      )}
    </div>
  );
}
