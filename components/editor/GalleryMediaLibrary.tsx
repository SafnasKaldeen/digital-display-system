"use client";

import React, { useState, useEffect, useRef } from "react";
import { Upload, X, Clock, Calendar, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GalleryMediaLibraryProps {
  selectedItems: any[];
  onItemsChange: (items: any[]) => void;
  userId?: string;
  displayId: string;
  environment?: "preview" | "production";
  enableFullscreen?: boolean;
}

// Schedule options for fullscreen ads
const SCHEDULE_OPTIONS: Array<{ label: string; value: string[] }> = [
  {
    label: "Every 5 minutes",
    value: [
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
    ],
  },
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

export function GalleryMediaLibrary({
  selectedItems,
  onItemsChange,
  userId,
  displayId,
  environment = "preview",
  enableFullscreen = false,
}: GalleryMediaLibraryProps) {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [mediaLibrary, setMediaLibrary] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newCaption, setNewCaption] = useState("");
  const [selectedScheduleIndex, setSelectedScheduleIndex] = useState<
    number | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchImages = async () => {
      if (!userId || !displayId) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/media`);
        if (!response.ok) {
          console.error("Failed to fetch images:", await response.text());
          return;
        }

        const allMedia = await response.json();
        const filteredImages = allMedia
          .filter(
            (item: any) => item.userId === userId && item.type === "slideshow"
          )
          .map((item: any) => item.fileUrl);

        setMediaLibrary(filteredImages);
      } catch (err) {
        console.error("Error fetching images:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, [userId, displayId]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!userId) {
      setUploadError("User ID is required for upload");
      return;
    }

    if (!displayId) {
      setUploadError("Display ID is required for upload");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const validFiles = Array.from(files).filter((file) => {
        if (!file.type.startsWith("image/")) {
          setUploadError(`${file.name} is not an image file`);
          return false;
        }
        if (file.size > 10 * 1024 * 1024) {
          setUploadError(`${file.name} is too large (max 10MB)`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) {
        setIsUploading(false);
        return;
      }

      const formData = new FormData();
      validFiles.forEach((file) => formData.append("images", file));
      formData.append("userId", userId);
      formData.append("displayId", displayId);
      formData.append("type", "slideshow");

      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();

      // Add uploaded images to selected items with caption
      const newItems = data.urls.map((url: string) => ({
        image: url,
        caption: newCaption || "",
        fullScreen: enableFullscreen ? false : undefined,
        schedule: enableFullscreen
          ? {
              enabled: false,
              frequency: "00",
              customMinutes: [],
              startTime: "09:00",
              endTime: "17:00",
              duration: 10000,
            }
          : undefined,
      }));
      onItemsChange([...selectedItems, ...newItems]);
      setNewCaption("");

      // Refresh media library
      const imagesResponse = await fetch(`/api/media`);
      if (imagesResponse.ok) {
        const allMedia = await imagesResponse.json();
        const newImages = allMedia
          .filter(
            (item: any) => item.userId === userId && item.type === "slideshow"
          )
          .map((item: any) => item.fileUrl);
        setMediaLibrary(newImages);
      }
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

  // Check if an image URL is already in selectedItems
  const isImageSelected = (imgUrl: string) => {
    return selectedItems.some((item) => item.image === imgUrl);
  };

  // Get selected item for an image URL
  const getSelectedItem = (imgUrl: string) => {
    return selectedItems.find((item) => item.image === imgUrl);
  };

  const handleImageClick = (imgUrl: string) => {
    const isSelected = isImageSelected(imgUrl);

    if (isSelected) {
      // Deselect - remove the item from selectedItems
      const updatedItems = selectedItems.filter(
        (item) => item.image !== imgUrl
      );
      onItemsChange(updatedItems);
    } else {
      // Select - add the item to selectedItems
      const existingItem = getSelectedItem(imgUrl);
      if (existingItem) {
        return;
      }

      // Create new item with default values
      const newItem = {
        image: imgUrl,
        caption: "",
        fullScreen: enableFullscreen ? false : undefined,
        schedule: enableFullscreen
          ? {
              enabled: false,
              frequency: "00",
              customMinutes: [],
              startTime: "09:00",
              endTime: "17:00",
              duration: 10000,
            }
          : undefined,
      };

      onItemsChange([...selectedItems, newItem]);
    }
  };

  // Update schedule for a specific item
  const updateSchedule = (index: number, scheduleUpdates: any) => {
    const updatedItems = [...selectedItems];
    updatedItems[index] = {
      ...updatedItems[index],
      schedule: {
        ...updatedItems[index].schedule,
        ...scheduleUpdates,
      },
    };
    onItemsChange(updatedItems);
  };

  // Toggle schedule for a specific item
  const toggleSchedule = (index: number) => {
    const updatedItems = [...selectedItems];
    const currentItem = updatedItems[index];

    updatedItems[index] = {
      ...currentItem,
      schedule: {
        ...(currentItem.schedule || {
          enabled: false,
          frequency: "00",
          customMinutes: [],
          startTime: "09:00",
          endTime: "17:00",
          duration: 10000,
        }),
        enabled: !currentItem.schedule?.enabled,
      },
    };

    onItemsChange(updatedItems);
  };

  // Handle custom minute selection
  const handleCustomMinuteToggle = (index: number, minute: string) => {
    const currentItem = selectedItems[index];
    if (!currentItem.schedule) return;

    const currentMinutes = currentItem.schedule.customMinutes || [];
    const updatedMinutes = currentMinutes.includes(minute)
      ? currentMinutes.filter((m: string) => m !== minute)
      : [...currentMinutes, minute].sort();

    updateSchedule(index, { customMinutes: updatedMinutes });
  };

  return (
    <div className="space-y-3">
      {/* Upload New Image */}
      <div className="space-y-2">
        <Input
          value={newCaption}
          onChange={(e) => setNewCaption(e.target.value)}
          placeholder="Enter caption for new images..."
          className="bg-slate-700 border-slate-600 text-slate-50 text-sm"
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || !userId || !displayId}
          className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-600 rounded-lg hover:border-slate-500 hover:bg-slate-700/30 text-slate-400 hover:text-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-4 h-4" />
          <span className="text-sm font-medium">
            {isUploading ? "Uploading..." : "Upload & Add to Gallery"}
          </span>
        </button>
      </div>

      {uploadError && (
        <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-xs text-red-400">{uploadError}</p>
        </div>
      )}

      {/* Media Library Grid */}
      {(isLoading || mediaLibrary.length > 0) && (
        <div>
          <label className="text-xs font-medium flex items-center gap-2 mb-2">
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
            <span className="text-blue-400">
              Gallery Media Library ({mediaLibrary.length} images)
            </span>
          </label>

          {isLoading ? (
            <div className="text-center py-6 bg-slate-700/30 rounded-lg">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-400 border-t-transparent"></div>
              <p className="text-xs text-slate-400 mt-2">
                Loading media library...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-700/30 rounded-lg max-h-64 overflow-y-auto custom-scrollbar">
              {mediaLibrary.map((imgUrl, idx) => {
                const isSelected = isImageSelected(imgUrl);
                const item = getSelectedItem(imgUrl);

                return (
                  <div
                    key={idx}
                    className="relative group cursor-pointer"
                    onClick={() => handleImageClick(imgUrl)}
                  >
                    <img
                      src={imgUrl}
                      alt={`Media ${idx + 1}`}
                      className={`w-full h-20 object-cover rounded border-2 transition-colors ${
                        isSelected
                          ? "border-green-500"
                          : "border-slate-600 hover:border-blue-400"
                      }`}
                      onError={(e) => {
                        console.error(`Failed to load image: ${imgUrl}`);
                        e.currentTarget.src =
                          "https://via.placeholder.com/150?text=Image+Error";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {isSelected ? "✓ Selected" : "Click to select"}
                      </span>
                    </div>
                    {isSelected && item?.caption && (
                      <div className="absolute top-1 left-1 bg-green-500/80 text-white text-xs px-2 py-1 rounded">
                        ✓
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Schedule Configuration for Fullscreen Items */}
      {enableFullscreen && selectedItems.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Fullscreen Advertisement Schedule
          </h3>

          <div className="space-y-4">
            {selectedItems.map(
              (item: any, idx: number) =>
                item.image && (
                  <div
                    key={idx}
                    className="bg-slate-800/50 p-3 rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={item.image}
                          alt={item.caption}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div>
                          <p className="text-sm text-slate-200">
                            {item.caption || `Image ${idx + 1}`}
                          </p>
                          <p className="text-xs text-slate-400">
                            Fullscreen Advertisement
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSchedule(idx)}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          item.schedule?.enabled
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-slate-700 text-slate-400 border border-slate-600"
                        }`}
                      >
                        {item.schedule?.enabled
                          ? "Schedule ON"
                          : "Schedule OFF"}
                      </button>
                    </div>

                    {item.schedule?.enabled && (
                      <div className="space-y-3">
                        {/* Time Range */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-slate-400 mb-1 block">
                              Start Time
                            </label>
                            <Input
                              type="time"
                              value={item.schedule.startTime || "09:00"}
                              onChange={(e) =>
                                updateSchedule(idx, {
                                  startTime: e.target.value,
                                })
                              }
                              className="bg-slate-700 border-slate-600 text-slate-50 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-400 mb-1 block">
                              End Time
                            </label>
                            <Input
                              type="time"
                              value={item.schedule.endTime || "17:00"}
                              onChange={(e) =>
                                updateSchedule(idx, { endTime: e.target.value })
                              }
                              className="bg-slate-700 border-slate-600 text-slate-50 text-sm"
                            />
                          </div>
                        </div>

                        {/* Frequency */}
                        <div>
                          <label className="text-xs text-slate-400 mb-1 block">
                            Frequency
                          </label>
                          <Select
                            value={item.schedule.frequency || "00"}
                            onValueChange={(value) =>
                              updateSchedule(idx, { frequency: value })
                            }
                          >
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50 text-sm">
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              {SCHEDULE_OPTIONS.map((option, optIdx) => (
                                <SelectItem
                                  key={optIdx}
                                  value={option.value[0] || "custom"}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Custom Minutes (when frequency is custom) */}
                        {(item.schedule.frequency === "custom" ||
                          !item.schedule.frequency) && (
                          <div>
                            <label className="text-xs text-slate-400 mb-2 block">
                              Custom Minutes (select multiples)
                            </label>
                            <div className="grid grid-cols-6 gap-1">
                              {Array.from({ length: 60 }, (_, i) => {
                                const minute = i.toString().padStart(2, "0");
                                const isSelected =
                                  item.schedule.customMinutes?.includes(minute);
                                return (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() =>
                                      handleCustomMinuteToggle(idx, minute)
                                    }
                                    className={`p-1 text-xs rounded ${
                                      isSelected
                                        ? "bg-blue-500 text-white"
                                        : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                                    }`}
                                  >
                                    {minute}
                                  </button>
                                );
                              })}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              Selected:{" "}
                              {item.schedule.customMinutes?.join(", ") ||
                                "None"}
                            </p>
                          </div>
                        )}

                        {/* Duration */}
                        <div>
                          <label className="text-xs text-slate-400 mb-1 block">
                            Display Duration:{" "}
                            {(item.schedule.duration || 10000) / 1000} seconds
                          </label>
                          <Input
                            type="range"
                            min="5"
                            max="60"
                            step="1"
                            value={(item.schedule.duration || 10000) / 1000}
                            onChange={(e) =>
                              updateSchedule(idx, {
                                duration: parseInt(e.target.value) * 1000,
                              })
                            }
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-slate-400 mt-1">
                            <span>5s</span>
                            <span>
                              {(item.schedule.duration || 10000) / 1000}s
                            </span>
                            <span>60s</span>
                          </div>
                        </div>

                        {/* Schedule Preview */}
                        <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded">
                          <p className="text-xs text-blue-400">
                            {item.schedule.frequency === "custom"
                              ? `Custom schedule: ${
                                  item.schedule.customMinutes?.length || 0
                                } minutes selected`
                              : SCHEDULE_OPTIONS.find(
                                  (opt) =>
                                    opt.value[0] === item.schedule.frequency
                                )?.label || "Every hour"}
                            {" • "}
                            {item.schedule.startTime} - {item.schedule.endTime}
                            {" • "}
                            Duration: {(item.schedule.duration || 10000) / 1000}
                            s
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e293b;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  );
}
