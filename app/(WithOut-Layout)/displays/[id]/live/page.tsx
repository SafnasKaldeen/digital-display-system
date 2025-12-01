// app/(WithOut-Layout)/displays/[id]/preview/page.tsx

"use client";

import type React from "react";

import { useSearchParams, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { MasjidTemplate } from "@/components/templates/masjid-template";
import { HospitalTemplate } from "@/components/templates/hospital-template";
import { CorporateTemplate } from "@/components/templates/corporate-template";
import { Power, AlertCircle } from "lucide-react";

export default function PreviewPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const displayId = params.id as string;
  const configString = searchParams.get("config");
  const [customization, setCustomization] = useState<any>(null);
  const [scale, setScale] = useState(1);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [displayName, setDisplayName] = useState<string>("");

  // Check if display is disabled by fetching from API
  useEffect(() => {
    const checkDisplayStatus = async () => {
      if (!displayId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/displays/${displayId}/config`);

        if (response.ok) {
          const result = await response.json();

          if (result.success && result.data) {
            const status = result.data.status;
            const name = result.data.name;

            setDisplayName(name || "Display");

            // Check if display is disabled
            if (status === "disabled") {
              setIsDisabled(true);
              setIsLoading(false);
              return;
            }
          }
        }
      } catch (error) {
        console.error("Error checking display status:", error);
      }

      setIsDisabled(false);
      setIsLoading(false);
    };

    checkDisplayStatus();
  }, [displayId]);

  useEffect(() => {
    if (configString && !isDisabled) {
      try {
        const decoded = JSON.parse(decodeURIComponent(configString));

        // Normalize color configuration - prioritize colorTheme over colors
        // colorTheme is the source of truth for actual display colors
        if (decoded.colorTheme) {
          decoded.colors = decoded.colorTheme;
        } else if (!decoded.colors) {
          // Fallback to default colors if neither exists
          decoded.colors = {
            primary: "#10b981",
            secondary: "#059669",
            text: "#ffffff",
            accent: "#fbbf24",
          };
        }

        setCustomization(decoded);
      } catch (e) {
        console.error("Error parsing config:", e);
      }
    }
  }, [configString, isDisabled]);

  // Perfect scaling with correct 16:9 landscape preview
  useEffect(() => {
    const updateScale = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const targetWidth = 1920;
      const targetHeight = 1080;

      const scaleX = viewportWidth / targetWidth;
      const scaleY = viewportHeight / targetHeight;

      setScale(Math.min(scaleX, scaleY));
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  if (isLoading) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white text-lg">Loading preview...</p>
        </div>
      </div>
    );
  }

  // Display disabled state
  if (isDisabled) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <div className="text-center space-y-6 max-w-2xl px-8">
          {/* Icon */}
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-amber-900/30 rounded-full blur-2xl"></div>
            <div className="relative w-32 h-32 bg-amber-900/20 rounded-full flex items-center justify-center border-4 border-amber-700/50">
              <Power className="w-16 h-16 text-amber-600" />
            </div>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-4xl font-bold text-white mb-3">
              Preview Unavailable
            </h1>
            <p className="text-xl text-gray-400">
              {displayName || "This display"}
            </p>
          </div>

          {/* Message */}
          <div className="bg-amber-900/10 backdrop-blur-sm border border-amber-700/30 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-amber-200/90 text-lg leading-relaxed mb-2">
                  This display is currently disabled and cannot be previewed.
                </p>
                <p className="text-amber-300/60 text-sm">
                  Enable the display from the admin dashboard to view the
                  preview.
                </p>
              </div>
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex items-center justify-center gap-3 text-amber-600">
            <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
            <span className="text-sm font-medium uppercase tracking-wider">
              Display Status: Disabled
            </span>
            <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!customization) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  const getBackgroundStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      backgroundSize: "cover",
      backgroundPosition: "center",
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
      customization.backgroundImage?.length > 0
    ) {
      return {
        ...baseStyle,
        backgroundImage: `url(${customization.backgroundImage[0]})`,
      };
    }

    return { ...baseStyle, backgroundColor: "#000" };
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
          <div className="text-white text-2xl">
            Unknown template: {customization.template}
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex items-center justify-center overflow-hidden">
      {/* Maintain perfect 16:9 landscape aspect ratio */}
      <div
        className="relative"
        style={{
          width: "100vw",
          height: "56.25vw", // 16:9 = 9/16 = 0.5625
          maxHeight: "100vh",
          maxWidth: "177.78vh", // 16:9 = 16/9 = 1.7778
        }}
      >
        {/* 1920×1080 content scaled properly */}
        <div
          style={{
            width: 1920,
            height: 1080,
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) scale(${scale})`,
            transformOrigin: "center center",
            color: "white",
          }}
        >
          {renderTemplate()}
        </div>
      </div>
    </div>
  );
}
