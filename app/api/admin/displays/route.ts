import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // TODO: Fetch all displays from database with role check
    const mockDisplays = [
      {
        id: "1",
        displayName: "Main Hall",
        clientName: "Al-Noor Masjid",
        templateType: "masjid",
        status: "active",
        createdAt: "2025-01-15",
      },
    ]
    return NextResponse.json(mockDisplays)
  } catch {
    return NextResponse.json({ error: "Failed to fetch displays" }, { status: 500 })
  }
}
