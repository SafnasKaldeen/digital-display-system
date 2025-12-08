// app/api/prayer-schedules/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const providedLabel = formData.get("label") as string | null; // Label from modal

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

    const headers = lines[0].split(",").map(h => h.trim().toLowerCase()); // Convert to lowercase
    
    // Check if CSV has label column
    const hasLabelColumn = headers.includes("label");
    
    // Validate headers (excluding optional label column)
    const requiredHeaders = ["month", "day", "fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];
    const hasAllHeaders = requiredHeaders.every(h => headers.includes(h));

    if (!hasAllHeaders) {
      return NextResponse.json(
        { 
          error: `CSV must have columns: month, day, fajr, sunrise, dhuhr, asr, maghrib, isha ${hasLabelColumn ? '(label optional)' : ''}`,
          found: headers 
        },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const records = [];
    let finalLabel = "";

    // Determine final label BEFORE parsing rows
    if (hasLabelColumn) {
      // We'll get label from first valid row
    } else if (providedLabel) {
      // Use provided label from modal
      finalLabel = providedLabel;
    } else {
      // No label available
      return NextResponse.json(
        { error: "No label provided. CSV doesn't have label column and no label was provided." },
        { status: 400 }
      );
    }

    // Parse CSV rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(",").map(v => v.trim());
      const record: any = {};

      // Map headers to values
      headers.forEach((header, index) => {
        if (index < values.length) {
          record[header] = values[index];
        }
      });

      // For CSV with label column, get label from first valid row
      if (hasLabelColumn && !finalLabel && record.label) {
        finalLabel = record.label;
      }

      // Skip rows missing required fields
      if (!record.month || !record.day) {
        console.warn(`Skipping invalid row ${i}: missing month or day`);
        continue;
      }

      // Validate month and day are numbers
      const month = parseInt(record.month);
      const day = parseInt(record.day);
      
      if (isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
        console.warn(`Skipping invalid row ${i}: invalid month (${month}) or day (${day})`);
        continue;
      }

      // Use the appropriate label
      const rowLabel = hasLabelColumn && record.label ? record.label : finalLabel;
      
      if (!rowLabel) {
        console.warn(`Skipping row ${i}: no label available`);
        continue;
      }

      // Build the record
      const prayerRecord = {
        label: rowLabel,
        month: month,
        day: day,
        fajr: record.fajr || "",
        sunrise: record.sunrise || "",
        dhuhr: record.dhuhr || "",
        asr: record.asr || "",
        maghrib: record.maghrib || "",
        isha: record.isha || "",
      };

      // Validate time formats (optional but recommended)
      const timeFields = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];
      for (const field of timeFields) {
        if (prayerRecord[field] && !isValidTimeFormat(prayerRecord[field])) {
          console.warn(`Row ${i}: Invalid time format for ${field}: ${prayerRecord[field]}`);
          // Continue anyway, just log warning
        }
      }

      records.push(prayerRecord);
    }

    if (records.length === 0) {
      return NextResponse.json(
        { error: "No valid records found in CSV" },
        { status: 400 }
      );
    }

    // Check if all records would have the same label (only for CSV with label column)
    if (hasLabelColumn) {
      const labels = [...new Set(records.map(r => r.label))];
      if (labels.length > 1) {
        return NextResponse.json(
          { error: "CSV contains multiple labels. All rows must have the same label." },
          { status: 400 }
        );
      }
    }

    // Delete existing records with same label
    const { error: deleteError } = await supabase
      .from("prayer_times")
      .delete()
      .eq("label", finalLabel);

    if (deleteError) {
      console.error("Error deleting existing records:", deleteError);
      // Continue anyway - might be first upload
    }

    // Insert new records in batches (Supabase has limits)
    const batchSize = 100;
    let totalInserted = 0;
    
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
      totalInserted += batch.length;
    }

    return NextResponse.json({
      success: true,
      label: finalLabel,
      recordsInserted: totalInserted,
      hasLabelColumn: hasLabelColumn,
      labelSource: hasLabelColumn ? "csv" : "user_input",
      message: `Successfully uploaded "${finalLabel}" with ${totalInserted} prayer times`
    });
  } catch (error) {
    console.error("Error in POST /api/admin/prayer-schedules/upload:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to validate time format (HH:MM or HH:MM:SS)
function isValidTimeFormat(time: string): boolean {
  // Allow empty strings (some prayers might be missing)
  if (!time || time.trim() === "") return true;
  
  // Handle 24-hour format (HH:MM or HH:MM:SS)
  const timeRegex24 = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
  
  // Handle 12-hour format with AM/PM (optional)
  const timeRegex12 = /^(0?[1-9]|1[0-2]):[0-5][0-9](:[0-5][0-9])?\s*(AM|PM|am|pm)?$/;
  
  return timeRegex24.test(time) || timeRegex12.test(time);
}

// GET endpoint to fetch schedules list
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data, error } = await supabase
      .from("prayer_times")
      .select("label, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching schedules:", error);
      return NextResponse.json(
        { error: "Failed to fetch schedules" },
        { status: 500 }
      );
    }

    // Group by label and count days
    const scheduleMap = new Map();
    
    data?.forEach((item: any) => {
      if (!scheduleMap.has(item.label)) {
        scheduleMap.set(item.label, {
          label: item.label,
          totalDays: 0,
          created_at: item.created_at
        });
      }
      scheduleMap.get(item.label).totalDays++;
    });

    const schedules = Array.from(scheduleMap.values());
    
    return NextResponse.json({ schedules });
  } catch (error) {
    console.error("Error in GET /api/prayer-schedules:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove a schedule
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const label = searchParams.get("label");
    
    if (!label) {
      return NextResponse.json(
        { error: "Label parameter is required" },
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
      return NextResponse.json(
        { error: "Failed to delete schedule" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: `Schedule "${label}" deleted successfully`
    });
  } catch (error) {
    console.error("Error in DELETE /api/admin/prayer-schedules:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}