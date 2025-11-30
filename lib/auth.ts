// lib/auth.js
import { SignJWT, jwtVerify } from "jose";
import { supabase } from "./supabase.js";
import bcrypt from "bcryptjs";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production-min-32-chars"
);

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export async function signToken(user) {
  return new SignJWT({
    id: user.id,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function authenticateUser(email, password) {
  try {
    console.log("Authenticating user:", email);

    if (!supabase) {
      console.error("Supabase client is undefined");
      return null;
    }

    const { data: client, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    console.log("Client lookup result:", { client, error });

    if (error || !client) {
      console.error("Client not found or error:", error);
      return null;
    }

    // Check if user is approved
    if (client.status !== "approved") {
      console.log("User status is not approved:", client.status);
      return null;
    }

    // Check if password_hash exists
    if (!client.password_hash) {
      console.error("No password_hash found for user");
      return null;
    }

    // Verify password using hash
    const isValid = await verifyPassword(password, client.password_hash);
    if (!isValid) {
      console.log("Password verification failed");
      return null;
    }

    return {
      id: client.id.toString(),
      email: client.email,
      role: client.role,
      businessName: client.business_name,
      businessType: client.business_type,
      status: client.status,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

export async function createUser(email, password, businessName, businessType) {
  try {
    // Check if user already exists
    const { data: existingClient } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingClient) {
      return { success: false, error: "User already exists" };
    }

    const passwordHash = await hashPassword(password);

    const { error } = await supabase.from("users").insert({
      email,
      password_hash: passwordHash,
      business_name: businessName,
      business_type: businessType,
      role: "client",
      status: "pending",
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("User creation error:", error);
      return { success: false, error: "Failed to create user" };
    }

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "Internal server error" };
  }
}
