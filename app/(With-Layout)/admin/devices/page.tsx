"use client";

import { useEffect, useState } from "react";
import {
  Smartphone,
  Check,
  X,
  Clock,
  Trash2,
  Monitor,
  RefreshCw,
  Search,
  Plus,
  Loader2,
  Info,
  AlertCircle,
  XCircle,
  MoreVertical,
  ExternalLink,
  Shield,
  User,
  Calendar,
} from "lucide-react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface Device {
  id: string;
  device_id: string;
  name: string;
  status: "pending" | "approved" | "denied";
  user_agent: string;
  screen_resolution: string;
  last_seen: string;
  created_at: string;
  displays: {
    name: string;
  };
}

interface Display {
  id: string;
  name: string;
}

export default function DevicesPage() {
  const { toast } = useToast();
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [displays, setDisplays] = useState<Display[]>([]);
  const [selectedDisplay, setSelectedDisplay] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [deviceInfo, setDeviceInfo] = useState({
    deviceId: "",
    browser: "",
    os: "",
    screenResolution: "",
  });

  useEffect(() => {
    fetchDevices();
    // Get device info for registration
    let deviceId = localStorage.getItem("device_id");
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      localStorage.setItem("device_id", deviceId);
    }

    const ua = navigator.userAgent;
    setDeviceInfo({
      deviceId,
      browser: getBrowserName(ua),
      os: getOSName(ua),
      screenResolution: `${window.screen.width}x${window.screen.height}`,
    });
    setDeviceName(`${getBrowserName(ua)} - ${getOSName(ua)}`);
  }, []);

  const fetchDevices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/devices");
      const result = await response.json();

      if (result.success) {
        setDevices(result.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load devices",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching devices:", error);
      toast({
        title: "Error",
        description: "An error occurred while loading devices",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const updateDeviceStatus = async (
    deviceId: string,
    status: "approved" | "denied"
  ) => {
    try {
      const response = await fetch(`/api/admin/devices/${deviceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();

      if (result.success) {
        setDevices(
          devices.map((d) => (d.id === deviceId ? { ...d, status } : d))
        );
        toast({
          title: "Success",
          description: `Device ${status} successfully`,
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update device",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while updating the device",
        variant: "destructive",
      });
    }
  };

  const deleteDevice = async (deviceId: string) => {
    try {
      const response = await fetch(`/api/admin/devices/${deviceId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        setDevices(devices.filter((d) => d.id !== deviceId));
        toast({
          title: "Success",
          description: "Device deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete device",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting the device",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setDeviceToDelete(null);
    }
  };

  const openDeleteDialog = (deviceId: string) => {
    setDeviceToDelete(deviceId);
    setDeleteDialogOpen(true);
  };

  const openRegisterModal = () => {
    setRegisterModalOpen(true);
    setRegisterSuccess(false);
    setRegisterError(null);
    fetchDisplays();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDisplay) {
      setRegisterError("Please select a display");
      return;
    }

    if (!deviceName.trim()) {
      setRegisterError("Please enter a device name");
      return;
    }

    setRegisterLoading(true);
    setRegisterError(null);

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
        setRegisterSuccess(true);
        toast({
          title: "Success",
          description: "Device registered successfully",
        });
        // Refresh devices list
        setTimeout(() => {
          fetchDevices();
        }, 1000);
      } else {
        setRegisterError(result.message || "Failed to register device");
        toast({
          title: "Error",
          description: result.message || "Failed to register device",
          variant: "destructive",
        });
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Registration failed";
      setRegisterError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setRegisterLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      approved: "bg-green-500/20 text-green-300 border-green-500/30",
      denied: "bg-red-500/20 text-red-300 border-red-500/30",
    };

    const icons = {
      pending: <Clock className="w-3 h-3 mr-1" />,
      approved: <Check className="w-3 h-3 mr-1" />,
      denied: <X className="w-3 h-3 mr-1" />,
    };

    return (
      <Badge
        variant="outline"
        className={`flex items-center gap-1 px-3 py-1 rounded-full ${
          styles[status as keyof typeof styles] || styles.pending
        }`}
      >
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredDevices = devices.filter((device) => {
    const matchesFilter =
      filterStatus === "all" || device.status === filterStatus;
    const matchesSearch =
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.device_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.displays.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: devices.length,
    pending: devices.filter((d) => d.status === "pending").length,
    approved: devices.filter((d) => d.status === "approved").length,
    denied: devices.filter((d) => d.status === "denied").length,
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6 sm:p-8 min-h-screen bg-gray-950">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-pink-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading devices...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8 min-h-screen bg-gray-950">
      <Toaster />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Device Management
          </h1>
          <p className="text-gray-400 text-sm sm:text-base mt-1">
            Manage registered devices and their access to displays
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={openRegisterModal}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 font-semibold gap-2 w-full sm:w-auto shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Register Device
          </Button>
          <Button
            onClick={fetchDevices}
            variant="outline"
            size="icon"
            className="border-gray-700 hover:bg-gray-800 text-gray-400 hover:text-white"
            title="Refresh devices"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Devices</p>
              <p className="text-3xl font-bold text-white mt-1">
                {stats.total}
              </p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-full">
              <Smartphone className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 hover:border-amber-500/50 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Pending</p>
              <p className="text-3xl font-bold text-white mt-1">
                {stats.pending}
              </p>
            </div>
            <div className="p-3 bg-amber-500/20 rounded-full">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 hover:border-green-500/50 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Approved</p>
              <p className="text-3xl font-bold text-white mt-1">
                {stats.approved}
              </p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-full">
              <Check className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 hover:border-red-500/50 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Denied</p>
              <p className="text-3xl font-bold text-white mt-1">
                {stats.denied}
              </p>
            </div>
            <div className="p-3 bg-red-500/20 rounded-full">
              <X className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            type="text"
            placeholder="Search devices by name, ID, or display..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-pink-500/30"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px] bg-gray-900 border-gray-800 text-white focus:ring-2 focus:ring-pink-500/30">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800">
              <SelectItem value="all" className="text-white focus:bg-gray-800">
                All Status
              </SelectItem>
              <SelectItem
                value="pending"
                className="text-amber-400 focus:bg-gray-800"
              >
                Pending
              </SelectItem>
              <SelectItem
                value="approved"
                className="text-green-400 focus:bg-gray-800"
              >
                Approved
              </SelectItem>
              <SelectItem
                value="denied"
                className="text-red-400 focus:bg-gray-800"
              >
                Denied
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-sm">
          Showing{" "}
          <span className="font-semibold text-white">
            {filteredDevices.length}
          </span>{" "}
          of <span className="font-semibold text-white">{devices.length}</span>{" "}
          devices
        </p>
        {searchQuery || filterStatus !== "all" ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setFilterStatus("all");
            }}
            className="text-gray-400 hover:text-white text-xs"
          >
            Clear filters
          </Button>
        ) : null}
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        {filteredDevices.map((device) => (
          <Card
            key={device.id}
            className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/5 overflow-hidden group"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-800 rounded-lg">
                    <Smartphone className="w-5 h-5 text-pink-400" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg truncate">
                      {device.name}
                    </CardTitle>
                    <CardDescription className="text-gray-500 text-xs font-mono truncate">
                      ID: {device.device_id.substring(0, 12)}...
                    </CardDescription>
                  </div>
                </div>
                {getStatusBadge(device.status)}
              </div>
            </CardHeader>

            <Separator className="bg-gray-800" />

            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-300">
                  {device.displays.name}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <Shield className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-400">Resolution:</span>
                  <span className="text-gray-300 ml-auto">
                    {device.screen_resolution}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Calendar className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-400">Last Seen:</span>
                  <span className="text-gray-300 ml-auto">
                    {device.last_seen
                      ? new Date(device.last_seen).toLocaleDateString()
                      : "Never"}
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-3">
              <div className="flex items-center justify-between w-full">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs text-gray-400 hover:text-white hover:bg-gray-800"
                  onClick={() => {
                    // View device details
                    toast({
                      title: "Device Details",
                      description: `Viewing ${device.name}`,
                    });
                  }}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Details
                </Button>
                <div className="flex items-center gap-1">
                  {device.status !== "approved" && (
                    <Button
                      onClick={() => updateDeviceStatus(device.id, "approved")}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-green-400 hover:text-green-300 hover:bg-green-900/20"
                      title="Approve"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                  {device.status !== "denied" && (
                    <Button
                      onClick={() => updateDeviceStatus(device.id, "denied")}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      title="Deny"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    onClick={() => openDeleteDialog(device.id)}
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-300 hover:bg-red-900/20"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredDevices.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-800 rounded-xl bg-gradient-to-br from-gray-900/50 to-black/50">
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6">
            <Smartphone size={48} className="text-gray-600" />
          </div>
          <h3 className="text-2xl font-semibold text-white mb-3">
            {devices.length === 0 ? "No devices yet" : "No devices found"}
          </h3>
          <p className="text-gray-400 mb-8 max-w-md">
            {devices.length === 0
              ? "Get started by registering your first device to connect to displays"
              : "Try adjusting your search or filters to find what you're looking for"}
          </p>
          {devices.length > 0 ? (
            <Button
              onClick={() => {
                setSearchQuery("");
                setFilterStatus("all");
              }}
              variant="outline"
              className="bg-gray-900 border-gray-700 text-white hover:bg-gray-800 hover:text-white"
            >
              Clear Filters
            </Button>
          ) : (
            <Button
              onClick={openRegisterModal}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 font-semibold gap-2"
            >
              <Plus className="w-5 h-5" />
              Register First Device
            </Button>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gradient-to-br from-gray-900 to-black border border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete Device
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. This will permanently delete the
              device and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deviceToDelete && deleteDevice(deviceToDelete)}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Register Device Modal */}
      {registerModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-pink-500/20 to-purple-600/20 rounded-lg">
                  <Smartphone className="w-6 h-6 text-pink-300" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Register New Device
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Add this device to access your displays
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setRegisterModalOpen(false)}
                className="text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <XCircle className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6">
              {!registerSuccess ? (
                <>
                  {/* Device Information Card */}
                  <Card className="bg-gray-800/30 border-gray-700 mb-6">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Info className="w-5 h-5 text-pink-300" />
                        <CardTitle className="text-lg text-white">
                          Device Information
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">Device ID</p>
                          <p className="text-sm font-mono text-gray-300 truncate">
                            {deviceInfo.deviceId}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">Browser</p>
                          <p className="text-sm text-gray-300">
                            {deviceInfo.browser}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">OS</p>
                          <p className="text-sm text-gray-300">
                            {deviceInfo.os}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">Resolution</p>
                          <p className="text-sm text-gray-300">
                            {deviceInfo.screenResolution}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Registration Form */}
                  <form onSubmit={handleRegister} className="space-y-6">
                    {/* Display Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Select Display
                      </label>
                      <Select
                        value={selectedDisplay}
                        onValueChange={setSelectedDisplay}
                        disabled={registerLoading}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white focus:ring-2 focus:ring-pink-500/30">
                          <SelectValue placeholder="Choose a display" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-800">
                          {displays.map((display) => (
                            <SelectItem
                              key={display.id}
                              value={display.id}
                              className="text-white focus:bg-gray-800"
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
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-pink-500/30"
                        disabled={registerLoading}
                      />
                      <p className="text-xs text-gray-500">
                        Give this device a recognizable name
                      </p>
                    </div>

                    {/* Error Message */}
                    {registerError && (
                      <Alert
                        variant="destructive"
                        className="bg-red-900/20 border-red-800"
                      >
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-red-300">
                          {registerError}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setRegisterModalOpen(false)}
                        className="flex-1 bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                        disabled={registerLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={registerLoading}
                        className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 font-semibold"
                      >
                        {registerLoading ? (
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
                    </div>
                  </form>
                </>
              ) : (
                // Success Message
                <div className="text-center py-8 space-y-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-full">
                    <Check className="w-10 h-10 text-green-300" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Device Registered!
                    </h2>
                    <p className="text-gray-400 mb-6">
                      Your device has been registered successfully. An
                      administrator needs to approve it before you can access
                      the display.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setRegisterModalOpen(false)}
                      className="flex-1 bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() => {
                        setRegisterModalOpen(false);
                        fetchDevices();
                      }}
                      className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
                    >
                      View Devices
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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
