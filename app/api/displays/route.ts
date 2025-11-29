import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

export async function GET(request: NextRequest) {
  try {
    // TODO: Get displays for authenticated user from database
    const mockDisplays = [
      {
        id: "1",
        displayName: "Main Hall",
        templateType: "masjid",
        uniqueUrlSlug: "main-hall-123",
        status: "active",
        displayUrl: "https://display.example.com/main-hall-123",
        createdAt: new Date(),
      },
    ]
    return NextResponse.json(mockDisplays)
  } catch {
    return NextResponse.json({ error: "Failed to fetch displays" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { displayName, templateType } = await request.json()

    if (!displayName || !templateType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate unique slug
    const slug = `${displayName.toLowerCase().replace(/\s+/g, "-")}-${uuidv4().slice(0, 8)}`

    // TODO: Save to database
    const newDisplay = {
      id: uuidv4(),
      displayName,
      templateType,
      uniqueUrlSlug: slug,
      status: "active",
      displayUrl: `https://display.example.com/${slug}`,
      createdAt: new Date(),
    }

    return NextResponse.json(newDisplay, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create display" }, { status: 500 })
  }
}
