"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { MasjidTemplate } from "@/components/templates/masjid-template";
import { HospitalTemplate } from "@/components/templates/hospital-template";
import { CorporateTemplate } from "@/components/templates/corporate-template";

interface DisplayCustomization {
  template: string;
  layout: string; // Add layout property
  prayerTimes: any;
  iqamahOffsets: any;
  colors: any;
  backgroundType: string;
  backgroundColor: string;
  backgroundImage: string[];
  slideshowDuration: number;
  announcements: any[];
  showHijriDate: boolean;
  font: string;
}

interface LivePreviewProps {
  customization: DisplayCustomization;
}

export function LivePreview({ customization }: LivePreviewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (
      customization.backgroundType === "slideshow" &&
      customization.backgroundImage.length > 1
    ) {
      const interval = setInterval(() => {
        setCurrentSlide(
          (prev) => (prev + 1) % customization.backgroundImage.length
        );
      }, customization.slideshowDuration * 1000);
      return () => clearInterval(interval);
    }
  }, [
    customization.backgroundType,
    customization.backgroundImage,
    customization.slideshowDuration,
  ]);

  const getBackgroundStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      backgroundSize: "cover",
      backgroundPosition: "center",
      transition: "background-image 1s ease-in-out", // Smooth transition for slideshow
    };

    if (customization.backgroundType === "solid") {
      return { ...baseStyle, backgroundColor: customization.backgroundColor };
    }

    if (
      customization.backgroundType === "image" &&
      customization.backgroundImage?.[0]
    ) {
      return {
        ...baseStyle,
        backgroundImage: `url(${customization.backgroundImage[0]})`,
      };
    }

    if (
      customization.backgroundType === "slideshow" &&
      customization.backgroundImage.length > 0
    ) {
      return {
        ...baseStyle,
        backgroundImage: `url(${customization.backgroundImage[currentSlide]})`,
      };
    }

    // Default fallback
    return { ...baseStyle, backgroundColor: "#1A472A" };
  };

  const renderTemplate = () => {
    switch (customization.template) {
      case "masjid-classic":
        return (
          <MasjidTemplate
            customization={customization}
            backgroundStyle={getBackgroundStyle()}
          />
        );
      case "hospital-modern":
        return (
          <HospitalTemplate
            customization={customization}
            backgroundStyle={getBackgroundStyle()}
          />
        );
      case "corporate-dashboard":
        return (
          <CorporateTemplate
            customization={customization}
            backgroundStyle={getBackgroundStyle()}
          />
        );
      default:
        return (
          <div className="flex items-center justify-center h-full text-white text-center p-8">
            <div>
              <p className="text-2xl font-bold mb-2">Select a Template</p>
              <p className="text-sm opacity-70">
                Choose a template from the editor to see preview
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="sticky top-20 rounded-lg overflow-hidden border-2 border-primary/50 shadow-xl bg-black">
      {/* Preview Container - 16:9 aspect ratio */}
      <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
        {/* Template Content */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          {renderTemplate()}
        </div>

        {/* Overlay Labels */}
        <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-4 pointer-events-none z-50">
          {/* Layout Indicator */}
          <div className="bg-black/70 text-white px-3 py-1.5 rounded-md text-xs font-mono backdrop-blur-sm border border-white/20">
            <span className="opacity-70">Layout:</span>{" "}
            <span className="font-bold capitalize">
              {customization.layout || "vertical"}
            </span>
          </div>
        </div>

        {/* Template Indicator - Bottom Left */}
        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1.5 rounded-md text-xs font-mono backdrop-blur-sm border border-white/20 pointer-events-none z-50">
          <span className="opacity-70">Template:</span>{" "}
          <span className="font-bold">
            {customization.template === "masjid-classic" && "Classic Masjid"}
            {customization.template === "hospital-modern" && "Modern Hospital"}
            {customization.template === "corporate-dashboard" &&
              "Corporate Dashboard"}
          </span>
        </div>
      </div>

      {/* Info Bar */}
      <div className="bg-card border-t border-border px-4 py-3 text-xs text-muted-foreground flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="font-medium">Live Preview</span>
          </span>
          <span className="opacity-60">📺 1920×1080</span>
        </div>

        <div className="flex items-center gap-4">
          {customization.backgroundType === "slideshow" &&
            customization.backgroundImage.length > 1 && (
              <span className="flex items-center gap-2">
                <span className="opacity-60">Slideshow:</span>
                <span className="font-medium">
                  {currentSlide + 1} / {customization.backgroundImage.length}
                </span>
                <span className="opacity-60">
                  ({customization.slideshowDuration}s)
                </span>
              </span>
            )}

          {customization.backgroundType === "solid" && (
            <span className="flex items-center gap-2">
              <span className="opacity-60">Background:</span>
              <div
                className="w-4 h-4 rounded border border-border"
                style={{ backgroundColor: customization.backgroundColor }}
              />
            </span>
          )}

          {customization.backgroundType === "image" &&
            customization.backgroundImage.length > 0 && (
              <span className="opacity-60">🖼️ Single Image</span>
            )}
        </div>
      </div>
    </div>
  );
}
