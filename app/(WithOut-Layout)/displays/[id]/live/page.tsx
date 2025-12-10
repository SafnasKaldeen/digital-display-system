// app/displays/[id]/live/page.tsx
"use client";

import { use, useEffect, useState, useRef } from "react";
import {
  Loader2,
  AlertCircle,
  Power,
  Smartphone,
  ShieldAlert,
  Clock,
} from "lucide-react";
import { MasjidTemplate } from "@/components/templates/masjid-template";
import { HospitalTemplate } from "@/components/templates/hospital-template";
import { CorporateTemplate } from "@/components/templates/corporate-template";
import type React from "react";

interface LivePageProps {
  params: Promise<{
    id: string;
  }>;
}

interface DeviceAuthState {
  isAuthorized: boolean;
  isLoading: boolean;
  error: string | null;
  deviceId: string | null;
  deviceName: string | null;
  needsRegistration: boolean;
  status: "pending" | "approved" | "denied" | null;
}

interface UserData {
  id: string;
  role: string;
  email: string;
  business_name?: string;
}

export default function LivePage({ params }: LivePageProps) {
  const { id } = use(params);
  const [customization, setCustomization] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [isDisabled, setIsDisabled] = useState(false);
  const [displayName, setDisplayName] = useState<string>("");
  const previousConfigRef = useRef<string>("");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Device authentication state
  const [deviceAuth, setDeviceAuth] = useState<DeviceAuthState>({
    isAuthorized: false,
    isLoading: true,
    error: null,
    deviceId: null,
    deviceName: null,
    needsRegistration: false,
    status: null,
  });
  const [registrationName, setRegistrationName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // Check if user is admin first
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setUserData(data.user);

          // If user is admin, automatically authorize
          if (data.user.role === "admin") {
            setDeviceAuth({
              isAuthorized: true,
              isLoading: false,
              error: null,
              deviceId: "admin-device",
              deviceName: "Admin Access",
              needsRegistration: false,
              status: "approved",
            });
          }
        }
      } catch (error) {
        console.error("Error checking user role:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkUserRole();
  }, []);

  // Check device authorization (only if not admin)
  useEffect(() => {
    if (isCheckingAuth) return;

    // Skip device auth check for admins
    if (userData?.role === "admin") {
      return;
    }

    checkDeviceAuth();

    // Re-check authorization every 30 seconds
    const authInterval = setInterval(checkDeviceAuth, 30000);

    return () => clearInterval(authInterval);
  }, [id, isCheckingAuth, userData]);

  const checkDeviceAuth = async () => {
    try {
      setDeviceAuth((prev) => ({ ...prev, isLoading: true, error: null }));

      // Get or create device ID
      let deviceId = localStorage.getItem("device_id");

      if (!deviceId) {
        // Generate unique device ID
        deviceId = `device_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        localStorage.setItem("device_id", deviceId);
      }

      // Check if device is authorized
      const response = await fetch("/api/admin/device/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          displayId: id,
          userAgent: navigator.userAgent,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setDeviceAuth({
          isAuthorized: result.authorized,
          isLoading: false,
          error: null,
          deviceId,
          deviceName: result.deviceName,
          needsRegistration: result.needsRegistration,
          status: result.status,
        });
      } else {
        setDeviceAuth((prev) => ({
          ...prev,
          isLoading: false,
          error: result.message || "Authorization failed",
        }));
      }
    } catch (err) {
      setDeviceAuth((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to verify device",
      }));
    }
  };

  const handleRegisterDevice = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!registrationName.trim()) {
      alert("Please enter a device name");
      return;
    }

    setIsRegistering(true);

    try {
      const deviceId = localStorage.getItem("device_id");

      const response = await fetch("/api/admin/device/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          displayId: id,
          deviceName: registrationName,
          userAgent: navigator.userAgent,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
        }),
      });

      const result = await response.json();

      if (result.success) {
        await checkDeviceAuth();
        setRegistrationName("");
      } else {
        alert(result.message || "Registration failed");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsRegistering(false);
    }
  };

  // Fetch config from database (only if device is authorized)
  useEffect(() => {
    if (!deviceAuth.isAuthorized) {
      return;
    }

    const fetchConfig = async () => {
      try {
        // Only show loading on initial fetch
        if (!customization) {
          setIsLoading(true);
        }
        setError(null);

        const response = await fetch(`/api/displays/${id}/config`);

        if (!response.ok) {
          throw new Error("Failed to fetch display configuration");
        }

        const result = await response.json();

        if (!result.success || !result.data) {
          throw new Error("Invalid configuration data");
        }

        const config = result.data.config;
        const status = result.data.status;
        const name = result.data.name;

        // Check if display is disabled
        if (status === "disabled") {
          setIsDisabled(true);
          setDisplayName(name || "Display");
          setIsLoading(false);
          return;
        }

        setIsDisabled(false);

        // Normalize color configuration - prioritize colorTheme over colors
        if (config.colorTheme) {
          config.colors = config.colorTheme;
        } else if (!config.colors) {
          // Fallback to default colors if neither exists
          config.colors = {
            primary: "#10b981",
            secondary: "#059669",
            text: "#ffffff",
            accent: "#fbbf24",
          };
        }

        // Only update state if config actually changed
        const newConfigString = JSON.stringify(config);
        if (newConfigString !== previousConfigRef.current) {
          console.log("Config changed, updating display");
          previousConfigRef.current = newConfigString;
          setCustomization(config);
        } else {
          console.log("Config unchanged, skipping update");
        }
      } catch (err) {
        console.error("Error fetching config:", err);
        setError(err instanceof Error ? err.message : "Failed to load display");
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();

    // Poll every 5 minutes for updates
    const interval = setInterval(fetchConfig, 300000);

    return () => clearInterval(interval);
  }, [id, deviceAuth.isAuthorized]);

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

  // Device authentication loading state (skip for admin)
  if (deviceAuth.isLoading && userData?.role !== "admin") {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-400" />
          <p className="text-white text-lg">Verifying device...</p>
        </div>
      </div>
    );
  }

  // Device needs registration (skip for admin)
  if (deviceAuth.needsRegistration && userData?.role !== "admin") {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-md w-full mx-auto px-6">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="relative inline-flex">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"></div>
                <div className="relative w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center border-4 border-blue-500/50">
                  <Smartphone className="w-10 h-10 text-blue-400" />
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">
                Register Device
              </h1>
              <p className="text-slate-400">
                This device needs to be registered before accessing the display
              </p>
            </div>

            {/* Device ID */}
            <div className="bg-slate-900/50 rounded-lg p-4">
              <p className="text-xs text-slate-500 mb-1">Device ID</p>
              <p className="text-sm text-slate-300 font-mono break-all">
                {deviceAuth.deviceId}
              </p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleRegisterDevice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Device Name
                </label>
                <input
                  type="text"
                  value={registrationName}
                  onChange={(e) => setRegistrationName(e.target.value)}
                  placeholder="e.g., Reception TV, Lobby Display"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isRegistering}
                />
              </div>

              <button
                type="submit"
                disabled={isRegistering}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register Device"
                )}
              </button>
            </form>

            {/* Help text */}
            <p className="text-xs text-slate-500 text-center">
              After registration, an admin must approve this device before it
              can access the display
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Device pending approval (skip for admin)
  if (deviceAuth.status === "pending" && userData?.role !== "admin") {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950">
        <div className="text-center space-y-6 max-w-2xl px-8">
          {/* Icon */}
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-2xl"></div>
            <div className="relative w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center border-4 border-amber-500/50">
              <Clock className="w-16 h-16 text-amber-400 animate-pulse" />
            </div>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-4xl font-bold text-white mb-3">
              Awaiting Approval
            </h1>
            <p className="text-xl text-slate-400">
              {deviceAuth.deviceName || "This device"}
            </p>
          </div>

          {/* Message */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
            <p className="text-slate-300 text-lg leading-relaxed mb-4">
              Your device has been registered and is waiting for admin approval.
              Please contact your administrator to approve this device.
            </p>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <p className="text-xs text-slate-500 mb-1">Device ID</p>
              <p className="text-sm text-slate-300 font-mono break-all">
                {deviceAuth.deviceId}
              </p>
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex items-center justify-center gap-3 text-slate-500">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium uppercase tracking-wider">
              Status: Pending Approval
            </span>
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
          </div>

          {/* Refresh button */}
          <button
            onClick={checkDeviceAuth}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
          >
            Check Status
          </button>
        </div>
      </div>
    );
  }

  // Device denied (skip for admin)
  if (deviceAuth.status === "denied" && userData?.role !== "admin") {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-red-950 via-slate-900 to-slate-950">
        <div className="text-center space-y-6 max-w-2xl px-8">
          {/* Icon */}
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl"></div>
            <div className="relative w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center border-4 border-red-500/50">
              <ShieldAlert className="w-16 h-16 text-red-400" />
            </div>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-4xl font-bold text-white mb-3">
              Access Denied
            </h1>
            <p className="text-xl text-slate-400">
              {deviceAuth.deviceName || "This device"}
            </p>
          </div>

          {/* Message */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-red-900/50 rounded-2xl p-6">
            <p className="text-slate-300 text-lg leading-relaxed mb-4">
              This device has been denied access to the display. Please contact
              your administrator for more information.
            </p>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <p className="text-xs text-slate-500 mb-1">Device ID</p>
              <p className="text-sm text-slate-300 font-mono break-all">
                {deviceAuth.deviceId}
              </p>
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex items-center justify-center gap-3 text-slate-500">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm font-medium uppercase tracking-wider">
              Status: Access Denied
            </span>
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  // Device not authorized (catch-all, skip for admin)
  if (!deviceAuth.isAuthorized && userData?.role !== "admin") {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center space-y-4 max-w-md px-6">
          <ShieldAlert className="w-16 h-16 mx-auto text-red-400" />
          <h2 className="text-white text-2xl font-bold">Unauthorized Device</h2>
          <p className="text-slate-400">
            {deviceAuth.error ||
              "This device is not authorized to access this display"}
          </p>
          <button
            onClick={checkDeviceAuth}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // From here on, device is authorized (or user is admin) - proceed with normal display logic

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-pink-400" />
          <p className="text-white text-lg">Loading display...</p>
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
            <div className="absolute inset-0 bg-gray-800 rounded-full blur-2xl opacity-50"></div>
            <div className="relative w-32 h-32 bg-gray-800 rounded-full flex items-center justify-center border-4 border-gray-700">
              <Power className="w-16 h-16 text-gray-600" />
            </div>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-4xl font-bold text-white mb-3">
              Display Disabled
            </h1>
            <p className="text-xl text-gray-400">
              {displayName || "This display"}
            </p>
          </div>

          {/* Message */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
            <p className="text-gray-300 text-lg leading-relaxed">
              This display has been temporarily disabled and is not currently
              active. Please enable it from the admin dashboard to resume
              broadcasting.
            </p>
          </div>

          {/* Status indicator */}
          <div className="flex items-center justify-center gap-3 text-gray-500">
            <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
            <span className="text-sm font-medium uppercase tracking-wider">
              Status: Disabled
            </span>
            <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !customization) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <div className="text-center space-y-4 max-w-md px-6">
          <AlertCircle className="w-16 h-16 mx-auto text-red-400" />
          <h2 className="text-white text-2xl font-bold">
            Error Loading Display
          </h2>
          <p className="text-gray-400">{error || "Configuration not found"}</p>
        </div>
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
            displayId={customization.displayId}
            displayName={customization.displayName}
            templateType={customization.templateType}
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
