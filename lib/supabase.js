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
