import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Plus,
  Calendar,
  Clock,
  Image,
  ChevronUp,
  ChevronDown,
  Video,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "./ImageUploader";

interface Advertisement {
  id: string;
  enabled: boolean;
  title: string;
  image: string;
  video: string;
  mediaType: "image" | "video";
  caption: string;
  frequency: number;
  duration: number;
  playCount: number;
  dateRange: {
    start: string;
    end: string;
  };
  timeRange: {
    start: string;
    end: string;
  };
  daysOfWeek: number[];
  animation?: string;
}

interface AdvertisementEditorProps {
  advertisements: Advertisement[];
  onAdvertisementsChange: (ads: Advertisement[]) => void;
  displayId: string;
  userId?: string;
  environment?: "preview" | "production";
}

type FrequencyOption = {
  value: number | string;
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

const animationOptions = [
  { value: "fade", label: "Fade In", description: "Smooth fade transition" },
  {
    value: "slide-left",
    label: "Slide from Left",
    description: "Slides in from left",
  },
  {
    value: "slide-right",
    label: "Slide from Right",
    description: "Slides in from right",
  },
  {
    value: "slide-up",
    label: "Slide from Bottom",
    description: "Slides up from bottom",
  },
  {
    value: "slide-down",
    label: "Slide from Top",
    description: "Slides down from top",
  },
  { value: "zoom", label: "Zoom In", description: "Zooms in from center" },
  { value: "zoom-out", label: "Zoom Out", description: "Zooms out from large" },
  { value: "flip", label: "Flip", description: "3D flip animation" },
  { value: "bounce", label: "Bounce In", description: "Bounces into view" },
  { value: "rotate", label: "Rotate In", description: "Rotates into view" },
];

const daysOfWeek = [
  { id: 0, label: "Sun", full: "Sunday" },
  { id: 1, label: "Mon", full: "Monday" },
  { id: 2, label: "Tue", full: "Tuesday" },
  { id: 3, label: "Wed", full: "Wednesday" },
  { id: 4, label: "Thu", full: "Thursday" },
  { id: 5, label: "Fri", full: "Friday" },
  { id: 6, label: "Sat", full: "Saturday" },
];

export function AdvertisementEditor({
  advertisements,
  onAdvertisementsChange,
  displayId,
  userId,
  environment = "preview",
}: AdvertisementEditorProps) {
  const [adSortOption, setAdSortOption] = useState<string>("newest");
  const [customFrequency, setCustomFrequency] = useState<{
    [key: string]: string;
  }>({});

  // Format seconds to human-readable time
  const formatSeconds = (seconds: number): string => {
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`;
    return `${Math.floor(seconds / 86400)} days`;
  };

  // Sort advertisements based on selected option
  const getSortedAdvertisements = () => {
    const sorted = [...advertisements];

    switch (adSortOption) {
      case "newest":
        return sorted.sort((a, b) => {
          const timeA = new Date(a.id.split("-")[1] || 0).getTime();
          const timeB = new Date(b.id.split("-")[1] || 0).getTime();
          return timeB - timeA;
        });
      case "oldest":
        return sorted.sort((a, b) => {
          const timeA = new Date(a.id.split("-")[1] || 0).getTime();
          const timeB = new Date(b.id.split("-")[1] || 0).getTime();
          return timeA - timeB;
        });
      case "enabled":
        return sorted.sort((a, b) => (b.enabled ? 1 : 0) - (a.enabled ? 1 : 0));
      case "frequency":
        return sorted.sort((a, b) => a.frequency - b.frequency);
      case "title":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case "manual":
      default:
        return sorted;
    }
  };

  const sortedAdvertisements = getSortedAdvertisements();

  const handleAddAdvertisement = () => {
    const defaultStartDate = new Date();
    const defaultEndDate = new Date();
    defaultEndDate.setDate(defaultEndDate.getDate() + 7);

    const newAd: Advertisement = {
      id: `ad-${Date.now()}`,
      enabled: true,
      title: "",
      image: "",
      video: "",
      mediaType: "image",
      caption: "",
      frequency: 300,
      duration: 30,
      playCount: 1,
      dateRange: {
        start: defaultStartDate.toISOString(),
        end: defaultEndDate.toISOString(),
      },
      timeRange: {
        start: "09:00",
        end: "17:00",
      },
      daysOfWeek: [1, 2, 3, 4, 5],
      animation: "fade",
    };

    onAdvertisementsChange([newAd, ...advertisements]);
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

    onAdvertisementsChange(updated);
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

    onAdvertisementsChange(updated);
  };

  const handleRemoveAdvertisement = (idx: number) => {
    const updated = advertisements.filter((_, i) => i !== idx);
    onAdvertisementsChange(updated);
  };

  const handleMoveAdvertisement = (idx: number, direction: "up" | "down") => {
    if (adSortOption !== "manual") {
      setAdSortOption("manual");
    }

    const updated = [...advertisements];
    const newIdx = direction === "up" ? idx - 1 : idx + 1;

    if (newIdx >= 0 && newIdx < updated.length) {
      [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
      onAdvertisementsChange(updated);
    }
  };

  const handleFrequencyChange = (idx: number, value: string | number) => {
    if (value === "custom") {
      const currentFreq = advertisements[idx].frequency || 300;
      setCustomFrequency((prev) => ({
        ...prev,
        [idx]: currentFreq.toString(),
      }));
      handleUpdateAdvertisement(idx, "frequency", currentFreq);
    } else {
      handleUpdateAdvertisement(idx, "frequency", Number(value));
      setCustomFrequency((prev) => {
        const newFreq = { ...prev };
        delete newFreq[idx];
        return newFreq;
      });
    }
  };

  const handleCustomFrequencyChange = (idx: number, value: string) => {
    const numValue = parseInt(value) || 300;
    setCustomFrequency((prev) => ({
      ...prev,
      [idx]: value,
    }));
    handleUpdateAdvertisement(idx, "frequency", numValue);
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
        <p className="text-sm text-purple-400">
          <strong>Full Screen Advertisements:</strong> Schedule 16:9 ads (images
          or videos) to display in fullscreen mode with complete scheduling
          controls. Ads will only show when enabled and within their schedule
          range.
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Sort by:</label>
          <Select value={adSortOption} onValueChange={setAdSortOption}>
            <SelectTrigger className="w-48 h-8 text-xs bg-slate-700 border-slate-600 text-slate-50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">🆕 Newest First</SelectItem>
              <SelectItem value="oldest">📅 Oldest First</SelectItem>
              <SelectItem value="manual">📌 Manual Order</SelectItem>
              <SelectItem value="enabled">✅ Enabled First</SelectItem>
              <SelectItem value="frequency">⏱️ By Frequency</SelectItem>
              <SelectItem value="title">🔤 By Title</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleAddAdvertisement}
          className="border-purple-500 text-purple-400 h-8 bg-transparent hover:bg-purple-500/10"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Advertisement
        </Button>
      </div>

      <div className="space-y-3">
        {sortedAdvertisements.map((ad, idx) => {
          const originalIdx = advertisements.findIndex((a) => a.id === ad.id);
          const isCustomFrequency = !frequencyOptions.some(
            (opt) => opt.value === ad.frequency
          );
          const selectedValue = isCustomFrequency ? "custom" : ad.frequency;

          return (
            <div
              key={ad.id}
              className="bg-slate-700/50 p-4 rounded-lg space-y-4 border border-slate-600 animate-in slide-in-from-top-4 duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={ad.enabled}
                      onChange={(e) =>
                        handleUpdateAdvertisement(
                          originalIdx,
                          "enabled",
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-green-500"
                    />
                    <span className="text-sm font-medium text-slate-300">
                      Ad #{originalIdx + 1} {ad.enabled ? "✓" : "✗"}
                    </span>
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-xs ${
                      ad.mediaType === "video"
                        ? "bg-blue-500/20 text-blue-400 flex items-center gap-1"
                        : "bg-purple-500/20 text-purple-400"
                    }`}
                  >
                    {ad.mediaType === "video" ? (
                      <>
                        <Video className="w-3 h-3" />
                        Video 16:9
                      </>
                    ) : (
                      "🖼️ Image 16:9"
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {adSortOption === "manual" && (
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          handleMoveAdvertisement(originalIdx, "up")
                        }
                        disabled={originalIdx === 0}
                        className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200 disabled:opacity-30"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          handleMoveAdvertisement(originalIdx, "down")
                        }
                        disabled={originalIdx === advertisements.length - 1}
                        className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200 disabled:opacity-30"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveAdvertisement(originalIdx)}
                    className="text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Input
                  value={ad.title}
                  onChange={(e) =>
                    handleUpdateAdvertisement(
                      originalIdx,
                      "title",
                      e.target.value
                    )
                  }
                  placeholder="Advertisement Title"
                  className="bg-slate-700 border-slate-600 text-slate-50"
                />

                <Input
                  value={ad.caption}
                  onChange={(e) =>
                    handleUpdateAdvertisement(
                      originalIdx,
                      "caption",
                      e.target.value
                    )
                  }
                  placeholder="Advertisement Description"
                  className="bg-slate-700 border-slate-600 text-slate-50"
                />

                {/* Media Type Selector */}
                <div>
                  <label className="text-xs text-slate-400 mb-2 block">
                    Media Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        handleUpdateAdvertisement(
                          originalIdx,
                          "mediaType",
                          "image"
                        )
                      }
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        ad.mediaType === "image"
                          ? "border-purple-500 bg-purple-500/20 text-purple-400"
                          : "border-slate-700 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      <Image className="w-5 h-5 mx-auto mb-1" />
                      Image
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateAdvertisement(
                          originalIdx,
                          "mediaType",
                          "video"
                        )
                      }
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        ad.mediaType === "video"
                          ? "border-blue-500 bg-blue-500/20 text-blue-400"
                          : "border-slate-700 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      <Video className="w-5 h-5 mx-auto mb-1" />
                      Video
                    </button>
                  </div>
                </div>

                {/* Conditional Media Input */}
                {ad.mediaType === "image" ? (
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">
                      Advertisement Image (16:9 recommended)
                    </label>
                    <ImageUploader
                      images={ad.image ? [ad.image] : []}
                      onChange={(imgs) =>
                        handleUpdateAdvertisement(
                          originalIdx,
                          "image",
                          imgs[0] || ""
                        )
                      }
                      maxImages={1}
                      userId={userId}
                      displayId={displayId}
                      imageType="advertisement"
                      environment={environment}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">
                      Video URL (MP4, WebM, OGG)
                    </label>
                    <Input
                      value={ad.video || ""}
                      onChange={(e) =>
                        handleUpdateAdvertisement(
                          originalIdx,
                          "video",
                          e.target.value
                        )
                      }
                      placeholder="https://example.com/video.mp4"
                      className="bg-slate-700 border-slate-600 text-slate-50"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Supported: .mp4, .webm, .ogg formats
                    </p>
                  </div>
                )}

                {/* Animation Selector */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Entrance Animation
                  </label>
                  <Select
                    value={ad.animation || "fade"}
                    onValueChange={(value) =>
                      handleUpdateAdvertisement(originalIdx, "animation", value)
                    }
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {animationOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="text-slate-200 hover:bg-slate-700"
                        >
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-slate-400">
                              {option.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                          originalIdx,
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
                              <div className="font-medium">{option.label}</div>
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
                          value={customFrequency[originalIdx] || ad.frequency}
                          onChange={(e) =>
                            handleCustomFrequencyChange(
                              originalIdx,
                              e.target.value
                            )
                          }
                          min="30"
                          max="2592000"
                          className="bg-slate-700 border-slate-600 text-slate-50"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Current: {formatSeconds(ad.frequency)} ({ad.frequency}
                          s)
                        </p>
                      </div>
                    )}

                    {selectedValue !== "custom" && (
                      <p className="text-xs text-slate-500 mt-1">
                        Show every {formatSeconds(ad.frequency)}
                      </p>
                    )}
                  </div>

                  {/* Duration or Play Count */}
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">
                      {ad.mediaType === "video"
                        ? "Play Count"
                        : "Duration (seconds)"}
                    </label>
                    <Input
                      type="number"
                      value={
                        ad.mediaType === "video" ? ad.playCount : ad.duration
                      }
                      onChange={(e) =>
                        handleUpdateAdvertisement(
                          originalIdx,
                          ad.mediaType === "video" ? "playCount" : "duration",
                          parseInt(e.target.value) ||
                            (ad.mediaType === "video" ? 1 : 30)
                        )
                      }
                      min={ad.mediaType === "video" ? "1" : "5"}
                      max={ad.mediaType === "video" ? "10" : "300"}
                      className="bg-slate-700 border-slate-600 text-slate-50"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {ad.mediaType === "video"
                        ? `Play ${ad.playCount} time${
                            ad.playCount > 1 ? "s" : ""
                          }`
                        : `Display for ${ad.duration}s`}
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
                          originalIdx,
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
                          originalIdx,
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
                          originalIdx,
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
                          originalIdx,
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
                            handleUpdateAdDays(
                              originalIdx,
                              day.id,
                              e.target.checked
                            )
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
              Add fullscreen 16:9 ads (images or videos) with custom schedules
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
