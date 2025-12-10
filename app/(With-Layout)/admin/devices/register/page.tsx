"use client";

import { useState, useEffect } from "react";
import { Smartphone, Loader2, Check, Info, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";

interface Display {
  id: string;
  name: string;
}

export default function RegisterDevicePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [displays, setDisplays] = useState<Display[]>([]);
  const [selectedDisplay, setSelectedDisplay] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceInfo, setDeviceInfo] = useState({
    deviceId: "",
    browser: "",
    os: "",
    screenResolution: "",
  });

  useEffect(() => {
    // Get device ID
    let deviceId = localStorage.getItem("device_id");
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      localStorage.setItem("device_id", deviceId);
    }

    // Detect device info
    const ua = navigator.userAgent;
    setDeviceInfo({
      deviceId,
      browser: getBrowserName(ua),
      os: getOSName(ua),
      screenResolution: `${window.screen.width}x${window.screen.height}`,
    });

    // Auto-generate device name
    setDeviceName(`${getBrowserName(ua)} - ${getOSName(ua)}`);

    // Fetch displays
    fetchDisplays();
  }, []);

  const fetchDisplays = async () => {
    try {
      const response = await fetch("/api/admin/displays");
      const result = await response.json();

      if (result.success && result.displays) {
        setDisplays(result.displays);
        if (result.displays.length > 0) {
          setSelectedDisplay(result.displays[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching displays:", err);
      toast({
        title: "Error",
        description: "Failed to load displays",
        variant: "destructive",
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDisplay) {
      setError("Please select a display");
      return;
    }

    if (!deviceName.trim()) {
      setError("Please enter a device name");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/admin/device/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: deviceInfo.deviceId,
          displayId: selectedDisplay,
          deviceName: deviceName.trim(),
          userAgent: navigator.userAgent,
          screenResolution: deviceInfo.screenResolution,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        toast({
          title: "Success",
          description: "Device registered successfully",
        });
      } else {
        setError(result.message || "Failed to register device");
        toast({
          title: "Error",
          description: result.message || "Failed to register device",
          variant: "destructive",
        });
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Registration failed";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6 sm:p-8">
      <Toaster />
      <div className="max-w-2xl mx-auto">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-300/10 rounded-full mx-auto">
              <Smartphone className="w-8 h-8 text-pink-300" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-white mb-2">
                Register Device
              </CardTitle>
              <CardDescription className="text-gray-400">
                Add this device to access your displays
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Device Information Card */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-pink-300" />
                  <CardTitle className="text-lg text-white">
                    Device Information
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Device ID:</span>
                  <span className="font-mono text-xs text-gray-300">
                    {deviceInfo.deviceId.substring(0, 20)}...
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Browser:</span>
                  <span className="text-gray-300">{deviceInfo.browser}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Operating System:</span>
                  <span className="text-gray-300">{deviceInfo.os}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Screen Resolution:</span>
                  <span className="text-gray-300">
                    {deviceInfo.screenResolution}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Registration Form */}
            {!success ? (
              <form onSubmit={handleRegister} className="space-y-6">
                {/* Display Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Select Display
                  </label>
                  <Select
                    value={selectedDisplay}
                    onValueChange={setSelectedDisplay}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Choose a display" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800">
                      {displays.map((display) => (
                        <SelectItem
                          key={display.id}
                          value={display.id}
                          className="text-white"
                        >
                          {display.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Device Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Device Name
                  </label>
                  <Input
                    type="text"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    placeholder="e.g., Office Laptop, Reception TV"
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500">
                    Give this device a recognizable name
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <Alert
                    variant="destructive"
                    className="bg-red-900/20 border-red-800"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-300">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-pink-300 text-gray-900 hover:bg-pink-400 font-semibold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-5 h-5 mr-2" />
                      Register Device
                    </>
                  )}
                </Button>
              </form>
            ) : (
              // Success Message
              <div className="text-center py-8 space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-900/30 border border-green-700 rounded-full">
                  <Check className="w-8 h-8 text-green-300" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Device Registered!
                  </h2>
                  <p className="text-gray-400 mb-6">
                    Your device has been registered successfully. An
                    administrator needs to approve it before you can access the
                    display.
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/admin/devices")}
                  className="bg-pink-300 text-gray-900 hover:bg-pink-400"
                >
                  Go to Device Management
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getBrowserName(ua: string): string {
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("Edge")) return "Edge";
  return "Browser";
}

function getOSName(ua: string): string {
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iOS")) return "iOS";
  return "Unknown OS";
}
