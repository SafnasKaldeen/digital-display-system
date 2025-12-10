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
  Power,
  MoreVertical,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export default function DevicesPage() {
  const { toast } = useToast();
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchDevices();
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

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-amber-900/30 text-amber-300 border-amber-700",
      approved: "bg-green-900/30 text-green-300 border-green-700",
      denied: "bg-red-900/30 text-red-300 border-red-700",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
          styles[status as keyof typeof styles] || styles.pending
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
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
        <Button
          onClick={fetchDevices}
          variant="outline"
          size="icon"
          className="border-gray-700 hover:bg-gray-800 text-gray-400 w-full sm:w-auto"
          title="Refresh devices"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Devices</p>
              <p className="text-3xl font-bold text-white mt-1">
                {stats.total}
              </p>
            </div>
            <Smartphone className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Pending</p>
              <p className="text-3xl font-bold text-white mt-1">
                {stats.pending}
              </p>
            </div>
            <Clock className="w-10 h-10 text-amber-500" />
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Approved</p>
              <p className="text-3xl font-bold text-white mt-1">
                {stats.approved}
              </p>
            </div>
            <Check className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Denied</p>
              <p className="text-3xl font-bold text-white mt-1">
                {stats.denied}
              </p>
            </div>
            <X className="w-10 h-10 text-red-500" />
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
            placeholder="Search devices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-900 border-gray-800 text-white placeholder:text-gray-500"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px] bg-gray-900 border-gray-800 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800">
              <SelectItem value="all" className="text-white">
                All Status
              </SelectItem>
              <SelectItem value="pending" className="text-white">
                Pending
              </SelectItem>
              <SelectItem value="approved" className="text-white">
                Approved
              </SelectItem>
              <SelectItem value="denied" className="text-white">
                Denied
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-gray-400 text-sm">
        Showing {filteredDevices.length} of {devices.length} devices
      </p>

      {/* Devices List */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        {filteredDevices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Smartphone size={32} className="text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {devices.length === 0 ? "No devices yet" : "No devices found"}
            </h3>
            <p className="text-gray-400 mb-6">
              {devices.length === 0
                ? "Devices will appear here once they register"
                : "Try adjusting your search or filters"}
            </p>
            {devices.length > 0 && (
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setFilterStatus("all");
                }}
                variant="outline"
                className="bg-gray-900 border-gray-800 text-white hover:bg-gray-800"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50 border-b border-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Device
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Display
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Last Seen
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredDevices.map((device) => (
                  <tr key={device.id} className="hover:bg-gray-800/30">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-white">{device.name}</p>
                        <p className="text-xs text-gray-500 font-mono">
                          {device.device_id.substring(0, 30)}...
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">
                          {device.displays.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(device.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-400">
                        <p className="text-gray-300">
                          {device.screen_resolution}
                        </p>
                        <p
                          className="truncate max-w-xs"
                          title={device.user_agent}
                        >
                          {device.user_agent}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {device.last_seen
                        ? new Date(device.last_seen).toLocaleString()
                        : "Never"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {device.status !== "approved" && (
                          <Button
                            onClick={() =>
                              updateDeviceStatus(device.id, "approved")
                            }
                            size="icon"
                            variant="ghost"
                            className="text-green-400 hover:text-green-300 hover:bg-green-900/20"
                            title="Approve"
                          >
                            <Check className="w-5 h-5" />
                          </Button>
                        )}
                        {device.status !== "denied" && (
                          <Button
                            onClick={() =>
                              updateDeviceStatus(device.id, "denied")
                            }
                            size="icon"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            title="Deny"
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        )}
                        <Button
                          onClick={() => openDeleteDialog(device.id)}
                          size="icon"
                          variant="ghost"
                          className="text-gray-400 hover:text-gray-300 hover:bg-gray-800"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Are you sure you want to delete this device?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. This will permanently delete the
              device and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deviceToDelete && deleteDevice(deviceToDelete)}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
