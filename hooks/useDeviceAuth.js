// hooks/useDeviceAuth.js
import { useEffect, useState, useCallback } from "react";

export function useDeviceAuth(displayId) {
  const [state, setState] = useState({
    isAuthorized: false,
    isLoading: true,
    error: null,
    deviceId: null,
    deviceName: null,
    needsRegistration: false,
    status: null,
  });

  // Check device authorization
  const checkDeviceAuth = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

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
      const response = await fetch("/api/device/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          displayId,
          userAgent: navigator.userAgent,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setState({
          isAuthorized: result.authorized,
          isLoading: false,
          error: null,
          deviceId,
          deviceName: result.deviceName,
          needsRegistration: result.needsRegistration,
          status: result.status,
        });
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: result.message || "Authorization failed",
        }));
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to verify device",
      }));
    }
  }, [displayId]);

  // Register device
  const registerDevice = useCallback(
    async (deviceName) => {
      try {
        const deviceId = localStorage.getItem("device_id");

        const response = await fetch("/api/device/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deviceId,
            displayId,
            deviceName,
            userAgent: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
          }),
        });

        const result = await response.json();

        if (result.success) {
          await checkDeviceAuth();
          return { success: true };
        } else {
          return { success: false, error: result.message };
        }
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Registration failed",
        };
      }
    },
    [displayId, checkDeviceAuth]
  );

  // Reset device (clear localStorage and regenerate)
  const resetDevice = useCallback(() => {
    localStorage.removeItem("device_id");
    checkDeviceAuth();
  }, [checkDeviceAuth]);

  useEffect(() => {
    if (displayId) {
      checkDeviceAuth();

      // Re-check authorization every 30 seconds
      const authInterval = setInterval(checkDeviceAuth, 30000);

      return () => clearInterval(authInterval);
    }
  }, [displayId, checkDeviceAuth]);

  return {
    ...state,
    registerDevice,
    refresh: checkDeviceAuth,
    resetDevice,
  };
}

// Alternative: Simpler hook for quick integration
export function useDeviceAuthSimple(displayId) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        let deviceId = localStorage.getItem("device_id");
        if (!deviceId) {
          deviceId = `device_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`;
          localStorage.setItem("device_id", deviceId);
        }

        const response = await fetch("/api/device/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deviceId,
            displayId,
            userAgent: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
          }),
        });

        const result = await response.json();
        setIsAuthorized(result.success && result.authorized);
      } catch (err) {
        console.error("Auth check failed:", err);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (displayId) {
      checkAuth();
      const interval = setInterval(checkAuth, 30000);
      return () => clearInterval(interval);
    }
  }, [displayId]);

  return { isAuthorized, isLoading };
}
