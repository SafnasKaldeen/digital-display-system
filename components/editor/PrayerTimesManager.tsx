"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  RotateCcw,
  Upload,
  Trash2,
  Check,
  Calendar,
  AlertCircle,
} from "lucide-react";

// Types
interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

interface IqamahOffsets {
  fajr: number;
  sunrise: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
}

interface PrayerSchedule {
  label: string;
  totalDays: number;
  created_at: string;
}

interface PrayerTimesManagerProps {
  displayId: string;
  prayerTimes: PrayerTimes;
  iqamahOffsets: IqamahOffsets;
  label: string;
  onPrayerTimesChange: (times: PrayerTimes) => void;
  onIqamahOffsetsChange: (offsets: IqamahOffsets) => void;
  onLabelChange: (label: string) => void;
}

export default function PrayerTimesManager({
  displayId,
  prayerTimes,
  iqamahOffsets,
  onPrayerTimesChange,
  onIqamahOffsetsChange,
  onLabelChange,
  label,
}: PrayerTimesManagerProps) {
  const [schedules, setSchedules] = useState<PrayerSchedule[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  const [isResettingPrayerTimes, setIsResettingPrayerTimes] = useState(false);
  const [defaultPrayerTimes, setDefaultPrayerTimes] =
    useState<PrayerTimes | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch available prayer schedules
  useEffect(() => {
    fetchSchedules();
  }, []);

  // Initialize selected schedule from label prop
  useEffect(() => {
    if (label && schedules.length > 0) {
      const scheduleExists = schedules.some((s) => s.label === label);
      if (scheduleExists) {
        loadScheduleData(label);
      }
    }
  }, [label, schedules]);

  const fetchSchedules = async () => {
    setIsLoadingSchedules(true);
    setFetchError(null);
    try {
      console.log("Fetching schedules...");
      const response = await fetch("/api/prayer-schedules");
      console.log("Schedules response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Schedules data:", data);

        if (data.schedules && Array.isArray(data.schedules)) {
          setSchedules(data.schedules);
          console.log(`Found ${data.schedules.length} schedules`);
        } else {
          console.warn("No schedules array in response");
          setSchedules([]);
        }
      } else {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        setFetchError(
          `Failed to fetch schedules: ${errorData.error || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
      setFetchError(
        error instanceof Error ? error.message : "Failed to fetch schedules"
      );
    } finally {
      setIsLoadingSchedules(false);
    }
  };

  // Fetch prayer times for today from selected schedule
  const fetchPrayerTimesForToday = async (scheduleLabel: string) => {
    try {
      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();

      console.log(
        `Fetching prayer times for ${scheduleLabel} on ${month}/${day}`
      );

      const response = await fetch(
        `/api/prayer-times?label=${encodeURIComponent(
          scheduleLabel
        )}&month=${month}&day=${day}`
      );

      console.log("Prayer times response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Prayer times data:", data);

        if (data.prayerTimes) {
          return {
            fajr: data.prayerTimes.fajr,
            sunrise: data.prayerTimes.sunrise,
            dhuhr: data.prayerTimes.dhuhr,
            asr: data.prayerTimes.asr,
            maghrib: data.prayerTimes.maghrib,
            isha: data.prayerTimes.isha,
          };
        }
      } else {
        const errorData = await response.json();
        console.error("Prayer times error:", errorData);
        setFetchError(
          errorData.details || errorData.error || "Failed to fetch prayer times"
        );
      }
      return null;
    } catch (error) {
      console.error("Error fetching prayer times:", error);
      setFetchError(
        error instanceof Error ? error.message : "Failed to fetch prayer times"
      );
      return null;
    }
  };

  // Load schedule data without changing prayer times
  const loadScheduleData = async (scheduleLabel: string) => {
    try {
      const times = await fetchPrayerTimesForToday(scheduleLabel);
      if (times) {
        setDefaultPrayerTimes(times);
      }
    } catch (error) {
      console.error("Error loading schedule data:", error);
    }
  };

  // Handle schedule selection
  const handleScheduleSelect = async (scheduleLabel: string) => {
    onLabelChange(scheduleLabel);
    setIsResettingPrayerTimes(true);
    setFetchError(null);

    try {
      const times = await fetchPrayerTimesForToday(scheduleLabel);
      if (times) {
        setDefaultPrayerTimes(times);
        onPrayerTimesChange(times);
      } else {
        console.warn("No prayer times returned for schedule");
      }
    } catch (error) {
      console.error("Error loading schedule:", error);
      setFetchError(
        error instanceof Error ? error.message : "Failed to load schedule"
      );
    } finally {
      setIsResettingPrayerTimes(false);
    }
  };

  // Reset prayer times to schedule defaults
  const resetPrayerTimesToSchedule = async () => {
    if (!label) return;

    setIsResettingPrayerTimes(true);
    setFetchError(null);

    try {
      const times = await fetchPrayerTimesForToday(label);
      if (times) {
        setDefaultPrayerTimes(times);
        onPrayerTimesChange(times);
      }
    } catch (error) {
      console.error("Error resetting prayer times:", error);
      setFetchError(
        error instanceof Error ? error.message : "Failed to reset prayer times"
      );
    } finally {
      setIsResettingPrayerTimes(false);
    }
  };

  // Check if current prayer times differ from defaults
  const arePrayerTimesModified = () => {
    if (!defaultPrayerTimes) return false;

    return Object.keys(prayerTimes).some((prayer) => {
      const prayerKey = prayer as keyof PrayerTimes;
      return prayerTimes[prayerKey] !== defaultPrayerTimes[prayerKey];
    });
  };

  // Handle CSV file upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setUploadError("Please upload a CSV file");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/prayer-schedules/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setUploadSuccess(
        `Successfully uploaded "${data.label}" with ${data.recordsInserted} prayer times`
      );

      // Refresh schedules list
      await fetchSchedules();

      // Auto-select the newly uploaded schedule
      if (data.label) {
        await handleScheduleSelect(data.label);
      }

      // Clear success message after 5 seconds
      setTimeout(() => setUploadSuccess(null), 5000);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Delete a schedule
  const handleDeleteSchedule = async (scheduleLabel: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the schedule "${scheduleLabel}"? This will remove all associated prayer times.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/prayer-schedules?label=${encodeURIComponent(scheduleLabel)}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        await fetchSchedules();
        if (label === scheduleLabel) {
          onLabelChange("");
          setDefaultPrayerTimes(null);
        }
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Error Display */}
      {fetchError && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-400 text-sm font-medium">Error</p>
            <p className="text-red-300 text-xs mt-1">{fetchError}</p>
          </div>
          <button
            onClick={() => setFetchError(null)}
            className="text-red-400 hover:text-red-300"
          >
            ×
          </button>
        </div>
      )}

      {/* CSV Upload Section */}
      <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
        <h3 className="text-sm font-medium text-gray-200 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Upload Prayer Time Schedule
        </h3>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-700 rounded-lg hover:border-gray-600 hover:bg-gray-800/30 text-gray-400 hover:text-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-4 h-4" />
          <span className="text-sm font-medium">
            {isUploading ? "Uploading..." : "Upload CSV File"}
          </span>
        </button>

        <p className="text-xs text-gray-500 mt-2">
          CSV should have columns: label, month, day, fajr, sunrise, dhuhr, asr,
          maghrib, isha
        </p>

        {uploadError && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
            <span className="text-red-400 text-sm">{uploadError}</span>
          </div>
        )}

        {uploadSuccess && (
          <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-2">
            <Check className="w-4 h-4 text-green-400 mt-0.5" />
            <span className="text-green-400 text-sm">{uploadSuccess}</span>
          </div>
        )}
      </div>

      {/* Schedule Selection */}
      <div className="space-y-2">
        <label className="text-sm text-gray-300 block">
          Select Prayer Schedule
        </label>

        {isLoadingSchedules ? (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-pink-500 border-t-transparent"></div>
          </div>
        ) : schedules.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            No schedules available. Upload a CSV file to get started.
          </p>
        ) : (
          <div className="space-y-2">
            {schedules.map((schedule) => {
              const isSelected = label === schedule.label;

              return (
                <div
                  key={schedule.label}
                  className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                    isSelected
                      ? "border-pink-500 bg-pink-500/10 shadow-lg shadow-pink-500/20"
                      : "border-gray-700 hover:border-gray-600 bg-gray-800/30"
                  }`}
                  onClick={() => handleScheduleSelect(schedule.label)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium ${
                            isSelected ? "text-pink-400" : "text-gray-200"
                          }`}
                        >
                          {schedule.label}
                        </span>
                        {isSelected && (
                          <div className="flex items-center gap-1">
                            <Check className="w-4 h-4 text-pink-400" />
                            <span className="text-xs px-2 py-0.5 bg-pink-500/20 text-pink-400 rounded-full font-medium">
                              Active
                            </span>
                          </div>
                        )}
                      </div>
                      <p
                        className={`text-xs mt-1 ${
                          isSelected ? "text-pink-300/70" : "text-gray-400"
                        }`}
                      >
                        {schedule.totalDays} days • Created{" "}
                        {new Date(schedule.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSchedule(schedule.label);
                      }}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                      title="Delete schedule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Prayer Times Editor */}
      <div className="space-y-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-200">
            Daily Prayer Times
          </h3>
          {label && (
            <button
              onClick={resetPrayerTimesToSchedule}
              disabled={isResettingPrayerTimes || !defaultPrayerTimes}
              className={`text-xs px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors ${
                arePrayerTimesModified() && defaultPrayerTimes
                  ? "bg-pink-500 hover:bg-pink-600 text-white"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              } ${
                isResettingPrayerTimes ? "opacity-70 cursor-not-allowed" : ""
              }`}
              title={
                defaultPrayerTimes
                  ? "Reset to schedule defaults"
                  : "No default times available"
              }
            >
              <RotateCcw
                className={`w-3 h-3 ${
                  isResettingPrayerTimes ? "animate-spin" : ""
                }`}
              />
              {isResettingPrayerTimes ? "Resetting..." : "Reset to Schedule"}
            </button>
          )}
        </div>

        {arePrayerTimesModified() && defaultPrayerTimes && (
          <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-400">
            ⚠️ Prayer times have been modified from schedule defaults
          </div>
        )}

        {Object.entries(prayerTimes).map(([prayer, time]) => {
          const prayerKey = prayer as keyof PrayerTimes;
          const isModified =
            defaultPrayerTimes && time !== defaultPrayerTimes[prayerKey];

          return (
            <div key={prayer} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300 capitalize font-medium">
                  {prayer}
                </label>
                {isModified && (
                  <span className="text-xs text-yellow-400 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                    Modified
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) =>
                      onPrayerTimesChange({
                        ...prayerTimes,
                        [prayerKey]: e.target.value,
                      })
                    }
                    className={`w-full bg-gray-800 border ${
                      isModified ? "border-yellow-500/50" : "border-gray-700"
                    } rounded px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500`}
                  />
                  <p className="text-xs text-gray-400 mt-1">Adhan</p>
                </div>
                <div>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={iqamahOffsets[prayerKey]}
                    onChange={(e) =>
                      onIqamahOffsetsChange({
                        ...iqamahOffsets,
                        [prayerKey]: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-100 text-center focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    +{iqamahOffsets[prayerKey]} min Iqamah
                  </p>
                </div>
              </div>
              {isModified && defaultPrayerTimes && (
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <span>Schedule default:</span>
                  <span className="text-green-400">
                    {defaultPrayerTimes[prayerKey]}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
