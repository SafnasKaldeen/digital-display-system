import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // TODO: Fetch display config from database
    const mockConfig = {
      templateType: "masjid",
      prayerTimes: {
        fajr: "05:30",
        dhuhr: "12:30",
        asr: "15:45",
        maghrib: "18:00",
        isha: "19:30",
      },
    }

    return NextResponse.json(mockConfig)
  } catch {
    return NextResponse.json({ error: "Failed to fetch display" }, { status: 500 })
  }
}
