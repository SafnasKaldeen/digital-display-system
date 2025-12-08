// app/api/prayer-schedules/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get unique schedules with their label and count
    const { data, error } = await supabase
      .from("prayer_times")
      .select("label, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching schedules:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Group by label and count records
    const scheduleMap = new Map<string, { label: string; totalDays: number; created_at: string }>();
    
    data?.forEach((row: any) => {
      if (row.label) {
        if (scheduleMap.has(row.label)) {
          scheduleMap.get(row.label)!.totalDays++;
        } else {
          scheduleMap.set(row.label, {
            label: row.label,
            totalDays: 1,
            created_at: row.created_at,
          });
        }
      }
    });

    const schedules = Array.from(scheduleMap.values());

    return NextResponse.json({ success: true, schedules });
  } catch (error) {
    console.error("Error in GET /api/prayer-schedules:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const label = searchParams.get("label");

    if (!label) {
      return NextResponse.json(
        { error: "Label is required" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error } = await supabase
      .from("prayer_times")
      .delete()
      .eq("label", label);

    if (error) {
      console.error("Error deleting schedule:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/prayer-schedules:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

