// app/displays/[id]/edit/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TemplateEditor } from "@/components/editor/template-editor";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Eye } from "lucide-react";
import { getDisplayById } from "@/app/actions/displays";

interface DisplayData {
  id: string;
  name: string;
  template_type: string;
  templateType: "masjid" | "hospital" | "corporate" | "restaurant" | "retail";
  location?: string;
  status: "active" | "inactive";
  displayUrl: string;
  resolution?: string;
  config: any;
}

export default function EditDisplayPage() {
  const params = useParams();
  const router = useRouter();
  const displayId = params.id as string;

  const [display, setDisplay] = useState<DisplayData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDisplay = async () => {
      if (!displayId) {
        setError("No display ID provided");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Fetching display:", displayId);
        const { data, error: fetchError } = await getDisplayById(displayId);

        if (fetchError || !data) {
          console.error("Error fetching display:", fetchError);
          setError(fetchError || "Display not found");
          setIsLoading(false);
          return;
        }

        console.log("Display data fetched:", data);

        // Map template_type to templateType for compatibility
        const templateTypeMap: Record<
          string,
          "masjid" | "hospital" | "corporate"
        > = {
          masjid: "masjid",
          hospital: "hospital",
          corporate: "corporate",
        };

        const mappedDisplay: DisplayData = {
          id: data.id,
          name: data.name,
          template_type: data.template_type,
          templateType: templateTypeMap[data.template_type] || "masjid",
          status: "active",
          displayUrl: `${window.location.origin}/displays/${data.id}/live`,
          config: data.config || {},
          location: data.location || `${data.name} - Display`,
          resolution: data.resolution || "1920x1080",
        };

        console.log("Mapped display:", mappedDisplay);
        setDisplay(mappedDisplay);
      } catch (err) {
        console.error("Failed to fetch display:", err);
        setError("An error occurred while loading the display");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDisplay();
  }, [displayId]);

  const handlePreview = () => {
    if (!display) return;

    // Get the template type based on display
    const templateMap: Record<string, string> = {
      masjid: "masjid-classic",
      hospital: "hospital-modern",
      corporate: "corporate-dashboard",
      restaurant: "masjid-classic", // fallback
      retail: "masjid-classic", // fallback
    };

    // Create the configuration object that preview page expects
    const previewConfig = {
      template: templateMap[display.templateType] || "masjid-classic",
      layout: display.config?.layout || "vertical",
      prayerTimes: display.config?.prayerTimes || {
        fajr: "05:30",
        dhuhr: "12:45",
        asr: "15:30",
        maghrib: "18:15",
        isha: "19:45",
      },
      iqamahOffsets: display.config?.iqamahOffsets || {
        fajr: 15,
        dhuhr: 10,
        asr: 10,
        maghrib: 5,
        isha: 10,
      },
      colors: display.config?.colors ||
        display.config?.colorTheme || {
          primary: "#1e40af",
          secondary: "#7c3aed",
          text: "#ffffff",
          accent: "#f59e0b",
        },
      colorTheme: display.config?.colorTheme ||
        display.config?.colors || {
          primary: "#1e40af",
          secondary: "#7c3aed",
          text: "#ffffff",
          accent: "#f59e0b",
        },
      backgroundType: display.config?.backgroundType || "solid",
      backgroundColor: display.config?.backgroundColor || "#000000",
      backgroundImage: display.config?.backgroundImage || [],
      slideshowDuration: display.config?.slideshowDuration || 5,
      announcements: display.config?.announcements || [],
      showHijriDate: display.config?.showHijriDate !== false,
      font: display.config?.font || "Inter, sans-serif",
      masjidName: display.config?.masjidName || display.name,
      logo: display.config?.logo || "",
    };

    // Encode and navigate to preview page
    const configParam = encodeURIComponent(JSON.stringify(previewConfig));
    window.open(
      `/displays/${displayId}/preview?config=${configParam}`,
      "_blank"
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading display...</p>
        </div>
      </div>
    );
  }

  if (error || !display) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="text-3xl">📺</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            {error === "Display not found"
              ? "Display Not Found"
              : "Error Loading Display"}
          </h2>
          <p className="text-gray-400 mb-6">
            {error ||
              "The display you're looking for doesn't exist or has been removed."}
          </p>
          <Button
            onClick={() => router.push("/displays")}
            className="bg-pink-300 text-gray-900 hover:bg-pink-400"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Displays
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      {/* Top Bar */}
      <header className="bg-gray-900 border-b border-gray-800 flex-shrink-0">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Back + Title */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/displays")}
                className="text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <ArrowLeft size={20} />
              </Button>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold text-white">
                    {display.name}
                  </h1>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      display.status === "active"
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-gray-700 text-gray-300 border border-gray-600"
                    }`}
                  >
                    {display.status}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-0.5">
                  {display.location}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Editor Content */}
      <main className="flex-1 overflow-hidden mb-6">
        {/* <pre className="text-xs">{JSON.stringify(display.config, null, 2)}</pre> */}
        <TemplateEditor
          displayName={display.name}
          displayId={displayId}
          templateType={display.templateType}
          initialConfig={display.config}
        />
      </main>
    </div>
  );
}
