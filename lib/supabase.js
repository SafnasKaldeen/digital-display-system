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
