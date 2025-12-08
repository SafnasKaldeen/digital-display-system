"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import PrayerTimesManager from "./PrayerTimesManager";
import CollapsibleSection from "./CollapsibleSection";
import ColorPicker from "./ColorPicker";
import ImageUploader from "./ImageUploader";

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

interface Colors {
  primary: string;
  secondary: string;
  text: string;
  accent: string;
}

interface BackgroundGradient {
  from: string;
  to: string;
}

interface Announcement {
  text: string;
  duration: number;
}

interface MasjidConfig {
  template: string;
  prayerTimes: PrayerTimes;
  iqamahOffsets: IqamahOffsets;
  prayerScheduleLabel?: string;
  colors: Colors;
  backgroundType: "solid" | "gradient" | "image" | "slideshow";
  backgroundColor: string;
  backgroundGradient: BackgroundGradient;
  backgroundImage: string[];
  slideshowDuration: number;
  announcements: Announcement[];
  showHijriDate: boolean;
  showNextPrayer: boolean;
  showCurrentTime: boolean;
  font: string;
  fontSize: number;
  logo: string;
  masjidName: string;
  showWeather: boolean;
  animationSpeed: "slow" | "normal" | "fast";
  layout: "authentic" | "vertical" | "horizontal" | "centered";
  colorTheme?: Colors;
  prayerInstructionImage: string;
  prayerInstructionDuration: number;
}

interface MasjidEditorPanelProps {
  config: MasjidConfig;
  onConfigChange: (config: MasjidConfig) => void;
  displayId?: string;
  environment?: "preview" | "production";
  displayName?: string;
  templateType?: string;
  userId?: string;
}

