// app/api/prayer-schedules/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";


export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Read the CSV file
    const text = await file.text();
    const lines = text.split("\n").filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json(
        { error: "CSV file is empty or invalid" },
        { status: 400 }
      );
    }

    const headers = lines[0].split(",").map(h => h.trim());

    // Validate headers
    const requiredHeaders = ["label", "month", "day", "fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];
    const hasAllHeaders = requiredHeaders.every(h => headers.includes(h));

    if (!hasAllHeaders) {
      return NextResponse.json(
        { 
          error: "CSV must have columns: label, month, day, fajr, sunrise, dhuhr, asr, maghrib, isha",
          found: headers 
        },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const records = [];
    let label = "";

    // Parse CSV rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(",").map(v => v.trim());
      const record: any = {};

      headers.forEach((header, index) => {
        record[header] = values[index];
      });

      // Get label from first data row
      if (i === 1) {
        label = record.label;
      }

      // Validate required fields
      if (!record.label || !record.month || !record.day) {
        console.warn(`Skipping invalid row ${i}: missing required fields`);
        continue;
      }

      records.push({
        label: record.label,
        month: parseInt(record.month),
        day: parseInt(record.day),
        fajr: record.fajr,
        sunrise: record.sunrise,
        dhuhr: record.dhuhr,
        asr: record.asr,
        maghrib: record.maghrib,
        isha: record.isha,
      });
    }

    if (records.length === 0) {
      return NextResponse.json(
        { error: "No valid records found in CSV" },
        { status: 400 }
      );
    }

    // Delete existing records with same label
    const { error: deleteError } = await supabase
      .from("prayer_times")
      .delete()
      .eq("label", label);

    if (deleteError) {
      console.error("Error deleting existing records:", deleteError);
      // Continue anyway - might be first upload
    }

    // Insert new records in batches (Supabase has limits)
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const { error: insertError } = await supabase
        .from("prayer_times")
        .insert(batch);

      if (insertError) {
        console.error("Error inserting batch:", insertError);
        return NextResponse.json(
          { error: `Failed to insert records: ${insertError.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      label,
      recordsInserted: records.length,
    });
  } catch (error) {
    console.error("Error in POST /api/prayer-schedules/upload:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}