// ============================================
// 2. API ROUTE: /api/device/auth/route.ts
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { checkDeviceAuth } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, displayId, userAgent, screenResolution } = body;

    // Validation
    if (!deviceId || !displayId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check device authorization
    const result = await checkDeviceAuth(deviceId, displayId, {
      userAgent,
      screenResolution,
    });

    return NextResponse.json({
      success: true,
      authorized: result.authorized,
      needsRegistration: result.needsRegistration,
      deviceName: result.deviceName,
      status: result.status,
      message: result.message,
    });
  } catch (error) {
    console.error("Device auth error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Authorization failed",
      },
      { status: 500 }
    );
  }
}