// Main Editor Component
export default function MasjidEditorPanel({
  config,
  onConfigChange,
  displayId = "1",
  environment = "preview",
  displayName = "Masjid Display",
  templateType = "masjid",
  userId,
}: MasjidEditorPanelProps) {
  const defaultPrayerTimes: PrayerTimes = {
    fajr: "05:30",
    sunrise: "07:00",
    dhuhr: "12:30",
    asr: "15:45",
    maghrib: "18:00",
    isha: "19:30",
  };

  const defaultConfig: MasjidConfig = {
    template: "masjid-classic",
    prayerTimes: defaultPrayerTimes,
    iqamahOffsets: {
      fajr: 15,
      sunrise: 10,
      dhuhr: 10,
      asr: 10,
      maghrib: 5,
      isha: 10,
    },
    prayerScheduleLabel: "",
    colors: {
      primary: "#10b981",
      secondary: "#059669",
      text: "#ffffff",
      accent: "#fbbf24",
    },
    backgroundType: "gradient",
    backgroundColor: "#1e293b",
    backgroundGradient: {
      from: "#1e293b",
      to: "#0f172a",
    },
    backgroundImage: [],
    slideshowDuration: 10,
    announcements: [],
    showHijriDate: true,
    showNextPrayer: true,
    showCurrentTime: true,
    font: "Amiri",
    fontSize: 16,
    logo: "",
    masjidName: "Masjid Al-Noor",
    showWeather: true,
    animationSpeed: "normal",
    layout: "authentic",
    prayerInstructionImage: "",
    prayerInstructionDuration: 10,
  };

  const [customization, setCustomization] =
    useState<MasjidConfig>(defaultConfig);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(
    userId
  );
  const [hasInitialized, setHasInitialized] = useState(false);

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

  const fetchPrayerTimesFromSchedule = async (
    scheduleLabel: string
  ): Promise<PrayerTimes | null> => {
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
      }
      return null;
    } catch (error) {
      console.error("Error fetching prayer times from schedule:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchConfig = async () => {
      if (!displayId) {
        setIsLoadingConfig(false);
        return;
      }

      setIsLoadingConfig(true);

      try {
        const response = await fetch(`/api/displays/${displayId}/config`);

        if (response.ok) {
          const result = await response.json();

          if (result.success && result.data?.config) {
            const savedConfig = result.data.config;

            const colors =
              savedConfig.colorTheme ||
              savedConfig.colors ||
              defaultConfig.colors;

            const savedLabel = savedConfig.prayerScheduleLabel || "";
            let finalPrayerTimes = defaultPrayerTimes;
            let finalScheduleLabel = savedLabel;

            if (savedLabel) {
              const scheduleTimes = await fetchPrayerTimesFromSchedule(
                savedLabel
              );
              if (scheduleTimes) {
                finalPrayerTimes = scheduleTimes;
              } else {
                const easternTimes = await fetchPrayerTimesFromSchedule(
                  "default - BATTICALOA"
                );
                if (easternTimes) {
                  finalPrayerTimes = easternTimes;
                  finalScheduleLabel = "default - BATTICALOA";
                }
              }
            } else {
              const easternTimes = await fetchPrayerTimesFromSchedule(
                "default - BATTICALOA"
              );
              if (easternTimes) {
                finalPrayerTimes = easternTimes;
                finalScheduleLabel = "default - BATTICALOA";
              }
            }

            if (
              savedConfig.prayerTimes &&
              Object.keys(savedConfig.prayerTimes).length > 0
            ) {
              finalPrayerTimes = {
                ...finalPrayerTimes,
                ...savedConfig.prayerTimes,
              };
            }

            const mergedConfig: MasjidConfig = {
              ...defaultConfig,
              ...savedConfig,
              colors: {
                ...defaultConfig.colors,
                ...colors,
              },
              masjidName: savedConfig.masjidName || displayName,
              prayerTimes: finalPrayerTimes,
              prayerScheduleLabel: finalScheduleLabel,
              iqamahOffsets: {
                ...defaultConfig.iqamahOffsets,
                ...(savedConfig.iqamahOffsets || {}),
              },
              backgroundGradient: {
                ...defaultConfig.backgroundGradient,
                ...(savedConfig.backgroundGradient || {}),
              },
              announcements: Array.isArray(savedConfig.announcements)
                ? savedConfig.announcements.map((ann: any) =>
                    typeof ann === "string" ? { text: ann, duration: 5 } : ann
                  )
                : defaultConfig.announcements,
            };

            setCustomization(mergedConfig);
            onConfigChange(mergedConfig);
            setHasInitialized(true);
          } else {
            const easternTimes = await fetchPrayerTimesFromSchedule(
              "default - BATTICALOA"
            );
            const prayerTimes = easternTimes || defaultPrayerTimes;
            const scheduleLabel = easternTimes ? "default - BATTICALOA" : "";

            const configWithPrayerTimes = {
              ...defaultConfig,
              masjidName: displayName,
              prayerTimes: prayerTimes,
              prayerScheduleLabel: scheduleLabel,
            };

            setCustomization(configWithPrayerTimes);
            onConfigChange(configWithPrayerTimes);
            setHasInitialized(true);
          }
        } else {
          const easternTimes = await fetchPrayerTimesFromSchedule(
            "default - BATTICALOA"
          );
          const prayerTimes = easternTimes || defaultPrayerTimes;
          const scheduleLabel = easternTimes ? "default - BATTICALOA" : "";

          const configWithPrayerTimes = {
            ...defaultConfig,
            masjidName: displayName,
            prayerTimes: prayerTimes,
            prayerScheduleLabel: scheduleLabel,
          };

          setCustomization(configWithPrayerTimes);
          onConfigChange(configWithPrayerTimes);
          setHasInitialized(true);
        }
      } catch (error) {
        console.error("Error fetching config:", error);
        setCustomization(defaultConfig);
        onConfigChange(defaultConfig);
        setHasInitialized(true);
      } finally {
        setIsLoadingConfig(false);
      }
    };

    fetchConfig();
  }, [displayId]);

  const updateConfig = (updates: Partial<MasjidConfig>) => {
    const newConfig = { ...customization, ...updates };

    if (updates.colors) {
      newConfig.colorTheme = updates.colors;
    }

    setCustomization(newConfig);
    onConfigChange(newConfig);
  };

  const addAnnouncement = () => {
    const newAnnouncements = [
      ...customization.announcements,
      { text: "", duration: 5 },
    ];
    updateConfig({ announcements: newAnnouncements });
  };

  const updateAnnouncement = (
    index: number,
    field: keyof Announcement,
    value: any
  ) => {
    const updated = [...customization.announcements];
    updated[index] = { ...updated[index], [field]: value };
    updateConfig({ announcements: updated });
  };

  const removeAnnouncement = (index: number) => {
    const updated = customization.announcements.filter((_, i) => i !== index);
    updateConfig({ announcements: updated });
  };

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
      }
      return null;
    } catch (error) {
      console.error("Error fetching prayer times:", error);
      return null;
    }
  };

  if (isLoadingConfig) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-pink-500 border-t-transparent mb-3"></div>
          <p className="text-sm text-gray-400">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1f2937;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>

      <CollapsibleSection title="Branding" defaultOpen={true}>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 block mb-2">
              Masjid Name
            </label>
            <input
              type="text"
              value={customization.masjidName}
              onChange={(e) => updateConfig({ masjidName: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Enter masjid name"
            />
          </div>
          <div>
            <label className="text-sm text-gray-300 block mb-2">Logo</label>
            <ImageUploader
              images={customization.logo ? [customization.logo] : []}
              onChange={(imgs) => updateConfig({ logo: imgs[0] || "" })}
              maxImages={1}
              userId={currentUserId}
              displayId={displayId}
              imageType="logo"
              environment={environment}
            />
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Layout">
        <div className="space-y-2">
          <label className="text-sm text-gray-300">Display Layout</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: "authentic", icon: "🕌", label: "Authentic" },
              { value: "vertical", icon: "📏", label: "Vertical" },
              { value: "horizontal", icon: "📐", label: "Horizontal" },
              { value: "centered", icon: "◼️", label: "Centered" },
            ].map((layout) => (
              <button
                key={layout.value}
                onClick={() =>
                  updateConfig({
                    layout: layout.value as MasjidConfig["layout"],
                  })
                }
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  customization.layout === layout.value
                    ? "border-pink-500 bg-pink-500/20 text-pink-400"
                    : "border-gray-700 text-gray-400 hover:border-gray-600"
                }`}
              >
                <div className="text-xl mb-1">{layout.icon}</div>
                <div className="text-xs">{layout.label}</div>
              </button>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Prayer Times">
        <PrayerTimesManager
          displayId={displayId}
          prayerTimes={customization.prayerTimes}
          iqamahOffsets={customization.iqamahOffsets}
          label={customization.prayerScheduleLabel || ""}
          onPrayerTimesChange={(times) => updateConfig({ prayerTimes: times })}
          onIqamahOffsetsChange={(offsets) =>
            updateConfig({ iqamahOffsets: offsets })
          }
          onLabelChange={async (label) => {
            const newPrayerTimes = await fetchPrayerTimesForToday(label);
            const newConfig = {
              ...customization,
              prayerScheduleLabel: label,
              prayerTimes: newPrayerTimes || customization.prayerTimes,
            };
            setCustomization(newConfig);
            onConfigChange(newConfig);
          }}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Announcements">
        <div className="space-y-3">
          {customization.announcements.map((announcement, idx) => (
            <div
              key={idx}
              className="space-y-2 p-3 bg-gray-800/50 rounded-lg border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-400">
                  Announcement {idx + 1}
                </label>
                <button
                  onClick={() => removeAnnouncement(idx)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <textarea
                value={announcement.text}
                onChange={(e) =>
                  updateAnnouncement(idx, "text", e.target.value)
                }
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-pink-500"
                rows={2}
                placeholder="Enter announcement..."
              />
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-400">
                  Duration (seconds):
                </label>
                <input
                  type="number"
                  min="3"
                  max="60"
                  value={announcement.duration}
                  onChange={(e) =>
                    updateAnnouncement(
                      idx,
                      "duration",
                      parseInt(e.target.value) || 5
                    )
                  }
                  className="w-20 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
          ))}
          <button
            onClick={addAnnouncement}
            className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-700 rounded-lg hover:border-gray-600 text-gray-400 hover:text-gray-300 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Add Announcement</span>
          </button>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Colors & Styling">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 block mb-2">
              Primary Color
            </label>
            <ColorPicker
              value={customization.colors.primary}
              onChange={(color) =>
                updateConfig({
                  colors: { ...customization.colors, primary: color },
                })
              }
            />
          </div>
          <div>
            <label className="text-sm text-gray-300 block mb-2">
              Secondary Color
            </label>
            <ColorPicker
              value={customization.colors.secondary}
              onChange={(color) =>
                updateConfig({
                  colors: { ...customization.colors, secondary: color },
                })
              }
            />
          </div>
          <div>
            <label className="text-sm text-gray-300 block mb-2">
              Text Color
            </label>
            <ColorPicker
              value={customization.colors.text}
              onChange={(color) =>
                updateConfig({
                  colors: { ...customization.colors, text: color },
                })
              }
            />
          </div>
          <div>
            <label className="text-sm text-gray-300 block mb-2">
              Accent Color
            </label>
            <ColorPicker
              value={customization.colors.accent}
              onChange={(color) =>
                updateConfig({
                  colors: { ...customization.colors, accent: color },
                })
              }
            />
          </div>
          <div className="pt-4 border-t border-gray-800">
            <label className="text-sm text-gray-300 block mb-2">
              Font Family
            </label>
            <select
              value={customization.font}
              onChange={(e) => updateConfig({ font: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="Arial">Arial</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Amiri">Amiri (Arabic)</option>
              <option value="Lato">Lato</option>
              <option value="Inter">Inter</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-300 block mb-2">
              Font Size: {customization.fontSize}px
            </label>
            <input
              type="range"
              min="12"
              max="24"
              value={customization.fontSize}
              onChange={(e) =>
                updateConfig({ fontSize: parseInt(e.target.value) })
              }
              className="w-full accent-pink-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>12px</span>
              <span>24px</span>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-300 block mb-2">
              Animation Speed
            </label>
            <select
              value={customization.animationSpeed}
              onChange={(e) =>
                updateConfig({
                  animationSpeed: e.target
                    .value as MasjidConfig["animationSpeed"],
                })
              }
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="slow">Slow</option>
              <option value="normal">Normal</option>
              <option value="fast">Fast</option>
            </select>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Background">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 block mb-2">
              Background Type
            </label>
            <select
              value={customization.backgroundType}
              onChange={(e) =>
                updateConfig({
                  backgroundType: e.target
                    .value as MasjidConfig["backgroundType"],
                })
              }
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="solid">Solid Color</option>
              <option value="gradient">Gradient</option>
              <option value="image">Single Image</option>
              <option value="slideshow">Image Slideshow</option>
            </select>
          </div>

          {customization.backgroundType === "solid" && (
            <div>
              <label className="text-sm text-gray-300 block mb-2">
                Background Color
              </label>
              <ColorPicker
                value={customization.backgroundColor}
                onChange={(color) => updateConfig({ backgroundColor: color })}
              />
            </div>
          )}

          {customization.backgroundType === "gradient" && (
            <>
              <div>
                <label className="text-sm text-gray-300 block mb-2">
                  Gradient From
                </label>
                <ColorPicker
                  value={customization.backgroundGradient.from}
                  onChange={(color) =>
                    updateConfig({
                      backgroundGradient: {
                        ...customization.backgroundGradient,
                        from: color,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm text-gray-300 block mb-2">
                  Gradient To
                </label>
                <ColorPicker
                  value={customization.backgroundGradient.to}
                  onChange={(color) =>
                    updateConfig({
                      backgroundGradient: {
                        ...customization.backgroundGradient,
                        to: color,
                      },
                    })
                  }
                />
              </div>
            </>
          )}

          {(customization.backgroundType === "image" ||
            customization.backgroundType === "slideshow") && (
            <>
              <div>
                <label className="text-sm text-gray-300 block mb-2">
                  {customization.backgroundType === "slideshow"
                    ? "Slideshow Images"
                    : "Background Image"}
                </label>
                <ImageUploader
                  images={customization.backgroundImage}
                  onChange={(images) =>
                    updateConfig({ backgroundImage: images })
                  }
                  maxImages={
                    customization.backgroundType === "slideshow" ? 10 : 1
                  }
                  displayId={displayId}
                  imageType={
                    customization.backgroundType === "slideshow"
                      ? "slideshow"
                      : "background"
                  }
                  environment={environment}
                  userId={currentUserId}
                />
              </div>

              {customization.backgroundType === "slideshow" &&
                customization.backgroundImage.length > 1 && (
                  <div>
                    <label className="text-sm text-gray-300 block mb-2">
                      Slideshow Duration: {customization.slideshowDuration}s
                    </label>
                    <input
                      type="range"
                      min="3"
                      max="60"
                      value={customization.slideshowDuration}
                      onChange={(e) =>
                        updateConfig({
                          slideshowDuration: parseInt(e.target.value),
                        })
                      }
                      className="w-full accent-pink-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>3s</span>
                      <span>60s</span>
                    </div>
                  </div>
                )}
            </>
          )}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Prayer Instructions">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 block mb-2">
              Instruction Image
            </label>
            <p className="text-xs text-gray-400 mb-3">
              This image will be displayed after each Iqamah time for the
              duration you specify below.
            </p>
            <ImageUploader
              images={
                customization.prayerInstructionImage
                  ? [customization.prayerInstructionImage]
                  : []
              }
              onChange={(imgs) =>
                updateConfig({ prayerInstructionImage: imgs[0] || "" })
              }
              maxImages={1}
              userId={currentUserId}
              displayId={displayId}
              imageType="prayer-instruction"
              environment={environment}
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 block mb-2">
              Display Duration: {customization.prayerInstructionDuration}{" "}
              seconds
            </label>
            <p className="text-xs text-gray-400 mb-2">
              How long to show the prayer instructions after Iqamah
            </p>
            <input
              type="range"
              min="10"
              max="1200"
              step="10"
              value={customization.prayerInstructionDuration}
              onChange={(e) =>
                updateConfig({
                  prayerInstructionDuration: parseInt(e.target.value),
                })
              }
              className="w-full accent-pink-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>10 sec</span>
              <span>20 min</span>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Display Options">
        <div className="space-y-3">
          {[
            {
              key: "showHijriDate",
              label: "Show Hijri Date",
              desc: "Display Islamic calendar",
            },
          ].map((option) => (
            <label
              key={option.key}
              className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-800/30 rounded transition-colors"
            >
              <div>
                <div className="text-sm text-gray-200">{option.label}</div>
                <div className="text-xs text-gray-400">{option.desc}</div>
              </div>
              <input
                type="checkbox"
                checked={
                  customization[option.key as keyof MasjidConfig] as boolean
                }
                onChange={(e) =>
                  updateConfig({ [option.key]: e.target.checked })
                }
                className="w-5 h-5 rounded bg-gray-800 border-gray-700 text-pink-500 focus:ring-pink-500"
              />
            </label>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
}
