// app/api/prayer-times/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const label = searchParams.get("label");
    const month = searchParams.get("month");
    const day = searchParams.get("day");

    console.log("Prayer times request:", { label, month, day });

    if (!label || !month || !day) {
      return NextResponse.json(
        { error: "Missing required parameters: label, month, day" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Query for the specific date
    const { data, error } = await supabase
      .from("prayer_times")
      .select("*")
      .eq("label", label)
      .eq("month", parseInt(month))
      .eq("day", parseInt(day))
      .limit(1)
      .single();

    console.log("Supabase response:", { data, error });

    if (error) {
      // PGRST116 means no rows found
      if (error.code === "PGRST116") {
        console.warn(`No prayer times found for ${label} on ${month}/${day}`);
        return NextResponse.json(
          { 
            error: "No prayer times found for this date",
            details: `No data for ${label} on ${month}/${day}`
          },
          { status: 404 }
        );
      }
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { error: "No prayer times found" },
        { status: 404 }
      );
    }

    // Return the prayer times
    return NextResponse.json({
      success: true,
      prayerTimes: {
        fajr: data.fajr,
        sunrise: data.sunrise,
        dhuhr: data.dhuhr,
        asr: data.asr,
        maghrib: data.maghrib,
        isha: data.isha,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/prayer-times:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}