"use client";

import type React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { ColorPicker } from "@/components/customization/color-picker";
import { TimePicker } from "@/components/customization/time-picker";
import { ImageUploader } from "@/components/customization/image-uploader";
import { AnnouncementEditor } from "@/components/customization/announcement-editor";

interface DisplayCustomization {
  template: string;
  layout: string;
  prayerTimes: {
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
  iqamahOffsets: {
    fajr: number;
    dhuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
  };
  colors: {
    primary: string;
    secondary: string;
    text: string;
    accent: string;
  };
  backgroundType: "solid" | "gradient" | "image" | "slideshow";
  backgroundColor: string;
  backgroundImage: string[];
  slideshowDuration: number;
  announcements: Array<{ text: string; duration: number }>;
  showHijriDate: boolean;
  font: string;
}

interface EditorPanelProps {
  customization: DisplayCustomization;
  setCustomization: (custom: DisplayCustomization) => void;
}

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary/50 transition-colors"
      >
        <span className="font-semibold text-foreground">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 py-4 space-y-4 bg-secondary/30">{children}</div>
      )}
    </div>
  );
}

export function EditorPanel({
  customization,
  setCustomization,
}: EditorPanelProps) {
  // Helper function to update nested properties
  const updateCustomization = (updates: Partial<DisplayCustomization>) => {
    setCustomization({ ...customization, ...updates });
  };

  return (
    <div>
      {/* Header */}
      <div className="px-4 py-4 border-b border-border">
        <h2 className="text-xl font-bold text-foreground">Customize Display</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your display settings and preview changes in real-time
        </p>
      </div>

      {/* Template Selector */}
      <CollapsibleSection title="Template" defaultOpen={true}>
        <div className="space-y-2">
          <Label>Select Template</Label>
          <Select
            value={customization.template}
            onValueChange={(value) => updateCustomization({ template: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="masjid-classic">
                <div className="flex items-center gap-2">
                  <span>🕌</span>
                  <span>Classic Masjid</span>
                </div>
              </SelectItem>
              <SelectItem value="hospital-modern">
                <div className="flex items-center gap-2">
                  <span>🏥</span>
                  <span>Modern Hospital</span>
                </div>
              </SelectItem>
              <SelectItem value="corporate-dashboard">
                <div className="flex items-center gap-2">
                  <span>💼</span>
                  <span>Corporate Dashboard</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CollapsibleSection>

      {/* Layout Section */}
      <CollapsibleSection title="Layout">
        <div className="space-y-2">
          <Label>Display Layout</Label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "vertical", icon: "📏", label: "Vertical" },
              { value: "horizontal", icon: "📐", label: "Horizontal" },
              { value: "centered", icon: "◼️", label: "Centered" },
            ].map((layout) => (
              <button
                key={layout.value}
                onClick={() => updateCustomization({ layout: layout.value })}
                className={`p-4 rounded-lg border-2 text-sm font-medium capitalize transition-all hover:scale-105 ${
                  customization.layout === layout.value
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                <div className="text-2xl mb-1">{layout.icon}</div>
                <div className="text-xs">{layout.label}</div>
              </button>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      {/* Content Section - Masjid Template */}
      {customization.template === "masjid-classic" && (
        <>
          <CollapsibleSection title="Prayer Times">
            <div className="space-y-4">
              {Object.entries(customization.prayerTimes).map(
                ([prayer, time]) => (
                  <div key={prayer} className="space-y-2">
                    <Label className="capitalize">{prayer} Prayer</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <TimePicker
                          value={time as string}
                          onChange={(newTime) =>
                            setCustomization({
                              ...customization,
                              prayerTimes: {
                                ...customization.prayerTimes,
                                [prayer]: newTime,
                              },
                            })
                          }
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Adhan time
                        </p>
                      </div>
                      <div>
                        <Input
                          type="number"
                          min="0"
                          max="60"
                          value={
                            customization.iqamahOffsets[
                              prayer as keyof typeof customization.iqamahOffsets
                            ]
                          }
                          onChange={(e) =>
                            setCustomization({
                              ...customization,
                              iqamahOffsets: {
                                ...customization.iqamahOffsets,
                                [prayer]: Number.parseInt(e.target.value) || 0,
                              },
                            })
                          }
                          className="text-center"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          +
                          {
                            customization.iqamahOffsets[
                              prayer as keyof typeof customization.iqamahOffsets
                            ]
                          }{" "}
                          min Iqamah
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="hijri-date">Show Hijri Date</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Display Islamic calendar date
                  </p>
                </div>
                <Switch
                  id="hijri-date"
                  checked={customization.showHijriDate}
                  onCheckedChange={(checked) =>
                    updateCustomization({ showHijriDate: checked })
                  }
                />
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Announcements">
            <AnnouncementEditor
              announcements={customization.announcements}
              onChange={(announcements) =>
                updateCustomization({ announcements })
              }
            />
          </CollapsibleSection>
        </>
      )}

      {/* Styling Section */}
      <CollapsibleSection title="Colors & Styling">
        <div className="space-y-4">
          <div>
            <Label>Primary Color</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Main theme color
            </p>
            <ColorPicker
              value={customization.colors.primary}
              onChange={(color) =>
                setCustomization({
                  ...customization,
                  colors: { ...customization.colors, primary: color },
                })
              }
            />
          </div>

          <div>
            <Label>Secondary Color</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Accent and highlights
            </p>
            <ColorPicker
              value={customization.colors.secondary}
              onChange={(color) =>
                setCustomization({
                  ...customization,
                  colors: { ...customization.colors, secondary: color },
                })
              }
            />
          </div>

          <div>
            <Label>Text Color</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Primary text color
            </p>
            <ColorPicker
              value={customization.colors.text}
              onChange={(color) =>
                setCustomization({
                  ...customization,
                  colors: { ...customization.colors, text: color },
                })
              }
            />
          </div>

          <div>
            <Label>Accent Color</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Special emphasis
            </p>
            <ColorPicker
              value={customization.colors.accent}
              onChange={(color) =>
                setCustomization({
                  ...customization,
                  colors: { ...customization.colors, accent: color },
                })
              }
            />
          </div>

          <div className="pt-4 border-t border-border">
            <Label>Font Family</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Choose display font
            </p>
            <Select
              value={customization.font}
              onValueChange={(font) => updateCustomization({ font })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Helvetica">Helvetica</SelectItem>
                <SelectItem value="Georgia">Georgia</SelectItem>
                <SelectItem value="Roboto">Roboto</SelectItem>
                <SelectItem value="Open Sans">Open Sans</SelectItem>
                <SelectItem value="Courier New">Courier New</SelectItem>
                <SelectItem value="Amiri">Amiri (Arabic)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CollapsibleSection>

      {/* Background Section */}
      <CollapsibleSection title="Background">
        <div className="space-y-4">
          <div>
            <Label>Background Type</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Choose background style
            </p>
            <Select
              value={customization.backgroundType}
              onValueChange={(type: any) =>
                updateCustomization({ backgroundType: type })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">🎨 Solid Color</SelectItem>
                <SelectItem value="image">🖼️ Single Image</SelectItem>
                <SelectItem value="slideshow">🎞️ Image Slideshow</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {customization.backgroundType === "solid" && (
            <div>
              <Label>Background Color</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Choose solid color
              </p>
              <ColorPicker
                value={customization.backgroundColor}
                onChange={(color) =>
                  updateCustomization({ backgroundColor: color })
                }
              />
            </div>
          )}

          {(customization.backgroundType === "image" ||
            customization.backgroundType === "slideshow") && (
            <>
              <div>
                <Label>
                  {customization.backgroundType === "slideshow"
                    ? "Slideshow Images"
                    : "Background Image"}
                </Label>
                <p className="text-xs text-muted-foreground mb-3">
                  {customization.backgroundType === "slideshow"
                    ? "Upload multiple images for slideshow"
                    : "Upload a single background image"}
                </p>
                <ImageUploader
                  images={customization.backgroundImage}
                  onChange={(images) =>
                    updateCustomization({ backgroundImage: images })
                  }
                  maxImages={
                    customization.backgroundType === "slideshow" ? 10 : 1
                  }
                />
              </div>

              {customization.backgroundType === "slideshow" &&
                customization.backgroundImage.length > 1 && (
                  <div className="pt-4 border-t border-border">
                    <Label>
                      Slideshow Duration: {customization.slideshowDuration}{" "}
                      seconds
                    </Label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Time to display each image
                    </p>
                    <Slider
                      value={[customization.slideshowDuration]}
                      onValueChange={([value]) =>
                        updateCustomization({ slideshowDuration: value })
                      }
                      min={3}
                      max={60}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>3s</span>
                      <span>60s</span>
                    </div>
                  </div>
                )}
            </>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
}
