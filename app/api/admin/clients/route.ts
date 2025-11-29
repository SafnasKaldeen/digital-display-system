import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // TODO: Fetch from database with role check
    const mockClients = [
      {
        id: "1",
        email: "admin@masjid.com",
        businessName: "Al-Noor Masjid",
        businessType: "masjid",
        status: "active",
        createdAt: "2025-01-15",
        displayCount: 3,
      },
    ]
    return NextResponse.json(mockClients)
  } catch {
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 })
  }
}
