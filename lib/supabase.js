// lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Sign Up - Create new user for display management
export async function signUp(email, password, businessName, businessType) {
  try {
    const { data: existingUser } = await supabase
      .from("users")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      throw new Error("Email already exists");
    }

    const { data, error } = await supabase
      .from("users")
      .insert({
        email,
        password, // Consider hashing in production
        business_name: businessName,
        business_type: businessType,
        role: "client",
        status: "pending", // Awaiting admin approval
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("SignUp error:", error);
    throw error;
  }
}

// Sign In - Authenticate user
export async function signIn(email, password) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .eq("password", password)
    .single();

  if (error || !data) {
    throw new Error("Invalid email or password");
  }

  // Check if account is approved
  if (data.status === "pending") {
    throw new Error("Your account is pending admin approval");
  }

  if (data.status === "rejected") {
    throw new Error("Your account has been rejected");
  }

  return data;
}

// Get User Profile by ID
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}

// Update User Profile
export async function updateUserProfile(userId, updates) {
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPrayerTimes(
  displayId, // Make displayId optional since it's common
  date
) {
  try {
    const month = date.getMonth() + 1;
    const day = date.getDate();

    console.log(
      `Fetching common prayer times for month: ${month}, day: ${day}`
    );

    // Fetch common prayer times (no display_id filter)
    const { data, error } = await supabase
      .from("prayer_times")
      .select("*")
      .eq("month", month)
      .eq("day", day)
      .single();

    if (error) {
      console.error("Error fetching prayer times from Supabase:", error);

      // If no specific date found, try to get closest match (maybe previous day)
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("prayer_times")
        .select("*")
        .eq("month", month)
        .order("day", { ascending: false })
        .limit(1)
        .single();

      if (fallbackError) {
        console.error("No prayer times found in Supabase");
        return null;
      }

      console.log("Using fallback prayer times:", fallbackData);
      return {
        fajr: fallbackData.fajr,
        sunrise: fallbackData.sunrise,
        dhuhr: fallbackData.dhuhr,
        asr: fallbackData.asr,
        maghrib: fallbackData.maghrib,
        isha: fallbackData.isha,
      };
    }

    if (data) {
      console.log("Prayer times data from Supabase:", data);
      return {
        fajr: data.fajr,
        sunrise: data.sunrise,
        dhuhr: data.dhuhr,
        asr: data.asr,
        maghrib: data.maghrib,
        isha: data.isha,
      };
    }

    return null;
  } catch (error) {
    console.error("Exception in getPrayerTimes:", error);
    return null;
  }
}

/**
 * Check if a device is authorized to access a display
 */
export async function checkDeviceAuth(deviceId, displayId, deviceInfo = {}) {
  try {
    const { userAgent, screenResolution } = deviceInfo;

    // Check if device exists
    const { data: device, error } = await supabase
      .from("devices")
      .select(
        `
        *,
        displays (
          status
        )
      `
      )
      .eq("device_id", deviceId)
      .eq("display_id", displayId)
      .maybeSingle();

    if (error) {
      console.error("Error checking device auth:", error);
      throw error;
    }

    // Device not registered
    if (!device) {
      return {
        authorized: false,
        needsRegistration: true,
        message: "Device not registered",
      };
    }

    // Check if display is disabled
    if (device.displays?.status === "disabled") {
      return {
        authorized: false,
        needsRegistration: false,
        message: "Display is disabled",
      };
    }

    // Update last seen timestamp
    await supabase
      .from("devices")
      .update({
        last_seen: new Date().toISOString(),
        user_agent: userAgent || device.user_agent,
        screen_resolution: screenResolution || device.screen_resolution,
      })
      .eq("id", device.id);

    return {
      authorized: device.status === "approved",
      needsRegistration: false,
      deviceName: device.name,
      status: device.status,
    };
  } catch (error) {
    console.error("Device auth error:", error);
    throw error;
  }
}

/**
 * Register a new device
 */
export async function registerDevice(
  deviceId,
  displayId,
  deviceName,
  deviceInfo = {}
) {
  try {
    const { userAgent, screenResolution } = deviceInfo;

    // Check if display exists
    const { data: display, error: displayError } = await supabase
      .from("displays")
      .select("id")
      .eq("id", displayId)
      .maybeSingle();

    if (displayError || !display) {
      throw new Error("Display not found");
    }

    // Check if device already exists
    const { data: existingDevice } = await supabase
      .from("devices")
      .select("*")
      .eq("device_id", deviceId)
      .eq("display_id", displayId)
      .maybeSingle();

    let deviceData;

    if (existingDevice) {
      // Update existing device
      const { data, error } = await supabase
        .from("devices")
        .update({
          name: deviceName,
          user_agent: userAgent,
          screen_resolution: screenResolution,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingDevice.id)
        .select()
        .single();

      if (error) throw error;
      deviceData = data;
    } else {
      // Create new device
      const { data, error } = await supabase
        .from("devices")
        .insert({
          device_id: deviceId,
          display_id: displayId,
          name: deviceName,
          status: "pending",
          user_agent: userAgent,
          screen_resolution: screenResolution,
          last_seen: new Date().toISOString(),
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      deviceData = data;
    }

    return {
      success: true,
      device: {
        id: deviceData.id,
        name: deviceData.name,
        status: deviceData.status,
      },
      message: "Device registered. Awaiting admin approval.",
    };
  } catch (error) {
    console.error("Device registration error:", error);
    throw error;
  }
}

/**
 * Get all devices (admin only)
 */
export async function getAllDevices(displayId = null) {
  try {
    let query = supabase
      .from("devices")
      .select(
        `
        *,
        displays (
          name
        )
      `
      )
      .order("created_at", { ascending: false });

    if (displayId) {
      query = query.eq("display_id", displayId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching devices:", error);
    throw error;
  }
}

/**
 * Update device status (approve/deny/revoke)
 */
export async function updateDeviceStatus(deviceId, status) {
  try {
    if (!["pending", "approved", "denied"].includes(status)) {
      throw new Error("Invalid status");
    }

    const { data, error } = await supabase
      .from("devices")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", deviceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating device status:", error);
    throw error;
  }
}

/**
 * Delete a device
 */
export async function deleteDevice(deviceId) {
  try {
    const { error } = await supabase
      .from("devices")
      .delete()
      .eq("id", deviceId);

    if (error) throw error;
    return { success: true, message: "Device deleted" };
  } catch (error) {
    console.error("Error deleting device:", error);
    throw error;
  }
}

/**
 * Get device by ID
 */
export async function getDeviceById(deviceId) {
  try {
    const { data, error } = await supabase
      .from("devices")
      .select(
        `
        *,
        displays (
          name,
          status
        )
      `
      )
      .eq("id", deviceId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching device:", error);
    throw error;
  }
}

/**
 * Get pending devices count (for admin notifications)
 */
export async function getPendingDevicesCount() {
  try {
    const { count, error } = await supabase
      .from("devices")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error("Error fetching pending devices count:", error);
    return 0;
  }
}

/**
 * Get devices by status
 */
export async function getDevicesByStatus(status, displayId = null) {
  try {
    let query = supabase
      .from("devices")
      .select(
        `
        *,
        displays (
          name
        )
      `
      )
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (displayId) {
      query = query.eq("display_id", displayId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching devices by status:", error);
    throw error;
  }
}
