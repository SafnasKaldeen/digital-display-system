// ============================================
// 3. API ROUTE: /api/device/register/route.ts
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { registerDevice } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, displayId, deviceName, userAgent, screenResolution } = body;

    // Validation
    if (!deviceId || !displayId || !deviceName) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (deviceName.trim().length < 3) {
      return NextResponse.json(
        { success: false, message: "Device name must be at least 3 characters" },
        { status: 400 }
      );
    }

    // Register device
    const result = await registerDevice(
      deviceId,
      displayId,
      deviceName.trim(),
      {
        userAgent,
        screenResolution,
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Device registration error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Registration failed",
      },
      { status: 500 }
    );
  }
}
