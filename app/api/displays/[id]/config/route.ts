// app/api/displays/[id]/config/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { config, templateType } = body;

    if (!config) {
      return NextResponse.json(
        { error: "Config is required" },
        { status: 400 }
      );
    }

    // Check if display exists
    const { data: existingDisplay } = await supabase
      .from("displays")
      .select("*")
      .eq("id", id)
      .single();

    if (existingDisplay) {
      // UPDATE existing display - only update config, NOT name
      const { data, error } = await supabase
        .from("displays")
        .update({
          config: config,
          template_type: templateType,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json(
          { error: "Failed to update display configuration" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: data,
        message: "Configuration saved successfully",
      });
    } else {
      // INSERT new display - use masjidName from config
      const displayName = config.masjidName || `Display ${id}`;
      
      const { data, error } = await supabase
        .from("displays")
        .insert({
          id: id,
          name: displayName,
          config: config,
          template_type: templateType,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json(
          { error: "Failed to create display configuration" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: data,
        message: "Configuration created successfully",
      });
    }
  } catch (error) {
    console.error("Error saving config:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch the display config from Supabase
    const { data, error } = await supabase
      .from("displays")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch display configuration" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Display not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Error fetching config:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}