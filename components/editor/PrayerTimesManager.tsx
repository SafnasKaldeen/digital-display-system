"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Check,
  RotateCcw,
  AlertCircle,
  Upload,
  Trash2,
  X,
  FileText,
  Loader2,
} from "lucide-react";

// Types for prayer times (extracted from main file)
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

interface PrayerNames {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

interface PrayerTimesManagerProps {
  displayId: string;
  prayerTimes: PrayerTimes;
  prayerNames?: PrayerNames; // Add this
  iqamahOffsets: IqamahOffsets;
  label: string;
  onPrayerTimesChange: (times: PrayerTimes) => void;
  onPrayerNamesChange?: (names: PrayerNames) => void; // Add this
  onIqamahOffsetsChange: (offsets: IqamahOffsets) => void;
  onLabelChange: (label: string) => void;
}

interface UserData {
  role: string;
  email: string;
  business_name?: string;
}

interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type: "label" | "delete" | "loading";
  currentLabel?: string;
  isLoading?: boolean;
  onConfirm: (value?: string) => void;
  onCancel: () => void;
}

// Consistent Modal Component
const ConsistentModal: React.FC<ModalProps> = ({
  isOpen,
  title,
  message,
  type,
  currentLabel = "",
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const [label, setLabel] = useState(currentLabel);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && type === "label" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, type]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (type === "label") {
      if (label.trim()) {
        onConfirm(label.trim());
        setLabel("");
      }
    } else {
      onConfirm();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && type === "label" && label.trim()) {
      handleConfirm();
    }
    if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-gray-900 rounded-xl border border-gray-700 shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            {type === "label" ? (
              <FileText className="w-5 h-5 text-pink-400" />
            ) : type === "delete" ? (
              <Trash2 className="w-5 h-5 text-red-400" />
            ) : (
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
            )}
            <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
          </div>
          {type !== "loading" && (
            <button
              onClick={onCancel}
              className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-300 transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6">
          {type === "loading" ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-500/30 rounded-full"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-300 mt-6 text-center">{message}</p>
              <p className="text-sm text-gray-500 mt-2">Please wait...</p>
            </div>
          ) : (
            <>
              <p className="text-gray-300 mb-4">{message}</p>

              {type === "label" && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Schedule Label
                  </label>
                  <input
                    ref={inputRef}
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter a name for this schedule"
                    maxLength={50}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    This will be used to identify the schedule
                  </p>
                </div>
              )}

              {type === "delete" && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-400">
                        This action cannot be undone
                      </p>
                      <p className="text-xs text-red-300/70 mt-1">
                        All prayer times associated with this schedule will be
                        permanently deleted.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer - Only show for non-loading modals */}
        {type !== "loading" && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading || (type === "label" && !label.trim())}
              className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                type === "label"
                  ? "bg-pink-500 hover:bg-pink-600 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {type === "label" ? "Uploading..." : "Deleting..."}
                </span>
              ) : type === "label" ? (
                "Create Schedule"
              ) : (
                "Delete Schedule"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function PrayerTimesManager({
  displayId,
  prayerTimes,
  prayerNames, // Add this
  iqamahOffsets,
  onPrayerTimesChange,
  onPrayerNamesChange, // Add this
  onIqamahOffsetsChange,
  onLabelChange,
  label,
}: PrayerTimesManagerProps) {
  const [schedules, setSchedules] = useState<PrayerSchedule[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  const [isResettingPrayerTimes, setIsResettingPrayerTimes] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"label" | "delete" | "loading">(
    "label"
  );
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [pendingScheduleLabel, setPendingScheduleLabel] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // Store the ORIGINAL prayer times from the selected schedule
  const [originalScheduleTimes, setOriginalScheduleTimes] =
    useState<PrayerTimes | null>(null);
  // Track which schedule's times we're using as reference
  const [referenceScheduleLabel, setReferenceScheduleLabel] =
    useState<string>(label);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoadingUser(true);
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setUserData(data.user);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUserData();
  }, []);

  // Load reference times when label changes
  useEffect(() => {
    const loadScheduleIfNeeded = async () => {
      if (!label) return;

      setIsResettingPrayerTimes(true);
      try {
        const times = await fetchPrayerTimesForToday(label);
        if (times) {
          // ALWAYS update reference when label changes
          setOriginalScheduleTimes(times);
          setReferenceScheduleLabel(label);
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

    loadScheduleIfNeeded();
  }, [label]);

  // Fetch available prayer schedules
  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setIsLoadingSchedules(true);
    setFetchError(null);
    try {
      const response = await fetch("/api/prayer-schedules");
      if (response.ok) {
        const data = await response.json();
        if (data.schedules && Array.isArray(data.schedules)) {
          setSchedules(data.schedules);
        } else {
          setSchedules([]);
        }
      } else {
        const errorData = await response.json();
        setFetchError(
          `Failed to fetch schedules: ${errorData.error || "Unknown error"}`
        );
      }
    } catch (error) {
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

      const response = await fetch(
        `/api/prayer-times?label=${encodeURIComponent(
          scheduleLabel
        )}&month=${month}&day=${day}`
      );

      if (response.ok) {
        const data = await response.json();
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
        setFetchError(
          errorData.details || errorData.error || "Failed to fetch prayer times"
        );
      }
      return null;
    } catch (error) {
      setFetchError(
        error instanceof Error ? error.message : "Failed to fetch prayer times"
      );
      return null;
    }
  };

  // Handle schedule selection
  const handleScheduleSelect = async (scheduleLabel: string) => {
    // Prevent selecting the same schedule again
    if (scheduleLabel === referenceScheduleLabel) return;

    // Update local state first for immediate UI feedback
    setReferenceScheduleLabel(scheduleLabel);

    // Update parent - this will fetch and update prayer times
    onLabelChange(scheduleLabel);
  };

  // Reset prayer times to schedule defaults
  const resetPrayerTimesToSchedule = async () => {
    if (!referenceScheduleLabel) return;

    setIsResettingPrayerTimes(true);
    setFetchError(null);

    try {
      const times = await fetchPrayerTimesForToday(referenceScheduleLabel);
      if (times) {
        setOriginalScheduleTimes(times);
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

  // Check if current prayer times differ from the selected schedule's times
  const arePrayerTimesModified = () => {
    if (!originalScheduleTimes) return false;

    return Object.keys(prayerTimes).some((prayer) => {
      const prayerKey = prayer as keyof PrayerTimes;
      return prayerTimes[prayerKey] !== originalScheduleTimes[prayerKey];
    });
  };

  // Check if CSV file has label column
  const checkCsvHasLabelColumn = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      try {
        const reader = new FileReader();

        reader.onload = (e) => {
          try {
            const text = e.target?.result as string;
            const lines = text.split("\n");

            if (lines.length > 0) {
              const headers = lines[0]
                .split(",")
                .map((h) => h.trim().toLowerCase());
              const hasLabelColumn = headers.includes("label");
              resolve(hasLabelColumn);
            } else {
              resolve(false);
            }
          } catch (error) {
            console.error("Error parsing CSV:", error);
            resolve(false);
          }
        };

        reader.onerror = () => {
          resolve(false);
        };

        // Only read first 1KB to check headers
        const blob = file.slice(0, 1024);
        reader.readAsText(blob);
      } catch (error) {
        console.error("Error checking CSV:", error);
        resolve(false);
      }
    });
  };

  // Handle CSV file upload with smart label detection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setUploadError("Please upload a CSV file");
      return;
    }

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Show loading modal while checking CSV
    setModalType("loading");
    setModalTitle("Checking CSV File");
    setModalMessage("Checking if CSV contains label column...");
    setIsModalOpen(true);

    try {
      // Check if CSV has label column
      const hasLabelColumn = await checkCsvHasLabelColumn(file);

      if (hasLabelColumn) {
        // CSV has label column, proceed directly to upload
        setIsModalOpen(false);
        await processCsvUploadDirectly(file);
      } else {
        // CSV doesn't have label column, ask user for label
        setPendingFile(file);
        setModalType("label");
        setModalTitle("Name Your Schedule");
        setModalMessage(
          "Your CSV file doesn't contain a 'label' column. Please provide a name for this prayer time schedule."
        );
      }
    } catch (error) {
      console.error("Error checking CSV:", error);
      setIsModalOpen(false);
      setUploadError("Failed to read CSV file. Please check the file format.");
    }
  };

  // Process CSV upload directly (when CSV has label column)
  const processCsvUploadDirectly = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/prayer-schedules/upload", {
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
      if (data.label && isMountedRef.current) {
        // Use a small delay to ensure state is updated
        setTimeout(() => {
          if (isMountedRef.current) {
            handleScheduleSelect(data.label);
          }
        }, 100);
      }

      // Clear success message after 5 seconds
      setTimeout(() => {
        if (isMountedRef.current) {
          setUploadSuccess(null);
        }
      }, 5000);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  // Process CSV upload with provided label
  const processCsvUploadWithLabel = async (
    scheduleLabel: string,
    file: File
  ) => {
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("label", scheduleLabel);

      const response = await fetch("/api/admin/prayer-schedules/upload", {
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
      if (data.label && isMountedRef.current) {
        // Use a small delay to ensure state is updated
        setTimeout(() => {
          if (isMountedRef.current) {
            handleScheduleSelect(data.label);
          }
        }, 100);
      }

      // Clear success message after 5 seconds
      setTimeout(() => {
        if (isMountedRef.current) {
          setUploadSuccess(null);
        }
      }, 5000);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (scheduleLabel: string) => {
    setPendingScheduleLabel(scheduleLabel);
    setModalType("delete");
    setModalTitle("Delete Schedule");
    setModalMessage(
      `Are you sure you want to delete the schedule "${scheduleLabel}"?`
    );
    setIsModalOpen(true);
  };

  // Handle modal confirmation
  const handleModalConfirm = async (value?: string) => {
    if (modalType === "label" && value && pendingFile) {
      // Process CSV upload with provided label
      await processCsvUploadWithLabel(value, pendingFile);
      setPendingFile(null);
      setIsModalOpen(false);
    } else if (modalType === "delete" && pendingScheduleLabel) {
      // Process schedule deletion
      setIsModalOpen(false);
      await handleDeleteSchedule(pendingScheduleLabel);
    }
  };

  // Handle modal cancel
  const handleModalCancel = () => {
    setIsModalOpen(false);
    setPendingFile(null);
    setPendingScheduleLabel("");
  };

  // Delete a schedule
  const handleDeleteSchedule = async (scheduleLabel: string) => {
    try {
      const response = await fetch(
        `/api/admin/prayer-schedules?label=${encodeURIComponent(
          scheduleLabel
        )}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        await fetchSchedules();
        if (referenceScheduleLabel === scheduleLabel) {
          // Find another schedule to select
          const otherSchedules = schedules.filter(
            (s) => s.label !== scheduleLabel
          );
          if (otherSchedules.length > 0) {
            handleScheduleSelect(otherSchedules[0].label);
          } else {
            onLabelChange("");
            setReferenceScheduleLabel("");
            setOriginalScheduleTimes(null);
          }
        }
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
    }
  };

  // Check if user is admin
  const isAdmin = userData?.role === "admin";

  return (
    <>
      <ConsistentModal
        isOpen={isModalOpen}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        currentLabel={pendingScheduleLabel}
        isLoading={isUploading}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
      />

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

        {/* Show loading state while checking user role */}
        {isLoadingUser ? (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-pink-500 border-t-transparent"></div>
            <p className="text-sm text-gray-400 mt-2">
              Checking permissions...
            </p>
          </div>
        ) : (
          <>
            {/* CSV Upload Section - Only for admins */}
            {isAdmin && (
              <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-200 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Upload Prayer Time Schedule
                  </h3>
                  <span className="text-xs px-2 py-1 bg-pink-500/20 text-pink-400 rounded-full font-medium">
                    Admin Only
                  </span>
                </div>

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
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-medium">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Upload CSV File
                      </span>
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 mt-2">
                  CSV should have columns: month, day, fajr, sunrise, dhuhr,
                  asr, maghrib, isha (label column optional)
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  If label column is missing, you'll be prompted to enter a
                  name.
                </p>

                {uploadError && (
                  <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
                    <span className="text-red-400 text-sm">{uploadError}</span>
                  </div>
                )}

                {uploadSuccess && (
                  <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 mt-0.5" />
                    <span className="text-green-400 text-sm">
                      {uploadSuccess}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Schedule Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300 block">
                  Select Prayer Schedule
                </label>
                {!isAdmin && (
                  <span className="text-xs text-gray-500 italic">
                    View only - contact admin to modify schedules
                  </span>
                )}
              </div>

              {isLoadingSchedules ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-pink-500 border-t-transparent"></div>
                </div>
              ) : schedules.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  No schedules available.
                  {isAdmin
                    ? " Upload a CSV file to get started."
                    : " Admin can upload CSV schedules."}
                </p>
              ) : (
                <div className="space-y-2">
                  {schedules.map((schedule) => {
                    const isSelected =
                      referenceScheduleLabel === schedule.label;

                    return (
                      <div
                        key={schedule.label}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          isSelected
                            ? "border-pink-500 bg-pink-500/10 shadow-lg shadow-pink-500/20"
                            : "border-gray-700 hover:border-gray-600 bg-gray-800/30"
                        } ${!isSelected ? "cursor-pointer" : ""}`}
                        onClick={() =>
                          !isSelected && handleScheduleSelect(schedule.label)
                        }
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
                                isSelected
                                  ? "text-pink-300/70"
                                  : "text-gray-400"
                              }`}
                            >
                              {schedule.totalDays} days • Created{" "}
                              {new Date(
                                schedule.created_at
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteModal(schedule.label);
                              }}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors ml-2"
                              title="Delete schedule"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Prayer Names Editor - Add this section */}
            {prayerNames && onPrayerNamesChange && (
              <div className="space-y-4 pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-200">
                    Prayer Display Names
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      const defaultNames = {
                        fajr: "Fajr",
                        sunrise: "Sunrise",
                        dhuhr: "Dhuhr",
                        asr: "Asr",
                        maghrib: "Maghrib",
                        isha: "Isha",
                      };
                      onPrayerNamesChange(defaultNames);
                    }}
                    className="text-xs px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                  >
                    Reset to Default
                  </button>
                </div>

                <p className="text-xs text-gray-400">
                  Customize how each prayer name appears on the display screen
                </p>

                <div className="space-y-3">
                  {Object.entries(prayerNames).map(([key, value]) => {
                    const defaultNames = {
                      fajr: "Fajr",
                      sunrise: "Sunrise",
                      dhuhr: "Dhuhr",
                      asr: "Asr",
                      maghrib: "Maghrib",
                      isha: "Isha",
                    };
                    const defaultName =
                      defaultNames[key as keyof typeof defaultNames];
                    const isCustom = value !== defaultName;

                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-gray-300 capitalize">
                            {key}
                            <span className="text-xs text-gray-500 ml-2">
                              Default: {defaultName}
                            </span>
                          </label>
                          {isCustom && (
                            <span className="text-xs text-green-400">
                              Custom
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => {
                            const newNames = { ...prayerNames };
                            newNames[key as keyof PrayerNames] = e.target.value;
                            onPrayerNamesChange(newNames);
                          }}
                          placeholder={`Enter custom name (e.g., ${
                            key === "fajr" ? "Subah" : defaultName
                          })`}
                          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />

                        {/* Example suggestions for Fajr */}
                        {key === "fajr" && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {[
                              "Subah",
                              "Fajr",
                              "Morning Prayer",
                              "صبح",
                              "சுபஹ்",
                              "பஜ்ர்",
                            ].map((suggestion, index) => (
                              <button
                                key={`${suggestion}-${index}`}
                                type="button"
                                onClick={() => {
                                  const newNames = { ...prayerNames };
                                  newNames.fajr = suggestion;
                                  onPrayerNamesChange(newNames);
                                }}
                                className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}

                        {key === "maghrib" && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {[
                              "Maghrib",
                              "Sunset Prayer",
                              "مغرب",
                              "Maghrib",
                              "மஹ்ரிப்",
                            ].map((suggestion, index) => (
                              <button
                                key={`${suggestion}-${index}`}
                                type="button"
                                onClick={() => {
                                  const newNames = { ...prayerNames };
                                  newNames.maghrib = suggestion;
                                  onPrayerNamesChange(newNames);
                                }}
                                className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}

                        {key === "asr" && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {[
                              "Asr",
                              "Afternoon Prayer",
                              "عصر",
                              "அஸ்ர்",
                              "அஸ்ர்",
                            ].map((suggestion, index) => (
                              <button
                                key={`${suggestion}-${index}`}
                                type="button"
                                onClick={() => {
                                  const newNames = { ...prayerNames };
                                  newNames.asr = suggestion;
                                  onPrayerNamesChange(newNames);
                                }}
                                className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}

                        {key === "sunrise" && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {[
                              "Sunrise",
                              "Shuruq",
                              "شروق",
                              "Sunup",
                              "உதயம்",
                            ].map((suggestion, index) => (
                              <button
                                key={`${suggestion}-${index}`}
                                type="button"
                                onClick={() => {
                                  const newNames = { ...prayerNames };
                                  newNames.sunrise = suggestion;
                                  onPrayerNamesChange(newNames);
                                }}
                                className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Example suggestions for Isha */}
                        {key === "isha" && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {[
                              "Isha",
                              "Night Prayer",
                              "عشاء",
                              "Esha",
                              "இஷா",
                            ].map((suggestion, index) => (
                              <button
                                key={`${suggestion}-${index}`}
                                type="button"
                                onClick={() => {
                                  const newNames = { ...prayerNames };
                                  newNames.isha = suggestion;
                                  onPrayerNamesChange(newNames);
                                }}
                                className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Example suggestions for Dhuhr */}
                        {key === "dhuhr" && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {[
                              "Dhuhr",
                              "Noon Prayer",
                              "ظهر",
                              "Zuhr",
                              "ழுஹர்",
                            ].map((suggestion, index) => (
                              <button
                                key={`${suggestion}-${index}`}
                                type="button"
                                onClick={() => {
                                  const newNames = { ...prayerNames };
                                  newNames.dhuhr = suggestion;
                                  onPrayerNamesChange(newNames);
                                }}
                                className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Prayer Times Editor */}
            <div className="space-y-4 pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-200">
                  Daily Prayer Times
                </h3>
                {referenceScheduleLabel && originalScheduleTimes && (
                  <button
                    onClick={resetPrayerTimesToSchedule}
                    disabled={isResettingPrayerTimes}
                    className={`text-xs px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors ${
                      arePrayerTimesModified()
                        ? "bg-pink-500 hover:bg-pink-600 text-white"
                        : "bg-gray-700 text-gray-400 cursor-not-allowed"
                    } ${
                      isResettingPrayerTimes
                        ? "opacity-70 cursor-not-allowed"
                        : ""
                    }`}
                    title={
                      originalScheduleTimes
                        ? `Reset to ${referenceScheduleLabel} schedule defaults`
                        : "No schedule selected"
                    }
                  >
                    <RotateCcw
                      className={`w-3 h-3 ${
                        isResettingPrayerTimes ? "animate-spin" : ""
                      }`}
                    />
                    {isResettingPrayerTimes
                      ? "Resetting..."
                      : "Reset to Schedule"}
                  </button>
                )}
              </div>

              {arePrayerTimesModified() && originalScheduleTimes && (
                <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-400">
                  ⚠️ Prayer times have been modified from{" "}
                  {referenceScheduleLabel} schedule defaults
                </div>
              )}

              {Object.entries(prayerTimes).map(([prayer, time]) => {
                const prayerKey = prayer as keyof PrayerTimes;
                const isModified =
                  originalScheduleTimes &&
                  time !== originalScheduleTimes[prayerKey];

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
                            isModified
                              ? "border-yellow-500/50"
                              : "border-gray-700"
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
                    {isModified && originalScheduleTimes && (
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <span>{referenceScheduleLabel} schedule default:</span>
                        <span className="text-green-400">
                          {originalScheduleTimes[prayerKey]}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
}
