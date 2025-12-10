// components/admin/device-management.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Monitor,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  RefreshCw,
} from "lucide-react";

interface Device {
  id: string;
  deviceId: string;
  name: string;
  status: "pending" | "approved" | "denied";
  userAgent: string | null;
  screenResolution: string | null;
  lastSeen: string;
  createdAt: string;
  display: {
    name: string;
  };
}

interface DeviceManagementProps {
  displayId?: string; // Optional: filter by specific display
}

export function DeviceManagement({ displayId }: DeviceManagementProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchDevices = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const url = displayId
        ? `/api/admin/devices?displayId=${displayId}`
        : "/api/admin/devices";

      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setDevices(result.devices);
      } else {
        setError(result.message || "Failed to fetch devices");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch devices");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [displayId]);

  const updateDeviceStatus = async (
    deviceId: string,
    status: "approved" | "denied"
  ) => {
    try {
      setActionLoading(deviceId);

      const response = await fetch(`/api/admin/devices/${deviceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();

      if (result.success) {
        await fetchDevices();
      } else {
        alert(result.message || "Failed to update device");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update device");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteDevice = async (deviceId: string) => {
    if (!confirm("Are you sure you want to delete this device?")) {
      return;
    }

    try {
      setActionLoading(deviceId);

      const response = await fetch(`/api/admin/devices/${deviceId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        await fetchDevices();
      } else {
        alert(result.message || "Failed to delete device");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete device");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
            <CheckCircle className="w-3.5 h-3.5" />
            Approved
          </span>
        );
      case "denied":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle className="w-3.5 h-3.5" />
            Denied
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Device Management</h2>
          <p className="text-slate-400 mt-1">
            Manage devices accessing your displays
          </p>
        </div>
        <button
          onClick={fetchDevices}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Device List */}
      {devices.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 rounded-lg border border-slate-700">
          <Monitor className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <p className="text-slate-400">No devices found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {devices.map((device) => (
            <div
              key={device.id}
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Device Name and Status */}
                  <div className="flex items-center gap-3">
                    <Monitor className="w-5 h-5 text-slate-400" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {device.name}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {device.display.name}
                      </p>
                    </div>
                    {getStatusBadge(device.status)}
                  </div>

                  {/* Device Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-500">Device ID:</span>
                      <p className="text-slate-300 font-mono text-xs mt-1 break-all">
                        {device.deviceId}
                      </p>
                    </div>
                    {device.screenResolution && (
                      <div>
                        <span className="text-slate-500">Resolution:</span>
                        <p className="text-slate-300 mt-1">
                          {device.screenResolution}
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-500">Last Seen:</span>
                      <p className="text-slate-300 mt-1">
                        {formatDate(device.lastSeen)}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Registered:</span>
                      <p className="text-slate-300 mt-1">
                        {formatDate(device.createdAt)}
                      </p>
                    </div>
                  </div>

                  {device.userAgent && (
                    <div className="text-sm">
                      <span className="text-slate-500">User Agent:</span>
                      <p className="text-slate-400 text-xs mt-1 break-all">
                        {device.userAgent}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {device.status === "pending" && (
                    <>
                      <button
                        onClick={() =>
                          updateDeviceStatus(device.id, "approved")
                        }
                        disabled={actionLoading === device.id}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                      >
                        {actionLoading === device.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => updateDeviceStatus(device.id, "denied")}
                        disabled={actionLoading === device.id}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                      >
                        {actionLoading === device.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        Deny
                      </button>
                    </>
                  )}
                  {device.status === "approved" && (
                    <button
                      onClick={() => updateDeviceStatus(device.id, "denied")}
                      disabled={actionLoading === device.id}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                    >
                      {actionLoading === device.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Revoke
                    </button>
                  )}
                  {device.status === "denied" && (
                    <button
                      onClick={() => updateDeviceStatus(device.id, "approved")}
                      disabled={actionLoading === device.id}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                    >
                      {actionLoading === device.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => deleteDevice(device.id)}
                    disabled={actionLoading === device.id}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600/20 disabled:bg-slate-700 disabled:cursor-not-allowed text-red-400 text-sm font-medium rounded-lg transition-colors whitespace-nowrap border border-red-500/20"
                  >
                    {actionLoading === device.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
