// app/displays/[id]/edit/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TemplateEditor } from "@/components/editor/template-editor";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Power, AlertCircle } from "lucide-react";
import { getDisplayById } from "@/app/actions/displays";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DisplayData {
  id: string;
  name: string;
  template_type: string;
  templateType: "masjid" | "hospital" | "corporate" | "restaurant" | "retail";
  location?: string;
  status: "active" | "disabled";
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
  const [isEnabling, setIsEnabling] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Fetch user role
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.user.role);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

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
          "masjid" | "hospital" | "corporate" | "restaurant" | "retail"
        > = {
          masjid: "masjid",
          hospital: "hospital",
          corporate: "corporate",
          restaurant: "restaurant",
          retail: "retail",
        };

        const mappedDisplay: DisplayData = {
          id: data.id,
          name: data.name,
          template_type: data.template_type,
          templateType: templateTypeMap[data.template_type] || "masjid",
          status: data.status === "active" ? "active" : "disabled",
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

  const handleEnableDisplay = async () => {
    if (!display || userRole !== "admin") return;

    setIsEnabling(true);
    try {
      const response = await fetch(`/api/admin/displays/${displayId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      });

      if (response.ok) {
        setDisplay({ ...display, status: "active" });
      } else {
        console.error("Failed to enable display");
      }
    } catch (error) {
      console.error("Error enabling display:", error);
    } finally {
      setIsEnabling(false);
    }
  };

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

  const isDisabled = display.status === "disabled";
  const isAdmin = userRole === "admin";

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
                    {display.status === "active" ? "Active" : "Disabled"}
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

      {/* Disabled State Warning */}
      {isDisabled && (
        <div className="px-6 pt-6">
          <Alert className="bg-amber-500/10 border-amber-500/30">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <AlertTitle className="text-amber-500 font-semibold mb-2">
              Display is Disabled
            </AlertTitle>
            <AlertDescription className="text-amber-200/80 mb-3">
              {isAdmin
                ? "This display is currently disabled. Editing is restricted until you enable it. Enable the display to make changes to the configuration."
                : "This display is currently disabled. Contact your administrator to enable it before making changes."}
            </AlertDescription>
            {isAdmin && (
              <Button
                onClick={handleEnableDisplay}
                disabled={isEnabling}
                size="sm"
                className="bg-amber-500 text-gray-900 hover:bg-amber-400"
              >
                {isEnabling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mr-2" />
                    Enabling...
                  </>
                ) : (
                  <>
                    <Power size={16} className="mr-2" />
                    Enable Display
                  </>
                )}
              </Button>
            )}
          </Alert>
        </div>
      )}

      {/* Editor Content */}
      <main className="flex-1 overflow-hidden mb-6 relative">
        {/* Overlay when disabled */}
        {isDisabled && (
          <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-center max-w-md px-6">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Power size={40} className="text-gray-600" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">
                Display Disabled
              </h3>
              <p className="text-gray-400 mb-6">
                {isAdmin
                  ? "Enable the display to access the editor and make changes to your configuration."
                  : "This display is currently disabled. Contact your administrator to enable it."}
              </p>
              {isAdmin && (
                <Button
                  onClick={handleEnableDisplay}
                  disabled={isEnabling}
                  className="bg-pink-300 text-gray-900 hover:bg-pink-400"
                >
                  {isEnabling ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mr-2" />
                      Enabling...
                    </>
                  ) : (
                    <>
                      <Power size={18} className="mr-2" />
                      Enable Display Now
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}

        <div className={isDisabled ? "pointer-events-none select-none" : ""}>
          <TemplateEditor
            displayName={display.name}
            displayId={displayId}
            templateType={display.templateType}
            initialConfig={display.config}
          />
        </div>
      </main>
    </div>
  );
}
